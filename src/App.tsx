import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { AppShell } from './components/layout/AppShell'
import { GameToaster } from './components/ui/GameToast'
import { CodeQuestOnboardingFlow } from './components/onboarding/CodeQuestOnboardingFlow'
import { Loader2 } from 'lucide-react'

const MainApp: React.FC = () => {
  const { user, loading } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false)

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] text-slate-900 gap-4 font-sans">
        <div className="h-14 w-14 bg-emerald-600 border-2 border-b-4 border-emerald-700 rounded-3xl flex items-center justify-center text-white font-mono font-black text-xl shadow-xl animate-bounce">
          &gt;_
        </div>
        <div className="flex items-center gap-2 font-pixel text-xs text-emerald-600 font-bold uppercase tracking-wider">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>CONNECTING TO CODEQUEST REALM...</span>
        </div>
      </div>
    )
  }

  // 2. Unauthenticated -> Separate Auth Page
  if (!user) {
    return (
      <>
        <AuthPage onOpenOnboarding={() => setShowOnboarding(true)} />
        {showOnboarding && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
            <CodeQuestOnboardingFlow onComplete={() => setShowOnboarding(false)} />
          </div>
        )}
        <GameToaster />
      </>
    )
  }

  // 3. Authenticated -> Global App Shell Framework
  return <AppShell />
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
