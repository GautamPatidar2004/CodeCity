import * as React from "react"
import { cn } from "../../lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "cyan" | "emerald" | "amber" | "purple" | "none"
  accentColor?: "emerald" | "amber" | "purple" | "blue" | "rose" | string
  bordered?: boolean
}

const GamifiedCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = "none", accentColor, bordered = true, ...props }, ref) => {
    const glowStyles = {
      none: "",
      cyan: "shadow-[0_8px_30px_rgba(56,189,248,0.15)] hover:shadow-[0_12px_40px_rgba(56,189,248,0.25)]",
      emerald: "shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.25)]",
      amber: "shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.25)]",
      purple: "shadow-[0_8px_30px_rgba(168,85,247,0.15)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.25)]",
    }

    const accentStyles: Record<string, string> = {
      emerald: "border-l-4 border-l-emerald-500",
      amber: "border-l-4 border-l-amber-500",
      purple: "border-l-4 border-l-purple-500",
      blue: "border-l-4 border-l-blue-500",
      rose: "border-l-4 border-l-rose-500",
    }

    const accentClass = accentColor ? (accentStyles[accentColor] || "border-l-4 border-l-emerald-500") : ""

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl bg-white text-slate-900 shadow-sm transition-all",
          bordered && "border border-slate-100",
          glowStyles[glow],
          accentClass,
          className
        )}
        {...props}
      />
    )
  }
)
GamifiedCard.displayName = "GamifiedCard"

export { GamifiedCard }
export default GamifiedCard
