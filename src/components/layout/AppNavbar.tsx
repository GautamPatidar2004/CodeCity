import React, { useState } from 'react'
import { LayoutDashboard, BookOpen, BarChart3, LogOut, Sparkles, Bell, FolderGit2, MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAchievementsAndNotifications } from '../../lib/achievements'

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

  return (
    <nav className="w-full max-w-6xl mx-auto mb-8 bg-white rounded-3xl p-3 sm:px-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative z-30">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 bg-emerald-600 border-2 border-b-4 border-emerald-700 rounded-xl flex items-center justify-center text-white font-mono font-black text-sm shadow-sm">
          &gt;_
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight text-slate-900">CodeQuest</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-pixel font-bold uppercase border ${
            role === 'admin'
              ? 'bg-purple-100 text-purple-700 border-purple-300'
              : 'bg-emerald-100 text-emerald-700 border-emerald-300'
          }`}>
            {role === 'admin' ? 'ADMIN' : 'STUDENT'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl gap-1 flex-wrap justify-center">
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('quests')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quests'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Quests</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('projects')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('community')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'community'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Community</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </div>

      {/* User info, Notifications & quick sign out */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white font-pixel text-[8px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Dialog */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div className="font-pixel text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <span>🔔</span>
                  <span>Notifications</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{unreadCount} Unread</span>
              </div>

              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs font-medium">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
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

        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={username}
            className="w-8 h-8 rounded-full object-cover border border-emerald-400 shadow-sm"
          />
        )}

        <div className="text-right hidden md:block">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{username}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">{user?.email || profile?.email}</div>
        </div>

        <button
          type="button"
          onClick={() => signOut()}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  )
}
