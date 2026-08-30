import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export interface BadgeItem {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  category: string
  isUnlocked: boolean
  unlockedAt?: string
}

export interface AchievementItem {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  targetCount: number
  progressCount: number
  rewardXp: number
  isUnlocked: boolean
}

export interface ActivityItem {
  id: string
  actionType: string
  title: string
  createdAt: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  icon: string
  isRead: boolean
  createdAt: string
}

function formatRelativeOrLocaleTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export async function fetchUserBadges(userId?: string): Promise<BadgeItem[]> {
  try {
    const { data: allBadges, error: badgesErr } = await supabase
      .from('badges')
      .select('*')
      .order('created_at', { ascending: true })

    if (badgesErr || !allBadges || allBadges.length === 0) {
      return []
    }

    const unlockedMap = new Map<string, string>()

    if (userId) {
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at')
        .eq('user_id', userId)

      if (userBadges) {
        userBadges.forEach((ub) => {
          unlockedMap.set(ub.badge_id, ub.unlocked_at)
        })
      }
    }

    return allBadges.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      description: b.description || '',
      icon: b.icon || '🏅',
      category: b.category || 'general',
      isUnlocked: unlockedMap.has(b.id),
      unlockedAt: unlockedMap.get(b.id),
    }))
  } catch (err) {
    console.error('Error fetching badges:', err)
    return []
  }
}

export async function fetchUserAchievements(userId?: string): Promise<AchievementItem[]> {
  try {
    const [achRes, profileRes, progressRes] = await Promise.all([
      supabase.from('achievements').select('*').order('created_at', { ascending: true }),
      userId ? supabase.from('profiles').select('level, streak, daily_goal_xp, daily_xp_earned').eq('id', userId).maybeSingle() : Promise.resolve({ data: null }),
      userId ? supabase.from('lesson_progress').select('lesson_id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_completed', true) : Promise.resolve({ count: 0 }),
    ])

    const allAch = achRes.data || []
    if (allAch.length === 0) return []

    const profile = profileRes.data
    const completedLessonsCount = progressRes.count || 0

    return allAch.map((a) => {
      let progressCount = 0
      let isUnlocked = false

      if (a.slug === 'novice-coder') {
        isUnlocked = (profile?.level ?? 1) >= 2
        progressCount = isUnlocked ? 1 : 0
      } else if (a.slug === 'daily-dedication') {
        isUnlocked = (profile?.daily_goal_xp ?? 50) > 0 && (profile?.daily_xp_earned ?? 0) >= (profile?.daily_goal_xp ?? 50)
        progressCount = isUnlocked ? 1 : 0
      } else if (a.slug === 'trailblazer') {
        const target = a.target_count || 3
        progressCount = Math.min(target, completedLessonsCount)
        isUnlocked = completedLessonsCount >= target
      } else {
        const target = a.target_count || 1
        progressCount = Math.min(target, completedLessonsCount)
        isUnlocked = completedLessonsCount >= target
      }

      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        description: a.description || '',
        icon: a.icon || '🏆',
        targetCount: a.target_count || 1,
        progressCount,
        rewardXp: a.reward_xp || 50,
        isUnlocked,
      }
    })
  } catch (err) {
    console.error('Error fetching achievements:', err)
    return []
  }
}

export async function syncUserBadgesAndAchievements(userId: string): Promise<void> {
  if (!userId) return
  // Dynamically computed on read, no redundant writes needed
}

export async function recordUserActivity(userId: string, actionType: string, title: string): Promise<void> {
  try {
    await supabase.from('activity_history').insert({
      user_id: userId,
      action_type: actionType,
      title,
    })
  } catch (err) {
    console.error('Error recording activity:', err)
  }
}

export async function createUserNotification(userId: string, title: string, message: string, icon: string = '🔔'): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      icon,
    })
  } catch (err) {
    console.error('Error creating notification:', err)
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  } catch (err) {
    console.error('Error marking notification read:', err)
  }
}

export function useAchievementsAndNotifications(userId?: string) {
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!userId) {
      setBadges([])
      setAchievements([])
      setActivities([])
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      await syncUserBadgesAndAchievements(userId)

      const [loadedBadges, loadedAchievements, notifRes, actRes] = await Promise.all([
        fetchUserBadges(userId),
        fetchUserAchievements(userId),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('activity_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10),
      ])

      setBadges(loadedBadges)
      setAchievements(loadedAchievements)

      if (notifRes.data) {
        setNotifications(
          notifRes.data.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            icon: n.icon || '🔔',
            isRead: n.is_read,
            createdAt: formatRelativeOrLocaleTime(n.created_at),
          }))
        )
      } else {
        setNotifications([])
      }

      if (actRes.data) {
        setActivities(
          actRes.data.map((a) => ({
            id: a.id,
            actionType: a.action_type,
            title: a.title,
            createdAt: formatRelativeOrLocaleTime(a.created_at),
          }))
        )
      } else {
        setActivities([])
      }
    } catch (err) {
      console.error('Error loading achievements and notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    let mounted = true
    if (userId && mounted) {
      loadData()
    } else if (!userId) {
      setLoading(false)
    }
    return () => {
      mounted = false
    }
  }, [userId, loadData])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    await markNotificationAsRead(id)
  }, [])

  const logAction = useCallback(async (actionType: string, title: string) => {
    if (!userId) return
    await recordUserActivity(userId, actionType, title)
    await loadData()
  }, [userId, loadData])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return {
    badges,
    achievements,
    activities,
    notifications,
    unreadCount,
    loading,
    markRead,
    logAction,
    refreshAll: loadData,
  }
}
