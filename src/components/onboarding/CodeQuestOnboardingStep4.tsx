import * as React from "react"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import { CodeQuestLogo } from "../brand/CodeQuestLogo"

export interface CharacterConfig {
  presetId: string
  hairStyle: string
  hairColor: string
  skinTone: string
  outfit: string
  color: string
  accessory: string
}

export function CodeQuestOnboardingStep4({
  onBack,
  onFinish,
}: {
  onBack?: () => void
  onFinish?: () => void
}) {
  const [config, setConfig] = React.useState<CharacterConfig>({
    presetId: "preset-1",
    hairStyle: "brown-spiky",
    hairColor: "#78350f",
    skinTone: "#fed7aa",
    outfit: "Developer Hoodie",
    color: "#8b5cf6",
    accessory: "Backpack",
  })

  const presets = [
    {
      id: "preset-1",
      hairStyle: "brown-spiky",
      hairColor: "#78350f",
      skinTone: "#fed7aa",
      outfit: "Developer Hoodie",
      color: "#8b5cf6",
      accessory: "Backpack",
    },
    {
      id: "preset-2",
      hairStyle: "dark-crop",
      hairColor: "#1e1b4b",
      skinTone: "#b45309",
      outfit: "Coder Jacket",
      color: "#3b82f6",
      accessory: "Coding Goggles",
    },
    {
      id: "preset-3",
      hairStyle: "pink-waves",
      hairColor: "#f43f5e",
      skinTone: "#fed7aa",
      outfit: "Explorer Jacket",
      color: "#1e293b",
      accessory: "Backpack",
    },
    {
      id: "preset-4",
      hairStyle: "blue-tousled",
      hairColor: "#3b82f6",
      skinTone: "#fed7aa",
      outfit: "Coder Jacket",
      color: "#2563eb",
      accessory: "Headphones",
    },
    {
      id: "preset-5",
      hairStyle: "bun",
      hairColor: "#582e0a",
      skinTone: "#fdba74",
      outfit: "Builder Outfit",
      color: "#10b981",
      accessory: "Backpack",
    },
    {
      id: "preset-6",
      hairStyle: "purple-crop",
      hairColor: "#a855f7",
      skinTone: "#fed7aa",
      outfit: "Developer Hoodie",
      color: "#3b82f6",
      accessory: "Mini Laptop",
    },
  ]

  const hairStyles = [
    { id: "brown-spiky", name: "Brown Spiky", color: "#78350f" },
    { id: "dark-crop", name: "Dark Crop", color: "#1e1b4b" },
    { id: "pink-waves", name: "Pink Waves", color: "#f43f5e" },
    { id: "blue-tousled", name: "Blue Tousled", color: "#3b82f6" },
    { id: "bun", name: "Bun", color: "#582e0a" },
    { id: "white-spiky", name: "White Spiky", color: "#e2e8f0" },
  ]

  const skinTones = [
    { id: "light", color: "#fed7aa", label: "Light" },
    { id: "med-light", color: "#fdba74", label: "Medium-Light" },
    { id: "tan", color: "#b45309", label: "Tan" },
    { id: "deep", color: "#78350f", label: "Deep Brown" },
  ]

  const outfits = [
    {
      id: "Developer Hoodie",
      name: "Developer Hoodie",
      icon: (
        <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-white text-xs">
          🧥
        </div>
      ),
    },
    {
      id: "Explorer Jacket",
      name: "Explorer Jacket",
      icon: (
        <div className="w-6 h-6 rounded bg-emerald-700 flex items-center justify-center text-white text-xs">
          🦺
        </div>
      ),
    },
    {
      id: "Coder Jacket",
      name: "Coder Jacket",
      icon: (
        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs">
          🥼
        </div>
      ),
    },
    {
      id: "Builder Outfit",
      name: "Builder Outfit",
      icon: (
        <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center text-white text-xs">
          👔
        </div>
      ),
    },
  ]

  const colors = [
    { id: "#10b981", name: "Green", bgClass: "bg-[#10b981]" },
    { id: "#8b5cf6", name: "Purple", bgClass: "bg-[#8b5cf6]" },
    { id: "#f97316", name: "Orange", bgClass: "bg-[#f97316]" },
    { id: "#f59e0b", name: "Yellow", bgClass: "bg-[#f59e0b]" },
    { id: "#3b82f6", name: "Blue", bgClass: "bg-[#3b82f6]" },
  ]

  const accessories = [
    {
      id: "Backpack",
      name: "Backpack",
      icon: <span className="text-base">🎒</span>,
    },
    {
      id: "Headphones",
      name: "Headphones",
      icon: <span className="text-base">🎧</span>,
    },
    {
      id: "Coding Goggles",
      name: "Coding Goggles",
      icon: <span className="text-base">🥽</span>,
    },
    {
      id: "Mini Laptop",
      name: "Mini Laptop",
      icon: <span className="text-base">💻</span>,
    },
  ]

  const applyPreset = (preset: (typeof presets)[0]) => {
    setConfig({
      presetId: preset.id,
      hairStyle: preset.hairStyle,
      hairColor: preset.hairColor,
      skinTone: preset.skinTone,
      outfit: preset.outfit,
      color: preset.color,
      accessory: preset.accessory,
    })
  }

  const renderFullCharacter = () => {
    const isBackpack = config.accessory === "Backpack"
    const isHeadphones = config.accessory === "Headphones"
    const isGoggles = config.accessory === "Coding Goggles"
    const isLaptop = config.accessory === "Mini Laptop"

    return (
      <svg
        viewBox="0 0 120 180"
        className="w-48 h-72 md:w-56 md:h-80 filter drop-shadow-2xl transition-all duration-300 select-none animate-float pixelated"
      >
        {isBackpack && (
          <g>
            <rect x="22" y="58" width="18" height="42" rx="4" fill="#854d0e" />
            <rect x="20" y="66" width="22" height="6" fill="#a16207" />
            <rect x="26" y="80" width="10" height="12" rx="2" fill="#713f12" />
          </g>
        )}

        <rect x="42" y="112" width="16" height="42" rx="2" fill="#1e293b" />
        <rect x="62" y="112" width="16" height="42" rx="2" fill="#1e293b" />
        <rect x="38" y="152" width="20" height="12" rx="3" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
        <rect x="62" y="152" width="20" height="12" rx="3" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
        <rect x="38" y="158" width="20" height="4" fill="#475569" />
        <rect x="62" y="158" width="20" height="4" fill="#475569" />

        <rect x="34" y="54" width="52" height="62" rx="8" fill={config.color} />
        <rect x="52" y="58" width="16" height="58" fill="#ffffff" opacity="0.9" />
        <rect x="58" y="60" width="4" height="56" fill="#cbd5e1" />
        <rect x="46" y="64" width="3" height="16" rx="1.5" fill="#f8fafc" />
        <rect x="71" y="64" width="3" height="16" rx="1.5" fill="#f8fafc" />

        <rect x="24" y="58" width="12" height="44" rx="4" fill={config.color} />
        <circle cx="30" cy="104" r="5" fill={config.skinTone} />
        <rect x="84" y="58" width="12" height="44" rx="4" fill={config.color} />
        <circle cx="90" cy="104" r="5" fill={config.skinTone} />

        {isLaptop && (
          <g>
            <rect x="74" y="90" width="28" height="20" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="77" y="93" width="22" height="12" rx="1" fill="#0f172a" />
            <text x="80" y="102" fill="#38bdf8" fontSize="8" fontWeight="bold">&lt;/&gt;</text>
          </g>
        )}

        <rect x="52" y="46" width="16" height="12" fill={config.skinTone} />
        <rect x="38" y="20" width="44" height="32" rx="6" fill={config.skinTone} />

        <rect x="47" y="28" width="6" height="8" rx="2" fill="#0f172a" />
        <rect x="67" y="28" width="6" height="8" rx="2" fill="#0f172a" />
        <circle cx="49" cy="30" r="1.5" fill="#ffffff" />
        <circle cx="69" cy="30" r="1.5" fill="#ffffff" />
        <ellipse cx="44" cy="37" rx="3" ry="1.5" fill="#f87171" opacity="0.4" />
        <ellipse cx="76" cy="37" rx="3" ry="1.5" fill="#f87171" opacity="0.4" />
        <path d="M54 38 Q60 43 66 38" stroke="#7c2d12" strokeWidth="2" fill="none" />

        {isGoggles && (
          <g>
            <rect x="34" y="24" width="52" height="14" rx="3" fill="#0d9488" stroke="#042f2e" strokeWidth="1.5" />
            <rect x="42" y="26" width="16" height="10" rx="2" fill="#2dd4bf" />
            <rect x="62" y="26" width="16" height="10" rx="2" fill="#2dd4bf" />
          </g>
        )}

        {config.hairStyle === "brown-spiky" && (
          <g fill={config.hairColor}>
            <polygon points="32,24 40,6 60,8 80,6 88,24 94,14 84,2 58,2 34,2 26,14" />
            <polygon points="30,22 46,12 56,18 64,12 74,18 86,22 84,10 60,6 36,10" />
            <polygon points="32,22 36,36 40,24" />
            <polygon points="88,22 84,36 80,24" />
          </g>
        )}

        {config.hairStyle === "dark-crop" && (
          <g fill={config.hairColor}>
            <rect x="34" y="10" width="52" height="18" rx="6" />
            <polygon points="34,22 42,20 50,23 58,19 66,23 74,20 86,22 86,12 34,12" />
          </g>
        )}

        {config.hairStyle === "pink-waves" && (
          <g fill={config.hairColor}>
            <rect x="32" y="8" width="56" height="24" rx="8" />
            <polygon points="30,24 26,44 36,36 44,48 54,26" />
            <polygon points="90,24 94,44 84,36 76,48 66,26" />
          </g>
        )}

        {config.hairStyle === "blue-tousled" && (
          <g fill={config.hairColor}>
            <polygon points="28,26 36,6 50,14 62,4 76,14 88,6 92,26 84,8 60,2 36,8" />
            <polygon points="30,24 40,28 52,22 62,26 74,20 86,26" />
          </g>
        )}

        {config.hairStyle === "bun" && (
          <g fill={config.hairColor}>
            <circle cx="60" cy="8" r="10" />
            <rect x="34" y="14" width="52" height="16" rx="6" />
          </g>
        )}

        {config.hairStyle === "white-spiky" && (
          <g fill={config.hairColor}>
            <polygon points="32,24 40,6 60,8 80,6 88,24 94,14 84,2 58,2 34,2 26,14" />
            <polygon points="30,22 46,12 56,18 64,12 74,18 86,22 84,10 60,6 36,10" />
          </g>
        )}

        {isHeadphones && (
          <g>
            <path d="M34 26 Q60 8 86 26" stroke="#0284c7" strokeWidth="4" fill="none" />
            <rect x="30" y="24" width="8" height="16" rx="3" fill="#0369a1" />
            <rect x="82" y="24" width="8" height="16" rx="3" fill="#0369a1" />
          </g>
        )}
      </svg>
    )
  }

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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-center mb-1.5">
          Create Your Developer
        </h1>

        <p className="text-slate-600 text-center max-w-2xl text-sm sm:text-base md:text-lg mb-8 font-medium">
          This character will travel with you through your coding adventure.
        </p>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-sm">
                🧑‍💻
              </div>
              <h2 className="font-extrabold text-lg text-slate-900">
                Character
              </h2>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2.5">
                Avatar Presets
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {presets.map((preset, idx) => {
                  const isSelected = config.presetId === preset.id
                  return (
                    <div
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`relative bg-slate-50/80 rounded-2xl p-2 border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center select-none ${
                        isSelected
                          ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-sm ring-2 ring-emerald-500/10 scale-105"
                          : "border-slate-200/80 hover:border-slate-300 hover:scale-102"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full text-white flex items-center justify-center text-[7px] font-black">
                          ✓
                        </div>
                      )}
                      <div className="w-10 h-10 flex items-center justify-center text-xl">
                        {idx === 0
                          ? "🧑‍💻"
                          : idx === 1
                          ? "👨🏾‍💻"
                          : idx === 2
                          ? "👩🏻‍🎤"
                          : idx === 3
                          ? "🧑🏻‍🎤"
                          : idx === 4
                          ? "🧕🏼"
                          : "🧙🏼"}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  HAIR
                </h3>
                <div className="flex items-center gap-1.5 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      const currIdx = hairStyles.findIndex((h) => h.id === config.hairStyle)
                      const prevIdx = currIdx > 0 ? currIdx - 1 : hairStyles.length - 1
                      const prevHair = hairStyles[prevIdx]
                      setConfig((prev) => ({
                        ...prev,
                        hairStyle: prevHair.id,
                        hairColor: prevHair.color,
                      }))
                    }}
                    className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex items-center justify-center gap-2 overflow-hidden">
                    {hairStyles.map((h) => {
                      const isSelected = config.hairStyle === h.id
                      return (
                        <div
                          key={h.id}
                          onClick={() =>
                            setConfig((prev) => ({
                              ...prev,
                              hairStyle: h.id,
                              hairColor: h.color,
                            }))
                          }
                          className={`w-7 h-7 rounded-xl flex items-center justify-center cursor-pointer transition-transform ${
                            isSelected
                              ? "border-2 border-emerald-500 bg-white shadow-xs scale-110"
                              : "hover:scale-105 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: h.color }}
                          />
                        </div>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const currIdx = hairStyles.findIndex((h) => h.id === config.hairStyle)
                      const nextIdx = currIdx < hairStyles.length - 1 ? currIdx + 1 : 0
                      const nextHair = hairStyles[nextIdx]
                      setConfig((prev) => ({
                        ...prev,
                        hairStyle: nextHair.id,
                        hairColor: nextHair.color,
                      }))
                    }}
                    className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-500 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  SKIN TONE
                </h3>
                <div className="flex items-center gap-3 p-1.5">
                  {skinTones.map((tone) => {
                    const isSelected = config.skinTone === tone.color
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            skinTone: tone.color,
                          }))
                        }
                        className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                          isSelected
                            ? "ring-3 ring-emerald-500 ring-offset-2 scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: tone.color }}
                        aria-label={tone.label}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              <div className="sm:col-span-8">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  OUTFIT
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {outfits.map((outfit) => {
                    const isSelected = config.outfit === outfit.name
                    return (
                      <div
                        key={outfit.id}
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, outfit: outfit.name }))
                        }
                        className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                          isSelected
                            ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-xs scale-102"
                            : "border-slate-200/90 bg-slate-50/60 hover:border-slate-300"
                        }`}
                      >
                        {outfit.icon}
                        <span className="text-[10px] font-bold text-slate-800 mt-1 leading-tight">
                          {outfit.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="sm:col-span-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  COLOR
                </h3>
                <div className="flex items-center gap-2.5 p-1.5">
                  {colors.map((c) => {
                    const isSelected = config.color === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setConfig((prev) => ({ ...prev, color: c.id }))
                        }
                        className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                          isSelected
                            ? "ring-3 ring-emerald-500 ring-offset-2 scale-110"
                            : "hover:scale-105"
                        } ${c.bgClass}`}
                        aria-label={c.name}
                      />
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                ACCESSORY
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {accessories.map((acc) => {
                  const isSelected = config.accessory === acc.id
                  return (
                    <div
                      key={acc.id}
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, accessory: acc.id }))
                      }
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isSelected
                          ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-xs scale-102"
                          : "border-slate-200/90 bg-slate-50/60 hover:border-slate-300"
                      }`}
                    >
                      {acc.icon}
                      <span className="text-[11px] font-bold text-slate-800 mt-1">
                        {acc.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>You can change your character anytime from your profile.</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative w-full h-[580px] lg:h-[680px] rounded-3xl overflow-hidden shadow-xl border-4 border-slate-900/10 bg-slate-900 select-none">
            <img
              src="/codequest_stage_bg.jpg"
              alt="Live Character RPG Stage"
              className="w-full h-full object-cover object-center pixelated"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

            <div className="absolute top-5 left-5 z-20 bg-white/95 border border-slate-200 rounded-2xl px-3 py-2 shadow-lg backdrop-blur-sm flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-sm shrink-0">
                🧑‍💻
              </div>
              <div className="flex flex-col">
                <div className="font-pixel text-[8px] font-bold text-slate-800">
                  LEVEL 01
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-pixel text-[7px] text-slate-500">0 XP</span>
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>
              </div>
            </div>

            <div className="absolute top-[72px] left-5 z-20 bg-[#fef9c3]/95 border border-[#facc15] rounded-2xl px-3 py-2 shadow-lg backdrop-blur-sm max-w-[170px]">
              <div className="flex items-center gap-1 text-[8px] font-pixel text-amber-900 font-bold">
                <span>🚩</span>
                <span>QUEST:</span>
              </div>
              <p className="font-pixel text-[7.5px] text-slate-800 leading-tight mt-0.5">
                Write Your First Program
              </p>
            </div>

            <div className="absolute top-5 right-5 z-20 flex flex-col items-end animate-float-slow">
              <div className="relative mb-2 bg-white/95 border-2 border-slate-300 rounded-2xl px-3 py-2 shadow-md backdrop-blur-sm max-w-[190px] text-center">
                <p className="font-pixel text-[7.5px] text-slate-800 leading-tight font-bold">
                  Nice choice. This looks like a developer ready for adventure.
                </p>
                <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white/95 border-b-2 border-r-2 border-slate-300 rotate-45" />
              </div>

              <div className="w-11 h-11 relative filter drop-shadow-md">
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
              {renderFullCharacter()}
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl flex items-center justify-between gap-4 mt-2">
          <button
            onClick={onBack}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-2xl transition-all shadow-sm active:translate-y-0.5 cursor-pointer text-sm flex items-center gap-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          <button
            onClick={onFinish}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-base tracking-wide px-8 py-3.5 rounded-2xl shadow-[0_6px_20px_rgba(5,150,105,0.35)] hover:shadow-[0_8px_25px_rgba(5,150,105,0.45)] active:translate-y-0.5 active:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <span>Start My Adventure</span>
            <span className="text-lg">→</span>
          </button>
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-7xl mx-auto py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CodeQuest. All rights reserved. Step 4 of your journey.
      </footer>
    </div>
  )
}
