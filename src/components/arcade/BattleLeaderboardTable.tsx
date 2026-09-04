import React from 'react'
import { type BattleLeaderboardEntry } from '../../lib/arcade'
import { Trophy, Crown, Medal } from 'lucide-react'

interface BattleLeaderboardTableProps {
  entries: BattleLeaderboardEntry[]
  myTeamId?: string
  isEnded?: boolean
}

export const BattleLeaderboardTable: React.FC<BattleLeaderboardTableProps> = ({
  entries,
  myTeamId,
  isEnded = false,
}) => {
  if (entries.length === 0) {
    return (
      <div className="p-10 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-3">
        <Trophy className="w-10 h-10 text-slate-300" />
        <span className="text-sm font-bold text-slate-700 font-sans">
          Awaiting Battle Results
        </span>
        <p className="text-xs text-slate-400 max-w-sm">
          No participating squads have registered scores yet. Solve battle quests to claim the top of the leaderboard!
        </p>
      </div>
    )
  }

  const topThree = entries.slice(0, 3)

  return (
    <div className="flex flex-col gap-6 text-left animate-in fade-in duration-200">
      {/* 1. PODIUM DISPLAY (TOP 3 SQUADS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
        {/* 2nd Place */}
        {topThree[1] && (
          <div
            className={`order-2 md:order-1 p-5 rounded-3xl border bg-slate-50 flex flex-col items-center text-center gap-2.5 relative transition-all shadow-xs ${
              topThree[1].team_id === myTeamId ? 'ring-2 ring-purple-500 bg-purple-50/50' : 'border-slate-200'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 font-pixel text-sm font-bold flex items-center justify-center shrink-0 border border-slate-300">
              #2
            </div>
            <Medal className="w-6 h-6 text-slate-400" />
            <div>
              <div className="font-bold text-slate-900 text-sm font-sans flex items-center justify-center gap-1">
                <span>{topThree[1].team_name}</span>
                {topThree[1].team_id === myTeamId && (
                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-pixel">
                    YOU
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {topThree[1].quests_completed} of {topThree[1].total_quests} quests
              </div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-200/80 font-mono font-black text-xs text-slate-800 border border-slate-300">
              {topThree[1].team_total_score} pts
            </div>
          </div>
        )}

        {/* 1st Place (Center, Elevated) */}
        {topThree[0] && (
          <div
            className={`order-1 md:order-2 p-6 rounded-3xl border bg-linear-to-b from-amber-50 to-amber-100/50 border-amber-300 flex flex-col items-center text-center gap-3 relative transition-all shadow-md ${
              topThree[0].team_id === myTeamId ? 'ring-3 ring-purple-500' : ''
            }`}
          >
            <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-amber-500 text-white font-pixel text-[10px] font-bold uppercase shadow-sm flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-100" />
              <span>{isEnded ? 'Match Winner' : '1st Leader'}</span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 font-pixel text-base font-bold flex items-center justify-center shrink-0 shadow-sm border border-amber-500">
              #1
            </div>
            <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
            <div>
              <div className="font-black text-slate-900 text-base font-sans flex items-center justify-center gap-1.5">
                <span>{topThree[0].team_name}</span>
                {topThree[0].team_id === myTeamId && (
                  <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[9px] font-pixel">
                    YOUR SQUAD
                  </span>
                )}
              </div>
              <div className="text-xs text-amber-800 font-mono mt-0.5 font-bold">
                {topThree[0].quests_completed} of {topThree[0].total_quests} quests completed
              </div>
            </div>
            <div className="px-4 py-1.5 rounded-2xl bg-amber-400 font-mono font-black text-sm text-amber-950 shadow-xs border border-amber-500">
              {topThree[0].team_total_score} pts
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div
            className={`order-3 p-5 rounded-3xl border bg-amber-50/40 flex flex-col items-center text-center gap-2.5 relative transition-all shadow-xs ${
              topThree[2].team_id === myTeamId ? 'ring-2 ring-purple-500 bg-purple-50/50' : 'border-amber-200'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-800 font-pixel text-sm font-bold flex items-center justify-center shrink-0 border border-amber-300">
              #3
            </div>
            <Medal className="w-6 h-6 text-amber-600" />
            <div>
              <div className="font-bold text-slate-900 text-sm font-sans flex items-center justify-center gap-1">
                <span>{topThree[2].team_name}</span>
                {topThree[2].team_id === myTeamId && (
                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-pixel">
                    YOU
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {topThree[2].quests_completed} of {topThree[2].total_quests} quests
              </div>
            </div>
            <div className="px-3 py-1 rounded-xl bg-amber-100 font-mono font-black text-xs text-amber-900 border border-amber-200">
              {topThree[2].team_total_score} pts
            </div>
          </div>
        )}
      </div>

      {/* 2. FULL STANDINGS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-pixel text-xs font-bold uppercase text-slate-800">
              {isEnded ? 'Official Final Rankings' : 'Live Battle Standings'}
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-pixel text-[9px] font-bold uppercase">
            {entries.length} Participating Squads
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 border-b border-slate-200 font-pixel text-[10px] text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">Squad</th>
                <th className="py-3 px-4 text-center">Quests</th>
                <th className="py-3 px-4 text-center">Bonus / Penalties</th>
                <th className="py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => {
                const isSelf = entry.team_id === myTeamId

                return (
                  <tr
                    key={entry.team_id}
                    className={`transition-colors ${
                      isSelf ? 'bg-purple-50/70 font-semibold' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-pixel text-xs font-bold ${
                          entry.rank === 1
                            ? 'bg-amber-400 text-amber-950 shadow-xs'
                            : entry.rank === 2
                            ? 'bg-slate-200 text-slate-700'
                            : entry.rank === 3
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                    </td>

                    {/* Squad Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs font-sans">
                              {entry.team_name}
                            </span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white font-pixel text-[8px]">
                                YOUR SQUAD
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {entry.team_code} • {entry.member_count} Operatives
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Quests Completed */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-mono text-[11px] font-bold border border-emerald-200">
                        {entry.quests_completed} / {entry.total_quests}
                      </span>
                    </td>

                    {/* Breakdown (Speed Bonus / Attempts) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 font-mono text-[10px]">
                        <span className="text-emerald-600 font-bold" title="Total Speed Bonus">
                          +{entry.total_speed_bonus}⚡
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-rose-600 font-bold" title="Total Submissions / Attempts">
                          {entry.total_attempts} attempts
                        </span>
                      </div>
                    </td>

                    {/* Total Score */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-sm text-purple-900">
                        {entry.team_total_score} pts
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
