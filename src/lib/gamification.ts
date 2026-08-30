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
      .single()

    const newXp = (currentProfile?.xp ?? 0) + amount
    const newLevel = calculateLevelFromXp(newXp)
    const newStreak = currentProfile?.streak ?? 1
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

    return { awarded: true, xp: newXp, level: newLevel, streak: newStreak }
  } catch (err) {
    console.error('Error awarding XP:', err)
    return { awarded: false }
  }
}

export function useGamification(userId?: string, initialXp?: number, initialStreak?: number, initialLevel?: number) {
  const [stats, setStats] = useState<GamificationStats>(() => {
    const xp = initialXp ?? 120
    const level = initialLevel ?? calculateLevelFromXp(xp)
    const streak = initialStreak ?? 3
    const dailyGoalXp = 50
    const dailyXpEarned = 50
    return {
      xp,
      level,
      streak,
      dailyGoalXp,
      dailyXpEarned,
      dailyGoalCompleted: dailyXpEarned >= dailyGoalXp,
      dailyGoalPercent: Math.min(100, Math.round((dailyXpEarned / dailyGoalXp) * 100)),
      nextLevelXp: level * 200,
      currentLevelBaseXp: (level - 1) * 200,
    }
  })

  const loadStats = useCallback(async () => {
    if (!userId) return

    try {
      const { data } = await supabase
        .from('profiles')
        .select('xp, level, streak, daily_goal_xp, daily_xp_earned')
        .eq('id', userId)
        .single()

      if (data) {
        const xp = data.xp ?? 120
        const level = data.level ?? calculateLevelFromXp(xp)
        const streak = data.streak ?? 1
        const dailyGoalXp = data.daily_goal_xp || 50
        const dailyXpEarned = data.daily_xp_earned || 0

        setStats({
          xp,
          level,
          streak,
          dailyGoalXp,
          dailyXpEarned,
          dailyGoalCompleted: dailyXpEarned >= dailyGoalXp,
          dailyGoalPercent: Math.min(100, Math.round((dailyXpEarned / dailyGoalXp) * 100)),
          nextLevelXp: level * 200,
          currentLevelBaseXp: (level - 1) * 200,
        })
      }
    } catch {
      // Retain current stats
    }
  }, [userId])

  useEffect(() => {
    let mounted = true
    if (userId && mounted) {
      loadStats()
    }
    return () => {
      mounted = false
    }
  }, [userId, loadStats])

  const triggerXpAward = useCallback(
    async (amount: number, sourceType: string, sourceId: string) => {
      if (!userId) return { awarded: false }
      const res = await awardXp(userId, amount, sourceType, sourceId)
      if (res.awarded) {
        await loadStats()
      }
      return res
    },
    [userId, loadStats]
  )

  return {
    stats,
    awardXp: triggerXpAward,
    refreshGamification: loadStats,
  }
}
