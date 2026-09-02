import * as React from "react"
import { CodeQuestLogo } from "../brand/CodeQuestLogo"

interface ExperienceTier {
  id: string
  title: string
  description: string
  filledDots: number
  totalDots: number
  characterIllustration: React.ReactNode
}

export function CodeQuestOnboardingStep2({
  onBack,
  onContinue,
}: {
  onBack?: () => void
  onContinue?: () => void
}) {
  const [selectedTier, setSelectedTier] = React.useState<string>("newbie")

  const experienceTiers: ExperienceTier[] = [
    {
      id: "newbie",
      title: "Code Newbie",
      description: "I've never written code before.",
      filledDots: 1,
      totalDots: 5,
      characterIllustration: (
        <div className="w-20 h-20 relative flex items-center justify-center shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full pixelated">
            <rect x="22" y="8" width="20" height="8" rx="2" fill="#78350f" />
            <polygon points="18,16 26,10 38,10 46,16 48,22 44,24 20,24 16,22" fill="#92400e" />
            <rect x="22" y="16" width="20" height="14" rx="2" fill="#fed7aa" />
            <rect x="26" y="20" width="3" height="4" rx="1" fill="#1e1b4b" />
            <rect x="35" y="20" width="3" height="4" rx="1" fill="#1e1b4b" />
            <path d="M29 25 Q32 27 35 25" stroke="#7c2d12" strokeWidth="1.5" fill="none" />
            <rect x="20" y="28" width="24" height="24" rx="4" fill="#7c3aed" />
            <rect x="24" y="28" width="16" height="24" fill="#6d28d9" />
            <rect x="14" y="28" width="8" height="20" rx="3" fill="#854d0e" />
            <rect x="14" y="34" width="8" height="3" fill="#a16207" />
            <rect x="32" y="34" width="18" height="15" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="36" y="44" fill="#10b981" fontFamily="monospace" fontSize="8" fontWeight="bold">&gt;_</text>
            <circle cx="33" cy="42" r="2.5" fill="#fed7aa" />
            <circle cx="49" cy="42" r="2.5" fill="#fed7aa" />
          </svg>
        </div>
      ),
    },
    {
      id: "explorer",
      title: "Curious Explorer",
      description: "I've tried coding a little.",
      filledDots: 2,
      totalDots: 5,
      characterIllustration: (
        <div className="w-20 h-20 relative flex items-center justify-center shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full pixelated">
            <rect x="22" y="8" width="20" height="8" rx="2" fill="#78350f" />
            <polygon points="18,16 26,10 38,10 46,16 48,22 44,24 20,24 16,22" fill="#92400e" />
            <rect x="22" y="16" width="20" height="14" rx="2" fill="#fed7aa" />
            <rect x="26" y="20" width="3" height="4" rx="1" fill="#1e1b4b" />
            <rect x="35" y="20" width="3" height="4" rx="1" fill="#1e1b4b" />
            <path d="M29 25 Q32 27 35 25" stroke="#7c2d12" strokeWidth="1.5" fill="none" />
            <rect x="20" y="28" width="24" height="24" rx="4" fill="#7c3aed" />
            <rect x="14" y="28" width="8" height="20" rx="3" fill="#854d0e" />
            <polygon points="26,35 38,37 38,50 26,48" fill="#a855f7" stroke="#6b21a8" strokeWidth="1" />
            <polygon points="38,37 50,35 50,48 38,50" fill="#c084fc" stroke="#6b21a8" strokeWidth="1" />
            <text x="29" y="44" fill="#fef08a" fontSize="6" fontWeight="bold">&lt;/&gt;</text>
            <text x="41" y="44" fill="#fef08a" fontSize="6" fontWeight="bold">&#123;&#125;</text>
            <circle cx="26" cy="44" r="2.5" fill="#fed7aa" />
            <circle cx="50" cy="44" r="2.5" fill="#fed7aa" />
          </svg>
        </div>
      ),
    },
    {
      id: "junior",
      title: "Junior Adventurer",
      description: "I can build basic projects.",
      filledDots: 3,
      totalDots: 5,
      characterIllustration: (
        <div className="w-20 h-20 relative flex items-center justify-center shrink-0">
          <div className="absolute top-0 right-1 z-10 bg-[#4338ca] border border-[#818cf8] text-white font-pixel text-[6.5px] px-1 py-0.5 rounded shadow-sm">
            LVL 03
          </div>
          <svg viewBox="0 0 64 64" className="w-full h-full pixelated">
            <rect x="22" y="8" width="20" height="8" rx="2" fill="#78350f" />
            <polygon points="18,16 26,10 38,10 46,16 48,22 44,24 20,24 16,22" fill="#92400e" />
            <rect x="22" y="16" width="20" height="14" rx="2" fill="#fed7aa" />
            <rect x="26" y="20" width="3" height="4" rx="1" fill="#1e1b4b" />
            <rect x="35" y="20" width="3" height="4" rx="1" fill="#1e1b4b" />
            <path d="M29 25 Q32 27 35 25" stroke="#7c2d12" strokeWidth="1.5" fill="none" />
            <rect x="20" y="28" width="24" height="24" rx="4" fill="#7c3aed" />
            <rect x="14" y="28" width="8" height="20" rx="3" fill="#854d0e" />
            <polygon points="30,36 52,36 50,48 28,48" fill="#334155" stroke="#1e293b" strokeWidth="1" />
            <rect x="32" y="38" width="16" height="7" rx="1" fill="#0f172a" />
            <text x="35" y="44" fill="#38bdf8" fontSize="6" fontWeight="bold">&lt;/&gt;</text>
            <polygon points="26,48 54,48 56,52 24,52" fill="#64748b" />
            <circle cx="34" cy="50" r="2.5" fill="#fed7aa" />
            <circle cx="46" cy="50" r="2.5" fill="#fed7aa" />
          </svg>
        </div>
      ),
    },
    {
      id: "experienced",
      title: "Experienced Developer",
      description: "I'm comfortable writing code.",
      filledDots: 4,
      totalDots: 5,
      characterIllustration: (
        <div className="w-20 h-20 relative flex items-center justify-center shrink-0">
          <div className="absolute top-1 right-1 flex flex-col gap-1 z-10">
            <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center text-[8px] text-amber-900 shadow-sm">
              ⭐
            </div>
            <div className="bg-[#581c87] border border-[#a855f7] text-[#e9d5ff] font-pixel text-[5.5px] px-1 py-0.5 rounded text-center">
              &lt;/&gt;
            </div>
            <div className="w-4 h-4 rounded-md bg-blue-500 border border-blue-300 flex items-center justify-center text-[8px] text-white shadow-sm">
              🏆
            </div>
          </div>

          <svg viewBox="0 0 64 64" className="w-full h-full pixelated">
            <rect x="20" y="8" width="22" height="8" rx="2" fill="#78350f" />
            <polygon points="16,16 24,10 38,10 46,16 48,22 44,24 18,24 14,22" fill="#92400e" />
            <rect x="20" y="16" width="22" height="14" rx="2" fill="#fed7aa" />
            <rect x="25" y="20" width="3" height="4" rx="1" fill="#1e1b4b" />
            <rect x="34" y="20" width="3" height="4" rx="1" fill="#1e1b4b" />
            <path d="M27 25 Q31 28 35 25" stroke="#7c2d12" strokeWidth="1.8" fill="none" />
            <rect x="18" y="28" width="26" height="24" rx="4" fill="#7c3aed" />
            <rect x="26" y="28" width="10" height="24" fill="#3b82f6" />
            <circle cx="16" cy="40" r="3" fill="#fed7aa" />
            <circle cx="46" cy="40" r="3" fill="#fed7aa" />
            <rect x="12" y="32" width="6" height="16" rx="2" fill="#854d0e" />
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
              <div className="w-6 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="w-6 h-2 rounded-full bg-slate-200" />
              <div className="w-6 h-2 rounded-full bg-slate-200" />
            </div>
            <span className="text-xs font-bold text-slate-600 ml-1">
              Step 2 of 4
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[10.5px] uppercase tracking-[0.2em] mb-1">
          <span>✦</span>
          <span>YOUR STARTING POINT</span>
          <span>✦</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center mb-2">
          Where Are You on Your Coding Journey?
        </h1>

        <p className="text-slate-600 text-center max-w-2xl text-sm sm:text-base md:text-lg mb-8 font-medium">
          There&apos;s no wrong answer. We&apos;ll adjust your adventure to your level.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-4xl mb-6">
          {experienceTiers.map((tier) => {
            const isSelected = selectedTier === tier.id
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative bg-white rounded-3xl p-6 border transition-all duration-200 cursor-pointer flex items-center gap-5 select-none ${
                  isSelected
                    ? "border-2 border-emerald-500 bg-white shadow-md ring-2 ring-emerald-500/10 scale-[1.01]"
                    : "border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full text-white flex items-center justify-center shadow-sm text-xs font-black">
                    ✓
                  </div>
                )}

                {tier.characterIllustration}

                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-extrabold text-lg text-slate-900 mb-0.5">
                    {tier.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    {tier.description}
                  </p>

                  <div className="flex flex-col gap-1">
                    <span className="font-pixel text-[7.5px] text-slate-500 uppercase tracking-wider font-bold">
                      STARTING XP
                    </span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: tier.totalDots }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                            i < tier.filledDots
                              ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-xs sm:text-sm text-slate-600 text-center mb-6 font-medium">
          <span className="font-bold text-slate-700">Not sure?</span> Choose Curious Explorer — we&apos;ll figure it out together.
        </div>

        <div className="w-full max-w-4xl flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-2xl transition-all shadow-sm active:translate-y-0.5 cursor-pointer text-sm flex items-center gap-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <button
            onClick={onContinue}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm tracking-wide px-8 py-3 rounded-2xl shadow-[0_6px_20px_rgba(5,150,105,0.3)] hover:shadow-[0_8px_25px_rgba(5,150,105,0.4)] active:translate-y-0.5 active:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <span>Continue</span>
            <span className="text-base">→</span>
          </button>
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-6xl mx-auto py-3 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CodeQuest. All rights reserved. Step 2 of your journey.
      </footer>
    </div>
  )
}
