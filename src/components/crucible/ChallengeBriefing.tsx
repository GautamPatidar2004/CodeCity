import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Challenge, ChallengeProgress } from '../../lib/challenges'

interface ChallengeBriefingProps {
  challenge: Challenge
  progress?: ChallengeProgress
  isCompleted: boolean
}

const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  beginner: { label: 'MORTAL', color: '#78716c' },
  easy:     { label: 'MORTAL', color: '#78716c' },
  medium:   { label: 'HERO',   color: '#DC2626' },
  hard:     { label: 'GOD',    color: '#F59E0B' },
  expert:   { label: 'DEITY',  color: '#7C3AED' },
}

function formatDate(iso?: string) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7) return `${diff}d ago`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch { return null }
}

export const ChallengeBriefing: React.FC<ChallengeBriefingProps> = ({
  challenge, progress, isCompleted,
}) => {
  const [openHint, setOpenHint] = useState<number | null>(null)
  const [showSolution, setShowSolution] = useState(false)

  const diff = DIFFICULTY_MAP[(challenge.difficulty || '').toLowerCase()] ?? { label: 'MORTAL', color: '#78716c' }
  const hints = challenge.hints ?? []

  return (
    <div className="flex flex-col h-full overflow-y-auto crucible-scroll"
      style={{ background: '#0A0707' }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 flex flex-col gap-3"
        style={{ borderBottom: '1px solid #2D1616' }}
      >
        {/* Tag pills */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase"
            style={{
              background: 'rgba(255,61,0,0.12)',
              border: '1px solid rgba(255,61,0,0.25)',
              color: '#FF3D00',
              fontSize: '9px',
              letterSpacing: '0.06em',
            }}
          >
            {challenge.category}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase"
            style={{
              color: diff.color,
              border: `1px solid ${diff.color}40`,
              background: `${diff.color}12`,
              fontSize: '9px',
            }}
          >
            ⚔ {diff.label}
          </span>
          {challenge.language && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase"
              style={{
                color: '#00E5FF',
                border: '1px solid rgba(0,229,255,0.25)',
                background: 'rgba(0,229,255,0.07)',
                fontSize: '9px',
              }}
            >
              {challenge.language.toUpperCase()}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{
          color: '#f1f5f9',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          fontWeight: 900,
          lineHeight: 1.2,
        }}>
          {challenge.title}
        </h2>

        {/* XP reward */}
        <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(255,61,0,0.1) 100%)',
            border: '1px solid rgba(245,158,11,0.3)',
          }}
        >
          <span style={{ fontSize: '14px' }}>ᚱ</span>
          <span className="font-black" style={{ color: '#F59E0B', fontSize: '13px' }}>
            +{challenge.xp_reward ?? 75}
          </span>
          <span style={{ color: '#78716c', fontSize: '10px', fontWeight: 700 }}>HACKSILVER</span>
        </div>

        {/* Battle scars */}
        {progress && (
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { label: 'ATTEMPTS', value: progress.attempts_count },
              { label: 'BEST', value: progress.best_score ? `${progress.best_score}%` : '—' },
              { label: 'LAST', value: formatDate(progress.last_attempt_at) ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center py-2 rounded-xl"
                style={{ background: '#150F0F', border: '1px solid #2D1616' }}
              >
                <span style={{ color: '#57534e', fontSize: '8px', fontFamily: 'Press Start 2P, monospace' }}>{label}</span>
                <span className="font-black mt-1" style={{ color: '#f1f5f9', fontSize: '12px' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Instructions Parchment ──────────────────────────────── */}
      <div className="px-5 py-4 flex flex-col gap-4">
        <div className="rounded-xl p-4 leading-relaxed text-sm"
          style={{ background: '#110D0D', border: '1px solid #2D1616', color: '#c4b5a5' }}
        >
          <p className="whitespace-pre-wrap leading-relaxed" style={{ fontSize: '13px' }}>
            {challenge.instructions || challenge.description}
          </p>
        </div>

        {/* Sample Input / Output */}
        {challenge.sample_input && (
          <div className="rounded-xl overflow-hidden"
            style={{ border: '1px solid #2D1616' }}
          >
            <div className="px-3 py-2 flex items-center gap-2"
              style={{ background: '#150F0F', borderBottom: '1px solid #2D1616' }}
            >
              <span style={{ color: '#FF3D00', fontSize: '9px', fontFamily: 'Press Start 2P, monospace' }}>
                ▸ SAMPLE INPUT
              </span>
            </div>
            <pre className="p-3 text-xs leading-relaxed overflow-x-auto"
              style={{
                background: '#0D0909',
                color: '#86efac',
                fontFamily: 'JetBrains Mono, monospace',
                margin: 0,
                fontSize: '12px',
              }}
            >
              {challenge.sample_input}
            </pre>
          </div>
        )}

        {/* Mimir's Oracle – hints */}
        {hints.length > 0 && (
          <div className="rounded-xl overflow-hidden"
            style={{ border: '1px solid #2D1616' }}
          >
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ background: '#130A0A', borderBottom: '1px solid #2D1616' }}
            >
              <span style={{ fontSize: '18px' }}>🪶</span>
              <span className="font-black uppercase"
                style={{ color: '#78716c', fontSize: '9px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.6 }}
              >
                MIMIR'S WISDOM
              </span>
            </div>

            <div className="flex flex-col" style={{ background: '#0D0909' }}>
              {hints.map((hint, i) => (
                <div key={i} style={{ borderBottom: i < hints.length - 1 ? '1px solid #1c1010' : 'none' }}>
                  <button
                    type="button"
                    onClick={() => setOpenHint(openHint === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 transition-all hover:opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{
                          background: openHint === i ? 'rgba(255,61,0,0.2)' : '#1c1010',
                          border: `1px solid ${openHint === i ? 'rgba(255,61,0,0.4)' : '#2D1616'}`,
                        }}
                      >
                        <span style={{ color: '#FF3D00', fontSize: '9px', fontWeight: 900 }}>
                          {['I', 'II', 'III', 'IV', 'V'][i] ?? i + 1}
                        </span>
                      </div>
                      <span className="font-bold text-xs" style={{ color: '#78716c' }}>
                        Rune {['I', 'II', 'III', 'IV', 'V'][i] ?? i + 1} — Consult Mimir
                      </span>
                    </div>
                    {openHint === i
                      ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#57534e' }} />
                      : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#57534e' }} />
                    }
                  </button>
                  {openHint === i && (
                    <div className="px-4 pb-4">
                      <div className="p-3 rounded-xl text-sm leading-relaxed"
                        style={{
                          background: 'rgba(255,61,0,0.06)',
                          border: '1px solid rgba(255,61,0,0.15)',
                          color: '#c4b5a5',
                          fontSize: '12px',
                          fontStyle: 'italic',
                        }}
                      >
                        {hint}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Victory solution reveal */}
        {isCompleted && challenge.solution_explanation && (
          <div className="rounded-xl overflow-hidden"
            style={{
              border: '1px solid rgba(245,158,11,0.35)',
              boxShadow: '0 0 16px rgba(245,158,11,0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className="w-full flex items-center justify-between px-4 py-3 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.15) 0%, rgba(220,38,38,0.1) 100%)' }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '16px' }}>🏆</span>
                <span className="font-black uppercase"
                  style={{ color: '#F59E0B', fontSize: '9px', fontFamily: 'Press Start 2P, monospace' }}
                >
                  MASTER SOLUTION
                </span>
              </div>
              {showSolution
                ? <ChevronUp className="w-4 h-4" style={{ color: '#F59E0B' }} />
                : <ChevronDown className="w-4 h-4" style={{ color: '#F59E0B' }} />
              }
            </button>
            {showSolution && (
              <div className="px-4 pb-4 pt-3 flex flex-col gap-3"
                style={{ background: '#0D0909', borderTop: '1px solid rgba(245,158,11,0.2)' }}
              >
                <p className="text-sm leading-relaxed" style={{ color: '#c4b5a5', fontSize: '12px' }}>
                  {challenge.solution_explanation}
                </p>
                {challenge.solution_code && (
                  <pre className="p-3 rounded-xl text-xs overflow-x-auto"
                    style={{
                      background: '#070505',
                      border: '1px solid #2D1616',
                      color: '#86efac',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '12px',
                    }}
                  >
                    {challenge.solution_code}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
