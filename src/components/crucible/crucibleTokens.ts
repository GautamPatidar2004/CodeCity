/**
 * Crucible Design System — Shared Tokens & Primitives
 * Used across Phase 4 components (Blood Arena, Dwarven Forge, Shield-Wall)
 * Purely presentational — no data logic.
 */

/* ── Palette ──────────────────────────────────────────────────────────── */
export const C = {
  // Backgrounds
  bg:      '#070505',
  bgCard:  'rgba(14,10,10,0.92)',
  bgPanel: 'rgba(20,12,12,0.88)',

  // Borders
  border:       'rgba(61,28,28,0.8)',
  borderHot:    'rgba(220,38,38,0.5)',
  borderGold:   'rgba(197,155,39,0.45)',
  borderFrost:  'rgba(0,229,255,0.25)',

  // Text
  textPrimary:   '#E8D5D5',
  textSecondary: '#9C7B7B',
  textMuted:     '#5C3E3E',

  // Crimson
  crimson:   '#DC2626',
  crimsonDim: 'rgba(220,38,38,0.15)',

  // Gold / Hacksilver
  gold:     '#C59B27',
  goldBright: '#F5D060',

  // Frost
  frost:    '#00E5FF',
  frostDim: 'rgba(0,229,255,0.12)',

  // Lava / Molten
  lava:    '#FF3D00',
  lavaDim: 'rgba(255,61,0,0.12)',
} as const

/* ── Status Badge ─────────────────────────────────────────────────────── */
export function statusBadgeStyle(status: string): { bg: string; color: string; label: string; pulse: boolean } {
  switch (status) {
    case 'live':
      return { bg: 'rgba(220,38,38,0.2)', color: '#FF6060', label: 'LIVE INVASION', pulse: true }
    case 'upcoming':
      return { bg: 'rgba(197,155,39,0.18)', color: '#F5D060', label: 'UPCOMING RAGNARÖK', pulse: false }
    case 'ended':
      return { bg: 'rgba(61,28,28,0.4)', color: '#9C7B7B', label: 'FALLEN REALM', pulse: false }
    default:
      return { bg: 'rgba(61,28,28,0.3)', color: '#9C7B7B', label: status.toUpperCase(), pulse: false }
  }
}

/* ── Tie-breaker labels ────────────────────────────────────────────────── */
export function tieBreakerLabel(rule: string): string {
  switch (rule) {
    case 'fastest_time':       return 'Fastest Slaughter'
    case 'least_submissions':  return 'Least Sacrifices'
    case 'highest_speed_bonus': return 'Highest Speed Bonus'
    case 'earliest_submission': return 'First Blood'
    default: return rule.replace(/_/g, ' ')
  }
}

/* ── Difficulty label ─────────────────────────────────────────────────── */
export function difficultyLabel(d: string): string {
  switch (d?.toLowerCase()) {
    case 'beginner': return 'Apprentice Smith'
    case 'intermediate': return 'Journeyman'
    case 'advanced': return 'Master Smith'
    default: return d ?? 'Apprentice Smith'
  }
}

/* ── Relative time formatter ──────────────────────────────────────────── */
export function relativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const s = Math.floor(diff / 1000)
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  } catch { return '' }
}

/* ── Countdown formatter (ms → HH:MM:SS) ─────────────────────────────── */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
