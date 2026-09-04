import React, { useState } from 'react'
import { AdminDashboard } from '../dashboard/AdminDashboard'
import { AdminTeamArcadeView } from '../arcade/AdminTeamArcadeView'
import { AdminGuidedProjectsView } from '../guidedProjects/AdminGuidedProjectsView'
import { ShieldCheck, LogOut, Terminal, Swords, Compass } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { AlexPixelAvatar } from '../brand/PixelArtAvatars'

export const AdminShell: React.FC = () => {
  const { signOut, user } = useAuth()
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'arcade' | 'guided-projects'>('dashboard')
  
  return (
    <div className="min-h-screen w-full bg-[#faf8f4] text-stone-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#ece7df] flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5 text-purple-700 font-black text-base sm:text-lg">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <span className="hidden sm:inline">CodeQuest Admin Realm</span>
            <span className="sm:hidden">Admin</span>
          </div>

          {/* Admin Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveAdminTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-pixel uppercase text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'dashboard'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Catalog & Studio</span>
              <span className="md:hidden">Catalog</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('arcade')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-pixel uppercase text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'arcade'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-emerald-600" />
              <span>Team Arcade</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('guided-projects')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-pixel uppercase text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeAdminTab === 'guided-projects'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-purple-600" />
              <span>Guided Projects</span>
            </button>
          </nav>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <div className="font-bold text-xs text-stone-900">Administrator</div>
              <div className="text-[10px] text-stone-500">{user?.email}</div>
            </div>
            <div className="p-1 bg-purple-50 rounded-full border border-purple-100">
              <AlexPixelAvatar size={32} />
            </div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors text-xs font-bold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {activeAdminTab === 'dashboard' ? (
          <AdminDashboard />
        ) : activeAdminTab === 'arcade' ? (
          <AdminTeamArcadeView />
        ) : (
          <AdminGuidedProjectsView />
        )}
      </main>
    </div>
  )
}
