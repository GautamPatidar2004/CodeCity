import React, { useState, useEffect, useCallback, useRef } from 'react'
import '../../lib/monaco'
import Editor from '@monaco-editor/react'
import confetti from 'canvas-confetti'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lock,
  Play,
  RotateCcw,
  Save,
  Terminal,
  Zap,
  AlertCircle,
  Loader2,
  FileCode2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Trophy,
  Share2,
  Code,
  Check,
  Flame,
  Clock,
  HelpCircle,
  Target,
  ListChecks,
  CheckCircle,
} from 'lucide-react'
import {
  startOrResumeProject,
  saveStudentStageCode,
  submitAndValidateStage,
  awardProjectRewards,
  createProjectCommunityShowcase,
  getStageTestCases,
  type StudentStageView,
  type StageSubmissionResult,
  type ProjectRewardResult,
  type GuidedProject,
} from '../../lib/guidedProjects'
import { getStageGuide } from '../../lib/guidedProjectValidation'
import { executeCode } from '../../lib/execution'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'

interface GuidedProjectBuilderWorkspaceProps {
  projectId: string
  onBack: () => void
}

export const GuidedProjectBuilderWorkspace: React.FC<GuidedProjectBuilderWorkspaceProps> = ({
  projectId,
  onBack,
}) => {
  const { user } = useAuth()
  const userId = user?.id

  // Workspace State
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<GuidedProject | null>(null)
  const [stages, setStages] = useState<StudentStageView[]>([])
  const [activeStage, setActiveStage] = useState<StudentStageView | null>(null)
  const loadedKeyRef = useRef<string | null>(null)

  // Code & Editor State
  const [code, setCode] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef<any>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Execution / Terminal / Validation State
  const [activeBottomTab, setActiveBottomTab] = useState<'tests' | 'terminal'>('tests')
  const [isRunningQuickCode, setIsRunningQuickCode] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<{
    stdout: string
    stderr: string
    status: string
  } | null>(null)
  const [isRunningValidation, setIsRunningValidation] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<StageSubmissionResult | null>(null)
  const [projectCompleted, setProjectCompleted] = useState(false)

  // Reward and Showcase State
  const [earnedRewards, setEarnedRewards] = useState<ProjectRewardResult | null>(null)
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false)
  const [showcaseText, setShowcaseText] = useState('')
  const [isPostingShowcase, setIsPostingShowcase] = useState(false)
  const [showcaseSubmitted, setShowcaseSubmitted] = useState(false)

  // Load project workspace and student progress
  const loadWorkspace = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return

      const currentKey = `${projectId}:${userId}`
      if (!forceRefresh && loadedKeyRef.current === currentKey) {
        // Tab switch / refocus: Preserve active editor state without reloading or wiping!
        return
      }

      if (!loadedKeyRef.current) {
        setLoading(true)
      }

      try {
        const res = await startOrResumeProject(projectId, userId)

        if (res.error || !res.stages || res.stages.length === 0) {
          toast.error(res.error || 'Unable to load project workspace.')
          setLoading(false)
          return
        }

        loadedKeyRef.current = currentKey
        if (res.project) {
          setProject(res.project)
        }
        setStages(res.stages)

        // Set initial active stage only if not already actively working on a stage
        setActiveStage((prevActive) => {
          if (prevActive && res.stages.some((s) => s.id === prevActive.id)) {
            return prevActive
          }
          const current = res.currentStage || res.stages.find((s) => s.is_current) || res.stages[0]
          const guide = getStageGuide(projectId, current.stage_order, current.title, current.instructions)
          const savedDraft = localStorage.getItem(`draft_${userId}_${projectId}_${current.id}`)
          const initialCode =
            savedDraft ||
            current.student_code ||
            guide.suggestedStarterCode ||
            current.starter_code ||
            ''
          setCode(initialCode)
          return current
        })
      } catch (err: any) {
        console.error('Failed to load project workspace:', err)
        toast.error('Network error loading workspace.')
      } finally {
        setLoading(false)
      }
    },
    [projectId, userId]
  )

  useEffect(() => {
    loadWorkspace()
  }, [loadWorkspace])

  // Clear auto-save debounce timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  // Auto layout on visibilitychange or resize
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        editorRef.current?.layout()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      editorRef.current?.layout()
    }, 150)
    return () => clearTimeout(timer)
  }, [activeStage?.id])

  useEffect(() => {
    if (!editorContainerRef.current) return
    const observer = new ResizeObserver(() => {
      editorRef.current?.layout()
    })
    observer.observe(editorContainerRef.current)
    return () => observer.disconnect()
  }, [])

  // Save Code to DB and LocalStorage
  const handleSaveCode = useCallback(
    async (codeToSave: string, showNotification = false) => {
      if (!userId || !activeStage) return
      setIsSaving(true)

      // Save locally immediately
      localStorage.setItem(`draft_${userId}_${projectId}_${activeStage.id}`, codeToSave)

      try {
        const res = await saveStudentStageCode(userId, projectId, activeStage.id, codeToSave)
        if (res.success) {
          setLastSavedTime(new Date())
          if (showNotification) {
            toast.success('Draft saved successfully!')
          }
        }
      } catch (err) {
        console.error('Failed to persist stage code to cloud:', err)
      } finally {
        setIsSaving(false)
      }
    },
    [userId, projectId, activeStage]
  )

  // Debounced auto-save when student modifies code
  const handleCodeChange = (newCode?: string) => {
    const val = newCode || ''
    setCode(val)

    if (userId && activeStage) {
      localStorage.setItem(`draft_${userId}_${projectId}_${activeStage.id}`, val)
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveCode(val, false)
    }, 1500)
  }

  // Switch Active Stage with Locking Enforcement and Draft Preservation
  const handleSelectStage = (targetStage: StudentStageView) => {
    if (!targetStage.is_unlocked) {
      toast.error(
        `Stage #${targetStage.stage_order} is locked. Complete Stage #${targetStage.stage_order - 1} first!`,
        { icon: '🔒' }
      )
      return
    }

    // Auto-save current stage first
    if (activeStage && code !== activeStage.student_code) {
      handleSaveCode(code, false)
    }

    const guide = getStageGuide(projectId, targetStage.stage_order, targetStage.title, targetStage.instructions)
    const savedDraft = userId ? localStorage.getItem(`draft_${userId}_${projectId}_${targetStage.id}`) : null
    const stageCode =
      savedDraft ||
      targetStage.student_code ||
      guide.suggestedStarterCode ||
      targetStage.starter_code ||
      ''

    setActiveStage(targetStage)
    setCode(stageCode)
    setSubmissionResult(null)
    setTerminalOutput(null)
  }

  // Reset to Starter Code
  const handleResetCode = () => {
    if (!activeStage) return
    const confirmReset = window.confirm(
      'Are you sure you want to reset to the original starter template? Unsaved changes in this stage will be replaced.'
    )
    if (confirmReset) {
      const guide = getStageGuide(projectId, activeStage.stage_order, activeStage.title, activeStage.instructions)
      const resetVal = guide.suggestedStarterCode || activeStage.starter_code || ''
      setCode(resetVal)
      handleSaveCode(resetVal, true)
    }
  }

  // Quick Run in Sandbox Terminal
  const handleQuickRun = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before running.')
      return
    }

    setIsRunningQuickCode(true)
    setActiveBottomTab('terminal')

    try {
      const exec = await executeCode('javascript', code, '')
      setTerminalOutput({
        stdout: exec.stdout || '',
        stderr: exec.stderr || '',
        status: exec.status,
      })
    } catch (err: any) {
      setTerminalOutput({
        stdout: '',
        stderr: err?.message || 'Execution error.',
        status: 'error',
      })
    } finally {
      setIsRunningQuickCode(false)
    }
  }

  // Run / Check Code Action — Authoritative Server Validation
  const handleRunCheck = async () => {
    if (!userId || !activeStage) return
    if (isRunningValidation) return

    setIsRunningValidation(true)
    setActiveBottomTab('tests')

    // Save draft locally first
    await handleSaveCode(code, false)

    try {
      const res = await submitAndValidateStage({
        userId,
        projectId,
        stageId: activeStage.id,
        code,
        language: 'javascript',
      })

      setSubmissionResult(res)

      if (res.passed) {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.7 },
        })

        // Refresh stages & progression state without full reload
        const refreshed = await startOrResumeProject(projectId, userId)
        if (refreshed.stages) {
          setStages(refreshed.stages)
        }

        if (res.projectCompleted) {
          setProjectCompleted(true)
          toast.success('Guided Project Completed! 🎉 All stages mastered.', {
            duration: 5000,
          })

          // Authoritatively award completion rewards (XP + Badge)
          awardProjectRewards(userId, projectId).then((rewardRes) => {
            if (rewardRes.success) {
              setEarnedRewards(rewardRes)
            }
          })
        } else {
          toast.success('Stage Passed! Next stage unlocked.', {
            duration: 4000,
          })
        }
      } else {
        if (res.error) {
          toast.error(res.error)
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error running test validation.')
    } finally {
      setIsRunningValidation(false)
    }
  }

  // Handle advancing to next stage
  const handleNextStage = () => {
    if (!activeStage) return
    const nextStage = stages.find((s) => s.stage_order === activeStage.stage_order + 1)
    if (nextStage && nextStage.is_unlocked) {
      const guide = getStageGuide(projectId, nextStage.stage_order, nextStage.title, nextStage.instructions)
      const savedDraft = userId ? localStorage.getItem(`draft_${userId}_${projectId}_${nextStage.id}`) : null
      const nextCode =
        savedDraft ||
        nextStage.student_code ||
        guide.suggestedStarterCode ||
        nextStage.starter_code ||
        ''

      setActiveStage(nextStage)
      setCode(nextCode)
      setSubmissionResult(null)
      setTerminalOutput(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-xs font-pixel uppercase font-bold text-stone-500">
          Entering Project Builder Workspace...
        </p>
      </div>
    )
  }

  if (!activeStage) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <h3 className="font-pixel text-sm uppercase font-bold text-stone-700">
          Project Workspace Unavailable
        </h3>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer hover:bg-stone-700 transition-colors"
        >
          Return to Projects
        </button>
      </div>
    )
  }

  // Retrieve rich guide for active stage
  const stageGuide = getStageGuide(
    projectId,
    activeStage.stage_order,
    activeStage.title,
    activeStage.instructions
  )

  const testCases = getStageTestCases(activeStage.validation_config)
  const totalStages = stages.length
  const completedStagesCount = stages.filter((s) => s.is_completed).length
  const progressPercent = totalStages > 0 ? Math.round((completedStagesCount / totalStages) * 100) : 0

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'advanced':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      default:
        return 'bg-purple-100 text-purple-800 border-purple-300'
    }
  }

  const hasNextUnlockedStage = Boolean(
    stages.find((s) => s.stage_order === activeStage.stage_order + 1)?.is_unlocked
  )

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto flex flex-col gap-4 font-sans select-none pb-12">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & PROJECT PROGRESS BAR                         */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col gap-3">
        {/* Row 1: Back, Title, Badges, Auto-save & XP */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-pixel uppercase text-[11px] font-bold transition-colors cursor-pointer shrink-0 border border-stone-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Projects</span>
            </button>

            <div className="h-4 w-px bg-stone-200 shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
              <h1 className="text-base sm:text-lg font-extrabold text-stone-900 truncate font-sans">
                {project?.title || 'Guided Project'}
              </h1>
              {project?.difficulty && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md font-pixel uppercase text-[10px] font-bold border ${getDifficultyColor(
                    project.difficulty
                  )}`}
                >
                  {project.difficulty}
                </span>
              )}
              {project?.estimated_minutes && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-500">
                  <Clock className="w-3 h-3 text-stone-400" />
                  {project.estimated_minutes}m
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Auto-save status */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-purple-600" />
                  <span>Saving draft...</span>
                </>
              ) : lastSavedTime ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Draft saved</span>
                </>
              ) : null}
            </div>

            {/* Stage XP Badge */}
            <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-pixel text-xs font-bold shadow-xs">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>+{activeStage.xp_reward} XP</span>
            </span>
          </div>
        </div>

        {/* Row 2: Progress Bar & Current Stage Indicator */}
        <div className="flex items-center gap-3 pt-1 border-t border-stone-100 text-xs">
          <span className="font-bold text-stone-700 font-pixel text-[11px] uppercase shrink-0">
            Stage {activeStage.stage_order} of {totalStages}
          </span>
          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-stone-500 shrink-0">
            {completedStagesCount}/{totalStages} Mastered ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN 2-COLUMN WORKSPACE: ROADMAP (LEFT) | CODING (RIGHT)   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full min-w-0">
        {/* ── LEFT COLUMN: STAGE NAVIGATION / ROADMAP (3-4 Cols) ──── */}
        <div className="lg:col-span-4 xl:col-span-3 min-w-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-pixel uppercase font-bold text-stone-700 tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-purple-600" />
                <span>Mission Roadmap</span>
              </span>
              <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md font-bold">
                {stages.length} Stages
              </span>
            </div>

            {/* Scrollable Stage Navigation Tree */}
            <div className="max-h-[580px] overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
              {stages.map((st) => {
                const isSelected = activeStage.id === st.id
                const isCompleted = st.is_completed
                const isUnlocked = st.is_unlocked

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectStage(st)}
                    disabled={!isUnlocked}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-50 border-purple-300 shadow-xs text-purple-950'
                        : isCompleted
                        ? 'bg-emerald-50/70 border-emerald-200 text-stone-800 hover:bg-emerald-50'
                        : isUnlocked
                        ? 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                        : 'bg-stone-50/50 border-stone-100 text-stone-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {/* Stage icon indicator */}
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : !isUnlocked ? (
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                      ) : isSelected ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-purple-600 ring-2 ring-purple-200" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-400" />
                      )}
                    </div>

                    {/* Stage Title and Status */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`font-pixel text-[10px] font-bold uppercase ${
                            isSelected
                              ? 'text-purple-700'
                              : isCompleted
                              ? 'text-emerald-700'
                              : 'text-stone-500'
                          }`}
                        >
                          Stage {st.stage_order}
                        </span>
                        <span className="text-[10px] font-mono text-amber-600 font-bold shrink-0">
                          +{st.xp_reward} XP
                        </span>
                      </div>
                      <div className="text-xs font-sans font-medium truncate text-stone-800 mt-0.5">
                        {st.title}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: LEARNING WORKSPACE (8-9 Cols) ────────── */}
        <div className="lg:col-span-8 xl:col-span-9 min-w-0 flex flex-col gap-4">
          {/* A. STAGE BRIEFING & INSTRUCTIONS CARD */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-pixel text-[10px] font-bold uppercase border border-purple-200">
                    Stage {activeStage.stage_order} • Mission Brief
                  </span>
                  {activeStage.is_completed && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-pixel text-[10px] font-bold uppercase border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Mastered
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-stone-900 font-sans">
                  {stageGuide.title || activeStage.title}
                </h2>
              </div>
            </div>

            {/* 1. What are you building? (Mission) */}
            <div className="space-y-1">
              <div className="font-pixel text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-600" />
                <span>1. What Are You Building?</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 font-medium pl-5 leading-relaxed">
                {stageGuide.mission}
              </p>
            </div>

            {/* 2. Your Task */}
            <div className="space-y-1">
              <div className="font-pixel text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Your Task</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed font-sans">
                {stageGuide.task}
              </div>
            </div>

            {/* 3. Requirements Checklist */}
            <div className="space-y-1.5">
              <div className="font-pixel text-[10px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Requirements Checklist</span>
              </div>
              <ul className="space-y-1 text-xs text-stone-700 pl-5">
                {stageGuide.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4 & 5. Expected Behavior & Success Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                <div className="font-pixel text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                  4. What Should Happen?
                </div>
                <p className="text-[11px] text-indigo-900 leading-relaxed">
                  {stageGuide.expectedBehavior}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                <div className="font-pixel text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>5. How Do I Know I'm Done?</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  {stageGuide.successCondition}
                </p>
              </div>
            </div>

            {/* Test Requirements Preview */}
            {testCases.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-purple-600" />
                    <span>Validation Test Assertions ({testCases.length})</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-stone-500 uppercase font-pixel font-bold">
                        <span>Assertion #{idx + 1}</span>
                        {tc.is_hidden ? (
                          <span className="flex items-center gap-1 text-purple-600">
                            <EyeOff className="w-3 h-3" /> Hidden Test
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Eye className="w-3 h-3" /> Public Test
                          </span>
                        )}
                      </div>

                      {!tc.is_hidden ? (
                        <div className="space-y-1 text-[11px] pt-0.5">
                          {tc.input && (
                            <div className="flex items-start gap-1.5 text-stone-600 bg-white p-1 rounded border border-stone-200">
                              <span className="text-stone-400 font-bold shrink-0">In:</span>
                              <span className="truncate">{tc.input}</span>
                            </div>
                          )}
                          <div className="flex items-start gap-1.5 text-emerald-700 bg-emerald-50/80 p-1 rounded border border-emerald-200">
                            <span className="text-emerald-500 font-bold shrink-0">Exp:</span>
                            <span className="font-bold truncate">{tc.expected_output}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-stone-400 italic pt-0.5">
                          Evaluated securely during validation.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* B. CODE EDITOR CARD */}
          <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-stone-800 shadow-md flex flex-col min-w-0">
            {/* Editor Header */}
            <div className="h-10 px-4 bg-[#252526] border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-stone-200 font-bold">solution.js</span>
                <span className="text-[10px] text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">
                  JavaScript (ES6+)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCode}
                  className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 cursor-pointer px-2 py-1 rounded hover:bg-stone-800 transition-colors"
                  title="Reset editor to initial starter template"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveCode(code, true)}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-pixel uppercase font-bold cursor-pointer transition-colors border border-stone-700"
                >
                  <Save className="w-3 h-3 text-purple-400" />
                  <span>Save Draft</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor Container with explicit guaranteed height */}
            <div
              ref={editorContainerRef}
              className="w-full relative min-h-[340px] h-[380px] sm:h-[420px] lg:h-[460px] bg-[#1e1e1e]"
            >
              <Editor
                height="100%"
                defaultLanguage="javascript"
                language="javascript"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                onMount={(editor) => {
                  editorRef.current = editor
                  editor.layout()
                }}
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Editor Action Bar */}
            <div className="p-3 bg-[#181818] border-t border-stone-800 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-[11px] text-stone-400 font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="hidden sm:inline">
                  Pass all assertions to unlock next stage
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Advance to next stage CTA button (when passed) */}
                {hasNextUnlockedStage && (
                  <button
                    type="button"
                    onClick={handleNextStage}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel uppercase text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <span>Next Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Quick Run Code (Sandbox Terminal) */}
                <button
                  type="button"
                  onClick={handleQuickRun}
                  disabled={isRunningQuickCode || isRunningValidation}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-pixel uppercase text-xs font-bold rounded-xl transition-all cursor-pointer border border-stone-700 disabled:opacity-50"
                >
                  {isRunningQuickCode ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>Run Code</span>
                </button>

                {/* Authoritative Check Solution */}
                <button
                  type="button"
                  onClick={handleRunCheck}
                  disabled={isRunningValidation || isRunningQuickCode}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-pixel uppercase text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isRunningValidation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Run & Check Solution</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* C. OUTPUT & TEST RESULTS PANEL (Always visible below the editor) */}
          <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col min-w-0">
            {/* Output Tabs Header */}
            <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab('tests')}
                  className={`px-3 py-1 rounded-lg font-pixel uppercase text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeBottomTab === 'tests'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 bg-stone-200/60'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Test Results</span>
                  {submissionResult && (
                    <span className="ml-1 text-[9px] opacity-90">
                      ({submissionResult.testResults.filter((t) => t.passed).length}/
                      {submissionResult.testResults.length})
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBottomTab('terminal')}
                  className={`px-3 py-1 rounded-lg font-pixel uppercase text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeBottomTab === 'terminal'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 bg-stone-200/60'
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Terminal Console</span>
                </button>
              </div>

              {submissionResult?.unlockedNextStage && (
                <button
                  type="button"
                  onClick={handleNextStage}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-pixel uppercase text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                >
                  <span>Advance to Stage {activeStage.stage_order + 1}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Output Body Container with internal scrolling */}
            <div className="p-4 min-h-[140px] max-h-[260px] overflow-y-auto font-mono text-xs">
              {activeBottomTab === 'tests' ? (
                isRunningValidation ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-purple-600 font-pixel text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>EVALUATING TEST CASES...</span>
                  </div>
                ) : submissionResult ? (
                  <div className="space-y-3">
                    {/* Overall Status Banner */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-pixel uppercase font-bold ${
                        submissionResult.passed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-rose-50 border-rose-300 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {submissionResult.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span>
                          {submissionResult.passed
                            ? `ACCEPTED • ALL ${submissionResult.testResults.length} TEST ASSERTIONS PASSED`
                            : `VALIDATION FAILED • ${
                                submissionResult.testResults.filter((t) => t.passed).length
                              }/${submissionResult.testResults.length} PASSED`}
                        </span>
                      </div>
                    </div>

                    {/* Test Case Breakdown */}
                    <div className="space-y-2">
                      {submissionResult.testResults.map((tr) => (
                        <div
                          key={tr.orderIndex}
                          className={`p-2.5 rounded-xl border flex flex-col gap-1.5 font-mono text-[11px] ${
                            tr.passed
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50/50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold">
                              {tr.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              )}
                              <span>Assertion #{tr.orderIndex}</span>
                            </div>
                            {tr.isHidden && (
                              <span className="text-[10px] text-stone-500 font-sans">
                                Hidden Test
                              </span>
                            )}
                          </div>

                          {tr.error && (
                            <div className="text-rose-600 font-sans text-xs mt-0.5">
                              {tr.error}
                            </div>
                          )}

                          {!tr.isHidden && !tr.passed && (
                            <div className="grid grid-cols-2 gap-2 mt-1 text-[10px] bg-white p-2 rounded-lg border border-rose-200">
                              <div>
                                <span className="text-stone-500 block font-bold">Expected:</span>
                                <span className="text-emerald-700 font-bold">
                                  {tr.expectedOutput}
                                </span>
                              </div>
                              <div>
                                <span className="text-stone-500 block font-bold">Actual:</span>
                                <span className="text-rose-700 font-bold">
                                  {tr.actualOutput || '(no output)'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-stone-500 text-xs font-mono">
                    <HelpCircle className="w-5 h-5 mx-auto text-stone-400 mb-1" />
                    <span>
                      Ready to test. Click "Run Code" to test in the terminal or "Run & Check Solution" to validate.
                    </span>
                  </div>
                )
              ) : isRunningQuickCode ? (
                <div className="flex items-center justify-center py-6 gap-2 text-purple-600 font-pixel text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>EXECUTING JAVASCRIPT IN SANDBOX...</span>
                </div>
              ) : terminalOutput ? (
                <div className="space-y-2 text-xs">
                  {terminalOutput.stdout ? (
                    <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 font-mono text-stone-100 whitespace-pre-wrap">
                      {terminalOutput.stdout}
                    </div>
                  ) : (
                    !terminalOutput.stderr && (
                      <div className="text-stone-500 italic">
                        Program finished execution with no console output.
                      </div>
                    )
                  )}
                  {terminalOutput.stderr && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 font-mono text-rose-700 whitespace-pre-wrap">
                      {terminalOutput.stderr}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-stone-500 text-xs font-mono">
                  <Terminal className="w-5 h-5 mx-auto text-stone-400 mb-1" />
                  <span>Terminal ready. Click "Run Code" to execute solution in the sandbox.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. PROJECT MASTERED COMPLETION MODAL                         */}
      {/* ============================================================ */}
      {projectCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-pixel text-[10px] font-bold uppercase">
                Project Mastered!
              </span>
              <h2 className="text-xl font-bold font-pixel uppercase text-stone-900 mt-2">
                All Stages Completed!
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Congratulations! You have successfully mastered and verified all stages of this
                guided project.
              </p>

              {/* XP Awarded Pill */}
              {earnedRewards?.xp_awarded && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-amber-800 font-pixel text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>+{earnedRewards.xp_awarded} XP Earned</span>
                  </span>
                </div>
              )}

              {/* Badge Awarded Card */}
              {earnedRewards?.badge_awarded && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3 text-left mt-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                    {earnedRewards.badge_awarded.icon || '🏅'}
                  </div>
                  <div>
                    <div className="text-[10px] font-pixel uppercase font-bold text-indigo-700">
                      Badge Unlocked
                    </div>
                    <div className="text-xs font-bold text-stone-900">
                      {earnedRewards.badge_awarded.title}
                    </div>
                    {earnedRewards.badge_awarded.description && (
                      <div className="text-[10px] text-stone-500 line-clamp-1">
                        {earnedRewards.badge_awarded.description}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Showcase Section */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              {!showcaseSubmitted ? (
                !isShowcaseOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsShowcaseOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-pixel uppercase font-bold shadow-md cursor-pointer transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share to Community Showcase</span>
                  </button>
                ) : (
                  <div className="space-y-2 text-left animate-in fade-in duration-150">
                    <label className="text-[10px] font-pixel uppercase font-bold text-stone-600">
                      Showcase Reflection
                    </label>
                    <textarea
                      value={showcaseText}
                      onChange={(e) => setShowcaseText(e.target.value)}
                      placeholder="Share what you learned, your approach, or key takeaways..."
                      rows={3}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-emerald-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsShowcaseOpen(false)}
                        className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 font-pixel uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isPostingShowcase}
                        onClick={async () => {
                          if (!userId) return
                          setIsPostingShowcase(true)
                          const res = await createProjectCommunityShowcase(
                            userId,
                            projectId,
                            showcaseText
                          )
                          setIsPostingShowcase(false)
                          if (res.success) {
                            setShowcaseSubmitted(true)
                            setIsShowcaseOpen(false)
                            toast.success('Showcase shared to Community feed! 🎉')
                          } else {
                            toast.error(res.error || 'Failed to share showcase.')
                          }
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-pixel uppercase font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        {isPostingShowcase ? 'Publishing...' : 'Publish Post'}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="py-2 text-[11px] text-emerald-700 font-pixel uppercase font-bold flex items-center justify-center gap-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Shared to Community Showcase</span>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setProjectCompleted(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer transition-colors border border-stone-200"
              >
                Review Code
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer transition-colors shadow-md"
              >
                Return to Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
