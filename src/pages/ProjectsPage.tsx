import React, { useState } from 'react'
import { GamifiedCard } from '../components/ui/GamifiedCard'
import { GamifiedButton } from '../components/ui/GamifiedButton'
import { useAuth } from '../context/AuthContext'
import {
  useProjects,
  type ProjectProgressSummary,
} from '../lib/projects'
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
} from 'lucide-react'
import confetti from 'canvas-confetti'

export const ProjectsPage: React.FC = () => {
  const { user, role, isAdmin } = useAuth()
  const [viewMode, setViewMode] = useState<'blueprints' | 'showcase'>('blueprints')
  const [selectedFilter, setSelectedFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  // Showcase Submission Modal State
  const [showcaseProjectId, setShowcaseProjectId] = useState<string | null>(null)
  const [showcaseTitle, setShowcaseTitle] = useState('')
  const [showcaseDesc, setShowcaseDesc] = useState('')
  const [showcaseLiveUrl, setShowcaseLiveUrl] = useState('')
  const [showcaseSuccess, setShowcaseSuccess] = useState(false)

  const {
    projects,
    showcases,
    loading,
    startProject,
    completeStep,
    completeProject,
    submitShowcase,
    removeShowcase,
  } = useProjects(user?.id, selectedFilter)

  const filteredProjects = projects.filter((item) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      item.project.title.toLowerCase().includes(query) ||
      item.project.description.toLowerCase().includes(query) ||
      item.project.category.toLowerCase().includes(query)
    )
  })

  const filteredShowcases = showcases.filter((s) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      s.title.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      (s.author_name && s.author_name.toLowerCase().includes(query)) ||
      (s.project_title && s.project_title.toLowerCase().includes(query))
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

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12 text-left">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderGit2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-black text-slate-900 font-pixel uppercase">
              Guided Coding Projects & Showcase
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Build real-world applications step-by-step, earn XP, and showcase your finished builds.
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
              <span>Community Showcase</span>
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

      {/* Category Filter Tabs (For Blueprints) */}
      {viewMode === 'blueprints' && (
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
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-pixel text-xs">
          LOADING REALM PROJECTS...
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
        /* Community Showcase View */
        filteredShowcases.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-pixel text-xs bg-white rounded-3xl border border-slate-100 p-8">
            NO COMMUNITY BUILDS SUBMITTED YET. BE THE FIRST!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShowcases.map((showcase) => (
              <GamifiedCard key={showcase.id} className="flex flex-col justify-between p-6 border-2 border-slate-100">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-pixel text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Community Build</span>
                    </span>
                    {(isAdmin || role === 'admin' || showcase.user_id === user?.id) && (
                      <button
                        type="button"
                        onClick={() => removeShowcase(showcase.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove Showcase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-1">{showcase.title}</h3>
                  <div className="text-[11px] font-medium text-emerald-600 mb-3">
                    Project: {showcase.project_title}
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-4">
                    {showcase.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    By @{showcase.author_name}
                  </span>

                  {showcase.live_url && (
                    <a
                      href={showcase.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 font-pixel uppercase"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </GamifiedCard>
            ))}
          </div>
        )
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
                <p className="text-xs text-slate-500">Your masterpiece is now visible in the Community Showcase tab.</p>
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
