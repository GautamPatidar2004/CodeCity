import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLearningProgress } from '../../lib/learning'
import { useGamification } from '../../lib/gamification'
import { useAchievementsAndNotifications } from '../../lib/achievements'
import { LessonPage } from '../../pages/LessonPage'
import { CrucibleDashboard } from './crucible/CrucibleDashboard'
import { Loader2 } from 'lucide-react'

export const LearnerDashboard: React.FC = () => {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth()
  const { courses, learningPaths, resumePoint, overallProgress, refreshProgress, loading: learningLoading } = useLearningProgress(user?.id)
  const { stats, refreshGamification, loading: gamificationLoading } = useGamification(user?.id, profile?.xp, profile?.streak, profile?.level)
  const { badges, achievements, activities, refreshAll, loading: achievementsLoading } =
    useAchievementsAndNotifications(user?.id)

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  const isLoading = authLoading || (Boolean(user?.id) && (learningLoading || gamificationLoading || achievementsLoading))
  const username = profile?.full_name || profile?.username || user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Warrior'

  const handleOpenLesson = (lessonId?: string) => {
    if (lessonId) setActiveLessonId(lessonId)
  }

  const handleLessonRefresh = () => {
    refreshProgress()
    refreshGamification()
    refreshAll()
    if (refreshProfile) refreshProfile()
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
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-12">
        {/* Crucible loading skeleton */}
        <div className="h-28 rounded-2xl animate-pulse"
          style={{ background: 'linear-gradient(135deg, #0E0A0A, #1a0808)', border: '1px solid #3D1C1C' }}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse"
              style={{ background: '#130909', border: '1px solid #2a1010', animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 h-56 rounded-2xl animate-pulse"
            style={{ background: '#0E0A0A', border: '1px solid #3D1C1C' }}
          />
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="h-24 rounded-xl animate-pulse" style={{ background: '#150F0F', border: '1px solid #3D1C1C' }} />
            <div className="h-24 rounded-xl animate-pulse" style={{ background: '#150F0F', border: '1px solid #3D1C1C' }} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 py-6"
          style={{ color: '#FF3D00' }}
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span style={{ fontFamily: 'Press Start 2P, monospace', fontSize: '9px', color: '#57534e' }}>
            FORGING YOUR SAGA...
          </span>
        </div>
      </div>
    )
  }

  return (
    <CrucibleDashboard
      username={username}
      stats={stats}
      resumePoint={resumePoint}
      courses={courses}
      learningPaths={learningPaths}
      overallProgress={overallProgress}
      badges={badges}
      achievements={achievements}
      activities={activities}
      onOpenLesson={handleOpenLesson}
    />
  )
}
