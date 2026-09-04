import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Compass,
  Clock,
  Award,
  CheckCircle2,
  Lock,
  Play,
  Layers,
  Zap,
} from 'lucide-react'
import {
  type GuidedProjectWithStudentProgress,
  type StudentStageView,
} from '../../lib/guidedProjects'

interface GuidedProjectDetailModalProps {
  isOpen: boolean
  onClose: () => void
  project: GuidedProjectWithStudentProgress | null
  stages: StudentStageView[]
  onStartOrContinue: (project: GuidedProjectWithStudentProgress) => void
  loading?: boolean
}

export const GuidedProjectDetailModal: React.FC<GuidedProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  stages,
  onStartOrContinue,
  loading = false,
}) => {
  if (!isOpen || !project) return null

  const progress = project.user_progress
  const isStarted = Boolean(progress)
  const isCompleted = progress?.status === 'completed'
  const currentStageOrder = progress?.current_stage_order || 1
  const completedCount = project.completed_stages_count || 0
  const totalStages = stages.length || project.stages_count || 1
  const progressPercent = Math.min(100, Math.round((completedCount / totalStages) * 100))

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border-2 border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
                <Compass className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-pixel uppercase font-bold px-2 py-0.5 rounded-md bg-white/20 text-purple-200">
                    Guided Journey
                  </span>
                  <span className="text-[10px] font-pixel uppercase font-bold px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 border border-purple-400/30 capitalize">
                    {project.difficulty}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold font-pixel uppercase text-white mt-1">
                  {project.title}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Overview & Metadata */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-stone-400" />
                  {project.estimated_minutes} mins estimated
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600" />
                  {totalStages} sequential stages
                </span>
                {project.badge && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200 font-sans font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Reward: {project.badge.title}
                  </span>
                )}
              </div>

              {project.description && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {/* Progress Bar (if started) */}
            {isStarted && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-pixel uppercase">
                  <span className="font-bold text-stone-700">Project Progress</span>
                  <span className="text-purple-700 font-mono font-bold">
                    {completedCount} / {totalStages} Stages ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Ordered Stage Progression List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-xs uppercase font-bold text-stone-900 tracking-wide">
                  Stage Roadmap
                </h3>
                <span className="text-[11px] text-stone-500">
                  Sequential Progression
                </span>
              </div>

              <div className="space-y-2">
                {stages.map((stage) => {
                  const isCompletedStage = stage.is_completed
                  const isCurrentStage = stage.is_current
                  const isUnlockedStage = stage.is_unlocked

                  return (
                    <div
                      key={stage.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCompletedStage
                          ? 'bg-emerald-50/50 border-emerald-200 text-stone-800'
                          : isCurrentStage
                          ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-200/50 text-stone-900'
                          : isUnlockedStage
                          ? 'bg-white border-stone-200 text-stone-800'
                          : 'bg-stone-50/80 border-stone-200 opacity-60 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status Icon */}
                        <div className="shrink-0">
                          {isCompletedStage ? (
                            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : isCurrentStage ? (
                            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-pixel font-bold text-xs flex items-center justify-center shadow-xs">
                              #{stage.stage_order}
                            </div>
                          ) : isUnlockedStage ? (
                            <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 font-pixel font-bold text-xs flex items-center justify-center">
                              #{stage.stage_order}
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-400 flex items-center justify-center">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm truncate">
                              {stage.title}
                            </h4>
                            {isCurrentStage && (
                              <span className="px-2 py-0.2 bg-purple-600 text-white rounded-md text-[9px] font-pixel uppercase font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          {stage.instructions && (
                            <p className="text-[11px] text-stone-500 line-clamp-1">
                              {stage.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <span className="flex items-center gap-1 text-[10px] font-mono text-amber-600 font-bold">
                          <Zap className="w-3 h-3" />+{stage.xp_reward} XP
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold font-pixel uppercase text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Back to Catalog
            </button>

            <button
              type="button"
              onClick={() => onStartOrContinue(project)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-pixel uppercase text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>
                {isCompleted
                  ? 'Review Project'
                  : isStarted
                  ? `Continue Stage #${currentStageOrder}`
                  : 'Start Project'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
