import React, { useState, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Copy,
  Expand,
  Trash2,
  MoreVertical,
  Code2,
  Star,
  Sparkles,
  Lock,
} from 'lucide-react'
import { LumiPixelBot, PixelPythonIcon } from '../brand/PixelArtAvatars'
import confetti from 'canvas-confetti'

type RunStatus = 'idle' | 'running' | 'success' | 'error'
type ConsoleTab = 'output' | 'testResults' | 'console'

interface QuestIDEViewProps {
  onBackToLesson?: () => void
  onNextLesson?: () => void
}

const STARTER_CODE = `count = 5

# Write your code below

while count > 0:
    print(count)
    count -= 1

print("Liftoff! 🚀")
`

export const QuestIDEView: React.FC<QuestIDEViewProps> = ({
  onBackToLesson,
  onNextLesson,
}) => {
  const [code, setCode] = useState(STARTER_CODE)
  const [runStatus, setRunStatus] = useState<RunStatus>('success')
  const [activeTab, setActiveTab] = useState<ConsoleTab>('output')
  const [showHint, setShowHint] = useState(false)
  const [allPassed, setAllPassed] = useState(true)
  const [runTime, setRunTime] = useState<string | null>('0.18s')
  const [output, setOutput] = useState(['5', '4', '3', '2', '1', 'Liftoff! 🚀'])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lineCount = code.split('\n').length

  const handleRun = () => {
    setRunStatus('running')
    setRunTime(null)
    const start = Date.now()

    setTimeout(() => {
      const hasWhile = /while\s+count\s*[>!]=?\s*0/.test(code)
      const hasPrint = /print\s*\(\s*count\s*\)/.test(code)
      const hasDecrement = /count\s*-=\s*1|count\s*=\s*count\s*-\s*1/.test(code)
      const hasCount5 = /count\s*=\s*5/.test(code)
      const hasLiftoff = /Liftoff/.test(code)
      const elapsed = ((Date.now() - start) / 1000).toFixed(2) + 's'

      if (hasWhile && hasPrint && hasDecrement && hasCount5 && hasLiftoff) {
        setOutput(['5', '4', '3', '2', '1', 'Liftoff! 🚀'])
        setAllPassed(true)
        setRunStatus('success')
        setRunTime(elapsed)
        setActiveTab('output')
        try { confetti({ particleCount: 100, spread: 75, origin: { y: 0.65 } }) } catch { /* noop */ }
      } else {
        let errOut = hasDecrement ? ['5', '4', '3', '2', '1'] : ['5', '5', '5', '5', '...']
        setOutput(errOut)
        setAllPassed(false)
        setRunStatus('error')
        setRunTime(elapsed)
        setActiveTab('output')
      }
    }, 700)
  }

  const handleReset = () => {
    setCode(STARTER_CODE)
    setRunStatus('success')
    setOutput(['5', '4', '3', '2', '1', 'Liftoff! 🚀'])
    setAllPassed(true)
    setRunTime('0.18s')
    setActiveTab('output')
    setShowHint(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const s = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const next = code.substring(0, s) + '    ' + code.substring(end)
      setCode(next)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = s + 4
          textareaRef.current.selectionEnd = s + 4
        }
      }, 0)
    }
  }

  const tests = [
    { label: 'Starts at 5', pass: allPassed },
    { label: 'Prints each number', pass: allPassed },
    { label: 'Uses a while loop', pass: allPassed },
    { label: 'Stops at 0', pass: allPassed },
  ]

  const questSteps = [
    { label: 'Understand while loops', done: true },
    { label: 'Predict loop output', done: true },
    { label: 'Practice repetition', done: true },
    { label: 'Build countdown', done: false, active: true },
    { label: 'Master the challenge', done: false },
  ]

  const stepsComplete = questSteps.filter(s => s.done).length

  return (
    <div className="w-full flex flex-col gap-0 font-sans select-none">
      {/* ============================================================ */}
      {/* MAIN 3-COLUMN WORKSPACE                                      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">

        {/* ====================================================== */}
        {/* LEFT COLUMN — MISSION BRIEFING & OBJECTIVES (~24%)     */}
        {/* ====================================================== */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Quest Header */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="font-pixel text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
              CHAPTER 04 • Loops & Logic
            </div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 leading-snug">
                Keep the Countdown Going
              </h1>
              <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs font-mono">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                +120 XP
              </span>
            </div>

            {/* Mission */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-pixel font-bold text-slate-600 uppercase tracking-wider">
                🎯 YOUR MISSION
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Create a Python program that counts down from 5 to 1. When the countdown reaches zero, print: <span className="font-mono font-bold text-emerald-700">"Liftoff! 🚀"</span>
              </p>
              <p className="text-[11px] text-slate-500 font-medium italic">Use a while loop.</p>
            </div>

            {/* Requirements */}
            <div className="mt-4 space-y-2">
              <div className="text-[10px] font-pixel font-bold text-slate-500 uppercase tracking-wider">
                REQUIREMENTS
              </div>
              {[
                'Start the countdown at 5',
                'Use a while loop',
                'Decrease the number after every loop',
                'Print "Liftoff! 🚀" after the countdown',
              ].map(r => (
                <div key={r} className="flex items-start gap-2 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                  </div>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            {/* Expected Output */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-pixel font-bold text-slate-500 uppercase tracking-wider">
                  EXPECTED OUTPUT
                </span>
                <div className="flex items-center gap-1.5">
                  <button type="button" className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                    <Expand className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="bg-[#1e293b] text-slate-100 rounded-xl p-3 font-mono text-xs space-y-0.5">
                {['5', '4', '3', '2', '1', 'Liftoff! 🚀'].map((line, i) => (
                  <div key={i} className={line === 'Liftoff! 🚀' ? 'text-emerald-400' : 'text-slate-200'}>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Hint Accordion */}
            <div className="mt-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">💡</span>
                <span className="text-[10px] font-pixel font-bold text-slate-600 uppercase tracking-wider">HINT</span>
                <span className="text-xs text-slate-500 font-medium ml-1">Need a hint?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your loop needs a condition that stays true while the countdown is greater than zero.
              </p>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
              >
                <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showHint ? 'rotate-180' : ''}`} />
              </button>
              {showHint && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs font-mono text-indigo-900 animate-in fade-in duration-150">
                  <p><span className="text-purple-600 font-bold">while</span> count <span className="text-emerald-600">&gt;</span> <span className="text-amber-600">0</span>:</p>
                  <p className="pl-4">count <span className="text-emerald-600">-=</span> <span className="text-amber-600">1</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Quest Progress Stepper */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-pixel font-bold text-slate-500 uppercase tracking-wider">
                QUEST PROGRESS
              </span>
              <span className="text-[10px] font-pixel font-bold text-emerald-600">
                {stepsComplete} / {questSteps.length}
              </span>
            </div>

            {/* Segmented Bar */}
            <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: `repeat(${questSteps.length}, 1fr)` }}>
              {questSteps.map((step, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    step.done ? 'bg-emerald-500' : step.active ? 'bg-emerald-300' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-2.5">
              {questSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    step.done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : step.active
                      ? 'border-emerald-500 bg-white'
                      : 'border-slate-200 bg-white'
                  }`}>
                    {step.done ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : step.active ? (
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : null}
                  </div>
                  <span className={`text-xs ${
                    step.done ? 'text-slate-500 line-through' : step.active ? 'font-bold text-slate-900' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* CENTER COLUMN — IDE & CONSOLE (~50%)                   */}
        {/* ====================================================== */}
        <div className="xl:col-span-6 flex flex-col gap-4">
          {/* Code Editor Window */}
          <div className="bg-[#1e293b] rounded-2xl overflow-hidden shadow-md border border-slate-800">
            {/* IDE Tab Bar */}
            <div className="bg-[#0f172a] px-4 py-2 flex items-center justify-between border-b border-slate-800">
              {/* Left: File Tabs */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#1e293b] border border-b-0 border-slate-700 text-xs font-medium text-slate-200">
                  <PixelPythonIcon size={13} />
                  <span className="font-mono">main.py</span>
                  <button type="button" className="ml-1 text-slate-500 hover:text-slate-300 cursor-pointer leading-none">×</button>
                </div>
                <button type="button" className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 cursor-pointer text-sm font-bold transition-colors">
                  +
                </button>
              </div>

              {/* Right: Tools */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
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
                <button type="button" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
                <button type="button" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors">
                  <Code2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Body: Line Numbers + Textarea */}
            <div className="flex" style={{ minHeight: 220 }}>
              {/* Line Numbers */}
              <div className="select-none bg-[#0f172a]/30 py-4 pr-3 pl-4 text-right shrink-0 font-mono text-[12px] leading-6 text-slate-600 border-r border-slate-800/50 min-w-[44px]">
                {Array.from({ length: Math.max(lineCount, 10) }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Editable Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="flex-1 bg-transparent py-4 px-4 font-mono text-[13px] leading-6 text-slate-100 outline-none resize-none w-full caret-emerald-400"
                style={{ minHeight: 220 }}
                aria-label="Code editor"
              />
            </div>
          </div>

          {/* Tabbed Terminal Console */}
          <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            {/* Tab Bar */}
            <div className="bg-[#0f172a] px-4 py-0 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center">
                {([
                  { id: 'output' as ConsoleTab, label: 'OUTPUT' },
                  { id: 'testResults' as ConsoleTab, label: 'TEST RESULTS' },
                  { id: 'console' as ConsoleTab, label: 'CONSOLE' },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-[11px] font-bold font-pixel uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                      activeTab === tab.id
                        ? 'text-white border-white'
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pb-0">
                {/* Status indicator */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${
                    runStatus === 'running' ? 'bg-amber-400 animate-pulse' :
                    runStatus === 'success' ? 'bg-emerald-500' :
                    runStatus === 'error' ? 'bg-rose-500' :
                    'bg-emerald-500'
                  }`} />
                  <span className={`font-pixel font-bold ${
                    runStatus === 'running' ? 'text-amber-400' :
                    runStatus === 'success' ? 'text-emerald-400' :
                    runStatus === 'error' ? 'text-rose-400' :
                    'text-emerald-400'
                  }`}>
                    {runStatus === 'running'
                      ? 'Running…'
                      : runTime
                      ? `Run completed • ${runTime}`
                      : 'Ready'}
                  </span>
                </div>

                <button type="button" className="p-1.5 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 font-mono text-sm min-h-[130px]">
              {activeTab === 'output' && (
                <div className="flex flex-col gap-0.5">
                  {output.length === 0 ? (
                    <span className="text-slate-500">▶ Run your code to see output.</span>
                  ) : (
                    <>
                      {output.map((line, i) => (
                        <span key={i} className={
                          line === 'Liftoff! 🚀' ? 'text-emerald-300' :
                          line.includes('5, 5') ? 'text-rose-400' : 'text-slate-200'
                        }>
                          {line}
                        </span>
                      ))}
                      <div className={`flex items-center gap-2 mt-2 text-xs font-sans font-bold ${
                        allPassed ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {allPassed ? (
                          <><Check className="w-3.5 h-3.5 stroke-[3]" /> Program finished successfully.</>
                        ) : (
                          <><X className="w-3.5 h-3.5" /> Program error — check your loop.</>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'testResults' && (
                <div className="flex flex-col gap-2">
                  {tests.map((t, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs font-sans font-semibold ${
                      t.pass ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {t.pass
                        ? <Check className="w-3.5 h-3.5 stroke-[3]" />
                        : <X className="w-3.5 h-3.5 text-rose-400" />
                      }
                      {t.label}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'console' && (
                <span className="text-slate-500 text-xs">No console output.</span>
              )}
            </div>
          </div>

          {/* Example Error Reference Callout */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4">
            <div className="text-[10px] font-pixel font-bold text-rose-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <X className="w-3.5 h-3.5" />
              EXAMPLE ERROR (for reference)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Inset dark terminal: infinite loop */}
              <div className="bg-[#1e293b] rounded-xl p-3 font-mono text-xs space-y-0.5">
                <div className="text-slate-500 text-[10px] mb-1 font-pixel uppercase">terminal</div>
                {['5', '5', '5', '5', '...'].map((line, i) => (
                  <div key={i} className="text-rose-400">{line}</div>
                ))}
                <div className="flex items-center gap-1.5 mt-2 text-[10px] font-sans font-bold text-rose-500">
                  <X className="w-3 h-3" />
                  Test failed — Your loop never changes count.
                </div>
              </div>

              {/* Lumi assistant strip */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <LumiPixelBot size={26} glowing={false} />
                  <p className="text-[11px] text-slate-600 leading-snug italic flex-1">
                    &ldquo;You&apos;re close. Check what happens to count after each iteration.&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="w-full py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors"
                >
                  Get Hint
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN — TESTS & QUEST COMPLETE (~26%)           */}
        {/* ====================================================== */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* Test Results Checklist */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="font-pixel text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              TEST RESULTS
            </div>

            <div className="flex flex-col gap-2">
              {tests.map((t, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold transition-all ${
                    t.pass
                      ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                      : 'text-slate-500 bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    t.pass ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {t.pass ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[9px] font-bold">{i+1}</span>}
                  </div>
                  {t.label}
                </div>
              ))}
            </div>

            <div className={`text-center py-2 rounded-xl text-xs font-bold border ${
              allPassed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {tests.filter(t => t.pass).length} / {tests.length} tests passed
            </div>
          </div>

          {/* Quest Complete Achievement Card */}
          {allPassed && (
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-md space-y-4 animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-center gap-2 text-[11px] font-pixel font-bold text-emerald-600 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                QUEST COMPLETE
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>

              {/* Pixel Celebration Scene */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 p-1 flex items-center justify-center shrink-0">
                  <img
                    src="/extracted/course/course_hero_art.png"
                    alt="Celebrating coder"
                    className="w-full h-full object-contain"
                    onError={e => { e.currentTarget.src = '/pixel_terminal_workspace.jpg' }}
                  />
                </div>
                <div className="relative bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2 text-[11px] text-slate-700 font-medium flex-1 leading-snug">
                  <LumiPixelBot size={18} glowing={false} />
                  &ldquo;Quest complete! You just mastered while loops.&rdquo;
                  <div className="absolute top-3 -left-1.5 w-2.5 h-2.5 bg-emerald-50 border-l border-b border-emerald-200 rotate-45" />
                </div>
              </div>

              {/* Reward */}
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-800 text-sm">+120 XP</span>
              </div>

              {/* Skill Unlocked */}
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 border border-indigo-200">
                <span className="text-[10px] font-pixel font-bold text-indigo-500 uppercase tracking-wider">NEW SKILL UNLOCKED:</span>
                <span className="font-bold text-indigo-800 text-xs flex items-center gap-1">
                  ⚙️ Loop Logic
                </span>
              </div>

              {/* Level / XP progress */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-pixel text-slate-500 uppercase tracking-wider">
                  <span>Your XP: <span className="text-emerald-600 font-bold">4,970 XP</span></span>
                  <span className="text-slate-700 font-bold">LVL 12</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: '82%' }} />
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onNextLesson}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Next Lesson
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                >
                  Try Another Challenge
                </button>
              </div>
            </div>
          )}

          {/* Locked state when not all passed */}
          {!allPassed && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-400">Pass all tests to unlock the reward</p>
              <button
                type="button"
                onClick={handleRun}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Run & Check
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM FOOTER NAVIGATION                                     */}
      {/* ============================================================ */}
      <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-200/60 flex-wrap gap-4">
        <button
          type="button"
          onClick={onBackToLesson}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Lesson
        </button>

        <span className="text-xs text-slate-400 font-medium">Exercise 03 / 04</span>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold font-mono">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            +120 XP
          </span>
          <button
            type="button"
            onClick={allPassed ? onNextLesson : undefined}
            disabled={!allPassed}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
              allPassed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Next Lesson
            {allPassed
              ? <ChevronRight className="w-4 h-4" />
              : <Lock className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
