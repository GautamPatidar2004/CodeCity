import * as React from "react"
import { CodeQuestLogo } from "../brand/CodeQuestLogo"

interface LanguageOption {
  id: string
  name: string
  icon: React.ReactNode
}

interface GoalOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  tag: string
}

export function CodeQuestOnboardingStep3({
  onBack,
  onContinue,
}: {
  onBack?: () => void
  onContinue?: () => void
}) {
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>([
    "Python",
    "React",
  ])
  const [selectedGoal, setSelectedGoal] = React.useState<string>("website")
  const [selectedTime, setSelectedTime] = React.useState<string>("15 min / day")

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang)
        ? prev.length > 1
          ? prev.filter((item) => item !== lang)
          : prev
        : [...prev, lang]
    )
  }

  const languages: LanguageOption[] = [
    {
      id: "Python",
      name: "Python",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
          <path
            d="M11.9 2C6.8 2 7.1 4.2 7.1 4.2l.01 2.3h4.9v.7H5.2S2 6.8 2 12c0 5.1 2.8 5 2.8 5h1.7v-2.4s-.1-2.8 2.8-2.8h4.8s2.7.1 2.7-2.6V4.7S17 2 11.9 2zm-1.4 1.4c.5 0 .9.4.9.9 0 .5-.4.9-.9.9s-.9-.4-.9-.9c0-.5.4-.9.9-.9z"
            fill="#38bdf8"
          />
          <path
            d="M12.1 22c5.1 0 4.8-2.2 4.8-2.2l-.01-2.3H12v-.7h6.8s3.2.4 3.2-4.8c0-5.1-2.8-5-2.8-5h-1.7v2.4s.1 2.8-2.8 2.8H9.9s-2.7-.1-2.7 2.6v4.5S7 22 12.1 22zm1.4-1.4c-.5 0-.9-.4-.9-.9 0-.5.4-.9.9-.9s.9.4.9.9c0 .5-.4.9-.9.9z"
            fill="#fbbf24"
          />
        </svg>
      ),
    },
    {
      id: "JavaScript",
      name: "JavaScript",
      icon: (
        <div className="w-5 h-5 rounded bg-[#fcd34d] border border-[#b45309] flex items-center justify-center font-pixel text-[8px] font-black text-black shrink-0">
          JS
        </div>
      ),
    },
    {
      id: "HTML",
      name: "HTML",
      icon: (
        <div className="w-5 h-5 rounded bg-[#f97316] border border-[#c2410c] flex items-center justify-center font-pixel text-[7px] font-black text-white shrink-0">
          5
        </div>
      ),
    },
    {
      id: "CSS",
      name: "CSS",
      icon: (
        <div className="w-5 h-5 rounded bg-[#3b82f6] border border-[#1d4ed8] flex items-center justify-center font-pixel text-[7px] font-black text-white shrink-0">
          3
        </div>
      ),
    },
    {
      id: "SQL",
      name: "SQL",
      icon: (
        <div className="w-5 h-5 rounded bg-[#8b5cf6] border border-[#6d28d9] flex items-center justify-center font-pixel text-[6.5px] font-black text-white shrink-0">
          SQL
        </div>
      ),
    },
    {
      id: "Java",
      name: "Java",
      icon: (
        <div className="w-5 h-5 rounded bg-[#ef4444] border border-[#b91c1c] flex items-center justify-center text-[10px] shrink-0">
          ☕
        </div>
      ),
    },
    {
      id: "C++",
      name: "C++",
      icon: (
        <div className="w-5 h-5 rounded bg-[#0284c7] border border-[#0369a1] flex items-center justify-center font-pixel text-[6.5px] font-black text-white shrink-0">
          C++
        </div>
      ),
    },
    {
      id: "React",
      name: "React",
      icon: (
        <div className="w-5 h-5 rounded bg-[#082f49] border border-[#38bdf8] flex items-center justify-center text-[#38bdf8] text-[10px] shrink-0">
          ⚛
        </div>
      ),
    },
  ]

  const goals: GoalOption[] = [
    {
      id: "website",
      title: "Build My First Website",
      description: "Create and publish websites.",
      tag: "🌐 Website",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-300 flex items-center justify-center text-sm shrink-0">
          🖥️
        </div>
      ),
    },
    {
      id: "game",
      title: "Create a Game",
      description: "Build interactive games.",
      tag: "🎮 Game",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center text-sm shrink-0">
          👾
        </div>
      ),
    },
    {
      id: "job",
      title: "Get Job Ready",
      description: "Build skills for a career.",
      tag: "💼 Career",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-sm shrink-0">
          💼
        </div>
      ),
    },
    {
      id: "ai",
      title: "Build AI Projects",
      description: "Create intelligent tools.",
      tag: "🤖 AI",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-cyan-100 border border-cyan-300 flex items-center justify-center text-sm shrink-0">
          🧠
        </div>
      ),
    },
    {
      id: "automation",
      title: "Automate Tasks",
      description: "Save time with code.",
      tag: "⚙ Scripts",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-sm shrink-0">
          ⚙️
        </div>
      ),
    },
    {
      id: "explore",
      title: "Explore Programming",
      description: "Learn and build anything.",
      tag: "🚀 Explore",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center text-sm shrink-0">
          🚀
        </div>
      ),
    },
  ]

  const timeOptions = ["15 min / day", "30 min / day", "1 hour+ / day"]
  const activeGoal = goals.find((g) => g.id === selectedGoal) || goals[0]
  const primaryLang = selectedLanguages[0] || "Python"

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
              <div className="w-6 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="w-6 h-2 rounded-full bg-slate-200" />
            </div>
            <span className="text-xs font-bold text-slate-600 ml-1">
              Step 3 of 4
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center mb-2">
          What Do You Want to Learn?
        </h1>

        <p className="text-slate-600 text-center max-w-2xl text-sm sm:text-base md:text-lg mb-6 font-medium">
          Choose the skills you want to unlock first.
        </p>

        <div className="w-full max-w-4xl flex flex-col gap-6 mb-6">
          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-3 text-base sm:text-lg">
              <span>📖</span>
              <span>Pick your coding languages</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {languages.map((lang) => {
                const isSelected = selectedLanguages.includes(lang.id)
                return (
                  <div
                    key={lang.id}
                    onClick={() => toggleLanguage(lang.id)}
                    className={`relative bg-white rounded-2xl px-4 py-3 border transition-all duration-200 cursor-pointer flex items-center gap-3 select-none ${
                      isSelected
                        ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-sm ring-2 ring-emerald-500/10 scale-[1.01]"
                        : "border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full text-white flex items-center justify-center shadow-sm text-[9px] font-black">
                        ✓
                      </div>
                    )}
                    {lang.icon}
                    <span className="font-bold text-sm text-slate-800">
                      {lang.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-3 text-base sm:text-lg">
              <span>🎯</span>
              <span>What’s your main goal?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {goals.map((goal) => {
                const isSelected = selectedGoal === goal.id
                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`relative bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex items-center gap-3.5 select-none ${
                      isSelected
                        ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-sm ring-2 ring-emerald-500/10 scale-[1.01]"
                        : "border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-emerald-500 rounded-full text-white flex items-center justify-center shadow-sm text-[9px] font-black">
                        ✓
                      </div>
                    )}
                    {goal.icon}
                    <div className="flex flex-col">
                      <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {goal.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-3 text-base sm:text-lg">
              <span>⏰</span>
              <span>How much time can you spend?</span>
            </h2>

            <div className="flex flex-wrap gap-3">
              {timeOptions.map((time) => {
                const isSelected = selectedTime === time
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-2 border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-sm ring-2 ring-emerald-500/10"
                        : "border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>⏱</span>
                    <span>{time}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200/90 shadow-sm grid grid-cols-1 md:grid-cols-12 items-center gap-6 backdrop-blur-sm">
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🚩</span>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Your Adventure
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
                <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
                  <span>🐍</span>
                  <span>{primaryLang}</span>
                </span>
                <span className="text-slate-400 font-black">+</span>
                <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
                  <span>⏱</span>
                  <span>{selectedTime}</span>
                </span>
                <span className="text-slate-400 font-black">+</span>
                <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
                  <span>🎓</span>
                  <span>Beginner</span>
                </span>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm mt-3.5 font-medium">
                ≈ 6–8 weeks to complete your first quest path
              </p>
            </div>

            <div className="md:col-span-5 flex items-center justify-center relative">
              <div className="flex flex-col items-center gap-1.5 z-10 w-full max-w-[200px]">
                <div className="bg-emerald-600 text-white font-pixel text-[8px] font-bold px-3 py-1 rounded-md shadow-sm">
                  START
                </div>
                <span className="text-[9px] text-emerald-600 font-black">↓</span>

                <div className="bg-[#854d0e] border border-[#713f12] text-[#fef08a] font-pixel text-[7.5px] font-bold px-3 py-1 rounded-md shadow-sm w-full text-center flex items-center justify-center gap-1">
                  <span>🐍</span>
                  <span>{primaryLang}</span>
                </div>
                <span className="text-[9px] text-amber-700 font-black">↓</span>

                <div className="bg-[#854d0e] border border-[#713f12] text-[#fef08a] font-pixel text-[7.5px] font-bold px-3 py-1 rounded-md shadow-sm w-full text-center flex items-center justify-center gap-1">
                  <span>📁</span>
                  <span>Projects</span>
                </div>
                <span className="text-[9px] text-purple-700 font-black">↓</span>

                <div className="bg-[#6b21a8] border border-[#581c87] text-[#f5d0fe] font-pixel text-[7.5px] font-bold px-3 py-1 rounded-md shadow-sm w-full text-center flex items-center justify-center gap-1">
                  <span>{activeGoal.tag}</span>
                </div>
                <span className="text-[9px] text-amber-500 font-black">↓</span>

                <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 font-pixel text-[8px] font-black px-4 py-1.5 rounded-lg shadow-md border border-amber-500 flex items-center gap-1">
                  <span>⭐</span>
                  <span>LEVEL UP</span>
                </div>
              </div>
            </div>
          </div>
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
        &copy; {new Date().getFullYear()} CodeQuest. All rights reserved. Step 3 of your journey.
      </footer>
    </div>
  )
}
