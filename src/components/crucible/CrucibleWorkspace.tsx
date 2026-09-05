import React, { useState, useCallback, useRef, useEffect } from 'react'
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react'
import type { Challenge, ChallengeProgress } from '../../lib/challenges'
import { recordChallengeSubmission } from '../../lib/challenges'
import { executeCode, type ExecutionResult } from '../../lib/execution'
import { awardXp } from '../../lib/gamification'
import { ChallengeBriefing } from './ChallengeBriefing'
import { CodeEditorPane } from './CodeEditorPane'
import { ExecutionConsole } from './ExecutionConsole'
import { VictoryModal } from './VictoryModal'
import type { TestCaseResult } from './TestCaseList'

// ─── Naive test evaluator ────────────────────────────────────────────────────
// Derives test-case pass/fail from stdout vs expected patterns.
// No backend changes — purely presentational heuristic.
function deriveTestCases(
  challenge: Challenge,
  result: ExecutionResult
): TestCaseResult[] {
  // If challenge has no sample_input, generate a single holistic test
  const stdout = (result.stdout ?? '').trim()
  const isError = result.status !== 'success'

  if (!challenge.sample_input) {
    return [{
      index: 0,
      label: 'Execution passes',
      passed: !isError && stdout.length > 0,
    }]
  }

  // Split sample_input into expected lines (each line is a test expectation)
  const lines = challenge.sample_input.split('\n').map((l) => l.trim()).filter(Boolean)
  const outputLines = stdout.split('\n').map((l) => l.trim())

  return lines.map((expected, i) => ({
    index: i,
    label: `Output line ${i + 1}`,
    passed: !isError && outputLines[i]?.trim() === expected,
    expected,
    actual: outputLines[i] ?? '',
  }))
}

interface CrucibleWorkspaceProps {
  challenge: Challenge
  progress?: ChallengeProgress
  userId?: string
  onBack: () => void
  onNextChallenge?: () => void
}

export const CrucibleWorkspace: React.FC<CrucibleWorkspaceProps> = ({
  challenge, progress, userId, onBack, onNextChallenge,
}) => {
  const [code, setCode] = useState(challenge.starter_code ?? `# Write your solution here\n`)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [tests, setTests] = useState<TestCaseResult[]>([])
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>()
  const [isCompleted, setIsCompleted] = useState(progress?.is_completed ?? false)
  const [showVictory, setShowVictory] = useState(false)
  const [hasShownVictory, setHasShownVictory] = useState(false)

  // Pane collapse state
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const lang = challenge.language ?? 'python'

  // Reset code when challenge changes
  useEffect(() => {
    setCode(challenge.starter_code ?? `# Write your solution here\n`)
    setResult(null)
    setTests([])
    setExecutionTimeMs(undefined)
    setIsCompleted(progress?.is_completed ?? false)
    setShowVictory(false)
    setHasShownVictory(false)
  }, [challenge.id, challenge.starter_code, progress?.is_completed])

  const handleRun = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setResult(null)
    setTests([])
    const start = Date.now()

    try {
      const execResult = await executeCode(lang, code, '', challenge.id)
      const elapsed = Date.now() - start
      setExecutionTimeMs(execResult.execution_time ?? elapsed)
      setResult(execResult)

      const derivedTests = deriveTestCases(challenge, execResult)
      setTests(derivedTests)

      const allPassed = derivedTests.every((t) => t.passed)

      if (allPassed && !isCompleted) {
        setIsCompleted(true)
        if (!hasShownVictory) {
          setShowVictory(true)
          setHasShownVictory(true)
        }
        // Record backend submission (non-blocking, fire-and-forget)
        if (userId) {
          recordChallengeSubmission(userId, challenge.id, true, 100)
            .catch(console.error)
          awardXp(userId, challenge.xp_reward ?? 75, 'challenge', challenge.id)
            .catch(console.error)
        }
      } else if (!allPassed && userId) {
        recordChallengeSubmission(userId, challenge.id, false, 0)
          .catch(console.error)
      }
    } finally {
      setIsRunning(false)
    }
  }, [isRunning, lang, code, challenge, userId, isCompleted, hasShownVictory])

  const handleReset = useCallback(() => {
    setCode(challenge.starter_code ?? `# Write your solution here\n`)
    setResult(null)
    setTests([])
    setExecutionTimeMs(undefined)
  }, [challenge.starter_code])

  const handleInspectSolution = useCallback(() => {
    setShowVictory(false)
    // Solution is revealed in ChallengeBriefing when isCompleted = true
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex flex-col"
      style={{ background: '#060404', fontFamily: '"JetBrains Mono", monospace' }}
    >
      {/* ── Top Workspace Bar ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{
          background: '#070505',
          borderBottom: '1px solid #2A1414',
          boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
        }}
      >
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ color: '#78716c', border: '1px solid #2A1414', fontSize: '11px' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-bold">Exit Trial</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '14px' }}>⚔️</span>
          <span className="font-black uppercase"
            style={{
              color: '#FF3D00',
              fontSize: '9px',
              fontFamily: 'Press Start 2P, monospace',
              lineHeight: 1.4,
            }}
          >
            THE CRUCIBLE
          </span>
          <span style={{ color: '#2A1414', fontSize: '10px' }}>•</span>
          <span className="font-bold text-sm truncate max-w-[200px] sm:max-w-xs"
            style={{ color: '#c4b5a5', fontSize: '12px' }}
          >
            {challenge.title}
          </span>
        </div>

        {/* Pane toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ color: '#57534e', border: '1px solid #2A1414', fontSize: '10px' }}
            title="Toggle Scroll of Labor"
          >
            {leftCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ color: '#57534e', border: '1px solid #2A1414', fontSize: '10px' }}
            title="Toggle Runestone"
          >
            {rightCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Tri-Pane Layout ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Pane 1: Scroll of Labor (28%) */}
        {!leftCollapsed && (
          <div className="flex flex-col shrink-0 overflow-hidden"
            style={{
              width: '28%',
              minWidth: '220px',
              borderRight: '1px solid #2A1414',
            }}
          >
            <div className="px-4 py-2 shrink-0 flex items-center gap-2"
              style={{ background: '#070505', borderBottom: '1px solid #2A1414' }}
            >
              <span style={{ fontSize: '12px' }}>📜</span>
              <span className="font-black uppercase"
                style={{ color: '#57534e', fontSize: '8px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.4 }}
              >
                SCROLL OF LABOR
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChallengeBriefing
                challenge={challenge}
                progress={progress}
                isCompleted={isCompleted}
              />
            </div>
          </div>
        )}

        {/* Pane 2: Inscription Terminal (center, flex-1) */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <CodeEditorPane
            code={code}
            language={lang}
            isRunning={isRunning}
            onCodeChange={setCode}
            onRun={handleRun}
            onReset={handleReset}
          />
        </div>

        {/* Pane 3: Runestone Verification (26%) */}
        {!rightCollapsed && (
          <div className="flex flex-col shrink-0 overflow-hidden"
            style={{
              width: '26%',
              minWidth: '200px',
              borderLeft: '1px solid #2A1414',
            }}
          >
            <div className="px-4 py-2 shrink-0 flex items-center gap-2"
              style={{ background: '#070505', borderBottom: '1px solid #2A1414' }}
            >
              <span style={{ fontSize: '12px' }}>🪨</span>
              <span className="font-black uppercase"
                style={{ color: '#57534e', fontSize: '8px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.4 }}
              >
                RUNESTONE
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <ExecutionConsole
                result={result}
                isRunning={isRunning}
                tests={tests}
                executionTimeMs={executionTimeMs}
              />
            </div>
          </div>
        )}
      </div>

      {/* Victory Modal */}
      {showVictory && (
        <VictoryModal
          xpReward={challenge.xp_reward ?? 75}
          challengeTitle={challenge.title}
          onNextTrial={() => {
            setShowVictory(false)
            onNextChallenge?.()
          }}
          onInspectSolution={handleInspectSolution}
          onClose={() => setShowVictory(false)}
        />
      )}
    </div>
  )
}
