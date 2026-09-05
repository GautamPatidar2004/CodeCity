import React, { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

interface VictoryModalProps {
  xpReward: number
  challengeTitle: string
  onNextTrial: () => void
  onInspectSolution: () => void
  onClose: () => void
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  xpReward, challengeTitle, onNextTrial, onInspectSolution, onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Trigger ember sparks via CSS animation
    const t = setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.classList.add('victory-active')
      }
    }, 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(5, 2, 2, 0.92)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Floating ember particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: i % 3 === 0 ? '#FF3D00' : i % 3 === 1 ? '#F59E0B' : '#DC2626',
              left: `${10 + (i * 7.5) % 80}%`,
              bottom: '-4px',
              animation: `ember-rise ${2 + (i * 0.3) % 2}s ease-out ${(i * 0.2) % 1.5}s infinite`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Modal card */}
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0E0A0A 0%, #1a0808 40%, #0E0A0A 100%)',
          border: '1px solid rgba(245,158,11,0.4)',
          boxShadow: '0 0 60px rgba(220,38,38,0.3), 0 0 120px rgba(245,158,11,0.1), inset 0 0 40px rgba(255,61,0,0.03)',
          animation: 'modal-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Top glow bar */}
        <div className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #DC2626 0%, #FF3D00 30%, #F59E0B 60%, #FF3D00 80%, #DC2626 100%)' }}
        />

        {/* Content */}
        <div className="px-8 py-8 flex flex-col items-center text-center gap-5">
          {/* Omega seal */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(245,158,11,0.2)', animationDuration: '2s' }}
            />
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(220,38,38,0.1) 60%, transparent 100%)',
                border: '2px solid rgba(245,158,11,0.5)',
                boxShadow: '0 0 24px rgba(245,158,11,0.4), 0 0 48px rgba(220,38,38,0.2)',
              }}
            >
              <span style={{ fontSize: '40px', filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.8))' }}>⚡</span>
            </div>
          </div>

          {/* Victory heading */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-black uppercase tracking-widest"
              style={{ color: '#FF3D00', fontSize: '10px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.6 }}
            >
              ⚔ TRIAL CONQUERED ⚔
            </span>
            <h2 style={{
              color: '#f1f5f9',
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
              fontWeight: 900,
              lineHeight: 1.2,
            }}>
              {challengeTitle}
            </h2>
            <p style={{ color: '#78716c', fontSize: '13px' }}>
              All runes verified. Victory is yours, warrior.
            </p>
          </div>

          {/* XP reward */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(255,61,0,0.1) 100%)',
              border: '1px solid rgba(245,158,11,0.35)',
              boxShadow: '0 0 20px rgba(245,158,11,0.15)',
            }}
          >
            <span style={{ fontSize: '24px', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' }}>ᚱ</span>
            <div className="flex flex-col items-start">
              <span className="font-black" style={{ color: '#F59E0B', fontSize: '28px', lineHeight: 1 }}>
                +{xpReward}
              </span>
              <span style={{ color: '#78716c', fontSize: '10px', fontWeight: 700 }}>
                HACKSILVER CLAIMED
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col w-full gap-3 mt-1">
            <button
              type="button"
              onClick={onNextTrial}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #B91C1C 0%, #EA580C 50%, #D97706 100%)',
                boxShadow: '0 0 20px rgba(220,38,38,0.5), 0 4px 16px rgba(0,0,0,0.4)',
                fontSize: '11px',
                letterSpacing: '0.05em',
              }}
            >
              <span>Proceed to Next Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onInspectSolution}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-80"
              style={{
                background: 'rgba(61, 28, 28, 0.4)',
                border: '1px solid #3D1C1C',
                color: '#78716c',
                fontSize: '12px',
              }}
            >
              🔍 Inspect Master Solution
            </button>
          </div>
        </div>

        {/* Bottom glow bar */}
        <div className="h-px w-full"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.4) 50%, transparent 100%)' }}
        />
      </div>

      <style>{`
        @keyframes ember-rise {
          0%   { transform: translateY(0) scale(1); opacity: 0.8; }
          50%  { transform: translateY(-60px) scale(0.6); opacity: 0.5; }
          100% { transform: translateY(-120px) scale(0); opacity: 0; }
        }
        @keyframes modal-appear {
          0%   { transform: scale(0.85) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
