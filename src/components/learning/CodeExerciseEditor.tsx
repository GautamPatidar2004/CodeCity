import React, { useState, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { GamifiedButton } from '../ui/GamifiedButton'
import { executeCode, type ExecutionResult } from '../../lib/execution'
import {
  submitExerciseSolution,
  fetchUserExerciseSubmissions,
  type SubmissionResult,
  type UserSubmissionRecord,
} from '../../lib/submissions'
import { useAuth } from '../../context/AuthContext'
import {
  Play,
  RotateCcw,
  Terminal,
  Send,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Info,
  Loader2,
  Eye,
  Code as CodeIcon,
  Clock,
  CheckCircle2,
  XCircle,
  History,
} from 'lucide-react'

interface CodeExerciseProps {
  challengeId: string
  title: string
  instructions?: string
  description: string
  starterCode?: string
  language?: string
  sampleInput?: string
  hints?: string[]
  solutionExplanation?: string
  isCompleted?: boolean
  onSubmitAttempt?: () => void
}

export const CodeExerciseEditor: React.FC<CodeExerciseProps> = ({
  challengeId,
  title,
  instructions,
  description,
  starterCode = '',
  language = 'javascript',
  sampleInput = '',
  hints,
  solutionExplanation,
  isCompleted = false,
  onSubmitAttempt,
}) => {
  const { user } = useAuth()
  const storageKey = `codedex_exercise_${challengeId}_code`
  const [code, setCode] = useState<string>(() => {
    const saved = localStorage.getItem(storageKey)
    return saved !== null ? saved : starterCode
  })

  const [inputVal, setInputVal] = useState<string>(sampleInput)
  const [consoleOutput, setConsoleOutput] = useState<string>('')
  const [consoleStatus, setConsoleStatus] = useState<ExecutionResult['status'] | 'idle'>('idle')
  const [executionTime, setExecutionTime] = useState<number | undefined>(undefined)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [submissionHistory, setSubmissionHistory] = useState<UserSubmissionRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [openHint, setOpenHint] = useState(false)
  const [openSolution, setOpenSolution] = useState(false)

  const loadHistory = useCallback(async () => {
    if (!user?.id) return
    const records = await fetchUserExerciseSubmissions(user.id, challengeId)
    setSubmissionHistory(records)
  }, [user, challengeId])

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved !== null) {
      setCode(saved)
    } else {
      setCode(starterCode)
    }
    loadHistory()
  }, [challengeId, starterCode, storageKey, loadHistory])

  const handleCodeChange = (val: string | undefined) => {
    const nextCode = val ?? ''
    setCode(nextCode)
    localStorage.setItem(storageKey, nextCode)
  }

  const handleResetCode = () => {
    setCode(starterCode)
    localStorage.removeItem(storageKey)
    setConsoleOutput('')
    setConsoleStatus('idle')
    setExecutionTime(undefined)
    setSubmissionResult(null)
  }

  const handleRunCode = async () => {
    if (isExecuting || isSubmitting) return
    setIsExecuting(true)
    setConsoleStatus('idle')
    setConsoleOutput('Executing code in secure sandbox environment...')

    try {
      const result = await executeCode(language, code, inputVal, challengeId)
      setConsoleStatus(result.status)
      setExecutionTime(result.execution_time)

      if (result.status === 'success') {
        setConsoleOutput(result.stdout || '(Program executed successfully with 0 output.)')
      } else if (result.status === 'compile_error') {
        setConsoleOutput(`[COMPILATION ERROR]\n${result.stderr}`)
      } else if (result.status === 'runtime_error') {
        setConsoleOutput(`[RUNTIME ERROR - Exit code: ${result.exit_code ?? 1}]\n${result.stderr || result.stdout}`)
      } else if (result.status === 'timeout') {
        setConsoleOutput(`[TIMEOUT ERROR]\n${result.stderr}`)
      } else {
        setConsoleOutput(`[ERROR]\n${result.stderr || 'Execution failed.'}`)
      }
    } catch (err: any) {
      setConsoleStatus('error')
      setConsoleOutput(`[SYSTEM ERROR]\n${err?.message || 'Failed to reach execution provider.'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting || isExecuting || !user?.id) return
    setIsSubmitting(true)
    setSubmissionResult(null)

    try {
      const subResult = await submitExerciseSolution(user.id, challengeId, language, code)
      setSubmissionResult(subResult)
      await loadHistory()

      if (subResult.status === 'passed') {
        if (onSubmitAttempt) {
          onSubmitAttempt()
        }
      }
    } catch (err) {
      console.error('Submission failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Normalize language for Monaco Editor
  const cleanLang = language.toLowerCase()
  const isHtmlOrCss = cleanLang === 'html' || cleanLang === 'css'

  const monacoLanguage = (() => {
    if (cleanLang === 'c++' || cleanLang === 'cpp') return 'cpp'
    if (cleanLang === 'python' || cleanLang === 'py') return 'python'
    if (cleanLang === 'javascript' || cleanLang === 'js') return 'javascript'
    if (cleanLang === 'java') return 'java'
    if (cleanLang === 'html') return 'html'
    if (cleanLang === 'css') return 'css'
    return 'javascript'
  })()

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm text-left">
      {/* Exercise Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-pixel text-[10px] uppercase font-bold">
              {monacoLanguage.toUpperCase()}
            </span>
            <h4 className="font-bold text-sm text-slate-900">{title}</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-pixel text-amber-500 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+75 XP</span>
            </span>
            <button
              type="button"
              onClick={handleResetCode}
              disabled={isExecuting || isSubmitting}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset code to starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {instructions || description}
        </p>

        {/* View Mode switcher for HTML/CSS */}
        {isHtmlOrCss && (
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                activeTab === 'editor' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              <CodeIcon className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                activeTab === 'preview' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Sandboxed Preview</span>
            </button>
          </div>
        )}

        {/* Hints */}
        {hints && hints.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setOpenHint(!openHint)}
              className="text-[11px] text-purple-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{openHint ? 'Hide Exercise Hint' : 'View Exercise Hint'}</span>
            </button>
            {openHint && (
              <div className="mt-1.5 p-2.5 bg-purple-50 rounded-xl text-[11px] text-purple-950 font-mono border border-purple-200">
                {hints[0]}
              </div>
            )}
          </div>
        )}

        {/* Solution Explanation if completed */}
        {isCompleted && solutionExplanation && (
          <div>
            <button
              type="button"
              onClick={() => setOpenSolution(!openSolution)}
              className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{openSolution ? 'Hide Solution Explanation' : 'View Solution Explanation'}</span>
            </button>
            {openSolution && (
              <div className="mt-1.5 p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-950 font-medium border border-emerald-200">
                {solutionExplanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor / Live Preview Section */}
      {isHtmlOrCss && activeTab === 'preview' ? (
        <div className="h-64 w-full border-y border-slate-200 bg-white">
          <iframe
            title="Safe HTML/CSS Preview"
            srcDoc={code}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <div className="h-64 w-full border-y border-slate-200">
          <Editor
            height="100%"
            language={monacoLanguage}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </div>
      )}

      {/* Input / STDIN area (if not HTML/CSS) */}
      {!isHtmlOrCss && (
        <div className="px-4 flex flex-col gap-1.5">
          <label className="text-[10px] font-pixel text-slate-500 uppercase font-bold flex items-center gap-1">
            <Terminal className="w-3 h-3" />
            <span>Program Input / STDIN (Optional)</span>
          </label>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. standard input or parameters"
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      )}

      {/* Test Case Validation Results Panel (Appears on Submit) */}
      {submissionResult && (
        <div className="px-4">
          <div
            className={`p-4 rounded-xl border-2 flex flex-col gap-3 ${
              submissionResult.status === 'passed'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-pixel text-xs font-bold uppercase">
                {submissionResult.status === 'passed' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ALL TESTS PASSED ({submissionResult.passedCount}/{submissionResult.totalCount})</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>SUBMISSION FAILED ({submissionResult.passedCount}/{submissionResult.totalCount} PASSED)</span>
                  </>
                )}
              </div>
              {submissionResult.executionTimeMs !== undefined && (
                <span className="text-[10px] font-mono text-slate-500">
                  {submissionResult.executionTimeMs}ms
                </span>
              )}
            </div>

            {/* Test Cases Details */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-200/60">
              {submissionResult.testResults.map((tr, idx) => (
                <div
                  key={tr.testCaseId || idx}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-mono flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {tr.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>
                        Test Case {idx + 1} {tr.isHidden ? '[Hidden]' : '[Public]'}
                      </span>
                    </span>
                    <span className={tr.passed ? 'text-emerald-600 font-pixel text-[10px]' : 'text-rose-600 font-pixel text-[10px]'}>
                      {tr.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  {!tr.isHidden && !tr.passed && (
                    <div className="text-[11px] text-slate-600 mt-1 pl-5 flex flex-col gap-0.5">
                      {tr.expectedOutput && <div><strong>Expected:</strong> {tr.expectedOutput}</div>}
                      {tr.actualOutput && <div><strong>Actual:</strong> {tr.actualOutput}</div>}
                      {tr.error && <div className="text-rose-600"><strong>Error:</strong> {tr.error}</div>}
                    </div>
                  )}

                  {tr.isHidden && !tr.passed && tr.error && (
                    <div className="text-[11px] text-rose-600 mt-1 pl-5">
                      <strong>Execution Error:</strong> {tr.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submission History Section */}
      {submissionHistory.length > 0 && (
        <div className="px-4">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span>{showHistory ? 'Hide Submission History' : `View Submission History (${submissionHistory.length})`}</span>
          </button>

          {showHistory && (
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 max-h-40 overflow-y-auto font-mono text-xs">
              {submissionHistory.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-pixel font-bold uppercase ${
                        sub.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      {sub.passed_test_count}/{sub.total_test_count} tests passed
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Output / Console Window */}
      <div className="px-4 pb-2">
        <div className="rounded-xl bg-slate-900 p-3 text-slate-200 font-mono text-xs min-h-16 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1.5 uppercase font-bold tracking-wider">
            <span className="flex items-center gap-1.5">
              <span>Terminal / Console</span>
              {executionTime !== undefined && (
                <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 lowercase">
                  <Clock className="w-3 h-3" />
                  <span>{executionTime}ms</span>
                </span>
              )}
            </span>
            <span
              className={`font-pixel ${
                consoleStatus === 'success'
                  ? 'text-emerald-400'
                  : consoleStatus === 'compile_error' || consoleStatus === 'runtime_error' || consoleStatus === 'error'
                  ? 'text-rose-400'
                  : consoleStatus === 'timeout'
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }`}
            >
              {isExecuting ? 'RUNNING...' : consoleStatus.toUpperCase()}
            </span>
          </div>
          {consoleOutput ? (
            <pre className="whitespace-pre-wrap leading-relaxed">{consoleOutput}</pre>
          ) : (
            <div className="text-slate-500 italic flex items-center gap-1.5 py-1">
              <Info className="w-3.5 h-3.5" />
              <span>Press &quot;Run Code&quot; to test or &quot;Submit Solution&quot; to evaluate all test cases.</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <GamifiedButton
          variant="secondary"
          size="sm"
          onClick={handleRunCode}
          disabled={isExecuting || isSubmitting}
          className="flex items-center gap-1.5"
        >
          {isExecuting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          ) : (
            <Play className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
        </GamifiedButton>

        <GamifiedButton
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={isExecuting || isSubmitting}
          className="flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{isSubmitting ? 'Evaluating Tests...' : 'Submit Solution ⚔️'}</span>
        </GamifiedButton>
      </div>
    </div>
  )
}
