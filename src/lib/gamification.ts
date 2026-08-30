import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export interface GamificationStats {
  xp: number
  level: number
  streak: number
  dailyGoalXp: number
  dailyXpEarned: number
  dailyGoalCompleted: boolean
  dailyGoalPercent: number
  nextLevelXp: number
  currentLevelBaseXp: number
}

export function calculateLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(xp / 200) + 1)
}

export async function updateStreakAndDailyActivity(userId: string): Promise<number> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, last_active_date')
      .eq('id', userId)
      .maybeSingle()

    if (!profile) return 0

    const todayStr = new Date().toISOString().split('T')[0]
    const lastActiveStr = profile.last_active_date ? new Date(profile.last_active_date).toISOString().split('T')[0] : null

    let newStreak = profile.streak || 0

    if (!lastActiveStr) {
      newStreak = 1
    } else if (lastActiveStr === todayStr) {
      newStreak = Math.max(1, newStreak)
    } else {
      const todayDate = new Date(todayStr).getTime()
      const lastDate = new Date(lastActiveStr).getTime()
      const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        newStreak += 1
      } else {
        newStreak = 1
      }
    }

    await supabase
      .from('profiles')
      .update({
        streak: newStreak,
        last_active_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    return newStreak
  } catch (err) {
    console.error('Error updating streak:', err)
    return 0
  }
}

export async function awardXp(
  userId: string,
  amount: number,
  sourceType: string,
  sourceId: string
): Promise<{ awarded: boolean; xp?: number; level?: number; streak?: number }> {
  try {
    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_amount: amount,
      p_source_type: sourceType,
      p_source_id: sourceId,
    })

    if (!error && data) {
      await updateStreakAndDailyActivity(userId)
      return data as { awarded: boolean; xp: number; level: number; streak: number }
    }

    // Client-side fallback if RPC is not enabled on remote Supabase instance
    const { data: existingTx } = await supabase
      .from('xp_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .maybeSingle()

    if (existingTx) {
      return { awarded: false }
    }

    await supabase.from('xp_transactions').insert({
      user_id: userId,
      amount,
      source_type: sourceType,
      source_id: sourceId,
    })

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('xp, level, streak, daily_xp_earned')
      .eq('id', userId)
      .maybeSingle()

    const newXp = (currentProfile?.xp ?? 0) + amount
    const newLevel = calculateLevelFromXp(newXp)
    const newDailyXp = (currentProfile?.daily_xp_earned ?? 0) + amount

    await supabase
      .from('profiles')
      .update({
        xp: newXp,
        level: newLevel,
        daily_xp_earned: newDailyXp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    const newStreak = await updateStreakAndDailyActivity(userId)

    return { awarded: true, xp: newXp, level: newLevel, streak: newStreak }
  } catch (err) {
    console.error('Error awarding XP:', err)
    return { awarded: false }
  }
}

export function useGamification(userId?: string, initialXp?: number, initialStreak?: number, initialLevel?: number) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<GamificationStats>(() => {
    const xp = initialXp ?? 0
    const level = initialLevel ?? calculateLevelFromXp(xp)
    const streak = initialStreak ?? 0
    const dailyGoalXp = 50
    const dailyXpEarned = 0
    return {
      xp,
      level,
      streak,
      dailyGoalXp,
      dailyXpEarned,
      dailyGoalCompleted: false,
      dailyGoalPercent: 0,
      nextLevelXp: level * 200,
      currentLevelBaseXp: (level - 1) * 200,
    }
  })

  const loadStats = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('xp, level, streak, daily_goal_xp, daily_xp_earned')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        const xp = data.xp ?? 0
        const level = data.level ?? calculateLevelFromXp(xp)
        const streak = data.streak ?? 0
        const dailyGoalXp = data.daily_goal_xp ?? 50
        const dailyXpEarned = data.daily_xp_earned ?? 0

        setStats({
          xp,
          level,
          streak,
          dailyGoalXp,
          dailyXpEarned,
          dailyGoalCompleted: dailyGoalXp > 0 && dailyXpEarned >= dailyGoalXp,
          dailyGoalPercent: dailyGoalXp > 0 ? Math.min(100, Math.round((dailyXpEarned / dailyGoalXp) * 100)) : 0,
          nextLevelXp: level * 200,
          currentLevelBaseXp: (level - 1) * 200,
        })
      }
    } catch (err) {
      console.error('Error loading gamification stats:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    let mounted = true
    if (userId && mounted) {
      loadStats()
    } else if (!userId) {
      setLoading(false)
    }
    return () => {
      mounted = false
    }
  }, [userId, loadStats])

  return {
    stats,
    loading,
    awardXp: (amount: number, sourceType: string, sourceId: string) =>
      userId ? awardXp(userId, amount, sourceType, sourceId) : Promise.resolve({ awarded: false }),
    refreshGamification: loadStats,
  }
}
