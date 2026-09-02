import * as React from "react"
import { cn } from "../../lib/utils"

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  showTagline?: boolean
  variant?: "light" | "dark" | "full"
}

/**
 * Official CodeQuest CQ Monogram with Cyan-to-Blue 'C', Purple-to-Violet 'Q', and Golden Sparkle Star
 */
export function CodeQuestMonogram({
  className,
  size = 40,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
    >
      <defs>
        {/* 'C' Gradient: Cyan to Royal Blue */}
        <linearGradient id="cq_c_grad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#00c6ff" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* 'Q' Gradient: Vivid Purple to Violet */}
        <linearGradient id="cq_q_grad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="60%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        {/* Gold Star Gradient */}
        <linearGradient id="cq_star_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        {/* Soft Drop Shadow for Monogram Depth */}
        <filter id="cq_shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#cq_shadow)">
        {/* Letter 'C' Path */}
        <path
          d="M 52 22 C 34 22 20 35 20 52 C 20 69 34 82 52 82 C 60 82 66 79 70 75 C 72 73 71 70 69 68 C 67 66 64 67 62 69 C 59 72 55 74 50 74 C 38 74 29 64 29 52 C 29 40 38 30 50 30 C 55 30 60 32 63 35 C 65 37 68 37 70 35 C 72 33 72 30 70 28 C 65 24 59 22 52 22 Z"
          fill="url(#cq_c_grad)"
        />

        {/* Letter 'Q' Path */}
        <path
          d="M 64 32 C 50 32 38 44 38 58 C 38 72 50 84 64 84 C 70 84 75 82 79 78 L 86 85 C 88 87 91 86 92 84 C 93 82 92 79 90 77 L 84 71 C 88 67 90 63 90 58 C 90 44 78 32 64 32 Z M 64 42 C 73 42 80 49 80 58 C 80 62 78 66 75 69 C 73 66 70 65 67 65 C 64 65 62 67 62 70 C 62 72 64 74 66 76 C 65 76 64 76 64 76 C 55 76 48 69 48 58 C 48 49 55 42 64 42 Z"
          fill="url(#cq_q_grad)"
        />

        {/* 4-Point Golden Sparkle Star on top right of Q */}
        <path
          d="M 86 16 Q 86 26 96 26 Q 86 26 86 36 Q 86 26 76 26 Q 86 26 86 16 Z"
          fill="url(#cq_star_grad)"
        />
      </g>
    </svg>
  )
}

/**
 * CodeQuest Full Brand Logo (CQ Monogram + "CodeQuest" Wordmark + Tagline)
 */
export function CodeQuestLogo({
  className,
  size = "md",
  showTagline = false,
  ...props
}: LogoProps) {
  const iconSizes = {
    sm: 30,
    md: 38,
    lg: 46,
    xl: 56,
  }

  const titleSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 select-none group focus:outline-none",
        className
      )}
      {...props}
    >
      {/* Monogram Symbol */}
      <CodeQuestMonogram size={iconSizes[size]} className="group-hover:scale-105 transition-transform duration-200" />

      {/* Brand Text Lockup */}
      <div className="flex flex-col">
        <div className={cn("font-black tracking-tight flex items-center leading-none", titleSizes[size])}>
          <span className="text-slate-900">Code</span>
          <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Quest
          </span>
        </div>

        {showTagline && (
          <span className="text-[8px] sm:text-[9.5px] font-extrabold uppercase tracking-[0.24em] text-slate-500 mt-1">
            LEARN <span className="text-emerald-500">•</span> CODE{" "}
            <span className="text-purple-500">•</span> LEVEL UP
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * App Icon Squircle Variant (Used for badges, tiles, favicons)
 */
export function CodeQuestAppIcon({
  className,
  size = 56,
  theme = "dark",
}: {
  className?: string
  size?: number
  theme?: "dark" | "light"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center shadow-lg transition-all",
        theme === "dark"
          ? "bg-[#0b0e1b] border border-indigo-900/60 shadow-indigo-950/40"
          : "bg-white border border-slate-200/80 shadow-slate-200/60",
        className
      )}
      style={{ width: size, height: size }}
    >
      <CodeQuestMonogram size={Math.round(size * 0.72)} />
    </div>
  )
}

/**
 * QuestBot Mascot Avatar with Winking Screen & "Let's Build Together!" Speech Bubble
 */
export function QuestBotHead({
  className,
  size = 64,
  showBubble = false,
  bubbleText = "Let's Build Together!",
}: {
  className?: string
  size?: number
  showBubble?: boolean
  bubbleText?: string
}) {
  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <div
        className="relative shrink-0 filter drop-shadow-md animate-float-slow"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ imageRendering: "pixelated" }}
        >
          {/* Blue Ear/Headphone Pods */}
          <ellipse cx="14" cy="50" rx="8" ry="16" fill="#0284c7" />
          <ellipse cx="86" cy="50" rx="8" ry="16" fill="#0284c7" />
          <ellipse cx="14" cy="50" rx="5" ry="12" fill="#38bdf8" />
          <ellipse cx="86" cy="50" rx="5" ry="12" fill="#38bdf8" />

          {/* White Robot Head Body */}
          <rect
            x="20"
            y="18"
            width="60"
            height="58"
            rx="20"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="2"
          />

          {/* Black Digital Screen Face */}
          <rect
            x="26"
            y="26"
            width="48"
            height="42"
            rx="14"
            fill="#0f172a"
          />

          {/* Cyan Glowing Left Eye: Star Sparkle */}
          <polygon
            points="38,40 41,45 46,45 42,48 44,53 38,50 32,53 34,48 30,45 35,45"
            fill="#38bdf8"
            className="animate-pulse"
          />

          {/* Cyan Glowing Right Eye: Winking Crescent `<` */}
          <path
            d="M 64 42 L 58 46 L 64 50"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Cyan Smiling Mouth */}
          <path
            d="M 44 56 Q 50 62 56 56"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Ambient Gold Star */}
        <span className="absolute -top-1 -right-1 text-amber-400 text-xs animate-twinkle">
          ✦
        </span>
      </div>

      {showBubble && (
        <div className="relative bg-white border-2 border-slate-200 rounded-2xl px-3.5 py-2 shadow-md max-w-[190px]">
          <p className="font-sans font-bold text-xs text-slate-800 leading-tight">
            {bubbleText}
          </p>
          {/* Bubble tail */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-b-2 border-l-2 border-slate-200 rotate-45" />
        </div>
      )}
    </div>
  )
}
