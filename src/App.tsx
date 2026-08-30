import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { QuestsPage } from './pages/QuestsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { CommunityPage } from './pages/CommunityPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AppNavbar, type ActiveTab } from './components/layout/AppNavbar'
import { Loader2 } from 'lucide-react'

const MainApp: React.FC = () => {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] text-slate-900 gap-3 font-sans">
        <div className="h-12 w-12 bg-emerald-600 border-2 border-b-4 border-emerald-700 rounded-2xl flex items-center justify-center text-white font-mono font-black text-lg shadow-lg animate-bounce">
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
    return <AuthPage />
  }

  // 3. Authenticated -> Navigation + Separate Pages
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-4 sm:p-6 lg:p-8 font-sans">
      <AppNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'dashboard' && <DashboardPage />}
      {activeTab === 'quests' && <QuestsPage />}
      {activeTab === 'projects' && <ProjectsPage />}
      {activeTab === 'community' && <CommunityPage />}
      {activeTab === 'analytics' && <AnalyticsPage />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
