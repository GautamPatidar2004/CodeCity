import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

interface PixelTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function PixelTooltip({ content, children, side = "top", className }: PixelTooltipProps) {
  const [show, setShow] = useState(false)

  const POSITION_CLASSES: Record<string, string> = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full  left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full  top-1/2 -translate-y-1/2 ml-2",
  }

  const TAIL_CLASSES: Record<string, string> = {
    top:    "absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e1b4b] border-b-2 border-r-2 border-[#6366f1] rotate-45",
    bottom: "absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e1b4b] border-t-2 border-l-2 border-[#6366f1] rotate-45",
    left:   "absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1e1b4b] border-t-2 border-r-2 border-[#6366f1] rotate-45",
    right:  "absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1e1b4b] border-b-2 border-l-2 border-[#6366f1] rotate-45",
  }

  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 pointer-events-none",
              POSITION_CLASSES[side]
            )}
          >
            <div className="relative bg-[#1e1b4b]/95 border-2 border-[#6366f1] rounded-xl px-3 py-1.5 text-indigo-100 text-xs font-medium shadow-[0_0_16px_rgba(99,102,241,0.4)] whitespace-nowrap backdrop-blur-sm">
              {content}
              <div className={TAIL_CLASSES[side]} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
