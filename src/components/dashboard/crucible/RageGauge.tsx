import React from 'react'
import type { GamificationStats } from '../../../lib/gamification'

interface RageGaugeProps {
  stats: GamificationStats
}

export const RageGauge: React.FC<RageGaugeProps> = ({ stats }) => {
  const { dailyXpEarned, dailyGoalXp, dailyGoalPercent, dailyGoalCompleted } = stats

  return (
    <div className="rounded-xl p-4"
      style={{
        background: '#150F0F',
        border: '1px solid #451414',
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-black tracking-widest uppercase"
          style={{ color: '#EF4444', fontSize: '10px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.4 }}
        >
          ⚔️ SPARTAN RAGE
        </span>
        <span className="font-black tabular-nums"
          style={{ color: '#F59E0B', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}
        >
          {dailyXpEarned} / {dailyGoalXp} XP
        </span>
      </div>

      {/* Rage Bar */}
      <div className="relative w-full h-5 rounded-lg overflow-hidden mb-2"
        style={{
          background: 'linear-gradient(90deg, #0D0505 0%, #1a0808 100%)',
          border: '1px solid #3D1C1C',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
        }}
      >
        {/* Segmented tick marks */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex-1 border-r last:border-r-0"
              style={{ borderColor: 'rgba(0,0,0,0.4)' }}
            />
          ))}
        </div>

        {/* Fill bar */}
        <div
          className="h-full rounded-lg relative transition-all duration-700"
          style={{
            width: `${Math.min(100, dailyGoalPercent)}%`,
            background: dailyGoalCompleted
              ? 'linear-gradient(90deg, #991B1B 0%, #DC2626 30%, #FF3D00 70%, #F59E0B 100%)'
              : 'linear-gradient(90deg, #991B1B 0%, #DC2626 60%, #FF3D00 100%)',
            boxShadow: dailyGoalCompleted
              ? '0 0 20px rgba(245, 158, 11, 0.8), 0 0 40px rgba(255, 61, 0, 0.5)'
              : '0 0 12px rgba(255, 61, 0, 0.5), 0 0 24px rgba(220, 38, 38, 0.3)',
            animation: dailyGoalCompleted ? 'rage-pulse 1s ease-in-out infinite' : undefined,
          }}
        >
          {/* Inner highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-lg"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          />
        </div>

        {/* Percent label inside bar */}
        {dailyGoalPercent > 15 && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white font-black"
            style={{ fontSize: '9px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            {dailyGoalPercent}%
          </span>
        )}
      </div>

      {/* Rage Unleashed Victory Seal */}
      {dailyGoalCompleted && (
        <div className="flex items-center justify-center gap-2 mt-2 py-1.5 rounded-lg"
          style={{
            background: 'linear-gradient(90deg, rgba(153, 27, 27, 0.4) 0%, rgba(245, 158, 11, 0.2) 50%, rgba(153, 27, 27, 0.4) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            animation: 'rage-pulse 1.5s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: '14px' }}>🔥</span>
          <span className="font-black tracking-widest uppercase"
            style={{ color: '#F59E0B', fontSize: '9px', fontFamily: 'Press Start 2P, monospace' }}
          >
            RAGE UNLEASHED
          </span>
          <span className="font-black" style={{ color: '#FCD34D', fontSize: '9px' }}>
            +BONUS XP
          </span>
          <span style={{ fontSize: '14px' }}>🔥</span>
        </div>
      )}

      {!dailyGoalCompleted && (
        <div className="flex items-center justify-between mt-1">
          <span style={{ color: '#57534e', fontSize: '9px' }}>
            {Math.max(0, dailyGoalXp - dailyXpEarned)} XP until Rage unleashed
          </span>
          <span style={{ color: '#6b7280', fontSize: '9px' }}>Daily Goal</span>
        </div>
      )}

      <style>{`
        @keyframes rage-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(245, 158, 11, 0.4), 0 0 24px rgba(255, 61, 0, 0.3); }
          50% { box-shadow: 0 0 24px rgba(245, 158, 11, 0.8), 0 0 48px rgba(255, 61, 0, 0.5); }
        }
      `}</style>
    </div>
  )
}
