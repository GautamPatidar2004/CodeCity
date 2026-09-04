import * as React from "react"
import { cn } from "../../lib/utils"

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  showBadge?: boolean
}

/**
 * Original Coding Conflicts Logo
 * Minimal icon: `>_` terminal prompt fused with a golden pixel quest star.
 */
export function CodingConflictsIcon({
  size = 36,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn("relative shrink-0 select-none flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 44 44"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="cc_bg_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="cc_star_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="cc_soft_shadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Soft rounded squircle badge container */}
        <rect
          x="2"
          y="2"
          width="40"
          height="40"
          rx="12"
          fill="url(#cc_bg_grad)"
          filter="url(#cc_soft_shadow)"
        />

        {/* Subtle inner border */}
        <rect
          x="3"
          y="3"
          width="38"
          height="38"
          rx="11"
          stroke="#34d399"
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />

        {/* Terminal Chevron `>` */}
        <path
          d="M13 14 L22 22 L13 30"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Terminal Cursor `_` */}
        <line
          x1="24"
          y1="30"
          x2="31"
          y2="30"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Golden Pixel Quest Star at top right */}
        <g transform="translate(25, 8)">
          <path
            d="M 6 0 Q 6 4 10 4 Q 6 4 6 8 Q 6 4 2 4 Q 6 4 6 0 Z"
            fill="url(#cc_star_grad)"
          />
          <circle cx="6" cy="4" r="1.2" fill="#fff" />
        </g>
      </svg>
    </div>
  )
}

/**
 * Full Coding Conflicts Brand Header (Icon + Modern Expressive Typography)
 */
export function CodingConflictsLogo({
  size = "md",
  showText = true,
  className,
  ...props
}: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 select-none group cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
          {/* Left Green Chevron `<` */}
          <path d="M 10 7 L 3 16 L 10 25" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Center Vertical Slash / Star `|` */}
          <line x1="16" y1="6" x2="16" y2="26" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right Green Chevron `>` */}
          <path d="M 22 7 L 29 16 L 22 25" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      {showText && (
        <span className="font-black text-[17px] text-stone-900 tracking-tight leading-none">
          Coding Conflicts
        </span>
      )}
    </div>
  )
}
