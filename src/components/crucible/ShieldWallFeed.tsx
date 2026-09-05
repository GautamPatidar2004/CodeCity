import React, { useState, useCallback } from 'react'
import { Heart, MessageSquare, UserPlus, UserCheck, Send, Flag, Trash2, CheckCircle2, Users } from 'lucide-react'
import {
  useCommunityFeed,
  fetchPostComments,
  addPostComment,
  deletePostComment,
  reportContent,
  type CommunityPost,
  type PostComment,
} from '../../lib/community'
import { useAuth } from '../../context/AuthContext'
import { C, relativeTime } from './crucibleTokens'
import { toast } from 'react-hot-toast'

/* ─────────────────────────────────────────────────────────────
   CommentThread — Threaded discussion panel
───────────────────────────────────────────────────────────────── */
interface CommentThreadProps {
  postId: string
  onClose: () => void
}

export const CommentThread: React.FC<CommentThreadProps> = ({ postId, onClose }) => {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const loadComments = useCallback(async () => {
    setLoading(true)
    const data = await fetchPostComments(postId)
    setComments(data)
    setLoading(false)
  }, [postId])

  React.useEffect(() => { loadComments() }, [loadComments])

  const handlePost = async () => {
    if (!user?.id || !newComment.trim()) return
    setIsPosting(true)
    const result = await addPostComment(postId, user.id, newComment.trim())
    if (result.success) {
      setNewComment('')
      await loadComments()
    } else {
      toast.error(result.error ?? 'Failed to post rune of counsel')
    }
    setIsPosting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!user?.id) return
    const result = await deletePostComment(commentId, user.id)
    if (result.success) await loadComments()
  }

  return (
    <div className="flex flex-col gap-0 rounded-2xl overflow-hidden"
      style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${C.border}`, background: '#0A0707' }}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" style={{ color: C.crimson }} />
          <span className="text-[10px] uppercase tracking-widest font-bold"
            style={{ fontFamily: "'Cinzel', serif", color: C.crimson }}>
            Runes of Counsel
          </span>
        </div>
        <button type="button" onClick={onClose} className="text-xs" style={{ color: C.textMuted }}>✕</button>
      </div>

      {/* Comments list */}
      <div className="flex flex-col gap-2 p-4 max-h-72 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-xs" style={{ color: C.textMuted }}>Inscribing runes…</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-2xl mb-2">📜</div>
            <p className="text-xs" style={{ color: C.textMuted, fontFamily: "'Cinzel', serif" }}>
              No runes inscribed yet. Be first to counsel.
            </p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              {/* Author avatar */}
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, #7F1D1D, #DC2626)',
                  border: `1px solid ${C.borderHot}`,
                  color: C.textPrimary,
                  fontFamily: "'Cinzel', serif",
                }}>
                {(c.author_name || '?').charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-bold" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>
                    {c.author_name || 'Anonymous Warrior'}
                  </span>
                  {/* Valkyrie mark for verified/admin */}
                  {c.author_role === 'admin' && (
                    <CheckCircle2 className="w-3 h-3" style={{ color: C.gold }} title="Valkyrie Mark of Honor" />
                  )}
                  <span className="text-[9px]" style={{ color: C.textMuted }}>{relativeTime(c.created_at)}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{c.content}</p>
              </div>

              {/* Delete (own comments only) */}
              {user?.id === c.user_id && (
                <button type="button" onClick={() => handleDelete(c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                  style={{ color: C.textMuted }}>
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply input */}
      {user && (
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: 'linear-gradient(135deg, #7F1D1D, #DC2626)', border: `1px solid ${C.borderHot}`, color: C.textPrimary }}>
            {(profile?.username || profile?.full_name || 'W').charAt(0).toUpperCase()}
          </div>
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
            placeholder="Inscribe your counsel…"
            className="flex-1 text-xs px-3 py-2 rounded-lg outline-none transition-all"
            style={{
              background: 'rgba(20,12,12,0.8)',
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
              fontFamily: "'Inter', sans-serif",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = C.borderHot)}
            onBlur={e => (e.currentTarget.style.borderColor = C.border)}
          />
          <button type="button" onClick={handlePost} disabled={isPosting || !newComment.trim()}
            className="p-2 rounded-lg transition-all disabled:opacity-40"
            style={{ background: C.crimsonDim, border: `1px solid ${C.borderHot}`, color: C.crimson }}>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PostCard — Single war-board entry
───────────────────────────────────────────────────────────────── */
interface PostCardProps {
  post: CommunityPost
  onLike: (postId: string) => void
  onFollow: (authorId: string) => void
  onReport: (postId: string) => void
  onDelete?: (postId: string) => void
  currentUserId?: string
  isAdmin?: boolean
  flashId?: string | null
}

const PostCard: React.FC<PostCardProps> = ({
  post, onLike, onFollow, onReport, onDelete,
  currentUserId, isAdmin, flashId,
}) => {
  const [showComments, setShowComments] = useState(false)
  const isFlashing = flashId === post.id
  const isOwn = currentUserId === post.user_id

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: isFlashing
          ? 'linear-gradient(135deg, rgba(255,61,0,0.12), rgba(14,10,10,0.9))'
          : C.bgCard,
        border: `1px solid ${isFlashing ? C.lava : C.border}`,
        boxShadow: isFlashing ? `0 0 24px rgba(255,61,0,0.25)` : 'none',
      }}
    >
      {/* Post image preview */}
      {post.image_url && (
        <div className="overflow-hidden max-h-56">
          <img src={post.image_url} alt="" className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.85) contrast(1.1)' }} />
        </div>
      )}

      <div className="p-5 flex flex-col gap-3">
        {/* Author row */}
        <div className="flex items-center gap-3">
          {/* Godhood tier avatar */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7F1D1D, #DC2626)',
              border: `2px solid ${C.borderHot}`,
              boxShadow: `0 0 10px rgba(220,38,38,0.3)`,
              color: C.textPrimary,
              fontFamily: "'Cinzel', serif",
            }}
          >
            {(post.author_name || '?').charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>
                {post.author_name || 'Anonymous Warrior'}
              </span>
              {/* Role badge */}
              {post.author_role === 'admin' && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                  style={{ background: C.crimsonDim, color: C.crimson, fontFamily: "'Cinzel', serif", border: `1px solid ${C.borderHot}` }}>
                  WARLORD
                </span>
              )}
            </div>
            <div className="text-[10px]" style={{ color: C.textMuted }}>{relativeTime(post.created_at ?? '')}</div>
          </div>

          {/* Follow button */}
          {!isOwn && (
            <button type="button" onClick={() => onFollow(post.user_id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all"
              style={{
                background: post.is_following_author ? C.crimsonDim : 'rgba(20,12,12,0.6)',
                color: post.is_following_author ? C.crimson : C.textSecondary,
                border: `1px solid ${post.is_following_author ? C.borderHot : C.border}`,
                fontFamily: "'Cinzel', serif",
              }}>
              {post.is_following_author
                ? <><UserCheck className="w-3 h-3" />Sworn</>
                : <><UserPlus className="w-3 h-3" />Pledge</>}
            </button>
          )}
        </div>

        {/* Post body */}
        <div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: C.textSecondary }}>
            {post.content}
          </p>
        </div>

        {/* Project showcase embed */}
        {post.project_showcase && (
          <div className="rounded-xl p-3 flex flex-col gap-1"
            style={{ background: 'rgba(20,12,12,0.7)', border: `1px solid ${C.borderGold}` }}>
            <div className="text-[10px] font-bold" style={{ color: C.gold, fontFamily: "'Cinzel', serif" }}>
              ⚒ Forge Showcase: {post.project_showcase.project_title || post.project_showcase.title}
            </div>
            {post.project_showcase.description && (
              <p className="text-xs" style={{ color: C.textMuted }}>{post.project_showcase.description}</p>
            )}
            {post.project_showcase.live_url && (
              <a href={post.project_showcase.live_url} target="_blank" rel="noopener noreferrer"
                className="text-[10px] underline" style={{ color: C.frost }}>
                View in the Arena →
              </a>
            )}
          </div>
        )}

        {/* Engagement controls */}
        <div className="flex items-center gap-3 pt-1" style={{ borderTop: `1px solid ${C.border}` }}>
          {/* Heart / Blood Upvote */}
          <button
            type="button"
            onClick={() => onLike(post.id)}
            className="flex items-center gap-1.5 text-xs font-bold transition-all group"
            style={{ color: post.is_liked_by_user ? C.crimson : C.textMuted }}
          >
            <Heart
              className="w-4 h-4 transition-transform group-hover:scale-110"
              style={{
                fill: post.is_liked_by_user ? C.crimson : 'transparent',
                stroke: post.is_liked_by_user ? C.crimson : C.textMuted,
                filter: post.is_liked_by_user ? `drop-shadow(0 0 6px ${C.crimson})` : 'none',
              }}
            />
            <span>{post.likes_count}</span>
          </button>

          {/* Comments counter */}
          <button
            type="button"
            onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-1.5 text-xs font-bold transition-all"
            style={{ color: showComments ? C.frost : C.textMuted }}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments_count} Runes</span>
          </button>

          <div className="flex-1" />

          {/* Report */}
          {!isOwn && (
            <button type="button" onClick={() => onReport(post.id)} className="p-1.5 rounded-lg transition-colors"
              style={{ color: C.textMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = C.crimson)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}>
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete (own or admin) */}
          {(isOwn || isAdmin) && onDelete && (
            <button type="button" onClick={() => onDelete(post.id)} className="p-1.5 rounded-lg transition-colors"
              style={{ color: C.textMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = C.crimson)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Comment thread (collapsible) */}
        {showComments && (
          <CommentThread postId={post.id} onClose={() => setShowComments(false)} />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ShieldWallFeed — Community war-table + posting UI
───────────────────────────────────────────────────────────────── */
export const ShieldWallFeed: React.FC = () => {
  const { user, profile, isAdmin } = useAuth()
  const [filter, setFilter] = useState<'All' | 'posts' | 'showcases'>('All')
  const [search, setSearch] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [followerStats] = useState({ followers: 0, following: 0 }) // placeholder — wire to useFollowers hook

  const {
    posts,
    loading,
    likePost,
    followAuthor,
    deletePost,
    createPost,
    refreshFeed,
  } = useCommunityFeed(user?.id)

  const filteredPosts = posts.filter(p => {
    if (filter === 'showcases' && p.post_type !== 'project_showcase') return false
    if (filter === 'posts' && p.post_type !== 'text') return false
    if (search && !p.content.toLowerCase().includes(search.toLowerCase()) &&
        !p.author_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleLike = async (postId: string) => {
    if (!user?.id) return
    await likePost(postId)
    setFlashId(postId)
    setTimeout(() => setFlashId(null), 1200)
  }

  const handleFollow = async (authorId: string) => {
    if (!user?.id) return
    await followAuthor(authorId)
    await refreshFeed()
  }

  const handleReport = async (postId: string) => {
    if (!user?.id) return
    await reportContent({ reporter_id: user.id, post_id: postId, reason: 'Reported by user' })
    toast.success('Dispatch sent to the War Council.')
  }

  const handleDelete = async (postId: string) => {
    if (!user?.id) return
    await deletePost(postId)
    await refreshFeed()
  }

  const handlePost = async () => {
    if (!user?.id || !newPostContent.trim()) return
    setIsPosting(true)
    await createPost(user.id, newPostContent.trim())
    setNewPostContent('')
    await refreshFeed()
    setIsPosting(false)
  }

  return (
    <div className="flex flex-col gap-6" style={{ color: C.textPrimary }}>

      {/* ── Warrior Follower Network Banner ── */}
      {profile && (
        <div className="flex items-center gap-6 px-5 py-4 rounded-2xl"
          style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7F1D1D, #DC2626)',
              border: `2px solid ${C.borderHot}`,
              boxShadow: `0 0 14px rgba(220,38,38,0.35)`,
              color: C.textPrimary,
              fontFamily: "'Cinzel', serif",
            }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              : (profile.username || 'W').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-base" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>
              {profile.full_name || profile.username || 'Warrior'}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>LVL {profile.level}</div>
          </div>
          <div className="flex items-center gap-6 ml-auto">
            {[
              { label: 'Warriors Sworn', value: followerStats.followers, icon: <Users className="w-3.5 h-3.5" /> },
              { label: 'Warriors Followed', value: followerStats.following, icon: <UserCheck className="w-3.5 h-3.5" /> },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1" style={{ color: C.crimson }}>{s.icon}</div>
                <div className="text-base font-bold" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>{s.value}</div>
                <div className="text-[9px] text-center" style={{ color: C.textMuted, fontFamily: "'Cinzel', serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Post composer ── */}
      {user && (
        <div className="rounded-2xl overflow-hidden" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}`, background: '#0A0707' }}>
            <span className="text-[9px] uppercase tracking-widest font-bold" style={{ fontFamily: "'Cinzel', serif", color: C.crimson }}>
              ⚔ Proclaim to the Shield-Wall
            </span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <textarea
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              placeholder="Speak your war cry to the assembled warriors…"
              rows={3}
              className="w-full text-sm rounded-xl px-4 py-3 outline-none resize-none transition-all"
              style={{
                background: 'rgba(20,12,12,0.8)',
                border: `1px solid ${C.border}`,
                color: C.textPrimary,
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = C.borderHot)}
              onBlur={e => (e.currentTarget.style.borderColor = C.border)}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePost}
                disabled={isPosting || !newPostContent.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #DC2626, #FF3D00)',
                  color: '#fff',
                  fontFamily: "'Cinzel', serif",
                  boxShadow: '0 4px 16px rgba(220,38,38,0.35)',
                  border: '1px solid rgba(255,100,50,0.3)',
                }}
              >
                <Send className="w-3.5 h-3.5" />
                {isPosting ? 'Inscribing…' : 'Raise the Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter + Search bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filters */}
        <div className="flex gap-1 rounded-xl p-1" style={{ background: '#0A0707', border: `1px solid ${C.border}` }}>
          {(['All', 'posts', 'showcases'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all"
              style={{
                fontFamily: "'Cinzel', serif",
                background: filter === f ? C.crimsonDim : 'transparent',
                color: filter === f ? C.crimson : C.textMuted,
                border: filter === f ? `1px solid ${C.borderHot}` : '1px solid transparent',
              }}
            >
              {f === 'All' ? 'All Scrolls' : f === 'posts' ? 'War Cries' : 'Forge Showcases'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search the war-board…"
            className="w-full text-xs px-4 py-2 rounded-xl outline-none"
            style={{
              background: 'rgba(20,12,12,0.8)',
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
          />
        </div>
      </div>

      {/* ── Posts feed ── */}
      {loading ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="text-3xl animate-pulse" style={{ color: C.crimson }}>⚔</div>
          <div className="text-xs uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.textMuted }}>
            Unfurling the war scrolls…
          </div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 rounded-2xl"
          style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
          <div className="text-4xl opacity-40">🛡</div>
          <p className="text-sm" style={{ fontFamily: "'Cinzel', serif", color: C.textMuted }}>
            The war-board is silent. No scrolls match your query.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onFollow={handleFollow}
              onReport={handleReport}
              onDelete={(isAdmin || post.user_id === user?.id) ? handleDelete : undefined}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              flashId={flashId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
