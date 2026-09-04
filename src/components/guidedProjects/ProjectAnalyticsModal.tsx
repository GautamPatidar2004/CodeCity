import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  BarChart3,
  Users,
  CheckCircle2,
  Percent,
  Layers,
  TrendingDown,
} from 'lucide-react'
import { type ProjectAnalyticsItem } from '../../lib/guidedProjects'

interface ProjectAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  projectAnalytics: ProjectAnalyticsItem | null
}

export const ProjectAnalyticsModal: React.FC<ProjectAnalyticsModalProps> = ({
  isOpen,
  onClose,
  projectAnalytics,
}) => {
  if (!isOpen || !projectAnalytics) return null

  const funnel = projectAnalytics.stage_funnel || []
  const totalStarts = projectAnalytics.starts_count || 0

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border-2 border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-stone-900 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                <BarChart3 className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-pixel uppercase font-bold px-2 py-0.5 rounded-md bg-white/20 text-stone-200">
                    Project Analytics
                  </span>
                  <span className="text-[10px] font-pixel uppercase font-bold px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 border border-purple-400/30 capitalize">
                    {projectAnalytics.difficulty}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold font-pixel uppercase text-white mt-0.5">
                  {projectAnalytics.title}
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
          <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-pixel uppercase font-bold text-[10px]">Total Starts</span>
                </div>
                <div className="text-xl font-bold font-mono text-stone-900">
                  {projectAnalytics.starts_count}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-pixel uppercase font-bold text-[10px]">Completions</span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-800">
                  {projectAnalytics.completions_count}
                </div>
              </div>

              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-700 text-xs">
                  <Percent className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-pixel uppercase font-bold text-[10px]">Completion Rate</span>
                </div>
                <div className="text-xl font-bold font-mono text-purple-800">
                  {projectAnalytics.completion_rate}%
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 text-xs">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-pixel uppercase font-bold text-[10px]">Avg Stage Reached</span>
                </div>
                <div className="text-xl font-bold font-mono text-amber-800">
                  Stage {projectAnalytics.avg_stage_reached}
                </div>
              </div>
            </div>

            {/* Stage Drop-Off Funnel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-xs uppercase font-bold text-stone-900 tracking-wide">
                  Stage Progression Funnel
                </h3>
                <span className="text-[11px] text-stone-500 font-mono">
                  {funnel.length} Stages Configured
                </span>
              </div>

              {funnel.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
                  No stage progression data recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {funnel.map((stage, idx) => {
                    const retentionPct = totalStarts > 0 ? Math.round((stage.reached_count / totalStarts) * 100) : 0
                    const prevStage = idx > 0 ? funnel[idx - 1] : null
                    const dropOffCount = prevStage ? Math.max(0, prevStage.reached_count - stage.reached_count) : 0

                    return (
                      <div
                        key={stage.stage_id}
                        className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-stone-800 text-white font-pixel font-bold text-[11px] flex items-center justify-center shrink-0">
                              #{stage.stage_order}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                              {stage.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                            <span className="text-stone-500">
                              <strong className="text-stone-800">{stage.reached_count}</strong> reached
                            </span>
                            <span className="text-emerald-600">
                              <strong className="text-emerald-700">{stage.completed_count}</strong> passed
                            </span>
                            <span className="text-purple-600 font-bold">
                              {stage.pass_rate}% pass rate
                            </span>
                          </div>
                        </div>

                        {/* Progression Visual Bar */}
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(4, retentionPct)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                            <span>{retentionPct}% student retention</span>
                            {dropOffCount > 0 && (
                              <span className="text-rose-500 flex items-center gap-0.5">
                                <TrendingDown className="w-3 h-3" /> {dropOffCount} dropped off
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-pixel uppercase font-bold transition-colors cursor-pointer"
            >
              Close Analytics
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
