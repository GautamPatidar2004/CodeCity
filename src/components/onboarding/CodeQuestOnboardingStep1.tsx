import * as React from "react"
import { CodeQuestLogo } from "../brand/CodeQuestLogo"

interface QuestOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export function CodeQuestOnboardingStep1({
  onContinue,
}: {
  onContinue?: () => void
}) {
  const [selectedQuests, setSelectedQuests] = React.useState<string[]>([
    "build-websites",
  ])

  const toggleQuest = (id: string) => {
    setSelectedQuests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleContinue = () => {
    onContinue?.()
  }

  const handleSkip = () => {
    onContinue?.()
  }

  const questOptions: QuestOption[] = [
    {
      id: "build-websites",
      title: "Build Websites",
      description: "Create beautiful websites from scratch.",
      icon: (
        <div className="w-16 h-12 relative flex items-center justify-center">
          <svg viewBox="0 0 48 36" className="w-full h-full pixelated">
            <rect x="2" y="2" width="44" height="32" rx="3" fill="#6366f1" />
            <rect x="4" y="4" width="40" height="28" rx="2" fill="#ffffff" />
            <rect x="4" y="4" width="40" height="6" fill="#4f46e5" />
            <circle cx="8" cy="7" r="1" fill="#f87171" />
            <circle cx="12" cy="7" r="1" fill="#fbbf24" />
            <circle cx="16" cy="7" r="1" fill="#4ade80" />
            <rect x="8" y="14" width="14" height="14" rx="1" fill="#93c5fd" />
            <polygon points="9,25 14,20 18,24 21,21 21,27 9,27" fill="#3b82f6" />
            <circle cx="18" cy="17" r="1.5" fill="#fbbf24" />
            <rect x="26" y="14" width="14" height="2.5" rx="1" fill="#94a3b8" />
            <rect x="26" y="19" width="12" height="2" rx="1" fill="#cbd5e1" />
            <rect x="26" y="23" width="10" height="2" rx="1" fill="#cbd5e1" />
          </svg>
        </div>
      ),
    },
    {
      id: "create-games",
      title: "Create Games",
      description: "Turn your ideas into playable experiences.",
      icon: (
        <div className="w-16 h-12 relative flex items-center justify-center">
          <svg viewBox="0 0 48 36" className="w-full h-full pixelated">
            <path
              d="M10 10 C8 10 6 12 6 15 L8 28 C9 31 13 32 16 30 L20 26 C22 25 26 25 28 26 L32 30 C35 32 39 31 40 28 L42 15 C42 12 40 10 38 10 Z"
              fill="#8b5cf6"
              stroke="#6d28d9"
              strokeWidth="2"
            />
            <rect x="13" y="17" width="8" height="3" fill="#1e1b4b" />
            <rect x="15.5" y="14.5" width="3" height="8" fill="#1e1b4b" />
            <circle cx="34" cy="16" r="1.8" fill="#f87171" />
            <circle cx="37" cy="19" r="1.8" fill="#60a5fa" />
            <circle cx="31" cy="19" r="1.8" fill="#fbbf24" />
            <circle cx="34" cy="22" r="1.8" fill="#4ade80" />
            <rect x="21" y="20" width="2.5" height="1.5" rx="0.5" fill="#4c1d95" />
            <rect x="24.5" y="20" width="2.5" height="1.5" rx="0.5" fill="#4c1d95" />
          </svg>
        </div>
      ),
    },
    {
      id: "build-ai",
      title: "Build AI",
      description: "Explore AI and build intelligent tools.",
      icon: (
        <div className="w-16 h-12 relative flex items-center justify-center">
          <svg viewBox="0 0 48 36" className="w-full h-full pixelated">
            <rect x="23" y="2" width="2" height="6" fill="#94a3b8" />
            <circle cx="24" cy="3" r="2.5" fill="#fbbf24" />
            <rect x="10" y="8" width="28" height="22" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="7" y="14" width="3" height="10" rx="1.5" fill="#06b6d4" />
            <rect x="38" y="14" width="3" height="10" rx="1.5" fill="#06b6d4" />
            <rect x="13" y="12" width="22" height="14" rx="3" fill="#0f172a" />
            <rect x="17" y="16" width="4" height="6" rx="1" fill="#38bdf8" />
            <rect x="27" y="16" width="4" height="6" rx="1" fill="#38bdf8" />
            <path d="M21 23 Q24 25 27 23" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      ),
    },
    {
      id: "analyze-data",
      title: "Analyze Data",
      description: "Discover patterns and make data useful.",
      icon: (
        <div className="w-16 h-12 relative flex items-center justify-center">
          <svg viewBox="0 0 48 36" className="w-full h-full pixelated">
            <rect x="12" y="18" width="6" height="14" rx="1" fill="#a855f7" stroke="#7e22ce" strokeWidth="1" />
            <polygon points="12,18 15,15 21,15 18,18" fill="#c084fc" />
            <polygon points="18,18 21,15 21,29 18,32" fill="#6b21a8" />
            <rect x="21" y="12" width="6" height="20" rx="1" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <polygon points="21,12 24,9 30,9 27,12" fill="#fbbf24" />
            <polygon points="27,12 30,9 30,29 27,32" fill="#92400e" />
            <rect x="30" y="6" width="6" height="26" rx="1" fill="#10b981" stroke="#047857" strokeWidth="1" />
            <polygon points="30,6 33,3 39,3 36,6" fill="#34d399" />
            <polygon points="36,6 39,3 39,29 36,32" fill="#065f46" />
          </svg>
        </div>
      ),
    },
    {
      id: "build-apps",
      title: "Build Apps",
      description: "Create useful apps people can use.",
      icon: (
        <div className="w-16 h-12 relative flex items-center justify-center">
          <svg viewBox="0 0 48 36" className="w-full h-full pixelated">
            <rect x="16" y="2" width="16" height="32" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <rect x="18" y="5" width="12" height="24" rx="1.5" fill="#0f172a" />
            <rect x="22" y="3.5" width="4" height="0.8" rx="0.4" fill="#93c5fd" />
            <rect x="19.5" y="7" width="3.5" height="3.5" rx="0.8" fill="#f43f5e" />
            <rect x="24.5" y="7" width="3.5" height="3.5" rx="0.8" fill="#3b82f6" />
            <rect x="19.5" y="12" width="3.5" height="3.5" rx="0.8" fill="#fbbf24" />
            <rect x="24.5" y="12" width="3.5" height="3.5" rx="0.8" fill="#10b981" />
            <rect x="19.5" y="17" width="3.5" height="3.5" rx="0.8" fill="#a855f7" />
            <rect x="24.5" y="17" width="3.5" height="3.5" rx="0.8" fill="#06b6d4" />
            <circle cx="24" cy="31" r="1" fill="#93c5fd" />
          </svg>
        </div>
      ),
    },
    {
      id: "learn-programming",
      title: "Learn Programming",
      description: "Start from the fundamentals.",
      icon: (
        <div className="w-16 h-12 relative flex items-center justify-center">
          <svg viewBox="0 0 48 36" className="w-full h-full pixelated">
            <rect x="8" y="4" width="32" height="28" rx="4" fill="#1e1b4b" stroke="#4338ca" strokeWidth="1.5" />
            <rect x="10" y="6" width="28" height="6" fill="#312e81" />
            <circle cx="13" cy="9" r="1" fill="#f87171" />
            <circle cx="16" cy="9" r="1" fill="#fbbf24" />
            <circle cx="19" cy="9" r="1" fill="#4ade80" />
            <text x="13" y="23" fill="#10b981" fontFamily="monospace" fontSize="12" fontWeight="bold">
              &gt;_
            </text>
          </svg>
        </div>
      ),
    },
  ]

  return (
    <div className="relative min-h-screen w-full bg-[#f4f8f0] text-slate-900 flex flex-col justify-between overflow-x-hidden font-sans selection:bg-emerald-500 selection:text-white">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/codequest_onboarding_bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center pixelated"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_center,_rgba(244,248,240,0.78)_0%,_rgba(244,248,240,0.55)_55%,_rgba(244,248,240,0)_100%)] pointer-events-none" />
      </div>

      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="p-1">
          <CodeQuestLogo size="md" showTagline={false} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/80 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <div className="w-6 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="w-6 h-2 rounded-full bg-slate-200" />
              <div className="w-6 h-2 rounded-full bg-slate-200" />
              <div className="w-6 h-2 rounded-full bg-slate-200" />
            </div>
            <span className="text-xs font-bold text-slate-600 ml-1">
              Step 1 of 4
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center mb-2">
          What’s Your Coding Quest?
        </h1>

        <p className="text-slate-600 text-center max-w-2xl text-sm sm:text-base md:text-lg mb-8 font-medium">
          Tell us what you want to build. We&apos;ll create a learning adventure around you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full max-w-4xl mb-6">
          {questOptions.map((quest) => {
            const isSelected = selectedQuests.includes(quest.id)
            return (
              <div
                key={quest.id}
                onClick={() => toggleQuest(quest.id)}
                className={`relative bg-white rounded-3xl p-6 border transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center select-none ${
                  isSelected
                    ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/10 scale-[1.02]"
                    : "border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full text-white flex items-center justify-center shadow-sm text-xs font-black">
                    ✓
                  </div>
                )}

                <div className="mb-3 flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  {quest.icon}
                </div>

                <h3 className="font-extrabold text-base text-slate-900 mb-1">
                  {quest.title}
                </h3>

                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">
                  {quest.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <div className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5">
            <span className="text-emerald-500 text-xs">✦</span>
            <span>You can choose more than one.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleContinue}
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm tracking-wide px-8 py-3.5 rounded-2xl shadow-[0_6px_20px_rgba(5,150,105,0.3)] hover:shadow-[0_8px_25px_rgba(5,150,105,0.4)] active:translate-y-0.5 active:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <span>Continue</span>
              <span className="text-base">→</span>
            </button>

            <button
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2 text-sm transition-colors cursor-pointer hover:underline"
            >
              Skip for now
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-6xl mx-auto py-3 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CodeQuest. All rights reserved. Step 1 of your journey.
      </footer>
    </div>
  )
}
