import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { awardXp } from './gamification'
import { recordUserActivity, createUserNotification, syncUserBadgesAndAchievements } from './achievements'

export interface Language {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
  description?: string
  order_index: number
  is_published: boolean
}

export interface Lesson {
  id: string
  chapter_id: string
  title: string
  slug: string
  summary?: string
  content?: string
  order_index: number
}

export interface Chapter {
  id: string
  course_id: string
  title: string
  order_index: number
  lessons?: Lesson[]
}

export interface ChapterProgressSummary {
  id: string
  course_id: string
  title: string
  order_index: number
  totalLessons: number
  completedLessons: number
  progressPercent: number
  isCompleted: boolean
  lessons: (Lesson & { isCompleted: boolean })[]
}

export interface Course {
  id: string
  path_id?: string
  language_id?: string
  prerequisite_course_id?: string | null
  title: string
  slug: string
  description?: string
  track: string
  difficulty: string
  order_index: number
  is_published?: boolean
}

export interface CourseProgressSummary {
  course: Course
  chapters: ChapterProgressSummary[]
  totalLessons: number
  completedLessons: number
  progressPercent: number
  isCompleted: boolean
  lastAccessedAt?: string
  nextLesson?: Lesson
  isEnrolled: boolean
  isUnlocked: boolean
  prerequisiteCourseTitle?: string
}

export interface LearningPath {
  id: string
  language_id?: string
  language?: Language
  title: string
  slug: string
  description?: string
  icon?: string
  island_name?: string
  order_index: number
  is_published: boolean
  courses?: CourseProgressSummary[]
  totalLessons: number
  completedLessons: number
  progressPercent: number
  totalCourses: number
  completedCourses: number
  isCompleted: boolean
}

export interface OverallLearnerProgress {
  totalLessons: number
  completedLessons: number
  totalCourses: number
  completedCourses: number
  totalIslands: number
  completedIslands: number
  progressPercent: number
}

export interface ResumePoint {
  courseId: string
  courseTitle: string
  track: string
  lessonId: string
  lessonTitle: string
  lessonSlug: string
  chapterTitle?: string
  progressPercent: number
  completedCount: number
  totalCount: number
}

export interface LessonNavInfo {
  id: string
  courseId: string
  title: string
}

export interface LessonDetail {
  id: string
  chapterId: string
  chapterTitle: string
  courseId: string
  courseTitle: string
  track: string
  title: string
  slug: string
  summary?: string
  content?: string
  orderIndex: number
  isCompleted: boolean
  challenge?: {
    id: string
    title: string
    description: string
    starter_code?: string
    language?: string
    instructions?: string
    sample_input?: string
    hints?: string[]
    solution_explanation?: string
  }
  prevLesson?: LessonNavInfo
  nextLesson?: LessonNavInfo
}

const DEFAULT_LANGUAGES: Language[] = [
  { id: 'l-js', name: 'JavaScript', slug: 'javascript', icon: '⚡', color: '#F7DF1E', description: 'The web scripting language', order_index: 1, is_published: true },
  { id: 'l-py', name: 'Python', slug: 'python', icon: '🐍', color: '#3776AB', description: 'Beginner-friendly language', order_index: 2, is_published: true },
  { id: 'l-react', name: 'React', slug: 'react', icon: '⚛️', color: '#61DAFB', description: 'UI component framework', order_index: 3, is_published: true },
  { id: 'l-cpp', name: 'C++', slug: 'cpp', icon: '⚙️', color: '#00599C', description: 'Fast systems programming', order_index: 4, is_published: true },
  { id: 'l-java', name: 'Java', slug: 'java', icon: '☕', color: '#ED8B00', description: 'Object-oriented platform', order_index: 5, is_published: true },
  { id: 'l-backend', name: 'Backend', slug: 'backend', icon: '🛠️', color: '#10B981', description: 'Server architectures', order_index: 6, is_published: true },
]

export async function fetchLanguages(): Promise<Language[]> {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')

    if (error || !data || data.length === 0) {
      return DEFAULT_LANGUAGES
    }

    return (data as Language[]).filter((l) => l.is_published !== false)
  } catch {
    return DEFAULT_LANGUAGES
  }
}

export async function fetchCoursesWithProgress(
  userId?: string,
  languageFilter?: string
): Promise<CourseProgressSummary[]> {
  try {
    let coursesQuery = supabase.from('courses').select('*')
    if (languageFilter && languageFilter !== 'All') {
      coursesQuery = coursesQuery.eq('track', languageFilter)
    }

    const [coursesRes, chaptersRes, lessonsRes] = await Promise.all([
      coursesQuery,
      supabase.from('chapters').select('*'),
      supabase.from('lessons').select('*'),
    ])

    const rawCourses = (coursesRes.data || []).filter((c) => c.is_published !== false)
    if (rawCourses.length === 0) return []

    const allChapters = chaptersRes.data || []
    const allLessons = lessonsRes.data || []

    // Group lessons by chapter_id
    const lessonsByChapter = new Map<string, Lesson[]>()
    allLessons.forEach((l) => {
      const list = lessonsByChapter.get(l.chapter_id) || []
      list.push(l)
      lessonsByChapter.set(l.chapter_id, list)
    })

    // Group chapters by course_id
    const chaptersByCourse = new Map<string, Chapter[]>()
    allChapters.forEach((ch) => {
      const list = chaptersByCourse.get(ch.course_id) || []
      list.push({
        ...ch,
        lessons: (lessonsByChapter.get(ch.id) || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
      })
      chaptersByCourse.set(ch.course_id, list)
    })

    // User progress maps
    const progressMap = new Map<string, boolean>()
    const enrollmentMap = new Map<string, { last_lesson_id?: string; last_accessed_at?: string }>()

    if (userId) {
      const [progRes, enrollRes] = await Promise.all([
        supabase.from('lesson_progress').select('lesson_id, is_completed').eq('user_id', userId),
        supabase.from('enrollments').select('course_id, last_lesson_id, last_accessed_at').eq('user_id', userId),
      ])
      if (progRes.data) {
        progRes.data.forEach((p) => {
          if (p.is_completed) progressMap.set(p.lesson_id, true)
        })
      }
      if (enrollRes.data) {
        enrollRes.data.forEach((e) => {
          enrollmentMap.set(e.course_id, {
            last_lesson_id: e.last_lesson_id,
            last_accessed_at: e.last_accessed_at,
          })
        })
      }
    }

    // Calculate completion map for unlocking
    const courseCompletionMap = new Map<string, boolean>()
    const courseTitleMap = new Map<string, string>()
    rawCourses.forEach((c) => courseTitleMap.set(c.id, c.title))

    const coursesWithChapters = rawCourses.map((c) => {
      const chapters = (chaptersByCourse.get(c.id) || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      const allCourseLessons = chapters.flatMap((ch) => ch.lessons || [])
      const total = allCourseLessons.length
      const completed = allCourseLessons.filter((l) => progressMap.get(l.id) === true).length
      const isDone = total > 0 && completed === total
      courseCompletionMap.set(c.id, isDone)

      const chaptersWithProg: ChapterProgressSummary[] = chapters.map((ch) => {
        const chLessons = ch.lessons || []
        const chLessonsWithProg = chLessons.map((l) => ({
          ...l,
          isCompleted: progressMap.get(l.id) === true,
        }))
        const chTotal = chLessonsWithProg.length
        const chComp = chLessonsWithProg.filter((l) => l.isCompleted).length
        return {
          id: ch.id,
          course_id: c.id,
          title: ch.title,
          order_index: ch.order_index ?? 0,
          totalLessons: chTotal,
          completedLessons: chComp,
          progressPercent: chTotal > 0 ? Math.round((chComp / chTotal) * 100) : 0,
          isCompleted: chTotal > 0 && chComp === chTotal,
          lessons: chLessonsWithProg,
        }
      })

      return {
        course: c,
        chapters: chaptersWithProg,
        allLessons: allCourseLessons,
        totalLessons: total,
        completedLessons: completed,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        isCompleted: isDone,
      }
    })

    return coursesWithChapters.map(({ course, chapters, allLessons, totalLessons, completedLessons, progressPercent, isCompleted }) => {
      const nextLesson = allLessons.find((l) => !progressMap.get(l.id))
      const enrollmentInfo = enrollmentMap.get(course.id)
      const isEnrolled = Boolean(enrollmentInfo || completedLessons > 0)
      const prereqId = course.prerequisite_course_id
      const isUnlocked = !prereqId || Boolean(courseCompletionMap.get(prereqId))

      return {
        course: {
          id: course.id,
          path_id: course.path_id,
          language_id: course.language_id,
          prerequisite_course_id: prereqId,
          title: course.title,
          slug: course.slug,
          description: course.description,
          track: course.track,
          difficulty: course.difficulty,
          order_index: course.order_index ?? 0,
          is_published: course.is_published,
        },
        chapters,
        totalLessons,
        completedLessons,
        progressPercent,
        isCompleted,
        nextLesson,
        isEnrolled,
        isUnlocked,
        prerequisiteCourseTitle: prereqId ? courseTitleMap.get(prereqId) : undefined,
        lastAccessedAt: enrollmentInfo?.last_accessed_at,
      }
    }).sort((a, b) => (a.course.order_index ?? 0) - (b.course.order_index ?? 0))
  } catch (err) {
    console.error('Error fetching courses with progress:', err)
    return []
  }
}

export async function fetchLearningPathsWithProgress(
  userId?: string,
  languageFilter?: string
): Promise<LearningPath[]> {
  try {
    const [pathsRes, allCourses] = await Promise.all([
      supabase.from('learning_paths').select('*'),
      fetchCoursesWithProgress(userId, languageFilter),
    ])

    const rawPaths = (pathsRes.data || []).filter((p) => p.is_published !== false)
    if (rawPaths.length === 0) return []

    const coursesByPath = new Map<string, CourseProgressSummary[]>()
    allCourses.forEach((c) => {
      if (c.course.path_id) {
        const list = coursesByPath.get(c.course.path_id) || []
        list.push(c)
        coursesByPath.set(c.course.path_id, list)
      }
    })

    return rawPaths.map((p) => {
      const pathCourses = (coursesByPath.get(p.id) || []).sort((a, b) => (a.course.order_index ?? 0) - (b.course.order_index ?? 0))
      const totalLessons = pathCourses.reduce((acc, c) => acc + c.totalLessons, 0)
      const completedLessons = pathCourses.reduce((acc, c) => acc + c.completedLessons, 0)
      const totalCourses = pathCourses.length
      const completedCourses = pathCourses.filter((c) => c.isCompleted).length

      return {
        id: p.id,
        language_id: p.language_id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        icon: p.icon,
        island_name: p.island_name,
        order_index: p.order_index ?? 0,
        is_published: p.is_published ?? true,
        courses: pathCourses,
        totalLessons,
        completedLessons,
        progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        totalCourses,
        completedCourses,
        isCompleted: totalCourses > 0 && completedCourses === totalCourses,
      }
    }).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  } catch (err) {
    console.error('Error fetching learning paths:', err)
    return []
  }
}

export async function fetchLessonDetail(lessonId: string, userId?: string): Promise<LessonDetail | null> {
  try {
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single()

    if (lessonError || !lessonData) {
      return null
    }

    const { data: chapterData } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', lessonData.chapter_id)
      .single()

    if (!chapterData) return null

    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', chapterData.course_id)
      .single()

    if (!courseData || courseData.is_published === false) return null

    const courseId = courseData.id

    // Fetch all chapters and lessons in this course to compute true cross-module ordering
    const { data: courseChapters } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', courseId)

    const chapterIds = (courseChapters || []).map((ch) => ch.id)
    const { data: courseLessons } = await supabase
      .from('lessons')
      .select('*')
      .in('chapter_id', chapterIds)

    const sortedChapters = (courseChapters || []).slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    const lessonsByChId = new Map<string, Lesson[]>()
    ;(courseLessons || []).forEach((l) => {
      const list = lessonsByChId.get(l.chapter_id) || []
      list.push(l)
      lessonsByChId.set(l.chapter_id, list)
    })

    const flattenedLessons: Array<{ id: string; title: string; courseId: string }> = []
    sortedChapters.forEach((ch) => {
      const sortedL = (lessonsByChId.get(ch.id) || []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      sortedL.forEach((l) => {
        flattenedLessons.push({
          id: l.id,
          title: l.title,
          courseId,
        })
      })
    })

    const currentIndex = flattenedLessons.findIndex((l) => l.id === lessonId)
    const prevLesson = currentIndex > 0 ? flattenedLessons[currentIndex - 1] : undefined
    const nextLesson = currentIndex >= 0 && currentIndex < flattenedLessons.length - 1 ? flattenedLessons[currentIndex + 1] : undefined

    let isCompleted = false
    if (userId) {
      const now = new Date().toISOString()
      const [progressRes, existingEnrollRes] = await Promise.all([
        supabase
          .from('lesson_progress')
          .select('is_completed')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .maybeSingle(),
        supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle(),
      ])

      isCompleted = Boolean(progressRes.data?.is_completed)

      if (existingEnrollRes.data?.id) {
        await supabase
          .from('enrollments')
          .update({ last_lesson_id: lessonId, last_accessed_at: now })
          .eq('id', existingEnrollRes.data.id)
      } else {
        await supabase
          .from('enrollments')
          .insert({
            user_id: userId,
            course_id: courseId,
            last_lesson_id: lessonId,
            last_accessed_at: now,
          })
      }
    }

    const { data: challengeData } = await supabase
      .from('challenges')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('is_published', true)
      .maybeSingle()

    return {
      id: lessonData.id,
      chapterId: lessonData.chapter_id,
      chapterTitle: chapterData.title,
      courseId,
      courseTitle: courseData.title,
      track: courseData.track,
      title: lessonData.title,
      slug: lessonData.slug,
      summary: lessonData.summary,
      content: lessonData.content,
      orderIndex: lessonData.order_index ?? 0,
      isCompleted,
      challenge: challengeData
        ? {
            id: challengeData.id,
            title: challengeData.title,
            description: challengeData.description || challengeData.instructions || '',
            starter_code: challengeData.starter_code || undefined,
            language: challengeData.language || undefined,
            instructions: challengeData.instructions || challengeData.description || undefined,
            sample_input: challengeData.sample_input || undefined,
            hints: challengeData.hints || [],
            solution_explanation: challengeData.solution_explanation || undefined,
          }
        : undefined,
      prevLesson,
      nextLesson,
    }
  } catch (err) {
    console.error('Error fetching lesson detail:', err)
    return null
  }
}

export async function recordLessonCompletion(
  userId: string,
  courseId: string,
  lessonId: string,
  isCompleted: boolean = true
): Promise<void> {
  try {
    const now = new Date().toISOString()

    const [existingProgressRes, existingEnrollRes] = await Promise.all([
      supabase
        .from('lesson_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle(),
      supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle(),
    ])

    if (existingProgressRes.data?.id) {
      await supabase
        .from('lesson_progress')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? now : null,
          last_accessed_at: now,
        })
        .eq('id', existingProgressRes.data.id)
    } else {
      await supabase
        .from('lesson_progress')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          is_completed: isCompleted,
          completed_at: isCompleted ? now : null,
          last_accessed_at: now,
        })
    }

    if (existingEnrollRes.data?.id) {
      await supabase
        .from('enrollments')
        .update({
          last_lesson_id: lessonId,
          last_accessed_at: now,
        })
        .eq('id', existingEnrollRes.data.id)
    } else {
      await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          last_lesson_id: lessonId,
          last_accessed_at: now,
        })
    }

    if (isCompleted) {
      // 1. Idempotently award Lesson Completion XP (25 XP)
      const xpRes = await awardXp(userId, 25, 'lesson_completed', lessonId)
      if (xpRes.awarded) {
        await recordUserActivity(userId, 'lesson_completed', 'Completed a coding lesson (+25 XP) 📖')
      }

      // 2. Check if all lessons in course are completed
      const { data: chaptersData } = await supabase
        .from('chapters')
        .select('lessons(id)')
        .eq('course_id', courseId)

      const allCourseLessonIds = (chaptersData || []).flatMap((c: any) => (c.lessons || []).map((l: any) => l.id))
      if (allCourseLessonIds.length > 0) {
        const { data: userCompletedLessons } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('is_completed', true)
          .in('lesson_id', allCourseLessonIds)

        if (userCompletedLessons && userCompletedLessons.length === allCourseLessonIds.length) {
          // Course fully completed! Award 150 XP
          const courseXpRes = await awardXp(userId, 150, 'course_completed', courseId)
          if (courseXpRes.awarded) {
            await recordUserActivity(userId, 'course_completed', 'Mastered an entire coding course (+150 XP) 🎓')
            await createUserNotification(
              userId,
              'Course Mastered! 🎓',
              'Outstanding! You have completed all lessons in the course and earned 150 XP!',
              '🎓'
            )
          }
        }
      }

      // 3. Sync badges and achievements
      await syncUserBadgesAndAchievements(userId)
    }
  } catch (err) {
    console.error('Error recording lesson progress:', err)
  }
}

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  const loadLanguages = useCallback(async () => {
    setLoading(true)
    const result = await fetchLanguages()
    setLanguages(result)
    setLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      loadLanguages()
    }
    return () => {
      mounted = false
    }
  }, [loadLanguages])

  return { languages, loading, refreshLanguages: loadLanguages }
}

export function useLearningProgress(userId?: string, languageFilter?: string) {
  const [courses, setCourses] = useState<CourseProgressSummary[]>([])
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)

  const loadProgress = useCallback(async () => {
    setLoading(true)
    const [coursesResult, pathsResult] = await Promise.all([
      fetchCoursesWithProgress(userId, languageFilter),
      fetchLearningPathsWithProgress(userId, languageFilter),
    ])
    setCourses(coursesResult)
    setLearningPaths(pathsResult)
    setLoading(false)
  }, [userId, languageFilter])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      loadProgress()
    }
    return () => {
      mounted = false
    }
  }, [loadProgress])

  const completeLesson = useCallback(async (courseId: string, lessonId: string) => {
    if (!userId) return
    await recordLessonCompletion(userId, courseId, lessonId, true)
    await loadProgress()
  }, [userId, loadProgress])

  // Determine real active resume point from unlocked enrolled/active courses
  const enrolledIncomplete = courses.filter((c) => c.isUnlocked && c.isEnrolled && !c.isCompleted && c.nextLesson)
  enrolledIncomplete.sort((a, b) => {
    const timeA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0
    const timeB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0
    return timeB - timeA
  })

  const activeCourse = enrolledIncomplete[0] || courses.find((c) => c.isUnlocked && !c.isCompleted && c.nextLesson)

  const resumePoint: ResumePoint | null = activeCourse && activeCourse.nextLesson
    ? {
        courseId: activeCourse.course.id,
        courseTitle: activeCourse.course.title,
        track: activeCourse.course.track,
        lessonId: activeCourse.nextLesson.id,
        lessonTitle: activeCourse.nextLesson.title,
        lessonSlug: activeCourse.nextLesson.slug,
        progressPercent: activeCourse.progressPercent,
        completedCount: activeCourse.completedLessons,
        totalCount: activeCourse.totalLessons,
      }
    : null

  // Overall Learner Progress
  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0)
  const completedLessons = courses.reduce((acc, c) => acc + c.completedLessons, 0)
  const totalCourses = courses.length
  const completedCourses = courses.filter((c) => c.isCompleted).length
  const totalIslands = learningPaths.length
  const completedIslands = learningPaths.filter((p) => p.isCompleted).length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const overallProgress: OverallLearnerProgress = {
    totalLessons,
    completedLessons,
    totalCourses,
    completedCourses,
    totalIslands,
    completedIslands,
    progressPercent,
  }

  return {
    courses,
    learningPaths,
    resumePoint,
    overallProgress,
    loading,
    completeLesson,
    refreshProgress: loadProgress,
  }
}

export async function createLanguage(lang: Omit<Language, 'id'>): Promise<Language | null> {
  try {
    const { data, error } = await supabase.from('languages').insert(lang).select().single()
    if (error || !data) return null
    return data as Language
  } catch {
    return null
  }
}

export async function updateLanguage(id: string, updates: Partial<Language>): Promise<boolean> {
  try {
    const { error } = await supabase.from('languages').update(updates).eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function deleteLanguage(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('languages').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function createAdminLearningPath(path: {
  title: string
  slug: string
  description?: string
  icon?: string
  island_name?: string
  language_id?: string
  order_index?: number
  is_published?: boolean
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('learning_paths').insert(path)
    return !error
  } catch {
    return false
  }
}

export async function updateAdminLearningPath(id: string, updates: Partial<LearningPath>): Promise<boolean> {
  try {
    const { error } = await supabase.from('learning_paths').update(updates).eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function deleteAdminLearningPath(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('learning_paths').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function createAdminCourse(course: {
  title: string
  slug: string
  description?: string
  track: string
  difficulty: string
  path_id?: string
  language_id?: string
  prerequisite_course_id?: string | null
  order_index?: number
  is_published?: boolean
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('courses').insert(course)
    return !error
  } catch {
    return false
  }
}

export async function updateAdminCourse(id: string, updates: Partial<Course>): Promise<boolean> {
  try {
    const { error } = await supabase.from('courses').update(updates).eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function deleteAdminCourse(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('courses').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function createAdminChapter(chapter: {
  course_id: string
  title: string
  order_index?: number
}): Promise<Chapter | null> {
  try {
    const { data, error } = await supabase.from('chapters').insert(chapter).select().single()
    if (error || !data) return null
    return data as Chapter
  } catch {
    return null
  }
}

export async function updateAdminChapter(id: string, updates: Partial<Chapter>): Promise<boolean> {
  try {
    const { error } = await supabase.from('chapters').update(updates).eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function deleteAdminChapter(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('chapters').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function createAdminLesson(lesson: {
  chapter_id: string
  title: string
  slug: string
  summary?: string
  content?: string
  order_index?: number
}): Promise<Lesson | null> {
  try {
    const { data, error } = await supabase.from('lessons').insert(lesson).select().single()
    if (error || !data) return null
    return data as Lesson
  } catch {
    return null
  }
}

export async function updateAdminLesson(id: string, updates: Partial<Lesson>): Promise<boolean> {
  try {
    const { error } = await supabase.from('lessons').update(updates).eq('id', id)
    return !error
  } catch {
    return false
  }
}

export async function deleteAdminLesson(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('lessons').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}
