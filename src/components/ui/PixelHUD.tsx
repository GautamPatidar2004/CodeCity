import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface XPBarProps {
  current: number
  max: number
  segments?: number
  label?: string
  className?: string
  animate?: boolean
}

/**
 * PixelXPBar — Segmented neon green XP progress bar.
 */
export function PixelXPBar({
  current,
  max,
  segments = 8,
  label,
  className,
  animate = true,
}: XPBarProps) {
  const safeMax = max > 0 ? max : 100
  const safeCurrent = Math.max(0, Math.min(current, safeMax))
  const filled = Math.round((safeCurrent / safeMax) * segments)
  const pct = Math.round((safeCurrent / safeMax) * 100)

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="font-pixel text-[9px] text-slate-500 uppercase tracking-wider">{label}</span>
          <span className="font-pixel text-[9px] text-emerald-500 font-bold">{current} / {max} XP</span>
        </div>
      )}
      <div className="flex gap-[3px]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filled
          return (
            <motion.div
              key={i}
              className={cn(
                "h-3 flex-1 rounded-[2px] transition-all",
                isFilled
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]"
                  : "bg-slate-200"
              )}
              initial={animate ? { scaleX: 0, opacity: 0 } : false}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Level Badge ─────────────────────────────────────────────────────────────

interface LevelBadgeProps {
  level: number
  xp: number
  maxXp?: number
  className?: string
}

export function LevelBadge({ level, xp, maxXp = 500, className }: LevelBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "bg-[#191535]/95 border-2 border-[#382f6b] rounded-2xl p-3.5 shadow-2xl backdrop-blur-md min-w-[160px]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-pixel text-[10px] text-white uppercase tracking-wider font-bold">
          LEVEL {level}
        </span>
        <span className="text-[10px] text-indigo-300">⚔️</span>
      </div>
      <PixelXPBar current={xp} max={maxXp} segments={8} animate />
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-amber-400 text-xs">⭐</span>
        <span className="font-pixel text-[9px] text-[#fcd34d] font-bold tracking-wide">
          {xp.toLocaleString()} XP
        </span>
      </div>
    </motion.div>
  )
}

// ─── Streak Counter ──────────────────────────────────────────────────────────

interface StreakProps {
  days: number
  className?: string
}

export function PixelStreakCounter({ days, className }: StreakProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      className={cn(
        "flex items-center gap-2 bg-orange-500/10 border-2 border-orange-400/60 rounded-2xl px-3 py-2 cursor-default select-none",
        className
      )}
    >
      <motion.span
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="text-xl"
      >
        🔥
      </motion.span>
      <div>
        <div className="font-pixel text-[11px] font-bold text-orange-600 leading-none">{days} DAY</div>
        <div className="font-pixel text-[8px] text-orange-500 uppercase tracking-wider">STREAK</div>
      </div>
    </motion.div>
  )
}

// ─── Achievement Badge ────────────────────────────────────────────────────────

interface BadgeProps {
  icon: string
  label: string
  variant?: "success" | "gold" | "purple" | "blue"
  className?: string
  animate?: boolean
}

const BADGE_STYLES = {
  success: "bg-emerald-600 border-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.4)]",
  gold:    "bg-amber-500   border-amber-300   shadow-[0_4px_16px_rgba(245,158,11,0.4)]",
  purple:  "bg-violet-600  border-violet-400  shadow-[0_4px_16px_rgba(139,92,246,0.4)]",
  blue:    "bg-sky-600     border-sky-400     shadow-[0_4px_16px_rgba(14,165,233,0.4)]",
}

export function AchievementBadge({ icon, label, variant = "success", className, animate = true }: BadgeProps) {
  return (
    <motion.div
      initial={animate ? { scale: 0, rotate: -8, opacity: 0 } : false}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: "spring", stiffness: 360, damping: 20 }}
      className={cn(
        "inline-flex items-center gap-1.5 border-2 text-white px-3 py-1.5 rounded-xl font-pixel text-[9px] font-bold tracking-wider uppercase select-none",
        BADGE_STYLES[variant],
        className
      )}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </motion.div>
  )
}

// ─── XP Pill (floating popup) ─────────────────────────────────────────────────

export function XPPill({ xp, className }: { xp: number; className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
      className={cn(
        "inline-flex items-center gap-1.5 bg-[#251644]/90 border border-[#6432aa] px-3 py-1.5 rounded-full",
        "shadow-[0_4px_20px_rgba(100,50,170,0.5)] text-[#d8b4fe] font-pixel text-[9px]",
        "select-none cursor-default",
        className
      )}
    >
      <span className="text-amber-400 text-xs">✦</span>
      <span>+{xp} XP</span>
    </motion.div>
  )
}
