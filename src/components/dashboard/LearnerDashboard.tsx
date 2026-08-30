import React, { useState } from 'react'
import { GamifiedCard } from '../ui/GamifiedCard'
import { GamifiedButton } from '../ui/GamifiedButton'
import { useAuth } from '../../context/AuthContext'
import { useLearningProgress } from '../../lib/learning'
import { useGamification } from '../../lib/gamification'
import { useAchievementsAndNotifications } from '../../lib/achievements'
import { LessonPage } from '../../pages/LessonPage'
import {
  Flame,
  Star,
  Trophy,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Target,
  Award,
  Clock,
} from 'lucide-react'

export const LearnerDashboard: React.FC = () => {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth()
  const { courses, resumePoint, refreshProgress, loading: learningLoading } = useLearningProgress(user?.id)
  const { stats, refreshGamification, loading: gamificationLoading } = useGamification(user?.id, profile?.xp, profile?.streak, profile?.level)
  const { badges, achievements, activities, refreshAll, loading: achievementsLoading } =
    useAchievementsAndNotifications(user?.id)

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  const isLoading = authLoading || (Boolean(user?.id) && (learningLoading || gamificationLoading || achievementsLoading))
  const username = profile?.full_name || profile?.username || user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Adventurer'

  const handleOpenLesson = (lessonId?: string) => {
    if (lessonId) {
      setActiveLessonId(lessonId)
    }
  }

  const handleLessonRefresh = () => {
    refreshProgress()
    refreshGamification()
    refreshAll()
    if (refreshProfile) {
      refreshProfile()
    }
  }

  if (activeLessonId) {
    return (
      <LessonPage
        lessonId={activeLessonId}
        userId={user?.id}
        onBack={() => setActiveLessonId(null)}
        onNavigateLesson={(nextId) => setActiveLessonId(nextId)}
        onLessonCompleted={handleLessonRefresh}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12 animate-pulse text-left">
        <div className="h-44 bg-slate-200/70 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200/70 rounded-3xl" />
          <div className="h-32 bg-slate-200/70 rounded-3xl" />
          <div className="h-32 bg-slate-200/70 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200/70 rounded-3xl" />
          <div className="h-64 bg-slate-200/70 rounded-3xl" />
        </div>
        <div className="h-64 bg-slate-200/70 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12">

      {/* Mascot Welcome & Resume Learning Card */}
      <GamifiedCard accentColor="emerald" className="flex flex-col sm:flex-row items-center gap-6 p-8 bg-gradient-to-r from-emerald-500/10 via-white to-white">
        <div className="shrink-0 relative">
          <img
            src={profile?.avatar_url || '/bouncingbot.webp'}
            alt={username}
            className="w-24 h-24 pixelated drop-shadow-xl animate-float rounded-2xl object-cover"
            onError={(e) => {
              e.currentTarget.src = '/bouncingbot.webp'
            }}
          />
          <div className="absolute -top-1 -right-1 text-amber-400 animate-twinkle">
            ✨
          </div>
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
            <span className="font-pixel text-xs text-emerald-600 uppercase font-bold tracking-wider">
              ✦ QUEST STATUS: {resumePoint ? 'IN PROGRESS' : 'READY'} ✦
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-pixel uppercase tracking-tight mb-2">
            Welcome back, {username}!
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mb-4">
            {resumePoint ? (
              <>
                Continue with <strong>{resumePoint.courseTitle}</strong>: <em>{resumePoint.lessonTitle}</em> ({resumePoint.progressPercent}% completed).
              </>
            ) : (
              <>
                You&apos;re currently on a <strong>{stats.streak} day streak</strong>! Ready to jump into your next coding quest?
              </>
            )}
          </p>

          {resumePoint?.lessonId && (
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <GamifiedButton
                variant="secondary"
                size="sm"
                onClick={() => handleOpenLesson(resumePoint.lessonId)}
                className="flex items-center gap-1.5"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Resume: {resumePoint.lessonTitle}</span>
              </GamifiedButton>
            </div>
          )}
        </div>
      </GamifiedCard>

      {/* Gamified Stats Trio + Daily Goal Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GamifiedCard accentColor="amber" className="flex flex-col items-center text-center p-6 gap-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-500 mb-1">
            <Flame className="w-8 h-8 fill-amber-500" />
          </div>
          <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
            {stats.streak} Day Streak
          </h3>
          <p className="text-xs text-slate-500 font-medium">Consecutive practice days</p>
        </GamifiedCard>

        <GamifiedCard accentColor="emerald" className="flex flex-col items-center text-center p-6 gap-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-1">
            <Star className="w-8 h-8 fill-emerald-500" />
          </div>
          <h3 className="font-bold text-base text-slate-900 font-pixel uppercase text-emerald-600">
            {stats.xp.toLocaleString()} XP
          </h3>
          <div className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
            <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Daily Goal: {stats.dailyXpEarned}/{stats.dailyGoalXp} XP ({stats.dailyGoalPercent}%)</span>
          </div>
        </GamifiedCard>

        <GamifiedCard accentColor="purple" className="flex flex-col items-center text-center p-6 gap-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-600 mb-1">
            <Trophy className="w-8 h-8 fill-purple-500" />
          </div>
          <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
            Level {stats.level}
          </h3>
          <p className="text-xs text-slate-500 font-medium">Next Lvl in {Math.max(0, stats.nextLevelXp - stats.xp)} XP</p>
        </GamifiedCard>
      </div>

      {/* Badges & Achievements Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Quick Badges */}
        <GamifiedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">Earned Badges</h3>
            </div>
            <span className="text-[10px] font-pixel text-slate-400 font-bold">
              {badges.filter((b) => b.isUnlocked).length}/{badges.length}
            </span>
          </div>
          {badges.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-pixel text-[10px]">
              NO BADGES IN THE REALM YET
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                    b.isUnlocked
                      ? 'bg-amber-50/60 border-amber-200 shadow-sm'
                      : 'bg-slate-50 border-slate-100 opacity-40 grayscale'
                  }`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <span className="font-bold text-xs text-slate-800 leading-tight">{b.title}</span>
                </div>
              ))}
            </div>
          )}
        </GamifiedCard>

        {/* Quick Achievements */}
        <GamifiedCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">Achievements</h3>
            </div>
            <span className="text-[10px] font-pixel text-slate-400 font-bold">
              {achievements.filter((a) => a.isUnlocked).length}/{achievements.length}
            </span>
          </div>
          {achievements.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-pixel text-[10px]">
              NO ACHIEVEMENTS DISCOVERED YET
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    a.isUnlocked ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{a.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{a.title}</div>
                      <div className="text-[10px] text-slate-500">{a.description}</div>
                    </div>
                  </div>
                  <span className="text-xs font-pixel font-bold text-amber-500">+{a.rewardXp} XP</span>
                </div>
              ))}
            </div>
          )}
        </GamifiedCard>
      </div>

      {/* Real Learning Courses & Quests Section */}
      <div className="flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xl font-extrabold text-slate-900 font-pixel uppercase">
              Active Courses & Quests
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {courses.filter((c) => c.progressPercent === 100).length} / {courses.length} COMPLETED
          </span>
        </div>

        {courses.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 font-pixel text-xs">
            NO COURSES PUBLISHED IN THE REALM YET
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map(({ course, completedLessons, totalLessons, progressPercent, nextLesson }) => {
              const isDone = progressPercent === 100
              return (
                <GamifiedCard
                  key={course.id}
                  className={`flex flex-col justify-between p-6 border-2 transition-all ${
                    isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-pixel text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                        {course.track}
                      </span>
                      <span className="text-xs font-pixel text-slate-500 font-bold">
                        {completedLessons}/{totalLessons} ({progressPercent}%)
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 mb-2">{course.title}</h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{course.description}</p>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {isDone ? (
                    <div className="w-full py-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-pixel text-[10px] font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>COURSE COMPLETED</span>
                    </div>
                  ) : (
                    <GamifiedButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenLesson(nextLesson?.id)}
                      className="w-full"
                    >
                      {nextLesson ? `Learn: ${nextLesson.title}` : 'Start Course'} ⚔️
                    </GamifiedButton>
                  )}
                </GamifiedCard>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Activity History Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-left">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="font-pixel text-xs font-bold text-slate-900 uppercase">Recent Activity</h3>
        </div>
        {activities.length === 0 ? (
          <div className="py-6 text-center text-slate-400 font-pixel text-[10px]">
            NO RECENT QUEST ACTIONS RECORDED
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                <span className="font-medium text-slate-700">{act.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">{act.createdAt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
