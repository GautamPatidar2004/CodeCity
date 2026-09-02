import { useMemo } from "react"

export function FirefliesBackground({ className }: { className?: string }) {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 17 + 7) % 94}%`,
      top: `${(i * 23 + 11) % 90}%`,
      size: `${2 + (i % 4)}px`,
      color: ["#22c55e", "#fbbf24", "#a855f7", "#38bdf8"][i % 4],
      duration: `${3 + (i % 4) * 1.2}s`,
      delay: `${(i % 5) * 0.7}s`,
    }))
  }, [])

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className ?? ""}`}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}, 0 0 14px ${p.color}`,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
