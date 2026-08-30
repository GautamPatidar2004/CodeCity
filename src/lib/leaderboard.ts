import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { calculateLevelFromXp } from './gamification'

export type LeaderboardPeriod = 'all_time' | 'weekly' | 'monthly'

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  title: string
  xp: string
  rawXp: number
  level: number
  badge: string
  isCurrent?: boolean
  role?: string
}

export interface UserRankInfo {
  rank: number
  xp: number
  level: number
}

function getTitleForLevel(level: number, role?: string): string {
  if (role === 'admin') return 'Staff Administrator'
  if (level >= 25) return 'Grandmaster Coder'
  if (level >= 18) return 'Algorithm Wizard'
  if (level >= 12) return 'React Trailblazer'
  if (level >= 6) return 'Syntax Champion'
  return 'Novice Adventurer'
}

function getBadgeForRank(rank: number, isCurrent = false): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return isCurrent ? '⭐' : `#${rank}`
}

export async function fetchLeaderboard(
  limit = 10,
  currentUserId?: string,
  period: LeaderboardPeriod = 'all_time'
): Promise<LeaderboardEntry[]> {
  try {
    let entries: Array<{
      rank: number
      id: string
      username: string | null
      full_name: string | null
      role: string | null
      xp: number
      level: number
    }> = []

    if (period === 'all_time') {
      // 1. Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_leaderboard', { limit_count: limit })

      if (!rpcError && rpcData && rpcData.length > 0) {
        entries = rpcData.map((item: { rank: number | string; id: string; username: string; full_name: string; role: string; xp: number; level: number }) => ({
          rank: Number(item.rank),
          id: item.id,
          username: item.username,
          full_name: item.full_name,
          role: item.role,
          xp: item.xp ?? 0,
          level: item.level ?? 1,
        }))
      } else {
        // Fallback query directly on profiles
        const { data: directData, error: directError } = await supabase
          .from('profiles')
          .select('id, username, full_name, role, xp, level')
          .order('xp', { ascending: false })
          .order('created_at', { ascending: true })
          .limit(limit)

        if (!directError && directData && directData.length > 0) {
          entries = directData.map((item, index) => ({
            rank: index + 1,
            id: item.id,
            username: item.username,
            full_name: item.full_name,
            role: item.role,
            xp: item.xp ?? 0,
            level: item.level ?? calculateLevelFromXp(item.xp ?? 0),
          }))
        }
      }
    } else {
      // 2. Weekly or Monthly ranking derived from xp_transactions
      const days = period === 'weekly' ? 7 : 30
      const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      const [txRes, profilesRes] = await Promise.all([
        supabase
          .from('xp_transactions')
          .select('user_id, amount')
          .gte('created_at', threshold),
        supabase
          .from('profiles')
          .select('id, username, full_name, role, level'),
      ])

      const userPeriodXpMap = new Map<string, number>()
      if (txRes.data) {
        txRes.data.forEach((tx) => {
          userPeriodXpMap.set(tx.user_id, (userPeriodXpMap.get(tx.user_id) || 0) + (tx.amount || 0))
        })
      }

      const profileMap = new Map((profilesRes.data || []).map((p) => [p.id, p]))

      const sortedUsers = Array.from(userPeriodXpMap.entries())
        .map(([userId, xp]) => {
          const prof = profileMap.get(userId)
          return {
            id: userId,
            username: prof?.username || null,
            full_name: prof?.full_name || null,
            role: prof?.role || null,
            xp,
            level: prof?.level ?? calculateLevelFromXp(xp),
          }
        })
        .sort((a, b) => b.xp - a.xp)
        .slice(0, limit)

      entries = sortedUsers.map((u, idx) => ({
        rank: idx + 1,
        ...u,
      }))
    }

    if (entries.length === 0) {
      return []
    }

    const leaderboard: LeaderboardEntry[] = entries.map((item) => {
      const isCurrent = Boolean(currentUserId && item.id === currentUserId)
      const level = item.level ?? 1
      const xpVal = item.xp ?? 0

      return {
        rank: item.rank,
        id: item.id,
        name: item.full_name || item.username || 'Adventurer',
        title: getTitleForLevel(level, item.role || undefined),
        xp: `${xpVal.toLocaleString()} XP`,
        rawXp: xpVal,
        level,
        badge: getBadgeForRank(item.rank, isCurrent),
        isCurrent,
        role: item.role || undefined,
      }
    })

    // If current user is not in the top entries, fetch and append user's rank
    const isUserInList = leaderboard.some((e) => e.isCurrent)
    if (currentUserId && !isUserInList) {
      const userRank = await fetchUserRank(currentUserId, period)
      if (userRank) {
        leaderboard.push({
          rank: userRank.rank,
          id: currentUserId,
          name: 'You (Current Player)',
          title: getTitleForLevel(userRank.level),
          xp: `${userRank.xp.toLocaleString()} XP`,
          rawXp: userRank.xp,
          level: userRank.level,
          badge: getBadgeForRank(userRank.rank, true),
          isCurrent: true,
        })
      }
    }

    return leaderboard
  } catch (err) {
    console.error('Error fetching leaderboard:', err)
    return []
  }
}

export async function fetchUserRank(userId: string, period: LeaderboardPeriod = 'all_time'): Promise<UserRankInfo | null> {
  try {
    if (period === 'all_time') {
      const { data, error } = await supabase
        .rpc('get_user_rank', { p_user_id: userId })
        .maybeSingle()

      if (!error && data) {
        const row = data as { rank?: number | string; xp?: number; level?: number }
        return {
          rank: Number(row.rank || 1),
          xp: row.xp ?? 0,
          level: row.level ?? 1,
        }
      }

      // Fallback rank calculation using profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .maybeSingle()

      if (profileData) {
        const userXp = profileData.xp ?? 0
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('xp', userXp)

        return {
          rank: (count || 0) + 1,
          xp: userXp,
          level: profileData.level ?? calculateLevelFromXp(userXp),
        }
      }
    } else {
      const days = period === 'weekly' ? 7 : 30
      const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      const { data: userTxs } = await supabase
        .from('xp_transactions')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', threshold)

      const userPeriodXp = (userTxs || []).reduce((acc, t) => acc + (t.amount || 0), 0)

      const { data: allTxs } = await supabase
        .from('xp_transactions')
        .select('user_id, amount')
        .gte('created_at', threshold)

      const userSums = new Map<string, number>()
      if (allTxs) {
        allTxs.forEach((t) => {
          userSums.set(t.user_id, (userSums.get(t.user_id) || 0) + (t.amount || 0))
        })
      }

      let higherCount = 0
      userSums.forEach((val) => {
        if (val > userPeriodXp) higherCount++
      })

      const { data: prof } = await supabase.from('profiles').select('level').eq('id', userId).maybeSingle()

      return {
        rank: higherCount + 1,
        xp: userPeriodXp,
        level: prof?.level ?? calculateLevelFromXp(userPeriodXp),
      }
    }

    return null
  } catch {
    return null
  }
}

export function useLeaderboard(currentUserId?: string, limit = 10, period: LeaderboardPeriod = 'all_time') {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const data = await fetchLeaderboard(limit, currentUserId, period)
    setLeaderboard(data)
    setLoading(false)
  }, [limit, currentUserId, period])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      loadData()
    }
    return () => {
      mounted = false
    }
  }, [loadData])

  return {
    leaderboard,
    loading,
    refreshLeaderboard: loadData,
  }
}
