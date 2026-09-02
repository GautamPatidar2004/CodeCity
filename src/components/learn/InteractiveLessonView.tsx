import React, { useState } from 'react'
import {
  ArrowLeft,
  Check,
  Copy,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react'
import { LumiPixelBot, PixelPythonIcon } from '../brand/PixelArtAvatars'
import confetti from 'canvas-confetti'

interface InteractiveLessonViewProps {
  onBackToCourse?: () => void
  onPreviousLesson?: () => void
  onNextLesson?: () => void
}

export const InteractiveLessonView: React.FC<InteractiveLessonViewProps> = ({
  onBackToCourse,
  onPreviousLesson,
  onNextLesson,
}) => {
  // 1. Interactive Quiz State
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D'>('B')
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false)
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null)

  // 2. Code Block Copy States
  const [copiedMainCode, setCopiedMainCode] = useState<boolean>(false)

  // 3. Lumi Interactive Help Drawer State
  const [activeLumiTip, setActiveLumiTip] = useState<'hint' | 'simple' | 'example' | null>(null)

  // 4. Exercise navigation
  // Uses onNextLesson from parent (AppShell) to navigate to CodingChallengeView

  // Copy handler
  const handleCopyMainCode = () => {
    const code = `energy = 3\n\nwhile energy > 0:\n    print("Keep coding!")\n    energy -= 1`
    navigator.clipboard.writeText(code)
    setCopiedMainCode(true)
    setTimeout(() => setCopiedMainCode(false), 2000)
  }

  // Quiz Check Handler
  const handleCheckAnswer = () => {
    setQuizSubmitted(true)
    if (selectedOption === 'A') {
      setQuizResult('correct')
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
        })
      } catch {
        // ignore in test environments
      }
    } else {
      setQuizResult('incorrect')
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-16 select-none animate-in fade-in duration-300 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP SUBTLE BREADCRUMB                                                   */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToCourse}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-stone-200/50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Python Adventure / Loops & Logic / Lesson 03</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Chapter 04</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">Lesson 03 of 04</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN LAYOUT (~75% Main Content / ~25% Right Sidebar)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: MAIN LESSON CONTENT (~75% = 9 Cols on XL / 8 on LG)        */}
        {/* ======================================================================= */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          {/* --------------------------------------------------------------------- */}
          {/* A. LESSON HEADER CARD                                                 */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex flex-col gap-1 flex-1 max-w-xl">
              <div className="text-emerald-600 font-pixel text-[11px] font-bold uppercase tracking-wider">
                CHAPTER 04 • LESSON 03
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-sans tracking-tight">
                Make Your Code Repeat
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Learn how while loops let your programs keep working until a condition changes.
              </p>
            </div>

            {/* Right Pixel Art: Coder at laptop with Lumi robot hovering */}
            <div className="shrink-0 flex items-center justify-center relative">
              <div className="relative w-44 h-28 sm:w-52 sm:h-32 flex items-center justify-center">
                <img
                  src="/extracted/course/course_hero_art.png"
                  alt="Coder and Lumi"
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = '/extracted/hero1_alex_desk.png'
                  }}
                />
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* B. "YOUR MISSION" BANNER                                              */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-emerald-50/40 border-2 border-emerald-300 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden shadow-xs">
            {/* Left Art: Coder and Lumi examining a terminal screen with speech bubble */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-200 p-1 shadow-xs flex items-center justify-center">
                  <img
                    src="/extracted/first_quest_terminal.png"
                    alt="Terminal"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/pixel_terminal_workspace.jpg'
                    }}
                  />
                </div>
                <div className="absolute -top-1 -right-1">
                  <LumiPixelBot size={22} glowing={false} />
                </div>
              </div>

              {/* Speech bubble */}
              <div className="relative bg-white border border-emerald-200 rounded-2xl px-3.5 py-2 text-[11px] text-slate-700 font-medium shadow-2xs max-w-[210px] leading-snug">
                &ldquo;Sometimes your code needs to keep going until the job is done.&rdquo;
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-white border-l border-b border-emerald-200 rotate-45" />
              </div>
            </div>

            {/* Right Mission Copy */}
            <div className="flex flex-col gap-1.5 flex-1 border-t sm:border-t-0 sm:border-l border-emerald-200/80 pt-3 sm:pt-0 sm:pl-6">
              <div className="flex items-center gap-2">
                <span className="text-base">🚩</span>
                <h2 className="font-bold text-slate-900 text-base font-sans">
                  Your Mission
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Teach your program how to repeat an action until a condition becomes false.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono font-bold pt-1">
                <span className="text-amber-700 flex items-center gap-1">
                  <span>🏆</span> +80 XP
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> 8 min
                </span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* C. CONCEPT EXPLANATION & INTERACTIVE CODE SNIPPET CARD                */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-6">
            {/* Title & Definition */}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                What Is a while Loop?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A while loop repeats a block of code as long as a condition remains true.
              </p>
            </div>

            {/* Formula Strip: Light lavender pill/banner */}
            <div className="bg-indigo-50/70 rounded-2xl p-3.5 flex items-center gap-3 border border-indigo-100 text-xs sm:text-sm font-mono text-indigo-950 flex-wrap">
              <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-2xs shrink-0">
                <Lightbulb className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs uppercase tracking-wider">
                WHILE
              </span>
              <span className="text-slate-700 font-sans font-medium">
                condition is true
              </span>
              <span className="text-indigo-600 font-bold">→</span>
              <span className="text-emerald-700 font-bold font-sans">
                run the code
              </span>
            </div>

            {/* Dark IDE Code Block */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-md bg-[#1e293b]">
              {/* Top Bar */}
              <div className="px-4 py-2.5 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-sky-950/60 border border-sky-800/60">
                    <PixelPythonIcon size={16} />
                  </div>
                  <span className="font-pixel text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                    PYTHON
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyMainCode}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Copy code snippet"
                >
                  {copiedMainCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Syntax Highlighted Code */}
              <div className="p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto text-slate-100">
                <div className="flex items-center">
                  <span className="w-6 text-slate-500 select-none text-right pr-4">1</span>
                  <span>
                    <span className="text-slate-100 font-semibold">energy</span>{' '}
                    <span className="text-emerald-400">=</span>{' '}
                    <span className="text-amber-400">3</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 text-slate-500 select-none text-right pr-4">2</span>
                  <span>&nbsp;</span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 text-slate-500 select-none text-right pr-4">3</span>
                  <span>
                    <span className="text-purple-400 font-bold">while</span>{' '}
                    <span className="text-slate-100 font-semibold">energy</span>{' '}
                    <span className="text-emerald-400">&gt;</span>{' '}
                    <span className="text-amber-400">0</span>
                    <span className="text-slate-300">:</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 text-slate-500 select-none text-right pr-4">4</span>
                  <span className="pl-6">
                    <span className="text-sky-400 font-bold">print</span>
                    <span className="text-slate-300">(</span>
                    <span className="text-emerald-300">&quot;Keep coding!&quot;</span>
                    <span className="text-slate-300">)</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-6 text-slate-500 select-none text-right pr-4">5</span>
                  <span className="pl-6">
                    <span className="text-slate-100 font-semibold">energy</span>{' '}
                    <span className="text-emerald-400">-=</span>{' '}
                    <span className="text-amber-400">1</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Step Breakdown Flow (3 Steps Horizontal Connected Cards) */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-pixel">
                Let&apos;s break it down.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                {/* Step 01 */}
                <div className="bg-[#faf8f4] border border-[#ece7df] rounded-2xl p-4 flex flex-col gap-2 relative">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">
                      01
                    </span>
                    <span className="font-bold text-xs text-slate-900 font-sans">
                      Check the condition
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Python checks whether <code className="px-1.5 py-0.5 rounded bg-white text-emerald-700 border border-slate-200 font-mono font-bold">energy &gt; 0</code>.
                  </p>
                </div>

                {/* Step 02 */}
                <div className="bg-[#faf8f4] border border-[#ece7df] rounded-2xl p-4 flex flex-col gap-2 relative">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">
                      02
                    </span>
                    <span className="font-bold text-xs text-slate-900 font-sans">
                      Run the block
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    If the condition is true, the code inside the loop runs.
                  </p>
                </div>

                {/* Step 03 */}
                <div className="bg-[#faf8f4] border border-[#ece7df] rounded-2xl p-4 flex flex-col gap-2 relative">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">
                      03
                    </span>
                    <span className="font-bold text-xs text-slate-900 font-sans">
                      Update the value
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <code className="px-1.5 py-0.5 rounded bg-white text-emerald-700 border border-slate-200 font-mono font-bold">energy</code> decreases by 1 until the condition becomes false.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* D. "PREDICT THE OUTPUT" INTERACTIVE QUIZ WIDGET                      */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-indigo-50/40 rounded-3xl p-6 border border-indigo-100 shadow-sm flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-sm shadow-2xs shrink-0">
                ❓
              </div>
              <div className="flex flex-col">
                <h3 className="font-black text-slate-900 text-base font-sans tracking-tight">
                  Predict the Output
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  What will this code print?
                </p>
              </div>
            </div>

            {/* Content Row: Mini Code Window + Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-1">
              {/* Mini code snippet window (5 Cols) */}
              <div className="md:col-span-5 bg-[#1e293b] rounded-2xl p-4 border border-slate-800 shadow-sm font-mono text-xs text-slate-100 leading-relaxed">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-pixel">
                  <span>PYTHON</span>
                  <span className="text-slate-500">terminal</span>
                </div>
                <div className="text-slate-100">
                  <p><span className="text-slate-100 font-semibold">energy</span> <span className="text-emerald-400">=</span> <span className="text-amber-400">3</span></p>
                  <p><span className="text-purple-400 font-bold">while</span> <span className="text-slate-100 font-semibold">count</span> <span className="text-emerald-400">&gt;</span> <span className="text-amber-400">0</span><span className="text-slate-300">:</span></p>
                  <p className="pl-4"><span className="text-sky-400 font-bold">print</span><span className="text-slate-300">(</span><span className="text-slate-100">count</span><span className="text-slate-300">)</span></p>
                  <p className="pl-4"><span className="text-slate-100 font-semibold">count</span> <span className="text-emerald-400">-=</span> <span className="text-amber-400">1</span></p>
                </div>
              </div>

              {/* Options Grid (7 Cols) */}
              <div className="md:col-span-7 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'A' as const, text: '3 2 1', label: 'A. 3 2 1' },
                    { id: 'B' as const, text: '3 2 1 0', label: 'B. 3 2 1 0' },
                    { id: 'C' as const, text: '2 1 0', label: 'C. 2 1 0' },
                    { id: 'D' as const, text: 'Infinite loop', label: 'D. Infinite loop' },
                  ].map((opt) => {
                    const isSelected = selectedOption === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedOption(opt.id)
                          setQuizSubmitted(false)
                        }}
                        className={`p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left flex items-center justify-between border ${
                          isSelected
                            ? 'border-2 border-indigo-500 bg-white text-indigo-950 shadow-xs scale-101'
                            : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="font-mono">{opt.label}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Check Answer Button & Validation Feedback */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Check Answer</span>
                  </button>

                  {quizSubmitted && quizResult === 'correct' && (
                    <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                      <span>🎉</span>
                      <span>Correct! When count reaches 0, the loop condition fails before printing 0! (+25 XP)</span>
                    </div>
                  )}

                  {quizSubmitted && quizResult === 'incorrect' && (
                    <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                      <span>💡</span>
                      <span>Almost! The loop condition is <code className="font-bold font-mono">count &gt; 0</code>. When count is 0, it exits immediately! Correct is <strong>A (3 2 1)</strong>.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* E. KEY IDEA WARNING STRIP                                            */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[10px] font-pixel uppercase font-bold text-amber-800 tracking-wider">
                  KEY IDEA
                </div>
                <p className="text-xs text-amber-950 leading-relaxed font-sans">
                  A loop needs a condition that eventually becomes false. Otherwise, you may create an infinite loop.
                </p>
              </div>
            </div>

            {/* Right: Pixel purple bug monster with sparkles */}
            <div className="shrink-0 flex items-center gap-1">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <img
                  src="/extracted/badge_bug_hunter.png"
                  alt="Bug Monster"
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* F. LUMI HELP ASSISTANT PILL BANNER                                   */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LumiPixelBot size={34} />
              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-900 font-sans">
                  Lumi Help
                </span>
                <span className="text-xs text-slate-600">
                  Want me to explain while loops another way?
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveLumiTip(activeLumiTip === 'hint' ? null : 'hint')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeLumiTip === 'hint'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                Give me a hint
              </button>
              <button
                type="button"
                onClick={() => setActiveLumiTip(activeLumiTip === 'simple' ? null : 'simple')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeLumiTip === 'simple'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                Explain simply
              </button>
              <button
                type="button"
                onClick={() => setActiveLumiTip(activeLumiTip === 'example' ? null : 'example')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeLumiTip === 'example'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                Show another example
              </button>
            </div>
          </div>

          {/* Interactive Lumi Tip Drawer */}
          {activeLumiTip && (
            <div className="p-4 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm flex flex-col gap-2 animate-in fade-in duration-200 text-xs text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-bold text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>
                    {activeLumiTip === 'hint' && 'Lumi Hint: Think of a while loop like a traffic light!'}
                    {activeLumiTip === 'simple' && 'Simple Analogy: While you are hungry, take a bite.'}
                    {activeLumiTip === 'example' && 'Another Real-World Example: Countdown Timer'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLumiTip(null)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeLumiTip === 'hint' && (
                <p className="leading-relaxed">
                  Always check what changes inside the loop. If the variable in the condition never updates, the loop will run forever!
                </p>
              )}
              {activeLumiTip === 'simple' && (
                <p className="leading-relaxed">
                  Every time you take a bite, you check: &quot;Am I still hungry?&quot; When you&apos;re full, the condition becomes False, and you stop eating!
                </p>
              )}
              {activeLumiTip === 'example' && (
                <div className="bg-[#1e293b] text-slate-100 p-3 rounded-xl font-mono text-[11px] leading-relaxed">
                  <p><span className="text-slate-400"># Rocket launch countdown</span></p>
                  <p><span className="text-slate-100 font-semibold">seconds</span> = <span className="text-amber-400">10</span></p>
                  <p><span className="text-purple-400">while</span> seconds &gt; <span className="text-amber-400">0</span>:</p>
                  <p className="pl-4"><span className="text-sky-400">print</span>(&apos;T-minus &#123;seconds&#125;&apos;)</p>
                  <p className="pl-4">seconds -= <span className="text-amber-400">1</span></p>
                  <p><span className="text-sky-400">print</span>(&quot;Liftoff! 🚀&quot;)</p>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* G. BOTTOM NAVIGATION BAR                                             */}
          {/* --------------------------------------------------------------------- */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/80 flex-wrap gap-4">
            <button
              type="button"
              onClick={onPreviousLesson || onBackToCourse}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Lesson</span>
            </button>

            <button
              type="button"
              onClick={onNextLesson || onBackToCourse}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              Next: Build a Countdown →
            </button>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono">
                ⭐ +80 XP
              </span>

              <button
                type="button"
                onClick={onNextLesson}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all active:scale-95 text-xs flex items-center gap-2"
              >
                <span>Start Exercise</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: LESSON PROGRESS PANEL (~25% = 3 on XL / 4 on LG)          */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-5">
          {/* A. Chapter Completion Header */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-pixel text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>LESSON 3 OF 4</span>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              </div>
              <span className="font-pixel text-[10px] font-bold text-emerald-600">78%</span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="h-2 rounded-full bg-emerald-500" />
              <div className="h-2 rounded-full bg-emerald-500" />
              <div className="h-2 rounded-full bg-emerald-500" />
              <div className="h-2 rounded-full bg-stone-100" />
            </div>
            <div className="text-[11px] font-semibold text-slate-500 text-left">
              78% Chapter Complete
            </div>
          </div>

          {/* B. Lesson Progress Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              <span>📊</span>
              <span>Lesson Progress</span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Lesson</span>
                <span className="font-mono font-bold text-slate-900">3 / 4</span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Chapter</span>
                  <span className="font-mono font-bold text-emerald-600">78%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>

            {/* C. Concepts Checklist */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-pixel">
                Concepts
              </span>

              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-400 line-through">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />
                  <span>Conditions</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 line-through">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />
                  <span>for Loops</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
                  <span>while Loops</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-3 h-3 rounded-full border border-slate-300 inline-block shrink-0" />
                  <span>Nested Loops</span>
                </div>
              </div>
            </div>

            {/* D. Skills Acquired Tags */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-pixel">
                Skills
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                  Loops
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold">
                  Logic
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Iteration
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
