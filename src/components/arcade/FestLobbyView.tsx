import React, { useState } from 'react'
import {
  useFestLobby,
  useFestSquadScore,
  useFestLeaderboard,
  type ArcadeFest,
  type ArcadeTeam,
  type ArcadeTeamMember,
} from '../../lib/arcade'
import { CodeExerciseEditor } from '../learning/CodeExerciseEditor'
import { GamifiedCard } from '../ui/GamifiedCard'
import { GamifiedButton } from '../ui/GamifiedButton'
import { AlexPixelAvatar } from '../brand/PixelArtAvatars'
import {
  ArrowLeft,
  Users,
  Crown,
  Clock,
  Lock,
  Swords,
  AlertCircle,
  CheckCircle2,
  Code2,
  Sparkles,
  ShieldAlert,
  Loader2,
  Calendar,
  Zap,
  Trophy,
} from 'lucide-react'

function formatDateTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return dateStr
  }
}

interface FestLobbyViewProps {
  fest: ArcadeFest
  team: ArcadeTeam | null
  members: ArcadeTeamMember[]
  userId?: string
  onExit: () => void
}

export const FestLobbyView: React.FC<FestLobbyViewProps> = ({
  fest,
  team,
  members,
  userId,
  onExit,
}) => {
  const {
    access,
    challenges,
    activeChallenge,
    setActiveChallenge,
    loading: lobbyLoading,
  } = useFestLobby(fest.id, userId)

  const effectiveTeamId = access?.team_id || team?.id || null
  const { squadScore, refreshScore } = useFestSquadScore(fest.id, effectiveTeamId, userId)
  const { leaderboard } = useFestLeaderboard(fest.id)

  const [activeArenaTab, setActiveArenaTab] = useState<'challenges' | 'leaderboard'>('challenges')

  if (lobbyLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-24 gap-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <div className="font-pixel text-xs text-stone-500 uppercase">
          VERIFYING SQUAD COMPETITION CLEARANCE...
        </div>
      </div>
    )
  }

  // Case A: Access Blocked by Security / Rules
  if (!access || !access.allowed) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6 text-left animate-in fade-in duration-200">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-bold text-xs transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fest Arena</span>
        </button>

        <div className="p-8 rounded-3xl bg-rose-50 border-2 border-rose-300 flex flex-col items-center text-center gap-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-rose-600 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <h2 className="text-2xl font-black text-rose-950 font-sans tracking-tight">
              Competition Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-rose-800 font-sans leading-relaxed">
              {access?.reason || 'You do not have authorization to enter this fest lobby.'}
            </p>
          </div>

          {access?.is_late_join && (
            <div className="p-4 rounded-2xl bg-white/80 border border-rose-200 text-xs text-stone-700 max-w-md text-left flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                To maintain competitive fairness, students cannot join squads after a fest has commenced. You may participate in the next upcoming scheduled fest!
              </span>
            </div>
          )}

          <GamifiedButton variant="primary" size="md" onClick={onExit} className="mt-2">
            Return to Team Arcade
          </GamifiedButton>
        </div>
      </div>
    )
  }

  const isLive = access.can_enter_live || access.effective_status === 'live'
  const isUpcoming = access.effective_status === 'upcoming'

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-16 text-left animate-in fade-in duration-200">
      {/* 1. TOP NAV & STATUS BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-bold text-xs transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Lobby to Arena</span>
        </button>

        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-700 font-pixel text-[10px] font-bold uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              LIVE COMPETITION IN PROGRESS
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-pixel text-[10px] font-bold uppercase">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              FEST LOBBY • UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* 2. FEST INFORMATION HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-stone-900 via-stone-800 to-stone-900 text-white shadow-xl border-2 border-stone-700 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-emerald-400 font-pixel text-[10px] uppercase font-bold tracking-wider">
            <Swords className="w-3.5 h-3.5" />
            <span>Competitive Match Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
            {fest.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-sans max-w-3xl leading-relaxed">
            {fest.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-stone-800 text-xs font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Start: {formatDateTime(fest.start_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>End: {formatDateTime(fest.end_time)}</span>
          </div>
        </div>
      </div>

      {/* 3. SQUAD ROSTER & REAL-TIME SCORING CARD */}
      <GamifiedCard accentColor="emerald" className="p-6 flex flex-col gap-5 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-stone-900 font-sans">
                  {access.team_name || team?.name || 'Your Squad'}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  CODE: {access.team_code || team?.code}
                </span>
              </div>
              <span className="text-[11px] text-stone-400">
                Registered Squad ({members.length} / 4 Members Active)
              </span>
            </div>
          </div>

          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold font-sans flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Squad Confirmed & Eligible
          </span>
        </div>

        {/* Real-time Squad Score Aggregation Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-pixel uppercase font-bold text-stone-400">
              YOUR FEST SCORE
            </span>
            <span className="text-xl font-black font-mono text-emerald-700">
              {squadScore?.my_score ?? 0} pts
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-pixel uppercase font-bold text-stone-400">
              SQUAD AVERAGE SCORE
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black font-mono text-stone-900">
                {squadScore?.team_average_score ?? 0} pts
              </span>
              <span className="text-[10px] text-stone-400 font-medium font-sans">
                (across {squadScore?.member_count ?? members.length} members)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-pixel uppercase font-bold text-stone-400">
              TOTAL SQUAD POINTS
            </span>
            <span className="text-xl font-black font-mono text-amber-700">
              {squadScore?.team_total_score ?? 0} pts
            </span>
          </div>
        </div>

        {/* Member list with individual scores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {members.map((m) => {
            const isMemberCaptain = m.role === 'captain'
            const isSelf = m.user_id === userId
            const memberScore =
              squadScore?.member_scores?.find((ms) => ms.user_id === m.user_id)?.score ?? 0

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 ${
                  isSelf
                    ? 'bg-emerald-50/50 border-emerald-300'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlexPixelAvatar size={36} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-stone-900 truncate">
                        {m.profile?.full_name || m.profile?.username || 'Teammate'}
                      </span>
                      {isMemberCaptain && (
                        <span title="Captain">
                          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">
                      LVL {m.profile?.level || 1} • {isSelf ? 'You' : 'Teammate'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-[10px] text-stone-400 font-sans">Fest Points</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                    {memberScore} pts
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </GamifiedCard>

      {/* 4. ARENA / CHALLENGES & LEADERBOARD TABS */}
      {isLive ? (
        <div className="flex flex-col gap-6">
          {/* Arena Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveArenaTab('challenges')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeArenaTab === 'challenges'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Coding Challenges ({challenges.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveArenaTab('leaderboard')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeArenaTab === 'leaderboard'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Live Squad Leaderboard ({leaderboard.length})</span>
            </button>
          </div>

          {/* TAB CONTENT A: CODING CHALLENGES */}
          {activeArenaTab === 'challenges' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-black text-stone-900 font-sans tracking-tight">
                    Fest Coding Challenges ({challenges.length})
                  </h2>
                </div>
                <span className="text-xs text-stone-500 font-mono">
                  Live Match Window Active
                </span>
              </div>

              {/* Challenge Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {challenges.map((fc, index) => {
                  const isSelected = activeChallenge?.id === fc.id
                  return (
                    <button
                      key={fc.id}
                      type="button"
                      onClick={() => setActiveChallenge(fc)}
                      className={`px-4 py-2.5 rounded-2xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                        isSelected
                          ? 'bg-stone-900 text-white shadow-sm scale-102'
                          : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      <Code2 className="w-4 h-4 text-emerald-500" />
                      <span>
                        Challenge {index + 1}: {fc.challenges.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-stone-700/40 text-[10px] font-mono text-amber-300">
                        +{fc.points} pts
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Active Challenge Editor Container */}
              {activeChallenge && (
                <div className="bg-white rounded-3xl border border-[#ece7df] shadow-sm overflow-hidden p-6 flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-pixel font-bold uppercase">
                          {activeChallenge.challenges.difficulty}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-mono font-bold uppercase">
                          {activeChallenge.challenges.language}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-700">
                          {activeChallenge.points} Points
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-stone-900 font-sans tracking-tight">
                        {activeChallenge.challenges.title}
                      </h3>
                    </div>
                  </div>

                  {/* Mounted Existing Reusable CodeExerciseEditor */}
                  <CodeExerciseEditor
                    challengeId={activeChallenge.challenge_id}
                    title={activeChallenge.challenges.title}
                    instructions={activeChallenge.challenges.instructions}
                    description={activeChallenge.challenges.description}
                    starterCode={activeChallenge.challenges.starter_code}
                    language={activeChallenge.challenges.language}
                    hints={activeChallenge.challenges.hints}
                    solutionExplanation={activeChallenge.challenges.solution_explanation}
                    onSubmitAttempt={() => {
                      refreshScore()
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT B: LIVE SQUAD LEADERBOARD */}
          {activeArenaTab === 'leaderboard' && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-lg text-stone-900 font-sans tracking-tight">
                    Live Squad Standings
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-pixel text-rose-700 font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  REALTIME LEADERBOARD
                </div>
              </div>

              {leaderboard.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white border-2 border-dashed border-stone-200 text-center flex flex-col items-center gap-3">
                  <Trophy className="w-10 h-10 text-stone-300" />
                  <span className="text-sm font-bold text-stone-700 font-sans">
                    Awaiting Squad Results
                  </span>
                  <p className="text-xs text-stone-400 max-w-sm">
                    No squads have recorded scores for this fest yet. Conquer challenges to put your squad on the board!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {leaderboard.map((entry) => {
                    const isCurrentTeam = entry.team_id === effectiveTeamId
                    const isFirst = entry.rank === 1
                    const isSecond = entry.rank === 2
                    const isThird = entry.rank === 3

                    return (
                      <div
                        key={entry.team_id}
                        className={`p-4 sm:p-5 rounded-3xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          isCurrentTeam
                            ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank Badge */}
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 border-2 ${
                              isFirst
                                ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                                : isSecond
                                ? 'bg-stone-100 border-stone-300 text-stone-800'
                                : isThird
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-stone-50 border-stone-200 text-stone-600 font-mono'
                            }`}
                          >
                            {isFirst ? '🥇 #1' : isSecond ? '🥈 #2' : isThird ? '🥉 #3' : `#${entry.rank}`}
                          </div>

                          {/* Team Info */}
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-base text-stone-900 truncate">
                                {entry.team_name}
                              </span>
                              <span className="font-mono text-[10px] text-stone-400">
                                ({entry.team_code})
                              </span>
                              {isCurrentTeam && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-pixel text-[9px] font-bold uppercase">
                                  YOUR SQUAD
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-stone-400 font-sans">
                              {entry.member_count} {entry.member_count === 1 ? 'member' : 'members'} • Total: {entry.team_total_score} pts
                            </span>
                          </div>
                        </div>

                        {/* Team Score */}
                        <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                          <span className="text-[10px] font-pixel text-stone-400 uppercase font-bold tracking-wider sm:text-right">
                            TEAM SCORE (AVERAGE)
                          </span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700 tracking-tight">
                            {entry.team_average_score}{' '}
                            <span className="text-xs font-sans text-emerald-600 font-bold">pts</span>
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : isUpcoming ? (
        /* UPCOMING STATE: LOBBY COUNTDOWN & LOCKED CHALLENGES PREVIEW */
        <div className="p-8 rounded-3xl bg-amber-50/70 border-2 border-amber-200 flex flex-col items-center text-center gap-6 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
            <Clock className="w-7 h-7 animate-pulse" />
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <h2 className="text-2xl font-black text-amber-950 font-sans tracking-tight">
              Pre-Fest Briefing & Waiting Room
            </h2>
            <p className="text-xs sm:text-sm text-amber-800 font-sans leading-relaxed">
              Your squad is enrolled and in position! The competition arena, interactive challenges, and live leaderboard will automatically unlock when the match starts.
            </p>
          </div>

          {/* Scheduled Challenges Preview List */}
          <div className="w-full max-w-md bg-white rounded-2xl border border-amber-200/80 p-4 flex flex-col gap-3 text-left">
            <span className="text-[10px] font-pixel uppercase font-bold text-stone-400 tracking-wider">
              SCHEDULED CHALLENGES ({challenges.length})
            </span>
            <div className="flex flex-col gap-2">
              {challenges.map((fc, idx) => (
                <div
                  key={fc.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 font-bold text-stone-800">
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {idx + 1}. {fc.challenges.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">
                    {fc.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Keep this window open or return when the countdown reaches zero.</span>
          </div>
        </div>
      ) : (
        /* ENDED STATE WITH FINAL LEADERBOARD */
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-stone-100 border-2 border-stone-300 flex flex-col items-center text-center gap-2">
            <Lock className="w-8 h-8 text-stone-400" />
            <h2 className="text-xl font-black text-stone-800 font-sans">
              Fest Concluded • Final Standings
            </h2>
            <p className="text-xs text-stone-500 max-w-md">
              The competition window for this fest has ended. Final scores and rankings are locked.
            </p>
          </div>

          {/* Final Standings List */}
          <div className="flex flex-col gap-3">
            {leaderboard.map((entry) => {
              const isCurrentTeam = entry.team_id === effectiveTeamId
              return (
                <div
                  key={entry.team_id}
                  className={`p-4 rounded-3xl border-2 flex items-center justify-between gap-4 ${
                    isCurrentTeam
                      ? 'bg-emerald-50/70 border-emerald-400'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-stone-700 text-xs">
                      #{entry.rank}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-stone-900">
                        {entry.team_name}
                      </span>
                      <div className="text-[11px] text-stone-400">
                        {entry.member_count} members • Total: {entry.team_total_score} pts
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-emerald-800">
                      {entry.team_average_score} pts
                    </div>
                    <div className="text-[10px] text-stone-400 font-pixel uppercase">
                      Final Score
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
