import React from 'react'
import {
  PixelPythonIcon,
  PixelGamepadIcon,
  LumiPixelBot,
} from '../brand/PixelArtAvatars'
import {
  BookOpen,
  Code2,
  Layers,
  Users,
  CheckCircle2,
  Lock,
  Star,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { getTimeGreeting } from '../../lib/timeGreeting'
import { useAuth } from '../../context/AuthContext'

interface AppShellOverviewViewProps {
  onNavigateTab: (tab: 'learn' | 'practice' | 'build' | 'community') => void
}

export const AppShellOverviewView: React.FC<AppShellOverviewViewProps> = ({
  onNavigateTab,
}) => {
  const { user } = useAuth()
  const { greeting } = getTimeGreeting()
  const userName = user?.user_metadata?.first_name || 'Alex'

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-16 select-none">
      {/* ========================================================================= */}
      {/* 1. TOP ROW: WELCOME BANNER (DYNAMIC) + YOUR ACHIEVEMENTS                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* WELCOME BACK HERO BANNER (8 Cols - DYNAMIC TIME & USER) */}
        <div
          onClick={() => onNavigateTab('learn')}
          className="lg:col-span-8 rounded-3xl overflow-hidden border border-[#ece7df] shadow-xs cursor-pointer hover:shadow-md transition-all relative min-h-[175px] bg-[#fbf9f4] flex items-center justify-between p-6 sm:p-7"
        >
          {/* Left Alex Desk Scene */}
          <div className="hidden sm:flex w-36 h-36 shrink-0 items-center justify-center">
            <img src="/extracted/hero1_alex_desk.png" alt="Alex at desk" className="w-full h-full object-contain" />
          </div>

          {/* Center Dynamic Greeting */}
          <div className="flex flex-col items-center text-center gap-1.5 z-10 flex-1 px-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {greeting === 'Good morning' ? `Welcome back, ${userName}!` : `${greeting}, ${userName}!`}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Ready to continue your coding adventure?
            </p>
            <div className="mt-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5">
              <span>Continue Learning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Right Floating Castle */}
          <div className="hidden sm:flex w-32 h-36 shrink-0 items-center justify-center">
            <img src="/extracted/hero1_castle.png" alt="Castle" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* YOUR ACHIEVEMENTS CARD (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🏆</span>
              <h2 className="font-bold text-base text-stone-900">Your Achievements</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('learn')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Badge 1: First Steps */}
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-stone-50 transition-colors">
              <img src="/extracted/badge_first_steps.png" alt="First Steps" className="w-12 h-12 object-contain" />
              <span className="text-xs font-bold text-stone-800 leading-tight">First Steps</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
            </div>

            {/* Badge 2: Code Warrior */}
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-stone-50 transition-colors">
              <img src="/extracted/badge_code_warrior.png" alt="Code Warrior" className="w-12 h-12 object-contain" />
              <span className="text-xs font-bold text-stone-800 leading-tight">Code Warrior</span>
              <span className="text-[10px] text-stone-400 font-medium">In Progress</span>
            </div>

            {/* Badge 3: Quest Master */}
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-stone-50 transition-colors opacity-70">
              <img src="/extracted/badge_quest_master.png" alt="Quest Master" className="w-12 h-12 object-contain" />
              <span className="text-xs font-bold text-stone-800 leading-tight">Quest Master</span>
              <span className="text-[10px] text-stone-400 font-medium">Locked</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MIDDLE ROW: CONTINUE YOUR QUEST (3 Tracks) + QUICK STATS               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: CONTINUE YOUR QUEST (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-base text-rose-500">🚩</span>
              <h2 className="font-bold text-base text-stone-900">Continue Your Quest</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('learn')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              View All Quests
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Quest 1: Python Fundamentals (Active - Green Border) */}
            <div
              onClick={() => onNavigateTab('learn')}
              className="p-4 rounded-2xl bg-white border-2 border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 shrink-0">
                  <PixelPythonIcon size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition-colors">
                      Python Fundamentals
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <span>🍃</span> Beginner
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    Build a strong foundation in Python programming.
                  </p>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mt-2 max-w-sm">
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                    </div>
                    <span className="text-[10px] font-medium text-stone-500">78% Complete</span>
                  </div>
                </div>
              </div>

              {/* Status / Checkmark Icon */}
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Quest 2: Build Your First Game (Intermediate - Locked) */}
            <div
              onClick={() => onNavigateTab('learn')}
              className="p-4 rounded-2xl bg-white border border-[#ece7df] shadow-xs hover:border-stone-300 transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 shrink-0">
                  <PixelGamepadIcon size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-stone-900 group-hover:text-purple-700 transition-colors">
                      Build Your First Game
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold flex items-center gap-1">
                      <span>📊</span> Intermediate
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    Create a simple game using JavaScript.
                  </p>
                  <div className="flex items-center gap-2 mt-2 max-w-sm">
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-300 rounded-full" style={{ width: '0%' }} />
                    </div>
                    <span className="text-[10px] font-medium text-stone-400">Not Started</span>
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {/* Quest 3: Build an AI Assistant (Intermediate - Locked) */}
            <div
              onClick={() => onNavigateTab('learn')}
              className="p-4 rounded-2xl bg-white border border-[#ece7df] shadow-xs hover:border-stone-300 transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
                  <LumiPixelBot size={32} glowing={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition-colors">
                      Build an AI Assistant
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold flex items-center gap-1">
                      <span>📊</span> Intermediate
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate mt-0.5">
                    Explore AI tools and build intelligent applications.
                  </p>
                  <div className="flex items-center gap-2 mt-2 max-w-sm">
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-300 rounded-full" style={{ width: '0%' }} />
                    </div>
                    <span className="text-[10px] font-medium text-stone-400">Not Started</span>
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: QUICK STATS (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base text-emerald-600">📊</span>
            <h2 className="font-bold text-base text-stone-900">Quick Stats</h2>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2.5 text-stone-700">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">Courses Completed</span>
              </div>
              <span className="text-sm font-black text-stone-900 font-mono">12</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2.5 text-stone-700">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold">Exercises Solved</span>
              </div>
              <span className="text-sm font-black text-stone-900 font-mono">48</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2.5 text-stone-700">
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold">Projects Built</span>
              </div>
              <span className="text-sm font-black text-stone-900 font-mono">3</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2.5 text-stone-700">
                <Users className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold">Community Members</span>
              </div>
              <span className="text-sm font-black text-emerald-600 font-mono">1,250</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM ROW: RECOMMENDED FOR YOU (3 Cards) + TOP COMMUNITY PROJECTS     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: RECOMMENDED FOR YOU (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-base text-emerald-600">📖</span>
              <h2 className="font-bold text-base text-stone-900">Recommended for You</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('learn')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Recommended 1: Python Programming */}
            <div
              onClick={() => onNavigateTab('learn')}
              className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
            >
              <div>
                <img src="/extracted/rec_python.png" alt="Python Programming" className="w-full h-24 object-cover rounded-xl" />
                <h3 className="font-bold text-xs text-stone-900 mt-3 group-hover:text-emerald-700 transition-colors">
                  Python Programming
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Learn Python from scratch with hands-on projects.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-stone-400 font-medium pt-2 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 6–8 weeks
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> 12.4k learners
                </span>
              </div>
            </div>

            {/* Recommended 2: Game Development */}
            <div
              onClick={() => onNavigateTab('learn')}
              className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
            >
              <div>
                <img src="/extracted/rec_game.png" alt="Game Development" className="w-full h-24 object-cover rounded-xl" />
                <h3 className="font-bold text-xs text-stone-900 mt-3 group-hover:text-purple-700 transition-colors">
                  Game Development with JavaScript
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Build your own browser games.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-stone-400 font-medium pt-2 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 8–10 weeks
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> 8.9k learners
                </span>
              </div>
            </div>

            {/* Recommended 3: Intro to AI */}
            <div
              onClick={() => onNavigateTab('learn')}
              className="bg-white rounded-2xl p-4 border border-[#ece7df] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group"
            >
              <div>
                <img src="/extracted/rec_ai.png" alt="Intro to AI" className="w-full h-24 object-cover rounded-xl" />
                <h3 className="font-bold text-xs text-stone-900 mt-3 group-hover:text-sky-700 transition-colors">
                  Intro to AI & Machine Learning
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Build intelligent applications.
                </p>
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-stone-400 font-medium pt-2 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 10–12 weeks
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> 10.2k learners
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: TOP COMMUNITY PROJECTS (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base text-purple-600">🚀</span>
              <h2 className="font-bold text-base text-stone-900">Top Community Projects</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('community')}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Project 1: Portfolio Website */}
            <div
              onClick={() => onNavigateTab('community')}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src="/extracted/top_project_portfolio.png" alt="Portfolio" className="w-10 h-10 object-cover rounded-xl shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-stone-900 truncate group-hover:text-purple-700 transition-colors">
                    Portfolio Website
                  </h3>
                  <span className="text-[10.5px] text-stone-400">By Sarah Chen</span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-500 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>124</span>
              </div>
            </div>

            {/* Project 2: Space Explorer Game */}
            <div
              onClick={() => onNavigateTab('community')}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src="/extracted/top_project_space.png" alt="Space Explorer" className="w-10 h-10 object-cover rounded-xl shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-stone-900 truncate group-hover:text-blue-700 transition-colors">
                    Space Explorer Game
                  </h3>
                  <span className="text-[10.5px] text-stone-400">By Mike Rivera</span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-500 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>98</span>
              </div>
            </div>

            {/* Project 3: AI Study Buddy */}
            <div
              onClick={() => onNavigateTab('community')}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src="/extracted/top_project_ai.png" alt="AI Study Buddy" className="w-10 h-10 object-cover rounded-xl shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-stone-900 truncate group-hover:text-emerald-700 transition-colors">
                    AI Study Buddy
                  </h3>
                  <span className="text-[10.5px] text-stone-400">By Priya Sharma</span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-500 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>87</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
