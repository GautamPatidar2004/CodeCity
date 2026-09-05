import React from 'react'
import { Flame, Sword } from 'lucide-react'
import type { ResumePoint } from '../../../lib/learning'

interface ResumeShrineProps {
  resumePoint: ResumePoint | null
  onResume: (lessonId?: string) => void
}

export const ResumeShrine: React.FC<ResumeShrineProps> = ({ resumePoint, onResume }) => {
  const progress = resumePoint?.progressPercent ?? 0

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #0E0A0A 0%, #1a0e0e 50%, #0E0A0A 100%)',
        border: '1px solid #3D1C1C',
      }}
    >
      {/* Stone texture overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(255,61,0,0.1) 2px,
            rgba(255,61,0,0.1) 4px
          )`,
        }}
      />

      {/* Ember corner glows */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,61,0,0.08) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black tracking-widest uppercase"
            style={{ color: '#FF3D00', fontFamily: 'Press Start 2P, monospace', fontSize: '9px' }}
          >
            ⚔ CAMPFIRE SHRINE
          </span>
        </div>

        {resumePoint ? (
          <>
            {/* Course Title */}
            <h2 className="font-black uppercase tracking-tight mb-1"
              style={{
                color: '#f1f5f9',
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                letterSpacing: '0.02em',
              }}
            >
              {resumePoint.courseTitle}
            </h2>

            {/* Active Coordinates */}
            <p className="text-sm font-medium mb-4"
              style={{ color: '#78716c', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
            >
              {resumePoint.chapterTitle ? `${resumePoint.chapterTitle} • ` : ''}{resumePoint.lessonTitle}
            </p>

            {/* Lava Progress Track */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold" style={{ color: '#78716c', fontSize: '10px' }}>
                  SAGA PROGRESS
                </span>
                <span className="text-xs font-black" style={{ color: '#F59E0B', fontSize: '11px' }}>
                  {progress}%
                </span>
              </div>
              <div className="relative w-full h-3 rounded-full overflow-hidden"
                style={{ background: '#1c1010', border: '1px solid #3D1C1C' }}
              >
                {/* Lava fill */}
                <div className="h-full rounded-full relative transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #991B1B 0%, #DC2626 40%, #FF3D00 80%, #FF6B00 100%)',
                    boxShadow: '0 0 12px rgba(255, 61, 0, 0.6), 0 0 24px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  {/* Ember tip */}
                  {progress > 5 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                      style={{
                        background: '#FFF',
                        boxShadow: '0 0 6px #FF6B00, 0 0 12px #FF3D00',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: '#57534e', fontSize: '9px' }}>
                  {resumePoint.completedCount}/{resumePoint.totalCount} lessons forged
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onResume(resumePoint.lessonId)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 50%, #EA580C 100%)',
                  boxShadow: '0 0 20px rgba(220,38,38,0.5), 0 4px 12px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255, 61, 0, 0.3)',
                }}
              >
                <Sword className="w-4 h-4" />
                <span>Resume the Saga →</span>
              </button>
            </div>

            {/* Mimir flavor quote */}
            <div className="flex items-start gap-2.5 mt-4 p-3 rounded-xl"
              style={{ background: 'rgba(61, 28, 28, 0.4)', border: '1px solid rgba(61, 28, 28, 0.8)' }}
            >
              <span className="text-lg shrink-0">🪶</span>
              <p className="text-xs italic leading-relaxed" style={{ color: '#78716c' }}>
                "Sharpen your axe, brother. The next trial awaits."
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-black uppercase tracking-tight mb-2"
              style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}
            >
              THE SHRINE AWAITS
            </h2>
            <p className="text-sm mb-4" style={{ color: '#78716c' }}>
              No saga in progress. Begin your first trial to kindle the altar flame.
            </p>
            <button
              onClick={() => onResume()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
                boxShadow: '0 0 20px rgba(220,38,38,0.4)',
              }}
            >
              <Flame className="w-4 h-4" />
              <span>Begin First Trial →</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
