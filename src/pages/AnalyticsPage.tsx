import React from 'react'
import { useAuth } from '../context/AuthContext'
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

export const AnalyticsPage: React.FC = () => {
  const { user, profile, role } = useAuth()

  const skills = [
    { name: 'JavaScript & Web Core', level: 85, color: 'bg-amber-400', xp: '1,450 XP' },
    { name: 'React & Component Architecture', level: 70, color: 'bg-sky-400', xp: '1,200 XP' },
    { name: 'Python & Data Structures', level: 60, color: 'bg-emerald-500', xp: '950 XP' },
    { name: 'Backend & Supabase Auth', level: 90, color: 'bg-purple-500', xp: '1,600 XP' },
  ]

  const leaderboard = [
    { rank: 1, name: 'Sora Tanaka', title: 'Grandmaster Coder', xp: '12,450 XP', level: 28, badge: '🥇' },
    { rank: 2, name: 'Elena Rostova', title: 'Algorithm Wizard', xp: '9,820 XP', level: 22, badge: '🥈' },
    { rank: 3, name: 'Alex Rivers', title: 'React Trailblazer', xp: '7,400 XP', level: 16, badge: '🥉' },
    {
      rank: 4,
      name: profile?.username || user?.email?.split('@')[0] || 'You (Current Player)',
      title: role === 'admin' ? 'System Administrator' : 'Novice Adventurer',
      xp: `${profile?.xp || 120} XP`,
      level: profile?.level || 2,
      badge: '⭐',
      isCurrent: true,
    },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-12 text-left">
      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GamifiedCard accentColor="purple" className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Zap className="w-6 h-6 fill-purple-500" />
          </div>
          <div>
            <div className="text-[10px] font-pixel text-slate-400 uppercase font-bold">Accuracy Rate</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">94.8%</div>
            <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+3.2% this week</span>
            </div>
          </div>
        </GamifiedCard>

        <GamifiedCard accentColor="emerald" className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-pixel text-slate-400 uppercase font-bold">Lessons Solved</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">18 Modules</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">4 quests in progress</div>
          </div>
        </GamifiedCard>

        <GamifiedCard accentColor="amber" className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-pixel text-slate-400 uppercase font-bold">Time Spent</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">14.5 Hours</div>
            <div className="text-xs text-amber-600 font-bold mt-0.5">3.5 hrs daily avg</div>
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
            <span className="text-xs font-pixel text-slate-400 font-bold">LEVEL PROGRESS</span>
          </div>

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
        </GamifiedCard>

        {/* Global Leaderboard */}
        <GamifiedCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">Leaderboard</h3>
            </div>
            <span className="text-[10px] font-pixel text-slate-400 font-bold">SEASON 1 RANKINGS</span>
          </div>

          <div className="flex flex-col gap-3">
            {leaderboard.map((player) => (
              <div
                key={player.rank}
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
            ))}
          </div>
        </GamifiedCard>
      </div>

      {/* Activity Heatmap */}
      <GamifiedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-emerald-600" />
            <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">30-Day Activity Graph</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">108 commits & lessons</span>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-1.5 py-2">
          {Array.from({ length: 30 }).map((_, i) => {
            const intensity = (i * 7 + 3) % 5
            const colors = [
              'bg-slate-100',
              'bg-emerald-200',
              'bg-emerald-400',
              'bg-emerald-600',
              'bg-emerald-700',
            ]
            return (
              <div
                key={i}
                title={`Day ${i + 1}: ${intensity * 2} activities`}
                className={`h-7 rounded-lg ${colors[intensity]} border border-slate-200/40 hover:scale-110 transition-transform cursor-pointer`}
              />
            )
          })}
        </div>
      </GamifiedCard>
    </div>
  )
}
