import React, { useState } from 'react'
import {
  Flame,
  Star,
  Bell,
  Bot,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Terminal,
  BookOpen,
  Code2,
  Layers,
  Users,
  CheckCircle2,
  Gamepad2,
  ShieldCheck,
} from 'lucide-react'
import { AlexPixelAvatar, LumiPixelBot } from '../brand/PixelArtAvatars'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'
import type { NavItemKey } from './Sidebar'

export type DashboardMode = 'overview' | 'headquarters' | 'first_time'

interface TopHeaderProps {
  activeTab: NavItemKey
  onSelectTab: (tab: NavItemKey) => void
  onOpenLumi: () => void
  dashboardMode?: DashboardMode
  onChangeDashboardMode?: (mode: DashboardMode) => void
  courseDetailTitle?: string | null
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenLumi,
  dashboardMode = 'headquarters',
  onChangeDashboardMode,
  courseDetailTitle,
}) => {
  const { user, signOut } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const isLevel1 = dashboardMode === 'first_time'

  const tabTitles: Record<NavItemKey, { title: string; icon: React.ReactNode }> = {
    dashboard: { title: 'Dashboard', icon: <Terminal className="w-4 h-4 text-emerald-600" /> },
    learn: { title: 'Learn', icon: <BookOpen className="w-4 h-4 text-emerald-600" /> },
    practice: { title: 'Practice', icon: <Code2 className="w-4 h-4 text-purple-600" /> },
    build: { title: 'Build', icon: <Layers className="w-4 h-4 text-amber-600" /> },
    arcade: { title: 'Team Arcade', icon: <Gamepad2 className="w-4 h-4 text-emerald-600" /> },
    community: { title: 'Community', icon: <Users className="w-4 h-4 text-purple-600" /> },
    settings: { title: 'Settings', icon: <Settings className="w-4 h-4 text-stone-600" /> },
    help: { title: 'Help & Support', icon: <Bot className="w-4 h-4 text-emerald-600" /> },
    admin: { title: 'Admin Realm', icon: <ShieldCheck className="w-4 h-4 text-purple-600" /> },
  }

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard

  const notificationsList = isLevel1
    ? [
        { id: '1', title: 'Welcome to CodeQuest!', desc: 'Your adventure has begun. Start with "Hello, World!"', time: 'Just now', unread: true },
      ]
    : [
        { id: '1', title: 'Quest Complete!', desc: 'You solved "Python Variables" (+75 XP)', time: '10m ago', unread: true },
        { id: '2', title: 'Streak Flame!', desc: '7 Day Streak maintained 🔥', time: '1h ago', unread: true },
        { id: '3', title: 'New Challenge', desc: 'Space Explorer project unlocked', time: '1d ago', unread: false },
      ]

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-[#ece7df] flex items-center justify-between sticky top-0 z-20 select-none">
      {/* LEFT: Breadcrumb / Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm sm:text-base">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>{courseDetailTitle ? courseDetailTitle : currentTabInfo.title}</span>
        </div>

        {/* 3-Way Reference Screen Switcher */}
        {onChangeDashboardMode && (
          <div className="hidden md:flex items-center gap-1 bg-[#f4f1ea] p-1 rounded-xl border border-[#e5dfd5]">
            <button
              type="button"
              onClick={() => onChangeDashboardMode('overview')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer",
                dashboardMode === 'overview'
                  ? "bg-white text-stone-900 shadow-2xs font-extrabold"
                  : "text-stone-500 hover:text-stone-800"
              )}
              title="Image 1: App Shell Overview"
            >
              🏠 App Shell
            </button>
            <button
              type="button"
              onClick={() => onChangeDashboardMode('headquarters')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer",
                dashboardMode === 'headquarters'
                  ? "bg-white text-stone-900 shadow-2xs font-extrabold"
                  : "text-stone-500 hover:text-stone-800"
              )}
              title="Image 2: Main Headquarters Dashboard"
            >
              ⚔️ Headquarters
            </button>
            <button
              type="button"
              onClick={() => onChangeDashboardMode('first_time')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer",
                dashboardMode === 'first_time'
                  ? "bg-white text-stone-900 shadow-2xs font-extrabold"
                  : "text-stone-500 hover:text-stone-800"
              )}
              title="Image 3: First-Time / Empty State"
            >
              🌱 First-Time
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Gamified Stats HUD & User Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Pill (Hidden if Level 1 / 0 days) */}
        {!isLevel1 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 shadow-2xs">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
            <span className="font-pixel text-[10px] font-bold">7</span>
          </div>
        )}

        {/* XP Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 shadow-2xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span className="font-pixel text-[10px] font-bold">
            {isLevel1 ? '0 XP' : '4,850 XP'}
          </span>
        </div>

        {/* Level Badge */}
        <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 font-pixel text-[9px] font-bold uppercase shadow-2xs">
          {isLevel1 ? 'LVL 01' : 'LVL 12'}
        </div>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#ece7df] shadow-xl p-3 z-50 text-left animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                <span className="font-pixel text-xs font-bold text-stone-900">NOTIFICATIONS</span>
                <span className="text-[10px] font-bold text-emerald-600">2 New</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs transition-colors ${
                      n.unread ? 'bg-emerald-50/60 border border-emerald-100' : 'bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-stone-900 flex items-center justify-between">
                      <span>{n.title}</span>
                      <span className="text-[9px] text-stone-400 font-mono">{n.time}</span>
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">{n.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Mentor Quick Button */}
        <button
          type="button"
          onClick={onOpenLumi}
          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer hidden sm:flex items-center gap-1.5"
          title="Ask Lumi AI Mentor"
        >
          <LumiPixelBot size={22} glowing={false} />
          <span className="font-pixel text-[9px] font-bold text-emerald-800 pr-1">LUMI</span>
        </button>

        {/* User Avatar + Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-stone-100 transition-all cursor-pointer"
          >
            <AlexPixelAvatar size={32} />
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#ece7df] shadow-xl p-2 z-50 text-left animate-in fade-in">
              <div className="px-3 py-2 border-b border-stone-100">
                <div className="font-bold text-xs text-stone-900">Alex Morgan</div>
                <div className="text-[10px] text-stone-400">{user?.email || 'alex@codingconflicts.dev'}</div>
                <div className="mt-1 inline-flex px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-pixel font-bold">
                  STUDENT ADVENTURER
                </div>
              </div>

              <div className="flex flex-col gap-0.5 py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('settings')
                    setShowProfileMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Profile Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('dashboard')
                    setShowProfileMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>My Quests Progress</span>
                </button>
              </div>

              <div className="pt-1 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
