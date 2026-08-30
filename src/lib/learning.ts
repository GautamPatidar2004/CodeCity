import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export interface Lesson {
  id: string
  chapter_id: string
  title: string
  slug: string
  summary?: string
  order_index: number
}

export interface Chapter {
  id: string
  course_id: string
  title: string
  order_index: number
  lessons?: Lesson[]
}

export interface Course {
  id: string
  path_id?: string
  title: string
  slug: string
  description?: string
  track: string
  difficulty: string
  order_index: number
}

export interface CourseProgressSummary {
  course: Course
  totalLessons: number
  completedLessons: number
  progressPercent: number
  lastAccessedAt?: string
  nextLesson?: Lesson
  isEnrolled: boolean
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

const FALLBACK_COURSES: CourseProgressSummary[] = [
  {
    course: {
      id: 'c0000000-0000-0000-0000-000000000001',
      title: 'The JavaScript Awakening',
      slug: 'javascript-awakening',
      description: 'Master variables, loops, and condition flow in the browser.',
      track: 'JavaScript',
      difficulty: 'Beginner',
      order_index: 1,
    },
    totalLessons: 4,
    completedLessons: 1,
    progressPercent: 25,
    isEnrolled: true,
    nextLesson: {
      id: 'e0000000-0000-0000-0000-000000000002',
      chapter_id: 'd0000000-0000-0000-0000-000000000001',
      title: '02. Strings & Math Operators',
      slug: 'strings-and-math',
      summary: 'Perform operations and string formatting.',
      order_index: 2,
    },
  },
  {
    course: {
      id: 'c0000000-0000-0000-0000-000000000002',
      title: 'Pythonic Dungeon Crawl',
      slug: 'pythonic-dungeon',
      description: 'Construct lists, dictionaries, tuples, and automated scripts.',
      track: 'Python',
      difficulty: 'Intermediate',
      order_index: 2,
    },
    totalLessons: 5,
    completedLessons: 0,
    progressPercent: 0,
    isEnrolled: false,
  },
  {
    course: {
      id: 'c0000000-0000-0000-0000-000000000003',
      title: 'React & Vite Fortress',
      slug: 'react-vite-fortress',
      description: 'Assemble stateful interactive components.',
      track: 'React',
      difficulty: 'Intermediate',
      order_index: 3,
    },
    totalLessons: 6,
    completedLessons: 0,
    progressPercent: 0,
    isEnrolled: false,
  },
]

export async function fetchCoursesWithProgress(userId?: string): Promise<CourseProgressSummary[]> {
  try {
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select(`
        *,
        chapters (
          id,
          title,
          order_index,
          lessons (
            id,
            chapter_id,
            title,
            slug,
            order_index
          )
        )
      `)
      .order('order_index', { ascending: true })

    if (coursesError || !coursesData || coursesData.length === 0) {
      return FALLBACK_COURSES
    }

    const progressMap = new Map<string, boolean>()
    if (userId) {
      const { data: userProgress } = await supabase
        .from('lesson_progress')
        .select('lesson_id, is_completed')
        .eq('user_id', userId)

      if (userProgress) {
        userProgress.forEach((p) => progressMap.set(p.lesson_id, p.is_completed))
      }
    }

    return coursesData.map((courseItem) => {
      const allLessons: Lesson[] = (courseItem.chapters || []).flatMap((ch: Chapter) => ch.lessons || [])
      const totalLessons = allLessons.length || 1
      const completedLessons = allLessons.filter((l) => progressMap.get(l.id) === true).length
      const progressPercent = Math.round((completedLessons / totalLessons) * 100)
      const nextLesson = allLessons.find((l) => !progressMap.get(l.id)) || allLessons[0]

      return {
        course: {
          id: courseItem.id,
          path_id: courseItem.path_id,
          title: courseItem.title,
          slug: courseItem.slug,
          description: courseItem.description,
          track: courseItem.track,
          difficulty: courseItem.difficulty,
          order_index: courseItem.order_index,
        },
        totalLessons,
        completedLessons,
        progressPercent,
        nextLesson,
        isEnrolled: completedLessons > 0,
      }
    })
  } catch {
    return FALLBACK_COURSES
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

    await supabase.from('lesson_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      is_completed: isCompleted,
      completed_at: isCompleted ? now : null,
      last_accessed_at: now,
    }, { onConflict: 'user_id,lesson_id' })

    await supabase.from('enrollments').upsert({
      user_id: userId,
      course_id: courseId,
      last_lesson_id: lessonId,
      last_accessed_at: now,
    }, { onConflict: 'user_id,course_id' })
  } catch (err) {
    console.error('Error recording lesson progress:', err)
  }
}

export function useLearningProgress(userId?: string) {
  const [courses, setCourses] = useState<CourseProgressSummary[]>(FALLBACK_COURSES)
  const [loading, setLoading] = useState(true)

  const loadProgress = useCallback(async () => {
    setLoading(true)
    const result = await fetchCoursesWithProgress(userId)
    setCourses(result)
    setLoading(false)
  }, [userId])

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

  const activeCourse = courses.find((c) => c.isEnrolled && c.progressPercent < 100) || courses[0]
  const resumePoint: ResumePoint | null = activeCourse
    ? {
        courseId: activeCourse.course.id,
        courseTitle: activeCourse.course.title,
        track: activeCourse.course.track,
        lessonId: activeCourse.nextLesson?.id || '',
        lessonTitle: activeCourse.nextLesson?.title || 'Next Lesson',
        lessonSlug: activeCourse.nextLesson?.slug || 'next-lesson',
        progressPercent: activeCourse.progressPercent,
        completedCount: activeCourse.completedLessons,
        totalCount: activeCourse.totalLessons,
      }
    : null

  return {
    courses,
    resumePoint,
    loading,
    completeLesson,
    refreshProgress: loadProgress,
  }
}
