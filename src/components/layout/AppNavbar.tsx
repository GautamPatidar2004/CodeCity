import React, { useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  FolderGit2,
  MessageSquare,
  BarChart3,
  LogOut,
  Bell,
  Sparkles,
  Flame,
  Star
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAchievementsAndNotifications } from '../../lib/achievements'
import { CodeQuestLogo } from '../brand/CodeQuestLogo'

export type ActiveTab = 'dashboard' | 'quests' | 'projects' | 'community' | 'analytics'

interface AppNavbarProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, profile, role, signOut } = useAuth()
  const { notifications, unreadCount, markRead } = useAchievementsAndNotifications(user?.id)
  const [showNotifications, setShowNotifications] = useState(false)

  const username = profile?.username || user?.email?.split('@')[0] || 'Adventurer'
  const xp = profile?.xp || 120
  const streak = profile?.streak || 3
  const level = profile?.level || Math.floor(xp / 100) + 1

  return (
    <nav className="w-full max-w-7xl mx-auto mb-8 bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:px-6 border border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.04)] flex flex-col md:flex-row items-center justify-between gap-4 relative z-30 select-none">
      {/* Brand & Role Tag */}
      <div className="flex items-center gap-3">
        <CodeQuestLogo size="sm" showTagline={false} />
        <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-pixel font-bold uppercase border ${
          role === 'admin'
            ? 'bg-purple-100 text-purple-700 border-purple-300'
            : 'bg-emerald-100 text-emerald-700 border-emerald-300'
        }`}>
          {role === 'admin' ? 'ADMIN' : 'STUDENT'}
        </span>
      </div>

      {/* Navigation Tabs with 3D feel */}
      <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl gap-1 flex-wrap justify-center border border-slate-200/50 shadow-inner">
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-white text-slate-900 shadow-md scale-102 border-b-2 border-slate-300'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('quests')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quests'
              ? 'bg-white text-slate-900 shadow-md scale-102 border-b-2 border-slate-300'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Quests</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('projects')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-white text-slate-900 shadow-md scale-102 border-b-2 border-slate-300'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Projects</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('community')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'community'
              ? 'bg-white text-slate-900 shadow-md scale-102 border-b-2 border-slate-300'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
          <span>Community</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-md scale-102 border-b-2 border-slate-300'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Gamified HUD Stats (XP, Streak, Level) & User Actions */}
      <div className="flex items-center gap-3">
        {/* XP Counter Pill */}
        <div className="hidden lg:flex items-center gap-1.5 bg-amber-50/80 border-2 border-amber-200/80 px-3 py-1.5 rounded-2xl shadow-xs">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
          <span className="font-pixel text-[9px] font-bold text-amber-700">{xp} XP</span>
        </div>

        {/* Streak Counter Pill */}
        <div className="hidden lg:flex items-center gap-1.5 bg-orange-50/80 border-2 border-orange-200/80 px-3 py-1.5 rounded-2xl shadow-xs">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
          <span className="font-pixel text-[9px] font-bold text-orange-700">{streak}D</span>
        </div>

        {/* Level Badge Pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#191535] border-2 border-[#382f6b] px-3 py-1.5 rounded-2xl text-white shadow-xs">
          <span className="font-pixel text-[8px] uppercase tracking-wider text-white">LVL {level}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all relative cursor-pointer shadow-xs active:scale-95"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white font-pixel text-[8px] flex items-center justify-center font-bold animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 text-left animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div className="font-pixel text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <span>🔔</span>
                  <span>Notifications</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{unreadCount} Unread</span>
              </div>

              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs font-medium font-pixel text-[9px]">
                    NO NOTIFICATIONS YET
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        n.isRead ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-emerald-50/60 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-base shrink-0">{n.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-xs text-slate-900 leading-tight">{n.title}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</div>
                          <div className="text-[9px] text-slate-400 mt-1">{n.createdAt}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Portrait */}
        <div className="flex items-center gap-2">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={username}
              className="w-9 h-9 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-sm font-black text-emerald-800 shadow-xs">
              🧑‍💻
            </div>
          )}

          <div className="text-right hidden xl:block">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{username}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{user?.email || profile?.email}</div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => signOut()}
          className="p-2 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer active:scale-95"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}
