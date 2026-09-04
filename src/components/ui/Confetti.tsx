import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

interface ConfettiConfig {
  particleCount?: number
  spread?: number
  origin?: { x?: number; y?: number }
  colors?: string[]
}

/**
 * Fires a confetti burst. Call this imperatively wherever needed.
 */
export function fireConfetti(type: "xp" | "levelup" | "questcomplete" | "default" = "default") {
  const configs: Record<string, ConfettiConfig[]> = {
    xp: [
      { particleCount: 60, spread: 55, origin: { y: 0.75 }, colors: ["#22c55e", "#fbbf24", "#a3e635"] },
    ],
    levelup: [
      { particleCount: 120, spread: 80, origin: { x: 0.3, y: 0.5 }, colors: ["#f59e0b", "#22c55e", "#818cf8"] },
      { particleCount: 120, spread: 80, origin: { x: 0.7, y: 0.5 }, colors: ["#f59e0b", "#22c55e", "#818cf8"] },
    ],
    questcomplete: [
      { particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#22c55e", "#4ade80", "#86efac", "#fbbf24"] },
    ],
    default: [
      { particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: ["#22c55e", "#fbbf24", "#818cf8"] },
    ],
  }

  const bursts = configs[type] ?? configs.default
  bursts.forEach((cfg) => {
    confetti({
      ...cfg,
      scalar: 1.1,
      shapes: ["square", "circle"],
      ticks: 220,
      gravity: 0.85,
    })
  })
}

/**
 * ConfettiButton — wraps any child and fires confetti on click.
 */
export function ConfettiButton({
  children,
  type: confettiType = "xp",
  onClick,
  className,
}: {
  children: React.ReactNode
  type?: "xp" | "levelup" | "questcomplete" | "default"
  onClick?: () => void
  className?: string
}) {
  const handleClick = () => {
    fireConfetti(confettiType)
    onClick?.()
  }
  return (
    <span className={className} onClick={handleClick} style={{ cursor: "pointer" }}>
      {children}
    </span>
  )
}

/**
 * AutoConfetti — fires confetti automatically on mount.
 */
export function AutoConfetti({ type = "questcomplete", delay = 400 }: {
  type?: "xp" | "levelup" | "questcomplete" | "default"
  delay?: number
}) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    const t = setTimeout(() => fireConfetti(type), delay)
    return () => clearTimeout(t)
  }, [type, delay])
  return null
}
