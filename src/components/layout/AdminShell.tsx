import React from 'react'
import { AdminDashboard } from '../dashboard/AdminDashboard'
import { ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { AlexPixelAvatar } from '../brand/PixelArtAvatars'

export const AdminShell: React.FC = () => {
  const { signOut, user } = useAuth()
  
  return (
    <div className="min-h-screen w-full bg-[#faf8f4] text-stone-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      {/* Top Header */}
      <header className="h-16 px-6 bg-white border-b border-[#ece7df] flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 text-purple-700 font-black text-lg">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <span>CodeQuest Admin Realm</span>
        </div>
        
        <div className="flex items-center gap-4">
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
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        <AdminDashboard />
      </main>
    </div>
  )
}
