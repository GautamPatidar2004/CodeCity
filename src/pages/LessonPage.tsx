import React, { useState, useEffect, useCallback } from 'react'
import { fetchLessonDetail, type LessonDetail } from '../lib/learning'
import { GamifiedCard } from '../components/ui/GamifiedCard'
import { CodeExerciseEditor } from '../components/learning/CodeExerciseEditor'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Terminal,
  Copy,
  Check,
  Compass,
} from 'lucide-react'

interface LessonPageProps {
  lessonId: string
  userId?: string
  onBack: () => void
  onNavigateLesson: (nextLessonId: string) => void
  onLessonCompleted?: () => void
}

/**
 * Safe, dependency-free Markdown Parser for CodeDex-style educational lessons.
 * Accurately formats code fences, examples, outputs, headings, lists, and inline tags.
 */
const SafeLessonMarkdown: React.FC<{ content: string; language?: string }> = ({ content, language }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Split content by code fences (```lang ... ```)
  const sections = content.split(/(```[\s\S]*?```)/g)

  let codeBlockCounter = 0

  return (
    <div className="space-y-4 text-slate-800 text-sm sm:text-base leading-relaxed font-sans">
      {sections.map((section, sIdx) => {
        if (section.startsWith('```') && section.endsWith('```')) {
          const firstLineEnd = section.indexOf('\n')
          const fenceLang = firstLineEnd > 3 ? section.slice(3, firstLineEnd).trim().toLowerCase() : ''
          const codeBody = firstLineEnd !== -1 ? section.slice(firstLineEnd + 1, -3).trimEnd() : section.slice(3, -3).trim()
          const blockId = codeBlockCounter++
          const isOutputBlock = fenceLang === 'output' || fenceLang === 'text' || fenceLang === 'console'

          return (
            <div
              key={sIdx}
              className={`my-4 rounded-2xl overflow-hidden border shadow-xs ${
                isOutputBlock
                  ? 'bg-slate-900 border-slate-800 text-emerald-400 font-mono'
                  : 'bg-[#1e1e2e] border-slate-800 text-slate-100 font-mono'
              }`}
            >
              {/* Header Bar */}
              <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="font-pixel text-[10px] uppercase font-bold text-slate-400 pl-1">
                    {isOutputBlock ? '🖥️ Console Output' : `💻 ${fenceLang || language || 'Code Example'}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeBody, blockId)}
                  className="px-2 py-1 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy code"
                >
                  {copiedIndex === blockId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code / Output Body */}
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed whitespace-pre">
                <code>{codeBody}</code>
              </pre>
            </div>
          )
        }

        // Regular Text & Headings Block
        const lines = section.split('\n')
        return (
          <div key={sIdx} className="space-y-3">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim()
              if (!trimmed) return null

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="text-base sm:text-lg font-bold text-slate-900 pt-2 font-pixel uppercase tracking-tight">
                    {trimmed.slice(4)}
                  </h4>
                )
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="text-lg sm:text-xl font-black text-slate-900 pt-3 font-pixel uppercase tracking-tight border-b border-slate-100 pb-1">
                    {trimmed.slice(3)}
                  </h3>
                )
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="text-xl sm:text-2xl font-black text-slate-900 pt-4 font-pixel uppercase tracking-tight">
                    {trimmed.slice(2)}
                  </h2>
                )
              }

              // Unordered List Items
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <li key={lIdx} className="ml-5 list-disc text-slate-700">
                    <RenderInlineFormatted text={trimmed.slice(2)} />
                  </li>
                )
              }

              // Numbered List Items
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 ml-2">
                    <span className="font-bold text-emerald-600 shrink-0 font-mono text-xs">{numMatch[1]}.</span>
                    <span className="text-slate-700">
                      <RenderInlineFormatted text={numMatch[2]} />
                    </span>
                  </div>
                )
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <div key={lIdx} className="p-3.5 my-2 rounded-xl bg-emerald-50/70 border-l-4 border-emerald-500 text-emerald-950 text-xs sm:text-sm italic">
                    <RenderInlineFormatted text={trimmed.slice(2)} />
                  </div>
                )
              }

              // Standard Paragraph
              return (
                <p key={lIdx} className="text-slate-700 leading-relaxed">
                  <RenderInlineFormatted text={line} />
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Helper to render inline code, bold, and italics safely without raw HTML injection.
 */
const RenderInlineFormatted: React.FC<{ text: string }> = ({ text }) => {
  // Tokenize `code`, **bold**, and *italic*
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)

  return (
    <>
      {parts.map((part, pIdx) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <code key={pIdx} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 border border-slate-200 text-purple-700 font-mono text-[12px] font-bold">
              {part.slice(1, -1)}
            </code>
          )
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return <em key={pIdx} className="italic text-slate-800">{part.slice(1, -1)}</em>
        }
        return <span key={pIdx}>{part}</span>
      })}
    </>
  )
}

export const LessonPage: React.FC<LessonPageProps> = ({
  lessonId,
  userId,
  onBack,
  onNavigateLesson,
  onLessonCompleted,
}) => {
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLesson = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const detail = await fetchLessonDetail(id, userId)
      if (!detail) {
        setError('Lesson not found or unavailable in the active realm.')
      } else {
        setLesson(detail)
      }
    } catch {
      setError('An error occurred while loading this lesson.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const handleRefreshLesson = useCallback(async () => {
    if (lessonId) {
      const detail = await fetchLessonDetail(lessonId, userId)
      if (detail) {
        setLesson(detail)
      }
    }
    if (onLessonCompleted) {
      onLessonCompleted()
    }
  }, [lessonId, userId, onLessonCompleted])

  useEffect(() => {
    loadLesson(lessonId)
  }, [lessonId, loadLesson])

  // 1. Loading State
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-pulse text-left pb-16">
        <div className="h-10 w-48 bg-slate-200/80 rounded-2xl" />
        <div className="h-64 bg-slate-200/80 rounded-3xl" />
        <div className="h-96 bg-slate-200/80 rounded-3xl" />
      </div>
    )
  }

  // 2. Error / Missing State
  if (error || !lesson) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-white border-2 border-slate-200 rounded-3xl text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-pixel text-slate-900 uppercase">Lesson Unavailable</h2>
        <p className="text-xs text-slate-500 max-w-md">{error || 'This lesson could not be loaded.'}</p>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-pixel uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Journey</span>
        </button>
      </div>
    )
  }

  // 3. Security Guard: Locked Lesson State (Enforces Sequential Progression)
  if (!lesson.isUnlocked) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 p-8 bg-slate-50 border-2 border-slate-200 rounded-3xl text-center flex flex-col items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <span className="text-[10px] font-pixel text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded font-bold uppercase">
            Locked Quest Node
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 font-pixel uppercase mt-2">
            {lesson.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {lesson.courseTitle} • {lesson.chapterTitle}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-medium max-w-md">
          {lesson.lockReason || 'You must complete the prerequisite quests in this journey to unlock this lesson.'}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-pixel uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Course Journey</span>
          </button>
          {lesson.prevLesson && (
            <button
              type="button"
              onClick={() => onNavigateLesson(lesson.prevLesson!.id)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-pixel uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              <span>Go to: {lesson.prevLesson.title}</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  const hasChallenge = Boolean(lesson.challenge)
  const challenge = lesson.challenge

  return (
    <div className="w-full max-w-[1700px] mx-auto flex flex-col gap-4 text-left pb-10 animate-in fade-in duration-200">
      {/* 1. Top Navigation & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors w-fit shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {lesson.courseTitle}</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-pixel font-bold">
            Lesson {lesson.lessonIndex} of {lesson.totalLessons}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-pixel uppercase font-bold">
            {lesson.track}
          </span>
          {lesson.isCompleted ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-pixel font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>COMPLETED</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-pixel font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>IN PROGRESS</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. CodeDex Split Workspace Layout (50/50 Equal Split) */}
      <div className={`grid grid-cols-1 ${hasChallenge ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'} gap-5 items-start`}>
        {/* LEFT COLUMN: Lesson Content & Continuous Journey Navigation (50% width) */}
        <div className="w-full flex flex-col gap-4 overflow-y-auto max-h-none lg:max-h-[calc(100vh-140px)] pr-0 lg:pr-1">
          {/* Main Lesson Card (Explanation, Examples, and Outputs) */}
          <GamifiedCard accentColor="emerald" className="p-6 sm:p-8 flex flex-col gap-5 bg-white border-2 border-slate-200 shadow-sm">
            {/* Lesson Header */}
            <div className="border-b border-slate-100 pb-4 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-pixel text-emerald-600 uppercase font-bold tracking-wider">
                  {lesson.courseTitle} • {lesson.chapterTitle}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-pixel uppercase tracking-tight mt-0.5">
                  {lesson.title}
                </h1>
                <div className="text-[11px] text-slate-400 font-mono">
                  /{lesson.slug}
                </div>
              </div>
            </div>

            {/* Quest Objective / Summary Callout */}
            {lesson.summary && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-medium">
                <strong className="font-pixel text-[10px] uppercase text-emerald-800 block mb-1">
                  ✦ Quest Objective ✦
                </strong>
                {lesson.summary}
              </div>
            )}

            {/* Real Educational Lesson Markdown Content */}
            <div className="py-1">
              {lesson.content ? (
                <SafeLessonMarkdown content={lesson.content} language={challenge?.language || lesson.track} />
              ) : (
                <div className="text-slate-500 italic text-xs">
                  Educational instructions and examples for this quest are being loaded.
                </div>
              )}
            </div>
          </GamifiedCard>

          {/* Bottom Continuous Navigation Controller & Quest Completion Status */}
          <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              {lesson.prevLesson ? (
                <button
                  type="button"
                  onClick={() => onNavigateLesson(lesson.prevLesson!.id)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev: {lesson.prevLesson.title}</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 font-pixel flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>START OF COURSE</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
              {lesson.isCompleted ? (
                <div className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-pixel font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>COMPLETED</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-pixel font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>IN PROGRESS</span>
                </div>
              )}

              {lesson.nextLesson ? (
                lesson.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onNavigateLesson(lesson.nextLesson!.id)}
                    className="px-4 py-2.5 rounded-xl text-white text-xs font-bold font-pixel uppercase flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400 ring-offset-2 transition-all shadow-md"
                    title={`Proceed to ${lesson.nextLesson.title}`}
                  >
                    <span>Next Lesson →</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-bold font-pixel uppercase flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
                    title="Solve all test cases and submit solution to unlock the next lesson"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Next Lesson (Locked)</span>
                  </button>
                )
              ) : lesson.isCompleted ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-pixel uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Course Conquered (100%) 🏆</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Coding Challenge Studio (Monaco Editor + STDIN + Terminal Console) (50% width) */}
        {hasChallenge && challenge && (
          <div className="w-full flex flex-col gap-4 overflow-y-auto max-h-none lg:max-h-[calc(100vh-140px)]">
            <CodeExerciseEditor
              challengeId={challenge.id}
              title={challenge.title}
              instructions={challenge.instructions}
              description={challenge.description}
              starterCode={challenge.starter_code}
              language={challenge.language || lesson.track}
              sampleInput={challenge.sample_input}
              hints={challenge.hints}
              solutionExplanation={challenge.solution_explanation}
              isCompleted={lesson.isCompleted}
              onSubmitAttempt={handleRefreshLesson}
            />
          </div>
        )}
      </div>
    </div>
  )
}
