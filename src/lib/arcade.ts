import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'
import { executeCode } from './execution'
import { fetchExerciseTestCases } from './submissions'

export interface ArcadeTeam {
  id: string
  name: string
  code: string
  captain_id: string
  member_count: number
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface ArcadeTeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'captain' | 'member'
  joined_at: string
  profile?: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    xp: number
    level: number
  }
}

export interface TeamOperationResult {
  success: boolean
  team_id?: string
  team_name?: string
  team_code?: string
  member_id?: string
  error?: string
}

export type ArcadeFestStatus = 'upcoming' | 'live' | 'ended'

export interface ArcadeFest {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  status: ArcadeFestStatus
  effective_status: ArcadeFestStatus
  banner_url?: string | null
  created_at: string
}

export interface ArcadeFestRegistration {
  id: string
  fest_id: string
  team_id: string
  registered_by: string
  registered_at: string
}

export async function fetchUserTeam(userId: string): Promise<{
  team: ArcadeTeam | null
  membership: ArcadeTeamMember | null
  members: ArcadeTeamMember[]
}> {
  try {
    // 1. Find if the user has an active team membership
    const { data: memberData, error: memberError } = await supabase
      .from('arcade_team_members')
      .select('id, team_id, user_id, role, joined_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (memberError || !memberData) {
      return { team: null, membership: null, members: [] }
    }

    // 2. Fetch the team details
    const { data: teamData, error: teamError } = await supabase
      .from('arcade_teams')
      .select('*')
      .eq('id', memberData.team_id)
      .eq('status', 'active')
      .maybeSingle()

    if (teamError || !teamData) {
      return { team: null, membership: null, members: [] }
    }

    // 3. Fetch all team members with their profiles
    const { data: allMembers, error: allMembersError } = await supabase
      .from('arcade_team_members')
      .select(`
        id,
        team_id,
        user_id,
        role,
        joined_at,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          xp,
          level
        )
      `)
      .eq('team_id', teamData.id)
      .order('joined_at', { ascending: true })

    if (allMembersError || !allMembers) {
      return {
        team: teamData as ArcadeTeam,
        membership: memberData as ArcadeTeamMember,
        members: [],
      }
    }

    // Map formatted member list
    const formattedMembers: ArcadeTeamMember[] = allMembers.map((m: any) => ({
      id: m.id,
      team_id: m.team_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      profile: m.profiles
        ? {
            id: m.profiles.id,
            username: m.profiles.username,
            full_name: m.profiles.full_name,
            avatar_url: m.profiles.avatar_url,
            xp: m.profiles.xp ?? 0,
            level: m.profiles.level ?? 1,
          }
        : undefined,
    }))

    return {
      team: teamData as ArcadeTeam,
      membership: memberData as ArcadeTeamMember,
      members: formattedMembers,
    }
  } catch (err) {
    console.error('Error fetching user team:', err)
    return { team: null, membership: null, members: [] }
  }
}

export async function createTeam(name: string, userId: string): Promise<TeamOperationResult> {
  try {
    const { data, error } = await supabase.rpc('create_arcade_team', {
      p_name: name,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const res = data as TeamOperationResult
    return res
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create team.' }
  }
}

export async function joinTeam(code: string, userId: string): Promise<TeamOperationResult> {
  try {
    const { data, error } = await supabase.rpc('join_arcade_team', {
      p_team_code: code,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const res = data as TeamOperationResult
    return res
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to join team.' }
  }
}

export async function leaveTeam(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('leave_arcade_team', {
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const res = data as { success: boolean; error?: string }
    return res
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to leave team.' }
  }
}

export function useTeamArcade(userId?: string) {
  const [team, setTeam] = useState<ArcadeTeam | null>(null)
  const [membership, setMembership] = useState<ArcadeTeamMember | null>(null)
  const [members, setMembers] = useState<ArcadeTeamMember[]>([])
  const [registeredFestIds, setRegisteredFestIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTeamData = useCallback(async () => {
    if (!userId) {
      setTeam(null)
      setMembership(null)
      setMembers([])
      setRegisteredFestIds([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const result = await fetchUserTeam(userId)
    setTeam(result.team)
    setMembership(result.membership)
    setMembers(result.members)

    if (result.team?.id) {
      const fIds = await fetchTeamRegisteredFestIds(result.team.id)
      setRegisteredFestIds(fIds)
    } else {
      setRegisteredFestIds([])
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadTeamData()
  }, [loadTeamData])

  // Realtime subscription for team members, capacity, and fest registrations
  useEffect(() => {
    if (!team?.id) return

    const channel = supabase
      .channel(`arcade_team_${team.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_team_members',
          filter: `team_id=eq.${team.id}`,
        },
        () => {
          loadTeamData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_teams',
          filter: `id=eq.${team.id}`,
        },
        () => {
          loadTeamData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_fest_registrations',
          filter: `team_id=eq.${team.id}`,
        },
        () => {
          loadTeamData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [team?.id, loadTeamData])

  const handleCreateTeam = async (name: string): Promise<TeamOperationResult> => {
    if (!userId) return { success: false, error: 'User not authenticated.' }
    const res = await createTeam(name, userId)
    if (res.success) {
      await loadTeamData()
    }
    return res
  }

  const handleJoinTeam = async (code: string): Promise<TeamOperationResult> => {
    if (!userId) return { success: false, error: 'User not authenticated.' }
    const res = await joinTeam(code, userId)
    if (res.success) {
      await loadTeamData()
    }
    return res
  }

  const handleLeaveTeam = async (): Promise<{ success: boolean; error?: string }> => {
    if (!userId) return { success: false, error: 'User not authenticated.' }
    const res = await leaveTeam(userId)
    if (res.success) {
      await loadTeamData()
    }
    return res
  }

  const handleRegisterFest = async (festId: string) => {
    if (!userId) return { success: false, error: 'User not authenticated.' }
    const res = await registerTeamForFest(festId, userId)
    if (res.success) {
      await loadTeamData()
    }
    return res
  }

  return {
    team,
    membership,
    members,
    registeredFestIds,
    loading,
    error,
    isCaptain: membership?.role === 'captain',
    createTeamAction: handleCreateTeam,
    joinTeamAction: handleJoinTeam,
    leaveTeamAction: handleLeaveTeam,
    registerFestAction: handleRegisterFest,
    refreshTeam: loadTeamData,
  }
}

export async function registerTeamForFest(festId: string, userId: string): Promise<{
  success: boolean
  error?: string
  registration_id?: string
  fest_title?: string
  team_name?: string
}> {
  try {
    const { data, error } = await supabase.rpc('register_team_for_fest', {
      p_fest_id: festId,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return data as { success: boolean; error?: string; registration_id?: string; fest_title?: string; team_name?: string }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to register team for fest.' }
  }
}

export async function fetchTeamRegisteredFestIds(teamId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('arcade_fest_registrations')
      .select('fest_id')
      .eq('team_id', teamId)

    if (error || !data) return []
    return data.map((r: { fest_id: string }) => r.fest_id)
  } catch {
    return []
  }
}

export function computeEffectiveFestStatus(startTimeStr: string, endTimeStr: string): ArcadeFestStatus {
  const now = Date.now()
  const start = new Date(startTimeStr).getTime()
  const end = new Date(endTimeStr).getTime()
  if (now < start) return 'upcoming'
  if (now <= end) return 'live'
  return 'ended'
}

export async function fetchArcadeFests(): Promise<ArcadeFest[]> {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_arcade_fests')
    if (!rpcError && rpcData) {
      return (rpcData as any[]).map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        start_time: f.start_time,
        end_time: f.end_time,
        status: f.status as ArcadeFestStatus,
        effective_status: (f.effective_status || computeEffectiveFestStatus(f.start_time, f.end_time)) as ArcadeFestStatus,
        banner_url: f.banner_url,
        created_at: f.created_at,
      }))
    }

    // Fallback direct query on arcade_fests table
    const { data, error } = await supabase
      .from('arcade_fests')
      .select('*')
      .order('start_time', { ascending: true })

    if (error || !data) return []

    return data.map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      start_time: f.start_time,
      end_time: f.end_time,
      status: f.status as ArcadeFestStatus,
      effective_status: computeEffectiveFestStatus(f.start_time, f.end_time),
      banner_url: f.banner_url,
      created_at: f.created_at,
    }))
  } catch (err) {
    console.error('Error fetching arcade fests:', err)
    return []
  }
}

export function useArcadeFests() {
  const [fests, setFests] = useState<ArcadeFest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFest, setSelectedFest] = useState<ArcadeFest | null>(null)

  const loadFests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchArcadeFests()
      setFests(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load fests.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFests()
  }, [loadFests])

  // Realtime subscription for fests
  useEffect(() => {
    const channel = supabase
      .channel('arcade_fests_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_fests' },
        () => {
          loadFests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadFests])

  const liveFests = fests.filter((f) => f.effective_status === 'live')
  const upcomingFests = fests.filter((f) => f.effective_status === 'upcoming')
  const endedFests = fests.filter((f) => f.effective_status === 'ended')

  return {
    fests,
    loading,
    error,
    liveFests,
    upcomingFests,
    endedFests,
    selectedFest,
    setSelectedFest,
    refreshFests: loadFests,
  }
}

export interface FestParticipationAccess {
  allowed: boolean
  effective_status?: ArcadeFestStatus
  can_enter_live?: boolean
  reason?: string
  fest_id?: string
  fest_title?: string
  team_id?: string
  team_name?: string
  team_code?: string
  role?: string
  is_registered?: boolean
  is_late_join?: boolean
}

export interface FestChallenge {
  id: string
  fest_id: string
  challenge_id: string
  order_index: number
  points: number
  challenges: {
    id: string
    title: string
    slug: string
    description: string
    instructions?: string
    starter_code?: string
    language: string
    difficulty: string
    hints?: string[]
    solution_explanation?: string
  }
}

export async function checkFestParticipationAccess(
  festId: string,
  userId: string
): Promise<FestParticipationAccess> {
  try {
    const { data, error } = await supabase.rpc('check_fest_participation_access', {
      p_fest_id: festId,
      p_user_id: userId,
    })

    if (error) {
      return { allowed: false, reason: error.message }
    }

    return data as FestParticipationAccess
  } catch (err: any) {
    return { allowed: false, reason: err.message || 'Failed to verify participation access.' }
  }
}

export async function fetchFestChallenges(festId: string): Promise<FestChallenge[]> {
  try {
    const { data, error } = await supabase
      .from('arcade_fest_challenges')
      .select('id, fest_id, challenge_id, order_index, points, challenges(*)')
      .eq('fest_id', festId)
      .order('order_index', { ascending: true })

    if (error || !data) return []
    return data as unknown as FestChallenge[]
  } catch {
    return []
  }
}

export function useFestLobby(festId: string | null, userId?: string) {
  const [access, setAccess] = useState<FestParticipationAccess | null>(null)
  const [challenges, setChallenges] = useState<FestChallenge[]>([])
  const [activeChallenge, setActiveChallenge] = useState<FestChallenge | null>(null)
  const [loading, setLoading] = useState(true)

  const loadLobby = useCallback(async () => {
    if (!festId || !userId) {
      setAccess(null)
      setChallenges([])
      setActiveChallenge(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const accessRes = await checkFestParticipationAccess(festId, userId)
    setAccess(accessRes)

    if (accessRes.allowed) {
      const chs = await fetchFestChallenges(festId)
      setChallenges(chs)
      if (chs.length > 0) {
        setActiveChallenge((prev) => prev || chs[0])
      }
    } else {
      setChallenges([])
      setActiveChallenge(null)
    }

    setLoading(false)
  }, [festId, userId])

  useEffect(() => {
    loadLobby()
  }, [loadLobby])

  // Realtime updates for challenges and fest state
  useEffect(() => {
    if (!festId) return

    const channel = supabase
      .channel(`fest_lobby_${festId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_fest_challenges',
          filter: `fest_id=eq.${festId}`,
        },
        () => {
          loadLobby()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_fests',
          filter: `id=eq.${festId}`,
        },
        () => {
          loadLobby()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [festId, loadLobby])

  return {
    access,
    challenges,
    activeChallenge,
    setActiveChallenge,
    loading,
    refreshLobby: loadLobby,
  }
}

export interface FestMemberScore {
  user_id: string
  username: string
  full_name: string
  role: string
  level: number
  score: number
}

export interface FestSquadScore {
  success: boolean
  fest_id: string
  team_id: string
  team_name: string
  member_count: number
  team_total_score: number
  team_average_score: number
  my_score: number
  member_scores: FestMemberScore[]
}

export async function fetchFestSquadScore(
  festId: string,
  teamId: string,
  userId?: string
): Promise<FestSquadScore | null> {
  try {
    const { data, error } = await supabase.rpc('get_fest_squad_score', {
      p_fest_id: festId,
      p_team_id: teamId,
      p_user_id: userId || null,
    })

    if (error || !data || data.success === false) {
      return null
    }

    return data as FestSquadScore
  } catch {
    return null
  }
}

export function useFestSquadScore(festId: string | null, teamId: string | null, userId?: string) {
  const [squadScore, setSquadScore] = useState<FestSquadScore | null>(null)
  const [loading, setLoading] = useState(true)

  const loadScore = useCallback(async () => {
    if (!festId || !teamId) {
      setSquadScore(null)
      setLoading(false)
      return
    }

    const res = await fetchFestSquadScore(festId, teamId, userId)
    setSquadScore(res)
    setLoading(false)
  }, [festId, teamId, userId])

  useEffect(() => {
    loadScore()
  }, [loadScore])

  // Realtime subscription for score changes in this fest
  useEffect(() => {
    if (!festId) return

    const channel = supabase
      .channel(`fest_scores_${festId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_fest_scores',
          filter: `fest_id=eq.${festId}`,
        },
        () => {
          loadScore()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [festId, loadScore])

  return {
    squadScore,
    loading,
    refreshScore: loadScore,
  }
}

export interface FestLeaderboardEntry {
  rank: number
  team_id: string
  team_name: string
  team_code: string
  member_count: number
  team_total_score: number
  team_average_score: number
  last_scored_at: string | null
  registered_at: string
}

export async function fetchFestLeaderboard(festId: string): Promise<FestLeaderboardEntry[]> {
  try {
    const { data, error } = await supabase.rpc('get_fest_leaderboard', {
      p_fest_id: festId,
    })

    if (error || !data) {
      return []
    }

    return (data as any[]).map((row) => ({
      rank: Number(row.rank),
      team_id: row.team_id,
      team_name: row.team_name,
      team_code: row.team_code,
      member_count: Number(row.member_count),
      team_total_score: Number(row.team_total_score),
      team_average_score: Number(row.team_average_score),
      last_scored_at: row.last_scored_at,
      registered_at: row.registered_at,
    }))
  } catch {
    return []
  }
}

export function useFestLeaderboard(festId: string | null) {
  const [leaderboard, setLeaderboard] = useState<FestLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadLeaderboard = useCallback(async () => {
    if (!festId) {
      setLeaderboard([])
      setLoading(false)
      return
    }

    const data = await fetchFestLeaderboard(festId)
    setLeaderboard(data)
    setLoading(false)
  }, [festId])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  // Realtime subscription for score events and registration changes
  useEffect(() => {
    if (!festId) return

    const channel = supabase
      .channel(`fest_leaderboard_${festId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_fest_scores',
          filter: `fest_id=eq.${festId}`,
        },
        () => {
          loadLeaderboard()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_fest_registrations',
          filter: `fest_id=eq.${festId}`,
        },
        () => {
          loadLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [festId, loadLeaderboard])

  return {
    leaderboard,
    loading,
    refreshLeaderboard: loadLeaderboard,
  }
}

export interface StudentFestHistoryItem {
  fest_id: string
  fest_title: string
  fest_description: string
  start_time: string
  end_time: string
  team_id: string
  team_name: string
  team_code: string
  member_count: number
  my_score: number
  final_team_score: number
  final_rank: number
  total_teams: number
}

export async function fetchStudentFestHistory(userId: string): Promise<StudentFestHistoryItem[]> {
  try {
    const { data, error } = await supabase.rpc('get_student_fest_history', {
      p_user_id: userId,
    })

    if (error || !data) {
      return []
    }

    return (data as any[]).map((row) => ({
      fest_id: row.fest_id,
      fest_title: row.fest_title,
      fest_description: row.fest_description,
      start_time: row.start_time,
      end_time: row.end_time,
      team_id: row.team_id,
      team_name: row.team_name,
      team_code: row.team_code,
      member_count: Number(row.member_count),
      my_score: Number(row.my_score),
      final_team_score: Number(row.final_team_score),
      final_rank: Number(row.final_rank),
      total_teams: Number(row.total_teams),
    }))
  } catch {
    return []
  }
}

export function useStudentFestHistory(userId?: string) {
  const [history, setHistory] = useState<StudentFestHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    if (!userId) {
      setHistory([])
      setLoading(false)
      return
    }

    const data = await fetchStudentFestHistory(userId)
    setHistory(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Realtime subscription on fests in case a fest ends
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`student_fest_history_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_fests',
        },
        () => {
          loadHistory()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, loadHistory])

  return {
    history,
    loading,
    refreshHistory: loadHistory,
  }
}

// ==========================================
// PHASE 8: ADMIN BATTLE CREATOR & LIFECYCLE
// ==========================================

export type ArcadeBattleStatus = 'draft' | 'upcoming' | 'live' | 'ended'
export type TieBreakerRule = 'fastest_time' | 'least_submissions' | 'highest_speed_bonus' | 'earliest_submission'

export interface ArcadeBattle {
  id: string
  title: string
  description: string
  rules: string
  start_time: string
  end_time: string
  duration_minutes: number
  status: ArcadeBattleStatus
  effective_status: ArcadeBattleStatus
  base_points: number
  speed_bonus_max: number
  wrong_answer_penalty: number
  submission_cooldown_seconds: number
  tie_breaker_rule: TieBreakerRule
  exercise_count?: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface BattleScoringConfig {
  base_points: number
  speed_bonus_max: number
  wrong_answer_penalty: number
  submission_cooldown_seconds: number
  tie_breaker_rule: TieBreakerRule
}

export interface BattleExercise {
  id: string
  battle_id: string
  exercise_id: string
  order_position: number
  created_at: string
  challenge?: {
    id: string
    title: string
    slug: string
    difficulty: string
    category: string
    language?: string
    description?: string
    xp_reward?: number
    hints?: string[]
    instructions?: string
    sample_input?: string
  }
}

export interface CreateBattleInput {
  title: string
  description?: string
  rules?: string
  start_time: string
  end_time: string
  status?: 'draft' | 'upcoming'
  base_points?: number
  speed_bonus_max?: number
  wrong_answer_penalty?: number
  submission_cooldown_seconds?: number
  tie_breaker_rule?: TieBreakerRule
}

export interface UpdateBattleInput {
  title?: string
  description?: string
  rules?: string
  start_time?: string
  end_time?: string
  status?: 'draft' | 'upcoming' | 'live' | 'ended'
  base_points?: number
  speed_bonus_max?: number
  wrong_answer_penalty?: number
  submission_cooldown_seconds?: number
  tie_breaker_rule?: TieBreakerRule
}

export interface BattleValidationResult {
  valid: boolean
  errors: Record<string, string>
}

/**
 * Safely derives effective status relative to current timestamp
 */
export function deriveBattleEffectiveStatus(
  status: ArcadeBattleStatus,
  startTimeStr: string,
  endTimeStr: string
): ArcadeBattleStatus {
  if (status === 'draft') return 'draft'
  const now = Date.now()
  const startMs = new Date(startTimeStr).getTime()
  const endMs = new Date(endTimeStr).getTime()
  if (now < startMs) return 'upcoming'
  if (now >= startMs && now <= endMs) return 'live'
  return 'ended'
}

/**
 * Comprehensive client-side validation for battle configuration
 */
export function validateBattleInput(
  input: Partial<CreateBattleInput>,
  isPublishing: boolean = false
): BattleValidationResult {
  const errors: Record<string, string> = {}

  const trimmedTitle = input.title ? input.title.trim() : ''
  if (!trimmedTitle) {
    errors.title = 'Battle title is required.'
  } else if (trimmedTitle.length < 3) {
    errors.title = 'Battle title must be at least 3 characters.'
  } else if (trimmedTitle.length > 120) {
    errors.title = 'Battle title must not exceed 120 characters.'
  }

  if (!input.start_time) {
    errors.start_time = 'Start date and time is required.'
  } else {
    const startDate = new Date(input.start_time)
    if (isNaN(startDate.getTime())) {
      errors.start_time = 'Please provide a valid start date/time.'
    }
  }

  if (!input.end_time) {
    errors.end_time = 'End date and time (or duration) is required.'
  } else {
    const endDate = new Date(input.end_time)
    if (isNaN(endDate.getTime())) {
      errors.end_time = 'Please provide a valid end date/time.'
    }
  }

  if (input.start_time && input.end_time) {
    const startMs = new Date(input.start_time).getTime()
    const endMs = new Date(input.end_time).getTime()
    if (!isNaN(startMs) && !isNaN(endMs)) {
      if (endMs <= startMs) {
        errors.end_time = 'End time must be strictly after start time.'
      }
      const durationMinutes = (endMs - startMs) / 60000
      if (durationMinutes <= 0) {
        errors.duration = 'Duration must be positive (at least 1 minute).'
      }
    }
  }

  if (input.base_points !== undefined && (isNaN(input.base_points) || input.base_points < 0)) {
    errors.base_points = 'Base points must be a non-negative number.'
  }

  if (input.speed_bonus_max !== undefined && (isNaN(input.speed_bonus_max) || input.speed_bonus_max < 0)) {
    errors.speed_bonus_max = 'Speed bonus must be a non-negative number.'
  }

  if (input.wrong_answer_penalty !== undefined && (isNaN(input.wrong_answer_penalty) || input.wrong_answer_penalty < 0)) {
    errors.wrong_answer_penalty = 'Wrong answer penalty must be a non-negative number.'
  }

  if (input.submission_cooldown_seconds !== undefined && (isNaN(input.submission_cooldown_seconds) || input.submission_cooldown_seconds < 0)) {
    errors.submission_cooldown_seconds = 'Submission cooldown must be a non-negative number.'
  }

  if (isPublishing) {
    if (input.start_time && input.end_time) {
      const endMs = new Date(input.end_time).getTime()
      if (!isNaN(endMs) && endMs <= Date.now()) {
        errors.end_time = 'Cannot publish a battle whose end time is already in the past.'
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Fetches all battles for administrator inspection with safely derived effective statuses and exercise counts
 */
export async function fetchAdminBattles(): Promise<ArcadeBattle[]> {
  try {
    const [battlesRes, countRes] = await Promise.all([
      supabase.from('arcade_battles').select('*').order('created_at', { ascending: false }),
      supabase.from('arcade_battle_exercises').select('battle_id'),
    ])

    if (battlesRes.error || !battlesRes.data) {
      return []
    }

    const countMap: Record<string, number> = {}
    if (countRes.data) {
      countRes.data.forEach((row: any) => {
        countMap[row.battle_id] = (countMap[row.battle_id] || 0) + 1
      })
    }

    return battlesRes.data.map((b: any) => {
      const startMs = new Date(b.start_time).getTime()
      const endMs = new Date(b.end_time).getTime()
      const derivedDuration = Math.max(1, Math.round((endMs - startMs) / 60000))

      return {
        id: b.id,
        title: b.title,
        description: b.description || '',
        rules: b.rules || '',
        start_time: b.start_time,
        end_time: b.end_time,
        duration_minutes: b.duration_minutes ?? derivedDuration,
        status: b.status as ArcadeBattleStatus,
        effective_status: deriveBattleEffectiveStatus(b.status as ArcadeBattleStatus, b.start_time, b.end_time),
        base_points: b.base_points ?? 100,
        speed_bonus_max: b.speed_bonus_max ?? 50,
        wrong_answer_penalty: b.wrong_answer_penalty ?? 10,
        submission_cooldown_seconds: b.submission_cooldown_seconds ?? 30,
        tie_breaker_rule: (b.tie_breaker_rule as TieBreakerRule) || 'fastest_time',
        exercise_count: countMap[b.id] || 0,
        created_by: b.created_by,
        created_at: b.created_at,
        updated_at: b.updated_at,
      }
    })
  } catch {
    return []
  }
}

/**
 * Fetches the ordered coding exercises associated with a battle
 */
export async function fetchBattleExercises(battleId: string): Promise<BattleExercise[]> {
  try {
    // 1. Try atomic stored procedure get_battle_exercises
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_battle_exercises', {
      p_battle_id: battleId,
    })

    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      return rpcData.map((row: any) => ({
        id: row.id,
        battle_id: row.battle_id,
        exercise_id: row.exercise_id,
        order_position: row.order_position,
        created_at: row.created_at,
        challenge: {
          id: row.exercise_id,
          title: row.challenge_title || 'Coding Quest',
          slug: row.challenge_slug || 'coding-quest',
          difficulty: row.challenge_difficulty || 'Standard',
          category: row.challenge_category || 'Algorithm',
          language: row.challenge_language || 'javascript',
          xp_reward: row.challenge_xp_reward || 50,
          description: row.challenge_description || '',
        } as any,
      }))
    }

    // 2. Direct query fallback
    const { data, error } = await supabase
      .from('arcade_battle_exercises')
      .select(`
        id,
        battle_id,
        exercise_id,
        order_position,
        created_at,
        challenges (
          id,
          title,
          slug,
          difficulty,
          category,
          language,
          description,
          xp_reward,
          hints,
          instructions,
          sample_input
        )
      `)
      .eq('battle_id', battleId)
      .order('order_position', { ascending: true })

    if (error || !data) {
      return []
    }

    return data.map((row: any) => ({
      id: row.id,
      battle_id: row.battle_id,
      exercise_id: row.exercise_id,
      order_position: row.order_position,
      created_at: row.created_at,
      challenge: row.challenges || undefined,
    }))
  } catch {
    return []
  }
}

/**
 * Atomically saves the deterministic ordered question set for a battle
 */
export async function saveBattleExercises(
  battleId: string,
  exerciseIds: string[],
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Try atomic stored procedure save_arcade_battle_exercises
    const { data: rpcData, error: rpcError } = await supabase.rpc('save_arcade_battle_exercises', {
      p_battle_id: battleId,
      p_exercise_ids: exerciseIds,
      p_admin_user_id: adminUserId || null,
    })

    if (!rpcError && rpcData) {
      if (!rpcData.success) {
        return { success: false, error: rpcData.error || 'Failed to save exercises.' }
      }
      return { success: true }
    }

    // 2. Fallback direct table operation
    const { data: battle, error: battleError } = await supabase
      .from('arcade_battles')
      .select('id, status, title')
      .eq('id', battleId)
      .single()

    if (battleError || !battle) {
      return { success: false, error: 'Battle not found.' }
    }

    if (battle.status === 'live' || battle.status === 'ended') {
      return { success: false, error: 'Cannot modify questions of a live or concluded battle.' }
    }

    // Reject duplicate exercise IDs
    const uniqueIds = Array.from(new Set(exerciseIds))
    if (uniqueIds.length !== exerciseIds.length) {
      return { success: false, error: 'Duplicate exercises are not permitted in the same battle.' }
    }

    // Clear existing questions for this battle
    const { error: deleteError } = await supabase
      .from('arcade_battle_exercises')
      .delete()
      .eq('battle_id', battleId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    // Insert new questions in deterministic order
    if (exerciseIds.length > 0) {
      const rows = exerciseIds.map((exId, idx) => ({
        battle_id: battleId,
        exercise_id: exId,
        order_position: idx + 1,
      }))

      const { error: insertError } = await supabase
        .from('arcade_battle_exercises')
        .insert(rows)

      if (insertError) {
        return { success: false, error: insertError.message }
      }
    }

    // 5. Audit log
    if (adminUserId) {
      try {
        await supabase.from('admin_audit_logs').insert({
          admin_user_id: adminUserId,
          action: 'UPDATE_BATTLE_QUESTIONS',
          entity_type: 'arcade_battle',
          entity_id: battleId,
          metadata: { question_count: exerciseIds.length, exercise_ids: exerciseIds },
        })
      } catch {
        // Non-blocking
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save battle questions.' }
  }
}

/**
 * Creates a new arcade battle (Draft or Published) with full constraint validation
 */
export async function createBattle(
  input: CreateBattleInput,
  adminUserId?: string
): Promise<{ success: boolean; battle?: ArcadeBattle; error?: string }> {
  const isPublishing = input.status === 'upcoming'
  const validation = validateBattleInput(input, isPublishing)

  if (!validation.valid) {
    const firstErr = Object.values(validation.errors)[0]
    return { success: false, error: firstErr || 'Validation failed.' }
  }

  try {
    const payload = {
      title: input.title.trim(),
      description: input.description?.trim() || '',
      rules: input.rules?.trim() || '',
      start_time: new Date(input.start_time).toISOString(),
      end_time: new Date(input.end_time).toISOString(),
      status: input.status || 'draft',
      base_points: input.base_points ?? 100,
      speed_bonus_max: input.speed_bonus_max ?? 50,
      wrong_answer_penalty: input.wrong_answer_penalty ?? 10,
      submission_cooldown_seconds: input.submission_cooldown_seconds ?? 30,
      tie_breaker_rule: input.tie_breaker_rule || 'fastest_time',
      created_by: adminUserId || null,
    }

    const { data, error } = await supabase
      .from('arcade_battles')
      .insert(payload)
      .select('*')
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create battle in database.' }
    }

    // Log admin audit action if admin user is present
    if (adminUserId) {
      try {
        await supabase.from('admin_audit_logs').insert({
          admin_user_id: adminUserId,
          action: 'CREATE_ARCADE_BATTLE',
          entity_type: 'arcade_battle',
          entity_id: data.id,
          metadata: { title: data.title, status: data.status },
        })
      } catch {
        // Non-blocking audit log
      }
    }

    const startMs = new Date(data.start_time).getTime()
    const endMs = new Date(data.end_time).getTime()
    const derivedDuration = Math.max(1, Math.round((endMs - startMs) / 60000))

    const newBattle: ArcadeBattle = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      rules: data.rules || '',
      start_time: data.start_time,
      end_time: data.end_time,
      duration_minutes: data.duration_minutes ?? derivedDuration,
      status: data.status as ArcadeBattleStatus,
      effective_status: deriveBattleEffectiveStatus(data.status as ArcadeBattleStatus, data.start_time, data.end_time),
      base_points: data.base_points ?? 100,
      speed_bonus_max: data.speed_bonus_max ?? 50,
      wrong_answer_penalty: data.wrong_answer_penalty ?? 10,
      submission_cooldown_seconds: data.submission_cooldown_seconds ?? 30,
      tie_breaker_rule: (data.tie_breaker_rule as TieBreakerRule) || 'fastest_time',
      exercise_count: 0,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    return { success: true, battle: newBattle }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred creating battle.' }
  }
}

/**
 * Updates an existing arcade battle
 */
export async function updateBattle(
  id: string,
  input: UpdateBattleInput,
  adminUserId?: string
): Promise<{ success: boolean; battle?: ArcadeBattle; error?: string }> {
  const isPublishing = input.status === 'upcoming'
  const validation = validateBattleInput(input as any, isPublishing)

  if (!validation.valid) {
    const firstErr = Object.values(validation.errors)[0]
    return { success: false, error: firstErr || 'Validation failed.' }
  }

  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (input.title !== undefined) payload.title = input.title.trim()
    if (input.description !== undefined) payload.description = input.description.trim()
    if (input.rules !== undefined) payload.rules = input.rules.trim()
    if (input.start_time !== undefined) payload.start_time = new Date(input.start_time).toISOString()
    if (input.end_time !== undefined) payload.end_time = new Date(input.end_time).toISOString()
    if (input.status !== undefined) payload.status = input.status
    if (input.base_points !== undefined) payload.base_points = input.base_points
    if (input.speed_bonus_max !== undefined) payload.speed_bonus_max = input.speed_bonus_max
    if (input.wrong_answer_penalty !== undefined) payload.wrong_answer_penalty = input.wrong_answer_penalty
    if (input.submission_cooldown_seconds !== undefined) payload.submission_cooldown_seconds = input.submission_cooldown_seconds
    if (input.tie_breaker_rule !== undefined) payload.tie_breaker_rule = input.tie_breaker_rule

    const { data, error } = await supabase
      .from('arcade_battles')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to update battle in database.' }
    }

    if (adminUserId) {
      try {
        await supabase.from('admin_audit_logs').insert({
          admin_user_id: adminUserId,
          action: 'UPDATE_ARCADE_BATTLE',
          entity_type: 'arcade_battle',
          entity_id: data.id,
          metadata: { title: data.title, status: data.status },
        })
      } catch {
        // Non-blocking audit log
      }
    }

    const startMs = new Date(data.start_time).getTime()
    const endMs = new Date(data.end_time).getTime()
    const derivedDuration = Math.max(1, Math.round((endMs - startMs) / 60000))

    const updatedBattle: ArcadeBattle = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      rules: data.rules || '',
      start_time: data.start_time,
      end_time: data.end_time,
      duration_minutes: data.duration_minutes ?? derivedDuration,
      status: data.status as ArcadeBattleStatus,
      effective_status: deriveBattleEffectiveStatus(data.status as ArcadeBattleStatus, data.start_time, data.end_time),
      base_points: data.base_points ?? 100,
      speed_bonus_max: data.speed_bonus_max ?? 50,
      wrong_answer_penalty: data.wrong_answer_penalty ?? 10,
      submission_cooldown_seconds: data.submission_cooldown_seconds ?? 30,
      tie_breaker_rule: (data.tie_breaker_rule as TieBreakerRule) || 'fastest_time',
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    return { success: true, battle: updatedBattle }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred updating battle.' }
  }
}

/**
 * Transitions a draft battle to published/upcoming state with question set safety verification
 */
export async function publishBattle(
  id: string,
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Try atomic stored procedure publish_arcade_battle
    const { data: rpcData, error: rpcError } = await supabase.rpc('publish_arcade_battle', {
      p_battle_id: id,
      p_admin_user_id: adminUserId || null,
    })

    if (!rpcError && rpcData) {
      if (!rpcData.success) {
        return { success: false, error: rpcData.error || 'Failed to publish battle.' }
      }
      return { success: true }
    }

    // 2. Fallback direct update
    const { data: battle, error: fetchError } = await supabase
      .from('arcade_battles')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !battle) {
      return { success: false, error: 'Battle not found.' }
    }

    // Validate battle configuration parameters
    const validation = validateBattleInput(
      {
        title: battle.title,
        start_time: battle.start_time,
        end_time: battle.end_time,
        base_points: battle.base_points,
        speed_bonus_max: battle.speed_bonus_max,
        wrong_answer_penalty: battle.wrong_answer_penalty,
        submission_cooldown_seconds: battle.submission_cooldown_seconds,
      },
      true
    )

    if (!validation.valid) {
      const firstErr = Object.values(validation.errors)[0]
      return { success: false, error: `Cannot publish: ${firstErr}` }
    }

    // Publish Safety: Verify at least one exercise is assigned
    const { data: exercises, error: exError } = await supabase
      .from('arcade_battle_exercises')
      .select('id')
      .eq('battle_id', id)

    if (exError || !exercises || exercises.length === 0) {
      return {
        success: false,
        error: 'Cannot publish battle: At least one coding exercise must be assigned.',
      }
    }

    const targetStatus = new Date(battle.start_time).getTime() <= Date.now() ? 'live' : 'upcoming'

    const { error: updateError } = await supabase
      .from('arcade_battles')
      .update({ status: targetStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    if (adminUserId) {
      try {
        await supabase.from('admin_audit_logs').insert({
          admin_user_id: adminUserId,
          action: 'PUBLISH_ARCADE_BATTLE',
          entity_type: 'arcade_battle',
          entity_id: id,
          metadata: { title: battle.title, question_count: exercises.length },
        })
      } catch {
        // Non-blocking
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to publish battle.' }
  }
}

/**
 * Deletes an arcade battle
 */
export async function deleteBattle(
  id: string,
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('arcade_battles')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    if (adminUserId) {
      try {
        await supabase.from('admin_audit_logs').insert({
          admin_user_id: adminUserId,
          action: 'DELETE_ARCADE_BATTLE',
          entity_type: 'arcade_battle',
          entity_id: id,
        })
      } catch {
        // Non-blocking
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete battle.' }
  }
}

/**
 * React Hook for Admin Battles management with live updates
 */
export function useAdminBattles() {
  const [battles, setBattles] = useState<ArcadeBattle[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const data = await fetchAdminBattles()
    setBattles(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  // Realtime subscription to arcade_battles
  useEffect(() => {
    const channel = supabase
      .channel('admin_arcade_battles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arcade_battles',
        },
        () => {
          reload()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [reload])

  return {
    battles,
    loading,
    refreshBattles: reload,
  }
}

// ==========================================
// PHASE 10: STUDENT BATTLE DISCOVERY & LOBBY
// ==========================================

export interface ArcadeBattleRegistration {
  id: string
  battle_id: string
  team_id: string
  registered_by: string
  status: 'confirmed' | 'cancelled'
  registered_at: string
  team?: ArcadeTeam
}

export interface BattleParticipationAccess {
  allowed: boolean
  effective_status?: ArcadeBattleStatus
  team_id?: string
  team_name?: string
  is_captain?: boolean
  is_registered?: boolean
  is_late_join?: boolean
  reason?: string
}

/**
 * Fetches all published/live/ended battles for students (drafts are never returned)
 * Along with registration status for the student's active squad.
 */
export async function fetchStudentBattles(userId?: string): Promise<{
  battles: ArcadeBattle[]
  registeredBattleIds: string[]
  userTeam: ArcadeTeam | null
  isCaptain: boolean
}> {
  try {
    let userTeam: ArcadeTeam | null = null
    let isCaptain = false
    let registeredBattleIds: string[] = []

    if (userId) {
      const { data: memberData } = await supabase
        .from('arcade_team_members')
        .select('team_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (memberData?.team_id) {
        const { data: teamData } = await supabase
          .from('arcade_teams')
          .select('*')
          .eq('id', memberData.team_id)
          .eq('status', 'active')
          .maybeSingle()

        if (teamData) {
          userTeam = teamData as ArcadeTeam
          isCaptain = teamData.captain_id === userId

          const { data: regData } = await supabase
            .from('arcade_battle_registrations')
            .select('battle_id')
            .eq('team_id', teamData.id)
            .eq('status', 'confirmed')

          if (regData) {
            registeredBattleIds = regData.map((r: any) => r.battle_id)
          }
        }
      }
    }

    const [battlesRes, countRes] = await Promise.all([
      supabase
        .from('arcade_battles')
        .select('*')
        .neq('status', 'draft')
        .order('start_time', { ascending: true }),
      supabase.from('arcade_battle_exercises').select('battle_id'),
    ])

    if (battlesRes.error || !battlesRes.data) {
      return { battles: [], registeredBattleIds: [], userTeam, isCaptain }
    }

    const countMap: Record<string, number> = {}
    if (countRes.data) {
      countRes.data.forEach((row: any) => {
        countMap[row.battle_id] = (countMap[row.battle_id] || 0) + 1
      })
    }

    const mappedBattles: ArcadeBattle[] = battlesRes.data.map((b: any) => {
      const startMs = new Date(b.start_time).getTime()
      const endMs = new Date(b.end_time).getTime()
      const derivedDuration = Math.max(1, Math.round((endMs - startMs) / 60000))
      const effStatus = deriveBattleEffectiveStatus(b.status as ArcadeBattleStatus, b.start_time, b.end_time)

      return {
        id: b.id,
        title: b.title,
        description: b.description || '',
        rules: b.rules || '',
        start_time: b.start_time,
        end_time: b.end_time,
        duration_minutes: b.duration_minutes ?? derivedDuration,
        status: b.status as ArcadeBattleStatus,
        effective_status: effStatus,
        base_points: b.base_points ?? 100,
        speed_bonus_max: b.speed_bonus_max ?? 50,
        wrong_answer_penalty: b.wrong_answer_penalty ?? 10,
        submission_cooldown_seconds: b.submission_cooldown_seconds ?? 30,
        tie_breaker_rule: (b.tie_breaker_rule as TieBreakerRule) || 'fastest_time',
        exercise_count: countMap[b.id] || 0,
        is_registered: registeredBattleIds.includes(b.id),
        created_by: b.created_by,
        created_at: b.created_at,
        updated_at: b.updated_at,
      }
    })

    return {
      battles: mappedBattles,
      registeredBattleIds,
      userTeam,
      isCaptain,
    }
  } catch {
    return { battles: [], registeredBattleIds: [], userTeam: null, isCaptain: false }
  }
}

/**
 * Registers student team for upcoming battle via secure stored procedure
 */
export async function registerBattleAction(
  battleId: string,
  userId: string
): Promise<{ success: boolean; battle_title?: string; team_name?: string; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('register_team_for_battle', {
      p_battle_id: battleId,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Registration failed.' }
    }

    return {
      success: true,
      battle_title: data.battle_title,
      team_name: data.team_name,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred during registration.' }
  }
}

/**
 * Checks participation access clearance for student battle lobby / live match
 */
export async function checkBattleAccess(
  battleId: string,
  userId: string
): Promise<BattleParticipationAccess> {
  try {
    const { data, error } = await supabase.rpc('check_battle_participation_access', {
      p_battle_id: battleId,
      p_user_id: userId,
    })

    if (error || !data) {
      return {
        allowed: false,
        reason: error?.message || 'Access verification failed.',
      }
    }

    return data as BattleParticipationAccess
  } catch (err: any) {
    return {
      allowed: false,
      reason: err.message || 'Failed to verify battle clearance.',
    }
  }
}

/**
 * React Hook for student battle discovery & registration
 */
export function useStudentBattles(userId?: string) {
  const [battles, setBattles] = useState<ArcadeBattle[]>([])
  const [registeredBattleIds, setRegisteredBattleIds] = useState<string[]>([])
  const [userTeam, setUserTeam] = useState<ArcadeTeam | null>(null)
  const [isCaptain, setIsCaptain] = useState(false)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const res = await fetchStudentBattles(userId)
    setBattles(res.battles)
    setRegisteredBattleIds(res.registeredBattleIds)
    setUserTeam(res.userTeam)
    setIsCaptain(res.isCaptain)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`student_battles_channel_${userId || 'anon'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battles' },
        () => reload()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battle_registrations' },
        () => reload()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [reload, userId])

  return {
    battles,
    registeredBattleIds,
    userTeam,
    isCaptain,
    loading,
    refreshBattles: reload,
  }
}

/**
 * React Hook for battle lobby: access control, countdown, team members, and ordered questions
 */
export function useBattleLobby(battleId: string, userId?: string) {
  const [access, setAccess] = useState<BattleParticipationAccess | null>(null)
  const [battle, setBattle] = useState<ArcadeBattle | null>(null)
  const [exercises, setExercises] = useState<BattleExercise[]>([])
  const [teamMembers, setTeamMembers] = useState<ArcadeTeamMember[]>([])
  const [teamProgress, setTeamProgress] = useState<BattleTeamQuestProgress[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!battleId) return

    // 1. Fetch battle details
    const { data: battleData } = await supabase
      .from('arcade_battles')
      .select('*')
      .eq('id', battleId)
      .maybeSingle()

    if (battleData) {
      const startMs = new Date(battleData.start_time).getTime()
      const endMs = new Date(battleData.end_time).getTime()
      const derivedDuration = Math.max(1, Math.round((endMs - startMs) / 60000))
      const effStatus = deriveBattleEffectiveStatus(
        battleData.status as ArcadeBattleStatus,
        battleData.start_time,
        battleData.end_time
      )

      setBattle({
        id: battleData.id,
        title: battleData.title,
        description: battleData.description || '',
        rules: battleData.rules || '',
        start_time: battleData.start_time,
        end_time: battleData.end_time,
        duration_minutes: battleData.duration_minutes ?? derivedDuration,
        status: battleData.status as ArcadeBattleStatus,
        effective_status: effStatus,
        base_points: battleData.base_points ?? 100,
        speed_bonus_max: battleData.speed_bonus_max ?? 50,
        wrong_answer_penalty: battleData.wrong_answer_penalty ?? 10,
        submission_cooldown_seconds: battleData.submission_cooldown_seconds ?? 30,
        tie_breaker_rule: (battleData.tie_breaker_rule as TieBreakerRule) || 'fastest_time',
        created_by: battleData.created_by,
        created_at: battleData.created_at,
        updated_at: battleData.updated_at,
      })
    }

    // 2. Check access clearance
    if (userId) {
      const accessRes = await checkBattleAccess(battleId, userId)
      setAccess(accessRes)

      // If access approved, load team members
      if (accessRes.allowed && accessRes.team_id) {
        const { data: membersData } = await supabase
          .from('arcade_team_members')
          .select(`
            id,
            team_id,
            user_id,
            role,
            joined_at,
            profiles (
              id,
              username,
              full_name,
              avatar_url,
              level,
              xp
            )
          `)
          .eq('team_id', accessRes.team_id)
          .order('joined_at', { ascending: true })

        if (membersData) {
          setTeamMembers(
            membersData.map((m: any) => ({
              id: m.id,
              team_id: m.team_id,
              user_id: m.user_id,
              role: (m.role as 'captain' | 'member') || 'member',
              joined_at: m.joined_at,
              profile: m.profiles || undefined,
            }))
          )
        }

        // Load team quest progression if team is registered
        const progRes = await fetchBattleTeamProgress(battleId, accessRes.team_id, userId)
        if (progRes.success && progRes.progress) {
          setTeamProgress(progRes.progress)
        }
      }
    }

    // Load ordered questions for this battle
    const qExercises = await fetchBattleExercises(battleId)
    setExercises(qExercises)

    setLoading(false)
  }, [battleId, userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`battle_lobby_${battleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battles', filter: `id=eq.${battleId}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battle_registrations', filter: `battle_id=eq.${battleId}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battle_team_progress', filter: `battle_id=eq.${battleId}` },
        () => loadData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [battleId, loadData])

  const teamScore = teamProgress.reduce((sum, p) => sum + (p.score_awarded || 0), 0)

  return {
    access,
    battle,
    exercises,
    teamMembers,
    teamProgress,
    teamScore,
    loading,
    refreshLobby: loadData,
  }
}

// ==========================================
// PHASE 11: REAL-TIME COLLABORATIVE CODING
// ==========================================

export interface BattleWorkspaceRecord {
  id?: string
  battle_id: string
  team_id: string
  exercise_id: string
  code: string
  language: string
  version: number
  updated_at?: string
}

export interface CollabPresenceUser {
  user_id: string
  username?: string
  full_name?: string
  avatar_url?: string
  online_at: number
}

export async function fetchBattleWorkspace(
  battleId: string,
  teamId: string,
  exerciseId: string,
  userId: string
): Promise<{ success: boolean; code?: string; language?: string; version?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('get_or_create_battle_workspace', {
      p_battle_id: battleId,
      p_team_id: teamId,
      p_exercise_id: exerciseId,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      code: data?.code ?? '',
      language: data?.language ?? 'javascript',
      version: data?.version ?? 1,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch workspace.' }
  }
}

export async function saveBattleWorkspaceSnapshot(
  battleId: string,
  teamId: string,
  exerciseId: string,
  userId: string,
  code: string,
  language: string = 'javascript',
  version: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('save_battle_workspace_snapshot', {
      p_battle_id: battleId,
      p_team_id: teamId,
      p_exercise_id: exerciseId,
      p_user_id: userId,
      p_code: code,
      p_language: language,
      p_version: version,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: data?.success ?? true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save snapshot.' }
  }
}

export function useBattleCollabWorkspace({
  battleId,
  teamId,
  exerciseId,
  initialCode = '',
  language = 'javascript',
  userId,
  userProfile,
  isLive = true,
}: {
  battleId: string
  teamId: string
  exerciseId: string
  initialCode?: string
  language?: string
  userId?: string
  userProfile?: { username?: string; full_name?: string; avatar_url?: string }
  isLive?: boolean
}) {
  const [code, setCode] = useState<string>(initialCode)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'reconnecting' | 'readonly'>(
    isLive ? 'synced' : 'readonly'
  )
  const [presenceUsers, setPresenceUsers] = useState<CollabPresenceUser[]>([])
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true)

  const isRemoteUpdateRef = useRef(false)
  const latestCodeRef = useRef(initialCode)
  const versionRef = useRef(1)
  const lastReceivedTimestampRef = useRef(0)
  const dirtyRef = useRef(false)
  const channelRef = useRef<any>(null)
  const saveTimeoutRef = useRef<any>(null)

  // Keep latestCodeRef in sync
  latestCodeRef.current = code

  // 1. Initial Workspace Load
  useEffect(() => {
    let isMounted = true
    setIsLoadingWorkspace(true)

    const init = async () => {
      if (!battleId || !teamId || !exerciseId || !userId) return

      const res = await fetchBattleWorkspace(battleId, teamId, exerciseId, userId)
      if (isMounted && res.success && res.code !== undefined) {
        setCode(res.code)
        latestCodeRef.current = res.code
        versionRef.current = res.version || 1
        dirtyRef.current = false
      }
      if (isMounted) {
        setIsLoadingWorkspace(false)
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [battleId, teamId, exerciseId, userId])

  // 2. Snapshot Flush helper
  const flushSnapshot = useCallback(async () => {
    if (!dirtyRef.current || !userId || !isLive) return
    setSyncStatus('saving')
    const codeToSave = latestCodeRef.current
    const res = await saveBattleWorkspaceSnapshot(
      battleId,
      teamId,
      exerciseId,
      userId,
      codeToSave,
      language,
      versionRef.current
    )
    if (res.success) {
      dirtyRef.current = false
      setSyncStatus('synced')
    }
  }, [battleId, teamId, exerciseId, userId, language, isLive])

  // 3. Realtime Channel & Broadcast Subscription
  useEffect(() => {
    if (!battleId || !teamId || !exerciseId || !userId) return

    const channelName = `collab_${battleId}_${teamId}_${exerciseId}`
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false },
        presence: { key: userId },
      },
    })

    channelRef.current = channel

    // Presence Sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const users: CollabPresenceUser[] = []
      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (p.user_id) {
            users.push({
              user_id: p.user_id,
              username: p.username,
              full_name: p.full_name,
              avatar_url: p.avatar_url,
              online_at: p.online_at || Date.now(),
            })
          }
        })
      })
      setPresenceUsers(users)
    })

    // Listen to code_update broadcasts
    channel.on('broadcast', { event: 'code_update' }, ({ payload }: any) => {
      if (!payload || payload.senderId === userId) return
      if (payload.timestamp < lastReceivedTimestampRef.current) return

      lastReceivedTimestampRef.current = payload.timestamp
      versionRef.current = Math.max(versionRef.current, payload.version || 1)
      latestCodeRef.current = payload.code

      isRemoteUpdateRef.current = true
      setCode(payload.code)
      setSyncStatus('synced')

      // Reset remote update lock next tick
      setTimeout(() => {
        isRemoteUpdateRef.current = false
      }, 30)
    })

    // Listen to request_state broadcast from joining peers
    channel.on('broadcast', { event: 'request_state' }, ({ payload }: any) => {
      if (!payload || payload.senderId === userId) return
      // Send current in-memory state to newcomer
      channel.send({
        type: 'broadcast',
        event: 'current_state',
        payload: {
          code: latestCodeRef.current,
          version: versionRef.current,
          senderId: userId,
          targetId: payload.senderId,
          timestamp: Date.now(),
        },
      })
    })

    // Listen to current_state replies
    channel.on('broadcast', { event: 'current_state' }, ({ payload }: any) => {
      if (!payload || payload.targetId !== userId) return
      if (payload.timestamp < lastReceivedTimestampRef.current) return

      lastReceivedTimestampRef.current = payload.timestamp
      versionRef.current = Math.max(versionRef.current, payload.version || 1)
      latestCodeRef.current = payload.code

      isRemoteUpdateRef.current = true
      setCode(payload.code)
      setSyncStatus('synced')

      setTimeout(() => {
        isRemoteUpdateRef.current = false
      }, 30)
    })

    // Subscribe and track presence
    channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        setSyncStatus(isLive ? 'synced' : 'readonly')
        await channel.track({
          user_id: userId,
          username: userProfile?.username,
          full_name: userProfile?.full_name,
          avatar_url: userProfile?.avatar_url,
          online_at: Date.now(),
        })

        // Request latest live state from any active peer
        channel.send({
          type: 'broadcast',
          event: 'request_state',
          payload: { senderId: userId },
        })
      } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
        setSyncStatus('reconnecting')
      }
    })

    return () => {
      // Flush dirty snapshot before channel leave
      flushSnapshot()
      channel.untrack()
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [battleId, teamId, exerciseId, userId, userProfile, isLive, flushSnapshot])

  // 4. Local editor change handler (broadcasts via WebSocket, queues debounced DB snapshot)
  const handleCodeChange = useCallback(
    (nextCode: string | undefined) => {
      const val = nextCode ?? ''
      setCode(val)
      latestCodeRef.current = val

      // If this update was triggered by incoming peer broadcast, do not echo back
      if (isRemoteUpdateRef.current) return
      if (!isLive) return

      versionRef.current += 1
      dirtyRef.current = true

      // Broadcast immediately to team peers over WebSocket
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'code_update',
          payload: {
            code: val,
            senderId: userId,
            timestamp: Date.now(),
            version: versionRef.current,
          },
        })
      }

      // Debounce PostgreSQL snapshot write (3 seconds after last keystroke)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        flushSnapshot()
      }, 3000)
    },
    [userId, isLive, flushSnapshot]
  )

  // 5. Force save helper
  const forceSaveSnapshot = useCallback(() => {
    return flushSnapshot()
  }, [flushSnapshot])

  return {
    code,
    handleCodeChange,
    syncStatus: isLive ? syncStatus : 'readonly',
    presenceUsers,
    isLoadingWorkspace,
    forceSaveSnapshot,
  }
}

// ==========================================
// PHASE 12: QUEST SUBMISSION & SPEED SCORING
// ==========================================

export interface BattleTeamQuestProgress {
  id: string
  battle_id: string
  team_id: string
  exercise_id: string
  order_position: number
  status: 'locked' | 'unlocked' | 'completed'
  attempts_count: number
  base_points: number
  speed_bonus: number
  penalty: number
  score_awarded: number
  completed_at?: string
  completed_by?: string
  last_submitted_at?: string
}

export interface BattleSubmissionResult {
  success: boolean
  submission_id?: string
  status?: 'passed' | 'failed' | 'execution_error' | 'timeout'
  passedCount?: number
  totalCount?: number
  testResults?: any[]
  score_awarded?: number
  base_points?: number
  speed_bonus?: number
  penalty?: number
  team_total_score?: number
  next_unlocked_order?: number
  cooldown_remaining_seconds?: number
  already_completed?: boolean
  error?: string
}

function normalizeOutput(str: string): string {
  return str
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim()
}

export async function fetchBattleTeamProgress(
  battleId: string,
  teamId: string,
  userId: string
): Promise<{ success: boolean; progress?: BattleTeamQuestProgress[]; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('get_or_init_battle_team_progress', {
      p_battle_id: battleId,
      p_team_id: teamId,
      p_user_id: userId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      progress: data?.progress || [],
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch team progress.' }
  }
}

export async function submitBattleQuestSolution(
  battleId: string,
  teamId: string,
  exerciseId: string,
  code: string,
  language: string,
  userId: string
): Promise<BattleSubmissionResult> {
  const startTime = Date.now()
  try {
    // 1. Clearance check (timing, membership, registration, quest unlock, cooldown)
    const { data: clearance, error: clearanceErr } = await supabase.rpc(
      'validate_battle_submission_clearance',
      {
        p_battle_id: battleId,
        p_team_id: teamId,
        p_exercise_id: exerciseId,
        p_user_id: userId,
      }
    )

    if (clearanceErr || !clearance) {
      return { success: false, error: clearanceErr?.message || 'Clearance check failed.' }
    }

    if (!clearance.allowed) {
      return {
        success: false,
        error: clearance.reason || 'Submission not allowed.',
        cooldown_remaining_seconds: clearance.cooldown_remaining_seconds,
      }
    }

    // 2. Fetch test cases for this exercise
    const testCases = await fetchExerciseTestCases(exerciseId)
    const testResults: any[] = []
    let overallStatus: 'passed' | 'failed' | 'execution_error' | 'timeout' = 'passed'

    if (testCases.length === 0) {
      // If no explicit test cases, run code once to verify execution without error
      const execRes = await executeCode(language, code, '', exerciseId)
      const passed = execRes.status === 'success'
      testResults.push({
        testCaseId: 'default-1',
        orderIndex: 1,
        isHidden: false,
        passed,
        actualOutput: execRes.stdout,
        error: execRes.stderr || undefined,
      })
      if (!passed) {
        overallStatus = execRes.status === 'timeout' ? 'timeout' : 'execution_error'
      }
    } else {
      // Evaluate against each active test case
      for (const tc of testCases) {
        const execRes = await executeCode(language, code, tc.input, exerciseId)

        if (execRes.status === 'compile_error' || execRes.status === 'error') {
          overallStatus = 'execution_error'
          testResults.push({
            testCaseId: tc.id,
            orderIndex: tc.order_index,
            isHidden: tc.is_hidden,
            passed: false,
            error: execRes.stderr || 'Compilation or execution failed.',
          })
          break
        }

        if (execRes.status === 'timeout') {
          overallStatus = 'timeout'
          testResults.push({
            testCaseId: tc.id,
            orderIndex: tc.order_index,
            isHidden: tc.is_hidden,
            passed: false,
            error: 'Execution timed out (10s limit exceeded).',
          })
          break
        }

        const normActual = normalizeOutput(execRes.stdout || '')
        const normExpected = normalizeOutput(tc.expected_output || '')
        const passed = normActual === normExpected

        if (!passed && overallStatus === 'passed') {
          overallStatus = 'failed'
        }

        testResults.push({
          testCaseId: tc.id,
          orderIndex: tc.order_index,
          isHidden: tc.is_hidden,
          passed,
          input: tc.is_hidden ? undefined : tc.input,
          expectedOutput: tc.is_hidden ? undefined : tc.expected_output,
          actualOutput: tc.is_hidden ? undefined : execRes.stdout,
          error: execRes.stderr || undefined,
        })
      }
    }

    const passedCount = testResults.filter((t) => t.passed).length
    const totalCount = testResults.length
    const execTimeMs = Date.now() - startTime

    // 3. Persist authoritative result and compute speed bonus & penalties in PostgreSQL
    const { data: recordRes, error: recordErr } = await supabase.rpc(
      'record_battle_quest_submission',
      {
        p_battle_id: battleId,
        p_team_id: teamId,
        p_exercise_id: exerciseId,
        p_user_id: userId,
        p_code: code,
        p_language: language,
        p_status: overallStatus,
        p_passed_count: passedCount,
        p_total_count: totalCount,
        p_exec_time_ms: execTimeMs,
      }
    )

    if (recordErr || !recordRes) {
      return { success: false, error: recordErr?.message || 'Failed to record submission.' }
    }

    return {
      success: true,
      submission_id: recordRes.submission_id,
      status: overallStatus,
      passedCount,
      totalCount,
      testResults,
      score_awarded: recordRes.score_awarded ?? 0,
      base_points: recordRes.base_points ?? 0,
      speed_bonus: recordRes.speed_bonus ?? 0,
      penalty: recordRes.penalty ?? 0,
      team_total_score: recordRes.team_total_score ?? 0,
      next_unlocked_order: recordRes.next_unlocked_order,
      already_completed: recordRes.already_completed,
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Submission error.' }
  }
}

// ==========================================
// PHASE 13: LIVE LEADERBOARD & FINAL RESULTS
// ==========================================

export interface BattleLeaderboardEntry {
  rank: number
  team_id: string
  team_name: string
  team_code: string
  member_count: number
  quests_completed: number
  total_quests: number
  team_total_score: number
  total_attempts: number
  total_speed_bonus: number
  last_completed_at?: string
  registered_at: string
}

export interface StudentBattleHistoryItem {
  battle_id: string
  battle_title: string
  battle_description: string
  start_time: string
  end_time: string
  team_id: string
  team_name: string
  team_code: string
  member_count: number
  final_rank: number
  final_score: number
  quests_completed: number
  total_quests: number
  total_teams: number
}

export async function fetchBattleLeaderboard(battleId: string): Promise<BattleLeaderboardEntry[]> {
  try {
    const { data, error } = await supabase.rpc('get_battle_leaderboard', {
      p_battle_id: battleId,
    })

    if (error || !data) {
      return []
    }

    return data.map((row: any) => ({
      rank: Number(row.rank),
      team_id: row.team_id,
      team_name: row.team_name,
      team_code: row.team_code,
      member_count: Number(row.member_count),
      quests_completed: Number(row.quests_completed),
      total_quests: Number(row.total_quests),
      team_total_score: Number(row.team_total_score),
      total_attempts: Number(row.total_attempts),
      total_speed_bonus: Number(row.total_speed_bonus),
      last_completed_at: row.last_completed_at || undefined,
      registered_at: row.registered_at,
    }))
  } catch {
    return []
  }
}

export async function finalizeBattleRankings(battleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('finalize_battle_rankings', {
      p_battle_id: battleId,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: data?.success ?? true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to finalize battle.' }
  }
}

export async function fetchStudentBattleHistory(userId: string): Promise<StudentBattleHistoryItem[]> {
  try {
    const { data, error } = await supabase.rpc('get_student_battle_history', {
      p_user_id: userId,
    })

    if (error || !data) {
      return []
    }

    return data.map((row: any) => ({
      battle_id: row.battle_id,
      battle_title: row.battle_title,
      battle_description: row.battle_description || '',
      start_time: row.start_time,
      end_time: row.end_time,
      team_id: row.team_id,
      team_name: row.team_name,
      team_code: row.team_code,
      member_count: Number(row.member_count),
      final_rank: Number(row.final_rank),
      final_score: Number(row.final_score),
      quests_completed: Number(row.quests_completed),
      total_quests: Number(row.total_quests),
      total_teams: Number(row.total_teams),
    }))
  } catch {
    return []
  }
}

export function useBattleLeaderboard(battleId: string) {
  const [leaderboard, setLeaderboard] = useState<BattleLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadLeaderboard = useCallback(async () => {
    if (!battleId) return
    const data = await fetchBattleLeaderboard(battleId)
    setLeaderboard(data)
    setLoading(false)
  }, [battleId])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  // Realtime leaderboard updates
  useEffect(() => {
    if (!battleId) return

    const channel = supabase
      .channel(`battle_lb_${battleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battle_team_progress', filter: `battle_id=eq.${battleId}` },
        () => loadLeaderboard()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battle_submissions', filter: `battle_id=eq.${battleId}` },
        () => loadLeaderboard()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battle_results', filter: `battle_id=eq.${battleId}` },
        () => loadLeaderboard()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battles', filter: `id=eq.${battleId}` },
        () => loadLeaderboard()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [battleId, loadLeaderboard])

  return {
    leaderboard,
    loading,
    refreshLeaderboard: loadLeaderboard,
  }
}

export function useStudentBattleHistory(userId?: string) {
  const [history, setHistory] = useState<StudentBattleHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    if (!userId) {
      setHistory([])
      setLoading(false)
      return
    }
    const data = await fetchStudentBattleHistory(userId)
    setHistory(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Realtime updates when battle completes
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user_battle_history_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_battle_results' },
        () => loadHistory()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, loadHistory])

  return {
    history,
    loading,
    refreshHistory: loadHistory,
  }
}



