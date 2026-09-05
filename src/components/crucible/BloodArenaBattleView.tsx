import React, { useState, useEffect } from 'react'
import { ArrowLeft, Crown, Zap, Scale, Timer, Shield, Users, Trophy, Swords } from 'lucide-react'
import {
  useBattleLobby,
  useBattleLeaderboard,
  type BattleLeaderboardEntry,
  type ArcadeBattle,
} from '../../lib/arcade'
import { BattleCollabWorkspace } from '../arcade/BattleCollabWorkspace'
import { C, statusBadgeStyle, tieBreakerLabel, formatCountdown } from './crucibleTokens'

/* ─────────────────────────────────────────────────────────────────
   CollabPresenceBar — Runic warrior presence HUD
───────────────────────────────────────────────────────────────── */
export const CollabPresenceBar: React.FC<{
  presenceUsers: Array<{ user_id: string; username?: string; full_name?: string; avatar_url?: string; is_typing?: boolean }>
}> = ({ presenceUsers }) => {
  if (!presenceUsers.length) return null
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: C.bgPanel, border: `1px solid ${C.borderFrost}` }}>
      <Shield className="w-3 h-3" style={{ color: C.frost }} />
      <span className="text-[9px] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.frost }}>War Council</span>
      <div className="flex items-center gap-1.5 ml-1">
        {presenceUsers.map((u) => (
          <div key={u.user_id} className="relative flex items-center gap-1">
            {/* Avatar crest */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{
                background: u.avatar_url ? 'transparent' : 'linear-gradient(135deg, #7F1D1D, #DC2626)',
                border: u.is_typing ? `1.5px solid ${C.frost}` : `1.5px solid ${C.crimson}`,
                boxShadow: u.is_typing ? `0 0 8px ${C.frost}` : `0 0 4px rgba(220,38,38,0.5)`,
                fontFamily: "'Cinzel', serif",
              }}
              title={u.full_name || u.username}
            >
              {u.avatar_url
                ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                : (u.username || u.full_name || '?').charAt(0).toUpperCase()}
            </div>
            {/* Presence dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: u.is_typing ? C.frost : '#22c55e', border: '1px solid #070505' }}
            />
            {/* Typing aura */}
            {u.is_typing && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[8px]"
                style={{ background: C.frostDim, color: C.frost, border: `1px solid ${C.borderFrost}`, fontFamily: "'Cinzel', serif" }}>
                scribing…
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   GladiatorLeaderboard — Gladiatorial Standings side panel
───────────────────────────────────────────────────────────────── */
const GladiatorLeaderboard: React.FC<{
  entries: BattleLeaderboardEntry[]
  myTeamId?: string
  isEnded?: boolean
}> = ({ entries, myTeamId, isEnded }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2 mb-1">
      <Trophy className="w-3.5 h-3.5" style={{ color: C.gold }} />
      <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.gold }}>
        Gladiatorial Standings
      </span>
    </div>
    {entries.length === 0 ? (
      <div className="text-center py-6 text-xs" style={{ color: C.textMuted }}>No warriors yet...</div>
    ) : (
      <div className="flex flex-col gap-1.5">
        {entries.slice(0, 10).map((e, i) => {
          const isMe = e.team_id === myTeamId
          const isFirst = i === 0
          return (
            <div
              key={e.team_id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
              style={{
                background: isFirst
                  ? 'linear-gradient(135deg, rgba(197,155,39,0.18), rgba(120,78,16,0.1))'
                  : isMe
                  ? C.crimsonDim
                  : 'rgba(20,12,12,0.6)',
                border: isFirst
                  ? `1px solid ${C.borderGold}`
                  : isMe
                  ? `1px solid ${C.borderHot}`
                  : `1px solid ${C.border}`,
                boxShadow: isFirst ? `0 0 12px rgba(197,155,39,0.15)` : 'none',
              }}
            >
              {/* Rank */}
              <div className="w-5 text-center shrink-0">
                {isFirst ? (
                  <Crown className="w-3.5 h-3.5 mx-auto" style={{ color: C.gold }} />
                ) : (
                  <span className="text-[10px] font-bold" style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>
                    #{i + 1}
                  </span>
                )}
              </div>

              {/* Team name */}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold truncate" style={{ color: isMe ? '#FF8080' : C.textPrimary, fontFamily: "'Cinzel', serif" }}>
                  {e.team_name}
                  {isMe && <span className="ml-1 text-[8px] text-red-400">(YOU)</span>}
                </div>
                <div className="text-[9px]" style={{ color: C.textMuted }}>
                  {e.quests_completed ?? e.exercises_completed ?? 0} quests
                </div>
              </div>

              {/* Score */}
              <div className="text-[11px] font-bold shrink-0" style={{ color: isFirst ? C.goldBright : C.textSecondary, fontFamily: "'Cinzel', serif" }}>
                {e.team_total_score ?? e.total_score ?? 0}
              </div>
            </div>
          )
        })}
      </div>
    )}
    {isEnded && entries.length > 0 && (
      <div className="mt-2 text-center text-[9px] uppercase tracking-wider py-1.5 rounded-lg"
        style={{ background: C.crimsonDim, color: C.crimson, fontFamily: "'Cinzel', serif" }}>
        ⚔️ Battle Concluded — Final Rankings
      </div>
    )}
  </div>
)

/* ─────────────────────────────────────────────────────────────────
   BloodArenaBattleView — Main battle chamber shell
───────────────────────────────────────────────────────────────── */
interface BloodArenaBattleViewProps {
  battleId: string
  userId?: string
  onExit: () => void
}

export const BloodArenaBattleView: React.FC<BloodArenaBattleViewProps> = ({ battleId, userId, onExit }) => {
  const { access, battle, exercises, teamMembers, teamProgress, loading, refreshLobby } = useBattleLobby(battleId, userId)
  const { leaderboard } = useBattleLeaderboard(battleId)
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0)
  const [arenaTab, setArenaTab] = useState<'workspace' | 'standings'>('workspace')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-4" style={{ color: C.textPrimary }}>
        <div className="text-4xl animate-pulse" style={{ fontFamily: "'Cinzel Decorative', serif", color: C.crimson }}>⚔</div>
        <div className="text-[11px] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.textSecondary }}>
          Verifying Battle Clearance…
        </div>
      </div>
    )
  }

  /* ── Access Denied ── */
  if (!access?.allowed || !battle) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-10 text-center">
        <button type="button" onClick={onExit} className="flex items-center gap-2 text-sm w-fit" style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Arena
        </button>
        <div className="p-10 rounded-2xl flex flex-col items-center gap-4"
          style={{ background: C.bgCard, border: `1px solid ${C.borderHot}` }}>
          <Shield className="w-12 h-12" style={{ color: C.crimson }} />
          <h3 className="font-bold text-lg" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>
            Entry Barred by the Blood Gate
          </h3>
          <p className="text-sm" style={{ color: C.textSecondary }}>
            {access?.reason || 'You are not cleared to enter this battle chamber.'}
          </p>
        </div>
      </div>
    )
  }

  /* ── Countdown / Status ── */
  const startMs  = new Date(battle.start_time).getTime()
  const endMs    = new Date(battle.end_time).getTime()
  const timeLeftMs = endMs - now
  const msUntilStart = startMs - now
  const isLive    = battle.effective_status === 'live'
  const isEnded   = battle.effective_status === 'ended'
  const isUpcoming = battle.effective_status === 'upcoming'
  const isCritical = isLive && timeLeftMs < 5 * 60 * 1000

  const { bg: statusBg, color: statusColor, label: statusLabel, pulse: statusPulse } = statusBadgeStyle(battle.effective_status)
  const selectedExercise = exercises[selectedExerciseIndex]
  const myTeamId = teamMembers[0]?.team_id

  // Pull collab presence from workspace hook indirectly via render of BattleCollabWorkspace
  // We expose presence separately via a shared state lifted below
  const [presenceUsers, setPresenceUsers] = useState<any[]>([])

  return (
    <div className="flex flex-col min-h-screen" style={{ color: C.textPrimary }}>

      {/* ═══════════════════════════════════════════
          BATTLE CHAMBER HEADER — Chiseled Basalt
      ═══════════════════════════════════════════ */}
      <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: '#0B0808', borderBottom: `1px solid ${C.border}`, boxShadow: `0 2px 20px rgba(0,0,0,0.6)` }}>

        {/* LEFT — Back + Title + Mode */}
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onExit} className="p-1.5 rounded-lg transition-colors shrink-0"
            style={{ color: C.textSecondary, border: `1px solid ${C.border}` }}
            onMouseEnter={e => (e.currentTarget.style.color = C.crimson)}
            onMouseLeave={e => (e.currentTarget.style.color = C.textSecondary)}>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold truncate" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>
                {battle.title}
              </h1>
              {/* Mode badge */}
              <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold shrink-0"
                style={{ background: 'rgba(220,38,38,0.15)', color: C.crimson, fontFamily: "'Cinzel', serif", border: `1px solid ${C.borderHot}` }}>
                {(battle as any).mode === 'team' ? '⚔ CLAN WARFARE' : '⚔ SOLO DUEL'}
              </span>
              {/* Status indicator */}
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold shrink-0 ${statusPulse ? 'animate-pulse' : ''}`}
                style={{ background: statusBg, color: statusColor, fontFamily: "'Cinzel', serif", border: `1px solid ${statusColor}44` }}>
                ● {statusLabel}
              </span>
            </div>
            {/* Tie-breaker banner */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <Scale className="w-3 h-3 shrink-0" style={{ color: C.gold }} />
              <span className="text-[10px]" style={{ color: C.gold, fontFamily: "'Cinzel', serif" }}>
                Judgment: {tieBreakerLabel(battle.tie_breaker_rule)}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER — Stone Sundial Countdown */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Timer className="w-3 h-3" style={{ color: isCritical ? C.crimson : C.textSecondary }} />
            <span className="text-[9px] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: isCritical ? C.crimson : C.textSecondary }}>
              {isUpcoming ? 'Begins In' : isEnded ? 'Battle Ended' : 'Time Remaining'}
            </span>
          </div>
          <div
            className={`text-2xl font-black tracking-wider px-4 py-2 rounded-xl ${isCritical ? 'animate-pulse' : ''}`}
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: isCritical ? '#FF4040' : isEnded ? C.textMuted : C.textPrimary,
              background: isCritical ? 'rgba(220,38,38,0.1)' : C.bgPanel,
              border: `1px solid ${isCritical ? C.crimson : C.border}`,
              boxShadow: isCritical ? `0 0 20px rgba(220,38,38,0.3)` : 'none',
            }}
          >
            {isEnded ? '⚔ ENDED'
              : isUpcoming ? formatCountdown(msUntilStart)
              : formatCountdown(timeLeftMs)}
          </div>
        </div>

        {/* RIGHT — Presence HUD */}
        <CollabPresenceBar presenceUsers={presenceUsers} />
      </div>

      {/* ═══════════════════════════════════════════
          ARENA BODY — Workspace + Standings tabs
      ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col">
        {/* Tab strip */}
        <div className="flex gap-0 px-6 pt-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          {[
            { key: 'workspace', label: '⚔ Battle Workspace', icon: <Swords className="w-3.5 h-3.5" /> },
            { key: 'standings', label: '🏆 Gladiatorial Standings', icon: <Trophy className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setArenaTab(tab.key as any)}
              className="relative px-4 py-2.5 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 transition-all"
              style={{
                fontFamily: "'Cinzel', serif",
                color: arenaTab === tab.key ? C.crimson : C.textSecondary,
                borderBottom: arenaTab === tab.key ? `2px solid ${C.crimson}` : '2px solid transparent',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Exercise selector (workspace tab) */}
        {arenaTab === 'workspace' && exercises.length > 1 && (
          <div className="flex items-center gap-2 px-6 py-2 overflow-x-auto" style={{ background: '#0A0707' }}>
            <span className="text-[9px] uppercase tracking-wider shrink-0" style={{ fontFamily: "'Cinzel', serif", color: C.textMuted }}>Trials:</span>
            {exercises.map((ex, i) => {
              const prog = teamProgress.find(p => p.exercise_id === ex.exercise_id)
              const isDone = prog?.is_completed
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExerciseIndex(i)}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: selectedExerciseIndex === i
                      ? isDone ? 'rgba(197,155,39,0.18)' : C.crimsonDim
                      : 'rgba(20,12,12,0.6)',
                    color: selectedExerciseIndex === i
                      ? isDone ? C.goldBright : C.crimson
                      : C.textSecondary,
                    border: `1px solid ${selectedExerciseIndex === i
                      ? isDone ? C.borderGold : C.borderHot
                      : C.border}`,
                  }}
                >
                  {isDone ? '✓' : `${i + 1}.`} {ex.challenge?.title ?? `Trial ${i + 1}`}
                </button>
              )
            })}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-0">
          {arenaTab === 'workspace' && selectedExercise && (
            <BattleCollabWorkspace
              battleId={battleId}
              teamId={myTeamId ?? ''}
              exercise={selectedExercise}
              isLive={isLive}
              progress={teamProgress.find(p => p.exercise_id === selectedExercise.exercise_id)}
              onQuestCompleted={() => refreshLobby()}
              onNextQuest={() => {
                if (selectedExerciseIndex < exercises.length - 1) {
                  setSelectedExerciseIndex(i => i + 1)
                }
              }}
            />
          )}

          {arenaTab === 'standings' && (
            <div className="p-6 max-w-2xl">
              <GladiatorLeaderboard
                entries={leaderboard}
                myTeamId={myTeamId}
                isEnded={isEnded}
              />
            </div>
          )}

          {arenaTab === 'workspace' && !selectedExercise && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="text-3xl mb-3" style={{ color: C.crimson }}>⚔</div>
                <p className="text-sm" style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>
                  {isUpcoming ? 'The battle has not begun. Stand ready, warrior.' : 'No trials assigned to this battle.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
