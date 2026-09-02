import React, { useState } from 'react'
import {
  ArrowRight,
  Check,
  Lock,
  Star,
  Clock,
  Heart,
  Sparkles,
  Flame,
  Award,
  Layers,
  Repeat,
} from 'lucide-react'
import { getTimeGreeting } from '../../lib/timeGreeting'
import { useAuth } from '../../context/AuthContext'

interface AppShellDashboardViewProps {
  onNavigateTab: (tab: 'learn' | 'practice' | 'build' | 'community') => void
}

export const AppShellDashboardView: React.FC<AppShellDashboardViewProps> = ({
  onNavigateTab,
}) => {
  const { user } = useAuth()
  const { greeting, emoji } = getTimeGreeting()
  const userName = user?.user_metadata?.first_name || 'Alex'

  const [lumiDismissed, setLumiDismissed] = useState(false)
  const [likes, setLikes] = useState({ p1: 124, p2: 98, p3: 87 })
  const [likedMap, setLikedMap] = useState({ p1: false, p2: false, p3: false })

  const handleToggleLike = (key: 'p1' | 'p2' | 'p3') => {
    setLikedMap((prev) => ({ ...prev, [key]: !prev[key] }))
    setLikes((prev) => ({
      ...prev,
      [key]: prev[key] + (likedMap[key] ? -1 : 1),
    }))
  }

  // Adventure Path Steps Data
  const pathNodes = [
    { id: '1', title: 'Python Basics', status: 'completed' },
    { id: '2', title: 'Variables', status: 'completed' },
    { id: '3', title: 'Conditions', status: 'completed' },
    { id: '4', title: 'Loops', status: 'current' },
    { id: '5', title: 'Functions', status: 'locked' },
    { id: '6', title: 'Projects', status: 'locked' },
    { id: '7', title: 'JavaScript', status: 'locked' },
    { id: '8', title: 'AI', status: 'locked' },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-16 select-none">
      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH WELCOME HERO GREETING BANNER (DYNAMIC TIME OF DAY)          */}
      {/* ========================================================================= */}
      <div
        onClick={() => onNavigateTab('learn')}
        className="w-full rounded-3xl overflow-hidden border border-[#ece7df] shadow-xs cursor-pointer hover:shadow-md transition-all relative min-h-[140px] bg-[#faf7f2] flex items-center justify-between p-6 sm:p-7"
      >
        <div className="flex flex-col gap-1.5 z-10 max-w-xl">
          <div className="flex items-center gap-1.5 text-emerald-700 font-pixel text-[10px] font-bold tracking-wider uppercase">
            <span className="text-amber-400">✦</span>
            <span>YOUR CODING ADVENTURE</span>
            <span className="text-amber-400">✦</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>{greeting}, {userName}</span>
            <span className="text-2xl sm:text-3xl inline-block transition-transform hover:rotate-12 cursor-default">{emoji}</span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            Ready for your next quest?
          </p>
        </div>

        {/* Right illustration */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 hidden md:flex items-center justify-end overflow-hidden pointer-events-none">
          <img
            src="/extracted/hero2_art_clean.png"
            alt=""
            className="h-full w-auto object-contain object-right"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN GRID (8 COLS LEFT / 4 COLS RIGHT) AS SHOWN IN IMAGE 2     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ===================================================================== */}
        {/* LEFT COLUMN (8 Cols): Continue Quest, Progress, Path, Community        */}
        {/* ===================================================================== */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Priority #1: Large Premium CURRENT QUEST Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400/80 shadow-[0_4px_24px_rgba(16,185,129,0.08)] flex flex-col justify-between gap-5 relative overflow-hidden">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base text-rose-500">🚩</span>
                <span className="font-pixel text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                  CONTINUE YOUR QUEST
                </span>
              </div>

              {/* +120 XP Reward Pill */}
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-pixel font-bold shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>+120 XP</span>
              </div>
            </div>

            {/* Body content with Title, Chapter, Description & Illustration */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-1 rounded-2xl shrink-0">
                  <img src="/extracted/icon_python_snake.png" alt="Python" className="w-11 h-11 object-contain" />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
                      Python Adventure
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      Chapter: Loops & Logic
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
                    Learn how to repeat actions, control iteration, and build your first interactive loop.
                  </p>

                  {/* Progress bar (78%) */}
                  <div className="flex items-center gap-3 mt-3 w-full max-w-md">
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: '78%' }}
                      />
                    </div>
                    <span className="font-pixel text-[10px] font-bold text-emerald-600 shrink-0">
                      78%
                    </span>
                    <span className="text-[11px] font-medium text-stone-400 shrink-0">
                      3 quests remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Retro Pixel Terminal Desktop Illustration from Reference */}
              <div className="hidden sm:flex shrink-0 w-36 h-24 items-center justify-center">
                <img src="/extracted/quest_terminal_art.png" alt="Terminal" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => onNavigateTab('learn')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold font-sans shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Continue Quest</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('learn')}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold font-sans transition-all cursor-pointer"
              >
                View Chapter
              </button>
            </div>
          </div>

          {/* Section 2: YOUR PROGRESS (4-Card Row) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-base">📊</span>
              <h3 className="font-bold text-base text-stone-900">Your Progress</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Card 01: LEVEL */}
              <div className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">LEVEL</span>
                  <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-stone-900 font-pixel">12</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '78%' }} />
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    +150 XP to next level
                  </span>
                </div>
              </div>

              {/* Card 02: STREAK */}
              <div className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">STREAK</span>
                  <div className="w-6 h-6 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  </div>
                </div>

                <div className="flex items-baseline gap-1 text-2xl font-black text-stone-900 font-pixel">
                  <span>7</span>
                  <span className="text-xs font-sans font-bold text-stone-600">days</span>
                </div>

                <div className="text-[10px] text-stone-500 font-medium">
                  Best: 14 days
                </div>
              </div>

              {/* Card 03: BADGES */}
              <div className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">BADGES</span>
                  <div className="w-6 h-6 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Award className="w-3.5 h-3.5 fill-purple-400 text-purple-600" />
                  </div>
                </div>

                <div className="text-2xl font-black text-stone-900 font-pixel">
                  18
                </div>

                <div className="text-[10px] text-stone-500 font-medium">
                  3 unlocked this month
                </div>
              </div>

              {/* Card 04: BUILDS */}
              <div className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[9px] font-bold text-stone-400 uppercase">BUILDS</span>
                  <div className="w-6 h-6 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-2xl font-black text-stone-900 font-pixel">
                  6
                </div>

                <div className="text-[10px] text-stone-500 font-medium">
                  2 published
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: YOUR ADVENTURE PATH */}
          <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="text-base text-emerald-600">🗺️</span>
                <h3 className="font-bold text-base text-stone-900">Your Adventure Path</h3>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                Here&apos;s where you&apos;ve been — and where you&apos;re going.
              </span>
            </div>

            {/* Horizontal Node Flow Map */}
            <div className="relative flex items-center justify-between gap-2 overflow-x-auto py-4 px-2">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-2.5 h-1 bg-stone-200 z-0" />
              <div className="absolute left-6 w-[45%] top-1/2 -translate-y-2.5 h-1 bg-emerald-500 z-0 transition-all duration-500" />

              {pathNodes.map((node) => {
                const isCompleted = node.status === 'completed'
                const isCurrent = node.status === 'current'
                const isLocked = node.status === 'locked'

                return (
                  <div
                    key={node.id}
                    onClick={() => !isLocked && onNavigateTab('learn')}
                    className={`relative z-10 flex flex-col items-center gap-2 transition-transform ${
                      isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                          : isCurrent
                          ? 'bg-white text-emerald-700 border-2 border-emerald-500 ring-4 ring-emerald-300/40'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : isCurrent ? (
                        <Repeat className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                      )}
                    </div>

                    <div className="flex flex-col items-center">
                      <span
                        className={`text-[11px] whitespace-nowrap font-medium ${
                          isCurrent ? 'font-bold text-emerald-700' : isCompleted ? 'font-semibold text-stone-800' : 'text-stone-400'
                        }`}
                      >
                        {node.title}
                      </span>
                      {isCurrent && (
                        <span className="text-[8px] font-pixel text-emerald-600 font-bold uppercase mt-0.5">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 4: FROM THE COMMUNITY */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-base text-purple-600">👥</span>
                <h3 className="font-bold text-base text-stone-900">From the Community</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('community')}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Explore Community</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Project 1: Pixel Weather */}
              <div className="bg-white rounded-2xl p-3 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <img src="/extracted/community_weather.png" alt="Pixel Weather" className="w-full h-24 object-cover rounded-xl" />
                  <h4 className="font-bold text-xs text-stone-900 mt-2.5 group-hover:text-emerald-700 transition-colors">
                    Pixel Weather
                  </h4>
                  <div className="text-[10.5px] text-stone-500 font-medium">By Sarah Chen</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold">
                      Python
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 text-[9px] font-bold">
                      Web
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleToggleLike('p1')}
                    className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                      likedMap.p1 ? 'text-rose-500' : 'text-stone-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedMap.p1 ? 'fill-rose-500' : ''}`} />
                    <span>{likes.p1}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('build')}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-600 text-[10.5px] font-bold transition-colors cursor-pointer"
                  >
                    Remix
                  </button>
                </div>
              </div>

              {/* Project 2: Space Runner */}
              <div className="bg-white rounded-2xl p-3 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <img src="/extracted/community_space.png" alt="Space Runner" className="w-full h-24 object-cover rounded-xl" />
                  <h4 className="font-bold text-xs text-stone-900 mt-2.5 group-hover:text-purple-700 transition-colors">
                    Space Runner
                  </h4>
                  <div className="text-[10.5px] text-stone-500 font-medium">By Mike Rivera</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-[9px] font-bold">
                      Game
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold">
                      Python
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleToggleLike('p2')}
                    className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                      likedMap.p2 ? 'text-rose-500' : 'text-stone-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedMap.p2 ? 'fill-rose-500' : ''}`} />
                    <span>{likes.p2}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('build')}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-purple-50 hover:text-purple-700 text-stone-600 text-[10.5px] font-bold transition-colors cursor-pointer"
                  >
                    Remix
                  </button>
                </div>
              </div>

              {/* Project 3: AI Study Buddy */}
              <div className="bg-white rounded-2xl p-3 border border-[#ece7df] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
                <div>
                  <img src="/extracted/community_ai.png" alt="AI Study Buddy" className="w-full h-24 object-cover rounded-xl" />
                  <h4 className="font-bold text-xs text-stone-900 mt-2.5 group-hover:text-sky-700 transition-colors">
                    AI Study Buddy
                  </h4>
                  <div className="text-[10.5px] text-stone-500 font-medium">By Priya Sharma</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 text-[9px] font-bold">
                      AI
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold">
                      Python
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleToggleLike('p3')}
                    className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                      likedMap.p3 ? 'text-rose-500' : 'text-stone-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedMap.p3 ? 'fill-rose-500' : ''}`} />
                    <span>{likes.p3}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('build')}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-sky-50 hover:text-sky-700 text-stone-600 text-[10.5px] font-bold transition-colors cursor-pointer"
                  >
                    Remix
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN (4 Cols): Today's Quest, Recent Achievements, Lumi       */}
        {/* ===================================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* 1. TODAY'S QUEST */}
          <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎯</span>
                  <h3 className="font-bold text-base text-stone-900">Today&apos;s Quest</h3>
                </div>
                <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                  <span>Keeps your 7-day streak alive</span>
                </span>
              </div>

              {/* Challenge Details Card */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex flex-col gap-2.5 mt-2">
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-xl shrink-0">
                    <img src="/extracted/icon_gamepad.png" alt="Gamepad" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-tight">
                      Build a Number Guessing Game
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[9px] font-bold">
                        Python
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        Beginner
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> 20 min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-stone-600 font-medium">
                    <span>Difficulty:</span>
                    <span className="text-amber-500 font-mono text-xs">★★☆☆☆</span>
                  </div>

                  <div className="font-pixel text-[10px] font-bold text-amber-600">
                    +80 XP ⭐
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('practice')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>Start Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. RECENT ACHIEVEMENTS (2x2 Grid) */}
          <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <h3 className="font-bold text-base text-stone-900">Recent Achievements</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('learn')}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View all achievements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Achievement 1 */}
              <div className="p-3 rounded-2xl bg-[#faf8f4] border border-[#ece7df] flex items-center gap-2.5">
                <img src="/extracted/badge_streak.png" alt="7 Day Streak" className="w-8 h-8 object-contain shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-[11px] text-stone-900 truncate">7 Day Streak</h4>
                  <span className="text-[9.5px] text-stone-400 block truncate">Earned 2 days ago</span>
                </div>
              </div>

              {/* Achievement 2 */}
              <div className="p-3 rounded-2xl bg-[#faf8f4] border border-[#ece7df] flex items-center gap-2.5">
                <img src="/extracted/badge_bug_hunter.png" alt="Bug Hunter" className="w-8 h-8 object-contain shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-[11px] text-stone-900 truncate">Bug Hunter</h4>
                  <span className="text-[9.5px] text-stone-400 block truncate">Earned 5 days ago</span>
                </div>
              </div>

              {/* Achievement 3 */}
              <div className="p-3 rounded-2xl bg-[#faf8f4] border border-[#ece7df] flex items-center gap-2.5">
                <img src="/extracted/badge_fast_debugger.png" alt="Fast Debugger" className="w-8 h-8 object-contain shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-[11px] text-stone-900 truncate">Fast Debugger</h4>
                  <span className="text-[9.5px] text-stone-400 block truncate">Earned 1 week ago</span>
                </div>
              </div>

              {/* Achievement 4 */}
              <div className="p-3 rounded-2xl bg-[#faf8f4] border border-[#ece7df] flex items-center gap-2.5">
                <img src="/extracted/badge_first_build.png" alt="First Build" className="w-8 h-8 object-contain shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-[11px] text-stone-900 truncate">First Build</h4>
                  <span className="text-[9.5px] text-stone-400 block truncate">Earned 2 weeks ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. LUMI CONTEXTUAL TIP CARD */}
          {!lumiDismissed ? (
            <div className="bg-gradient-to-b from-purple-50/70 via-white to-white rounded-3xl p-6 border border-purple-200/80 shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <img src="/extracted/lumi_tip_mascot.png" alt="Lumi" className="w-12 h-12 object-contain shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Lumi has a tip for you</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium bg-white/90 p-3 rounded-2xl border border-purple-100 shadow-2xs">
                  &ldquo;You&apos;re getting close to finishing Loops. Want to practice with one more challenge?&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('practice')}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-sans shadow-xs transition-colors cursor-pointer"
                >
                  Give Me a Challenge
                </button>

                <button
                  type="button"
                  onClick={() => setLumiDismissed(true)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-bold font-sans transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col items-center justify-center text-center gap-2">
              <img src="/extracted/lumi_tip_mascot.png" alt="Lumi" className="w-10 h-10 object-contain" />
              <div className="font-bold text-xs text-stone-800">Lumi is standing by</div>
              <p className="text-[11px] text-stone-500 max-w-xs">
                Click &ldquo;Ask Lumi&rdquo; anytime in the bottom right corner for hints or debugging assistance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INSPIRATIONAL BOTTOM MOTTO & DECORATION                                */}
      {/* ========================================================================= */}
      <div className="pt-4 flex items-center justify-center gap-2 text-stone-500 font-pixel text-[10px] tracking-wider uppercase">
        <span className="text-amber-400">✨</span>
        <span>Keep building. Keep learning. Keep leveling up.</span>
        <span className="text-amber-400">✨</span>
      </div>
    </div>
  )
}
