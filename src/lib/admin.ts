import { supabase } from './supabase'

export interface AdminAuditLog {
  id: string
  admin_user_id: string
  admin_name?: string
  action: string
  entity_type: string
  entity_id?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface PlatformAnalytics {
  totalLearners: number
  totalStaff: number
  totalCourses: number
  totalLessonsCompleted: number
  totalSubmissions: number
  totalProjects: number
  totalShowcaseBuilds: number
  totalXpDistributed: number
  activeStreakCount: number
}

export interface DetailedLearnerInfo {
  id: string
  name: string
  username: string
  email: string
  role: string
  xp: number
  level: number
  streak: number
  created_at: string
  enrolledCount: number
  completedLessonsCount: number
  completedProjectsCount: number
  submissionsCount: number
}

export async function logAdminAction(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('admin_audit_logs').insert({
      admin_user_id: adminUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata || {},
    })
  } catch {
    // Non-blocking logger
  }
}

export async function fetchAdminAuditLogs(limit = 25): Promise<AdminAuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('id, admin_user_id, action, entity_type, entity_id, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []

    // Map admin names
    const adminIds = Array.from(new Set(data.map((l) => l.admin_user_id).filter(Boolean)))
    const { data: admins } = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', adminIds)

    const adminMap = new Map((admins || []).map((a) => [a.id, a.full_name || a.username || 'Admin']))

    return data.map((l) => ({
      ...l,
      admin_name: l.admin_user_id ? adminMap.get(l.admin_user_id) || 'Staff Admin' : 'System',
    }))
  } catch {
    return []
  }
}

export async function fetchPlatformAnalytics(): Promise<PlatformAnalytics> {
  try {
    const [
      profilesRes,
      coursesRes,
      lessonsProgressRes,
      submissionsRes,
      projectsRes,
      showcaseRes,
      xpRes,
    ] = await Promise.all([
      supabase.from('profiles').select('id, role, streak, xp'),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('is_completed', true),
      supabase.from('exercise_submissions').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('project_showcases').select('id', { count: 'exact', head: true }),
      supabase.from('xp_transactions').select('amount'),
    ])

    const profiles = profilesRes.data || []
    const totalLearners = profiles.filter((p) => p.role !== 'admin').length
    const totalStaff = profiles.filter((p) => p.role === 'admin').length
    const totalXp = (xpRes.data || []).reduce((acc, t) => acc + (t.amount || 0), 0)
    const activeStreaks = profiles.filter((p) => (p.streak || 0) > 0).length

    return {
      totalLearners,
      totalStaff,
      totalCourses: coursesRes.count || 0,
      totalLessonsCompleted: lessonsProgressRes.count || 0,
      totalSubmissions: submissionsRes.count || 0,
      totalProjects: projectsRes.count || 0,
      totalShowcaseBuilds: showcaseRes.count || 0,
      totalXpDistributed: totalXp > 0 ? totalXp : profiles.reduce((acc, p) => acc + (p.xp || 0), 0),
      activeStreakCount: activeStreaks,
    }
  } catch {
    return {
      totalLearners: 0,
      totalStaff: 0,
      totalCourses: 0,
      totalLessonsCompleted: 0,
      totalSubmissions: 0,
      totalProjects: 0,
      totalShowcaseBuilds: 0,
      totalXpDistributed: 0,
      activeStreakCount: 0,
    }
  }
}

export async function fetchDetailedLearnerInfo(userId: string): Promise<DetailedLearnerInfo | null> {
  try {
    const [profRes, enrollRes, progressRes, projProgRes, subRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, username, email, role, xp, level, streak, created_at').eq('id', userId).single(),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_completed', true),
      supabase.from('project_enrollments').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
      supabase.from('exercise_submissions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    ])

    if (profRes.error || !profRes.data) return null

    const p = profRes.data
    return {
      id: p.id,
      name: p.full_name || p.username || 'Adventurer',
      username: p.username || '',
      email: p.email || '',
      role: p.role,
      xp: p.xp ?? 0,
      level: p.level ?? 1,
      streak: p.streak ?? 0,
      created_at: p.created_at,
      enrolledCount: enrollRes.count || 0,
      completedLessonsCount: progressRes.count || 0,
      completedProjectsCount: projProgRes.count || 0,
      submissionsCount: subRes.count || 0,
    }
  } catch {
    return null
  }
}

export async function updateUserRole(
  adminUserId: string,
  targetUserId: string,
  newRole: 'student' | 'admin'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)

    if (!error) {
      await logAdminAction(adminUserId, 'UPDATE_USER_ROLE', 'profile', targetUserId, { newRole })
      return true
    }
    return false
  } catch {
    return false
  }
}
