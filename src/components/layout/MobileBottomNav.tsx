import React from 'react'
import {
  Terminal,
  BookOpen,
  Code2,
  Layers,
  User,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { NavItemKey } from './Sidebar'

interface MobileBottomNavProps {
  activeTab: NavItemKey
  onSelectTab: (tab: NavItemKey) => void
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const items = [
    { key: 'dashboard' as NavItemKey, label: 'Home', icon: Terminal },
    { key: 'learn' as NavItemKey, label: 'Learn', icon: BookOpen },
    { key: 'practice' as NavItemKey, label: 'Practice', icon: Code2 },
    { key: 'build' as NavItemKey, label: 'Build', icon: Layers },
    { key: 'settings' as NavItemKey, label: 'Profile', icon: User },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#ece7df] flex items-center justify-around px-2 z-30 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.key

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelectTab(item.key)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer",
              isActive
                ? "text-emerald-600 font-bold"
                : "text-stone-500 hover:text-stone-900"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-lg transition-colors",
                isActive ? "bg-emerald-50 text-emerald-600" : "text-stone-400"
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-none">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
