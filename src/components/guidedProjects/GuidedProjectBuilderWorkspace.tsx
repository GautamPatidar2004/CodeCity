import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  X,
  Share2,
} from 'lucide-react'
import {
  startOrResumeProject,
  saveStudentStageCode,
  submitAndValidateStage,
  awardProjectRewards,
  createProjectCommunityShowcase,
  type StudentStageView,
  type StageSubmissionResult,
  type ProjectRewardResult,
} from '../../lib/guidedProjects'
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

  // Workspace State
  const [loading, setLoading] = useState(true)
  const [stages, setStages] = useState<StudentStageView[]>([])
  const [activeStage, setActiveStage] = useState<StudentStageView | null>(null)

  // Code State
  const [code, setCode] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Validation / Submission State
  const [isRunningValidation, setIsRunningValidation] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<StageSubmissionResult | null>(null)
  const [showResultsDrawer, setShowResultsDrawer] = useState(false)
  const [projectCompleted, setProjectCompleted] = useState(false)

  // Prompt 5: Reward and Showcase State
  const [earnedRewards, setEarnedRewards] = useState<ProjectRewardResult | null>(null)
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false)
  const [showcaseText, setShowcaseText] = useState('')
  const [isPostingShowcase, setIsPostingShowcase] = useState(false)
  const [showcaseSubmitted, setShowcaseSubmitted] = useState(false)

  // Load project workspace and student progress
  const loadWorkspace = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const res = await startOrResumeProject(projectId, user.id)

    if (res.error || !res.stages || res.stages.length === 0) {
      toast.error(res.error || 'Unable to load project workspace.')
      setLoading(false)
      return
    }

    setStages(res.stages)

    // Set initial active stage
    const current = res.currentStage || res.stages[0]
    setActiveStage(current)
    setCode(current.student_code || current.starter_code || '')
    setLoading(false)
  }, [projectId, user])

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

  // Save Code to DB
  const handleSaveCode = useCallback(
    async (codeToSave: string, showNotification = false) => {
      if (!user || !activeStage) return
      setIsSaving(true)
      try {
        const res = await saveStudentStageCode(user.id, projectId, activeStage.id, codeToSave)
        if (res.success) {
          setLastSavedTime(new Date())
          if (showNotification) {
            toast.success('Draft saved successfully!')
          }
        }
      } catch (err) {
        console.error('Failed to save stage code:', err)
      } finally {
        setIsSaving(false)
      }
    },
    [user, projectId, activeStage]
  )

  // Debounced auto-save when student modifies code
  const handleCodeChange = (newCode?: string) => {
    const val = newCode || ''
    setCode(val)

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveCode(val, false)
    }, 1500)
  }

  // Switch Active Stage with Locking Enforcement
  const handleSelectStage = (targetStage: StudentStageView) => {
    if (!targetStage.is_unlocked) {
      toast.error(
        `Stage #${targetStage.stage_order} is locked. Complete Stage #${targetStage.stage_order - 1} to unlock!`,
        { icon: '🔒' }
      )
      return
    }

    // Auto-save current stage first
    if (activeStage && code !== activeStage.student_code) {
      handleSaveCode(code, false)
    }

    setActiveStage(targetStage)
    setCode(targetStage.student_code || targetStage.starter_code || '')
  }

  // Reset to Starter Code
  const handleResetCode = () => {
    if (!activeStage) return
    const confirmReset = window.confirm(
      'Are you sure you want to reset to the original starter code? Unsaved changes will be replaced.'
    )
    if (confirmReset) {
      const resetVal = activeStage.starter_code || ''
      setCode(resetVal)
      handleSaveCode(resetVal, true)
    }
  }

  // Run / Check Code Action — Authoritative Server Validation
  const handleRunCheck = async () => {
    if (!user || !activeStage) return
    if (isRunningValidation) return

    setIsRunningValidation(true)
    setShowResultsDrawer(true)

    // Save draft locally first
    await handleSaveCode(code, false)

    try {
      const res = await submitAndValidateStage({
        userId: user.id,
        projectId,
        stageId: activeStage.id,
        code,
        language: 'javascript',
      })

      setSubmissionResult(res)

      if (res.passed) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
        })

        // Refresh stages & progression state
        const refreshed = await startOrResumeProject(projectId, user.id)
        if (refreshed.stages) {
          setStages(refreshed.stages)
        }

        if (res.projectCompleted) {
          setProjectCompleted(true)
          toast.success('Guided Project Completed! 🎉 All stages mastered.', {
            duration: 5000,
          })

          // Authoritatively award completion rewards (XP + Badge)
          awardProjectRewards(user.id, projectId).then((rewardRes) => {
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
      setShowResultsDrawer(false)
      setActiveStage(nextStage)
      setCode(nextStage.student_code || nextStage.starter_code || '')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-xs font-pixel uppercase font-bold text-stone-500">
          Entering Guided Workspace...
        </p>
      </div>
    )
  }

  if (!activeStage) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <h3 className="font-pixel text-sm uppercase font-bold text-stone-800">
          Project Workspace Unavailable
        </h3>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer"
        >
          Return to Projects
        </button>
      </div>
    )
  }

  const testCases = activeStage.validation_config?.test_cases || []
  const totalStages = stages.length

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 sm:-m-6 lg:-m-8 bg-stone-900 text-stone-100 overflow-hidden select-none">
      {/* 1. TOP WORKSPACE HEADER */}
      <header className="h-14 px-4 sm:px-6 bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between gap-4 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-pixel uppercase text-[10px] sm:text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Projects</span>
          </button>

          <div className="h-4 w-px bg-stone-700 shrink-0" />

          {/* Stage Progress Pills / Stepper */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {stages.map((st) => {
              const isSelected = activeStage.id === st.id
              const isCompleted = st.is_completed
              const isUnlocked = st.is_unlocked

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectStage(st)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-pixel uppercase font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md'
                      : isCompleted
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60'
                      : isUnlocked
                      ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      : 'bg-stone-900 text-stone-600 opacity-60 cursor-not-allowed'
                  }`}
                  title={!isUnlocked ? `Stage #${st.stage_order} is locked` : st.title}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : !isUnlocked ? (
                    <Lock className="w-3 h-3 text-stone-500" />
                  ) : null}
                  <span>Stage {st.stage_order}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Header Status */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Auto-save indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                <span>Saving...</span>
              </>
            ) : lastSavedTime ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Draft saved</span>
              </>
            ) : null}
          </div>

          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/50 border border-amber-500/40 rounded-xl text-amber-300 font-pixel text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>+{activeStage.xp_reward} XP</span>
          </span>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE SPLIT (Instructions Left | Editor Right) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANEL: Stage Instructions & Test Cases */}
        <div className="w-full md:w-[420px] lg:w-[460px] bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col overflow-y-auto shrink-0">
          <div className="p-6 space-y-6">
            {/* Stage Title Banner */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-pixel text-[10px] font-bold uppercase border border-purple-400/20">
                  Stage {activeStage.stage_order} of {totalStages}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-pixel text-[10px] font-bold uppercase border border-emerald-400/20">
                  I/O Test Suite
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-sans leading-snug">
                {activeStage.title}
              </h2>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h3 className="font-pixel text-xs uppercase font-bold text-stone-400 tracking-wider">
                Instructions & Goals
              </h3>
              <div className="p-4 bg-[#141414] rounded-2xl border border-[#2d2d2d] text-xs sm:text-sm text-stone-300 leading-relaxed font-sans whitespace-pre-line">
                {activeStage.instructions || 'Follow the starter code and solve the requirements.'}
              </div>
            </div>

            {/* Test Requirements Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-xs uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Validation Test Cases</span>
                </h3>
                <span className="text-[10px] font-mono text-stone-500">
                  {testCases.length} assertions
                </span>
              </div>

              <div className="space-y-2.5">
                {testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#141414] rounded-xl border border-[#2d2d2d] space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-stone-400 uppercase font-pixel font-bold">
                      <span>Test Case #{idx + 1}</span>
                      {tc.is_hidden ? (
                        <span className="flex items-center gap-1 text-purple-400">
                          <EyeOff className="w-3 h-3" /> Hidden Test
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Eye className="w-3 h-3" /> Public Test
                        </span>
                      )}
                    </div>

                    {!tc.is_hidden ? (
                      <div className="space-y-1 text-[11px]">
                        {tc.input && (
                          <div className="flex items-start gap-2 text-stone-400">
                            <span className="text-stone-500 shrink-0">Input:</span>
                            <span className="text-stone-200">{tc.input}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-emerald-400">
                          <span className="text-stone-500 shrink-0">Expected:</span>
                          <span className="text-emerald-300 font-bold">{tc.expected_output}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-stone-500 italic">
                        Input & expected outputs evaluated during execution.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Monaco Code Editor */}
        <div className="flex-1 flex flex-col bg-[#141414] overflow-hidden">
          {/* Editor Sub-Header */}
          <div className="h-10 px-4 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-stone-300 font-bold">solution.js</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetCode}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 hover:underline cursor-pointer"
                title="Reset editor to initial starter template"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Template</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveCode(code, true)}
                disabled={isSaving}
                className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-pixel uppercase font-bold cursor-pointer transition-colors"
              >
                <Save className="w-3 h-3 text-purple-400" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 w-full h-full relative">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
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

          {/* TEST RESULTS DRAWER */}
          {showResultsDrawer && (
            <div className="bg-[#181818] border-t-2 border-purple-500/50 p-4 flex flex-col gap-3 text-xs text-slate-300 max-h-[250px] overflow-y-auto animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isRunningValidation ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 font-pixel text-[10px] font-bold flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                      EXECUTING TEST SUITE...
                    </span>
                  ) : submissionResult?.passed ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-pixel text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ACCEPTED • ALL {submissionResult.testResults.length}/{submissionResult.testResults.length} TESTS PASSED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500/50 text-rose-300 font-pixel text-[10px] font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      TESTS FAILED • {submissionResult?.testResults.filter(t => t.passed).length || 0}/{submissionResult?.testResults.length || 0} PASSED
                    </span>
                  )}

                  {submissionResult?.unlockedNextStage && (
                    <button
                      type="button"
                      onClick={handleNextStage}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-pixel uppercase text-[10px] font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowResultsDrawer(false)}
                  className="text-stone-400 hover:text-white text-xs cursor-pointer font-mono"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Test Case Breakdown */}
              {submissionResult && submissionResult.testResults.length > 0 && (
                <div className="flex flex-col gap-2">
                  {submissionResult.testResults.map((tr) => (
                    <div
                      key={tr.orderIndex}
                      className={`p-2.5 rounded-xl border flex flex-col gap-1 font-mono text-[11px] ${
                        tr.passed
                          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {tr.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span className="font-bold">Test Case #{tr.orderIndex}</span>
                        </div>
                        {tr.isHidden && (
                          <span className="text-[10px] text-stone-400 font-sans">Hidden Test</span>
                        )}
                      </div>

                      {tr.error && (
                        <div className="text-rose-400 font-sans text-xs mt-0.5">
                          {tr.error}
                        </div>
                      )}

                      {!tr.isHidden && !tr.passed && (
                        <div className="grid grid-cols-2 gap-2 mt-1 text-[10px] bg-stone-900/60 p-2 rounded-lg">
                          <div>
                            <span className="text-stone-500 block">Expected:</span>
                            <span className="text-emerald-400 font-bold">{tr.expectedOutput}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block">Actual:</span>
                            <span className="text-rose-400 font-bold">{tr.actualOutput || '(no output)'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Editor Action Footer */}
          <div className="p-3 bg-[#181818] border-t border-[#2d2d2d] flex items-center justify-between gap-3">
            <div className="text-[11px] text-stone-400 font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Complete all stage test assertions to progress</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRunCheck}
                disabled={isRunningValidation}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-pixel uppercase text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isRunningValidation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run & Check Solution</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Completed Modal */}
      {projectCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-stone-900 border-2 border-purple-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-pixel text-[10px] font-bold uppercase">
                Project Mastered!
              </span>
              <h2 className="text-xl font-bold font-pixel uppercase text-white mt-2">
                All Stages Completed!
              </h2>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Congratulations! You have successfully mastered and verified all stages of this guided project.
              </p>

              {/* XP Awarded Pill */}
              {earnedRewards?.xp_awarded && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 border border-amber-500/50 rounded-full text-amber-300 font-pixel text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>+{earnedRewards.xp_awarded} XP Earned</span>
                  </span>
                </div>
              )}

              {/* Badge Awarded Card */}
              {earnedRewards?.badge_awarded && (
                <div className="p-3 bg-indigo-950/50 border border-indigo-500/40 rounded-xl flex items-center gap-3 text-left mt-2">
                  <div className="w-10 h-10 bg-indigo-900/80 rounded-lg flex items-center justify-center text-xl shrink-0">
                    {earnedRewards.badge_awarded.icon || '🏅'}
                  </div>
                  <div>
                    <div className="text-[10px] font-pixel uppercase font-bold text-indigo-400">Badge Unlocked</div>
                    <div className="text-xs font-bold text-white">{earnedRewards.badge_awarded.title}</div>
                    {earnedRewards.badge_awarded.description && (
                      <div className="text-[10px] text-stone-400 line-clamp-1">{earnedRewards.badge_awarded.description}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Showcase Section */}
            <div className="pt-2 border-t border-stone-800 space-y-2">
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
                    <label className="text-[10px] font-pixel uppercase font-bold text-stone-400">
                      Showcase Reflection
                    </label>
                    <textarea
                      value={showcaseText}
                      onChange={(e) => setShowcaseText(e.target.value)}
                      placeholder="Share what you learned, your approach, or key takeaways..."
                      rows={3}
                      className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-emerald-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsShowcaseOpen(false)}
                        className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 font-pixel uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isPostingShowcase}
                        onClick={async () => {
                          if (!user) return
                          setIsPostingShowcase(true)
                          const res = await createProjectCommunityShowcase(user.id, projectId, showcaseText)
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
                <div className="py-2 text-[11px] text-emerald-400 font-pixel uppercase font-bold flex items-center justify-center gap-1.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Shared to Community Showcase</span>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setProjectCompleted(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer transition-colors"
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
