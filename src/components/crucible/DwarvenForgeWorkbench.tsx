import React from 'react'
import { ArrowLeft, Clock, Lock, CheckCircle2, Hammer, Zap, Star, Tag } from 'lucide-react'
import { GuidedProjectBuilderWorkspace } from '../guidedProjects/GuidedProjectBuilderWorkspace'
import { C, difficultyLabel } from './crucibleTokens'
import type { GuidedProject } from '../../lib/guidedProjects'

/* ─────────────────────────────────────────────────────────────
   StageAnvilTrack — Horizontal milestone stepper
───────────────────────────────────────────────────────────────── */
interface StageAnvilTrackProps {
  stages: Array<{
    id: string
    title: string
    order_index: number
    status: 'locked' | 'in_progress' | 'completed'
    is_completed: boolean
  }>
  activeStageId?: string | null
  onSelectStage?: (id: string) => void
}

export const StageAnvilTrack: React.FC<StageAnvilTrackProps> = ({ stages, activeStageId, onSelectStage }) => (
  <div className="flex items-center gap-0 overflow-x-auto py-2 px-1">
    {stages.map((stage, i) => {
      const isActive = stage.id === activeStageId
      const isDone = stage.is_completed || stage.status === 'completed'
      const isInProgress = !isDone && stage.status === 'in_progress'
      const isLocked = stage.status === 'locked'

      return (
        <React.Fragment key={stage.id}>
          {/* Connector line */}
          {i > 0 && (
            <div className="w-8 h-px shrink-0" style={{
              background: isDone
                ? `linear-gradient(90deg, ${C.gold}, ${C.gold})`
                : `linear-gradient(90deg, ${C.border}, ${C.border})`,
            }} />
          )}

          {/* Anvil node */}
          <button
            type="button"
            onClick={() => !isLocked && onSelectStage?.(stage.id)}
            disabled={isLocked}
            className="shrink-0 flex flex-col items-center gap-1.5 group transition-all"
            title={stage.title}
          >
            {/* Anvil icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all ${isInProgress ? 'animate-pulse' : ''}`}
              style={{
                background: isDone
                  ? 'linear-gradient(135deg, rgba(197,155,39,0.35), rgba(120,78,16,0.25))'
                  : isInProgress
                  ? C.crimsonDim
                  : 'rgba(20,12,12,0.7)',
                border: isDone
                  ? `1.5px solid ${C.gold}`
                  : isInProgress
                  ? `1.5px solid ${C.crimson}`
                  : `1px solid ${C.border}`,
                boxShadow: isDone
                  ? `0 0 12px rgba(197,155,39,0.3)`
                  : isInProgress
                  ? `0 0 14px rgba(220,38,38,0.35), 0 0 0 3px ${isActive ? 'rgba(220,38,38,0.15)' : 'transparent'}`
                  : 'none',
                cursor: isLocked ? 'not-allowed' : 'pointer',
              }}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: C.goldBright }} />
              ) : isInProgress ? (
                <Hammer className="w-5 h-5" style={{ color: C.crimson }} />
              ) : (
                <Lock className="w-4 h-4" style={{ color: C.textMuted }} />
              )}
            </div>
            {/* Stage label */}
            <span
              className="text-[9px] text-center max-w-[64px] leading-tight font-bold"
              style={{
                fontFamily: "'Cinzel', serif",
                color: isDone ? C.goldBright : isInProgress ? C.crimson : C.textMuted,
              }}
            >
              {stage.title.length > 14 ? stage.title.slice(0, 12) + '…' : stage.title}
            </span>
          </button>
        </React.Fragment>
      )
    })}
  </div>
)

/* ─────────────────────────────────────────────────────────────
   DwarvenForgeWorkbench — Full guided project shell
───────────────────────────────────────────────────────────────── */
interface DwarvenForgeWorkbenchProps {
  projectId: string
  project?: GuidedProject | null
  onBack: () => void
}

export const DwarvenForgeWorkbench: React.FC<DwarvenForgeWorkbenchProps> = ({ projectId, project, onBack }) => {
  const diffLabel = difficultyLabel(project?.difficulty ?? '')

  return (
    <div className="flex flex-col min-h-screen" style={{ color: C.textPrimary }}>

      {/* ═══════════════════════════════════
          FORGE HEADER — Blueprint overview
      ═══════════════════════════════════ */}
      <div
        className="px-6 py-4 flex flex-col gap-3"
        style={{ background: '#0B0808', borderBottom: `1px solid ${C.border}`, boxShadow: `0 2px 20px rgba(0,0,0,0.6)` }}
      >
        {/* Back + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = C.textSecondary)}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            The Dwarven Forge
          </button>
          <span style={{ color: C.textMuted }}>›</span>
          <span className="text-xs font-bold" style={{ color: C.textPrimary, fontFamily: "'Cinzel', serif" }}>
            {project?.title ?? 'Loading Blueprint…'}
          </span>
        </div>

        {project && (
          <div className="flex items-start gap-4 flex-wrap">
            {/* Forge icon / left accent */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(120,78,16,0.4), rgba(197,155,39,0.15))', border: `1px solid ${C.borderGold}` }}>
              <Hammer className="w-6 h-6" style={{ color: C.goldBright }} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title + difficulty */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>
                  {project.title}
                </h1>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold"
                  style={{ background: C.crimsonDim, color: C.crimson, fontFamily: "'Cinzel', serif", border: `1px solid ${C.borderHot}` }}>
                  {diffLabel}
                </span>
                {project.estimated_hours && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px]"
                    style={{ background: 'rgba(20,12,12,0.6)', color: C.textSecondary, border: `1px solid ${C.border}` }}>
                    <Clock className="w-2.5 h-2.5" />
                    {project.estimated_hours}h estimated
                  </span>
                )}
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-xs leading-relaxed max-w-2xl" style={{ color: C.textSecondary }}>
                  {project.description}
                </p>
              )}

              {/* Skills gained badges */}
              {project.skills_gained && project.skills_gained.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <Tag className="w-3 h-3 shrink-0" style={{ color: C.gold }} />
                  {project.skills_gained.map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(120,78,16,0.3), rgba(197,155,39,0.1))',
                        color: C.goldBright,
                        border: `1px solid ${C.borderGold}`,
                        fontFamily: "'Cinzel', serif",
                      }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Prerequisites */}
              {project.prerequisites && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Zap className="w-3 h-3" style={{ color: C.frost }} />
                  <span className="text-[10px]" style={{ color: C.frost }}>
                    Requires Mastery of: {project.prerequisites}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════
          FORGE WORKBENCH — Existing builder
          (full logic preserved, reskin only)
      ═══════════════════════════════════ */}
      <div className="flex-1" style={{ background: C.bg }}>
        <GuidedProjectBuilderWorkspace projectId={projectId} onBack={onBack} />
      </div>
    </div>
  )
}
