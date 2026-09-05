import React, { useState } from 'react'
import { Sword, Star, Flame, Trophy, Zap } from 'lucide-react'
import type { GamificationStats } from '../../../lib/gamification'
import type { ResumePoint, CourseProgressSummary, LearningPath, OverallLearnerProgress } from '../../../lib/learning'
import type { BadgeItem, AchievementItem, ActivityItem } from '../../../lib/achievements'
import { ResumeShrine } from './ResumeShrine'
import { RageGauge } from './RageGauge'
import { RealmPath } from './RealmPath'
import { CourseCard } from './CourseCard'
import { TrophyGrid } from './TrophyGrid'

interface CrucibleDashboardProps {
  username: string
  stats: GamificationStats
  resumePoint: ResumePoint | null
  courses: CourseProgressSummary[]
  learningPaths: LearningPath[]
  overallProgress: OverallLearnerProgress
  badges: BadgeItem[]
  achievements: AchievementItem[]
  activities: ActivityItem[]
  onOpenLesson: (lessonId?: string) => void
}

// Stat pillar data
function StatPillar({ icon: Icon, label, value, color, subLabel }: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  subLabel?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, #130909 0%, #0E0A0A 100%)',
        border: '1px solid #3D1C1C',
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}33` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="font-black tabular-nums text-xl" style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>
        {value}
      </span>
      <span className="font-black uppercase text-center" style={{ color, fontSize: '8px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.6 }}>
        {label}
      </span>
      {subLabel && (
        <span className="text-center" style={{ color: '#57534e', fontSize: '9px' }}>
          {subLabel}
        </span>
      )}
    </div>
  )
}

export const CrucibleDashboard: React.FC<CrucibleDashboardProps> = ({
  username,
  stats,
  resumePoint,
  courses,
  learningPaths,
  overallProgress,
  badges,
  achievements,
  activities,
  onOpenLesson,
}) => {
  const [activeSection, setActiveSection] = useState<'sagas' | 'realms' | 'trophies'>('sagas')

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-12"
      style={{ fontFamily: '"Mulish", system-ui, sans-serif' }}
    >

      {/* ── HERO BANNER ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{
          background: 'linear-gradient(135deg, #0E0A0A 0%, #1a0808 40%, #120606 100%)',
          border: '1px solid #3D1C1C',
          boxShadow: '0 0 40px rgba(220, 38, 38, 0.08)',
        }}
      >
        {/* Background rune decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
          <div className="absolute top-0 right-8 text-8xl font-black text-red-600" style={{ fontFamily: 'Georgia' }}>
            ᚱ
          </div>
          <div className="absolute bottom-0 left-12 text-7xl font-black text-red-600" style={{ fontFamily: 'Georgia' }}>
            ᚢ
          </div>
        </div>

        {/* Ember glow */}
        <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(255,61,0,0.1) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black uppercase tracking-widest"
                style={{ color: '#FF3D00', fontSize: '9px', fontFamily: 'Press Start 2P, monospace' }}
              >
                ⚔ THE CRUCIBLE
              </span>
            </div>
            <h1 className="font-black uppercase tracking-tight leading-tight"
              style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
            >
              Hail, {username}
            </h1>
            <p className="mt-1 text-sm font-medium" style={{ color: '#78716c' }}>
              {resumePoint
                ? `Your saga continues — ${resumePoint.courseTitle} awaits.`
                : 'The forge is ready. Your legend begins.'}
            </p>
          </div>

          {/* Overall progress orb */}
          <div className="shrink-0 flex flex-col items-center gap-1 px-5 py-3 rounded-2xl"
            style={{
              background: 'rgba(61, 28, 28, 0.4)',
              border: '1px solid #3D1C1C',
            }}
          >
            <span className="font-black text-3xl" style={{ color: '#FF3D00', fontFamily: 'Georgia, serif' }}>
              {overallProgress.progressPercent}%
            </span>
            <span style={{ color: '#57534e', fontSize: '9px', fontFamily: 'Press Start 2P, monospace' }}>
              FORGED
            </span>
            <span style={{ color: '#3D1C1C', fontSize: '9px' }}>
              {overallProgress.completedLessons}/{overallProgress.totalLessons}
            </span>
          </div>
        </div>
      </div>

      {/* ── STATS PILLARS + RAGE GAUGE ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatPillar
          icon={Flame}
          label="STREAK"
          value={stats.streak}
          color="#FF3D00"
          subLabel={`${stats.streak} day${stats.streak !== 1 ? 's' : ''} ablaze`}
        />
        <StatPillar
          icon={Star}
          label="TOTAL XP"
          value={stats.xp.toLocaleString()}
          color="#F59E0B"
          subLabel={`Level ${stats.level}`}
        />
        <StatPillar
          icon={Trophy}
          label="BADGES"
          value={badges.filter((b) => b.isUnlocked).length}
          color="#DC2626"
          subLabel={`of ${badges.length} earned`}
        />
        <StatPillar
          icon={Zap}
          label="LEVEL"
          value={stats.level}
          color="#6366F1"
          subLabel={`${Math.max(0, stats.nextLevelXp - stats.xp)} XP to next`}
        />
      </div>

      {/* ── RESUME SHRINE + RAGE GAUGE ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <ResumeShrine
            resumePoint={resumePoint}
            onResume={(lessonId) => onOpenLesson(lessonId)}
          />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4">
          <RageGauge stats={stats} />

          {/* Level progress bar */}
          <div className="rounded-xl p-4"
            style={{ background: '#150F0F', border: '1px solid #451414' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-black uppercase"
                style={{ color: '#6366F1', fontSize: '9px', fontFamily: 'Press Start 2P, monospace' }}
              >
                ⬆ LEVEL ASCENSION
              </span>
              <span className="font-black" style={{ color: '#F59E0B', fontSize: '11px' }}>
                LVL {stats.level}
              </span>
            </div>
            <div className="w-full h-4 rounded-lg overflow-hidden"
              style={{ background: '#0D0505', border: '1px solid #3D1C1C' }}
            >
              {(() => {
                const progressInLevel = stats.xp - stats.currentLevelBaseXp
                const levelRange = stats.nextLevelXp - stats.currentLevelBaseXp
                const pct = levelRange > 0 ? Math.min(100, Math.round((progressInLevel / levelRange) * 100)) : 0
                return (
                  <div className="h-full rounded-lg transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                      boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
                    }}
                  />
                )
              })()}
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ color: '#57534e', fontSize: '9px' }}>
                {stats.xp - stats.currentLevelBaseXp} / {stats.nextLevelXp - stats.currentLevelBaseXp} XP
              </span>
              <span style={{ color: '#6366F1', fontSize: '9px', fontWeight: 700 }}>
                LVL {stats.level + 1} →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION NAVIGATION ─────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: '#0E0A0A', border: '1px solid #3D1C1C' }}
      >
        {([
          { key: 'sagas', label: '⚔ SAGAS & LABORS', icon: '📜' },
          { key: 'realms', label: '🌍 NINE REALMS', icon: '🗺' },
          { key: 'trophies', label: '🏆 VALHALLA', icon: '🏆' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveSection(key)}
            className="flex-1 py-2.5 px-3 rounded-lg font-black uppercase tracking-wider transition-all duration-200"
            style={{
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '8px',
              background: activeSection === key
                ? 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)'
                : 'transparent',
              color: activeSection === key ? '#fff' : '#57534e',
              boxShadow: activeSection === key ? '0 0 16px rgba(220, 38, 38, 0.3)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── SAGAS & MYTHIC LABORS (Course Grid) ───────────────────── */}
      {activeSection === 'sagas' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sword className="w-4 h-4" style={{ color: '#FF3D00' }} />
            <h2 className="font-black uppercase"
              style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif', fontSize: '1.1rem' }}
            >
              Sagas & Mythic Labors
            </h2>
            <span className="ml-auto font-black" style={{ color: '#57534e', fontSize: '10px' }}>
              {overallProgress.completedCourses}/{overallProgress.totalCourses} CONQUERED
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="py-12 text-center rounded-2xl"
              style={{ background: '#0E0A0A', border: '1px solid #1c1010' }}
            >
              <p className="font-black uppercase" style={{ color: '#2a1010', fontSize: '9px', fontFamily: 'Press Start 2P, monospace' }}>
                NO SAGAS PUBLISHED IN THE REALM
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((courseData) => (
                <CourseCard
                  key={courseData.course.id}
                  courseData={courseData}
                  onStartLesson={(lessonId) => onOpenLesson(lessonId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── NINE REALMS PATH ──────────────────────────────────────── */}
      {activeSection === 'realms' && (
        <RealmPath
          islands={learningPaths}
          onSelectRealm={() => {}}
        />
      )}

      {/* ── VALHALLA TROPHIES & ACTIVITY ─────────────────────────── */}
      {activeSection === 'trophies' && (
        <TrophyGrid
          badges={badges}
          achievements={achievements}
          activities={activities}
        />
      )}
    </div>
  )
}
