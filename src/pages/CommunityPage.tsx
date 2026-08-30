import React, { useState } from 'react'
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
} from 'lucide-react'

export const CommunityPage: React.FC = () => {
  const { user, profile, isAdmin } = useAuth()
  const [filter, setFilter] = useState<'All' | 'project_showcase' | 'text'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  // Comments Modal State
  const [activeCommentPost, setActiveCommentPost] = useState<CommunityPost | null>(null)
  const [postComments, setPostComments] = useState<PostComment[]>([])
  const [newCommentText, setNewCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  // Report Modal State
  const [reportingPostId, setReportingPostId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)

  const currentUsername = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Adventurer'

  const {
    posts,
    loading,
    addPost,
    removePost,
    toggleLike,
    toggleFollow,
  } = useCommunityFeed(user?.id, filter, isAdmin, currentUsername)

  // Handle New Post Creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim() || isPosting) return

    setIsPosting(true)
    await addPost(newPostContent, 'text')
    setNewPostContent('')
    setIsPosting(false)
  }

  // Handle Comments Opening
  const handleOpenComments = async (post: CommunityPost) => {
    setActiveCommentPost(post)
    setLoadingComments(true)
    const comments = await fetchPostComments(post.id)
    setPostComments(comments)
    setLoadingComments(false)
  }

  // Handle Add Comment
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

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return
    const success = await deletePostComment(commentId)
    if (success) {
      setPostComments((prev) => prev.filter((c) => c.id !== commentId))
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

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.content.toLowerCase().includes(q) ||
      (p.author_name && p.author_name.toLowerCase().includes(q)) ||
      (p.project_showcase?.title && p.project_showcase.title.toLowerCase().includes(q))
    )
  })

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 text-left pb-16 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-pixel uppercase tracking-tight">
              Community Realm
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Share creations, celebrate quest breakthroughs, follow builders, and connect with adventurers worldwide.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 self-start sm:self-auto">
          {(['All', 'project_showcase', 'text'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] uppercase font-bold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f === 'All' ? 'All Posts' : f === 'project_showcase' ? 'Showcases' : 'Discussions'}
            </button>
          ))}
        </div>
      </div>

      {/* Share / Post Box */}
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

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search community posts, project titles, or adventurers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 shadow-xs font-medium"
        />
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-36 bg-slate-200/70 rounded-3xl" />
          <div className="h-36 bg-slate-200/70 rounded-3xl" />
          <div className="h-36 bg-slate-200/70 rounded-3xl" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-pixel text-sm font-bold text-slate-900 uppercase">No Community Posts Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {searchQuery ? 'Try adjusting your search terms.' : 'Be the first adventurer to share a project or start a discussion!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPosts.map((post) => {
            const isOwner = user?.id === post.user_id
            const isShowcase = post.post_type === 'project_showcase' && Boolean(post.project_showcase)

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
                        {isShowcase && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-pixel text-[8px] uppercase font-bold flex items-center gap-1">
                            <Code2 className="w-2.5 h-2.5" />
                            <span>SHOWCASE</span>
                          </span>
                        )}
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

                {/* Project Showcase Attachment Card */}
                {isShowcase && post.project_showcase && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-xs text-slate-900">
                          {post.project_showcase.title}
                        </h4>
                      </div>
                      {post.project_showcase.live_url && (
                        <a
                          href={post.project_showcase.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-pixel text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    {post.project_showcase.description && (
                      <p className="text-[11px] text-slate-600 leading-normal">
                        {post.project_showcase.description}
                      </p>
                    )}
                  </div>
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
          })}
        </div>
      )}

      {/* Comments Drawer / Modal */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150 text-left">
            {/* Modal Header */}
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments List */}
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

            {/* Add Comment Input */}
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

      {/* Report Post Modal */}
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
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
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
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
