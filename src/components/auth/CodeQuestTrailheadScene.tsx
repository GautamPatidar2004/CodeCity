import React from 'react'

export const CodeQuestTrailheadScene: React.FC = () => {
  return (
    <div className="relative w-full h-[620px] lg:h-[760px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900/10 bg-slate-900 select-none group">
      {/* 16-Bit Pixel Art Background Scene */}
      <div className="relative w-full h-full">
        <img
          src="/codequest_trail_bg.jpg"
          alt="CodeQuest 16-bit Trailhead RPG Scene"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02] pixelated"
        />
        {/* Subtle cinematic vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* ========================================================
          HUD OVERLAY 1: NEW ADVENTURER PLAYER PROFILE (Top Left)
         ======================================================== */}
      <div className="absolute top-6 left-6 z-20 bg-[#191535]/95 border-2 border-[#382f6b] rounded-xl p-3.5 shadow-2xl backdrop-blur-md min-w-[190px] animate-float">
        <div className="flex items-center gap-2.5 mb-2">
          {/* Pixel Avatar Portrait */}
          <div className="w-8 h-8 rounded-lg bg-emerald-700/80 border-2 border-emerald-400 flex items-center justify-center text-sm shadow-inner">
            🧑‍💻
          </div>
          <div>
            <div className="font-pixel text-[8px] text-[#fcd34d] uppercase tracking-wider font-bold">
              NEW ADVENTURER
            </div>
            <div className="font-pixel text-[10px] text-white font-bold tracking-wider">
              LEVEL 01
            </div>
          </div>
        </div>

        {/* 8-Segment Cyan/Green XP Bar (0 XP filled initially) */}
        <div className="flex gap-1 mb-2">
          <div className="h-2 flex-1 rounded-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-[2px] bg-[#251f4d]"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[9px] font-pixel text-[#94a3b8]">
          <span className="text-[#fcd34d]">⭐ 0 XP</span>
          <span>NEXT: 100 XP</span>
        </div>
      </div>

      {/* ========================================================
          HUD OVERLAY 2: QUEST CARD (Top Right)
         ======================================================== */}
      <div className="absolute top-6 right-6 z-20 bg-[#251c38]/95 border-2 border-[#d97706] rounded-xl p-3.5 shadow-2xl backdrop-blur-md min-w-[200px] animate-float-delayed">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-xs">🚩</span>
          <span className="font-pixel text-[8.5px] text-[#fcd34d] uppercase font-black tracking-wider">
            FIRST QUEST
          </span>
        </div>
        <div className="font-pixel text-[9.5px] text-white font-bold leading-tight mb-2">
          Learn Your First Language
        </div>
        <div className="flex items-center justify-between text-[8px] font-pixel text-emerald-400 border-t border-amber-900/50 pt-1.5">
          <span>REWARD:</span>
          <span className="font-bold text-amber-300">+100 XP ⭐</span>
        </div>
      </div>

      {/* ========================================================
          HUD OVERLAY 3: BLUE COMPANION BOT & SPEECH BUBBLE
         ======================================================== */}
      <div className="absolute top-[145px] left-[32%] z-20 flex flex-col items-center animate-float-slow">
        <div className="relative mb-2 bg-white/95 border-2 border-slate-300 rounded-xl px-3 py-2 shadow-lg backdrop-blur-sm text-center">
          <p className="font-pixel text-[8.5px] text-slate-800 leading-tight font-bold tracking-tight">
            Let&apos;s build
            <br />
            something amazing!
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-b-2 border-r-2 border-slate-300 rotate-45" />
        </div>

        <div className="relative w-14 h-14 mt-1 filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]">
          <svg viewBox="0 0 48 48" className="w-full h-full pixelated">
            <rect x="12" y="6" width="24" height="26" rx="6" fill="#3b82f6" />
            <rect x="8" y="14" width="32" height="18" rx="4" fill="#2563eb" />
            <rect x="14" y="12" width="20" height="14" rx="3" fill="#0f172a" />
            <rect x="17" y="16" width="4" height="6" rx="1" fill="#38bdf8" />
            <rect x="27" y="16" width="4" height="6" rx="1" fill="#38bdf8" />
            <rect x="6" y="16" width="4" height="8" rx="1" fill="#60a5fa" />
            <rect x="38" y="16" width="4" height="8" rx="1" fill="#60a5fa" />
            <polygon points="12,32 36,32 40,44 8,44" fill="#1d4ed8" />
            <circle cx="24" cy="38" r="2.5" fill="#38bdf8" />
          </svg>
          <span className="absolute -top-1 -right-1 text-cyan-300 text-xs animate-twinkle">
            ✨
          </span>
        </div>
      </div>

      {/* ========================================================
          HUD OVERLAY 4: WAYPOINT MILESTONE BADGES
         ======================================================== */}
      <div className="absolute top-[280px] left-8 z-20 flex flex-col gap-2.5">
        <div className="bg-[#452714]/90 border-2 border-[#b45309] text-[#fef08a] font-pixel text-[8.5px] px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
          <span className="text-xs">⚙</span>
          <span>BUILD</span>
        </div>

        <div className="bg-[#452714]/90 border-2 border-[#b45309] text-[#fef08a] font-pixel text-[8.5px] px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
          <span className="text-xs">💡</span>
          <span>CREATE</span>
        </div>

        <div className="bg-[#452714]/90 border-2 border-[#b45309] text-[#fef08a] font-pixel text-[8.5px] px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
          <span className="text-xs">🏆</span>
          <span>MASTER</span>
        </div>
      </div>

      {/* ========================================================
          HUD OVERLAY 5: GLOWING PURPLE MYSTIC PORTAL
         ======================================================== */}
      <div className="absolute bottom-20 right-10 z-20 flex flex-col items-center animate-float-delayed">
        <div className="bg-[#3b0764]/90 border-2 border-[#c084fc] px-3 py-1.5 rounded-xl shadow-[0_0_25px_rgba(192,132,252,0.8)] font-pixel text-[10px] text-purple-200 font-black tracking-wider flex items-center gap-1.5 backdrop-blur-md">
          <span>&lt;/&gt;</span>
          <span className="text-[8px] text-purple-300">PORTAL</span>
        </div>
      </div>

      {/* Floating Syntax Particles */}
      <div className="absolute top-[48%] right-[35%] bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-md text-emerald-400 font-mono font-bold text-xs shadow-md animate-twinkle pointer-events-none">
        &#123; &#125;
      </div>
      <div className="absolute top-[62%] left-[45%] bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-md text-sky-400 font-mono font-bold text-xs shadow-md animate-twinkle pointer-events-none" style={{ animationDelay: '700ms' }}>
        [ ]
      </div>
      <div className="absolute bottom-[30%] left-[28%] bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-md text-amber-400 font-mono font-bold text-xs shadow-md animate-twinkle pointer-events-none" style={{ animationDelay: '1000ms' }}>
        ( )
      </div>

      {/* Ambient Pixel Sparkles */}
      <div className="absolute top-[38%] left-[20%] text-amber-300 text-xs animate-twinkle pointer-events-none">
        ✦
      </div>
      <div className="absolute top-[20%] right-[32%] text-emerald-400 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '500ms' }}>
        ✦
      </div>
    </div>
  )
}
