import React from 'react'
import {
  Terminal,
  BookOpen,
  Code2,
  Layers,
  Users,
  Settings,
  HelpCircle,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Gamepad2,
} from 'lucide-react'
import { CodingConflictsLogo } from '../brand/CodingConflictsLogo'
import { AlexPixelAvatar, PixelPythonIcon } from '../brand/PixelArtAvatars'
import { cn } from '../../lib/utils'

export type NavItemKey = 'dashboard' | 'learn' | 'practice' | 'build' | 'arcade' | 'community' | 'settings' | 'help' | 'admin'

interface SidebarProps {
  activeTab: NavItemKey
  onSelectTab: (tab: NavItemKey) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onContinueQuest?: () => void
  userMode?: 'level1' | 'level12'
  isAdmin?: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed = false,
  onToggleCollapse,
  onContinueQuest,
  userMode = 'level1',
}) => {
  const isLevel1 = userMode === 'level1'
  const navItems = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: Terminal },
    { key: 'learn' as NavItemKey, label: 'Learn', icon: BookOpen },
    { key: 'practice' as NavItemKey, label: 'Practice', icon: Code2 },
    { key: 'build' as NavItemKey, label: 'Build', icon: Layers },
    { key: 'arcade' as NavItemKey, label: 'Team Arcade', icon: Gamepad2 },
    { key: 'community' as NavItemKey, label: 'Community', icon: Users },
  ]

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-[#fbf9f4] border-r border-[#ece7df] flex flex-col justify-between select-none transition-all duration-300 z-30",
        isCollapsed ? "w-20 px-2 py-4" : "w-64 px-4 py-5"
      )}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col gap-5">
        {/* Brand & Collapse toggle */}
        <div className="flex items-center justify-between px-1">
          {isCollapsed ? (
            <div className="w-full flex justify-center">
              <CodingConflictsLogo size="sm" showText={false} />
            </div>
          ) : (
            <CodingConflictsLogo size="md" showText={true} />
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors hidden md:flex cursor-pointer"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* MAIN Navigation Items */}
        <nav className="flex flex-col gap-1">
          <div className={cn("text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 px-3", isCollapsed && "hidden")}>
            MAIN
          </div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group",
                  isActive
                    ? "bg-emerald-50 text-emerald-900 shadow-xs font-bold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/40"
                )}
              >
                {/* Active Tiny Pixel Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                )}

                <div
                  className={cn(
                    "p-1 rounded-lg flex items-center justify-center transition-colors",
                    isActive ? "text-emerald-600" : "text-stone-400 group-hover:text-stone-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* QUEST SECTION (Expanded only) */}
        {!isCollapsed && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#ece7df]/80">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-pixel">
                MY QUEST
              </span>
              <span className="text-xs text-rose-500">🚩</span>
            </div>

            {/* Current Quest Card */}
            {isLevel1 ? (
              <div className="p-3 bg-white rounded-2xl border border-[#ece7df] shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🚩</span>
                  <span className="text-xs font-bold text-stone-700">Your first quest awaits.</span>
                </div>
                <div className="flex items-center gap-2.5 pt-1.5 border-t border-stone-100">
                  <AlexPixelAvatar size={28} />
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[9.5px] font-pixel font-bold">
                      <span className="text-stone-800">LEVEL 01</span>
                      <span className="text-stone-500">0 XP</span>
                    </div>
                    <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-2xl border border-[#ece7df] shadow-xs hover:border-emerald-300 transition-all flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-xl bg-sky-50 border border-sky-100 shrink-0">
                    <PixelPythonIcon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-pixel text-stone-400 uppercase font-bold tracking-tight">
                      PYTHON ADVENTURE
                    </div>
                    <div className="text-xs font-bold text-stone-800 truncate">
                      Loops & Logic
                    </div>
                  </div>
                </div>

                {/* Progress Bar 78% */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500 font-medium">3 quests remaining</span>
                    <span className="font-pixel text-[9px] font-bold text-emerald-600">78%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>

                {/* CTA Continue Button */}
                <button
                  type="button"
                  onClick={onContinueQuest || (() => onSelectTab('learn'))}
                  className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* PROGRESS SECTION (Expanded only) */}
        {!isCollapsed && (
          <div className="flex flex-col gap-2 pt-1 border-t border-[#ece7df]/80">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-pixel px-1">
              PROGRESS
            </div>

            {isLevel1 ? (
              <div className="p-3 bg-white rounded-2xl border border-[#ece7df] shadow-xs flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-base">⭐</span>
                  <div>
                    <div className="font-pixel text-[9px] text-stone-800 font-bold">LEVEL 01</div>
                    <div className="font-pixel text-[9px] text-stone-500">0 XP</div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-2xl border border-[#ece7df] shadow-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <div>
                      <div className="font-pixel text-[8px] text-stone-400 uppercase font-bold">LEVEL 12</div>
                      <div className="font-pixel text-[10px] text-amber-600 font-bold">4,850 XP</div>
                    </div>
                  </div>
                  <span className="font-pixel text-[9px] text-stone-400 font-bold">78%</span>
                </div>

                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: '78%' }}
                  />
                </div>

                <div className="text-[10px] text-stone-500 text-center font-medium">
                  150 XP to Level 13
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM SIDEBAR (User Profile + Settings/Help) */}
      <div className="flex flex-col gap-2 pt-3 border-t border-[#ece7df]">
        {/* Character Mini-Profile */}
        <div
          onClick={() => onSelectTab('settings')}
          className={cn(
            "p-2 rounded-2xl bg-white border border-[#ece7df] shadow-xs flex items-center gap-2.5 hover:border-emerald-300 transition-all cursor-pointer group",
            isCollapsed && "justify-center p-1.5"
          )}
        >
          <AlexPixelAvatar size={34} />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-stone-800 truncate group-hover:text-emerald-700 transition-colors">
                Alex Morgan
              </div>
              <div className="text-[10px] font-pixel text-stone-400 uppercase">
                {isLevel1 ? 'Level 1' : 'Level 12'}
              </div>
            </div>
          )}
        </div>

        {/* Settings & Help Links */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            title={isCollapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-200/40 transition-colors cursor-pointer",
              activeTab === 'settings' && "bg-emerald-50 text-emerald-900 font-bold",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Settings className="w-3.5 h-3.5 text-stone-400" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('help')}
            title={isCollapsed ? "Help & Support" : undefined}
            className={cn(
              "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-200/40 transition-colors cursor-pointer",
              activeTab === 'help' && "bg-emerald-50 text-emerald-900 font-bold",
              isCollapsed && "justify-center px-0"
            )}
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            {!isCollapsed && <span>Help & Support</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
