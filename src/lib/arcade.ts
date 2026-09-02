import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

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


