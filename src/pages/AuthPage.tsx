import React, { useState } from 'react'
import { CodeQuestLoginCard } from '../components/auth/CodeQuestLoginCard'
import { CodeQuestRegisterCard } from '../components/auth/CodeQuestRegisterCard'
import { CodeQuestForgotPasswordCard } from '../components/auth/CodeQuestForgotPasswordCard'
import { CodeQuestRpgScene } from '../components/auth/CodeQuestRpgScene'
import { CodeQuestTrailheadScene } from '../components/auth/CodeQuestTrailheadScene'

export type AuthView = 'login' | 'register' | 'forgot-password'

export const AuthPage: React.FC = () => {
  const [authView, setAuthView] = useState<AuthView>('login')

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Branding */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-3 group rounded-lg p-1 select-none">
          {/* Terminal Icon `>_` with Sparks */}
          <div className="relative flex items-center justify-center">
            <div className="h-10 w-10 bg-emerald-600 border-2 border-b-4 border-emerald-700 rounded-2xl flex items-center justify-center text-white font-mono font-black text-base shadow-md group-hover:scale-105 transition-transform">
              &gt;_
            </div>
            {/* Ambient Sparkles */}
            <span className="absolute -top-2 -right-2 text-amber-400 text-xs animate-twinkle select-none">
              ✦
            </span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
              CodeQuest
            </span>
            <span className="text-[10px] font-pixel text-emerald-600 uppercase tracking-widest font-bold">
              LEARN • BUILD • CONQUER
            </span>
          </div>
        </div>

        {/* Auth Mode Toggle Pill */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setAuthView('login')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              authView === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setAuthView('register')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              authView === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Split-Screen Canvas Layout */}
      <main className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Modern Clean Auth Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          {authView === 'login' && (
            <CodeQuestLoginCard
              onSwitchToRegister={() => setAuthView('register')}
              onForgotPassword={() => setAuthView('forgot-password')}
            />
          )}

          {authView === 'register' && (
            <CodeQuestRegisterCard
              onSwitchToLogin={() => setAuthView('login')}
            />
          )}

          {authView === 'forgot-password' && (
            <CodeQuestForgotPasswordCard
              onBackToLogin={() => setAuthView('login')}
            />
          )}
        </div>

        {/* Right Column: 16-Bit Retro RPG Coding Scene with Gamification HUD */}
        <div className="lg:col-span-7 hidden lg:flex items-center justify-center">
          {authView === 'register' ? (
            <CodeQuestTrailheadScene />
          ) : (
            <CodeQuestRpgScene />
          )}
        </div>
      </main>

      {/* Bottom Spacer for padding balance */}
      <footer className="w-full max-w-7xl mx-auto py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CodeQuest. All rights reserved. Level up your coding skills.
      </footer>
    </div>
  )
}
