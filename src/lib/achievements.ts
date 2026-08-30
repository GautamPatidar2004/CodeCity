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

const DEFAULT_BADGES: BadgeItem[] = [
  { id: 'b1', slug: 'first-quest', title: 'Quest Complete', description: 'Completed your first quest', icon: '⚔️', category: 'milestone', isUnlocked: true },
  { id: 'b2', slug: 'bug-hunter', title: 'Bug Hunter', description: 'Squashed syntax errors', icon: '👾', category: 'skill', isUnlocked: true },
  { id: 'b3', slug: 'streak-fire', title: 'Streak Keeper', description: 'Maintained a 3-day streak', icon: '🔥', category: 'streak', isUnlocked: true },
  { id: 'b4', slug: 'js-explorer', title: 'JS Explorer', description: 'Mastered JavaScript primitives', icon: '⚡', category: 'language', isUnlocked: false },
]

const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  { id: 'a1', slug: 'novice-coder', title: 'Novice Coder', description: 'Reach Level 2 in your adventure', icon: '🏆', targetCount: 1, progressCount: 1, rewardXp: 50, isUnlocked: true },
  { id: 'a2', slug: 'daily-dedication', title: 'Daily Dedication', description: 'Complete your daily learning goal', icon: '🎯', targetCount: 1, progressCount: 1, rewardXp: 50, isUnlocked: true },
  { id: 'a3', slug: 'trailblazer', title: 'Trailblazer', description: 'Complete 3 learning lessons', icon: '🚀', targetCount: 3, progressCount: 1, rewardXp: 75, isUnlocked: false },
]

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { id: 'act1', actionType: 'lesson_completed', title: 'Completed "The JavaScript Awakening: 01. Setting Up Variables"', createdAt: 'Just now' },
  { id: 'act2', actionType: 'streak_maintained', title: 'Maintained 3-day coding streak 🔥', createdAt: 'Today' },
  { id: 'act3', actionType: 'badge_unlocked', title: 'Unlocked "Quest Complete" badge ⚔️', createdAt: 'Yesterday' },
]

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'Daily Goal Complete! ⭐', message: 'You earned 50 XP today and kept your streak alive!', icon: '🎯', isRead: false, createdAt: '10m ago' },
  { id: 'n2', title: 'Welcome Adventurer', message: 'Ready to continue your coding quest in CodeQuest?', icon: '⚔️', isRead: true, createdAt: '1h ago' },
]

export async function fetchUserBadges(userId?: string): Promise<BadgeItem[]> {
  if (!userId) return DEFAULT_BADGES
  try {
    const { data: allBadges } = await supabase.from('badges').select('*').order('created_at', { ascending: true })
    if (!allBadges || allBadges.length === 0) return DEFAULT_BADGES

    const { data: userBadges } = await supabase.from('user_badges').select('badge_id, unlocked_at').eq('user_id', userId)
    const unlockedMap = new Map((userBadges || []).map((ub) => [ub.badge_id, ub.unlocked_at]))

    return allBadges.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      description: b.description,
      icon: b.icon,
      category: b.category,
      isUnlocked: unlockedMap.has(b.id),
      unlockedAt: unlockedMap.get(b.id),
    }))
  } catch {
    return DEFAULT_BADGES
  }
}

export async function fetchUserAchievements(userId?: string): Promise<AchievementItem[]> {
  if (!userId) return DEFAULT_ACHIEVEMENTS
  try {
    const { data: allAch } = await supabase.from('achievements').select('*').order('created_at', { ascending: true })
    if (!allAch || allAch.length === 0) return DEFAULT_ACHIEVEMENTS

    const { data: userAch } = await supabase.from('user_achievements').select('achievement_id, progress_count, is_unlocked').eq('user_id', userId)
    const userMap = new Map((userAch || []).map((ua) => [ua.achievement_id, ua]))

    return allAch.map((a) => {
      const userProgress = userMap.get(a.id)
      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        description: a.description,
        icon: a.icon,
        targetCount: a.target_count,
        progressCount: userProgress?.progress_count ?? 1,
        rewardXp: a.reward_xp,
        isUnlocked: userProgress?.is_unlocked ?? true,
      }
    })
  } catch {
    return DEFAULT_ACHIEVEMENTS
  }
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
  const [badges, setBadges] = useState<BadgeItem[]>(DEFAULT_BADGES)
  const [achievements, setAchievements] = useState<AchievementItem[]>(DEFAULT_ACHIEVEMENTS)
  const [activities, setActivities] = useState<ActivityItem[]>(DEFAULT_ACTIVITIES)
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS)

  const loadData = useCallback(async () => {
    if (!userId) return

    try {
      const loadedBadges = await fetchUserBadges(userId)
      setBadges(loadedBadges)

      const loadedAchievements = await fetchUserAchievements(userId)
      setAchievements(loadedAchievements)

      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (notifData && notifData.length > 0) {
        setNotifications(
          notifData.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            icon: n.icon || '🔔',
            isRead: n.is_read,
            createdAt: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }))
        )
      }

      const { data: actData } = await supabase
        .from('activity_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (actData && actData.length > 0) {
        setActivities(
          actData.map((a) => ({
            id: a.id,
            actionType: a.action_type,
            title: a.title,
            createdAt: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }))
        )
      }
    } catch {
      // Retain defaults
    }
  }, [userId])

  useEffect(() => {
    let mounted = true
    if (userId && mounted) {
      loadData()
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
    markRead,
    logAction,
    refreshAll: loadData,
  }
}
