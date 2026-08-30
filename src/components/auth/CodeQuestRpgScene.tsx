import React from 'react'

export const CodeQuestRpgScene: React.FC = () => {
  return (
    <div className="relative w-full h-[620px] lg:h-[720px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900/10 bg-slate-900 select-none group">
      {/* 16-Bit Pixel Art Background Scene */}
      <div className="relative w-full h-full">
        <img
          src="/codequest_bg.jpg"
          alt="CodeQuest 16-bit RPG Scene"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02] pixelated"
        />
        {/* Subtle cinematic vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* ========================================================
          HUD OVERLAY 1: LEVEL STATUS (Top Left of scene)
         ======================================================== */}
      <div className="absolute top-6 left-6 z-20 bg-[#191535]/95 border-2 border-[#382f6b] rounded-xl p-3.5 shadow-2xl backdrop-blur-md min-w-[175px] animate-float">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-pixel text-[10px] text-white uppercase tracking-wider font-bold">
            LEVEL 12
          </span>
          <span className="text-[10px] text-indigo-300">⚔️</span>
        </div>

        {/* 8-Segment Neon Green XP Bar */}
        <div className="flex gap-1 mb-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-[2px] transition-all duration-300 ${
                i < 5
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-[#251f4d]'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-xs">⭐</span>
          <span className="font-pixel text-[9px] text-[#fcd34d] font-bold tracking-wide">
            4,850 XP
          </span>
        </div>
      </div>

      {/* ========================================================
          HUD OVERLAY 2: FLOATING +120 XP PILL
         ======================================================== */}
      <div className="absolute top-[160px] left-8 z-20 bg-[#251644]/95 border border-[#6432aa] px-3.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(100,50,170,0.5)] text-[#d8b4fe] font-pixel text-[9px] flex items-center gap-1.5 animate-float-delayed backdrop-blur-sm hover:scale-105 transition-transform cursor-default">
        <span className="text-amber-400 text-xs">✦</span>
        <span>+120 XP</span>
      </div>

      {/* ========================================================
          HUD OVERLAY 3: FLOATING CASTLE CODE SIGIL
         ======================================================== */}
      <div className="absolute top-[110px] left-[42%] z-20 bg-[#1a1738]/90 border-2 border-[#4f46e5] px-2.5 py-1.5 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.6)] font-pixel text-[9px] text-indigo-300 flex items-center justify-center animate-float-slow">
        &lt;/&gt;
      </div>

      {/* ========================================================
          HUD OVERLAY 4: FLOATING COMPANION BOT & SPEECH BUBBLE
         ======================================================== */}
      <div className="absolute top-8 right-[24%] z-20 flex flex-col items-center animate-float-slow">
        {/* Retro Pixel Speech Bubble */}
        <div className="relative mb-2 bg-white/95 border-2 border-slate-300 rounded-xl px-3 py-2 shadow-lg backdrop-blur-sm text-center">
          <p className="font-pixel text-[8.5px] text-slate-800 leading-tight font-bold tracking-tight">
            Ready for
            <br />
            your next quest?
          </p>
          {/* Speech bubble pointer tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-b-2 border-r-2 border-slate-300 rotate-45" />
        </div>

        {/* Companion Bot Sprite */}
        <div className="relative w-14 h-14 mt-1 filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]">
          <svg viewBox="0 0 48 48" className="w-full h-full pixelated">
            {/* Green Hood */}
            <rect x="12" y="6" width="24" height="26" rx="6" fill="#10b981" />
            <rect x="8" y="14" width="32" height="18" rx="4" fill="#059669" />
            {/* Face Screen */}
            <rect x="14" y="12" width="20" height="14" rx="3" fill="#0f172a" />
            {/* Glowing Blue Eyes */}
            <rect x="17" y="16" width="4" height="6" rx="1" fill="#38bdf8" />
            <rect x="27" y="16" width="4" height="6" rx="1" fill="#38bdf8" />
            {/* Gold Ear Pieces */}
            <rect x="6" y="16" width="4" height="8" rx="1" fill="#f59e0b" />
            <rect x="38" y="16" width="4" height="8" rx="1" fill="#f59e0b" />
            {/* Cloak Body */}
            <polygon points="12,32 36,32 40,44 8,44" fill="#047857" />
            {/* Chest Core */}
            <circle cx="24" cy="38" r="2.5" fill="#fcd34d" />
          </svg>
          {/* Bot Aura Sparkle */}
          <span className="absolute -top-1 -right-1 text-amber-300 text-xs animate-twinkle">
            ✨
          </span>
        </div>
      </div>

      {/* ========================================================
          HUD OVERLAY 5: QUEST BADGES (Top Right)
         ======================================================== */}
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-2.5">
        {/* Quest Complete Badge */}
        <div className="bg-[#0b4d40]/90 border-2 border-[#10b981] text-emerald-200 font-pixel text-[8.5px] px-3 py-1.5 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.35)] flex items-center gap-2 backdrop-blur-md animate-pulse-glow">
          <span className="text-emerald-300 text-xs font-black">✓</span>
          <span className="font-bold tracking-wider">QUEST COMPLETE</span>
        </div>

        {/* Bug Hunter Badge */}
        <div className="bg-[#5a2c0c]/90 border-2 border-[#d97706] text-[#fde68a] font-pixel text-[8.5px] px-3 py-1.5 rounded-xl shadow-[0_4px_16px_rgba(217,119,6,0.35)] flex items-center gap-2 backdrop-blur-md">
          <span className="text-xs">👾</span>
          <span className="font-bold tracking-wider">BUG HUNTER</span>
        </div>
      </div>

      {/* ========================================================
          HUD OVERLAY 6: FLOATING TECH SIGILS (Right Side)
         ======================================================== */}
      <div className="absolute top-[180px] right-8 z-20 flex flex-col gap-3.5">
        {/* Python Sigil */}
        <div className="w-10 h-10 rounded-xl bg-[#1e293b]/90 border-2 border-sky-400 flex items-center justify-center animate-neon-cyan shadow-lg backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-6 h-6">
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

        {/* JavaScript (JS) Sigil */}
        <div className="w-10 h-10 rounded-xl bg-[#fcd34d] border-2 border-[#b45309] flex items-center justify-center animate-neon-yellow shadow-lg hover:scale-110 transition-transform cursor-pointer">
          <span className="font-pixel text-[12px] font-black text-black tracking-tighter">
            JS
          </span>
        </div>

        {/* HTML / Code Sigil */}
        <div className="w-10 h-10 rounded-xl bg-[#f97316]/90 border-2 border-orange-300 flex items-center justify-center animate-neon-orange shadow-lg backdrop-blur-sm hover:scale-110 transition-transform cursor-pointer">
          <span className="font-pixel text-[10px] font-bold text-white tracking-tighter">
            &lt;/&gt;
          </span>
        </div>
      </div>

      {/* ========================================================
          HUD OVERLAY 7: WOODEN SIGNPOST (Left Foreground)
         ======================================================== */}
      <div className="absolute bottom-16 left-6 z-20 flex flex-col items-center">
        <div className="flex flex-col gap-1.5 z-10">
          <div className="relative bg-gradient-to-r from-[#854d0e] to-[#a16207] border-2 border-[#713f12] text-[#fef08a] font-pixel text-[8.5px] font-bold px-3 py-1 rounded-sm shadow-md flex items-center justify-between gap-2 min-w-[85px] hover:brightness-110 transition-all cursor-default">
            <span>BUILD</span>
            <span className="text-[7px] text-amber-200">▶</span>
          </div>

          <div className="relative bg-gradient-to-r from-[#713f12] to-[#854d0e] border-2 border-[#582e0a] text-[#fef08a] font-pixel text-[8.5px] font-bold px-3 py-1 rounded-sm shadow-md flex items-center justify-between gap-2 min-w-[85px] hover:brightness-110 transition-all cursor-default">
            <span>LEARN</span>
            <span className="text-[7px] text-amber-200">▶</span>
          </div>

          <div className="relative bg-gradient-to-r from-[#854d0e] to-[#a16207] border-2 border-[#713f12] text-[#fef08a] font-pixel text-[8px] font-bold px-2.5 py-1 rounded-sm shadow-md flex items-center justify-between gap-1 min-w-[85px] hover:brightness-110 transition-all cursor-default">
            <span>LEVEL UP</span>
            <span className="text-[7px] text-amber-200">▶</span>
          </div>
        </div>

        <div className="w-3 h-14 bg-[#582e0a] border-x border-[#3b1d06] -mt-1 shadow-inner" />
      </div>

      {/* Ambient Pixel Particles */}
      <div className="absolute top-[45%] left-[28%] text-amber-300 text-xs animate-twinkle pointer-events-none">
        ✦
      </div>
      <div className="absolute top-[25%] right-[40%] text-emerald-400 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '500ms' }}>
        ✦
      </div>
      <div className="absolute bottom-[35%] right-[22%] text-cyan-300 text-xs animate-twinkle pointer-events-none" style={{ animationDelay: '1000ms' }}>
        ✦
      </div>
    </div>
  )
}
