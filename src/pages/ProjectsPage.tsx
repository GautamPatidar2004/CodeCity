import React, { useState } from 'react'
import { GamifiedCard } from '../components/ui/GamifiedCard'
import { GamifiedButton } from '../components/ui/GamifiedButton'
import { useAuth } from '../context/AuthContext'
import {
  useProjects,
  type ProjectProgressSummary,
} from '../lib/projects'
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
  FolderGit2,
  Layers,
  Search,
  BookOpen,
  ArrowRight,
  X,
  ListOrdered,
  FileCode2,
  CheckCircle2,
  Circle,
  PlayCircle,
  Trophy,
  Sparkles,
  ExternalLink,
  Share2,
  Trash2,
  LayoutGrid,
  Send,
  MessageSquare,
  Heart,
  UserPlus,
  UserCheck,
  Eye,
  EyeOff,
  Flag,
} from 'lucide-react'
import confetti from 'canvas-confetti'

export const ProjectsPage: React.FC = () => {
  const { user, profile, role, isAdmin } = useAuth()
  const [viewMode, setViewMode] = useState<'blueprints' | 'showcase'>('blueprints')
  const [selectedFilter, setSelectedFilter] = useState<string>('All')
  const [communityFilter, setCommunityFilter] = useState<'All' | 'project_showcase' | 'text'>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  // Reporting State
  const [reportingPostId, setReportingPostId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)

  // Showcase Submission Modal State
  const [showcaseProjectId, setShowcaseProjectId] = useState<string | null>(null)
  const [showcaseTitle, setShowcaseTitle] = useState('')
  const [showcaseDesc, setShowcaseDesc] = useState('')
  const [showcaseLiveUrl, setShowcaseLiveUrl] = useState('')
  const [showcaseSuccess, setShowcaseSuccess] = useState(false)

  // Quick Community Post State
  const [newPostContent, setNewPostContent] = useState('')

  // Comments Dialog State
  const [activeCommentPost, setActiveCommentPost] = useState<CommunityPost | null>(null)
  const [postComments, setPostComments] = useState<PostComment[]>([])
  const [newCommentText, setNewCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  const currentUsername = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Adventurer'

  const {
    projects,
    loading: projectsLoading,
    startProject,
    completeStep,
    completeProject,
    submitShowcase,
  } = useProjects(user?.id, selectedFilter)

  const {
    posts,
    loading: feedLoading,
    addPost,
    removePost,
    moderatePost,
    toggleLike,
    toggleFollow,
    refreshFeed,
  } = useCommunityFeed(user?.id, communityFilter, isAdmin, currentUsername)

  const filteredProjects = projects.filter((item) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      item.project.title.toLowerCase().includes(query) ||
      item.project.description.toLowerCase().includes(query) ||
      item.project.category.toLowerCase().includes(query)
    )
  })

  const filteredPosts = posts.filter((p) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      p.content.toLowerCase().includes(query) ||
      (p.author_name && p.author_name.toLowerCase().includes(query)) ||
      (p.project_showcase?.title && p.project_showcase.title.toLowerCase().includes(query)) ||
      (p.project_showcase?.project_title && p.project_showcase.project_title.toLowerCase().includes(query))
    )
  })

  const selectedSummary = selectedProjectId
    ? projects.find((p) => p.project.id === selectedProjectId) || null
    : null

  const handleStartOrResume = async (summary: ProjectProgressSummary) => {
    if (!user?.id) return
    if (!summary.isEnrolled) {
      await startProject(summary.project.id, summary.project.steps?.[0]?.id)
    }
    setSelectedProjectId(summary.project.id)
  }

  const handleToggleStep = async (projectId: string, stepId: string, projectTitle: string) => {
    if (!user?.id) return
    const summary = projects.find((p) => p.project.id === projectId)
    if (!summary) return

    if (!summary.isEnrolled) {
      await startProject(projectId, stepId)
    }

    const wasAlreadyCompleted = summary.completedStepIds.includes(stepId)
    if (!wasAlreadyCompleted) {
      await completeStep(projectId, stepId, projectTitle)

      const newCompletedCount = summary.completedStepsCount + 1
      if (newCompletedCount >= summary.totalStepsCount && summary.totalStepsCount > 0) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }
  }

  const handleCompleteFullProject = async (projectId: string, projectTitle: string) => {
    if (!user?.id) return
    await completeProject(projectId, projectTitle)
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    })
  }

  const handleOpenShowcaseModal = (projectId: string, defaultTitle: string) => {
    setShowcaseProjectId(projectId)
    setShowcaseTitle(`${defaultTitle} - Custom Build`)
    setShowcaseDesc('')
    setShowcaseLiveUrl('')
  }

  const handleSubmitShowcaseForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showcaseProjectId || !showcaseTitle.trim() || !showcaseDesc.trim()) return

    const res = await submitShowcase(
      showcaseProjectId,
      showcaseTitle.trim(),
      showcaseDesc.trim(),
      undefined,
      showcaseLiveUrl.trim() || undefined
    )

    if (res) {
      setShowcaseSuccess(true)
      setTimeout(() => {
        setShowcaseSuccess(false)
        setShowcaseProjectId(null)
      }, 2000)
    }
  }

  const handleCreateQuickPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim()) return
    await addPost(newPostContent.trim(), 'text')
    setNewPostContent('')
  }

  const handleOpenComments = async (post: CommunityPost) => {
    setActiveCommentPost(post)
    setLoadingComments(true)
    const comments = await fetchPostComments(post.id)
    setPostComments(comments)
    setLoadingComments(false)
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCommentPost || !user?.id || !newCommentText.trim()) return

    const added = await addPostComment(user.id, activeCommentPost.id, newCommentText.trim())
    if (added) {
      setPostComments((prev) => [...prev, added])
      setNewCommentText('')
      await refreshFeed()
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const ok = await deletePostComment(commentId)
    if (ok) {
      setPostComments((prev) => prev.filter((c) => c.id !== commentId))
      await refreshFeed()
    }
  }

  const handleReportPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !reportingPostId || !reportReason.trim()) return
    await reportContent(user.id, reportReason.trim(), reportingPostId)
    setReportSuccess(true)
    setTimeout(() => {
      setReportSuccess(false)
      setReportingPostId(null)
      setReportReason('')
    }, 1500)
  }

  const isLoading = viewMode === 'blueprints' ? projectsLoading : feedLoading

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12 text-left">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderGit2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-black text-slate-900 font-pixel uppercase">
              Guided Coding Projects & Community
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Build real-world applications step-by-step, earn XP, and connect with fellow learners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setViewMode('blueprints')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'blueprints'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Blueprints</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('showcase')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'showcase'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Community Feed</span>
            </button>
          </div>

          <div className="relative w-full md:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {viewMode === 'blueprints' ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', 'Web', 'JavaScript', 'Python', 'React', 'Backend'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(
            [
              { key: 'All', label: 'All Updates' },
              { key: 'project_showcase', label: 'Project Showcases' },
              { key: 'text', label: 'Discussions' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCommunityFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                communityFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 font-pixel text-xs">
          LOADING REALM CONTENT...
        </div>
      ) : viewMode === 'blueprints' ? (
        filteredProjects.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-pixel text-xs bg-white rounded-3xl border border-slate-100 p-8">
            NO PROJECTS FOUND MATCHING YOUR CRITERIA
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((summary) => {
              const { project, isCompleted, isEnrolled, progressPercent, completedStepsCount, totalStepsCount, currentStep } = summary

              return (
                <GamifiedCard
                  key={project.id}
                  className={`flex flex-col justify-between p-6 border-2 transition-all cursor-pointer ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isEnrolled
                      ? 'border-slate-300'
                      : 'border-slate-100 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-pixel text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
                        {project.category}
                      </span>
                      <span className="text-xs font-pixel text-amber-500 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>+150 XP</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Difficulty: {project.difficulty}</span>
                      <span className="font-mono">{completedStepsCount}/{totalStepsCount} Steps</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 mb-2">{project.title}</h3>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-4">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{totalStepsCount} Milestone Steps</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isCompleted ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <div className="py-2 px-3 bg-emerald-100 text-emerald-800 rounded-xl font-pixel text-[10px] font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>COMPLETED</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenShowcaseModal(project.id, project.title)
                          }}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-pixel text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Showcase</span>
                        </button>
                      </div>
                    ) : isEnrolled ? (
                      <GamifiedButton
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartOrResume(summary)
                        }}
                        className="w-full flex items-center justify-center gap-1.5"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Resume: {currentStep?.title || 'Next Step'}</span>
                      </GamifiedButton>
                    ) : (
                      <GamifiedButton
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartOrResume(summary)
                        }}
                        className="w-full flex items-center justify-center gap-1"
                      >
                        <span>Start Project (+150 XP)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </GamifiedButton>
                    )}
                  </div>
                </GamifiedCard>
              )
            })}
          </div>
        )
      ) : (
        /* Community Feed View */
        <div className="flex flex-col gap-6">
          {/* Quick Post Creator Card */}
          <form onSubmit={handleCreateQuickPost} className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 font-pixel uppercase">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Share an update or question with the realm</span>
            </div>
            <textarea
              required
              rows={2}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What are you building or learning today?..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-pixel text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Update</span>
              </button>
            </div>
          </form>

          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-pixel text-xs bg-white rounded-3xl border border-slate-100 p-8">
              NO COMMUNITY POSTS FOUND. BE THE FIRST TO SHARE!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <GamifiedCard key={post.id} className="flex flex-col justify-between p-6 border-2 border-slate-100">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-pixel px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 ${
                          post.post_type === 'project_showcase'
                            ? 'text-amber-700 bg-amber-100'
                            : 'text-purple-700 bg-purple-100'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          <span>{post.post_type === 'project_showcase' ? 'Project Showcase' : 'Update'}</span>
                        </span>
                        {post.status === 'hidden' && (
                          <span className="text-[9px] font-pixel px-1.5 py-0.2 rounded font-bold uppercase bg-rose-100 text-rose-700">
                            HIDDEN
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Admin Moderation (Toggle publish/hidden) */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => moderatePost(post.id, post.status === 'hidden' ? 'published' : 'hidden')}
                            className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            title={post.status === 'hidden' ? 'Unhide Post' : 'Hide Post (Moderation)'}
                          >
                            {post.status === 'hidden' ? <Eye className="w-3.5 h-3.5 text-purple-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {(isAdmin || role === 'admin' || post.user_id === user?.id) && (
                          <button
                            type="button"
                            onClick={() => removePost(post.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {post.project_showcase && (
                      <div className="mb-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                        <div className="font-bold text-xs text-slate-900 mb-0.5">
                          {post.project_showcase.title}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-pixel uppercase font-bold">
                          {post.project_showcase.project_category} • {post.project_showcase.project_title}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-700 leading-relaxed mb-4">
                      {post.content}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                    {/* Author Attribution & Follow */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-600 font-mono">
                          @{post.author_name}
                        </span>
                        {post.author_role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-pixel uppercase font-bold bg-purple-100 text-purple-700">
                            STAFF
                          </span>
                        )}
                      </div>

                      {user?.id && user.id !== post.user_id && (
                        <button
                          type="button"
                          onClick={() => toggleFollow(post.user_id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-pixel uppercase flex items-center gap-1 transition-colors cursor-pointer ${
                            post.is_following_author
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {post.is_following_author ? (
                            <>
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 text-emerald-600" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Likes, Comments & Demo Actions */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                            post.is_liked_by_user
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-400 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.is_liked_by_user ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span className="font-mono text-xs">{post.likes_count}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenComments(post)}
                          className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-mono text-xs">{post.comments_count}</span>
                        </button>

                        {user?.id && user.id !== post.user_id && (
                          <button
                            type="button"
                            onClick={() => {
                              setReportingPostId(post.id)
                              setReportReason('')
                            }}
                            className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Report post"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {post.project_showcase?.live_url && (
                        <a
                          href={post.project_showcase.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 font-pixel uppercase"
                        >
                          <span>Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </GamifiedCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-500" />
                <h4 className="font-pixel text-xs font-bold uppercase text-slate-900">Report Inappropriate Content</h4>
              </div>
              <button
                type="button"
                onClick={() => setReportingPostId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl">
                Thank you. Our moderation staff has received your report.
              </div>
            ) : (
              <form onSubmit={handleReportPost} className="flex flex-col gap-3">
                <p className="text-xs text-slate-600">
                  Please explain why this content violates CodeDex community guidelines:
                </p>
                <textarea
                  required
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g. Spam, harassment, inappropriate link..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReportingPostId(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-pixel uppercase rounded-xl cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Comments Drawer / Dialog */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 text-left flex flex-col gap-4 animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 font-pixel uppercase flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Discussion & Feedback</span>
                </h3>
                <p className="text-xs text-slate-500">Post by @{activeCommentPost.author_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCommentPost(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Post Snippet */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {activeCommentPost.content}
            </div>

            {/* Comments List */}
            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto py-1">
              {loadingComments ? (
                <div className="py-6 text-center text-slate-400 font-pixel text-xs">
                  LOADING COMMENTS...
                </div>
              ) : postComments.length === 0 ? (
                <div className="py-6 text-center text-slate-400 font-pixel text-xs">
                  NO COMMENTS YET. START THE CONVERSATION!
                </div>
              ) : (
                postComments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-xs text-slate-900 font-mono">@{comment.author_name}</span>
                        {comment.author_role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded text-[7px] font-pixel uppercase font-bold bg-purple-100 text-purple-700">
                            STAFF
                          </span>
                        )}
                        <span className="text-[9px] text-slate-400">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-snug">{comment.content}</p>
                    </div>

                    {(isAdmin || role === 'admin' || comment.user_id === user?.id) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                required
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a supportive comment or question..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-pixel text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Project Detail & Progress Modal */}
      {selectedSummary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 text-left flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-pixel text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
                    {selectedSummary.project.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {selectedSummary.project.difficulty}
                  </span>
                  <span className="text-xs font-pixel text-amber-500 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>+150 XP Reward</span>
                  </span>
                  {selectedSummary.isCompleted && (
                    <span className="text-[10px] font-pixel text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span>COMPLETED</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 font-pixel">
                  {selectedSummary.project.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar in Modal */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 font-pixel uppercase">Milestone Progress</span>
                <span className="text-emerald-700 font-mono">
                  {selectedSummary.completedStepsCount} of {selectedSummary.totalStepsCount} completed ({selectedSummary.progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${selectedSummary.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Overview & Instructions */}
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Overview</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedSummary.project.description}
                </p>
              </div>

              {selectedSummary.project.instructions && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-pixel">
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>Project Guidelines</span>
                  </h4>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {selectedSummary.project.instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Steps List */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                <span>Project Steps & Milestones</span>
              </h4>

              <div className="flex flex-col gap-3">
                {(selectedSummary.project.steps || []).map((step, index) => {
                  const isStepDone = selectedSummary.completedStepIds.includes(step.id)

                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3.5 ${
                        isStepDone
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : 'border-slate-200 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        <div
                          className={`w-6 h-6 rounded-full font-pixel text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isStepDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {step.step_order || index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 mb-1 flex items-center gap-2">
                            <span>{step.title}</span>
                            {isStepDone && (
                              <span className="text-[10px] font-pixel text-emerald-600 font-bold uppercase">
                                ✓ Done
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 leading-relaxed">
                            {step.description}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleStep(selectedSummary.project.id, step.id, selectedSummary.project.title)}
                        className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                          isStepDone
                            ? 'text-emerald-600 hover:bg-emerald-100'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                        }`}
                        title={isStepDone ? 'Completed' : 'Mark as Complete'}
                      >
                        {isStepDone ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {!selectedSummary.isCompleted && selectedSummary.completedStepsCount === selectedSummary.totalStepsCount && selectedSummary.totalStepsCount > 0 ? (
                <GamifiedButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleCompleteFullProject(selectedSummary.project.id, selectedSummary.project.title)}
                  className="flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Claim Project Completion (+150 XP)! 🏆</span>
                </GamifiedButton>
              ) : selectedSummary.isCompleted ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(null)
                    handleOpenShowcaseModal(selectedSummary.project.id, selectedSummary.project.title)
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-pixel uppercase rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Build to Showcase</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-pixel uppercase rounded-xl transition-all cursor-pointer"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Showcase Submission Modal */}
      {showcaseProjectId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-left flex flex-col gap-5 animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-pixel uppercase flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Showcase Your Project</span>
                </h3>
                <p className="text-xs text-slate-500">Publish your completed build to the Community Showcase</p>
              </div>
              <button
                type="button"
                onClick={() => setShowcaseProjectId(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showcaseSuccess ? (
              <div className="p-6 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-pixel text-sm font-bold text-emerald-900 uppercase">Build Published!</h4>
                <p className="text-xs text-slate-500">Your masterpiece is now visible in the Community feed.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitShowcaseForm} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Build Title</label>
                  <input
                    type="text"
                    required
                    value={showcaseTitle}
                    onChange={(e) => setShowcaseTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="e.g. My Portfolio V1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Project Story</label>
                  <textarea
                    required
                    rows={3}
                    value={showcaseDesc}
                    onChange={(e) => setShowcaseDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Describe the challenges you solved, technologies used, and key features..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Live Demo / Repository Link (Optional)</label>
                  <input
                    type="url"
                    value={showcaseLiveUrl}
                    onChange={(e) => setShowcaseLiveUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="https://my-app.vercel.app"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowcaseProjectId(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-pixel uppercase rounded-xl cursor-pointer transition-colors"
                  >
                    Publish to Community ✨
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
