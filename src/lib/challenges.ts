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
  starter_code?: string
  language?: string
  instructions?: string
  sample_input?: string
  order_index?: number
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

    if (error || !challengesData || challengesData.length === 0) {
      return []
    }

    const baseList: Challenge[] = challengesData as Challenge[]

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
  } catch (err) {
    console.error('Error fetching challenges with progress:', err)
    return []
  }
}

export async function fetchAdminChallenges(): Promise<Challenge[]> {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: true })

    if (error || !data) {
      return []
    }

    return data as Challenge[]
  } catch (err) {
    console.error('Error fetching admin challenges:', err)
    return []
  }
}

export async function createAdminChallenge(challengeData: Partial<Challenge>): Promise<Challenge | null> {
  try {
    const slug = challengeData.slug || challengeData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `challenge-${Date.now()}`
    
    // First try full payload
    const fullPayload: Record<string, any> = {
      title: challengeData.title,
      slug,
      description: challengeData.description || challengeData.instructions || '',
      difficulty: challengeData.difficulty || 'Beginner',
      category: challengeData.category || 'JavaScript',
      course_id: challengeData.course_id || null,
      lesson_id: challengeData.lesson_id || null,
      starter_code: challengeData.starter_code || '',
      language: challengeData.language || 'javascript',
      instructions: challengeData.instructions || challengeData.description || '',
      sample_input: challengeData.sample_input || '',
      hints: challengeData.hints || [],
      solution_explanation: challengeData.solution_explanation || null,
      is_published: challengeData.is_published ?? true,
    }

    const { data, error } = await supabase
      .from('challenges')
      .insert(fullPayload)
      .select()
      .single()

    if (!error && data) {
      return data as Challenge
    }

    // Fallback to base table schema if extra columns are not present
    const basePayload = {
      title: challengeData.title,
      slug,
      description: challengeData.description || challengeData.instructions || '',
      difficulty: challengeData.difficulty || 'Beginner',
      category: challengeData.category || 'JavaScript',
      course_id: challengeData.course_id || null,
      lesson_id: challengeData.lesson_id || null,
      hints: challengeData.hints || [],
      solution_explanation: challengeData.solution_explanation || null,
      is_published: challengeData.is_published ?? true,
    }

    const { data: baseData, error: baseError } = await supabase
      .from('challenges')
      .insert(basePayload)
      .select()
      .single()

    if (baseError || !baseData) {
      console.error('Error creating challenge:', baseError || error)
      return null
    }

    return baseData as Challenge
  } catch (err) {
    console.error('Error creating challenge:', err)
    return null
  }
}

export async function updateAdminChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge | null> {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Error updating challenge:', error)
      return null
    }

    return data as Challenge
  } catch (err) {
    console.error('Error updating challenge:', err)
    return null
  }
}

export async function deleteAdminChallenge(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)

    return !error
  } catch (err) {
    console.error('Error deleting challenge:', err)
    return false
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

    const { data: existingProgress } = await supabase
      .from('challenge_progress')
      .select('attempts_count, best_score, is_completed')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle()

    const newAttemptsCount = (existingProgress?.attempts_count ?? 0) + 1
    const newBestScore = Math.max(existingProgress?.best_score ?? 0, passed ? score : 0)
    const isCompleted = (existingProgress?.is_completed ?? false) || passed

    await supabase.from('challenge_attempts').insert({
      user_id: userId,
      challenge_id: challengeId,
      attempt_number: newAttemptsCount,
      status: passed ? 'passed' : 'failed',
      score: passed ? score : 0,
      passed,
      completed_at: now,
    })

    if (existingProgress) {
      await supabase
        .from('challenge_progress')
        .update({
          is_completed: isCompleted,
          best_score: newBestScore,
          attempts_count: newAttemptsCount,
          last_attempt_at: now,
          completed_at: isCompleted ? now : null,
        })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
    } else {
      await supabase
        .from('challenge_progress')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          is_completed: isCompleted,
          best_score: newBestScore,
          attempts_count: newAttemptsCount,
          last_attempt_at: now,
          completed_at: isCompleted ? now : null,
        })
    }
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
