import React, { useState, useMemo } from 'react'
import { GamifiedCard } from '../components/ui/GamifiedCard'
import { GamifiedButton } from '../components/ui/GamifiedButton'
import { useAuth } from '../context/AuthContext'
import {
  useCommunityFeed,
  fetchPostComments,
  addPostComment,
  deletePostComment,
  reportContent,
  type CommunityPost,
  type PostComment,
} from '../lib/community'
import {
  useProjectShowcases,
  submitProjectShowcase,
  deleteProjectShowcase,
  type ProjectShowcase,
} from '../lib/projects'
import {
  useBlogs,
  fetchBlogComments,
  addBlogComment,
  deleteBlogComment,
  createBlog,
  updateBlog,
  deleteBlog,
  type Blog,
  type BlogComment,
} from '../lib/blogs'
import {
  MessageSquare,
  Heart,
  UserPlus,
  UserCheck,
  Send,
  Flag,
  Trash2,
  ExternalLink,
  Sparkles,
  Search,
  X,
  CheckCircle2,
  Layers,
  Code2,
  BookOpen,
  Tag,
  ArrowRight,
  PlusCircle,
  Edit3,
  Globe,
  Award,
} from 'lucide-react'

/**
 * Safe media component to render image URLs and video URLs.
 * Strictly adhering to URL-only rule (no file/storage uploads).
 */
const SafeMediaDisplay: React.FC<{
  imageUrl?: string | null
  videoUrl?: string | null
  altText?: string
}> = ({ imageUrl, videoUrl, altText = 'Media content' }) => {
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URL(url).searchParams.get('v')
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null
      }
      if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/')
        return parts[1] ? `https://www.youtube.com/embed/${parts[1].split('?')[0]}` : null
      }
      return null
    } catch {
      return null
    }
  }

  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null

  return (
    <div className="flex flex-col gap-2 my-2">
      {imageUrl && (
        <div className="rounded-xl overflow-hidden max-h-72 border border-slate-200 bg-slate-50">
          <img src={imageUrl} alt={altText} className="w-full h-full object-cover" />
        </div>
      )}
      {embedUrl ? (
        <div className="rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-900">
          <iframe
            src={embedUrl}
            title={altText}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : videoUrl ? (
        <div className="rounded-xl overflow-hidden max-h-72 border border-slate-200 bg-slate-900">
          <video src={videoUrl} controls className="w-full h-full object-contain" />
        </div>
      ) : null}
    </div>
  )
}

type FeedItem =
  | { type: 'post'; id: string; created_at: string; data: CommunityPost }
  | { type: 'showcase'; id: string; created_at: string; data: ProjectShowcase }
  | { type: 'blog'; id: string; created_at: string; data: Blog }

export const CommunityPage: React.FC = () => {
  const { user, profile, isAdmin } = useAuth()
  const [filter, setFilter] = useState<'All' | 'posts' | 'showcases' | 'blogs'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  // Comments Modal State (Posts)
  const [activeCommentPost, setActiveCommentPost] = useState<CommunityPost | null>(null)
  const [postComments, setPostComments] = useState<PostComment[]>([])
  const [newCommentText, setNewCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  // Report Modal State
  const [reportingPostId, setReportingPostId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)

  // Blogs Hook & Modal States
  const {
    blogs,
    loading: blogsLoading,
    refreshBlogs,
    toggleBlogLike,
  } = useBlogs(false, user?.id)

  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [activeCommentBlog, setActiveCommentBlog] = useState<Blog | null>(null)
  const [blogComments, setBlogComments] = useState<BlogComment[]>([])
  const [newBlogCommentText, setNewBlogCommentText] = useState('')
  const [loadingBlogComments, setLoadingBlogComments] = useState(false)

  // Add / Edit Blog Modal States
  const [showAddBlogModal, setShowAddBlogModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [blogTitle, setBlogTitle] = useState('')
  const [blogSlug, setBlogSlug] = useState('')
  const [blogSummary, setBlogSummary] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [blogCoverUrl, setBlogCoverUrl] = useState('')
  const [blogVideoUrl, setBlogVideoUrl] = useState('')
  const [blogTagsInput, setBlogTagsInput] = useState('')
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false)

  // Showcases Hook & Modal States
  const {
    showcases,
    loading: showcasesLoading,
    refreshShowcases,
  } = useProjectShowcases()

  const [showAddShowcaseModal, setShowAddShowcaseModal] = useState(false)
  const [showcaseTitle, setShowcaseTitle] = useState('')
  const [showcaseDescription, setShowcaseDescription] = useState('')
  const [showcaseLiveUrl, setShowcaseLiveUrl] = useState('')
  const [showcasePreviewUrl, setShowcasePreviewUrl] = useState('')
  const [showcaseImageUrl, setShowcaseImageUrl] = useState('')
  const [showcaseLanguage, setShowcaseLanguage] = useState('JavaScript')
  const [showcaseCategory, setShowcaseCategory] = useState('Web Development')
  const [showcaseDifficulty, setShowcaseDifficulty] = useState('Beginner')
  const [isSubmittingShowcase, setIsSubmittingShowcase] = useState(false)

  const currentUsername = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Adventurer'

  // Posts Feed Hook
  const {
    posts,
    loading: postsLoading,
    addPost,
    removePost,
    toggleLike,
    toggleFollow,
  } = useCommunityFeed(user?.id, 'All', isAdmin, currentUsername)

  // Handle New Post Creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim() || isPosting) return

    setIsPosting(true)
    await addPost(newPostContent, 'text')
    setNewPostContent('')
    setIsPosting(false)
  }

  // Handle Post Comments Opening
  const handleOpenComments = async (post: CommunityPost) => {
    setActiveCommentPost(post)
    setLoadingComments(true)
    const comments = await fetchPostComments(post.id)
    setPostComments(comments)
    setLoadingComments(false)
  }

  // Handle Add Post Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCommentPost || !user || !newCommentText.trim()) return

    const newComment = await addPostComment(
      user.id,
      activeCommentPost.id,
      newCommentText.trim()
    )

    if (newComment) {
      setPostComments((prev) => [...prev, newComment])
      setNewCommentText('')
    }
  }

  // Handle Delete Post Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return
    const success = await deletePostComment(commentId)
    if (success) {
      setPostComments((prev) => prev.filter((c) => c.id !== commentId))
    }
  }

  // Handle Blog Comments Opening
  const handleOpenBlogComments = async (blog: Blog) => {
    setActiveCommentBlog(blog)
    setLoadingBlogComments(true)
    const comments = await fetchBlogComments(blog.id)
    setBlogComments(comments)
    setLoadingBlogComments(false)
  }

  // Handle Add Blog Comment
  const handleAddBlogComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCommentBlog || !user || !newBlogCommentText.trim()) return

    const newComment = await addBlogComment(
      user.id,
      activeCommentBlog.id,
      newBlogCommentText.trim(),
      currentUsername
    )

    if (newComment) {
      setBlogComments((prev) => [...prev, newComment])
      setNewBlogCommentText('')
      await refreshBlogs()
    }
  }

  // Handle Delete Blog Comment
  const handleDeleteBlogComment = async (commentId: string) => {
    if (!user) return
    const success = await deleteBlogComment(commentId)
    if (success) {
      setBlogComments((prev) => prev.filter((c) => c.id !== commentId))
      await refreshBlogs()
    }
  }

  // Handle Create Blog Submit
  const handleCreateBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blogTitle.trim() || !blogContent.trim() || isSubmittingBlog) return

    setIsSubmittingBlog(true)
    const slug = blogSlug.trim() || blogTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const tags = blogTagsInput.split(',').map((t) => t.trim()).filter(Boolean)

    const created = await createBlog({
      author_id: user?.id,
      title: blogTitle.trim(),
      slug,
      summary: blogSummary.trim() || undefined,
      content: blogContent.trim(),
      cover_image_url: blogCoverUrl.trim() || undefined,
      video_url: blogVideoUrl.trim() || undefined,
      tags,
      is_published: true,
    })

    setIsSubmittingBlog(false)
    if (created) {
      setShowAddBlogModal(false)
      setBlogTitle('')
      setBlogSlug('')
      setBlogSummary('')
      setBlogContent('')
      setBlogCoverUrl('')
      setBlogVideoUrl('')
      setBlogTagsInput('')
      await refreshBlogs()
    }
  }

  // Handle Open Edit Blog
  const handleOpenEditBlog = (blog: Blog) => {
    setEditingBlog(blog)
    setBlogTitle(blog.title)
    setBlogSlug(blog.slug)
    setBlogSummary(blog.summary || '')
    setBlogContent(blog.content)
    setBlogCoverUrl(blog.cover_image_url || '')
    setBlogVideoUrl(blog.video_url || '')
    setBlogTagsInput((blog.tags || []).join(', '))
  }

  // Handle Save Edit Blog
  const handleSaveEditBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBlog || !blogTitle.trim() || !blogContent.trim() || isSubmittingBlog) return

    setIsSubmittingBlog(true)
    const tags = blogTagsInput.split(',').map((t) => t.trim()).filter(Boolean)

    const updated = await updateBlog(editingBlog.id, {
      title: blogTitle.trim(),
      slug: blogSlug.trim() || editingBlog.slug,
      summary: blogSummary.trim() || undefined,
      content: blogContent.trim(),
      cover_image_url: blogCoverUrl.trim() || undefined,
      video_url: blogVideoUrl.trim() || undefined,
      tags,
    })

    setIsSubmittingBlog(false)
    if (updated) {
      setEditingBlog(null)
      await refreshBlogs()
      if (selectedBlog?.id === editingBlog.id) {
        setSelectedBlog(updated)
      }
    }
  }

  // Handle Delete Blog
  const handleDeleteBlogSubmit = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog article?')) return
    const success = await deleteBlog(blogId)
    if (success) {
      if (selectedBlog?.id === blogId) {
        setSelectedBlog(null)
      }
      await refreshBlogs()
    }
  }

  // Handle Submit Showcase
  const handleCreateShowcaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !showcaseTitle.trim() || !showcaseDescription.trim() || isSubmittingShowcase) return

    setIsSubmittingShowcase(true)
    const res = await submitProjectShowcase(
      user.id,
      null,
      showcaseTitle.trim(),
      showcaseDescription.trim(),
      showcasePreviewUrl.trim() || undefined,
      showcaseLiveUrl.trim() || undefined,
      showcaseImageUrl.trim() || undefined,
      undefined,
      showcaseLanguage,
      showcaseCategory,
      showcaseDifficulty
    )

    setIsSubmittingShowcase(false)
    if (res) {
      setShowAddShowcaseModal(false)
      setShowcaseTitle('')
      setShowcaseDescription('')
      setShowcaseLiveUrl('')
      setShowcasePreviewUrl('')
      setShowcaseImageUrl('')
      await refreshShowcases()
    }
  }

  // Handle Delete Showcase
  const handleDeleteShowcaseSubmit = async (showcaseId: string) => {
    if (!window.confirm('Are you sure you want to delete this project showcase?')) return
    const success = await deleteProjectShowcase(showcaseId)
    if (success) {
      await refreshShowcases()
    }
  }

  // Handle Submit Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !reportingPostId || !reportReason.trim()) return

    const res = await reportContent(user.id, reportReason.trim(), reportingPostId)
    if (res) {
      setReportSuccess(true)
      setTimeout(() => {
        setReportingPostId(null)
        setReportReason('')
        setReportSuccess(false)
      }, 1500)
    }
  }

  // =========================================================================
  // MERGED "ALL" FEED (Posts + Showcases + Blogs in chronological order)
  // =========================================================================
  const allFeedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = []

    posts.forEach((p) => {
      items.push({
        type: 'post',
        id: `post-${p.id}`,
        created_at: p.created_at || '',
        data: p,
      })
    })

    showcases.forEach((sc) => {
      items.push({
        type: 'showcase',
        id: `showcase-${sc.id}`,
        created_at: sc.created_at || '',
        data: sc,
      })
    })

    blogs.forEach((b) => {
      items.push({
        type: 'blog',
        id: `blog-${b.id}`,
        created_at: b.created_at || '',
        data: b,
      })
    })

    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [posts, showcases, blogs])

  // Filtered "All" Items
  const filteredAllItems = useMemo(() => {
    if (!searchQuery.trim()) return allFeedItems
    const q = searchQuery.toLowerCase()
    return allFeedItems.filter((item) => {
      if (item.type === 'post') {
        const p = item.data
        return (
          p.content.toLowerCase().includes(q) ||
          (p.author_name && p.author_name.toLowerCase().includes(q))
        )
      }
      if (item.type === 'showcase') {
        const sc = item.data
        return (
          sc.title.toLowerCase().includes(q) ||
          sc.description.toLowerCase().includes(q) ||
          (sc.author_name && sc.author_name.toLowerCase().includes(q)) ||
          (sc.language && sc.language.toLowerCase().includes(q)) ||
          (sc.category && sc.category.toLowerCase().includes(q))
        )
      }
      if (item.type === 'blog') {
        const b = item.data
        return (
          b.title.toLowerCase().includes(q) ||
          (b.summary && b.summary.toLowerCase().includes(q)) ||
          (b.author?.full_name && b.author.full_name.toLowerCase().includes(q)) ||
          (b.author?.username && b.author.username.toLowerCase().includes(q)) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
        )
      }
      return true
    })
  }, [allFeedItems, searchQuery])

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts
    const q = searchQuery.toLowerCase()
    return posts.filter((p) => {
      return (
        p.content.toLowerCase().includes(q) ||
        (p.author_name && p.author_name.toLowerCase().includes(q))
      )
    })
  }, [posts, searchQuery])

  // Filtered Showcases
  const filteredShowcases = useMemo(() => {
    if (!searchQuery.trim()) return showcases
    const q = searchQuery.toLowerCase()
    return showcases.filter((sc) => {
      return (
        sc.title.toLowerCase().includes(q) ||
        sc.description.toLowerCase().includes(q) ||
        (sc.author_name && sc.author_name.toLowerCase().includes(q)) ||
        (sc.language && sc.language.toLowerCase().includes(q)) ||
        (sc.category && sc.category.toLowerCase().includes(q))
      )
    })
  }, [showcases, searchQuery])

  // Filtered Blogs
  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs
    const q = searchQuery.toLowerCase()
    return blogs.filter((b) => {
      return (
        b.title.toLowerCase().includes(q) ||
        (b.summary && b.summary.toLowerCase().includes(q)) ||
        (b.author?.full_name && b.author.full_name.toLowerCase().includes(q)) ||
        (b.author?.username && b.author.username.toLowerCase().includes(q)) ||
        (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
      )
    })
  }, [blogs, searchQuery])

  // =========================================================================
  // CARD RENDERERS
  // =========================================================================

  // Render Post Card
  const renderPostCard = (post: CommunityPost) => {
    const isOwner = user?.id === post.user_id

    return (
      <GamifiedCard
        key={post.id}
        className="p-6 bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col gap-4 shadow-xs"
      >
        {/* Author Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 text-purple-700 font-pixel font-bold flex items-center justify-center text-xs">
              {post.author_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">
                  {post.author_name || 'Adventurer'}
                </span>
                {post.author_role === 'admin' && (
                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-pixel text-[8px] uppercase font-bold">
                    STAFF
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-pixel text-[8px] uppercase font-bold flex items-center gap-1">
                  <MessageSquare className="w-2.5 h-2.5" />
                  <span>POST</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          </div>

          {/* Actions: Follow / Report / Delete */}
          <div className="flex items-center gap-1.5">
            {!isOwner && user && (
              <button
                type="button"
                onClick={() => toggleFollow(post.user_id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-pixel uppercase font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  post.is_following_author
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {post.is_following_author ? (
                  <>
                    <UserCheck className="w-3 h-3" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}

            {!isOwner && user && (
              <button
                type="button"
                onClick={() => setReportingPostId(post.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                title="Report this post"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}

            {(isOwner || isAdmin) && (
              <button
                type="button"
                onClick={() => removePost(post.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                title="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Post Content */}
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Media Display if present */}
        {(post.image_url || post.video_url) && (
          <SafeMediaDisplay
            imageUrl={post.image_url}
            videoUrl={post.video_url}
            altText={post.content.slice(0, 30)}
          />
        )}

        {/* Interaction Footer Bar (Like & Comments) */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => toggleLike(post.id)}
            className={`flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
              post.is_liked_by_user
                ? 'text-rose-600'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                post.is_liked_by_user ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span>{post.likes_count}</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenComments(post)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold cursor-pointer transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments_count} Comments</span>
          </button>
        </div>
      </GamifiedCard>
    )
  }

  // Render Showcase Card
  const renderShowcaseCard = (sc: ProjectShowcase) => {
    const isOwner = user?.id === sc.user_id
    const authorName = sc.author_name || 'Adventurer'

    return (
      <GamifiedCard
        key={sc.id}
        className="p-6 bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col gap-4 shadow-xs group"
      >
        {/* Author Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 font-pixel font-bold flex items-center justify-center text-xs">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">
                  {authorName}
                </span>
                {sc.author_role === 'admin' && (
                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-pixel text-[8px] uppercase font-bold">
                    STAFF
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-pixel text-[8px] uppercase font-bold flex items-center gap-1">
                  <Code2 className="w-2.5 h-2.5" />
                  <span>SHOWCASE</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {sc.created_at ? new Date(sc.created_at).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {!isOwner && user && (
              <button
                type="button"
                onClick={() => toggleFollow(sc.user_id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
                title="Follow Builder"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            )}

            {(isOwner || isAdmin) && (
              <button
                type="button"
                onClick={() => handleDeleteShowcaseSubmit(sc.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                title="Delete Showcase"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Showcase Image or Video */}
        {(sc.image_url || sc.video_url) && (
          <SafeMediaDisplay
            imageUrl={sc.image_url}
            videoUrl={sc.video_url}
            altText={sc.title}
          />
        )}

        {/* Title & Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 font-pixel uppercase tracking-tight">
              {sc.title}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {sc.language && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-pixel text-[8px] uppercase font-bold flex items-center gap-1">
                  <Code2 className="w-2.5 h-2.5 text-slate-500" />
                  <span>{sc.language}</span>
                </span>
              )}
              {sc.category && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-pixel text-[8px] uppercase font-bold flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{sc.category}</span>
                </span>
              )}
              {sc.difficulty && (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-pixel text-[8px] uppercase font-bold flex items-center gap-1">
                  <Award className="w-2.5 h-2.5 text-amber-600" />
                  <span>{sc.difficulty}</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {sc.description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs flex-wrap gap-2">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{sc.project_title || 'Community Showcase'}</span>
          </div>

          <div className="flex items-center gap-2">
            {sc.preview_url && (
              <a
                href={sc.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-pixel text-[10px] uppercase font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Code2 className="w-3 h-3" />
                <span>Code Preview</span>
              </a>
            )}

            {sc.live_url && (
              <a
                href={sc.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-pixel text-[10px] uppercase font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>
      </GamifiedCard>
    )
  }

  // Render Blog Card
  const renderBlogCard = (blog: Blog) => {
    const isOwner = user?.id === blog.author_id
    const authorName = blog.author?.full_name || blog.author?.username || 'CodeQuest Team'

    return (
      <GamifiedCard
        key={blog.id}
        className="p-6 bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col gap-4 shadow-xs group cursor-pointer"
        onClick={() => setSelectedBlog(blog)}
      >
        {/* Author Bar */}
        <div
          className="flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 font-pixel font-bold flex items-center justify-center text-xs">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">
                  {authorName}
                </span>
                {blog.author?.role === 'admin' && (
                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-pixel text-[8px] uppercase font-bold">
                    STAFF
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-pixel text-[8px] uppercase font-bold flex items-center gap-1">
                  <BookOpen className="w-2.5 h-2.5" />
                  <span>BLOG</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Recent'}
              </div>
            </div>
          </div>

          {/* Actions: Follow / Edit / Delete / Report */}
          <div className="flex items-center gap-1.5">
            {!isOwner && user && blog.author_id && (
              <button
                type="button"
                onClick={() => toggleFollow(blog.author_id!)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-pixel uppercase font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  blog.is_following_author
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {blog.is_following_author ? (
                  <>
                    <UserCheck className="w-3 h-3" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}

            {isOwner && (
              <button
                type="button"
                onClick={() => handleOpenEditBlog(blog)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer transition-colors"
                title="Edit Blog"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {(isOwner || isAdmin) && (
              <button
                type="button"
                onClick={() => handleDeleteBlogSubmit(blog.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                title="Delete Blog"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {!isOwner && user && (
              <button
                type="button"
                onClick={() => setReportingPostId(blog.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                title="Report Blog"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Blog Cover Image */}
        {blog.cover_image_url && (
          <div className="rounded-2xl overflow-hidden max-h-56 border border-slate-200 bg-slate-50">
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-200"
            />
          </div>
        )}

        {/* Blog Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-pixel text-[8px] uppercase font-bold flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Blog Title & Summary */}
        <div className="flex flex-col gap-1.5">
          <h2 className="font-bold text-base sm:text-lg text-slate-900 font-pixel uppercase leading-snug group-hover:text-blue-600 transition-colors">
            {blog.title}
          </h2>
          {blog.summary && (
            <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3">
              {blog.summary}
            </p>
          )}
        </div>

        {/* Interaction Footer Bar */}
        <div
          className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => toggleBlogLike(blog.id)}
              className={`flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
                blog.is_liked_by_user
                  ? 'text-rose-600'
                  : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  blog.is_liked_by_user ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              <span>{blog.likes_count}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenBlogComments(blog)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold cursor-pointer transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{blog.comments_count ?? 0} Comments</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedBlog(blog)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-pixel text-[10px] uppercase font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Read Article</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </GamifiedCard>
    )
  }

  // Combined Loading State
  const isFeedLoading =
    filter === 'All'
      ? postsLoading || showcasesLoading || blogsLoading
      : filter === 'posts'
      ? postsLoading
      : filter === 'showcases'
      ? showcasesLoading
      : blogsLoading

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 text-left pb-16 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-pixel uppercase tracking-tight">
              Community Realm
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Share creations, celebrate quest breakthroughs, follow builders, and connect with adventurers worldwide.
          </p>
        </div>

        {/* Filter Pills: All | Posts | Showcases | Blogs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 self-start sm:self-auto flex-wrap">
          {(['All', 'posts', 'showcases', 'blogs'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl font-pixel text-[10px] uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f === 'All' && <Sparkles className="w-3 h-3 text-purple-600" />}
              {f === 'posts' && <MessageSquare className="w-3 h-3 text-indigo-600" />}
              {f === 'showcases' && <Layers className="w-3 h-3 text-emerald-600" />}
              {f === 'blogs' && <BookOpen className="w-3 h-3 text-blue-600" />}
              <span>
                {f === 'All'
                  ? 'All'
                  : f === 'posts'
                  ? 'Posts'
                  : f === 'showcases'
                  ? 'Showcases'
                  : 'Blogs'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Action / Banner Box based on active Tab */}
      {filter === 'posts' && (
        <GamifiedCard className="p-5 bg-white border border-slate-200 shadow-xs">
          <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Share a thought or ask a question to fellow coders:</span>
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What code adventure are you embarking on today? Share tips, questions, or ideas..."
              rows={3}
              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-sans text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white transition-all resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-slate-400 font-medium">
                Posting as <strong className="text-slate-700">{currentUsername}</strong>
              </div>
              <GamifiedButton
                type="submit"
                variant="primary"
                disabled={!newPostContent.trim() || isPosting}
                className="!py-2 !px-5 text-xs font-bold font-pixel uppercase flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPosting ? 'Publishing...' : 'Post Update'}</span>
              </GamifiedButton>
            </div>
          </form>
        </GamifiedCard>
      )}

      {filter === 'showcases' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200/80 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-100/90 text-emerald-700 border border-emerald-200 shrink-0">
              <Code2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xs font-bold font-pixel text-emerald-950 uppercase tracking-tight">
                Project Showcases & Creations
              </h3>
              <p className="text-[11px] text-emerald-700/90 font-medium mt-0.5">
                Explore real interactive apps, coding projects, and games built by the community.
              </p>
            </div>
          </div>
          {user && (
            <GamifiedButton
              type="button"
              variant="primary"
              onClick={() => setShowAddShowcaseModal(true)}
              className="!py-2 !px-4 text-xs font-pixel uppercase font-bold shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Share Project</span>
            </GamifiedButton>
          )}
        </div>
      )}

      {filter === 'blogs' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/80 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-blue-100/90 text-blue-700 border border-blue-200 shrink-0">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xs font-bold font-pixel text-blue-950 uppercase tracking-tight">
                Developer Blogs & Engineering Articles
              </h3>
              <p className="text-[11px] text-blue-700/90 font-medium mt-0.5">
                Read deep dives, project architectures, guides, and tutorials published by the realm.
              </p>
            </div>
          </div>
          {user && (
            <GamifiedButton
              type="button"
              variant="primary"
              onClick={() => {
                setEditingBlog(null)
                setBlogTitle('')
                setBlogSlug('')
                setBlogSummary('')
                setBlogContent('')
                setBlogCoverUrl('')
                setBlogVideoUrl('')
                setBlogTagsInput('')
                setShowAddBlogModal(true)
              }}
              className="!py-2 !px-4 text-xs font-pixel uppercase font-bold shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Write Article</span>
            </GamifiedButton>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            filter === 'All'
              ? 'Search across all posts, showcases, and blog articles...'
              : filter === 'posts'
              ? 'Search community posts by content or adventurer...'
              : filter === 'showcases'
              ? 'Search showcases by title, description, language, or category...'
              : 'Search blog articles by title, summary, author, or tags...'
          }
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 shadow-xs font-medium"
        />
      </div>

      {/* ========================================================================= */}
      {/* FEED DISPLAY */}
      {/* ========================================================================= */}
      {isFeedLoading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-40 bg-slate-200/70 rounded-3xl" />
          <div className="h-40 bg-slate-200/70 rounded-3xl" />
          <div className="h-40 bg-slate-200/70 rounded-3xl" />
        </div>
      ) : filter === 'All' ? (
        filteredAllItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-pixel text-sm font-bold text-slate-900 uppercase">
              No Content Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchQuery ? 'Try adjusting your search query.' : 'Be the first adventurer to share a post, project, or article!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredAllItems.map((item) => {
              if (item.type === 'post') {
                return renderPostCard(item.data)
              }
              if (item.type === 'showcase') {
                return renderShowcaseCard(item.data)
              }
              if (item.type === 'blog') {
                return renderBlogCard(item.data)
              }
              return null
            })}
          </div>
        )
      ) : filter === 'posts' ? (
        filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-pixel text-sm font-bold text-slate-900 uppercase">
              No Community Posts Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchQuery
                ? 'Try adjusting your search terms.'
                : 'Be the first adventurer to share an update or discussion!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredPosts.map((post) => renderPostCard(post))}
          </div>
        )
      ) : filter === 'showcases' ? (
        filteredShowcases.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="font-pixel text-sm font-bold text-slate-900 uppercase">
              No Project Showcases Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchQuery
                ? 'Try adjusting your search terms.'
                : 'Publish your interactive project or portfolio app to inspire others!'}
            </p>
            {user && (
              <button
                type="button"
                onClick={() => setShowAddShowcaseModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-pixel uppercase font-bold mt-2 cursor-pointer transition-colors"
              >
                Share First Project
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredShowcases.map((sc) => renderShowcaseCard(sc))}
          </div>
        )
      ) : (
        /* Blogs View */
        filteredBlogs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-pixel text-sm font-bold text-slate-900 uppercase">
              No Blog Articles Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {searchQuery
                ? 'Try adjusting your search terms.'
                : 'Be the first adventurer to share an engineering guide or programming tutorial!'}
            </p>
            {user && (
              <button
                type="button"
                onClick={() => {
                  setEditingBlog(null)
                  setBlogTitle('')
                  setBlogSlug('')
                  setBlogSummary('')
                  setBlogContent('')
                  setBlogCoverUrl('')
                  setBlogVideoUrl('')
                  setBlogTagsInput('')
                  setShowAddBlogModal(true)
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-pixel uppercase font-bold mt-2 cursor-pointer transition-colors"
              >
                Write First Article
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredBlogs.map((blog) => renderBlogCard(blog))}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Article Reader Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-left animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-pixel text-[10px] text-blue-700 uppercase font-bold bg-blue-50 px-2 py-0.5 rounded">
                  Article Reader
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              {selectedBlog.cover_image_url && (
                <div className="rounded-2xl overflow-hidden max-h-60 border border-slate-200 bg-slate-50">
                  <img
                    src={selectedBlog.cover_image_url}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-pixel uppercase">
                {selectedBlog.title}
              </h2>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span>
                    By {selectedBlog.author?.full_name || selectedBlog.author?.username || 'CodeQuest Team'}
                  </span>
                  <span>•</span>
                  <span>{new Date(selectedBlog.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {user && selectedBlog.author_id && selectedBlog.author_id !== user.id && (
                    <button
                      type="button"
                      onClick={() => toggleFollow(selectedBlog.author_id!)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-pixel uppercase font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        selectedBlog.is_following_author
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {selectedBlog.is_following_author ? 'Following' : 'Follow Author'}
                    </button>
                  )}

                  {user && selectedBlog.author_id !== user.id && (
                    <button
                      type="button"
                      onClick={() => setReportingPostId(selectedBlog.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Report Blog"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {selectedBlog.summary && (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 font-medium leading-relaxed">
                  {selectedBlog.summary}
                </div>
              )}

              {selectedBlog.video_url && (
                <SafeMediaDisplay videoUrl={selectedBlog.video_url} altText={selectedBlog.title} />
              )}

              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedBlog.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleBlogLike(selectedBlog.id)}
                  className={`flex items-center gap-1.5 font-bold text-xs cursor-pointer transition-colors ${
                    selectedBlog.is_liked_by_user
                      ? 'text-rose-600'
                      : 'text-slate-500 hover:text-rose-600'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      selectedBlog.is_liked_by_user ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  <span>{selectedBlog.likes_count} Likes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBlog(null)
                    handleOpenBlogComments(selectedBlog)
                  }}
                  className="flex items-center gap-1.5 font-bold text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{selectedBlog.comments_count ?? 0} Comments</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-pixel uppercase rounded-xl cursor-pointer transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Blog Comments Modal */}
      {activeCommentBlog && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150 text-left">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase truncate max-w-xs">
                  Article: {activeCommentBlog.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCommentBlog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
              {loadingBlogComments ? (
                <div className="text-center text-xs text-slate-400 py-6 font-mono">
                  Loading article discussion...
                </div>
              ) : blogComments.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-8 font-pixel text-[10px]">
                  NO COMMENTS ON THIS ARTICLE YET. SHARE YOUR THOUGHTS!
                </div>
              ) : (
                blogComments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {c.author_name || 'Adventurer'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        {(user?.id === c.user_id || isAdmin) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBlogComment(c.id)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-700 font-sans leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Blog Comment Input */}
            <form
              onSubmit={handleAddBlogComment}
              className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2"
            >
              <input
                type="text"
                value={newBlogCommentText}
                onChange={(e) => setNewBlogCommentText(e.target.value)}
                placeholder="Share your feedback or questions..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
              />
              <GamifiedButton
                type="submit"
                variant="primary"
                disabled={!newBlogCommentText.trim()}
                className="!py-2 !px-4 text-xs font-bold font-pixel uppercase"
              >
                Send
              </GamifiedButton>
            </form>
          </div>
        </div>
      )}

      {/* 3. Write / Add Blog Modal */}
      {showAddBlogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 flex flex-col gap-4 text-left animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">
                  Write Community Blog Article
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBlogModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBlogSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="e.g. How I Built a Fullstack Game in 48 Hours"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Slug (URL Key)
                  </label>
                  <input
                    type="text"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    placeholder="e.g. built-fullstack-game-48-hours"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                  Summary / Overview
                </label>
                <textarea
                  value={blogSummary}
                  onChange={(e) => setBlogSummary(e.target.value)}
                  placeholder="A concise summary of what readers will learn..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Cover Image URL (Direct Link)
                  </label>
                  <input
                    type="url"
                    value={blogCoverUrl}
                    onChange={(e) => setBlogCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Video URL (YouTube or Direct)
                  </label>
                  <input
                    type="url"
                    value={blogVideoUrl}
                    onChange={(e) => setBlogVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={blogTagsInput}
                  onChange={(e) => setBlogTagsInput(e.target.value)}
                  placeholder="React, TypeScript, GameDev, Web3"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                  Article Content (Markdown supported) *
                </label>
                <textarea
                  required
                  rows={8}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  placeholder="Write your guide, code samples, thoughts, and lessons learned..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBlogModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <GamifiedButton
                  type="submit"
                  variant="primary"
                  disabled={!blogTitle.trim() || !blogContent.trim() || isSubmittingBlog}
                  className="!py-2 !px-5 text-xs font-pixel uppercase font-bold cursor-pointer"
                >
                  {isSubmittingBlog ? 'Publishing...' : 'Publish Article'}
                </GamifiedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Blog Modal */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 flex flex-col gap-4 text-left animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">
                  Edit Blog Article
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBlog} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                  Summary / Overview
                </label>
                <textarea
                  value={blogSummary}
                  onChange={(e) => setBlogSummary(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-800 focus:outline-hidden focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={blogCoverUrl}
                    onChange={(e) => setBlogCoverUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={blogVideoUrl}
                    onChange={(e) => setBlogVideoUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={blogTagsInput}
                  onChange={(e) => setBlogTagsInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                  Article Content (Markdown supported) *
                </label>
                <textarea
                  required
                  rows={8}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <GamifiedButton
                  type="submit"
                  variant="primary"
                  disabled={!blogTitle.trim() || !blogContent.trim() || isSubmittingBlog}
                  className="!py-2 !px-5 text-xs font-pixel uppercase font-bold cursor-pointer"
                >
                  {isSubmittingBlog ? 'Saving...' : 'Save Changes'}
                </GamifiedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add / Share Project Showcase Modal */}
      {showAddShowcaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 flex flex-col gap-4 text-left animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">
                  Share Project Showcase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddShowcaseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShowcaseSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={showcaseTitle}
                  onChange={(e) => setShowcaseTitle(e.target.value)}
                  placeholder="e.g. Pixel Physics Engine"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={showcaseDescription}
                  onChange={(e) => setShowcaseDescription(e.target.value)}
                  placeholder="Describe your creation, technologies used, and what you learned..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-sans text-slate-800 focus:outline-hidden focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Language
                  </label>
                  <select
                    value={showcaseLanguage}
                    onChange={(e) => setShowcaseLanguage(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="HTML/CSS">HTML/CSS</option>
                    <option value="React">React</option>
                    <option value="C++">C++</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={showcaseCategory}
                    onChange={(e) => setShowcaseCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Game Dev">Game Dev</option>
                    <option value="Tools & Utilities">Tools & Utilities</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="Mobile App">Mobile App</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Difficulty
                  </label>
                  <select
                    value={showcaseDifficulty}
                    onChange={(e) => setShowcaseDifficulty(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={showcaseLiveUrl}
                    onChange={(e) => setShowcaseLiveUrl(e.target.value)}
                    placeholder="https://myproject.vercel.app"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                    Code Preview / Repo URL
                  </label>
                  <input
                    type="url"
                    value={showcasePreviewUrl}
                    onChange={(e) => setShowcasePreviewUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-pixel text-slate-500 font-bold uppercase mb-1">
                  Screenshot / Banner Image URL
                </label>
                <input
                  type="url"
                  value={showcaseImageUrl}
                  onChange={(e) => setShowcaseImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddShowcaseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <GamifiedButton
                  type="submit"
                  variant="primary"
                  disabled={!showcaseTitle.trim() || !showcaseDescription.trim() || isSubmittingShowcase}
                  className="!py-2 !px-5 text-xs font-pixel uppercase font-bold cursor-pointer"
                >
                  {isSubmittingShowcase ? 'Publishing...' : 'Publish Showcase'}
                </GamifiedButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Post Comments Modal */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150 text-left">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">
                  Comments & Feedback
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCommentPost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
              {loadingComments ? (
                <div className="text-center text-xs text-slate-400 py-6 font-mono">
                  Loading conversations...
                </div>
              ) : postComments.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-8 font-pixel text-[10px]">
                  NO COMMENTS YET. START THE CONVERSATION!
                </div>
              ) : (
                postComments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {c.author_name || 'Adventurer'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                        {(user?.id === c.user_id || isAdmin) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-700 font-sans leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleAddComment}
              className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2"
            >
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a constructive comment..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
              />
              <GamifiedButton
                type="submit"
                variant="primary"
                disabled={!newCommentText.trim()}
                className="!py-2 !px-4 text-xs font-bold font-pixel uppercase"
              >
                Send
              </GamifiedButton>
            </form>
          </div>
        </div>
      )}

      {/* 7. Report Content Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <Flag className="w-5 h-5" />
                <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">
                  Report Community Content
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportingPostId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Thank you. Report submitted for staff review.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="flex flex-col gap-3">
                <p className="text-xs text-slate-600">
                  Please tell us why this content violates community guidelines:
                </p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-hidden"
                >
                  <option value="">Select a reason...</option>
                  <option value="spam">Spam or promotional content</option>
                  <option value="harassment">Harassment or abusive language</option>
                  <option value="inappropriate">Inappropriate or offensive material</option>
                  <option value="plagiarism">Plagiarism or copyright violation</option>
                  <option value="other">Other violation</option>
                </select>

                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setReportingPostId(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <GamifiedButton
                    type="submit"
                    variant="danger"
                    disabled={!reportReason}
                    className="!py-2 !px-4 text-xs font-bold font-pixel uppercase"
                  >
                    Submit Report
                  </GamifiedButton>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
