import React, { useState, useEffect } from 'react'
import {
  useBattleLobby,
  useBattleLeaderboard,
  finalizeBattleRankings,
  type BattleExercise,
} from '../../lib/arcade'
import { GamifiedButton } from '../ui/GamifiedButton'
import { AlexPixelAvatar } from '../brand/PixelArtAvatars'
import { BattleCollabWorkspace } from './BattleCollabWorkspace'
import { BattleLeaderboardTable } from './BattleLeaderboardTable'
import {
  ArrowLeft,
  Users,
  Crown,
  Clock,
  Swords,
  CheckCircle2,
  Code2,
  ShieldAlert,
  Loader2,
  Zap,
  Award,
  AlertTriangle,
  Timer,
  Scale,
  FileText,
  ChevronRight,
  Trophy,
  Lock,
} from 'lucide-react'

function formatCountdown(ms: number) {
  if (ms <= 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

interface BattleLobbyViewProps {
  battleId: string
  userId?: string
  onExit: () => void
}

export const BattleLobbyView: React.FC<BattleLobbyViewProps> = ({
  battleId,
  userId,
  onExit,
}) => {
  const { access, battle, exercises, teamMembers, teamProgress, teamScore, loading, refreshLobby } = useBattleLobby(battleId, userId)
  const { leaderboard } = useBattleLeaderboard(battleId)
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0)
  const [arenaTab, setArenaTab] = useState<'workspace' | 'leaderboard'>('workspace')
  const [now, setNow] = useState(() => Date.now())

  // Refresh clock every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto finalize rankings on match conclusion
  useEffect(() => {
    if (battle?.effective_status === 'ended') {
      finalizeBattleRankings(battleId)
    }
  }, [battle?.effective_status, battleId])

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-24 gap-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <div className="font-pixel text-xs text-slate-500 uppercase">
          Verifying Squad Battle Clearance & Access Protocols...
        </div>
      </div>
    )
  }

  // Case A: Access Blocked
  if (!access || !access.allowed) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6 text-left animate-in fade-in duration-200">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Battles Arena</span>
        </button>

        <div className="p-8 bg-white rounded-3xl border-2 border-rose-200 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-md">
            <h2 className="font-pixel text-base font-bold text-slate-900 uppercase">
              Battle Clearance Restricted
            </h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {access?.reason || 'Your squad has not been granted clearance to participate in this battle.'}
            </p>
          </div>

          {access?.is_late_join && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 max-w-md font-medium text-left">
              ⚠️ <strong>Late-Join Protection:</strong> Competitive integrity rules prohibit students from joining squads after a battle begins.
            </div>
          )}

          <GamifiedButton variant="secondary" size="md" onClick={onExit} className="mt-2">
            Return to Team Arcade
          </GamifiedButton>
        </div>
      </div>
    )
  }

  if (!battle) {
    return (
      <div className="w-full max-w-4xl mx-auto p-12 text-center flex flex-col items-center gap-4">
        <div className="font-pixel text-slate-600">Battle not found.</div>
        <GamifiedButton variant="secondary" size="sm" onClick={onExit}>
          Back to Battles
        </GamifiedButton>
      </div>
    )
  }

  const startMs = new Date(battle.start_time).getTime()
  const endMs = new Date(battle.end_time).getTime()
  const isUpcoming = now < startMs
  const isLive = now >= startMs && now <= endMs
  const isEnded = now > endMs

  const timeToStart = Math.max(0, startMs - now)
  const timeToEnd = Math.max(0, endMs - now)

  const activeExercise: BattleExercise | undefined = exercises[selectedExerciseIndex]
  const myLeaderboardEntry = leaderboard.find((e) => e.team_id === access?.team_id)

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-16 text-left animate-in fade-in duration-200">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            type="button"
            onClick={onExit}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
            title="Return to Team Arcade"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-pixel font-bold uppercase ${
                  isLive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isUpcoming
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isLive ? '🔴 LIVE ARENA' : isUpcoming ? '⏳ PRE-BATTLE LOBBY' : '🏁 CONCLUDED'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                #{battle.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-sans tracking-tight mt-1">
              {battle.title}
            </h1>
          </div>
        </div>

        {/* Squad Status Tag */}
        <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100 shrink-0">
          <Users className="w-4 h-4 text-purple-600" />
          <div>
            <div className="text-[10px] font-bold uppercase text-purple-900 font-pixel">
              Squad: {access.team_name}
            </div>
            <div className="text-[10px] text-purple-600 font-mono">
              {teamMembers.length} Operatives Ready
            </div>
          </div>
        </div>
      </div>

      {/* STATE 1: UPCOMING / PRE-MATCH COUNTDOWN LOBBY */}
      {isUpcoming && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Main Hero Countdown Card */}
          <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white shadow-xl border-2 border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-[10px] font-pixel uppercase font-bold text-purple-200 w-fit">
                <Clock className="w-3.5 h-3.5" />
                <span>Match Commences In</span>
              </div>
              <div className="text-4xl sm:text-6xl font-black font-mono tracking-widest text-amber-300 drop-shadow-md">
                {formatCountdown(timeToStart)}
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Assemble with your squad members. Once the countdown expires, the live coding arena unlocks automatically.
              </p>
            </div>

            {/* Battle Readiness Checklist */}
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex flex-col gap-2.5 min-w-[240px]">
              <div className="text-[11px] font-pixel uppercase font-bold text-purple-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deployment Clearance</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Squad Registration</span>
                <span className="font-bold text-emerald-400 font-pixel text-[10px]">VERIFIED ✓</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Roster Lock</span>
                <span className="font-bold text-emerald-400 font-pixel text-[10px]">ACTIVE ✓</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Questions Configured</span>
                <span className="font-bold text-amber-300 font-pixel text-[10px]">
                  {exercises.length} QUESTS
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Arena Duration</span>
                <span className="font-bold text-purple-200 font-mono">
                  {battle.duration_minutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Squad Roster & Battle Briefing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Squad Roster (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-xs font-bold uppercase text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Squad Roster ({teamMembers.length})</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">All in Lobby</span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
                {teamMembers.map((member) => {
                  const isCap = member.user_id === access.team_id // or checked via captain_id
                  const isCurrent = member.user_id === userId
                  const name = member.profile?.full_name || member.profile?.username || 'Squad Operative'

                  return (
                    <div
                      key={member.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                          <AlexPixelAvatar className="w-7 h-7" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {name}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Lvl {member.profile?.level ?? 1} • {member.profile?.xp ?? 0} XP
                          </div>
                        </div>
                      </div>

                      {isCap ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-pixel font-bold flex items-center gap-1 shrink-0">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>Captain</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono shrink-0">
                          Operative
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Briefing, Rules, and Scoring Parameters (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h3 className="font-pixel text-xs font-bold uppercase text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Battle Protocol & Rules</span>
              </h3>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
                {battle.description && (
                  <div className="text-xs text-slate-600 leading-relaxed font-medium">
                    {battle.description}
                  </div>
                )}

                {battle.rules && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {battle.rules}
                  </div>
                )}

                {/* Scoring Matrix Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 flex flex-col">
                    <span className="text-[10px] text-purple-600 font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" /> Base Score
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      +{battle.base_points} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex flex-col">
                    <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Max Speed
                    </span>
                    <span className="font-bold text-amber-800 font-mono text-xs">
                      +{battle.speed_bonus_max} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex flex-col">
                    <span className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Penalty
                    </span>
                    <span className="font-bold text-rose-800 font-mono text-xs">
                      -{battle.wrong_answer_penalty} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex flex-col">
                    <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                      <Timer className="w-3 h-3" /> Cooldown
                    </span>
                    <span className="font-bold text-blue-800 font-mono text-xs">
                      {battle.submission_cooldown_seconds}s
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Tie-breaker: <strong>{battle.tie_breaker_rule.replace(/_/g, ' ')}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: LIVE BATTLE ARENA (QUESTIONS AVAILABLE IN EXACT DETERMINISTIC SEQUENCE) */}
      {(isLive || isEnded) && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
          {/* Live Status Banner */}
          <div
            className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isLive
                ? 'bg-linear-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white border-emerald-700 shadow-lg'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl ${
                  isLive ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-200 text-slate-600'
                }`}
              >
                <Swords className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-pixel text-base font-bold uppercase tracking-wide">
                    {isLive ? 'Live Competition Arena Active' : 'Battle Match Concluded'}
                  </h2>
                  {isLive && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <p className="text-xs opacity-80 mt-0.5">
                  {isLive
                    ? 'All squads have been issued identical coding challenges in deterministic sequence.'
                    : 'The competition window has closed.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Live Squad Score Badge */}
              <div className="flex items-center gap-2.5 bg-black/30 px-4 py-2 rounded-2xl border border-white/10 shrink-0">
                <Trophy className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[9px] uppercase font-bold text-amber-300 font-pixel">
                    Squad Score
                  </div>
                  <div className="text-lg font-black font-mono tracking-wider text-amber-100">
                    {teamScore} pts
                  </div>
                </div>
              </div>

              {isLive && (
                <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-2xl border border-white/10 shrink-0">
                  <Timer className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-[9px] uppercase font-bold text-emerald-300 font-pixel">
                      Time Remaining
                    </div>
                    <div className="text-lg font-black font-mono tracking-wider text-emerald-100">
                      {formatCountdown(timeToEnd)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Triumphant Match Outcome Card if Battle is Ended */}
          {isEnded && (
            <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border-2 border-amber-400 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 font-pixel text-xl font-bold flex items-center justify-center shrink-0 border-2 border-amber-500 shadow-sm">
                  {myLeaderboardEntry ? `#${myLeaderboardEntry.rank}` : '🏆'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-xs text-amber-800 uppercase font-bold">
                      Official Battle Outcome
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-pixel text-[9px] uppercase">
                      Scores Finalized & Locked
                    </span>
                  </div>
                  <h3 className="font-black text-xl text-slate-900 font-sans tracking-tight mt-0.5">
                    {myLeaderboardEntry && myLeaderboardEntry.rank === 1
                      ? '🥇 Champions! Your Squad Claimed 1st Place!'
                      : myLeaderboardEntry && myLeaderboardEntry.rank <= 3
                      ? `🏅 Podium Finish! Rank #${myLeaderboardEntry.rank} in the Arena!`
                      : myLeaderboardEntry
                      ? `Rank #${myLeaderboardEntry.rank} of ${leaderboard.length} Squads`
                      : 'Battle Match Concluded'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Final Squad Score: <strong className="text-purple-700">{teamScore} points</strong> • Quests Solved: <strong className="text-emerald-700">{teamProgress.filter((p) => p.status === 'completed').length} of {exercises.length}</strong>
                  </p>
                </div>
              </div>

              <GamifiedButton
                variant="primary"
                size="sm"
                onClick={() => setArenaTab('leaderboard')}
                className="self-start sm:self-center"
              >
                <Trophy className="w-4 h-4 mr-1 text-amber-300" />
                <span>View Official Standings</span>
              </GamifiedButton>
            </div>
          )}

          {/* Arena Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setArenaTab('workspace')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                arenaTab === 'workspace'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>Quest Workspace ({exercises.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setArenaTab('leaderboard')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                arenaTab === 'leaderboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{isEnded ? 'Final Standings & Results' : 'Live Leaderboard'} ({leaderboard.length})</span>
              {isLive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </button>
          </div>

          {/* TAB 1: WORKSPACE */}
          {arenaTab === 'workspace' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Deterministic Question Sequence Tabs (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs font-bold uppercase text-slate-900 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <span>Ordered Quests</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                    {exercises.length} Total
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {exercises.map((ex, idx) => {
                    const isSelected = idx === selectedExerciseIndex
                    const progressItem = teamProgress.find((p) => p.exercise_id === ex.exercise_id)
                    const isCompleted = progressItem?.status === 'completed'
                    const isLocked = progressItem?.status === 'locked'

                    return (
                      <button
                        key={ex.id}
                        type="button"
                        disabled={isLocked}
                        onClick={() => !isLocked && setSelectedExerciseIndex(idx)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                          isLocked
                            ? 'bg-slate-50/60 border-slate-200/60 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-purple-50/80 border-purple-500 shadow-xs cursor-pointer'
                            : isCompleted
                            ? 'bg-emerald-50/50 border-emerald-300 hover:border-emerald-400 cursor-pointer'
                            : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-xl font-pixel text-xs font-bold flex items-center justify-center shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isLocked
                                ? 'bg-slate-200 text-slate-400'
                                : isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isCompleted ? '✓' : isLocked ? <Lock className="w-3.5 h-3.5" /> : `#${idx + 1}`}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs truncate">
                              {ex.challenge?.title || `Quest #${idx + 1}`}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {isCompleted ? (
                                <span className="text-emerald-700 font-bold">Solved (+{progressItem?.score_awarded} pts)</span>
                              ) : isLocked ? (
                                <span className="text-slate-400">Locked (Solve Quest #{idx} first)</span>
                              ) : (
                                <span>{ex.challenge?.language || 'Algorithm'} • 100 pts base</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isSelected ? 'text-purple-600 translate-x-0.5' : isCompleted ? 'text-emerald-500' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Right: Real-time Collaborative Workspace (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {activeExercise && access.team_id ? (
                  <BattleCollabWorkspace
                    key={`${battle.id}_${access.team_id}_${activeExercise.exercise_id}`}
                    battleId={battle.id}
                    teamId={access.team_id}
                    exercise={activeExercise}
                    isLive={isLive}
                    progress={teamProgress.find((p) => p.exercise_id === activeExercise.exercise_id)}
                    onQuestCompleted={() => {
                      refreshLobby()
                    }}
                    onNextQuest={() => {
                      if (selectedExerciseIndex < exercises.length - 1) {
                        setSelectedExerciseIndex(selectedExerciseIndex + 1)
                      }
                    }}
                  />
                ) : (
                  <div className="p-12 text-center text-slate-400 font-pixel text-xs bg-white rounded-3xl border border-slate-200">
                    Select a quest from the left to open the squad coding workspace.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE LEADERBOARD & FINAL RESULTS */}
          {arenaTab === 'leaderboard' && (
            <BattleLeaderboardTable
              entries={leaderboard}
              myTeamId={access?.team_id}
              isEnded={isEnded}
            />
          )}
        </div>
      )}
    </div>
  )
}
