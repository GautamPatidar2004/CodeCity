import React, { useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Check,
  Lock,
  Star,
  Clock,
  BookOpen,
} from 'lucide-react'

interface LearnCatalogViewProps {
  onSelectCourse?: (courseId: string) => void
  onOpenLumi?: () => void
}

export type CategoryFilterKey =
  | 'all'
  | 'programming'
  | 'web'
  | 'ai'
  | 'game'
  | 'tools'
  | 'career'

export const LearnCatalogView: React.FC<LearnCatalogViewProps> = ({
  onSelectCourse,
  onOpenLumi,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilterKey>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories: Array<{ key: CategoryFilterKey; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'programming', label: 'Programming' },
    { key: 'web', label: 'Web Development' },
    { key: 'ai', label: 'AI & Data' },
    { key: 'game', label: 'Game Development' },
    { key: 'tools', label: 'Tools' },
    { key: 'career', label: 'Career' },
  ]

  // Recommended Path Nodes data matching Image
  const pathNodes = [
    {
      step: 'FOUNDATIONS',
      title: 'HTML + CSS',
      status: 'completed',
      sub: '✓ HTML + CSS',
    },
    {
      step: 'PROGRAMMING',
      title: 'Python',
      status: 'current',
      sub: '● Python',
    },
    {
      step: 'WEB',
      title: 'JavaScript',
      status: 'locked',
      sub: '○ JavaScript',
    },
    {
      step: 'BUILD',
      title: 'React',
      status: 'locked',
      sub: '○ React',
    },
    {
      step: 'AI',
      title: 'AI Explorer',
      status: 'locked',
      sub: '○ AI Explorer',
    },
    {
      step: 'MASTER',
      title: 'Advanced Projects',
      status: 'locked',
      sub: '○ Advanced Projects',
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-16 select-none">
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER (TITLE, SUBTITLE & ALEX HOLDING MAP ARTWORK)               */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-1.5 text-emerald-600 font-pixel text-[10px] font-bold tracking-wider uppercase">
            <span className="text-amber-400">✦</span>
            <span>YOUR CODING LIBRARY</span>
            <span className="text-amber-400">✦</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Choose Your Next Quest
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Learn real programming skills through interactive lessons, challenges, and projects.
          </p>
        </div>

        {/* Right side: Alex with parchment coding map & floating castle */}
        <div className="hidden md:flex shrink-0 w-64 h-24 items-center justify-end">
          <img
            src="/extracted/learn/header_art_alex_map.png"
            alt="Alex with coding map"
            className="h-full w-auto object-contain"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTER CONTROLS                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3">
        {/* Search Input Bar + Filters Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, languages, or skills..."
              className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white border border-[#ece7df] text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <button
            type="button"
            className="h-11 px-4 rounded-2xl bg-white border border-[#ece7df] text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs sm:text-sm font-semibold shadow-2xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone-500" />
            <span>Filters</span>
          </button>
        </div>

        {/* Indicator + Category Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-xs text-stone-500 font-medium">
            24 adventures available
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:text-stone-900 border border-[#ece7df] hover:border-stone-300'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FEATURED ADVENTURE (PYTHON ADVENTURE)                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400/80 shadow-[0_4px_24px_rgba(16,185,129,0.08)] flex flex-col justify-between gap-5 relative overflow-hidden">
        {/* Top Header Badge Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-bold shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>RECOMMENDED FOR YOU</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-pixel font-bold shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>+2,400 XP</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <img src="/extracted/icon_python_snake.png" alt="Python" className="w-9 h-9 object-contain" />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Python Adventure
              </h2>
              <p className="text-xs sm:text-sm text-stone-600">
                From your first variable to your first real project.
              </p>

              {/* Meta Tags */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-bold text-[11px]">
                  Python
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  Beginner
                </span>
                <span className="flex items-center gap-1 text-stone-500 text-[11.5px] font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-stone-400" /> 18 Chapters
                </span>
                <span className="flex items-center gap-1 text-stone-500 text-[11.5px] font-medium">
                  <Clock className="w-3.5 h-3.5 text-stone-400" /> 8–10 Hours
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3 mt-2 max-w-md">
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="text-xs text-stone-500 font-medium">Chapter 4 of 6</span>
                <span className="font-pixel text-[10px] font-bold text-emerald-600">78%</span>
              </div>
            </div>
          </div>

          {/* Right side scene: Alex coding in grassy field with terminals & crystals */}
          <div className="hidden lg:flex shrink-0 w-80 h-28 items-center justify-center">
            <img
              src="/extracted/learn/featured_python_art.png"
              alt="Python World Scene"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Buttons CTA */}
        <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => onSelectCourse && onSelectCourse('python')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Continue Quest</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSelectCourse && onSelectCourse('python')}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            View Course
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EXPLORE ADVENTURES (3-COLUMN GRID OF 6 CARDS)                          */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <span className="text-base text-emerald-600">📖</span>
          <h2 className="text-lg font-bold text-stone-900">Explore Adventures</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* ------------------------------------------------------------- */}
          {/* COURSE 01: PYTHON ADVENTURE                                  */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-5 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <img
                  src="/extracted/learn/illust_python.png"
                  alt="Python Adventure"
                  className="w-16 h-14 object-contain rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-pixel text-[9px] font-bold uppercase">
                    PYTHON
                  </span>
                  <h3 className="font-bold text-sm text-stone-900 mt-1 group-hover:text-emerald-700 transition-colors truncate">
                    Python Adventure
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                    Learn programming fundamentals by building real projects.
                  </p>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium pt-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-emerald-700">Beginner</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-stone-400" /> 8–10 hours
                </span>
                <span className="font-pixel text-[10px] font-bold text-amber-600">
                  +2,400 XP
                </span>
              </div>
            </div>

            {/* Progress & CTA */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden mr-3">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="font-pixel text-[10px] font-bold text-emerald-600">78%</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectCourse && onSelectCourse('python')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 02: JAVASCRIPT JOURNEY                                */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-5 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <img
                  src="/extracted/learn/illust_js.png"
                  alt="JavaScript Journey"
                  className="w-16 h-14 object-contain rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-pixel text-[9px] font-bold uppercase">
                    JAVASCRIPT
                  </span>
                  <h3 className="font-bold text-sm text-stone-900 mt-1 group-hover:text-purple-700 transition-colors truncate">
                    JavaScript Journey
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                    Master the language behind interactive web experiences.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 font-medium pt-2 border-t border-stone-100">
                <span className="text-[10px] font-semibold text-stone-600">Beginner → Intermediate</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-stone-400" /> 10–12 hours
                </span>
                <span className="font-pixel text-[10px] font-bold text-amber-600">
                  +3,000 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-400 font-medium">Not Started</span>
              <button
                type="button"
                onClick={() => onSelectCourse && onSelectCourse('javascript')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Start Quest
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 03: WEB BUILDER (HTML + CSS)                          */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-5 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <img
                  src="/extracted/learn/illust_html.png"
                  alt="Web Builder"
                  className="w-16 h-14 object-contain rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-pixel text-[9px] font-bold uppercase">
                    HTML + CSS
                  </span>
                  <h3 className="font-bold text-sm text-stone-900 mt-1 group-hover:text-amber-700 transition-colors truncate">
                    Web Builder
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                    Turn ideas into beautiful websites.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 font-medium pt-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-emerald-700">Beginner</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-stone-400" /> 6–8 hours
                </span>
                <span className="font-pixel text-[10px] font-bold text-amber-600">
                  +1,800 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Completed
              </span>
              <button
                type="button"
                onClick={() => onSelectCourse && onSelectCourse('web-builder')}
                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Review
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 04: REACT REALMS                                      */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-5 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <img
                  src="/extracted/learn/illust_react.png"
                  alt="React Realms"
                  className="w-16 h-14 object-contain rounded-xl shrink-0 opacity-85"
                />
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-pixel text-[9px] font-bold uppercase">
                    REACT
                  </span>
                  <h3 className="font-bold text-sm text-stone-900 mt-1 group-hover:text-sky-700 transition-colors truncate">
                    React Realms
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                    Build modern interfaces with components and state.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 font-medium pt-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-600">Intermediate</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-stone-400" /> 12–15 hours
                </span>
                <span className="font-pixel text-[10px] font-bold text-amber-600">
                  +3,600 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-stone-400" /> Locked
              </span>
              <button
                type="button"
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                View Requirements
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 05: AI EXPLORER                                       */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-5 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <img
                  src="/extracted/lumi_guide_large.png"
                  alt="AI Explorer"
                  className="w-16 h-14 object-contain rounded-xl shrink-0 opacity-85"
                />
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-pixel text-[9px] font-bold uppercase">
                    AI
                  </span>
                  <h3 className="font-bold text-sm text-stone-900 mt-1 group-hover:text-purple-700 transition-colors truncate">
                    AI Explorer
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                    Build intelligent applications and understand how modern AI works.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 font-medium pt-2 border-t border-stone-100">
                <span className="text-[11px] font-semibold text-stone-600">Intermediate</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-stone-400" /> 14–18 hours
                </span>
                <span className="font-pixel text-[10px] font-bold text-amber-600">
                  +4,000 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-stone-400" /> Locked
              </span>
              <button
                type="button"
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                View Requirements
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 06: GAME MAKER                                        */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-5 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <img
                  src="/extracted/icon_gamepad.png"
                  alt="Game Maker"
                  className="w-16 h-14 object-contain rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 font-pixel text-[9px] font-bold uppercase">
                    GAME DEVELOPMENT
                  </span>
                  <h3 className="font-bold text-sm text-stone-900 mt-1 group-hover:text-pink-700 transition-colors truncate">
                    Game Maker
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                    Learn programming by building your own playable worlds.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 font-medium pt-2 border-t border-stone-100">
                <span className="text-[10px] font-semibold text-stone-600">Beginner → Intermediate</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-stone-400" /> 12–16 hours
                </span>
                <span className="font-pixel text-[10px] font-bold text-amber-600">
                  +3,800 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-stone-400 font-medium">Not Started</span>
              <button
                type="button"
                onClick={() => onSelectCourse && onSelectCourse('game-maker')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Start Quest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RECOMMENDED PATH (HORIZONTAL RPG MAP)                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400/80 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base text-emerald-600">📖</span>
            <h3 className="font-bold text-base text-stone-900">Recommended Path</h3>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Your suggested route from fundamentals to real-world projects.
          </span>
        </div>

        {/* Node progression trail */}
        <div className="relative flex items-center justify-between gap-2 overflow-x-auto py-4 px-2">
          {/* Subtle horizontal connecting line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-2 h-1 bg-stone-200 z-0" />
          <div className="absolute left-8 w-[25%] top-1/2 -translate-y-2 h-1 bg-emerald-500 z-0" />

          {pathNodes.map((node, nIdx) => {
            const isCompleted = node.status === 'completed'
            const isCurrent = node.status === 'current'

            return (
              <div
                key={nIdx}
                className="relative z-10 flex flex-col items-center gap-2 min-w-[100px]"
              >
                {/* Node circle */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-white text-emerald-700 border-2 border-emerald-500 ring-4 ring-emerald-300/40'
                      : 'bg-stone-50 text-stone-400 border border-stone-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : isCurrent ? (
                    <img src="/extracted/icon_python_snake.png" alt="Python" className="w-6 h-6 object-contain" />
                  ) : (
                    <Lock className="w-4 h-4 text-stone-400" />
                  )}
                </div>

                <div className="flex flex-col items-center text-center">
                  <span className="text-[9px] font-pixel text-stone-400 font-bold uppercase tracking-wider">
                    {node.step}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isCurrent ? 'text-emerald-700 font-bold' : isCompleted ? 'text-stone-800' : 'text-stone-400'
                    }`}
                  >
                    {node.sub}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BOTTOM MOTIVATIONAL CTA: LUMI RECOMMENDATION                           */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-purple-50/80 via-white to-emerald-50/80 rounded-3xl p-6 border border-purple-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img src="/extracted/lumi_guide_large.png" alt="Lumi" className="w-12 h-12 object-contain shrink-0" />
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
              Not sure where to start?
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Lumi can recommend the right adventure based on your goals.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLumi}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>Ask Lumi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
