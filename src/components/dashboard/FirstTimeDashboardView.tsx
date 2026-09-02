import React from 'react'
import {
  PixelMiniTerminal,
} from '../brand/PixelArtAvatars'
import {
  ArrowRight,
  Lock,
  Star,
  Clock,
  Code2,
  Layers,
  Repeat,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface FirstTimeDashboardViewProps {
  onNavigateTab: (tab: 'learn' | 'practice' | 'build' | 'community') => void
  onStartFirstQuest?: () => void
}

export const FirstTimeDashboardView: React.FC<FirstTimeDashboardViewProps> = ({
  onNavigateTab,
  onStartFirstQuest,
}) => {
  const { user } = useAuth()
  const userName = user?.user_metadata?.first_name || 'Alex'

  const handleStartQuest = () => {
    if (onStartFirstQuest) {
      onStartFirstQuest()
    } else {
      onNavigateTab('learn')
    }
  }

  const pathNodes = [
    { id: '1', title: 'Hello World', status: 'start', icon: <Code2 className="w-4 h-4 text-emerald-600" /> },
    { id: '2', title: 'Variables', status: 'locked', icon: <span className="text-xs">📦</span> },
    { id: '3', title: 'Conditions', status: 'locked', icon: <span className="text-xs">🔀</span> },
    { id: '4', title: 'Loops', status: 'locked', icon: <Repeat className="w-3.5 h-3.5 text-stone-400" /> },
    { id: '5', title: 'First Build', status: 'locked', icon: <Layers className="w-3.5 h-3.5 text-stone-400" /> },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-12 select-none">
      {/* ========================================================================= */}
      {/* 1. WELCOME TO YOUR CODING ADVENTURE — FIRST-TIME HERO BANNER (DYNAMIC)      */}
      {/* ========================================================================= */}
      <div
        onClick={handleStartQuest}
        className="w-full rounded-3xl overflow-hidden border border-[#ece7df] shadow-xs cursor-pointer hover:shadow-md transition-all relative min-h-[175px] bg-[#fbf9f4] flex items-center justify-between p-6 sm:p-8"
      >
        <div className="flex flex-col gap-2 z-10 max-w-md sm:max-w-lg">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
            Welcome to your coding adventure, {userName}.
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
            You&apos;ve created your character. Now it&apos;s time to write your first line of code.
          </p>
        </div>

        {/* Right illustration */}
        <div className="absolute right-0 top-0 bottom-0 w-3/5 hidden md:flex items-center justify-end overflow-hidden pointer-events-none">
          <img
            src="/extracted/hero3_art_clean.png"
            alt=""
            className="h-full w-auto object-contain object-right"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FIRST QUEST CARD + CONTEXTUAL LUMI COMPANION CARD                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Priority #1: YOUR FIRST QUEST CARD (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border-2 border-emerald-400/80 shadow-[0_4px_24px_rgba(16,185,129,0.08)] flex flex-col justify-between gap-5 relative overflow-hidden">
          {/* Header Row */}
          <div className="flex items-center gap-2">
            <span className="text-base text-rose-500">🚩</span>
            <span className="font-pixel text-[11px] font-bold text-stone-800 uppercase tracking-wider">
              YOUR FIRST QUEST
            </span>
          </div>

          {/* Main Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-1 rounded-2xl shrink-0 flex items-center justify-center">
                <img src="/extracted/first_quest_terminal.png" alt="Terminal" className="w-14 h-14 object-contain" />
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                  Hello, World!
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md">
                  Write your first program and take the first step toward becoming a developer.
                </p>

                {/* Tags row: Difficulty, Time, Reward */}
                <div className="flex items-center gap-2.5 mt-2 flex-wrap text-xs font-medium">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    Difficulty: Beginner
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-stone-500" />
                    <span>5 min</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-pixel text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>+50 XP</span>
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="shrink-0 flex items-center sm:self-center">
              <button
                type="button"
                onClick={handleStartQuest}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold font-sans flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Start My First Quest</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* LUMI SAYS AI COMPANION CARD (4 Cols) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-purple-50/70 via-white to-white rounded-3xl p-6 border border-purple-200/80 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <img src="/extracted/lumi_guide_large.png" alt="Lumi" className="w-12 h-12 object-contain shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-stone-900">Lumi says:</h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium bg-white/90 p-3.5 rounded-2xl border border-purple-100 shadow-2xs">
              &ldquo;Don&apos;t worry about getting everything right. Your first quest is simply to begin.&rdquo;
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartQuest}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Let&apos;s Go</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SIMPLIFIED FIRST-TIME LEARNING PATH                                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-[#ece7df] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-emerald-600">🗺️</span>
            <h3 className="font-bold text-base text-stone-900">Your Learning Path</h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('learn')}
            className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Node progression trail */}
        <div className="relative flex items-center justify-between gap-3 overflow-x-auto py-4 px-2">
          {/* Subtle horizontal connecting path line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-2 h-1 bg-stone-200 z-0" />

          {pathNodes.map((node) => {
            const isStart = node.status === 'start'

            return (
              <div
                key={node.id}
                onClick={() => isStart && handleStartQuest()}
                className={`relative z-10 flex flex-col items-center gap-2 transition-transform ${
                  isStart ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'
                }`}
              >
                {/* START Pill over first node */}
                {isStart && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-pixel text-[8px] font-bold uppercase shadow-2xs -mb-1 animate-bounce">
                    START
                  </span>
                )}

                {/* Node Box */}
                <div
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-xs transition-all ${
                    isStart
                      ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-500 ring-4 ring-emerald-200/50'
                      : 'bg-stone-50 text-stone-400 border border-stone-200'
                  }`}
                >
                  {isStart ? (
                    <div className="flex flex-col items-center">
                      <PixelMiniTerminal size={22} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5">
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-[9px] font-mono text-stone-400 font-bold">{node.icon}</span>
                    </div>
                  )}
                </div>

                {/* Node Label */}
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isStart ? 'text-emerald-800 font-bold' : 'text-stone-400'
                  }`}
                >
                  {node.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOTIVATION FOOTER BANNER                                               */}
      {/* ========================================================================= */}
      <div className="rounded-2xl overflow-hidden border border-[#ece7df] shadow-2xs">
        <img
          src="/extracted/first_time_motivation_banner.png"
          alt="Every expert developer started with their first line of code."
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  )
}
