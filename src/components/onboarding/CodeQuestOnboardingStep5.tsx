import * as React from "react"
import { Flame, Trophy, X, CheckCircle2 } from "lucide-react"
import { CodeQuestLogo } from "../brand/CodeQuestLogo"

export function CodeQuestOnboardingStep5({
  onBack,
  onFinish,
  language = "Python",
  skillTier = "Beginner",
  dailyPace = "30 min/day",
}: {
  onBack?: () => void
  onFinish?: () => void
  language?: string
  skillTier?: string
  dailyPace?: string
}) {
  const [showRoadmapModal, setShowRoadmapModal] = React.useState(false)

  return (
    <div className="relative min-h-screen w-full bg-[#f4f8f0] text-slate-900 flex flex-col justify-between overflow-x-hidden font-sans selection:bg-emerald-500 selection:text-white">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/codequest_portal_bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center pixelated"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_center,_rgba(244,248,240,0.78)_0%,_rgba(244,248,240,0.55)_55%,_rgba(244,248,240,0)_100%)] pointer-events-none" />
      </div>

      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="p-1">
          <CodeQuestLogo size="md" showTagline={false} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/80 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <div className="w-6 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="w-6 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="w-6 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="w-6 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <span className="text-xs font-bold text-slate-600 ml-1">
              Step 4 of 4
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col items-center">
        <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[10.5px] uppercase tracking-[0.2em] mb-1">
          <span>✨</span>
          <span>YOUR ADVENTURE BEGINS</span>
          <span>✨</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center mb-1.5">
          You’re Ready to Code.
        </h1>

        <p className="text-slate-600 text-center max-w-2xl text-sm sm:text-base md:text-lg mb-8 font-medium">
          We’ve built your starting quest. Your first level starts now.
        </p>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          <div className="lg:col-span-5 relative w-full h-[580px] lg:h-[640px] rounded-3xl overflow-hidden shadow-xl border-4 border-slate-900/10 bg-slate-900 select-none group">
            <img
              src="/codequest_portal_bg.jpg"
              alt="CodeQuest Portal Scene"
              className="w-full h-full object-cover object-center pixelated"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15 pointer-events-none" />

            <div className="absolute top-6 right-6 z-20 flex flex-col items-end animate-float-slow">
              <div className="relative mb-2 bg-white/95 border-2 border-slate-300 rounded-2xl px-3.5 py-2 shadow-md backdrop-blur-sm text-center">
                <p className="font-pixel text-[8px] text-slate-800 leading-tight font-bold">
                  Ready when you are.
                </p>
                <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white/95 border-b-2 border-r-2 border-slate-300 rotate-45" />
              </div>

              <div className="w-12 h-12 relative filter drop-shadow-md">
                <svg viewBox="0 0 48 48" className="w-full h-full pixelated">
                  <rect x="12" y="6" width="24" height="26" rx="6" fill="#10b981" />
                  <rect x="8" y="14" width="32" height="18" rx="4" fill="#059669" />
                  <rect x="14" y="12" width="20" height="14" rx="3" fill="#0f172a" />
                  <rect x="17" y="16" width="4" height="6" rx="1" fill="#38bdf8" />
                  <rect x="27" y="16" width="4" height="6" rx="1" fill="#38bdf8" />
                  <rect x="6" y="16" width="4" height="8" rx="1" fill="#f59e0b" />
                  <rect x="38" y="16" width="4" height="8" rx="1" fill="#f59e0b" />
                </svg>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10 pt-16">
              <svg
                viewBox="0 0 120 180"
                className="w-48 h-72 md:w-56 md:h-80 filter drop-shadow-2xl select-none animate-float pixelated"
              >
                <rect x="22" y="58" width="18" height="42" rx="4" fill="#854d0e" />
                <rect x="20" y="66" width="22" height="6" fill="#a16207" />

                <rect x="42" y="112" width="16" height="42" rx="2" fill="#1e293b" />
                <rect x="62" y="112" width="16" height="42" rx="2" fill="#1e293b" />

                <rect x="38" y="152" width="20" height="12" rx="3" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
                <rect x="62" y="152" width="20" height="12" rx="3" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
                <rect x="38" y="158" width="20" height="4" fill="#475569" />
                <rect x="62" y="158" width="20" height="4" fill="#475569" />

                <rect x="34" y="54" width="52" height="62" rx="8" fill="#8b5cf6" />
                <rect x="52" y="58" width="16" height="58" fill="#ffffff" opacity="0.9" />
                <rect x="58" y="60" width="4" height="56" fill="#cbd5e1" />
                <rect x="46" y="64" width="3" height="16" rx="1.5" fill="#f8fafc" />
                <rect x="71" y="64" width="3" height="16" rx="1.5" fill="#f8fafc" />

                <rect x="24" y="58" width="12" height="44" rx="4" fill="#8b5cf6" />
                <circle cx="30" cy="104" r="5" fill="#fed7aa" />
                <rect x="84" y="58" width="12" height="44" rx="4" fill="#8b5cf6" />
                <circle cx="90" cy="104" r="5" fill="#fed7aa" />

                <rect x="52" y="46" width="16" height="12" fill="#fed7aa" />
                <rect x="38" y="20" width="44" height="32" rx="6" fill="#fed7aa" />
                <rect x="47" y="28" width="6" height="8" rx="2" fill="#0f172a" />
                <rect x="67" y="28" width="6" height="8" rx="2" fill="#0f172a" />
                <circle cx="49" cy="30" r="1.5" fill="#ffffff" />
                <circle cx="69" cy="30" r="1.5" fill="#ffffff" />
                <ellipse cx="44" cy="37" rx="3" ry="1.5" fill="#f87171" opacity="0.4" />
                <ellipse cx="76" cy="37" rx="3" ry="1.5" fill="#f87171" opacity="0.4" />
                <path d="M54 38 Q60 43 66 38" stroke="#7c2d12" strokeWidth="2" fill="none" />

                <polygon points="32,24 40,6 60,8 80,6 88,24 94,14 84,2 58,2 34,2 26,14" fill="#78350f" />
                <polygon points="30,22 46,12 56,18 64,12 74,18 86,22 84,10 60,6 36,10" fill="#78350f" />
              </svg>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-400 shadow-xl relative">
              <div className="absolute top-5 right-5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-pixel text-[8px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-2xs">
                <span>🚩</span>
                <span>First Quest</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      d="M11.9 2C6.8 2 7.1 4.2 7.1 4.2l.01 2.3h4.9v.7H5.2S2 6.8 2 12c0 5.1 2.8 5 2.8 5h1.7v-2.4s-.1-2.8 2.8-2.8h4.8s2.7.1 2.7-2.6V4.7S17 2 11.9 2zm-1.4 1.4c.5 0 .9.4.9.9 0 .5-.4.9-.9.9s-.9-.4-.9-.9c0-.5.4-.9.9-.9z"
                      fill="#38bdf8"
                    />
                    <path
                      d="M12.1 22c5.1 0 4.8-2.2 4.8-2.2l-.01-2.3H12v-.7h6.8s3.2.4 3.2-4.8c0-5.1-2.8-5-2.8-5h-1.7v2.4s.1 2.8-2.8 2.8H9.9s-2.7-.1-2.7 2.6v4.5S7 22 12.1 22zm1.4-1.4c-.5 0-.9-.4-.9-.9 0-.5.4-.9.9-.9s.9.4.9.9c0 .5-.4.9-.9.9z"
                      fill="#fbbf24"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {language} Fundamentals
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>📶</span>
                      <span>{skillTier}</span>
                    </span>
                    <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>⏱</span>
                      <span>{dailyPace}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-5 bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 items-center">
                <div className="sm:col-span-7 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-900 border border-indigo-700 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs shrink-0 shadow-xs">
                    &gt;_
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      First Quest:
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 font-mono">
                      &quot;Hello, World!&quot;
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-5 bg-white/90 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-center gap-2 shadow-2xs">
                  <span className="text-amber-400 text-lg">⭐</span>
                  <div className="text-xs font-bold text-slate-700">
                    Reward:{" "}
                    <span className="text-emerald-600 font-extrabold">
                      +50 XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2.5 flex items-center gap-2">
                <span>📊</span>
                <span>Starting Stats</span>
              </h3>

              <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm grid grid-cols-3 divide-x divide-slate-100 items-center">
                <div className="flex items-center gap-3 px-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-base shrink-0">
                    🧑‍💻
                  </div>
                  <div className="flex flex-col">
                    <span className="font-pixel text-[8.5px] font-bold text-slate-900">
                      LEVEL 01
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-pixel text-[7px] text-slate-500">0 XP</span>
                      <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 px-3">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
                  <span className="font-bold text-sm text-slate-800">
                    0 Day Streak
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 px-3">
                  <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="font-bold text-sm text-slate-800">
                    0 Badges
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-base mb-2.5 flex items-center gap-2">
                <span>🗺️</span>
                <span>Your Path</span>
              </h3>

              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 select-none">
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-lg shadow-2xs">
                      📘
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">
                      {language}
                    </span>
                  </div>

                  <span className="text-slate-300 font-bold text-sm">➔</span>

                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-lg shadow-2xs">
                      💻
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">
                      Build
                    </span>
                  </div>

                  <span className="text-slate-300 font-bold text-sm">➔</span>

                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-lg shadow-2xs">
                      🔮
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">
                      AI
                    </span>
                  </div>

                  <span className="text-slate-300 font-bold text-sm">➔</span>

                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg shadow-2xs">
                      ⭐
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">
                      Level Up
                    </span>
                  </div>

                  <span className="text-slate-300 font-bold text-sm">➔</span>

                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-lg shadow-2xs">
                      🚩
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">
                      Master
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 rounded-full mt-2" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <button
            onClick={onBack}
            className="w-full sm:w-auto border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3.5 rounded-2xl transition-all shadow-sm active:translate-y-0.5 cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setShowRoadmapModal(true)}
              className="w-full sm:w-auto border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3.5 rounded-2xl transition-all shadow-sm active:translate-y-0.5 cursor-pointer text-sm"
            >
              Review My Path
            </button>

            <button
              onClick={onFinish}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-base tracking-wide px-8 py-3.5 rounded-2xl shadow-[0_6px_25px_rgba(5,150,105,0.4)] hover:shadow-[0_8px_30px_rgba(5,150,105,0.5)] active:translate-y-0.5 active:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter My Dashboard</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </main>

      {showRoadmapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <h3 className="font-extrabold text-xl text-slate-900">
                  Your Full Quest Roadmap
                </h3>
              </div>
              <button
                onClick={() => setShowRoadmapModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Chapter 1: {language} Basics &amp; Logic
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Master variables, functions, conditions, and write your first interactive program.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Chapter 2: Interactive Projects
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Build real-world apps, mini games, and connect user inputs with dynamic state.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Chapter 3: Advanced Tools &amp; AI Integration
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Connect APIs, work with datasets, and deploy your developer creations online.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRoadmapModal(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Close &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-10 w-full max-w-7xl mx-auto py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CodeQuest. All rights reserved. Your coding journey begins now.
      </footer>
    </div>
  )
}
