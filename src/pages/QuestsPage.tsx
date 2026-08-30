import React, { useState } from 'react'
import { GamifiedCard } from '../components/ui/GamifiedCard'
import { GamifiedButton } from '../components/ui/GamifiedButton'
import { useAuth } from '../context/AuthContext'
import { useLearningProgress, useLanguages } from '../lib/learning'
import { useChallenges, type Challenge } from '../lib/challenges'
import { LessonPage } from './LessonPage'
import { CodeExerciseEditor } from '../components/learning/CodeExerciseEditor'
import {
  CheckCircle2,
  Terminal,
  Code2,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Compass,
  Lock,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Play,
} from 'lucide-react'
import confetti from 'canvas-confetti'

export const QuestsPage: React.FC = () => {
  const { user, refreshProfile } = useAuth()
  const { languages, loading: languagesLoading } = useLanguages()
  const [selectedFilter, setSelectedFilter] = useState<string>('All')
  const { courses, learningPaths, refreshProgress, completeLesson, loading: coursesLoading } = useLearningProgress(
    user?.id,
    selectedFilter === 'All' ? undefined : selectedFilter
  )
  const { challenges, submitAttempt, loading: challengesLoading } = useChallenges(user?.id, selectedFilter)
  const [openHintId, setOpenHintId] = useState<string | null>(null)
  const [openSolutionId, setOpenSolutionId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null)

  const isLoading = languagesLoading || coursesLoading || challengesLoading

  const filterOptions = ['All', ...languages.map((l) => l.name)]

  const filteredCourses = selectedFilter === 'All'
    ? courses
    : courses.filter((c) => c.course.track.toLowerCase() === selectedFilter.toLowerCase())

  const handleSubmitChallengeAttempt = async (challenge: Challenge) => {
    if (!user?.id) return
    await submitAttempt(challenge.id, true, 100)
    if (challenge.course_id && challenge.lesson_id) {
      await completeLesson(challenge.course_id, challenge.lesson_id)
    } else {
      await refreshProgress()
    }

    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.7 },
    })
  }

  // 1. If a lesson is active, render the dedicated full-page Lesson Journey view
  if (activeLessonId) {
    return (
      <LessonPage
        lessonId={activeLessonId}
        userId={user?.id}
        onBack={() => setActiveLessonId(null)}
        onNavigateLesson={(nextId) => setActiveLessonId(nextId)}
        onLessonCompleted={async () => {
          await refreshProgress()
          if (refreshProfile) {
            await refreshProfile()
          }
        }}
      />
    )
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12 animate-pulse text-left">
        <div className="h-10 w-72 bg-slate-200/70 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200/70 rounded-3xl" />
          <div className="h-64 bg-slate-200/70 rounded-3xl" />
          <div className="h-64 bg-slate-200/70 rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12 text-left">
      {/* Active Challenge Coding Exercise Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                  Coding Exercise Studio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChallenge(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <CodeExerciseEditor
                challengeId={selectedChallenge.id}
                title={selectedChallenge.title}
                description={selectedChallenge.description}
                instructions={selectedChallenge.instructions}
                starterCode={selectedChallenge.starter_code}
                language={selectedChallenge.language || selectedChallenge.category}
                sampleInput={selectedChallenge.sample_input}
                hints={selectedChallenge.hints}
                solutionExplanation={selectedChallenge.solution_explanation}
                isCompleted={Boolean(challenges.find((c) => c.challenge.id === selectedChallenge.id)?.isCompleted)}
                onSubmitAttempt={() => handleSubmitChallengeAttempt(selectedChallenge)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 1. Dynamic Programming Language Selection Tabs */}
      <div className="flex flex-col gap-2">
        <div className="text-[10px] font-pixel text-slate-400 font-bold uppercase tracking-wider">
          CHOOSE PROGRAMMING REALM
        </div>
        {languages.length === 0 ? (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-400 font-pixel">
            NO PUBLISHED LANGUAGES IN THE REALM YET
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filterOptions.map((filter) => {
              const langObj = languages.find((l) => l.name === filter)
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    selectedFilter === filter
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  {langObj?.icon && <span>{langObj.icon}</span>}
                  <span>{filter}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. CodeDex Islands & Learning Paths Section */}
      {learningPaths.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">
              {selectedFilter === 'All' ? 'CodeDex Islands & Realms' : `${selectedFilter} Archipelago`}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningPaths.map((path) => (
              <div
                key={path.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0">
                    {path.icon || '🏝️'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-pixel text-emerald-600 uppercase font-bold">
                        {path.island_name || 'ARCHIPELAGO ISLAND'}
                      </span>
                      <span className="text-[11px] font-pixel font-bold text-slate-500">
                        {path.completedCourses}/{path.totalCourses} Courses ({path.progressPercent}%)
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{path.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{path.description}</p>
                  </div>
                </div>

                {/* Island Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${path.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Course Catalog & CodeDex-Style Progressive Journey */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">
              Learning Quests & Course Journeys
            </h3>
          </div>
          <span className="text-xs font-pixel text-slate-400 font-bold">
            {filteredCourses.filter((c) => c.isCompleted).length} / {filteredCourses.length} COURSES MASTERED
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 font-pixel text-xs">
            NO COURSES AVAILABLE FOR THIS REALM FILTER
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(({ course, chapters, completedLessons, totalLessons, progressPercent, isCompleted, nextLesson, isUnlocked, prerequisiteCourseTitle }) => {
              const isExpanded = expandedCourseId === course.id
              return (
                <GamifiedCard
                  key={course.id}
                  className={`flex flex-col justify-between p-6 border-2 transition-all ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : !isUnlocked
                      ? 'border-slate-200 bg-slate-50/70 opacity-75'
                      : 'border-slate-100 hover:border-slate-300'
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
                    <h4 className="font-bold text-base text-slate-900 mb-2 flex items-center gap-2">
                      <span>{course.title}</span>
                      {!isUnlocked && <Lock className="w-4 h-4 text-slate-400" />}
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">{course.description}</p>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* CodeDex-Style Progressive Journey Tree */}
                    {chapters && chapters.length > 0 && isUnlocked && (
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                          className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer transition-colors bg-slate-100/70 px-3 py-1.5 rounded-xl w-full justify-between"
                        >
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Quest Path ({chapters.length} Chapters)</span>
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-4 max-h-72 overflow-y-auto">
                            {chapters.map((ch) => (
                              <div key={ch.id} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                                  <span className="font-bold text-xs text-slate-800 font-pixel uppercase">
                                    {ch.title}
                                  </span>
                                  <span className="text-[10px] font-pixel text-slate-500 font-bold">
                                    {ch.completedLessons}/{ch.totalLessons}
                                  </span>
                                </div>

                                {/* Progressive Journey Nodes */}
                                <div className="flex flex-col gap-1.5 pl-2 relative border-l-2 border-slate-200">
                                  {ch.lessons.map((l, lIdx) => {
                                    return (
                                      <button
                                        key={l.id}
                                        type="button"
                                        disabled={!l.isUnlocked}
                                        onClick={() => l.isUnlocked && setActiveLessonId(l.id)}
                                        className={`text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                                          l.isCompleted
                                            ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200 hover:bg-emerald-100/80 cursor-pointer'
                                            : l.isCurrent
                                            ? 'bg-white text-slate-900 font-bold border-2 border-emerald-500 shadow-xs cursor-pointer animate-pulse'
                                            : l.isUnlocked
                                            ? 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 cursor-pointer'
                                            : 'bg-slate-100/60 text-slate-400 border border-slate-200/50 cursor-not-allowed opacity-70'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">
                                            {l.isCompleted ? (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            ) : l.isCurrent ? (
                                              <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                                            ) : l.isUnlocked ? (
                                              <span className="text-slate-500 font-mono">#{l.order_index ?? lIdx + 1}</span>
                                            ) : (
                                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                          </div>
                                          <span className="truncate">{l.title}</span>
                                        </div>

                                        {l.isCurrent && (
                                          <span className="text-[9px] font-pixel text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                                            CURRENT
                                          </span>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Course Action Button */}
                  {isCompleted ? (
                    <div className="w-full py-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-pixel text-[10px] font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>COURSE COMPLETED</span>
                    </div>
                  ) : !isUnlocked ? (
                    <div className="w-full py-2.5 bg-slate-200/80 text-slate-600 rounded-xl font-pixel text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-not-allowed">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>LOCKED: COMPLETE {prerequisiteCourseTitle ? prerequisiteCourseTitle.toUpperCase() : 'PREREQUISITE'}</span>
                    </div>
                  ) : (
                    <GamifiedButton
                      variant="secondary"
                      size="sm"
                      onClick={() => nextLesson?.id && setActiveLessonId(nextLesson.id)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{nextLesson ? `Learn: ${nextLesson.title}` : 'Start Journey'} ⚔️</span>
                    </GamifiedButton>
                  )}
                </GamifiedCard>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Standalone Challenges & Practice Attempts */}
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">
              Coding Quests & Practice Sandbox
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {challenges.filter((c) => c.isCompleted).length} / {challenges.length} SOLVED
          </span>
        </div>

        {challenges.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 font-pixel text-xs">
            NO CHALLENGES FOUND FOR THIS REALM FILTER
          </div>
        ) : (
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
                    <span className="text-[10px] font-pixel text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-bold uppercase">
                      {challenge.language || challenge.category}
                    </span>
                    <span className="text-xs font-pixel text-slate-500 font-bold">
                      {challenge.difficulty}
                    </span>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Attempts: {attemptsCount}
                  </div>
                  <h4 className="font-bold text-base text-slate-900 mb-2">{challenge.title}</h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">
                    {challenge.instructions || challenge.description}
                  </p>

                  {/* Hint Section */}
                  {challenge.hints && challenge.hints.length > 0 && (
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenHintId(openHintId === challenge.id ? null : challenge.id)
                        }
                        className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{openHintId === challenge.id ? 'Hide Hint' : 'Need a Hint?'}</span>
                      </button>
                      {openHintId === challenge.id && (
                        <div className="mt-2 p-3 bg-purple-50 rounded-xl text-xs text-purple-900 font-mono border border-purple-100 animate-in fade-in">
                          {challenge.hints[0]}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Solution Explanation if Completed */}
                  {isCompleted && challenge.solution_explanation && (
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSolutionId(openSolutionId === challenge.id ? null : challenge.id)
                        }
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>{openSolutionId === challenge.id ? 'Hide Solution Explanation' : 'View Solution Explanation'}</span>
                      </button>
                      {openSolutionId === challenge.id && (
                        <div className="mt-2 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-950 font-medium border border-emerald-100 animate-in fade-in">
                          {challenge.solution_explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <div className="flex-1 py-2.5 bg-purple-100 text-purple-800 rounded-xl font-pixel text-[10px] font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      <span>SOLVED</span>
                    </div>
                  ) : (
                    <GamifiedButton
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedChallenge(challenge)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Code Editor (+{challenge.xp_reward ?? 75} XP)</span>
                    </GamifiedButton>
                  )}
                </div>
              </GamifiedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
