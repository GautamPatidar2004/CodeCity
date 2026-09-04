import React, { useState, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Play,
  RotateCcw,
  Trophy,
  BarChart2,
  Clock,
  Lightbulb,
  Terminal,
  Star,
  ChevronRight,
  Medal,
} from 'lucide-react'
import { LumiPixelBot, PixelPythonIcon } from '../brand/PixelArtAvatars'
import confetti from 'canvas-confetti'

type RunStatus = 'idle' | 'running' | 'success' | 'error'

interface TestCase {
  label: string
  pass: boolean
}

interface CodingChallengeViewProps {
  onBackToLesson?: () => void
  onNextLesson?: () => void
}

const STARTER_CODE = `count = 5

# Write your loop here
`


const TESTS_IDLE: TestCase[] = [
  { label: 'Starts at 5', pass: false },
  { label: 'Prints each number', pass: false },
  { label: 'Uses a while loop', pass: false },
  { label: 'Stops at 0', pass: false },
]

const TESTS_PASS: TestCase[] = [
  { label: 'Starts at 5', pass: true },
  { label: 'Prints each number', pass: true },
  { label: 'Uses a while loop', pass: true },
  { label: 'Stops at 0', pass: true },
]

export const CodingChallengeView: React.FC<CodingChallengeViewProps> = ({
  onBackToLesson,
  onNextLesson,
}) => {
  const [code, setCode] = useState(STARTER_CODE)
  const [runStatus, setRunStatus] = useState<RunStatus>('idle')
  const [output, setOutput] = useState<string[]>([])
  const [tests, setTests] = useState<TestCase[]>(TESTS_IDLE)
  const [allPassed, setAllPassed] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [activeLumiHint, setActiveLumiHint] = useState<'hint' | 'explain' | 'example' | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll textarea with line numbers
  const lineCount = code.split('\n').length

  const handleRun = () => {
    setRunStatus('running')
    setErrorMsg(null)

    setTimeout(() => {
      // Simple client-side "simulation" — check for while loop + count decrement
      const hasWhile = /while\s+count\s*[>!]=?\s*0/.test(code)
      const hasPrint = /print\s*\(\s*count\s*\)/.test(code)
      const hasDecrement = /count\s*-=\s*1|count\s*=\s*count\s*-\s*1/.test(code)
      const hasCount5 = /count\s*=\s*5/.test(code)

      if (hasWhile && hasPrint && hasDecrement && hasCount5) {
        setOutput(['5', '4', '3', '2', '1'])
        setTests(TESTS_PASS)
        setAllPassed(true)
        setRunStatus('success')
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
        } catch { /* noop */ }
      } else {
        let errText = 'Your loop never changes count.'
        if (!hasCount5) errText = 'Make sure count starts at 5.'
        else if (!hasWhile) errText = 'Your while loop condition looks incorrect.'
        else if (!hasPrint) errText = 'Make sure you print(count) inside the loop.'
        else if (!hasDecrement) errText = 'Decrease count by 1 inside the loop (count -= 1).'

        setOutput([`Error: ${errText}`])
        setTests(TESTS_IDLE)
        setAllPassed(false)
        setRunStatus('error')
        setErrorMsg(errText)
      }
    }, 900)
  }

  const handleReset = () => {
    setCode(STARTER_CODE)
    setRunStatus('idle')
    setOutput([])
    setTests(TESTS_IDLE)
    setAllPassed(false)
    setErrorMsg(null)
    setActiveLumiHint(null)
  }

  // Handle tab key in editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const next = code.substring(0, start) + '    ' + code.substring(end)
      setCode(next)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4
          textareaRef.current.selectionEnd = start + 4
        }
      }, 0)
    }
  }

  const passCount = tests.filter(t => t.pass).length

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 text-left pb-16 select-none animate-in fade-in duration-300 font-sans">

      {/* =============================== CHALLENGE HEADER ================================= */}
      <div className="flex flex-col gap-3">
        {/* Back + badge row */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLesson}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-stone-200/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Lesson
          </button>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-pixel text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
            🎮 CODING CHALLENGE
          </span>
        </div>

        {/* Heading + meta row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Keep the Countdown Going
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Use a while loop to count down from 5 to 1.
            </p>
          </div>

          {/* Right Meta Cards */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Reward: +120 XP
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
              Difficulty:
              <span className="flex items-center gap-0.5 ml-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <Star className="w-3 h-3 text-slate-300" />
                <Star className="w-3 h-3 text-slate-300" />
                <Star className="w-3 h-3 text-slate-300" />
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Estimated: 10 min
            </div>
          </div>
        </div>

        {/* Mission Briefing Banner */}
        <div className="bg-emerald-50/40 border border-emerald-200 rounded-3xl p-5 mt-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left: pixel art + goal */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-200 p-1 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/extracted/course/course_hero_art.png"
                alt="Coder"
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.src = '/pixel_terminal_workspace.jpg' }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs font-pixel font-bold text-emerald-800 uppercase tracking-wider">
                <span>🚩</span> MISSION
              </div>
              <p className="text-xs text-slate-700 font-medium leading-snug">
                Create a program that prints the numbers 5 through 1, one per line.
              </p>
            </div>
          </div>

          {/* Middle: Requirements */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-pixel font-bold text-slate-500 uppercase tracking-wider">Requirements:</span>
            <div className="flex flex-col gap-1.5">
              {['Start at 5', 'Use a while loop', 'Decrease the number after each iteration', 'Stop when the number reaches 0'].map(r => (
                <div key={r} className="flex items-center gap-2 text-xs text-slate-700">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3] shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Hint */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-white border border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Lightbulb className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-pixel font-bold text-sky-700 uppercase tracking-wider">Hint</span>
              <p className="text-xs text-sky-900 leading-snug">
                Think about what condition should keep the loop running.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================= MAIN WORKSPACE GRID ============================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

        {/* =================== COLUMN 1: MISSION SPECS & LUMI =================== */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Your Mission Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <span>🚩</span>
              <span>Your Mission</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete the countdown using a while loop.
            </p>

            {/* Example Output */}
            <div className="bg-sky-50/60 rounded-xl p-3 border border-sky-100">
              <div className="flex items-center gap-1.5 text-[10px] font-pixel font-bold text-sky-700 uppercase tracking-wider mb-2">
                <Terminal className="w-3 h-3" />
                Example Output
              </div>
              <div className="font-mono text-xs text-slate-800 flex flex-col gap-0.5">
                {['5', '4', '3', '2', '1'].map(n => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-pixel font-bold text-slate-500 uppercase tracking-wider">Rules:</span>
              {[
                'Use a while loop.',
                'Start with count = 5.',
                'Print the current count.',
                'Decrease count after each iteration.',
              ].map(r => (
                <div key={r} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lumi Helper Box */}
          <div className="bg-indigo-50/40 rounded-2xl p-5 border border-indigo-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <LumiPixelBot size={30} />
              <span className="font-bold text-sm text-slate-900">Need help?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Start by deciding what condition should keep count running.
            </p>

            <div className="flex flex-col gap-2">
              {[
                { id: 'hint' as const, icon: '💡', label: 'Give me a hint' },
                { id: 'explain' as const, icon: '💬', label: 'Explain' },
                { id: 'example' as const, icon: '📖', label: 'Show example' },
              ].map(btn => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setActiveLumiHint(activeLumiHint === btn.id ? null : btn.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                    activeLumiHint === btn.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  <span>{btn.icon}</span>
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>

            {activeLumiHint && (
              <div className="p-3 rounded-xl bg-white border border-indigo-200 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-150">
                {activeLumiHint === 'hint' && (
                  <p>The condition <code className="px-1 py-0.5 bg-indigo-50 rounded font-mono text-indigo-700 font-bold">count &gt; 0</code> keeps the loop going while count is positive!</p>
                )}
                {activeLumiHint === 'explain' && (
                  <p>A <code className="px-1 py-0.5 bg-indigo-50 rounded font-mono text-indigo-700 font-bold">while</code> loop checks a condition before each iteration. When the condition is false, the loop exits.</p>
                )}
                {activeLumiHint === 'example' && (
                  <div className="bg-[#1e293b] text-slate-100 p-2.5 rounded-lg font-mono text-[10px] leading-relaxed">
                    <p><span className="text-slate-100">count</span> <span className="text-emerald-400">=</span> <span className="text-amber-400">5</span></p>
                    <p><span className="text-purple-400">while</span> count <span className="text-emerald-400">&gt;</span> <span className="text-amber-400">0</span>:</p>
                    <p className="pl-3"><span className="text-sky-400">print</span>(count)</p>
                    <p className="pl-3">count <span className="text-emerald-400">-=</span> <span className="text-amber-400">1</span></p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =================== COLUMN 2: CODE IDE & CONSOLE =================== */}
        <div className="xl:col-span-6 flex flex-col gap-4">
          {/* Code Editor Window */}
          <div className="bg-[#1e293b] rounded-2xl overflow-hidden shadow-lg border border-slate-700">
            {/* IDE Header */}
            <div className="bg-[#0f172a] px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                  <PixelPythonIcon size={14} />
                  <span className="font-pixel text-[10px] text-slate-300 uppercase tracking-wide">PYTHON</span>
                </div>
                <span className="text-slate-400 text-xs font-mono">main.py</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={runStatus === 'running'}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {runStatus === 'running' ? 'Running…' : 'Run'}
                </button>
              </div>
            </div>

            {/* Editor Body with Line Numbers */}
            <div className="flex relative" style={{ minHeight: 200 }}>
              {/* Line numbers */}
              <div className="select-none bg-[#0f172a]/40 py-4 px-3 text-right shrink-0 font-mono text-[12px] leading-6 text-slate-600 border-r border-slate-800/60 min-w-[40px]">
                {Array.from({ length: Math.max(lineCount, 8) }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="flex-1 bg-transparent py-4 px-4 font-mono text-[13px] leading-6 text-slate-100 outline-none resize-none w-full caret-emerald-400 placeholder:text-slate-600"
                style={{ minHeight: 200 }}
                aria-label="Code editor"
              />
            </div>
          </div>

          {/* Terminal Output Console */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
            <div className="bg-[#0f172a] px-4 py-2 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                OUTPUT
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className={`w-2 h-2 rounded-full ${
                  runStatus === 'running' ? 'bg-amber-400 animate-pulse' :
                  runStatus === 'success' ? 'bg-emerald-500' :
                  runStatus === 'error' ? 'bg-rose-500' :
                  'bg-emerald-500'
                }`} />
                <span className={`font-pixel uppercase tracking-wide ${
                  runStatus === 'running' ? 'text-amber-400' :
                  runStatus === 'success' ? 'text-emerald-400' :
                  runStatus === 'error' ? 'text-rose-400' :
                  'text-emerald-400'
                }`}>
                  {runStatus === 'running' ? 'Running' : runStatus === 'success' ? 'Success' : runStatus === 'error' ? 'Error' : 'Ready to run'}
                </span>
              </div>
            </div>
            <div className="p-4 font-mono text-sm min-h-[120px] flex flex-col gap-1">
              {output.length === 0 ? (
                <span className="text-slate-500">▶ Run your code to see the output.</span>
              ) : runStatus === 'error' ? (
                output.map((line, i) => (
                  <span key={i} className="text-rose-400">{line}</span>
                ))
              ) : (
                output.map((line, i) => (
                  <span key={i} className="text-emerald-300">{line}</span>
                ))
              )}
            </div>
          </div>

          {/* Quest Complete Celebration Banner (Success) */}
          {allPassed && (
            <div className="bg-emerald-50/50 rounded-2xl p-5 border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row items-center gap-5 animate-in fade-in duration-300">
              {/* Left Pixel Art */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-200 p-1 shadow-xs flex items-center justify-center">
                  <img
                    src="/extracted/course/course_hero_art.png"
                    alt="Celebrating"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.src = '/pixel_terminal_workspace.jpg' }}
                  />
                </div>
                <div className="relative bg-white border border-emerald-200 rounded-2xl px-3 py-2 text-[11px] text-slate-700 font-medium shadow-2xs max-w-[170px] leading-snug">
                  &ldquo;Quest complete! You just mastered while loops.&rdquo;
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-white border-l border-b border-emerald-200 rotate-45" />
                </div>
              </div>

              {/* Center Stats */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 mb-0.5" />
                  +120 XP
                </div>
                <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-800">
                  <span className="text-[10px] text-indigo-500 uppercase font-pixel mb-0.5">NEW SKILL</span>
                  Loop Logic
                </div>
                <div className="flex flex-col gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 min-w-[120px]">
                  <div className="flex items-center justify-between text-[10px] font-pixel text-slate-500 uppercase tracking-wide">
                    <span>Current XP</span>
                    <span className="text-emerald-600 font-bold">4,970</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
                <Medal className="w-8 h-8 text-amber-500 shrink-0" />
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-2 ml-auto shrink-0">
                <button
                  type="button"
                  onClick={onNextLesson}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  Continue to Next Lesson
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Try Another Challenge
                </button>
              </div>
            </div>
          )}

          {/* Test Failed Error Callout */}
          {runStatus === 'error' && errorMsg && (
            <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-4 h-4 text-rose-600" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="font-bold text-rose-700 text-sm">✕ Test failed</span>
                  <p className="text-xs text-rose-800 font-medium">{errorMsg}</p>

                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-2">
                      <LumiPixelBot size={22} glowing={false} />
                      <p className="text-[11px] text-slate-600 leading-snug italic">
                        &ldquo;You&apos;re close. Check what happens to count after each iteration.&rdquo;
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveLumiHint('hint')}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors"
                    >
                      Get Hint
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =================== COLUMN 3: TEST RUNNER =================== */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Tests Checklist Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 text-sm tracking-wide uppercase font-pixel">Tests</span>
              {runStatus === 'success' && (
                <span className="text-[10px] font-pixel font-bold text-emerald-600 uppercase tracking-wider">
                  All Pass
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              {tests.map((t, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    t.pass
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    t.pass ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {t.pass ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                  </div>
                  <span>{t.label}</span>
                </div>
              ))}
            </div>

            {/* Summary Pill */}
            <div className={`flex items-center justify-center py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-300 ${
              allPassed
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {passCount} / {tests.length} tests passed
            </div>

            {/* Reward Button */}
            {allPassed ? (
              <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-sm font-bold text-amber-700">
                <Trophy className="w-4 h-4 text-amber-500" />
                +120 XP Earned!
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-400">
                <Trophy className="w-4 h-4 text-slate-300" />
                +120 XP (Run to unlock)
              </div>
            )}
          </div>

          {/* Attempt Status Info */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-3">
            <span className="text-[10px] font-pixel font-bold text-slate-500 uppercase tracking-wider">Status</span>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Attempts</span>
                <span className="font-mono font-bold text-slate-900">
                  {runStatus === 'idle' ? '0' : runStatus === 'success' ? '✓' : '1+'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`font-bold font-mono ${
                  runStatus === 'success' ? 'text-emerald-600' :
                  runStatus === 'error' ? 'text-rose-600' :
                  runStatus === 'running' ? 'text-amber-500' :
                  'text-slate-400'
                }`}>
                  {runStatus === 'success' ? 'Complete' : runStatus === 'error' ? 'Needs Fix' : runStatus === 'running' ? 'Running…' : 'Not started'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Exercise</span>
                <span className="font-mono font-bold text-slate-900">03 / 04</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================= BOTTOM FOOTER ============================= */}
      <div className="mt-4 pt-4 flex items-center justify-between border-t border-slate-200/60 flex-wrap gap-4">
        <button
          type="button"
          onClick={onBackToLesson}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Lesson
        </button>

        <span className="text-xs text-slate-400 font-medium">Exercise 03 / 04</span>

        <button
          type="button"
          onClick={allPassed ? onNextLesson : undefined}
          disabled={!allPassed}
          className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            allPassed
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Next Lesson
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
