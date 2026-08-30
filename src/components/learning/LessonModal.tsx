import React, { useState, useEffect, useCallback } from 'react'
import { fetchLessonDetail, recordLessonCompletion, type LessonDetail } from '../../lib/learning'
import { GamifiedButton } from '../ui/GamifiedButton'
import { CodeExerciseEditor } from './CodeExerciseEditor'
import {
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface LessonModalProps {
  lessonId: string
  userId?: string
  onClose: () => void
  onLessonCompleted?: () => void
  onNavigateLesson?: (nextLessonId: string) => void
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lessonId,
  userId,
  onClose,
  onLessonCompleted,
  onNavigateLesson,
}) => {
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadCurrentLesson = useCallback(async (id: string) => {
    setLoading(true)
    const detail = await fetchLessonDetail(id, userId)
    setLesson(detail)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadCurrentLesson(lessonId)
  }, [lessonId, loadCurrentLesson])

  const handleComplete = async () => {
    if (!lesson || !userId || isSubmitting) return
    setIsSubmitting(true)

    try {
      await recordLessonCompletion(userId, lesson.courseId, lesson.id, true)
      setLesson((prev) => (prev ? { ...prev, isCompleted: true } : null))
      onLessonCompleted?.()

      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
      })
    } catch (err) {
      console.error('Error completing lesson:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const navigateTo = (targetId: string) => {
    if (onNavigateLesson) {
      onNavigateLesson(targetId)
    } else {
      loadCurrentLesson(targetId)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-pixel text-emerald-600 uppercase font-bold">
                  {lesson?.track || 'LESSON'}
                </span>
                {lesson?.isCompleted && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-pixel font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>COMPLETED</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-pixel uppercase leading-tight">
                {lesson?.title || 'Loading Lesson...'}
              </h3>
              <div className="text-xs text-slate-500 font-medium">
                {lesson?.courseTitle} ✦ {lesson?.chapterTitle}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col gap-6 leading-relaxed">
          {loading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              <div className="h-6 w-1/3 bg-slate-200 rounded-lg" />
              <div className="h-24 bg-slate-200 rounded-2xl" />
              <div className="h-40 bg-slate-200 rounded-2xl" />
            </div>
          ) : !lesson ? (
            <div className="py-12 text-center text-slate-400 font-pixel text-xs">
              LESSON CONTENT UNAVAILABLE
            </div>
          ) : (
            <>
              {lesson.summary && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-medium">
                  <strong>Quest Objective:</strong> {lesson.summary}
                </div>
              )}

              {/* Lesson Text / Educational Material */}
              <div className="text-slate-800 text-sm space-y-4 whitespace-pre-wrap font-sans">
                {lesson.content || 'Content for this coding lesson is being prepared in the realm.'}
              </div>

              {/* Real Coding Exercise Editor */}
              {lesson.challenge && (
                <div className="mt-2">
                  <CodeExerciseEditor
                    challengeId={lesson.challenge.id}
                    title={lesson.challenge.title}
                    description={lesson.challenge.description}
                    instructions={lesson.challenge.instructions}
                    starterCode={lesson.challenge.starter_code}
                    language={lesson.challenge.language || lesson.track}
                    sampleInput={lesson.challenge.sample_input}
                    hints={lesson.challenge.hints}
                    solutionExplanation={lesson.challenge.solution_explanation}
                    isCompleted={lesson.isCompleted}
                    onSubmitAttempt={handleComplete}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation & Complete Button */}
        {lesson && (
          <div className="p-4 sm:px-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <div>
              {lesson.prevLesson ? (
                <button
                  type="button"
                  onClick={() => navigateTo(lesson.prevLesson!.id)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous: {lesson.prevLesson.title}</span>
                  <span className="sm:hidden">Prev</span>
                </button>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center gap-2">
              {!lesson.isCompleted ? (
                <GamifiedButton
                  variant="primary"
                  size="sm"
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Mark Complete (+50 XP)</span>
                </GamifiedButton>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-pixel font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>QUEST COMPLETED</span>
                </div>
              )}

              {lesson.nextLesson && (
                <button
                  type="button"
                  onClick={() => navigateTo(lesson.nextLesson!.id)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="hidden sm:inline">Next: {lesson.nextLesson.title}</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
