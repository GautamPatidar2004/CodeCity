import React, { useState, useEffect, useCallback } from 'react'
import {
  Compass,
  Search,
  Clock,
  Award,
  Play,
  Layers,
  Loader2,
} from 'lucide-react'
import {
  fetchPublishedGuidedProjects,
  fetchStudentProjectDetails,
  type GuidedProjectWithStudentProgress,
  type StudentStageView,
  type GuidedProjectDifficulty,
} from '../../lib/guidedProjects'
import { useAuth } from '../../context/AuthContext'
import { GuidedProjectDetailModal } from './GuidedProjectDetailModal'

interface StudentGuidedProjectsLibraryProps {
  onSelectProject: (projectId: string) => void
}

export const StudentGuidedProjectsLibrary: React.FC<StudentGuidedProjectsLibraryProps> = ({
  onSelectProject,
}) => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<GuidedProjectWithStudentProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | GuidedProjectDifficulty>('all')

  // Selected project for modal
  const [selectedProject, setSelectedProject] = useState<GuidedProjectWithStudentProgress | null>(null)
  const [selectedStages, setSelectedStages] = useState<StudentStageView[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loadingModal, setLoadingModal] = useState(false)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    const data = await fetchPublishedGuidedProjects(user?.id)
    setProjects(data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Open detail modal
  const handleOpenDetail = async (project: GuidedProjectWithStudentProgress) => {
    setSelectedProject(project)
    setModalOpen(true)
    setLoadingModal(true)
    const details = await fetchStudentProjectDetails(project.id, user?.id)
    setSelectedStages(details.stages)
    setLoadingModal(false)
  }

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesDiff = difficultyFilter === 'all' ? true : p.difficulty === difficultyFilter
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesDiff && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 overflow-hidden shadow-lg border-2 border-purple-800/40">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-28 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 backdrop-blur-xs text-[10px] font-pixel uppercase font-bold text-purple-200">
            <Compass className="w-3.5 h-3.5 text-purple-300" />
            <span>Multi-Stage Coding Journeys</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-pixel uppercase tracking-wide text-white leading-tight">
            Guided Projects
          </h1>

          <p className="text-xs sm:text-sm text-purple-200 leading-relaxed max-w-xl">
            Build real interactive applications step-by-step. Each stage unlocks sequentially as you master algorithms, data structures, and practical software design.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ece7df] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Difficulty Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            onClick={() => setDifficultyFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-pixel uppercase font-bold transition-all cursor-pointer whitespace-nowrap ${
              difficultyFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setDifficultyFilter('beginner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel uppercase font-bold transition-all cursor-pointer whitespace-nowrap ${
              difficultyFilter === 'beginner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-emerald-700'
            }`}
          >
            Beginner
          </button>
          <button
            type="button"
            onClick={() => setDifficultyFilter('intermediate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel uppercase font-bold transition-all cursor-pointer whitespace-nowrap ${
              difficultyFilter === 'intermediate'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-amber-700'
            }`}
          >
            Intermediate
          </button>
          <button
            type="button"
            onClick={() => setDifficultyFilter('advanced')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel uppercase font-bold transition-all cursor-pointer whitespace-nowrap ${
              difficultyFilter === 'advanced'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-purple-700'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guided projects..."
            className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-[#ece7df] text-center shadow-xs">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-pixel uppercase font-bold text-stone-500">
            Loading Guided Projects...
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-[#ece7df] text-center shadow-xs">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-pixel text-sm uppercase font-bold text-stone-900 mb-1">
            No Published Projects Found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchTerm
              ? `No projects matching "${searchTerm}" in ${difficultyFilter} level.`
              : 'New guided projects are being developed. Check back soon!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isStarted = Boolean(project.user_progress)
            const isCompleted = project.user_progress?.status === 'completed'
            const completedCount = project.completed_stages_count || 0
            const totalStages = project.stages_count || 1
            const progressPercent = Math.min(100, Math.round((completedCount / totalStages) * 100))

            const difficultyStyles = {
              beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
              advanced: 'bg-purple-50 text-purple-700 border-purple-200',
            }[project.difficulty] || 'bg-stone-50 text-stone-700 border-stone-200'

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-[#ece7df] p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-pixel uppercase font-bold border capitalize ${difficultyStyles}`}
                    >
                      {project.difficulty}
                    </span>

                    {project.badge && (
                      <span className="flex items-center gap-1 text-[10px] font-sans font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>{project.badge.title}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-purple-600 transition-colors leading-snug">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-3 text-xs text-stone-500 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {project.estimated_minutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      {project.stages_count || 1} Stages
                    </span>
                  </div>

                  {/* Progress Bar (if started) */}
                  {isStarted && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-pixel uppercase">
                        <span className="text-stone-500">Progress</span>
                        <span className="text-purple-700 font-mono font-bold">
                          {completedCount}/{totalStages} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-5 border-t border-stone-100 mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(project)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 font-pixel uppercase cursor-pointer"
                  >
                    View Roadmap
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-pixel uppercase text-[10px] sm:text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isCompleted
                        ? 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                        : isStarted
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isCompleted ? 'Review' : isStarted ? 'Continue' : 'Start'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Project Detail Roadmap Modal */}
      <GuidedProjectDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        project={selectedProject}
        stages={selectedStages}
        onStartOrContinue={(proj) => {
          setModalOpen(false)
          onSelectProject(proj.id)
        }}
        loading={loadingModal}
      />
    </div>
  )
}
