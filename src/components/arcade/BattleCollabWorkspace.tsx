import React, { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import confetti from 'canvas-confetti'
import { toast } from 'react-hot-toast'
import {
  useBattleCollabWorkspace,
  submitBattleQuestSolution,
  type BattleExercise,
  type BattleTeamQuestProgress,
  type BattleSubmissionResult,
} from '../../lib/arcade'
import { useAuth } from '../../context/AuthContext'
import { AlexPixelAvatar } from '../brand/PixelArtAvatars'
import { GamifiedButton } from '../ui/GamifiedButton'
import {
  Code2,
  Users,
  RotateCcw,
  HelpCircle,
  Lightbulb,
  Loader2,
  Wifi,
  WifiOff,
  Save,
  Lock,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react'

interface BattleCollabWorkspaceProps {
  battleId: string
  teamId: string
  exercise: BattleExercise
  isLive: boolean
  progress?: BattleTeamQuestProgress
  onQuestCompleted?: (result: BattleSubmissionResult) => void
  onNextQuest?: () => void
}

// Normalize challenge language for Monaco Editor
function getMonacoLanguage(lang?: string): string {
  if (!lang) return 'javascript'
  const l = lang.toLowerCase()
  if (l.includes('py')) return 'python'
  if (l.includes('js') || l.includes('javascript')) return 'javascript'
  if (l.includes('ts') || l.includes('typescript')) return 'typescript'
  if (l.includes('c++') || l.includes('cpp')) return 'cpp'
  if (l.includes('java') && !l.includes('script')) return 'java'
  if (l.includes('c#') || l.includes('csharp')) return 'csharp'
  if (l.includes('html')) return 'html'
  if (l.includes('css')) return 'css'
  if (l.includes('sql')) return 'sql'
  if (l.includes('rust')) return 'rust'
  if (l.includes('go')) return 'go'
  return 'javascript'
}

export const BattleCollabWorkspace: React.FC<BattleCollabWorkspaceProps> = ({
  battleId,
  teamId,
  exercise,
  isLive,
  progress,
  onQuestCompleted,
  onNextQuest,
}) => {
  const { user, profile } = useAuth()
  const challenge = exercise.challenge

  const monacoLanguage = getMonacoLanguage(challenge?.language || challenge?.category)

  const {
    code,
    handleCodeChange,
    syncStatus,
    presenceUsers,
    isLoadingWorkspace,
    forceSaveSnapshot,
  } = useBattleCollabWorkspace({
    battleId,
    teamId,
    exerciseId: exercise.exercise_id,
    initialCode: '',
    language: monacoLanguage,
    userId: user?.id,
    userProfile: {
      username: profile?.username || undefined,
      full_name: profile?.full_name || undefined,
      avatar_url: profile?.avatar_url || undefined,
    },
    isLive,
  })

  const [openHintIndex, setOpenHintIndex] = useState<number | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<BattleSubmissionResult | null>(null)
  const [showResultsPanel, setShowResultsPanel] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // Decrement cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownSeconds])

  const isCompleted = progress?.status === 'completed'

  const handleResetToStarter = () => {
    if (!isLive || isCompleted) return
    if (confirm('Reset workspace code to starter template? This will update for all squad members.')) {
      handleCodeChange('')
    }
  }

  // Handle Team Quest Submission
  const handleSubmitSolution = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to submit.')
      return
    }
    if (!isLive) {
      toast.error('Battle has ended. Submissions are closed.')
      return
    }
    if (cooldownSeconds > 0) {
      toast.error(`Please wait ${cooldownSeconds}s before submitting again.`)
      return
    }

    setIsSubmitting(true)
    setShowResultsPanel(true)

    // Flush workspace snapshot first
    await forceSaveSnapshot()

    try {
      const result = await submitBattleQuestSolution(
        battleId,
        teamId,
        exercise.exercise_id,
        code,
        monacoLanguage,
        user.id
      )

      setSubmissionResult(result)

      if (result.cooldown_remaining_seconds) {
        setCooldownSeconds(result.cooldown_remaining_seconds)
      }

      if (result.success && result.status === 'passed') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        })
        toast.success(
          `Quest Solved! +${result.score_awarded} pts awarded to your squad!`,
          { icon: '🏆', duration: 5000 }
        )
        onQuestCompleted?.(result)
      } else if (result.status === 'failed') {
        toast.error(`Test cases failed: ${result.passedCount}/${result.totalCount} passed.`)
      } else if (!result.success && result.error) {
        toast.error(result.error)
      }
    } catch {
      toast.error('An error occurred during submission.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col gap-0 text-left animate-in fade-in duration-200">
      {/* 1. COLLABORATION & SUBMISSION TOP BAR */}
      <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Quest Info */}
        <div className="flex items-center gap-3">
          <span
            className={`w-8 h-8 rounded-xl font-pixel text-xs font-bold text-white flex items-center justify-center shrink-0 shadow-xs ${
              isCompleted ? 'bg-emerald-600' : 'bg-purple-600'
            }`}
          >
            {isCompleted ? '✓' : `#${exercise.order_position}`}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-sans">
                {challenge?.title || `Quest #${exercise.order_position}`}
              </span>
              <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-950/80 border border-purple-500/40 text-purple-300 uppercase">
                {monacoLanguage}
              </span>
              {isCompleted ? (
                <span className="px-2 py-0.2 rounded text-[9px] font-pixel font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  +{progress.score_awarded} PTS EARNED
                </span>
              ) : (
                <span className="px-2 py-0.2 rounded text-[9px] font-pixel font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  100 PTS BASE
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Isolated Workspace • Battle #{battleId.slice(0, 8)} • Team #{teamId.slice(0, 8)}
            </div>
          </div>
        </div>

        {/* Realtime Status, Squad Presence & Submit CTA */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Realtime Sync Pill */}
          <div
            className={`px-3 py-1 rounded-xl text-[10px] font-pixel uppercase font-bold flex items-center gap-1.5 border transition-all ${
              !isLive
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : syncStatus === 'synced'
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                : syncStatus === 'saving'
                ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
            }`}
          >
            {!isLive ? (
              <>
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Battle Concluded</span>
              </>
            ) : syncStatus === 'synced' ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>Synced</span>
              </>
            ) : syncStatus === 'saving' ? (
              <>
                <Save className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span>Reconnecting...</span>
              </>
            )}
          </div>

          {/* Active Teammates Avatars */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <div className="flex items-center -space-x-1.5">
              {presenceUsers.slice(0, 3).map((u, i) => (
                <div
                  key={u.user_id || i}
                  title={`${u.full_name || u.username || 'Teammate'} (Online)`}
                  className="w-5 h-5 rounded-full border border-slate-900 bg-purple-100 flex items-center justify-center overflow-hidden shrink-0"
                >
                  <AlexPixelAvatar className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          {/* SUBMIT BUTTON / QUEST SOLVED BADGE */}
          {isCompleted ? (
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-pixel text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                <span>SOLVED (+{progress.score_awarded} PTS)</span>
              </div>
              {onNextQuest && (
                <GamifiedButton
                  variant="primary"
                  size="sm"
                  onClick={onNextQuest}
                  className="py-1 px-3 text-xs"
                >
                  <span>Next Quest</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </GamifiedButton>
              )}
            </div>
          ) : (
            <GamifiedButton
              variant="primary"
              size="sm"
              onClick={handleSubmitSolution}
              disabled={isSubmitting || cooldownSeconds > 0 || !isLive}
              className="py-1.5 px-4 text-xs shadow-md"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Tests...</span>
                </div>
              ) : cooldownSeconds > 0 ? (
                <div className="flex items-center gap-1.5 text-amber-200">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Cooldown ({cooldownSeconds}s)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Submit Solution</span>
                </div>
              )}
            </GamifiedButton>
          )}
        </div>
      </div>

      {/* 2. MAIN SPLIT WORKSPACE: BRIEFING (LEFT) + MONACO EDITOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left Column: Problem Briefing, Criteria & Hints (5 cols) */}
        <div className="lg:col-span-5 p-5 border-r border-slate-200 flex flex-col gap-4 bg-slate-50/50 overflow-y-auto max-h-[640px]">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-purple-600" />
              <span>Quest Briefing</span>
            </span>
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-1 cursor-pointer"
            >
              {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showInstructions && (
            <div className="flex flex-col gap-4">
              {challenge?.description && (
                <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                  {challenge.description}
                </div>
              )}

              {/* Scoring Specs Pill */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-2">
                <span className="text-[10px] font-pixel font-bold uppercase text-slate-500">
                  Scoring Model
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-[10px] text-purple-600 font-pixel">BASE</span>
                    <div className="font-bold text-purple-900 font-mono mt-0.5">100 pts</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-600 font-pixel">SPEED</span>
                    <div className="font-bold text-emerald-900 font-mono mt-0.5">Up to +50</div>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="text-[10px] text-rose-600 font-pixel">PENALTY</span>
                    <div className="font-bold text-rose-900 font-mono mt-0.5">-10 / fail</div>
                  </div>
                </div>
              </div>

              {/* Accordion Hints */}
              {challenge?.hints && challenge.hints.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-pixel font-bold uppercase text-slate-500 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tactical Hints</span>
                  </span>

                  {challenge.hints.map((hint, hIdx) => {
                    const isOpen = openHintIndex === hIdx

                    return (
                      <div
                        key={hIdx}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenHintIndex(isOpen ? null : hIdx)}
                          className="w-full p-2.5 text-left font-bold text-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-1.5">
                            <HelpCircle className="w-3 h-3 text-amber-500" />
                            <span>Hint #{hIdx + 1}</span>
                          </span>
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        {isOpen && (
                          <div className="p-3 pt-0 text-slate-600 bg-amber-50/30 border-t border-slate-100 leading-relaxed font-sans text-[11px]">
                            {hint}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submission Attempts Counter */}
          {progress && (
            <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 mt-auto">
              <span>Previous Failed Attempts:</span>
              <span className="font-bold font-mono text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200">
                {progress.attempts_count}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Monaco Code Editor + Results Drawer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#1e1e1e] relative min-h-[560px]">
          {isLoadingWorkspace ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="font-pixel text-xs uppercase">Connecting to Team Workspace...</span>
            </div>
          ) : (
            <Editor
              height="100%"
              language={monacoLanguage}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                readOnly: !isLive || isCompleted,
                fontSize: 13,
                fontFamily: "'Fira Code', monospace, Consolas, 'Courier New'",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                lineDecorationsWidth: 10,
              }}
            />
          )}

          {/* TEST RESULTS DRAWER / PANEL */}
          {showResultsPanel && submissionResult && (
            <div className="bg-[#181818] border-t-2 border-purple-500/50 p-4 flex flex-col gap-3 text-xs text-slate-300 max-h-[220px] overflow-y-auto animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {submissionResult.status === 'passed' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-pixel text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ACCEPTED • {submissionResult.passedCount}/{submissionResult.totalCount} TESTS
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-500/50 text-rose-300 font-pixel text-[10px] font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      TESTS FAILED • {submissionResult.passedCount}/{submissionResult.totalCount} PASSED
                    </span>
                  )}

                  {submissionResult.status === 'passed' && (
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
                      <span className="text-emerald-400 font-bold">+{submissionResult.score_awarded} pts</span>
                      <span>(Base: {submissionResult.base_points} + Speed: {submissionResult.speed_bonus} - Pen: {submissionResult.penalty})</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowResultsPanel(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer font-mono"
                >
                  ✕ Close
                </button>
              </div>

              {/* Test Case Breakdown */}
              {submissionResult.testResults && submissionResult.testResults.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {submissionResult.testResults.map((tr, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border flex items-start justify-between gap-2 font-mono text-[11px] ${
                        tr.passed
                          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {tr.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span>Test #{tr.orderIndex || idx + 1}</span>
                      </div>
                      {tr.error && (
                        <span className="text-[10px] text-rose-400 font-sans max-w-md truncate">
                          {tr.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Editor Footer Actions */}
          <div className="p-3 bg-[#181818] border-t border-[#2d2d2d] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono">
                {presenceUsers.length > 1
                  ? `${presenceUsers.length} teammates in this file`
                  : 'Solo in file'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {submissionResult && !showResultsPanel && (
                <button
                  type="button"
                  onClick={() => setShowResultsPanel(true)}
                  className="text-[11px] font-mono text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>View Test Output</span>
                </button>
              )}

              {isLive && !isCompleted && (
                <button
                  type="button"
                  onClick={handleResetToStarter}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset to starter code"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Code</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
