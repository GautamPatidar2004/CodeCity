import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { AppShell } from './components/layout/AppShell'
import { AdminShell } from './components/layout/AdminShell'
import { GameToaster } from './components/ui/GameToast'
import { CodeQuestOnboardingFlow } from './components/onboarding/CodeQuestOnboardingFlow'
import { BladeOfChaosCursor } from './components/ui/BladeOfChaosCursor'

const MainApp: React.FC = () => {
  const { user, loading, isAdmin } = useAuth()
  const [showPreviewOnboarding, setShowPreviewOnboarding] = useState<boolean>(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false)

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-5" style={{ background: '#070505' }}>
        {/* Omega glyph loader */}
        <div
          className="flex items-center justify-center text-red-600 animate-pulse"
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '72px',
            lineHeight: 1,
            filter: 'drop-shadow(0 0 40px rgba(220,38,38,0.6))',
          }}
        >
          Ω
        </div>
        <div
          className="flex items-center gap-2 text-red-500/80 text-[11px] uppercase tracking-[0.35em]"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          <span>Entering the Crucible</span>
          <span className="inline-flex gap-1">
            <span className="w-1 h-1 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    )
  }

  // 2. Unauthenticated -> Separate Auth Page
  if (!user) {
    return (
      <>
        <AuthPage onOpenOnboarding={() => setShowPreviewOnboarding(true)} />
        {showPreviewOnboarding && (
          <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#070505' }}>
            <CodeQuestOnboardingFlow onComplete={() => setShowPreviewOnboarding(false)} />
          </div>
        )}
        <GameToaster />
      </>
    )
  }

  // 3. Authenticated -> Check Onboarding for Students
  const hasOnboarded = localStorage.getItem(`onboarded_${user.id}`) === 'true' || hasCompletedOnboarding
  
  if (!hasOnboarded && !isAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#070505' }}>
        <CodeQuestOnboardingFlow onComplete={() => {
          localStorage.setItem(`onboarded_${user.id}`, 'true')
          setHasCompletedOnboarding(true)
        }} />
      </div>
    )
  }

  // 4. Global App Shell Framework
  if (isAdmin) {
    return <AdminShell />
  }
  
  return <AppShell />
}

export default function App() {
  return (
    <AuthProvider>
      {/* Blade of Olympus cursor is global — active on every route */}
      <BladeOfChaosCursor />
      <MainApp />
    </AuthProvider>
  )
}
