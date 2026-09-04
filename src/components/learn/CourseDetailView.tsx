import React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Star,
  Clock,
  BookOpen,
  Award,
  Flame,
  Gamepad2,
  Sparkles,
} from 'lucide-react'

interface CourseDetailViewProps {
  onBackToCourses: () => void
  onStartQuest?: () => void
  onSelectLesson?: (lessonId: string) => void
  onOpenLumi?: () => void
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  onBackToCourses,
  onStartQuest,
  onSelectLesson,
  onOpenLumi,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-16 select-none animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMB & BACK BUTTON                                            */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToCourses}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-emerald-700 hover:bg-stone-200/50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400 font-medium">
          <span>Learn</span>
          <span>/</span>
          <span>Python</span>
          <span>/</span>
          <span className="text-stone-800 font-bold">Python Adventure</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COURSE HERO CARD                                                       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 lg:p-7 border-2 border-emerald-400/80 shadow-[0_4px_24px_rgba(16,185,129,0.08)] flex flex-col justify-between gap-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Hero Left Content */}
          <div className="flex flex-col gap-2.5 flex-1 max-w-2xl">
            {/* Category / Level Label */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-pixel text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>PYTHON • BEGINNER</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">
              Python Adventure
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
              Master programming fundamentals by completing quests, solving challenges, and building real projects.
            </p>

            {/* Rating / Students */}
            <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <span>★★★★★</span>
                <span className="text-stone-900 font-mono font-black ml-1">4.9</span>
              </div>
              <span className="text-stone-300">•</span>
              <span className="text-stone-500 font-medium">12,400+ adventurers</span>
            </div>

            {/* Metadata Tags Row */}
            <div className="flex items-center gap-3 flex-wrap pt-1 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-stone-600">
                <BookOpen className="w-3.5 h-3.5 text-stone-400" /> 18 Chapters
              </span>
              <span className="flex items-center gap-1.5 text-stone-600">
                <Clock className="w-3.5 h-3.5 text-stone-400" /> 8–10 Hours
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                Beginner
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-pixel text-[10px] font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> +2,400 XP
              </span>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onStartQuest}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue Quest</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Preview Course
              </button>
            </div>
          </div>

          {/* Hero Right: Adventure Pixel Scene Artwork */}
          <div className="shrink-0 w-full lg:w-[460px] h-48 sm:h-56 relative rounded-2xl overflow-hidden flex items-center justify-center">
            <img
              src="/extracted/course/course_hero_art.png"
              alt="Python Adventure World"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROW 2: WHAT YOU'LL LEARN & SKILLS YOU'LL UNLOCK                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: What You'll Learn (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base text-emerald-600">📖</span>
            <h2 className="font-bold text-base text-stone-900">What You&apos;ll Learn</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs font-medium text-stone-700">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Variables & Data Types</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Functions</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Lists & Dictionaries</span>
            </div>

            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Conditions</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Error Handling</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Building Real Projects</span>
            </div>

            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
              <span>Loops</span>
            </div>
          </div>
        </div>

        {/* Right: Skills You'll Unlock (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base text-purple-600">⚙️</span>
            <h2 className="font-bold text-base text-stone-900">Skills You&apos;ll Unlock</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold flex items-center gap-1.5">
              <img src="/extracted/icon_python_snake.png" alt="" className="w-3.5 h-3.5 object-contain" />
              <span>Python</span>
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold">
              Logic
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              Problem Solving
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              Debugging
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
              Functions
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              Data Structures
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN BODY 3-COLUMN SECTION (TIMELINE + CURRENT QUEST/FINAL BUILD + STATS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ===================================================================== */}
        {/* LEFT COLUMN: YOUR ADVENTURE VERTICAL CHAPTER TIMELINE (5 Cols)        */}
        {/* ===================================================================== */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-base text-emerald-600">🗺️</span>
              <h2 className="font-bold text-base text-stone-900">Your Adventure</h2>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Complete each chapter to unlock the next.
            </p>
          </div>

          {/* Timeline Node Chain */}
          <div className="relative flex flex-col gap-5 pt-2">
            {/* Vertical Line Guide */}
            <div className="absolute left-3.5 top-6 bottom-6 w-0.5 bg-stone-200 z-0" />
            <div className="absolute left-3.5 top-6 h-[55%] w-0.5 bg-emerald-500 z-0" />

            {/* CHAPTER 01 */}
            <div className="relative z-10 flex items-start gap-3.5 group">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-emerald-100">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] font-pixel text-stone-400 font-bold uppercase">
                    CHAPTER 01
                  </div>
                  <h3 className="text-xs font-bold text-stone-900">Welcome to Python</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    ✓ Completed
                  </span>
                </div>
                <div className="flex items-center gap-1 font-pixel text-[9.5px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>+250 XP</span>
                </div>
              </div>
            </div>

            {/* CHAPTER 02 */}
            <div className="relative z-10 flex items-start gap-3.5 group">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-emerald-100">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] font-pixel text-stone-400 font-bold uppercase">
                    CHAPTER 02
                  </div>
                  <h3 className="text-xs font-bold text-stone-900">Variables & Data</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    ✓ Completed
                  </span>
                </div>
                <div className="flex items-center gap-1 font-pixel text-[9.5px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>+350 XP</span>
                </div>
              </div>
            </div>

            {/* CHAPTER 03 */}
            <div className="relative z-10 flex items-start gap-3.5 group">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-emerald-100">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] font-pixel text-stone-400 font-bold uppercase">
                    CHAPTER 03
                  </div>
                  <h3 className="text-xs font-bold text-stone-900">Making Decisions</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    ✓ Completed
                  </span>
                </div>
                <div className="flex items-center gap-1 font-pixel text-[9.5px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>+400 XP</span>
                </div>
              </div>
            </div>

            {/* CHAPTER 04: ACTIVE / EXPANDED CHAPTER CARD */}
            <div className="relative z-10 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md ring-4 ring-emerald-300/60 animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>

              <div className="flex-1 bg-emerald-50/60 rounded-2xl p-4 border-2 border-emerald-400 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-pixel text-stone-600 font-bold uppercase">
                        CHAPTER 04
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[8px] font-pixel font-bold uppercase">
                        CURRENT
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-stone-900 mt-0.5">Loops & Logic</h3>
                  </div>

                  <span className="font-pixel text-xs font-bold text-emerald-700">78%</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Make your programs repeat, react, and become more powerful.
                </p>

                {/* Lessons Sub-list */}
                <div className="flex flex-col gap-1.5 pt-1 border-t border-emerald-200/60 text-xs">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Lessons:</span>
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    <span>Lesson 01 — Understanding Loops</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-700">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    <span>Lesson 02 — for Loops</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectLesson?.('ch4-lesson3')}
                    className="w-full flex items-center gap-1.5 text-emerald-800 font-bold bg-white p-1.5 rounded-lg border border-emerald-200 shadow-2xs hover:border-emerald-400 hover:bg-emerald-50/60 transition-all text-left cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                    <span>Lesson 03 — while Loops</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <span className="w-3 h-3 rounded-full border border-stone-300 inline-block shrink-0" />
                    <span>Lesson 04 — Loop Challenge</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                  <div className="flex items-center gap-1 font-pixel text-[9.5px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    <Award className="w-3 h-3 text-amber-600" />
                    <span>+500 XP</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectLesson ? onSelectLesson('ch4-lesson3') : onStartQuest?.()}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Continue Chapter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CHAPTER 05: LOCKED */}
            <div className="relative z-10 flex items-start gap-3.5 opacity-60">
              <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-300 text-stone-400 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] font-pixel text-stone-400 font-bold uppercase">
                    CHAPTER 05
                  </div>
                  <h3 className="text-xs font-bold text-stone-600">Functions</h3>
                </div>
                <span className="text-[10px] text-stone-400 font-medium">Complete Chapter 04</span>
              </div>
            </div>

            {/* CHAPTER 06: LOCKED */}
            <div className="relative z-10 flex items-start gap-3.5 opacity-60">
              <div className="w-7 h-7 rounded-full bg-stone-100 border border-stone-300 text-stone-400 flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] font-pixel text-stone-400 font-bold uppercase">
                    CHAPTER 06
                  </div>
                  <h3 className="text-xs font-bold text-stone-600">Build Your First Python Project</h3>
                </div>
                <span className="text-[10px] text-stone-400 font-medium">Complete Chapter 05</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MIDDLE COLUMN: CURRENT QUEST + FINAL BUILD + LUMI GUIDE (4.5 Cols)    */}
        {/* ===================================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* CURRENT QUEST CARD */}
          <div className="bg-white rounded-3xl p-5 border-2 border-emerald-400/80 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider font-pixel border border-emerald-200">
                <Gamepad2 className="w-3 h-3 text-emerald-600" />
                <span>CURRENT QUEST</span>
              </div>

              <div className="font-pixel text-[10px] font-bold text-amber-600">
                ⭐ +80 XP
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="font-extrabold text-sm text-stone-900 leading-tight">
                  Build a Number Guessing Game
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Use variables, conditions and loops to build a playable number guessing game.
                </p>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500 font-medium">
                  <span className="text-amber-500 font-mono text-[11px]">★★☆☆☆ Difficulty</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-stone-400" /> 20 min
                  </span>
                </div>
              </div>

              <div className="w-24 h-20 shrink-0">
                <img
                  src="/extracted/course/quest_terminal_question.png"
                  alt="Terminal"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onStartQuest}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Start Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* YOUR FINAL BUILD CARD */}
          <div className="bg-white rounded-3xl p-5 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base text-emerald-600">📖</span>
              <h3 className="font-bold text-sm text-stone-900">Your Final Build</h3>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-28 h-20 shrink-0 rounded-xl overflow-hidden border border-stone-200">
                <img
                  src="/extracted/course/final_build_preview.png"
                  alt="Game Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <h4 className="font-bold text-xs text-stone-900">Python Adventure Game</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  You&apos;ll use the skills from this course to create a complete mini project.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[9.5px] font-bold">
                    🐍 Python
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[9.5px] font-bold">
                    🏆 Project Badge
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Preview Project
            </button>
          </div>

          {/* LUMI RECOMMENDATION CARD */}
          <div className="bg-gradient-to-r from-purple-50/80 via-white to-white rounded-3xl p-5 border border-purple-200/80 shadow-xs flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <img src="/extracted/lumi_guide_large.png" alt="Lumi" className="w-10 h-10 object-contain shrink-0" />
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-xs text-stone-900">Lumi&apos;s Recommendation</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  &ldquo;You&apos;re 78% through the adventure. Finish Loops & Logic next — Functions unlock right after it.&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onStartQuest}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={onOpenLumi}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Ask Lumi
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: PROGRESS METRICS & SUMMARY STACK (2.5 Cols)             */}
        {/* ===================================================================== */}
        <div className="lg:col-span-3 flex flex-col gap-4 sticky top-6">
          {/* YOUR PROGRESS DIAL CARD */}
          <div className="bg-white rounded-3xl p-5 border border-[#ece7df] shadow-xs flex flex-col items-center text-center gap-4">
            <div className="font-pixel text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              YOUR PROGRESS
            </div>

            {/* Radial Ring 78% */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="78, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-black text-xl text-stone-900 font-pixel">78%</span>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2 border-t border-stone-100 text-xs">
              <div className="flex items-center justify-between text-stone-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-stone-400" /> 18 Chapters
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> 14 Completed
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block" /> 4 Remaining
                </span>
              </div>
            </div>
          </div>

          {/* XP AVAILABLE CARD */}
          <div className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">XP AVAILABLE</span>
              <span className="font-pixel text-sm font-bold text-amber-600 mt-0.5">+900 XP</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
              <Sparkles className="w-4 h-4 fill-amber-400" />
            </div>
          </div>

          {/* STREAK CARD */}
          <div className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">STREAK</span>
              <span className="text-xs font-bold text-orange-600 mt-0.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> 7 days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM NAVIGATION CONTROLS                                             */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-6 border-t border-[#ece7df]">
        <button
          type="button"
          onClick={onBackToCourses}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Course</span>
        </button>

        <button
          type="button"
          onClick={onStartQuest}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-xs transition-all cursor-pointer"
        >
          <span>Continue Quest</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
