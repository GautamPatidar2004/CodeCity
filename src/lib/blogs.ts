import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { recordUserActivity } from './achievements'
import { ensureProfileExists } from './community'

export interface BlogComment {
  id: string
  blog_id: string
  user_id: string
  content: string
  created_at: string
  author_name?: string
  author_avatar?: string
}

export interface Blog {
  id: string
  author_id?: string
  title: string
  slug: string
  summary?: string
  content: string
  cover_image_url?: string
  video_url?: string
  tags?: string[]
  is_published: boolean
  likes_count: number
  comments_count?: number
  is_liked_by_user?: boolean
  is_following_author?: boolean
  created_at: string
  updated_at?: string
  author?: {
    full_name?: string
    username?: string
    role?: string
  }
}

export async function fetchBlogs(includeUnpublished = false, currentUserId?: string): Promise<Blog[]> {
  try {
    let query = supabase
      .from('blogs')
      .select(`
        *,
        author:profiles!author_id (
          full_name,
          username,
          role
        )
      `)
      .order('created_at', { ascending: false })

    if (!includeUnpublished) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query

    if (error || !data) {
      return []
    }

    // Fetch real like counts & user like states
    const blogIds = data.map((b) => b.id)
    
    let likesMap: Record<string, number> = {}
    let userLikedSet = new Set<string>()
    let commentsMap: Record<string, number> = {}
    let followingSet = new Set<string>()

    if (blogIds.length > 0) {
      const [likesRes, userLikesRes, commentsRes, followsRes] = await Promise.all([
        supabase.from('blog_likes').select('blog_id'),
        currentUserId
          ? supabase.from('blog_likes').select('blog_id').eq('user_id', currentUserId)
          : Promise.resolve({ data: [] }),
        supabase.from('blog_comments').select('blog_id'),
        currentUserId
          ? supabase.from('user_follows').select('following_id').eq('follower_id', currentUserId)
          : Promise.resolve({ data: [] }),
      ])

      if (likesRes.data) {
        likesRes.data.forEach((row: { blog_id: string }) => {
          likesMap[row.blog_id] = (likesMap[row.blog_id] || 0) + 1
        })
      }

      if (userLikesRes.data) {
        userLikesRes.data.forEach((row: { blog_id: string }) => {
          userLikedSet.add(row.blog_id)
        })
      }

      if (commentsRes.data) {
        commentsRes.data.forEach((row: { blog_id: string }) => {
          commentsMap[row.blog_id] = (commentsMap[row.blog_id] || 0) + 1
        })
      }

      if (followsRes.data) {
        followsRes.data.forEach((row: { following_id: string }) => {
          followingSet.add(row.following_id)
        })
      }
    }

    return data.map((b) => ({
      ...b,
      tags: b.tags || [],
      likes_count: likesMap[b.id] ?? b.likes_count ?? 0,
      comments_count: commentsMap[b.id] ?? 0,
      is_liked_by_user: userLikedSet.has(b.id),
      is_following_author: b.author_id ? followingSet.has(b.author_id) : false,
    }))
  } catch (err) {
    console.error('Error fetching blogs:', err)
    return []
  }
}

export async function fetchBlogBySlug(slug: string, currentUserId?: string): Promise<Blog | null> {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:profiles!author_id (
          full_name,
          username,
          role
        )
      `)
      .eq('slug', slug)
      .maybeSingle()

    if (error || !data) return null

    let isLiked = false
    if (currentUserId) {
      const { data: likeData } = await supabase
        .from('blog_likes')
        .select('blog_id')
        .eq('user_id', currentUserId)
        .eq('blog_id', data.id)
        .maybeSingle()
      isLiked = !!likeData
    }

    const { count: likeCount } = await supabase
      .from('blog_likes')
      .select('*', { count: 'exact', head: true })
      .eq('blog_id', data.id)

    const { count: commentCount } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true })
      .eq('blog_id', data.id)

    return {
      ...data,
      tags: data.tags || [],
      likes_count: likeCount ?? data.likes_count ?? 0,
      comments_count: commentCount ?? 0,
      is_liked_by_user: isLiked,
    }
  } catch {
    return null
  }
}

export async function toggleBlogLike(userId: string, blogId: string): Promise<{ liked: boolean; newCount: number }> {
  try {
    await ensureProfileExists(userId)

    const { data: existingLike } = await supabase
      .from('blog_likes')
      .select('blog_id')
      .eq('user_id', userId)
      .eq('blog_id', blogId)
      .maybeSingle()

    if (existingLike) {
      await supabase
        .from('blog_likes')
        .delete()
        .eq('user_id', userId)
        .eq('blog_id', blogId)
    } else {
      await supabase
        .from('blog_likes')
        .insert({ user_id: userId, blog_id: blogId })
    }

    const { count } = await supabase
      .from('blog_likes')
      .select('*', { count: 'exact', head: true })
      .eq('blog_id', blogId)

    const newCount = count ?? 0

    // Update blog likes_count column for synchronization
    await supabase.from('blogs').update({ likes_count: newCount }).eq('id', blogId)

    if (!existingLike) {
      await recordUserActivity(userId, 'blog_liked', `Liked a community blog article 📖`)
    }

    return {
      liked: !existingLike,
      newCount,
    }
  } catch (err) {
    console.error('Error toggling blog like:', err)
    return { liked: false, newCount: 0 }
  }
}

export async function fetchBlogComments(blogId: string): Promise<BlogComment[]> {
  try {
    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        id,
        blog_id,
        user_id,
        content,
        created_at,
        profiles (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('blog_id', blogId)
      .order('created_at', { ascending: true })

    if (error || !data) return []

    return data.map((item: any) => ({
      id: item.id,
      blog_id: item.blog_id,
      user_id: item.user_id,
      content: item.content,
      created_at: item.created_at,
      author_name: item.profiles?.full_name || item.profiles?.username || 'Adventurer',
      author_avatar: item.profiles?.avatar_url,
    }))
  } catch (err) {
    console.error('Error fetching blog comments:', err)
    return []
  }
}

export async function addBlogComment(
  userId: string,
  blogId: string,
  content: string,
  currentUsername = 'Adventurer'
): Promise<BlogComment | null> {
  try {
    await ensureProfileExists(userId, currentUsername)

    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        user_id: userId,
        blog_id: blogId,
        content,
      })
      .select()
      .single()

    if (error || !data) return null

    await recordUserActivity(userId, 'blog_commented', `Commented on a blog article 💬`)

    return {
      id: data.id,
      blog_id: data.blog_id,
      user_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
      author_name: currentUsername,
    }
  } catch (err) {
    console.error('Error adding blog comment:', err)
    return null
  }
}

export async function deleteBlogComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('blog_comments').delete().eq('id', commentId)
    return !error
  } catch {
    return false
  }
}

export async function createBlog(blog: {
  author_id?: string
  title: string
  slug: string
  summary?: string
  content: string
  cover_image_url?: string
  video_url?: string
  tags?: string[]
  is_published?: boolean
}): Promise<Blog | null> {
  try {
    if (blog.author_id) {
      await ensureProfileExists(blog.author_id)
    }

    const { data, error } = await supabase
      .from('blogs')
      .insert({
        ...blog,
        is_published: blog.is_published ?? true,
      })
      .select(`
        *,
        author:profiles!author_id (
          full_name,
          username,
          role
        )
      `)
      .single()

    if (error || !data) {
      console.error('Error creating blog:', error)
      return null
    }

    if (blog.author_id) {
      await recordUserActivity(blog.author_id, 'blog_published', `Published article "${blog.title}" ✍️`)
    }

    return data
  } catch (err) {
    console.error('Error creating blog:', err)
    return null
  }
}

export const createAdminBlog = createBlog

export async function updateBlog(
  id: string,
  updates: Partial<Omit<Blog, 'id' | 'created_at' | 'author'>>
): Promise<Blog | null> {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        author:profiles!author_id (
          full_name,
          username,
          role
        )
      `)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export const updateAdminBlog = updateBlog

export async function deleteBlog(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}

export const deleteAdminBlog = deleteBlog

export function useBlogs(includeUnpublished = false, currentUserId?: string) {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  const loadBlogs = useCallback(async () => {
    setLoading(true)
    const data = await fetchBlogs(includeUnpublished, currentUserId)
    setBlogs(data)
    setLoading(false)
  }, [includeUnpublished, currentUserId])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      loadBlogs()
    }
    return () => {
      mounted = false
    }
  }, [loadBlogs])

  const handleToggleLike = async (blogId: string) => {
    if (!currentUserId) return
    
    // Optimistic update
    setBlogs((prev) =>
      prev.map((b) => {
        if (b.id === blogId) {
          const nextLiked = !b.is_liked_by_user
          return {
            ...b,
            is_liked_by_user: nextLiked,
            likes_count: nextLiked ? b.likes_count + 1 : Math.max(0, b.likes_count - 1),
          }
        }
        return b
      })
    )

    const result = await toggleBlogLike(currentUserId, blogId)
    setBlogs((prev) =>
      prev.map((b) => {
        if (b.id === blogId) {
          return {
            ...b,
            is_liked_by_user: result.liked,
            likes_count: result.newCount,
          }
        }
        return b
      })
    )
  }

  return {
    blogs,
    loading,
    refreshBlogs: loadBlogs,
    toggleBlogLike: handleToggleLike,
  }
}
