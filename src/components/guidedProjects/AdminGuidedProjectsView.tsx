import React, { useState, useEffect } from 'react'
import {
  Compass,
  PlusCircle,
  Search,
  Clock,
  Award,
  Edit3,
  Trash2,
  Send,
  CheckCircle2,
  RefreshCw,
  Layers,
  FileText,
  AlertCircle,
  Loader2,
  BarChart3,
  Users,
  Percent,
} from 'lucide-react'
import {
  useAdminGuidedProjects,
  publishGuidedProject,
  deleteGuidedProject,
  fetchGuidedProjectsAnalytics,
  type GuidedProject,
  type GuidedProjectStatus,
  type GuidedProjectsAnalyticsPayload,
  type ProjectAnalyticsItem,
} from '../../lib/guidedProjects'
import { ProjectAnalyticsModal } from './ProjectAnalyticsModal'
import { useAuth } from '../../context/AuthContext'
import { GuidedProjectModal } from './GuidedProjectModal'
import { toast } from 'react-hot-toast'
import { showQuestToast } from '../ui/GameToast'

export const AdminGuidedProjectsView: React.FC = () => {
  const { user } = useAuth()
  const { projects, loading, error, refreshProjects } = useAdminGuidedProjects()

  const [searchTerm, setSearchTerm] = useState('')
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | GuidedProjectStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProjectToEdit, setSelectedProjectToEdit] = useState<GuidedProject | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<GuidedProject | null>(null)

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<GuidedProjectsAnalyticsPayload | null>(null)
  const [selectedAnalyticsProject, setSelectedAnalyticsProject] = useState<ProjectAnalyticsItem | null>(null)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)

  // Load analytics when projects change
  useEffect(() => {
    fetchGuidedProjectsAnalytics().then((res) => {
      if (res) setAnalyticsData(res)
    })
  }, [projects])

  // Metrics
  const totalCount = projects.length
  const publishedCount = projects.filter((p) => p.status === 'published').length
  const draftCount = projects.filter((p) => p.status === 'draft').length
  const totalStarts = analyticsData?.summary?.total_starts ?? 0
  const totalCompletions = analyticsData?.summary?.total_completions ?? 0
  const globalCompletionRate = analyticsData?.summary?.completion_rate ?? 0

  // Filtered List
  const filteredProjects = projects.filter((p) => {
    const matchesTab = activeStatusTab === 'all' ? true : p.status === activeStatusTab
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesTab && matchesSearch
  })

  // Quick Publish Handler
  const handleQuickPublish = async (project: GuidedProject) => {
    setActionLoadingId(project.id)
    try {
      const res = await publishGuidedProject(project.id)
      if (res.success) {
        showQuestToast({ title: 'Project Published!', variant: 'complete' })
        toast.success(`"${project.title}" is now published and live for students.`)
        await refreshProjects()
      } else {
        toast.error(res.error || 'Failed to publish project.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error publishing project.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return
    setActionLoadingId(projectToDelete.id)
    try {
      const res = await deleteGuidedProject(projectToDelete.id, user?.id)
      if (res.success) {
        showQuestToast({ title: 'Project Deleted', variant: 'complete' })
        toast.success(`"${projectToDelete.title}" has been deleted.`)
        setProjectToDelete(null)
        await refreshProjects()
      } else {
        toast.error(res.error || 'Failed to delete project.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting project.')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-md">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-pixel uppercase tracking-wide">
                Guided Projects
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-pixel uppercase bg-purple-100 text-purple-700">
                Authoring Realm
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Create structured, multi-stage interactive coding journeys and reward mastery with badges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshProjects}
            disabled={loading}
            className="p-2.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedProjectToEdit(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-pixel uppercase text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#ece7df] shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-stone-900 font-mono">{totalCount}</div>
            <div className="text-[11px] text-stone-500 font-medium">Total Projects</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ece7df] shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-stone-900 font-mono">{totalStarts}</div>
            <div className="text-[11px] text-stone-500 font-medium">Student Starts</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ece7df] shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-stone-900 font-mono">{totalCompletions}</div>
            <div className="text-[11px] text-stone-500 font-medium">Completions</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#ece7df] shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-stone-900 font-mono">{globalCompletionRate}%</div>
            <div className="text-[11px] text-stone-500 font-medium">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ece7df] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveStatusTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-pixel uppercase font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveStatusTab('published')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-pixel uppercase font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'published'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-emerald-700'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveStatusTab('draft')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-pixel uppercase font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeStatusTab === 'draft'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-amber-700'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-[#ece7df] text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold font-pixel uppercase text-stone-500 tracking-wider">
            Loading Guided Projects...
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 text-xs">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
          <p className="font-bold mb-1">Failed to load projects</p>
          <p className="text-stone-500 mb-3">{error}</p>
          <button
            type="button"
            onClick={refreshProjects}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#ece7df] text-center shadow-xs">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-1 font-pixel uppercase">
            No Guided Projects Found
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mb-6">
            {searchTerm
              ? `No projects matching "${searchTerm}" found in ${activeStatusTab} view.`
              : 'Create your first guided project to get started with multi-stage interactive learning.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedProjectToEdit(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-pixel uppercase text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProjects.map((project) => {
            const isDraft = project.status === 'draft'
            const isPublished = project.status === 'published'
            const isActionLoading = actionLoadingId === project.id

            // Difficulty Color
            const difficultyStyles = {
              beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
              advanced: 'bg-purple-50 text-purple-700 border-purple-200',
            }[project.difficulty] || 'bg-stone-50 text-stone-700 border-stone-200'

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl p-5 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* Project Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Pill */}
                    {isPublished ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-pixel uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Published</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-pixel uppercase font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <FileText className="w-3 h-3" />
                        <span>Draft</span>
                      </span>
                    )}

                    {/* Difficulty Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-pixel uppercase font-bold border capitalize ${difficultyStyles}`}
                    >
                      {project.difficulty}
                    </span>

                    {/* Duration */}
                    <span className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {project.estimated_minutes} mins
                    </span>

                    {/* Stages Count */}
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      <Layers className="w-3 h-3 text-purple-600" />
                      <span>{project.stages_count ?? 0} {project.stages_count === 1 ? 'Stage' : 'Stages'}</span>
                    </span>

                    {/* Badge Reward Pill */}
                    {project.badge && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Award className="w-3 h-3 text-indigo-500" />
                        <span>{project.badge.title}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-purple-600 transition-colors">
                    {project.title}
                  </h3>

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 max-w-3xl">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100">
                  {/* Quick Publish for Drafts */}
                  {isDraft && (
                    <button
                      type="button"
                      onClick={() => handleQuickPublish(project)}
                      disabled={isActionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-pixel uppercase text-[10px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      title="Publish project"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>Publish</span>
                    </button>
                  )}

                  {/* Analytics Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const found = analyticsData?.projects.find((p) => p.id === project.id) || {
                        id: project.id,
                        title: project.title,
                        difficulty: project.difficulty,
                        status: project.status,
                        estimated_minutes: project.estimated_minutes,
                        starts_count: 0,
                        completions_count: 0,
                        completion_rate: 0,
                        avg_stage_reached: 1,
                        stage_funnel: [],
                      }
                      setSelectedAnalyticsProject(found)
                      setIsAnalyticsModalOpen(true)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold font-pixel uppercase transition-colors cursor-pointer"
                    title="View stage funnel & drop-off analytics"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Analytics</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectToEdit(project)
                      setIsModalOpen(true)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold font-pixel uppercase transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-purple-600" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(project)}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Project Creator/Editor Modal */}
      <GuidedProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProjectToEdit(null)
        }}
        onSuccess={() => {
          refreshProjects()
        }}
        projectToEdit={selectedProjectToEdit}
      />

      {/* Project Funnel Analytics Modal */}
      <ProjectAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => {
          setIsAnalyticsModalOpen(false)
          setSelectedAnalyticsProject(null)
        }}
        projectAnalytics={selectedAnalyticsProject}
      />

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-pixel text-sm uppercase font-bold text-stone-900">
                Delete Guided Project
              </h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-stone-900">"{projectToDelete.title}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={actionLoadingId === projectToDelete.id}
                className="px-3.5 py-1.5 text-xs font-pixel uppercase font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoadingId === projectToDelete.id}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-pixel uppercase font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === projectToDelete.id && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
