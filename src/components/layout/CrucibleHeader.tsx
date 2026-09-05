import React, { useState, useEffect, useRef } from 'react'
import { Bell, LogOut, Settings, User, ChevronDown, CheckCircle2, Sword } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'
import type { NavItemKey } from './Sidebar'

export type DashboardMode = 'overview' | 'headquarters' | 'first_time'

interface CrucibleHeaderProps {
  activeTab: NavItemKey
  onSelectTab: (tab: NavItemKey) => void
  onOpenLumi: () => void
  dashboardMode?: DashboardMode
  onChangeDashboardMode?: (mode: DashboardMode) => void
  courseDetailTitle?: string | null
}

/* ── Nav definitions — mythic rename layer over existing NavItemKey values ── */
const NAV_ITEMS: { key: NavItemKey; label: string; mythicLabel: string }[] = [
  { key: 'dashboard', label: 'Dashboard', mythicLabel: 'Bastion' },
  { key: 'learn',     label: 'Learn',     mythicLabel: 'Realms' },
  { key: 'practice',  label: 'Practice',  mythicLabel: 'Trials' },
  { key: 'build',     label: 'Build',     mythicLabel: 'The Forge' },
  { key: 'arcade',    label: 'Arcade',    mythicLabel: 'The Arena' },
  { key: 'community', label: 'Community', mythicLabel: 'Shield-Wall' },
]

/* ── Omega SVG icon ── */
const OmegaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M20 4C11.163 4 4 11.163 4 20C4 26.5 7.8 32.1 13.3 34.8L10 38H30L26.7 34.8C32.2 32.1 36 26.5 36 20C36 11.163 28.837 4 20 4Z"
      stroke="url(#omegaGrad)"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M13 38 L10 38 L10 35 L13 35Z"
      fill="url(#omegaGrad)"
      opacity="0.7"
    />
    <path
      d="M27 38 L30 38 L30 35 L27 35Z"
      fill="url(#omegaGrad)"
      opacity="0.7"
    />
    {/* Chain detail */}
    <line x1="10" y1="36" x2="30" y2="36" stroke="url(#chainGrad)" strokeWidth="1" strokeDasharray="2 3" />
    <defs>
      <linearGradient id="omegaGrad" x1="4" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="55%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
      <linearGradient id="chainGrad" x1="10" y1="36" x2="30" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#C59B27" />
        <stop offset="100%" stopColor="#784E10" />
      </linearGradient>
    </defs>
  </svg>
)

/* ── Notification item shape ── */
interface NotifItem {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
}

export const CrucibleHeader: React.FC<CrucibleHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenLumi,
  dashboardMode = 'headquarters',
  courseDetailTitle,
}) => {
  const { user, profile, signOut } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [bellShaking, setBellShaking] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Pull live data from AuthContext — NO changes to source props/stores
  const xp     = profile?.xp     ?? 0
  const level  = profile?.level  ?? 1
  const streak = profile?.streak ?? 0
  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'Warrior'
  const avatarUrl   = profile?.avatar_url

  // Shake bell on mount if there are unread notifications
  useEffect(() => {
    const timer = setTimeout(() => setBellShaking(true), 1200)
    const reset  = setTimeout(() => setBellShaking(false), 2000)
    return () => { clearTimeout(timer); clearTimeout(reset) }
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Demo notifications (will be replaced when live notif query is wired)
  const notifications: NotifItem[] = [
    { id: '1', title: 'Trial Complete!', message: `You conquered "Python Loops" — +75 Hacksilver`, time: '12m ago', unread: true },
    { id: '2', title: 'Fury Streak!', message: `${streak} day streak of battle maintained 🔥`, time: '1h ago', unread: true },
    { id: '3', title: 'Arena Unlocked', message: 'A new Arcade Battle opens at dawn', time: '1d ago', unread: false },
  ]
  const unreadCount = notifications.filter((n) => n.unread).length

  // XP display formatter
  const formatXP = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`

  return (
    <header
      id="crucible-header"
      className="h-20 px-8 flex items-center justify-between sticky top-0 z-50 select-none"
      style={{
        background: 'rgba(7,5,5,0.90)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(42,20,20,0.9)',
        boxShadow: '0 1px 0 rgba(220,38,38,0.08), 0 4px 32px rgba(7,5,5,0.8)',
      }}
    >
      {/* ════════════════════════════════════
          LEFT — Brand Identity
      ════════════════════════════════════ */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex items-center justify-center w-10 h-10">
          <OmegaIcon className="w-9 h-9 drop-shadow-[0_0_12px_rgba(220,38,38,0.7)]" />
        </div>
        <div className="flex flex-col">
          <span
            className="text-slate-100 font-extrabold tracking-[0.22em] text-base leading-tight"
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.22em' }}
          >
            THE CRUCIBLE
          </span>
          <span
            className="text-red-500/70 text-[9px] tracking-[0.35em] uppercase leading-tight"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            CodeCity
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════
          CENTER — Navigation Tabs
      ════════════════════════════════════ */}
      <nav className="hidden lg:flex items-center gap-1">
        {NAV_ITEMS.map(({ key, mythicLabel }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectTab(key)}
              className={cn(
                'relative px-4 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all duration-200',
                isActive
                  ? 'text-red-400 nav-tab-active'
                  : 'text-slate-400 hover:text-red-300'
              )}
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {mythicLabel}
              {/* Hover amber glow underline */}
              {!isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-amber-500/50 transition-all duration-200 group-hover:w-4/5" />
              )}
            </button>
          )
        })}
      </nav>

      {/* ════════════════════════════════════
          RIGHT — Player HUD Status
      ════════════════════════════════════ */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Streak Fury — only show if > 0 */}
        {streak > 0 && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full hud-crimson"
            title={`${streak}-Day Fury Streak`}
          >
            <span className="text-base leading-none">🔥</span>
            <span className="text-[10px] font-bold leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
              {streak}
            </span>
            <span className="text-[9px] text-red-400/70 leading-none hidden xl:inline">Fury</span>
          </div>
        )}

        {/* Hacksilver XP */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full hud-gold"
          title={`${xp} Total XP (Hacksilver)`}
        >
          <span className="text-[11px] font-bold leading-none" style={{ fontFamily: "'Cinzel', serif", color: '#C59B27' }}>ᚱ</span>
          <span className="text-[10px] font-bold leading-none" style={{ color: '#F5C842', fontFamily: "'Cinzel', serif" }}>
            {formatXP(xp)} XP
          </span>
        </div>

        {/* Godhood Rank — Level */}
        <div
          className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full hud-iron"
          title={`Level ${level}`}
        >
          <span className="text-[9px] text-slate-500 leading-none" style={{ fontFamily: "'Cinzel', serif" }}>LVL</span>
          <span className="text-[12px] font-extrabold text-slate-200 leading-none" style={{ fontFamily: "'Cinzel', serif" }}>{level}</span>
          <span className="text-[8px] text-red-400/60 leading-none hidden xl:inline" style={{ fontFamily: "'Cinzel', serif" }}>God Slayer</span>
        </div>

        {/* ── Notifications Bell ── */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            id="crucible-notifications-btn"
            onClick={() => {
              setShowNotifications((v) => !v)
              setBellShaking(true)
              setTimeout(() => setBellShaking(false), 700)
            }}
            className="relative p-2 rounded-xl text-slate-400 hover:text-red-400 transition-colors"
            title="War Dispatches"
            style={{ background: 'rgba(42,20,20,0.5)', border: '1px solid rgba(220,38,38,0.18)' }}
          >
            <Bell
              className={cn('w-4 h-4', bellShaking && 'animate-bell-shake')}
              style={{ filter: showNotifications ? 'drop-shadow(0 0 6px rgba(220,38,38,0.8))' : undefined }}
            />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: '#DC2626', fontFamily: "'Cinzel', serif" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-3 w-80 rounded-2xl p-3 z-50 text-left"
              style={{
                background: 'rgba(14,10,10,0.97)',
                border: '1px solid rgba(220,38,38,0.25)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(220,38,38,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center justify-between pb-2.5 mb-2.5" style={{ borderBottom: '1px solid rgba(42,20,20,0.8)' }}>
                <span className="text-xs font-bold text-slate-200" style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.12em' }}>
                  WAR DISPATCHES
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-red-400" style={{ fontFamily: "'Cinzel', serif" }}>{unreadCount} New</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl text-xs transition-colors"
                    style={{
                      background: n.unread ? 'rgba(127,29,29,0.15)' : 'rgba(26,16,16,0.5)',
                      border: n.unread ? '1px solid rgba(220,38,38,0.2)' : '1px solid rgba(42,20,20,0.6)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-slate-200" style={{ fontFamily: "'Cinzel', serif" }}>{n.title}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">{n.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Primary CTA: Ignite the Flame ── */}
        <button
          type="button"
          id="crucible-ignite-btn"
          onClick={onOpenLumi}
          className="btn-lava hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold"
          title="Consult Lumi — Your War Sage"
        >
          <Sword className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Ignite the Flame</span>
          <span className="lg:hidden">Flame</span>
          <span className="text-base leading-none">→</span>
        </button>

        {/* ── Warrior Avatar + Profile Dropdown ── */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            id="crucible-profile-btn"
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2 p-1 rounded-xl transition-all hover:bg-[rgba(42,20,20,0.6)]"
          >
            {/* Kratos-styled circular frame */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden"
              style={{
                background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7F1D1D, #DC2626)',
                border: '2px solid rgba(220,38,38,0.8)',
                boxShadow: '0 0 12px rgba(220,38,38,0.45)',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontFamily: "'Cinzel', serif" }}>
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              className="absolute right-0 mt-3 w-60 rounded-2xl p-2 z-50"
              style={{
                background: 'rgba(14,10,10,0.97)',
                border: '1px solid rgba(220,38,38,0.25)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(220,38,38,0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Profile header */}
              <div className="px-3 py-2.5 mb-1" style={{ borderBottom: '1px solid rgba(42,20,20,0.8)' }}>
                <div className="font-bold text-sm text-slate-100" style={{ fontFamily: "'Cinzel', serif" }}>{displayName}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{user?.email}</div>
                <div
                  className="mt-1.5 inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold"
                  style={{
                    background: 'rgba(127,29,29,0.3)',
                    border: '1px solid rgba(220,38,38,0.3)',
                    color: '#FF8080',
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: '0.1em',
                  }}
                >
                  WARRIOR • LVL {level}
                </div>
              </div>

              <div className="flex flex-col gap-0.5 py-1">
                <button
                  type="button"
                  onClick={() => { onSelectTab('settings'); setShowProfileMenu(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => { onSelectTab('dashboard'); setShowProfileMenu(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500/70" />
                  My War Progress
                </button>
                <button
                  type="button"
                  onClick={() => { onSelectTab('settings'); setShowProfileMenu(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  Settings
                </button>
              </div>

              <div className="pt-1" style={{ borderTop: '1px solid rgba(42,20,20,0.8)' }}>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ color: '#EF4444', fontFamily: "'Inter', sans-serif" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(127,29,29,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Abandon the Crucible
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
