import React, { useState } from 'react'
import { cn } from '../../lib/utils'

/**
 * Alex Morgan — High-Fidelity Pixel-Art Character Avatar
 */
export const AlexPixelAvatar: React.FC<{
  size?: number
  className?: string
  bordered?: boolean
}> = ({ size = 36, className, bordered = true }) => {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden shrink-0 select-none bg-[#fed7aa] flex items-center justify-center",
        bordered && "border border-amber-300 shadow-xs",
        className
      )}
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <img
          src="/pixel_alex_portrait.jpg"
          alt="Alex Morgan"
          className="w-full h-full object-cover object-center pixelated"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        >
          <rect width="32" height="32" fill="#fed7aa" />
          <rect x="8" y="2" width="16" height="4" fill="#78350f" />
          <rect x="5" y="4" width="22" height="5" fill="#92400e" />
          <rect x="8" y="12" width="16" height="11" fill="#fde68a" />
          <rect x="10" y="15" width="4" height="4" fill="#0f172a" />
          <rect x="18" y="15" width="4" height="4" fill="#0f172a" />
          <rect x="11" y="15" width="2" height="2" fill="#ffffff" />
          <rect x="19" y="15" width="2" height="2" fill="#ffffff" />
          <rect x="6" y="23" width="20" height="9" fill="#7c3aed" />
        </svg>
      )}
    </div>
  )
}

/**
 * Lumi — High-Fidelity Pixel-Art AI Companion Avatar
 */
export const LumiPixelBot: React.FC<{
  size?: number
  className?: string
  glowing?: boolean
}> = ({ size = 32, className, glowing = true }) => {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className={cn(
        "relative shrink-0 select-none flex items-center justify-center rounded-xl overflow-hidden",
        glowing && "filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <img
          src="/pixel_lumi_avatar.jpg"
          alt="Lumi AI"
          className="w-full h-full object-cover object-center pixelated"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        >
          <rect x="6" y="5" width="20" height="20" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <rect x="8" y="8" width="16" height="14" rx="4" fill="#091410" />
          <rect x="10" y="12" width="3" height="4" rx="1" fill="#34d399" />
          <rect x="19" y="12" width="3" height="4" rx="1" fill="#34d399" />
          <path d="M13 18 Q16 20 19 18" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      )}
    </div>
  )
}

/**
 * Pixel Python Adventure Icon
 */
export const PixelPythonIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className,
}) => {
  return (
    <div className={cn("shrink-0 select-none", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <path d="M6 6 h10 v5 h5 v6 h-5 v-3 h-10 v-8 Z" fill="#3b82f6" />
        <rect x="8" y="8" width="2" height="2" fill="#ffffff" />
        <path d="M26 26 h-10 v-5 h-5 v-6 h5 v3 h10 v8 Z" fill="#eab308" />
        <rect x="22" y="22" width="2" height="2" fill="#ffffff" />
      </svg>
    </div>
  )
}

/**
 * Pixel Retro Gamepad Icon
 */
export const PixelGamepadIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className,
}) => {
  return (
    <div className={cn("shrink-0 select-none", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <path
          d="M6 10 C4 10 3 12 3 14 L4 22 C4 24 7 25 9 23 L12 20 H20 L23 23 C25 25 28 24 28 22 L29 14 C29 12 28 10 26 10 Z"
          fill="#8b5cf6"
        />
        <rect x="7" y="14" width="4" height="2" fill="#1e1b4b" />
        <rect x="8" y="13" width="2" height="4" fill="#1e1b4b" />
        <circle cx="22" cy="14" r="1.5" fill="#f43f5e" />
        <circle cx="25" cy="16" r="1.5" fill="#38bdf8" />
        <circle cx="22" cy="18" r="1.5" fill="#10b981" />
      </svg>
    </div>
  )
}

/**
 * Pixel Terminal Desk Illustration for the Current Quest Card
 */
export const PixelTerminalWorkspace: React.FC<{ className?: string }> = ({ className }) => {
  const [imgError, setImgError] = useState(false)

  return (
    <div className={cn("relative w-36 sm:w-44 h-24 sm:h-28 shrink-0 select-none rounded-2xl overflow-hidden", className)}>
      {!imgError ? (
        <img
          src="/pixel_terminal_workspace.jpg"
          alt="Coding Terminal"
          className="w-full h-full object-cover object-center pixelated"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg viewBox="0 0 140 90" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
          <rect x="6" y="70" width="128" height="6" fill="#92400e" />
          <rect x="36" y="16" width="68" height="48" rx="4" fill="#334155" />
          <rect x="40" y="20" width="60" height="40" rx="2" fill="#0f172a" />
          <path d="M 52 32 L 46 40 L 52 48" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 88 32 L 94 40 L 88 48" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      )}
    </div>
  )
}

/**
 * Pixel Achievement Badges
 */
export const PixelBadgeStreak: React.FC<{ size?: number }> = ({ size = 44 }) => {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl bg-orange-50 border border-orange-200 shadow-xs"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7" style={{ imageRendering: 'pixelated' }}>
        <circle cx="16" cy="16" r="13" fill="#f97316" />
        <circle cx="16" cy="16" r="11" fill="#7c2d12" />
        <path d="M16 7 C14 11 11 14 11 18 C11 21 13 23 16 23 C19 23 21 21 21 18 C21 13 17 10 16 7 Z" fill="#fbbf24" />
        <path d="M16 13 C15 15 13 17 13 19 C13 21 14 22 16 22 C18 22 19 21 19 19 C19 16 17 14 16 13 Z" fill="#ef4444" />
      </svg>
    </div>
  )
}

export const PixelBadgeBugHunter: React.FC<{ size?: number }> = ({ size = 44 }) => {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7" style={{ imageRendering: 'pixelated' }}>
        <circle cx="16" cy="16" r="13" fill="#10b981" />
        <circle cx="16" cy="16" r="11" fill="#064e3b" />
        <rect x="12" y="11" width="8" height="10" rx="3" fill="#34d399" />
        <circle cx="14" cy="14" r="1" fill="#0f172a" />
        <circle cx="18" cy="14" r="1" fill="#0f172a" />
      </svg>
    </div>
  )
}

export const PixelBadgeFastDebugger: React.FC<{ size?: number }> = ({ size = 44 }) => {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 shadow-xs"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7" style={{ imageRendering: 'pixelated' }}>
        <circle cx="16" cy="16" r="13" fill="#eab308" />
        <circle cx="16" cy="16" r="11" fill="#713f12" />
        <polygon points="17,6 9,17 15,17 13,26 23,14 17,14" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
      </svg>
    </div>
  )
}

export const PixelBadgeFirstBuild: React.FC<{ size?: number }> = ({ size = 44 }) => {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 shadow-xs"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7" style={{ imageRendering: 'pixelated' }}>
        <circle cx="16" cy="16" r="13" fill="#8b5cf6" />
        <circle cx="16" cy="16" r="11" fill="#3b0764" />
        <polygon points="16,8 24,12 16,16 8,12" fill="#c084fc" />
        <polygon points="8,12 16,16 16,24 8,20" fill="#9333ea" />
        <polygon points="24,12 16,16 16,24 24,20" fill="#a855f7" />
      </svg>
    </div>
  )
}

export const PixelBadgeFirstSteps: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 shadow-xs"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8" style={{ imageRendering: 'pixelated' }}>
        <circle cx="16" cy="16" r="13" fill="#f59e0b" />
        <circle cx="16" cy="16" r="11" fill="#78350f" />
        <rect x="8" y="11" width="7" height="10" fill="#fef3c7" />
        <rect x="17" y="11" width="7" height="10" fill="#fef3c7" />
        <line x1="16" y1="10" x2="16" y2="22" stroke="#d97706" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export const PixelBadgeCodeWarrior: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl bg-sky-50 border border-sky-200 shadow-xs"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8" style={{ imageRendering: 'pixelated' }}>
        <circle cx="16" cy="16" r="13" fill="#0284c7" />
        <circle cx="16" cy="16" r="11" fill="#082f49" />
        <path d="M12 11 L8 16 L12 21" stroke="#38bdf8" strokeWidth="2" strokeLinecap="square" fill="none" />
        <path d="M20 11 L24 16 L20 21" stroke="#38bdf8" strokeWidth="2" strokeLinecap="square" fill="none" />
        <line x1="17" y1="10" x2="15" y2="22" stroke="#38bdf8" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export const PixelBadgeQuestMaster: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-2xl bg-purple-50 border border-purple-200 shadow-xs"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8" style={{ imageRendering: 'pixelated' }}>
        <circle cx="16" cy="16" r="13" fill="#7c3aed" />
        <circle cx="16" cy="16" r="11" fill="#2e1065" />
        <polygon points="16,6 23,12 20,24 12,24 9,12" fill="#c084fc" />
        <polygon points="16,6 20,12 16,24 12,12" fill="#e9d5ff" />
      </svg>
    </div>
  )
}

/**
 * Pixel Community Project Thumbnails
 */
export const PixelWeatherThumbnail: React.FC = () => {
  return (
    <div className="w-full h-24 rounded-xl overflow-hidden relative select-none bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200 flex items-center justify-center">
      <svg viewBox="0 0 160 80" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <circle cx="40" cy="28" r="14" fill="#fbbf24" />
        <circle cx="40" cy="28" r="10" fill="#fef08a" />
        <rect x="70" y="24" width="40" height="16" rx="8" fill="#ffffff" />
        <rect x="60" y="30" width="30" height="12" rx="6" fill="#ffffff" />
        <rect x="95" y="28" width="25" height="12" rx="6" fill="#ffffff" />
        <ellipse cx="40" cy="85" rx="55" ry="25" fill="#15803d" />
        <ellipse cx="120" cy="85" rx="65" ry="28" fill="#16a34a" />
      </svg>
    </div>
  )
}

export const PixelSpaceRunnerThumbnail: React.FC = () => {
  return (
    <div className="w-full h-24 rounded-xl overflow-hidden relative select-none bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#311042] flex items-center justify-center">
      <svg viewBox="0 0 160 80" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <circle cx="20" cy="15" r="1.5" fill="#fde047" />
        <circle cx="75" cy="18" r="1" fill="#fff" />
        <circle cx="140" cy="22" r="1.5" fill="#38bdf8" />
        <polygon points="90,32 115,40 90,48 96,40" fill="#e2e8f0" />
        <polygon points="90,32 84,26 86,40" fill="#38bdf8" />
        <polygon points="90,48 84,54 86,40" fill="#38bdf8" />
        <circle cx="45" cy="40" r="16" fill="#9333ea" />
      </svg>
    </div>
  )
}

export const PixelAIStudyBuddyThumbnail: React.FC = () => {
  return (
    <div className="w-full h-24 rounded-xl overflow-hidden relative select-none bg-gradient-to-b from-purple-100 via-indigo-50 to-emerald-50 flex items-center justify-center">
      <svg viewBox="0 0 160 80" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <line x1="20" y1="20" x2="70" y2="20" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="28" x2="55" y2="28" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="36" x2="65" y2="36" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
        <g transform="translate(100, 16)">
          <rect x="0" y="0" width="36" height="36" rx="10" fill="#059669" />
          <rect x="3" y="3" width="30" height="30" rx="8" fill="#091410" />
          <rect x="8" y="12" width="5" height="6" rx="1" fill="#34d399" />
          <rect x="23" y="12" width="5" height="6" rx="1" fill="#34d399" />
          <path d="M12 24 Q18 28 24 24" stroke="#34d399" strokeWidth="2" fill="none" />
        </g>
      </svg>
    </div>
  )
}

/**
 * PixelHeroBannerScene
 * Ultra High-Resolution Pixel Scene with fallback
 */
export const PixelHeroBannerScene: React.FC = () => {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="relative w-full h-full flex items-center justify-end overflow-hidden select-none pointer-events-none">
      {!imgError ? (
        <div className="relative w-full h-full flex justify-end">
          <img
            src="/alex_desk_banner.jpg"
            alt=""
            className="h-full w-auto max-w-[65%] object-cover object-left pixelated opacity-95"
            onError={() => setImgError(true)}
          />
          {/* Subtle gradient overlay to merge seamlessly into white card background */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent w-full" />
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-between">
          <div className="w-48 h-36">
            <svg viewBox="0 0 160 120" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
              <rect x="10" y="85" width="120" height="8" fill="#92400e" />
              <rect x="44" y="14" width="34" height="18" rx="4" fill="#78350f" />
              <rect x="42" y="44" width="36" height="38" rx="4" fill="#7c3aed" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * PixelFirstTimeHeroScene
 * Ultra High-Resolution First-Time Portal Scene with fallback
 */
export const PixelFirstTimeHeroScene: React.FC = () => {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="relative w-full h-full flex items-center justify-end overflow-hidden select-none pointer-events-none">
      {!imgError ? (
        <div className="relative w-full h-full flex justify-end">
          <img
            src="/alex_portal_banner.jpg"
            alt=""
            className="h-full w-auto max-w-[68%] object-cover object-left pixelated opacity-95"
            onError={() => setImgError(true)}
          />
          {/* Subtle gradient overlay to merge seamlessly into white card background */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent w-full" />
        </div>
      ) : (
        <div className="w-full max-w-[540px] h-44 sm:h-52 shrink-0">
          <svg viewBox="0 0 360 140" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
            <polygon points="0,110 360,110 360,140 0,140" fill="#15803d" />
            <g transform="translate(200, 25)">
              <path d="M 0 85 L 0 35 C 0 10 50 10 50 35 L 50 85 Z" fill="#94a3b8" />
            </g>
          </svg>
        </div>
      )}
    </div>
  )
}

/**
 * PixelMiniTerminal
 */
export const PixelMiniTerminal: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className,
}) => {
  return (
    <div className={cn("relative shrink-0 select-none flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <rect x="2" y="4" width="32" height="24" rx="3" fill="#334155" />
        <rect x="4" y="6" width="28" height="20" rx="2" fill="#0f172a" />
        <rect x="14" y="28" width="8" height="3" fill="#475569" />
        <rect x="10" y="31" width="16" height="2" rx="1" fill="#334155" />
        <path d="M 8 13 L 13 16 L 8 19" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1="16" y1="19" x2="21" y2="19" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}
