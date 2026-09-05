import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { recordUserActivity, createUserNotification } from './achievements'

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at?: string
  author_name?: string
  author_role?: string
}

export interface CommunityPost {
  id: string
  user_id: string
  content: string
  post_type: 'text' | 'project_showcase'
  project_build_id?: string | null
  status: 'published' | 'hidden' | 'draft'
  created_at?: string
  updated_at?: string
  image_url?: string | null
  video_url?: string | null
  author_name?: string
  author_role?: string
  likes_count: number
  comments_count: number
  is_liked_by_user: boolean
  is_following_author: boolean
  project_showcase?: {
    id: string
    title: string
    description: string
    live_url?: string
    preview_url?: string
    project_title?: string
    project_category?: string
  }
}

export interface ContentReport {
  id: string
  reporter_id: string
  post_id?: string
  comment_id?: string
  reason: string
  status: 'pending' | 'reviewed' | 'dismissed'
  created_at: string
  updated_at?: string
  reporter_name?: string
  target_content?: string
}

export async function fetchCommunityFeed(
  userId?: string,
  postTypeFilter?: string,
  includeHidden = false
): Promise<CommunityPost[]> {
  try {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        profile:profiles!user_id (
          full_name,
          username,
          role
        ),
        project_showcase:project_showcases (
          id,
          title,
          description,
          live_url,
          preview_url,
          project:projects (
            id,
            title,
            category
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (!includeHidden) {
      query = query.eq('status', 'published')
    }

    if (postTypeFilter && postTypeFilter !== 'All') {
      query = query.eq('post_type', postTypeFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching community feed:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Fetch likes, comments, and following info in parallel
    const [likesRes, commentsRes, userLikesRes, userFollowsRes] = await Promise.all([
      supabase.from('post_likes').select('post_id'),
      supabase.from('post_comments').select('post_id'),
      userId ? supabase.from('post_likes').select('post_id').eq('user_id', userId) : Promise.resolve({ data: [] }),
      userId ? supabase.from('user_follows').select('following_id').eq('follower_id', userId) : Promise.resolve({ data: [] }),
    ])

    const likesCountMap = new Map<string, number>()
    if (likesRes.data) {
      likesRes.data.forEach((l) => {
        likesCountMap.set(l.post_id, (likesCountMap.get(l.post_id) || 0) + 1)
      })
    }

    const commentsCountMap = new Map<string, number>()
    if (commentsRes.data) {
      commentsRes.data.forEach((c) => {
        commentsCountMap.set(c.post_id, (commentsCountMap.get(c.post_id) || 0) + 1)
      })
    }

    const userLikedSet = new Set((userLikesRes.data || []).map((l) => l.post_id))
    const userFollowingSet = new Set((userFollowsRes.data || []).map((f) => f.following_id))

    return data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      content: item.content,
      post_type: item.post_type,
      project_build_id: item.project_build_id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      image_url: item.image_url,
      video_url: item.video_url,
      author_name: item.profile?.full_name || item.profile?.username || 'Adventurer',
      author_role: item.profile?.role || 'student',
      likes_count: likesCountMap.get(item.id) || 0,
      comments_count: commentsCountMap.get(item.id) || 0,
      is_liked_by_user: userLikedSet.has(item.id),
      is_following_author: userFollowingSet.has(item.user_id),
      project_showcase: item.project_showcase
        ? {
            id: item.project_showcase.id,
            title: item.project_showcase.title,
            description: item.project_showcase.description,
            live_url: item.project_showcase.live_url,
            preview_url: item.project_showcase.preview_url,
            project_title: item.project_showcase.project?.title || 'Coding Project',
            project_category: item.project_showcase.project?.category || 'Web',
          }
        : undefined,
    }))
  } catch (err) {
    console.error('Error fetching community feed exception:', err)
    return []
  }
}

export async function togglePostLike(userId: string, postId: string): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)
      return !error ? false : true
    } else {
      const { error } = await supabase
        .from('post_likes')
        .insert({ user_id: userId, post_id: postId })
      return !error ? true : false
    }
  } catch {
    return false
  }
}

export async function fetchPostComments(postId: string): Promise<PostComment[]> {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profile:profiles!user_id (
          full_name,
          username,
          role
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error || !data) return []

    return data.map((c) => ({
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      content: c.content,
      created_at: c.created_at,
      updated_at: c.updated_at,
      author_name: c.profile?.full_name || c.profile?.username || 'Adventurer',
      author_role: c.profile?.role || 'student',
    }))
  } catch {
    return []
  }
}

export async function addPostComment(userId: string, postId: string, content: string): Promise<PostComment | null> {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        user_id: userId,
        post_id: postId,
        content,
      })
      .select(`
        *,
        profile:profiles!user_id (
          full_name,
          username,
          role
        )
      `)
      .single()

    if (error || !data) return null

    await recordUserActivity(userId, 'comment_added', `Commented on a community post 💬`)

    return {
      id: data.id,
      post_id: data.post_id,
      user_id: data.user_id,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      author_name: data.profile?.full_name || data.profile?.username || 'Adventurer',
      author_role: data.profile?.role || 'student',
    }
  } catch {
    return null
  }
}

export async function deletePostComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('post_comments').delete().eq('id', commentId)
    return !error
  } catch {
    return false
  }
}

export async function toggleUserFollow(
  followerId: string,
  followingId: string,
  followerName?: string
): Promise<boolean> {
  if (followerId === followingId) return false
  try {
    const { data: existing } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
      return !error ? false : true
    } else {
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: followerId, following_id: followingId })

      if (!error) {
        const name = followerName || 'An adventurer'
        await recordUserActivity(followerId, 'user_followed', `Followed a fellow adventurer 🤝`)
        await createUserNotification(
          followingId,
          'New Follower! 🤝',
          `${name} is now following your quest journey!`,
          '🤝'
        )
      }

      return !error ? true : false
    }
  } catch {
    return false
  }
}

export async function fetchUserFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  try {
    const [followersRes, followingRes] = await Promise.all([
      supabase.from('user_follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('user_follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId),
    ])

    return {
      followers: followersRes.count || 0,
      following: followingRes.count || 0,
    }
  } catch {
    return { followers: 0, following: 0 }
  }
}

export async function createCommunityPost(
  userId: string,
  content: string,
  postType: 'text' | 'project_showcase' = 'text',
  projectBuildId?: string
): Promise<CommunityPost | null> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: userId,
        content,
        post_type: postType,
        project_build_id: projectBuildId || null,
        status: 'published',
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating post:', error)
      return null
    }

    await recordUserActivity(userId, 'community_post', `Shared a ${postType === 'project_showcase' ? 'project build' : 'post'} in Community ✨`)
    return {
      ...data,
      likes_count: 0,
      comments_count: 0,
      is_liked_by_user: false,
      is_following_author: false,
    }
  } catch (err) {
    console.error('Error creating post:', err)
    return null
  }
}

export async function updateCommunityPost(
  postId: string,
  updates: Partial<Pick<CommunityPost, 'content' | 'status'>>
): Promise<CommunityPost | null> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      console.error('Error updating post:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Error updating post:', err)
    return null
  }
}

export async function deleteCommunityPost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('community_posts').delete().eq('id', postId)
    return !error
  } catch {
    return false
  }
}

export async function setPostModerationStatus(
  adminUserId: string,
  postId: string,
  status: 'published' | 'hidden'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('community_posts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', postId)

    if (!error) {
      await recordUserActivity(
        adminUserId,
        'post_moderated',
        `Admin moderated post status to "${status}"`
      )
    }

    return !error
  } catch {
    return false
  }
}

export async function reportContent(
  reporterId: string,
  reason: string,
  postId?: string,
  commentId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('content_reports').insert({
      reporter_id: reporterId,
      reason,
      post_id: postId || null,
      comment_id: commentId || null,
      status: 'pending',
    })

    return !error
  } catch {
    return false
  }
}

export async function fetchAdminReports(): Promise<ContentReport[]> {
  try {
    const { data, error } = await supabase
      .from('content_reports')
      .select(`
        *,
        reporter:profiles!reporter_id(full_name, username),
        post:community_posts(content),
        comment:post_comments(content)
      `)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((r: any) => ({
      id: r.id,
      reporter_id: r.reporter_id,
      post_id: r.post_id,
      comment_id: r.comment_id,
      reason: r.reason,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      reporter_name: r.reporter?.full_name || r.reporter?.username || 'Learner',
      target_content: r.post?.content || r.comment?.content || 'Content',
    }))
  } catch {
    return []
  }
}

export async function resolveReport(reportId: string, status: 'reviewed' | 'dismissed'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('content_reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId)

    return !error
  } catch {
    return false
  }
}

export function useCommunityFeed(
  userId?: string,
  postTypeFilter?: string,
  includeHidden = false,
  userName?: string
) {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)

  const loadFeed = useCallback(async () => {
    setLoading(true)
    const result = await fetchCommunityFeed(userId, postTypeFilter, includeHidden)
    setPosts(result)
    setLoading(false)
  }, [userId, postTypeFilter, includeHidden])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      loadFeed()
    }
    return () => {
      mounted = false
    }
  }, [loadFeed])

  const addPost = useCallback(
    async (content: string, postType: 'text' | 'project_showcase' = 'text', projectBuildId?: string) => {
      if (!userId) return null
      const res = await createCommunityPost(userId, content, postType, projectBuildId)
      await loadFeed()
      return res
    },
    [userId, loadFeed]
  )

  const editPost = useCallback(
    async (postId: string, updates: Partial<Pick<CommunityPost, 'content' | 'status'>>) => {
      const res = await updateCommunityPost(postId, updates)
      await loadFeed()
      return res
    },
    [loadFeed]
  )

  const removePost = useCallback(
    async (postId: string) => {
      const ok = await deleteCommunityPost(postId)
      await loadFeed()
      return ok
    },
    [loadFeed]
  )

  const moderatePost = useCallback(
    async (postId: string, status: 'published' | 'hidden') => {
      if (!userId) return false
      const ok = await setPostModerationStatus(userId, postId, status)
      await loadFeed()
      return ok
    },
    [userId, loadFeed]
  )

  const handleLike = useCallback(
    async (postId: string) => {
      if (!userId) return
      await togglePostLike(userId, postId)
      await loadFeed()
    },
    [userId, loadFeed]
  )

  const handleFollow = useCallback(
    async (targetUserId: string) => {
      if (!userId || userId === targetUserId) return
      await toggleUserFollow(userId, targetUserId, userName)
      await loadFeed()
    },
    [userId, userName, loadFeed]
  )

  return {
    posts,
    loading,
    addPost,
    editPost,
    removePost,
    moderatePost,
    toggleLike: handleLike,
    toggleFollow: handleFollow,
    refreshFeed: loadFeed,
  }
}

export async function ensureProfileExists(userId: string, defaultName?: string): Promise<void> {
  try {
    const { data } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
    if (!data) {
      const name = defaultName || 'Adventurer'
      await supabase.from('profiles').upsert(
        {
          id: userId,
          username: name.toLowerCase().replace(/\s+/g, '_'),
          full_name: name,
          role: 'student',
          xp: 50,
          level: 1,
          streak: 1,
        },
        { onConflict: 'id' }
      )
    }
  } catch (err) {
    console.error('Error ensuring profile exists:', err)
  }
}

