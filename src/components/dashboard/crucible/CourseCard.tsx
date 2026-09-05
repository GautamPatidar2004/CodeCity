import React, { useState } from 'react'
import { Lock, ChevronDown, ChevronUp } from 'lucide-react'
import type { CourseProgressSummary, ChapterProgressSummary } from '../../../lib/learning'

interface ChapterAccordionProps {
  chapters: ChapterProgressSummary[]
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX']

export const ChapterAccordion: React.FC<ChapterAccordionProps> = ({ chapters }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!chapters || chapters.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mt-4">
      {chapters.map((chapter, idx) => {
        const isExpanded = expandedId === chapter.id
        const roman = ROMAN_NUMERALS[idx] ?? String(idx + 1)

        return (
          <div key={chapter.id} className="rounded-xl overflow-hidden"
            style={{ background: '#0a0606', border: '1px solid #2a1010' }}
          >
            {/* Chapter header */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : chapter.id)}
              className="w-full flex items-center justify-between px-4 py-3 transition-all duration-200 hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                {/* Roman numeral badge */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: chapter.isCompleted
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(61, 28, 28, 0.6)',
                    border: chapter.isCompleted
                      ? '1px solid rgba(245, 158, 11, 0.5)'
                      : '1px solid #3D1C1C',
                  }}
                >
                  <span className="font-black text-xs"
                    style={{ color: chapter.isCompleted ? '#F59E0B' : '#78716c', fontSize: '8px' }}
                  >
                    {roman}
                  </span>
                </div>

                <span className="font-bold text-sm text-left leading-tight"
                  style={{ color: chapter.isCompleted ? '#d1d5db' : '#9ca3af' }}
                >
                  {chapter.title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Progress pill */}
                <div className="px-2 py-0.5 rounded-full"
                  style={{
                    background: chapter.isCompleted
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(61, 28, 28, 0.4)',
                    border: chapter.isCompleted
                      ? '1px solid rgba(245, 158, 11, 0.3)'
                      : '1px solid #3D1C1C',
                  }}
                >
                  <span className="font-black tabular-nums"
                    style={{
                      color: chapter.isCompleted ? '#F59E0B' : '#78716c',
                      fontSize: '9px',
                    }}
                  >
                    {chapter.completedLessons}/{chapter.totalLessons}
                  </span>
                </div>

                {isExpanded
                  ? <ChevronUp className="w-4 h-4" style={{ color: '#57534e' }} />
                  : <ChevronDown className="w-4 h-4" style={{ color: '#57534e' }} />
                }
              </div>
            </button>

            {/* Expanded lesson list */}
            {isExpanded && chapter.lessons.length > 0 && (
              <div className="px-4 pb-3 flex flex-col gap-1"
                style={{ borderTop: '1px solid rgba(61, 28, 28, 0.4)' }}
              >
                {chapter.lessons.map((lesson) => (
                  <div key={lesson.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                    style={{
                      background: lesson.isCurrent
                        ? 'rgba(220, 38, 38, 0.1)'
                        : lesson.isCompleted
                        ? 'rgba(245, 158, 11, 0.05)'
                        : 'transparent',
                      border: lesson.isCurrent ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid transparent',
                    }}
                  >
                    {/* Status indicator */}
                    <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                      style={{
                        background: lesson.isCompleted
                          ? '#DC2626'
                          : lesson.isCurrent
                          ? 'rgba(255,61,0,0.3)'
                          : 'rgba(28,16,16,0.8)',
                        border: lesson.isCompleted
                          ? '1px solid #FF3D00'
                          : lesson.isCurrent
                          ? '1px solid rgba(255,61,0,0.5)'
                          : '1px solid #2a1010',
                      }}
                    >
                      {lesson.isCompleted && (
                        <span style={{ fontSize: '8px', color: '#fff' }}>✓</span>
                      )}
                      {!lesson.isUnlocked && !lesson.isCompleted && (
                        <Lock className="w-2 h-2" style={{ color: '#57534e' }} />
                      )}
                    </div>

                    <span className="text-xs flex-1 leading-tight"
                      style={{
                        color: lesson.isCompleted
                          ? '#d1d5db'
                          : lesson.isCurrent
                          ? '#f1f5f9'
                          : lesson.isUnlocked
                          ? '#9ca3af'
                          : '#4b5563',
                      }}
                    >
                      {lesson.title}
                    </span>

                    {lesson.isCurrent && (
                      <span className="font-black uppercase"
                        style={{ color: '#FF3D00', fontSize: '7px' }}
                      >
                        ▶ NOW
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Course Card ────────────────────────────────────────────────────────────

interface CourseCardProps {
  courseData: CourseProgressSummary
  onStartLesson?: (lessonId?: string) => void
}

const DIFFICULTY_TIERS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'MORTAL', color: '#78716c' },
  intermediate: { label: 'HERO', color: '#DC2626' },
  advanced: { label: 'GOD', color: '#F59E0B' },
}

const TRACK_COLORS: Record<string, string> = {
  python: '#3B82F6',
  javascript: '#F59E0B',
  web: '#10B981',
  data: '#8B5CF6',
  ai: '#EC4899',
  default: '#FF3D00',
}

export const CourseCard: React.FC<CourseCardProps> = ({ courseData, onStartLesson }) => {
  const [chaptersOpen, setChaptersOpen] = useState(false)
  const { course, completedLessons, totalLessons, progressPercent, isCompleted, isUnlocked, chapters, nextLesson, lastAccessedAt, prerequisiteCourseTitle } = courseData

  const difficulty = DIFFICULTY_TIERS[course.difficulty?.toLowerCase()] ?? { label: 'MORTAL', color: '#78716c' }
  const trackColor = TRACK_COLORS[course.track?.toLowerCase()] ?? TRACK_COLORS.default

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    try {
      const d = new Date(dateStr)
      const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 0) return 'Today'
      if (diff === 1) return 'Yesterday'
      if (diff < 7) return `${diff}d ago`
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    } catch { return null }
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: 'linear-gradient(145deg, #0E0A0A 0%, #130909 100%)',
        border: isCompleted
          ? '1px solid rgba(245, 158, 11, 0.5)'
          : isUnlocked
          ? '1px solid #3D1C1C'
          : '1px solid #1c1010',
        boxShadow: isCompleted
          ? '0 0 20px rgba(245, 158, 11, 0.1)'
          : '0 4px 16px rgba(0,0,0,0.4)',
        opacity: isUnlocked ? 1 : 0.7,
        position: 'relative',
      }}
    >
      {/* Lock overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 rounded-2xl z-10 flex flex-col items-center justify-center gap-2"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}
        >
          <Lock className="w-8 h-8" style={{ color: '#57534e' }} />
          <div className="text-center px-4">
            <p className="font-black uppercase text-xs" style={{ color: '#57534e' }}>SEALED</p>
            {prerequisiteCourseTitle && (
              <p className="text-xs mt-1" style={{ color: '#3D1C1C' }}>
                Complete "{prerequisiteCourseTitle}" first
              </p>
            )}
          </div>
        </div>
      )}

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Track badge + difficulty */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase"
            style={{
              background: `${trackColor}22`,
              border: `1px solid ${trackColor}44`,
              color: trackColor,
              fontSize: '9px',
              letterSpacing: '0.05em',
            }}
          >
            {course.track?.toUpperCase() ?? 'UNKNOWN'}
          </span>
          <span className="px-2 py-0.5 rounded-md text-xs font-black uppercase"
            style={{
              color: difficulty.color,
              border: `1px solid ${difficulty.color}44`,
              background: `${difficulty.color}11`,
              fontSize: '8px',
            }}
          >
            ⚔ {difficulty.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-black mb-1.5 leading-tight"
          style={{ color: '#f1f5f9', fontFamily: 'Georgia, serif', fontSize: '1rem' }}
        >
          {course.title}
        </h3>

        {/* Description */}
        {course.description && (
          <p className="text-sm mb-4 leading-relaxed flex-1"
            style={{ color: '#78716c', fontSize: '12px' }}
          >
            {course.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span style={{ color: '#57534e', fontSize: '9px' }}>
              {completedLessons}/{totalLessons} lessons
            </span>
            <span className="font-black" style={{ color: progressPercent === 100 ? '#F59E0B' : '#FF3D00', fontSize: '10px' }}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: '#1c1010', border: '1px solid #2a1010' }}
          >
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent === 100
                  ? 'linear-gradient(90deg, #B45309, #F59E0B)'
                  : 'linear-gradient(90deg, #991B1B, #FF3D00)',
                boxShadow: progressPercent > 0 ? '0 0 8px rgba(255,61,0,0.4)' : 'none',
              }}
            />
          </div>
        </div>

        {/* Last accessed */}
        {lastAccessedAt && (
          <p style={{ color: '#3D1C1C', fontSize: '9px', marginBottom: '12px' }}>
            Last forged: {formatDate(lastAccessedAt)}
          </p>
        )}

        {/* Action button */}
        {isCompleted ? (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <span style={{ fontSize: '14px' }}>🏆</span>
            <span className="font-black uppercase" style={{ color: '#F59E0B', fontSize: '9px' }}>
              SAGA COMPLETE
            </span>
          </div>
        ) : isUnlocked ? (
          <button
            type="button"
            onClick={() => onStartLesson?.(nextLesson?.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)',
              boxShadow: '0 0 16px rgba(220, 38, 38, 0.35)',
              fontSize: '12px',
            }}
          >
            <span>⚔</span>
            <span>{nextLesson ? `Continue: ${nextLesson.title}` : 'Begin Saga'}</span>
          </button>
        ) : null}

        {/* Chapter accordion toggle */}
        {isUnlocked && chapters && chapters.length > 0 && (
          <button
            type="button"
            onClick={() => setChaptersOpen(!chaptersOpen)}
            className="flex items-center justify-center gap-1 mt-2 w-full py-1.5 rounded-lg transition-all"
            style={{ color: '#57534e', fontSize: '10px', background: 'rgba(28,16,16,0.4)' }}
          >
            <span>View Chapters</span>
            {chaptersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        {chaptersOpen && chapters && (
          <ChapterAccordion chapters={chapters} />
        )}
      </div>
    </div>
  )
}
