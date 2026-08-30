import React, { useState } from 'react'
import { GamifiedCard } from '../components/ui/GamifiedCard'
import { GamifiedButton } from '../components/ui/GamifiedButton'
import { useAuth } from '../context/AuthContext'
import { useLearningProgress } from '../lib/learning'
import { useGamification } from '../lib/gamification'
import { useChallenges, type Challenge } from '../lib/challenges'
import { recordUserActivity, createUserNotification } from '../lib/achievements'
import {
  CheckCircle2,
  Terminal,
  Code2,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Play,
  Lightbulb,
} from 'lucide-react'
import confetti from 'canvas-confetti'

export const QuestsPage: React.FC = () => {
  const { user } = useAuth()
  const { courses, completeLesson } = useLearningProgress(user?.id)
  const { awardXp } = useGamification(user?.id)
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'JavaScript' | 'Python' | 'React' | 'Backend'>('All')
  const { challenges, submitAttempt } = useChallenges(user?.id, selectedFilter)
  const [openHintId, setOpenHintId] = useState<string | null>(null)
  const [openSolutionId, setOpenSolutionId] = useState<string | null>(null)

  const filteredCourses = selectedFilter === 'All'
    ? courses
    : courses.filter((c) => c.course.track === selectedFilter)

  const handleCompleteQuest = async (courseId: string, lessonId?: string, courseTitle?: string) => {
    if (!lessonId || !user?.id) return
    await completeLesson(courseId, lessonId)
    await awardXp(50, 'lesson_completed', lessonId)
    await recordUserActivity(user.id, 'lesson_completed', `Completed quest in ${courseTitle || 'Course'}`)
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    })
  }

  const handleSubmitChallengeAttempt = async (challenge: Challenge) => {
    if (!user?.id) return
    await submitAttempt(challenge.id, true, 100)
    const xpResult = await awardXp(75, 'challenge_completed', challenge.id)

    await recordUserActivity(user.id, 'challenge_completed', `Solved challenge "${challenge.title}" ⭐`)

    if (xpResult.awarded) {
      await createUserNotification(
        user.id,
        'Challenge Conquered! ⭐',
        `You solved "${challenge.title}" and earned 75 XP!`,
        '🏆'
      )
    }

    if (challenge.course_id && challenge.lesson_id) {
      await completeLesson(challenge.course_id, challenge.lesson_id)
    }

    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.7 },
    })
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12 text-left">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['All', 'JavaScript', 'Python', 'React', 'Backend'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === filter
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Course & Quests Track Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">
            Learning Quests & Tracks
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(({ course, completedLessons, totalLessons, progressPercent, nextLesson }) => {
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
                    <span className="text-[10px] font-pixel text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                      {course.track}
                    </span>
                    <span className="text-xs font-pixel text-slate-500 font-bold">
                      {completedLessons}/{totalLessons} ({progressPercent}%)
                    </span>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Difficulty: {course.difficulty}
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mb-2">{course.title}</h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">{course.description}</p>

                  {/* Progress Indicator */}
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
                    onClick={() => handleCompleteQuest(course.id, nextLesson?.id, course.title)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{nextLesson ? `Start: ${nextLesson.title}` : 'Start Quest'} ⚔️</span>
                  </GamifiedButton>
                )}
              </GamifiedCard>
            )
          })}
        </div>
      </div>

      {/* Real Supabase Coding Challenges Section */}
      <div className="flex flex-col gap-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">
              Coding Challenges & Attempts
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {challenges.filter((c) => c.isCompleted).length} / {challenges.length} COMPLETED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map(({ challenge, isCompleted, attemptsCount }) => (
            <GamifiedCard
              key={challenge.id}
              accentColor="purple"
              className={`flex flex-col justify-between p-6 border-2 transition-all ${
                isCompleted ? 'border-purple-200 bg-purple-50/20' : 'border-slate-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-pixel text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-bold uppercase">
                      {challenge.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {challenge.difficulty}
                    </span>
                  </div>
                  <span className="text-xs font-pixel text-amber-500 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>+75 XP Reward</span>
                  </span>
                </div>

                <h4 className="font-bold text-base text-slate-900 mb-2">{challenge.title}</h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{challenge.description}</p>

                {/* Hints Section */}
                {challenge.hints && challenge.hints.length > 0 && (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setOpenHintId(openHintId === challenge.id ? null : challenge.id)}
                      className="text-[11px] text-purple-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{openHintId === challenge.id ? 'Hide Hint' : 'View Hint'}</span>
                    </button>
                    {openHintId === challenge.id && (
                      <div className="mt-2 p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 font-mono border border-purple-200">
                        {challenge.hints[0]}
                      </div>
                    )}
                  </div>
                )}

                {/* Solution / Explanation Section (Available upon completion) */}
                {isCompleted && challenge.solution_explanation && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setOpenSolutionId(openSolutionId === challenge.id ? null : challenge.id)}
                      className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{openSolutionId === challenge.id ? 'Hide Solution Breakdown' : 'View Solution Breakdown'}</span>
                    </button>
                    {openSolutionId === challenge.id && (
                      <div className="mt-2 p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 font-medium border border-emerald-200 leading-relaxed">
                        {challenge.solution_explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                {isCompleted ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 font-pixel flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>PASSED (100%)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({attemptsCount} {attemptsCount === 1 ? 'attempt' : 'attempts'})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSubmitChallengeAttempt(challenge)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-pixel text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  </>
                ) : (
                  <GamifiedButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleSubmitChallengeAttempt(challenge)}
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Submit Solution (+75 XP) ⚔️</span>
                  </GamifiedButton>
                )}
              </div>
            </GamifiedCard>
          ))}
        </div>
      </div>
    </div>
  )
}
