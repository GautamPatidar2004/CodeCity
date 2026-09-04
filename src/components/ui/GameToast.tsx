import { Toaster, toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { fireConfetti } from "./Confetti"

interface XPToastProps {
  xp: number
  message?: string
}

export function showXPToast({ xp, message }: XPToastProps) {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.85 }}
        animate={t.visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="flex items-center gap-2.5 bg-[#1e1044]/95 border border-[#6d28d9] text-white px-4 py-2.5 rounded-full shadow-[0_4px_24px_rgba(109,40,217,0.5)] backdrop-blur-sm font-pixel text-[10px] select-none"
      >
        <span className="text-amber-400 text-sm">✦</span>
        <span className="text-[#fbbf24] font-bold tracking-wider">+{xp} XP</span>
        {message && <span className="text-purple-200 font-normal text-[9px]">{message}</span>}
      </motion.div>
    ),
    { duration: 2800, position: "bottom-right" }
  )
}

interface QuestToastProps {
  title: string
  variant?: "complete" | "badge" | "streak" | "levelup"
}

const VARIANT_CONFIG = {
  complete: { icon: "✓", label: "QUEST COMPLETE", bg: "bg-emerald-600", border: "border-emerald-400", glow: "shadow-[0_4px_24px_rgba(16,185,129,0.5)]" },
  badge:    { icon: "🏅", label: "BADGE EARNED",   bg: "bg-amber-500",   border: "border-amber-300",   glow: "shadow-[0_4px_24px_rgba(245,158,11,0.5)]" },
  streak:   { icon: "🔥", label: "STREAK!",         bg: "bg-orange-500",  border: "border-orange-300",  glow: "shadow-[0_4px_24px_rgba(249,115,22,0.5)]" },
  levelup:  { icon: "⬆",  label: "LEVEL UP!",       bg: "bg-indigo-600",  border: "border-indigo-400",  glow: "shadow-[0_4px_24px_rgba(99,102,241,0.6)]" },
}

export function showQuestToast({ title, variant = "complete" }: QuestToastProps) {
  const cfg = VARIANT_CONFIG[variant]
  if (variant === "complete" || variant === "levelup") {
    fireConfetti(variant === "levelup" ? "levelup" : "questcomplete")
  }
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, x: 60, scale: 0.9 }}
        animate={t.visible ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 60, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className={`flex items-center gap-3 ${cfg.bg} border ${cfg.border} text-white px-4 py-3 rounded-2xl ${cfg.glow} backdrop-blur-sm select-none`}
      >
        <span className="text-lg">{cfg.icon}</span>
        <div>
          <div className="font-pixel text-[9px] font-bold tracking-[0.15em] opacity-80">{cfg.label}</div>
          <div className="font-bold text-sm leading-tight">{title}</div>
        </div>
      </motion.div>
    ),
    { duration: 4000, position: "bottom-right" }
  )
}

export function GameToaster() {
  return (
    <Toaster
      position="bottom-right"
      gutter={12}
      containerStyle={{ bottom: "24px", right: "24px" }}
    />
  )
}
