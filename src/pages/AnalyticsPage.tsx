import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLeaderboard, type LeaderboardPeriod } from '../lib/leaderboard'
import { useLearningProgress } from '../lib/learning'
import { useGamification } from '../lib/gamification'
import { useAchievementsAndNotifications } from '../lib/achievements'
import { GamifiedCard } from '../components/ui/GamifiedCard'
import {
  TrendingUp,
  BarChart3,
  Award,
  Zap,
  CheckCircle2,
  Medal,
  Calendar,
} from 'lucide-react'

const TRACK_COLORS: Record<string, string> = {
  JavaScript: 'bg-amber-400',
  React: 'bg-sky-400',
  Python: 'bg-emerald-500',
  Backend: 'bg-purple-500',
}

export const AnalyticsPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [period, setPeriod] = useState<LeaderboardPeriod>('all_time')
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard(user?.id, 10, period)
  const { courses, loading: coursesLoading } = useLearningProgress(user?.id)
  const { stats, loading: statsLoading } = useGamification(user?.id, profile?.xp, profile?.streak, profile?.level)
  const { activities, loading: activitiesLoading } = useAchievementsAndNotifications(user?.id)

  const isLoading = coursesLoading || statsLoading || leaderboardLoading || activitiesLoading

  // Compute real learning statistics
  const totalCompletedLessons = courses.reduce((acc, c) => acc + c.completedLessons, 0)
  const activeQuestsCount = courses.filter((c) => c.isEnrolled && c.progressPercent < 100).length

  // Group real course progress by track for Skill Matrix
  const trackMap = new Map<string, { total: number; completed: number }>()
  courses.forEach((c) => {
    const track = c.course.track || 'General'
    const curr = trackMap.get(track) || { total: 0, completed: 0 }
    curr.total += c.totalLessons
    curr.completed += c.completedLessons
    trackMap.set(track, curr)
  })

  const skills = Array.from(trackMap.entries()).map(([track, { total, completed }]) => {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    const trackXp = completed * 50
    return {
      name: track,
      level: percent,
      color: TRACK_COLORS[track] || 'bg-emerald-500',
      xp: `${trackXp.toLocaleString()} XP`,
    }
  })

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-12 animate-pulse text-left">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-200/70 rounded-3xl" />
          <div className="h-28 bg-slate-200/70 rounded-3xl" />
          <div className="h-28 bg-slate-200/70 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200/70 rounded-3xl" />
          <div className="h-72 bg-slate-200/70 rounded-3xl" />
        </div>
        <div className="h-44 bg-slate-200/70 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-12 text-left">
      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GamifiedCard accentColor="purple" className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Zap className="w-6 h-6 fill-purple-500" />
          </div>
          <div>
            <div className="text-[10px] font-pixel text-slate-400 uppercase font-bold">Total Power & Level</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">Level {stats.level}</div>
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{stats.xp.toLocaleString()} Total XP</span>
            </div>
          </div>
        </GamifiedCard>

        <GamifiedCard accentColor="emerald" className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-pixel text-slate-400 uppercase font-bold">Lessons Solved</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{totalCompletedLessons} Lessons</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{activeQuestsCount} quests in progress</div>
          </div>
        </GamifiedCard>

        <GamifiedCard accentColor="amber" className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-pixel text-slate-400 uppercase font-bold">Coding Streak</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.streak} Days</div>
            <div className="text-xs text-amber-600 font-bold mt-0.5">
              Daily Goal: {stats.dailyXpEarned}/{stats.dailyGoalXp} XP
            </div>
          </div>
        </GamifiedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Matrix */}
        <GamifiedCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">Skill Matrix</h3>
            </div>
            <span className="text-xs font-pixel text-slate-400 font-bold">TRACK PROGRESS</span>
          </div>

          {skills.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-pixel text-[10px]">
              NO TRACK ENROLLMENTS YET
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-800">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px]">{skill.xp}</span>
                      <span className="text-emerald-700 font-pixel">{skill.level}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className={`h-full ${skill.color} rounded-full transition-all duration-700`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GamifiedCard>

        {/* Global Leaderboard */}
        <GamifiedCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">Leaderboard</h3>
            </div>
            
            {/* Period Selector Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              {(['all_time', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg font-pixel text-[9px] uppercase font-bold transition-all cursor-pointer ${
                    period === p
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {p === 'all_time' ? 'All Time' : p === 'weekly' ? 'Weekly' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-pixel text-[10px]">
                NO ADVENTURERS RANKED YET
              </div>
            ) : (
              leaderboard.map((player) => (
                <div
                  key={`${player.id}-${player.rank}`}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    player.isCurrent
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20'
                      : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-pixel font-bold text-slate-400 w-6">
                      {player.badge || `#${player.rank}`}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{player.name}</span>
                        {player.isCurrent && (
                          <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-pixel text-[8px] rounded uppercase font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">{player.title}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-pixel font-bold text-amber-600">{player.xp}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Lvl {player.level}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GamifiedCard>
      </div>

      {/* Activity History Graph */}
      <GamifiedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-emerald-600" />
            <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">Recent Activity Stream</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {activities.length} recorded actions
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-pixel text-[10px]">
            NO ACTIVITY RECORDED YET
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-medium text-slate-700">{act.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">{act.createdAt}</span>
              </div>
            ))}
          </div>
        )}
      </GamifiedCard>
    </div>
  )
}
