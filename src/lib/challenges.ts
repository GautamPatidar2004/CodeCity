import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export interface Challenge {
  id: string
  title: string
  slug: string
  description: string
  difficulty: string
  category: string
  course_id?: string
  lesson_id?: string
  hints?: string[]
  solution_explanation?: string
  is_published: boolean
  created_at: string
}

export interface ChallengeProgress {
  challenge_id: string
  is_completed: boolean
  best_score: number
  attempts_count: number
  last_attempt_at: string
}

export interface ChallengeWithProgress {
  challenge: Challenge
  progress?: ChallengeProgress
  isCompleted: boolean
  attemptsCount: number
}

const FALLBACK_CHALLENGES: Challenge[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    title: 'Variable Swap Matrix',
    slug: 'variable-swap-matrix',
    description: 'Given two variables a and b, swap their values without creating a permanent global state.',
    difficulty: 'Beginner',
    category: 'JavaScript',
    hints: ['Use array destructuring [a, b] = [b, a]', 'Or use a temporary holding variable temp'],
    solution_explanation: 'Array destructuring allows clean swapping in a single atomic statement: [a, b] = [b, a].',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    title: 'Array Filter Pipeline',
    slug: 'array-filter-pipeline',
    description: 'Transform an array of numbers to keep only even positive numbers greater than 10.',
    difficulty: 'Intermediate',
    category: 'JavaScript',
    hints: ['Combine array.filter() with modulo check num % 2 === 0 and num > 10'],
    solution_explanation: 'Use arr.filter(n => n > 10 && n % 2 === 0) for declarative collection filtering.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    title: 'Python List Comprehension Quest',
    slug: 'python-list-comprehension-quest',
    description: 'Generate squares of odd numbers from 1 to 20 using a one-line Python list comprehension.',
    difficulty: 'Beginner',
    category: 'Python',
    hints: ['Syntax: [expr for item in iterable if condition]'],
    solution_explanation: '[x**2 for x in range(1, 21) if x % 2 != 0]',
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    title: 'Stateful Counter Hook',
    slug: 'stateful-counter-hook',
    description: 'Construct a reusable custom hook useCounter with increment, decrement, and reset capabilities.',
    difficulty: 'Intermediate',
    category: 'React',
    hints: ['Use useState(initialValue)', 'Return an object with count and handler functions'],
    solution_explanation: 'Custom hooks encapsulate stateful logic while keeping component render functions clean.',
    is_published: true,
    created_at: new Date().toISOString(),
  },
]

export async function fetchChallengesWithProgress(
  userId?: string,
  category?: string,
  difficulty?: string
): Promise<ChallengeWithProgress[]> {
  try {
    let query = supabase
      .from('challenges')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: true })

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    if (difficulty && difficulty !== 'All') {
      query = query.eq('difficulty', difficulty)
    }

    const { data: challengesData, error } = await query

    const baseList: Challenge[] = !error && challengesData && challengesData.length > 0
      ? (challengesData as Challenge[])
      : (category && category !== 'All' ? FALLBACK_CHALLENGES.filter((c) => c.category === category) : FALLBACK_CHALLENGES)

    const progressMap = new Map<string, ChallengeProgress>()
    if (userId) {
      const { data: progressData } = await supabase
        .from('challenge_progress')
        .select('*')
        .eq('user_id', userId)

      if (progressData) {
        progressData.forEach((p) => {
          progressMap.set(p.challenge_id, {
            challenge_id: p.challenge_id,
            is_completed: p.is_completed,
            best_score: p.best_score || 0,
            attempts_count: p.attempts_count || 0,
            last_attempt_at: p.last_attempt_at,
          })
        })
      }
    }

    return baseList.map((ch) => {
      const prog = progressMap.get(ch.id)
      return {
        challenge: ch,
        progress: prog,
        isCompleted: prog?.is_completed ?? false,
        attemptsCount: prog?.attempts_count ?? 0,
      }
    })
  } catch {
    return FALLBACK_CHALLENGES.map((ch) => ({
      challenge: ch,
      isCompleted: false,
      attemptsCount: 0,
    }))
  }
}

export async function recordChallengeSubmission(
  userId: string,
  challengeId: string,
  passed: boolean,
  score: number = 100
): Promise<void> {
  try {
    const now = new Date().toISOString()

    // 1. Fetch current attempt count
    const { data: existingProgress } = await supabase
      .from('challenge_progress')
      .select('attempts_count, best_score, is_completed')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle()

    const newAttemptsCount = (existingProgress?.attempts_count ?? 0) + 1
    const newBestScore = Math.max(existingProgress?.best_score ?? 0, passed ? score : 0)
    const isCompleted = (existingProgress?.is_completed ?? false) || passed

    // 2. Insert attempt record
    await supabase.from('challenge_attempts').insert({
      user_id: userId,
      challenge_id: challengeId,
      attempt_number: newAttemptsCount,
      status: passed ? 'passed' : 'failed',
      score: passed ? score : 0,
      passed,
      completed_at: now,
    })

    // 3. Upsert overall challenge progress
    await supabase.from('challenge_progress').upsert({
      user_id: userId,
      challenge_id: challengeId,
      is_completed: isCompleted,
      best_score: newBestScore,
      attempts_count: newAttemptsCount,
      last_attempt_at: now,
      completed_at: isCompleted ? now : null,
    }, { onConflict: 'user_id,challenge_id' })
  } catch (err) {
    console.error('Error recording challenge submission:', err)
  }
}

export function useChallenges(userId?: string, category?: string, difficulty?: string) {
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await fetchChallengesWithProgress(userId, category, difficulty)
    setChallenges(result)
    setLoading(false)
  }, [userId, category, difficulty])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      loadData()
    }
    return () => {
      mounted = false
    }
  }, [loadData])

  const submitAttempt = useCallback(
    async (challengeId: string, passed: boolean, score: number = 100) => {
      if (!userId) return
      await recordChallengeSubmission(userId, challengeId, passed, score)
      await loadData()
    },
    [userId, loadData]
  )

  return {
    challenges,
    loading,
    submitAttempt,
    refreshChallenges: loadData,
  }
}
