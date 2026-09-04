import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "warning" | "ghost" | "outline" | "danger"
  size?: "sm" | "md" | "lg"
  shimmer?: boolean
}

const GamifiedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", shimmer = false, children, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-pixel uppercase tracking-wider " +
      "disabled:opacity-50 disabled:pointer-events-none rounded-2xl overflow-hidden select-none cursor-pointer font-bold transition-all"

    const sizeStyles: Record<string, string> = {
      sm: "h-9  px-4 text-[9px]  border-b-2 active:border-b-0 active:translate-y-0.5",
      md: "h-12 px-6 text-[11px] border-b-4 active:border-b-1 active:translate-y-1",
      lg: "h-14 px-8 text-[13px] border-b-[6px] active:border-b-2 active:translate-y-1.5",
    }

    const variantStyles: Record<string, string> = {
      primary:   "bg-[#1cb0f6] text-white border-[#1899d6] hover:bg-[#1899d6]",
      secondary: "bg-[#58cc02] text-white border-[#58a700] hover:bg-[#46a302] hover:border-[#46a302]",
      warning:   "bg-[#ffc800] text-white border-[#e5b400] hover:bg-[#e5b400]",
      danger:    "bg-[#ff4b4b] text-white border-[#cc3333] hover:bg-[#e03a3a]",
      ghost:     "bg-transparent text-slate-800 border-transparent hover:bg-slate-100",
      outline:   "bg-white text-slate-700 border-[#e5e5e5] border-2 hover:bg-slate-50",
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ y: variant === "ghost" ? 0 : 2, scaleX: 0.98 }}
        whileHover={{ y: -1 }}
        transition={{ type: "spring", stiffness: 600, damping: 28 }}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...(props as any)}
      >
        {shimmer && (
          <motion.span
            className="pointer-events-none absolute inset-0 -skew-x-12 bg-white/20"
            initial={{ x: "-120%" }}
            whileHover={{ x: "120%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        )}
        {children}
      </motion.button>
    )
  }
)
GamifiedButton.displayName = "GamifiedButton"

export { GamifiedButton }
export default GamifiedButton
