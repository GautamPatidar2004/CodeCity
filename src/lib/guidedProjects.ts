import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { executeCode } from './execution'
import { createCommunityPost } from './community'

export type GuidedProjectDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type GuidedProjectStatus = 'draft' | 'published'

export interface BadgeSummary {
  id: string
  slug: string
  title: string
  icon: string
  category?: string
  description?: string | null
}

export type ValidationType = 'io_test' | 'dom_check'

export interface IOTestCase {
  input: string
  expected_output: string
  is_hidden?: boolean
}

export interface ValidationConfig {
  test_cases: IOTestCase[]
}

export interface ProjectStage {
  id: string
  project_id: string
  stage_order: number
  title: string
  instructions: string
  starter_code: string
  validation_type: ValidationType
  validation_config: ValidationConfig
  xp_reward: number
  created_at: string
  updated_at: string
}

export interface CreateProjectStageInput {
  project_id: string
  title: string
  instructions?: string
  starter_code?: string
  validation_type?: ValidationType
  validation_config?: ValidationConfig
  xp_reward?: number
}

export interface UpdateProjectStageInput {
  title?: string
  instructions?: string
  starter_code?: string
  validation_type?: ValidationType
  validation_config?: ValidationConfig
  xp_reward?: number
}

export interface GuidedProject {
  id: string
  title: string
  description: string | null
  difficulty: GuidedProjectDifficulty
  estimated_minutes: number
  badge_id: string | null
  badge?: BadgeSummary | null
  created_by: string | null
  status: GuidedProjectStatus
  stages_count?: number
  created_at: string
  updated_at: string
}

export type ProjectProgressStatus = 'in_progress' | 'completed'

export interface UserProjectProgress {
  id: string
  user_id: string
  project_id: string
  current_stage_order: number
  status: ProjectProgressStatus
  started_at: string
  completed_at?: string | null
  updated_at: string
}

export type StageProgressStatus = 'unlocked' | 'in_progress' | 'completed'

export interface UserStageProgress {
  id: string
  user_id: string
  project_id: string
  stage_id: string
  status: StageProgressStatus
  saved_code: string
  completed_at?: string | null
  updated_at: string
}

export interface StudentStageView extends ProjectStage {
  is_unlocked: boolean
  is_completed: boolean
  is_current: boolean
  student_code: string
}

export interface GuidedProjectWithStudentProgress extends GuidedProject {
  user_progress?: UserProjectProgress | null
  completed_stages_count?: number
}

export interface StageTestCaseResult {
  orderIndex: number
  isHidden: boolean
  passed: boolean
  actualOutput?: string
  expectedOutput?: string
  error?: string
}

export interface StageSubmissionResult {
  submissionId?: string
  passed: boolean
  executionStatus: 'passed' | 'failed' | 'execution_error' | 'timeout'
  testResults: StageTestCaseResult[]
  unlockedNextStage: boolean
  nextStageOrder?: number
  projectCompleted: boolean
  error?: string
}

export interface UserStageSubmission {
  id: string
  user_id: string
  stage_id: string
  code: string
  passed: boolean
  execution_status: string
  test_results: StageTestCaseResult[]
  submitted_at: string
}

export interface StageFunnelItem {
  stage_id: string
  stage_order: number
  title: string
  xp_reward: number
  reached_count: number
  completed_count: number
  submissions_count: number
  pass_rate: number
}

export interface ProjectAnalyticsItem {
  id: string
  title: string
  difficulty: GuidedProjectDifficulty
  status: GuidedProjectStatus
  estimated_minutes: number
  starts_count: number
  completions_count: number
  completion_rate: number
  avg_stage_reached: number
  stage_funnel: StageFunnelItem[]
}

export interface GuidedProjectsAnalyticsSummary {
  total_projects: number
  published_projects: number
  draft_projects: number
  total_starts: number
  total_completions: number
  completion_rate: number
}

export interface GuidedProjectsAnalyticsPayload {
  summary: GuidedProjectsAnalyticsSummary
  projects: ProjectAnalyticsItem[]
}

export interface ProjectRewardResult {
  success: boolean
  xp_awarded?: number
  badge_awarded?: {
    id: string
    title: string
    icon: string
    description?: string
    unlocked: boolean
  } | null
  error?: string
}

export interface CreateGuidedProjectInput {
  title: string
  description?: string
  difficulty: GuidedProjectDifficulty
  estimated_minutes: number
  badge_id?: string | null
  status?: GuidedProjectStatus
}

export interface UpdateGuidedProjectInput {
  title?: string
  description?: string
  difficulty?: GuidedProjectDifficulty
  estimated_minutes?: number
  badge_id?: string | null
  status?: GuidedProjectStatus
}

const PROJECT_SELECT_QUERY = `
  id,
  title,
  description,
  difficulty,
  estimated_minutes,
  badge_id,
  created_by,
  status,
  created_at,
  updated_at,
  badge:badges (
    id,
    slug,
    title,
    icon,
    category,
    description
  ),
  stages:project_stages (
    id
  )
`

/**
 * Fetches all guided projects for the admin view
 */
export async function fetchGuidedProjectsAdmin(): Promise<GuidedProject[]> {
  try {
    const { data, error } = await supabase
      .from('guided_projects')
      .select(PROJECT_SELECT_QUERY)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin guided projects:', error)
      return []
    }

    return (
      (data as any[])?.map((item) => ({
        ...item,
        stages_count: Array.isArray(item.stages) ? item.stages.length : 0,
      })) || []
    )
  } catch (err) {
    console.error('Unexpected error fetching admin guided projects:', err)
    return []
  }
}

/**
 * Fetches available badges from public.badges to associate with projects
 */
export async function fetchAvailableBadges(): Promise<BadgeSummary[]> {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('id, slug, title, icon, category, description')
      .order('title', { ascending: true })

    if (error) {
      console.error('Error fetching badges for guided projects:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Unexpected error fetching badges:', err)
    return []
  }
}

/**
 * Creates a new guided project (draft or published)
 */
export async function createGuidedProject(
  input: CreateGuidedProjectInput,
  userId?: string
): Promise<{ data?: GuidedProject; error?: string }> {
  try {
    const trimmedTitle = input.title?.trim()
    if (!trimmedTitle) {
      return { error: 'Project title cannot be empty.' }
    }

    const validDifficulties: GuidedProjectDifficulty[] = ['beginner', 'intermediate', 'advanced']
    if (!validDifficulties.includes(input.difficulty)) {
      return { error: 'Invalid difficulty selected.' }
    }

    const estimatedMinutes = Math.floor(Number(input.estimated_minutes))
    if (isNaN(estimatedMinutes) || estimatedMinutes <= 0) {
      return { error: 'Estimated time must be greater than 0 minutes.' }
    }

    const status: GuidedProjectStatus = input.status === 'published' ? 'published' : 'draft'

    const { data, error } = await supabase
      .from('guided_projects')
      .insert({
        title: trimmedTitle,
        description: input.description?.trim() || null,
        difficulty: input.difficulty,
        estimated_minutes: estimatedMinutes,
        badge_id: input.badge_id ? input.badge_id : null,
        created_by: userId || null,
        status,
      })
      .select(PROJECT_SELECT_QUERY)
      .single()

    if (error) {
      return { error: error.message }
    }

    const proj = data as any
    return {
      data: {
        ...proj,
        stages_count: Array.isArray(proj.stages) ? proj.stages.length : 0,
      },
    }
  } catch (err: any) {
    return { error: err?.message || 'Failed to create guided project.' }
  }
}

/**
 * Updates an existing guided project while preserving id and unedited fields
 */
export async function updateGuidedProject(
  id: string,
  input: UpdateGuidedProjectInput
): Promise<{ data?: GuidedProject; error?: string }> {
  try {
    const updates: Record<string, any> = {}

    if (input.title !== undefined) {
      const trimmedTitle = input.title.trim()
      if (!trimmedTitle) {
        return { error: 'Project title cannot be empty.' }
      }
      updates.title = trimmedTitle
    }

    if (input.description !== undefined) {
      updates.description = input.description.trim() || null
    }

    if (input.difficulty !== undefined) {
      const validDifficulties: GuidedProjectDifficulty[] = ['beginner', 'intermediate', 'advanced']
      if (!validDifficulties.includes(input.difficulty)) {
        return { error: 'Invalid difficulty selected.' }
      }
      updates.difficulty = input.difficulty
    }

    if (input.estimated_minutes !== undefined) {
      const estimatedMinutes = Math.floor(Number(input.estimated_minutes))
      if (isNaN(estimatedMinutes) || estimatedMinutes <= 0) {
        return { error: 'Estimated time must be greater than 0 minutes.' }
      }
      updates.estimated_minutes = estimatedMinutes
    }

    if (input.badge_id !== undefined) {
      updates.badge_id = input.badge_id ? input.badge_id : null
    }

    if (input.status !== undefined) {
      if (input.status !== 'draft' && input.status !== 'published') {
        return { error: 'Invalid project status.' }
      }
      updates.status = input.status
    }

    if (Object.keys(updates).length === 0) {
      return { error: 'No fields provided to update.' }
    }

    const { data, error } = await supabase
      .from('guided_projects')
      .update(updates)
      .eq('id', id)
      .select(PROJECT_SELECT_QUERY)
      .single()

    if (error) {
      return { error: error.message }
    }

    const proj = data as any
    return {
      data: {
        ...proj,
        stages_count: Array.isArray(proj.stages) ? proj.stages.length : 0,
      },
    }
  } catch (err: any) {
    return { error: err?.message || 'Failed to update guided project.' }
  }
}

/**
 * Validates a project and all its stages to ensure it is ready for publication
 */
export async function validateProjectForPublish(
  projectId: string
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  try {
    // 1. Fetch project
    const { data: project, error: projErr } = await supabase
      .from('guided_projects')
      .select('id, title, difficulty, estimated_minutes, status')
      .eq('id', projectId)
      .single()

    if (projErr || !project) {
      return { valid: false, errors: ['Project record not found.'] }
    }

    if (!project.title || !project.title.trim()) {
      errors.push('Project title cannot be empty.')
    }

    if (!project.estimated_minutes || project.estimated_minutes <= 0) {
      errors.push('Estimated duration must be greater than 0 minutes.')
    }

    // 2. Fetch all stages
    const { data: stages, error: stagesErr } = await supabase
      .from('project_stages')
      .select('id, stage_order, title, instructions, validation_type, validation_config, xp_reward')
      .eq('project_id', projectId)
      .order('stage_order', { ascending: true })

    if (stagesErr) {
      return { valid: false, errors: [`Failed to verify project stages: ${stagesErr.message}`] }
    }

    if (!stages || stages.length === 0) {
      errors.push('A guided project must have at least one stage before publishing.')
      return { valid: false, errors }
    }

    // 3. Verify contiguous 1-based ordering
    stages.forEach((st, idx) => {
      const expectedOrder = idx + 1
      if (st.stage_order !== expectedOrder) {
        errors.push(`Stage "${st.title || 'Untitled'}" has invalid order ${st.stage_order} (expected ${expectedOrder}).`)
      }

      if (!st.title || !st.title.trim()) {
        errors.push(`Stage #${expectedOrder} is missing a title.`)
      }

      if (st.validation_type === 'io_test') {
        const config = st.validation_config as ValidationConfig
        const testCases = config?.test_cases || []
        if (testCases.length === 0) {
          errors.push(`Stage #${expectedOrder} ("${st.title}") requires at least one I/O test case.`)
        } else {
          const invalidCases = testCases.filter(
            (tc) => tc.expected_output === undefined || tc.expected_output === null || tc.expected_output.trim() === ''
          )
          if (invalidCases.length > 0) {
            errors.push(`Stage #${expectedOrder} ("${st.title}") has test cases with empty expected outputs.`)
          }
        }
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  } catch (err: any) {
    return {
      valid: false,
      errors: [err?.message || 'Unexpected validation error during publish check.'],
    }
  }
}

/**
 * Transitions a project from draft to published after validating all project and stage rules
 */
export async function publishGuidedProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = await validateProjectForPublish(id)
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(' ') }
    }

    const { error: updateErr } = await supabase
      .from('guided_projects')
      .update({ status: 'published' })
      .eq('id', id)

    if (updateErr) {
      return { success: false, error: updateErr.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to publish guided project.' }
  }
}

/**
 * Deletes a guided project by ID with audit logging
 */
export async function deleteGuidedProject(
  id: string,
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('guided_projects')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    if (adminUserId) {
      try {
        await supabase.from('admin_audit_logs').insert({
          admin_user_id: adminUserId,
          action: 'DELETE_GUIDED_PROJECT',
          entity_type: 'guided_project',
          entity_id: id,
        })
      } catch {
        // Non-blocking audit failure
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete guided project.' }
  }
}

/* =========================================================================
   PROJECT STAGES (STAGE BUILDER) SERVICE METHODS
   ========================================================================= */

/**
 * Fetches all stages for a project ordered by stage_order ASC
 */
export async function fetchProjectStages(projectId: string): Promise<ProjectStage[]> {
  try {
    const { data, error } = await supabase
      .from('project_stages')
      .select('*')
      .eq('project_id', projectId)
      .order('stage_order', { ascending: true })

    if (error) {
      console.error('Error fetching project stages:', error)
      return []
    }

    return (data as ProjectStage[]) || []
  } catch (err) {
    console.error('Unexpected error fetching project stages:', err)
    return []
  }
}

/**
 * Creates a new project stage with automatic contiguous order assignment
 */
export async function createProjectStage(
  input: CreateProjectStageInput
): Promise<{ data?: ProjectStage; error?: string }> {
  try {
    const trimmedTitle = input.title?.trim()
    if (!trimmedTitle) {
      return { error: 'Stage title cannot be empty.' }
    }

    const validationType: ValidationType = input.validation_type || 'io_test'
    if (validationType !== 'io_test' && validationType !== 'dom_check') {
      return { error: 'Invalid validation type.' }
    }

    const xpReward = input.xp_reward !== undefined ? Math.max(0, Math.floor(Number(input.xp_reward))) : 20

    // Validate I/O test cases if provided
    const validationConfig: ValidationConfig = input.validation_config || { test_cases: [] }
    if (validationType === 'io_test' && validationConfig.test_cases.length > 0) {
      const hasInvalid = validationConfig.test_cases.some((tc) => !tc.expected_output || !tc.expected_output.trim())
      if (hasInvalid) {
        return { error: 'Each test case must define an expected output.' }
      }
    }

    // Determine next contiguous stage_order
    const { data: existingStages, error: orderErr } = await supabase
      .from('project_stages')
      .select('stage_order')
      .eq('project_id', input.project_id)
      .order('stage_order', { ascending: false })
      .limit(1)

    if (orderErr) {
      return { error: orderErr.message }
    }

    const nextOrder = existingStages && existingStages.length > 0 ? existingStages[0].stage_order + 1 : 1

    const { data, error } = await supabase
      .from('project_stages')
      .insert({
        project_id: input.project_id,
        stage_order: nextOrder,
        title: trimmedTitle,
        instructions: input.instructions?.trim() || '',
        starter_code: input.starter_code || '',
        validation_type: validationType,
        validation_config: validationConfig,
        xp_reward: xpReward,
      })
      .select('*')
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data: data as ProjectStage }
  } catch (err: any) {
    return { error: err?.message || 'Failed to create project stage.' }
  }
}

/**
 * Updates an existing stage preserving its order and identity
 */
export async function updateProjectStage(
  stageId: string,
  input: UpdateProjectStageInput
): Promise<{ data?: ProjectStage; error?: string }> {
  try {
    const updates: Record<string, any> = {}

    if (input.title !== undefined) {
      const trimmedTitle = input.title.trim()
      if (!trimmedTitle) {
        return { error: 'Stage title cannot be empty.' }
      }
      updates.title = trimmedTitle
    }

    if (input.instructions !== undefined) {
      updates.instructions = input.instructions.trim()
    }

    if (input.starter_code !== undefined) {
      updates.starter_code = input.starter_code
    }

    if (input.validation_type !== undefined) {
      if (input.validation_type !== 'io_test' && input.validation_type !== 'dom_check') {
        return { error: 'Invalid validation type.' }
      }
      updates.validation_type = input.validation_type
    }

    if (input.validation_config !== undefined) {
      if (updates.validation_type === 'io_test' || !updates.validation_type) {
        const hasInvalid = input.validation_config.test_cases?.some(
          (tc) => !tc.expected_output || !tc.expected_output.trim()
        )
        if (hasInvalid) {
          return { error: 'Each test case must define an expected output.' }
        }
      }
      updates.validation_config = input.validation_config
    }

    if (input.xp_reward !== undefined) {
      updates.xp_reward = Math.max(0, Math.floor(Number(input.xp_reward)))
    }

    if (Object.keys(updates).length === 0) {
      return { error: 'No fields provided to update.' }
    }

    const { data, error } = await supabase
      .from('project_stages')
      .update(updates)
      .eq('id', stageId)
      .select('*')
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data: data as ProjectStage }
  } catch (err: any) {
    return { error: err?.message || 'Failed to update project stage.' }
  }
}

/**
 * Deletes a project stage and compacts the remaining stage orders
 */
export async function deleteProjectStage(
  stageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('delete_project_stage', {
      p_stage_id: stageId,
    })

    if (error) {
      // Fallback if RPC is not available
      const { error: directDelErr } = await supabase
        .from('project_stages')
        .delete()
        .eq('id', stageId)

      if (directDelErr) {
        return { success: false, error: directDelErr.message }
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete project stage.' }
  }
}

/**
 * Reorders project stages deterministically using atomic stored procedure
 */
export async function reorderProjectStages(
  projectId: string,
  stageIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('reorder_project_stages', {
      p_project_id: projectId,
      p_stage_ids: stageIds,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to reorder project stages.' }
  }
}

/**
 * React hook for managing guided projects list in admin views
 */
export function useAdminGuidedProjects() {
  const [projects, setProjects] = useState<GuidedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGuidedProjectsAdmin()
      setProjects(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load guided projects.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  return {
    projects,
    loading,
    error,
    refreshProjects,
  }
}

/* =========================================================================
   STUDENT-FACING GUIDED PROJECT METHODS
   ========================================================================= */

/**
 * Fetches all published guided projects and pairs them with student progress
 */
export async function fetchPublishedGuidedProjects(
  userId?: string
): Promise<GuidedProjectWithStudentProgress[]> {
  try {
    const { data: projects, error: projErr } = await supabase
      .from('guided_projects')
      .select(PROJECT_SELECT_QUERY)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (projErr || !projects) {
      console.error('Error fetching published guided projects:', projErr)
      return []
    }

    const mappedProjects: GuidedProjectWithStudentProgress[] = projects.map((p: any) => ({
      ...p,
      stages_count: Array.isArray(p.stages) ? p.stages.length : 0,
      user_progress: null,
      completed_stages_count: 0,
    }))

    if (!userId || mappedProjects.length === 0) {
      return mappedProjects
    }

    // Load user progress for these projects
    const projectIds = mappedProjects.map((p) => p.id)
    const { data: progressList } = await supabase
      .from('user_project_progress')
      .select('*')
      .eq('user_id', userId)
      .in('project_id', projectIds)

    const progressMap = new Map<string, UserProjectProgress>()
    if (progressList) {
      progressList.forEach((prog: UserProjectProgress) => {
        progressMap.set(prog.project_id, prog)
      })
    }

    // Load completed stage counts
    const { data: completedStages } = await supabase
      .from('user_stage_progress')
      .select('project_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('project_id', projectIds)

    const completedCountMap = new Map<string, number>()
    if (completedStages) {
      completedStages.forEach((cs) => {
        const current = completedCountMap.get(cs.project_id) || 0
        completedCountMap.set(cs.project_id, current + 1)
      })
    }

    return mappedProjects.map((p) => ({
      ...p,
      user_progress: progressMap.get(p.id) || null,
      completed_stages_count: completedCountMap.get(p.id) || 0,
    }))
  } catch (err) {
    console.error('Unexpected error fetching student guided projects:', err)
    return []
  }
}

/**
 * Loads student-facing project details, published stages, and computed stage lock states
 */
export async function fetchStudentProjectDetails(
  projectId: string,
  userId?: string
): Promise<{
  project: GuidedProject | null
  stages: StudentStageView[]
  userProgress: UserProjectProgress | null
  error?: string
}> {
  try {
    // 1. Fetch project (must be published unless admin)
    const { data: project, error: projErr } = await supabase
      .from('guided_projects')
      .select(PROJECT_SELECT_QUERY)
      .eq('id', projectId)
      .single()

    if (projErr || !project) {
      return { project: null, stages: [], userProgress: null, error: 'Project not found or not accessible.' }
    }

    // 2. Fetch project stages ordered
    const { data: rawStages, error: stagesErr } = await supabase
      .from('project_stages')
      .select('*')
      .eq('project_id', projectId)
      .order('stage_order', { ascending: true })

    if (stagesErr || !rawStages) {
      return { project: null, stages: [], userProgress: null, error: 'Failed to load project stages.' }
    }

    // 3. Fetch user project progress if authenticated
    let userProgress: UserProjectProgress | null = null
    const stageProgressMap = new Map<string, UserStageProgress>()

    if (userId) {
      const { data: prog } = await supabase
        .from('user_project_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .maybeSingle()

      userProgress = prog || null

      const { data: stageProgs } = await supabase
        .from('user_stage_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)

      if (stageProgs) {
        stageProgs.forEach((sp: UserStageProgress) => {
          stageProgressMap.set(sp.stage_id, sp)
        })
      }
    }

    // Current unlocked stage order (defaults to 1 if not started)
    const currentUnlockedOrder = userProgress?.current_stage_order || 1

    // Map stages with lock state
    const mappedStages: StudentStageView[] = (rawStages as ProjectStage[]).map((stage) => {
      const sp = stageProgressMap.get(stage.id)
      const isCompleted = sp?.status === 'completed'
      const isUnlocked = stage.stage_order === 1 || stage.stage_order <= currentUnlockedOrder
      const isCurrent = stage.stage_order === currentUnlockedOrder

      return {
        ...stage,
        is_unlocked: isUnlocked,
        is_completed: isCompleted,
        is_current: isCurrent,
        student_code: sp?.saved_code || stage.starter_code || '',
      }
    })

    const projObj = project as any
    return {
      project: {
        ...projObj,
        stages_count: mappedStages.length,
      },
      stages: mappedStages,
      userProgress,
    }
  } catch (err: any) {
    return {
      project: null,
      stages: [],
      userProgress: null,
      error: err?.message || 'Error loading project details.',
    }
  }
}

/**
 * Initializes or resumes a guided project for a student
 */
export async function startOrResumeProject(
  projectId: string,
  userId: string
): Promise<{
  progress: UserProjectProgress | null
  stages: StudentStageView[]
  currentStage: StudentStageView | null
  error?: string
}> {
  try {
    const details = await fetchStudentProjectDetails(projectId, userId)
    if (details.error || !details.project) {
      return { progress: null, stages: [], currentStage: null, error: details.error || 'Project not found.' }
    }

    let progress = details.userProgress

    // If student hasn't started yet, create progress record
    if (!progress) {
      const { data: newProg, error: createErr } = await supabase
        .from('user_project_progress')
        .insert({
          user_id: userId,
          project_id: projectId,
          current_stage_order: 1,
          status: 'in_progress',
        })
        .select('*')
        .single()

      if (createErr || !newProg) {
        return { progress: null, stages: [], currentStage: null, error: createErr?.message || 'Failed to start project.' }
      }

      progress = newProg as UserProjectProgress
    }

    // Refresh stages with newly created progress
    const refreshedDetails = await fetchStudentProjectDetails(projectId, userId)
    const activeStage =
      refreshedDetails.stages.find((s) => s.is_current) ||
      refreshedDetails.stages[0] ||
      null

    return {
      progress,
      stages: refreshedDetails.stages,
      currentStage: activeStage,
    }
  } catch (err: any) {
    return { progress: null, stages: [], currentStage: null, error: err?.message || 'Error starting project.' }
  }
}

/**
 * Persists student code for a specific stage (upsert on user_id + stage_id)
 */
export async function saveStudentStageCode(
  userId: string,
  projectId: string,
  stageId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('user_stage_progress')
      .upsert(
        {
          user_id: userId,
          project_id: projectId,
          stage_id: stageId,
          saved_code: code,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,stage_id',
        }
      )

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save stage code.' }
  }
}

/**
 * Retrieves persisted student code for a stage
 */
export async function fetchStudentStageCode(
  userId: string,
  stageId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_stage_progress')
      .select('saved_code')
      .eq('user_id', userId)
      .eq('stage_id', stageId)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data.saved_code || null
  } catch {
    return null
  }
}

/* =========================================================================
   STAGE SUBMISSION & AUTHORITATIVE VALIDATION
   ========================================================================= */

function normalizeOutput(str: string): string {
  return str.replace(/\r\n/g, '\n').trimEnd()
}

/**
 * Executes student code against configured stage test cases, records immutable
 * submission, and authoritatively completes/advances stage via atomic RPC.
 */
export async function submitAndValidateStage({
  userId,
  projectId,
  stageId,
  code,
  language = 'javascript',
}: {
  userId: string
  projectId: string
  stageId: string
  code: string
  language?: string
}): Promise<StageSubmissionResult> {
  try {
    // 1. Validate empty code
    if (!code || !code.trim()) {
      return {
        passed: false,
        executionStatus: 'execution_error',
        testResults: [],
        unlockedNextStage: false,
        projectCompleted: false,
        error: 'Cannot submit empty code. Please implement your solution first.',
      }
    }

    // 2. Fetch stage details and verify published project
    const { data: stage, error: stageErr } = await supabase
      .from('project_stages')
      .select('*, guided_projects!inner(id, status)')
      .eq('id', stageId)
      .eq('project_id', projectId)
      .single()

    if (stageErr || !stage) {
      return {
        passed: false,
        executionStatus: 'execution_error',
        testResults: [],
        unlockedNextStage: false,
        projectCompleted: false,
        error: 'Stage or project not found.',
      }
    }

    if ((stage as any).guided_projects?.status !== 'published') {
      return {
        passed: false,
        executionStatus: 'execution_error',
        testResults: [],
        unlockedNextStage: false,
        projectCompleted: false,
        error: 'Submissions are only permitted for published projects.',
      }
    }

    // 3. Verify student has started and stage is currently unlocked
    const { data: userProg } = await supabase
      .from('user_project_progress')
      .select('current_stage_order, status')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle()

    const currentUnlockedOrder = userProg?.current_stage_order || 1
    if (stage.stage_order > currentUnlockedOrder) {
      return {
        passed: false,
        executionStatus: 'execution_error',
        testResults: [],
        unlockedNextStage: false,
        projectCompleted: false,
        error: `Stage #${stage.stage_order} is currently locked. Complete previous stages first.`,
      }
    }

    // 4. Retrieve configured test cases
    const testCases: IOTestCase[] = stage.validation_config?.test_cases || []
    if (testCases.length === 0) {
      return {
        passed: false,
        executionStatus: 'execution_error',
        testResults: [],
        unlockedNextStage: false,
        projectCompleted: false,
        error: 'Stage has no configured test cases to validate against.',
      }
    }

    // 5. Run test cases via unified execution engine
    const testResults: StageTestCaseResult[] = []
    let overallExecutionStatus: StageSubmissionResult['executionStatus'] = 'passed'

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i]
      const execRes = await executeCode(language, code, tc.input || '')

      if (execRes.status === 'compile_error' || execRes.status === 'error') {
        overallExecutionStatus = 'execution_error'
        testResults.push({
          orderIndex: i + 1,
          isHidden: Boolean(tc.is_hidden),
          passed: false,
          actualOutput: execRes.stdout,
          expectedOutput: tc.expected_output,
          error: execRes.stderr || 'Execution or syntax error.',
        })
        break
      }

      if (execRes.status === 'timeout') {
        overallExecutionStatus = 'timeout'
        testResults.push({
          orderIndex: i + 1,
          isHidden: Boolean(tc.is_hidden),
          passed: false,
          actualOutput: execRes.stdout,
          expectedOutput: tc.expected_output,
          error: 'Execution timed out (10-second limit exceeded).',
        })
        break
      }

      const normActual = normalizeOutput(execRes.stdout || '')
      const normExpected = normalizeOutput(tc.expected_output || '')
      const passed = normActual === normExpected

      if (!passed && overallExecutionStatus === 'passed') {
        overallExecutionStatus = 'failed'
      }

      testResults.push({
        orderIndex: i + 1,
        isHidden: Boolean(tc.is_hidden),
        passed,
        actualOutput: execRes.stdout,
        expectedOutput: tc.expected_output,
        error: execRes.stderr || undefined,
      })
    }

    const allPassed =
      overallExecutionStatus === 'passed' &&
      testResults.length === testCases.length &&
      testResults.every((t) => t.passed)

    // 6. Invoke server-authoritative progression RPC
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('complete_project_stage', {
      p_user_id: userId,
      p_stage_id: stageId,
      p_code: code,
      p_passed: allPassed,
      p_execution_status: allPassed ? 'passed' : overallExecutionStatus,
      p_test_results: testResults,
    })

    if (rpcErr) {
      console.error('RPC complete_project_stage error:', rpcErr)
      return {
        passed: allPassed,
        executionStatus: allPassed ? 'passed' : overallExecutionStatus,
        testResults,
        unlockedNextStage: false,
        projectCompleted: false,
        error: rpcErr.message || 'Failed to record stage submission.',
      }
    }

    return {
      submissionId: rpcRes?.submission_id,
      passed: allPassed,
      executionStatus: allPassed ? 'passed' : overallExecutionStatus,
      testResults,
      unlockedNextStage: Boolean(rpcRes?.unlocked_next),
      nextStageOrder: rpcRes?.next_stage_order,
      projectCompleted: Boolean(rpcRes?.project_completed),
    }
  } catch (err: any) {
    console.error('Unexpected error in submitAndValidateStage:', err)
    return {
      passed: false,
      executionStatus: 'execution_error',
      testResults: [],
      unlockedNextStage: false,
      projectCompleted: false,
      error: err?.message || 'An unexpected error occurred during stage validation.',
    }
  }
}

/* =========================================================================
   PROMPT 5: REWARDS, SHOWCASE, AND ANALYTICS
   ========================================================================= */

/**
 * Idempotently awards project completion XP and configured project badge
 */
export async function awardProjectRewards(
  userId: string,
  projectId: string
): Promise<ProjectRewardResult> {
  try {
    const { data, error } = await supabase.rpc('award_project_completion_rewards', {
      p_user_id: userId,
      p_project_id: projectId,
    })

    if (error || !data) {
      console.error('Error awarding project completion rewards:', error)
      return { success: false, error: error?.message || 'Failed to award project rewards.' }
    }

    return {
      success: Boolean(data.success),
      xp_awarded: data.xp_awarded,
      badge_awarded: data.badge_awarded,
      error: data.error,
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error processing completion rewards.' }
  }
}

/**
 * Creates an optional Community Showcase post for an authoritatively completed project
 */
export async function createProjectCommunityShowcase(
  userId: string,
  projectId: string,
  reflectionText?: string
): Promise<{ success: boolean; post?: any; error?: string }> {
  try {
    // 1. Authoritative verification of completed status
    const { data: prog, error: progErr } = await supabase
      .from('user_project_progress')
      .select('status')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle()

    if (progErr || !prog || prog.status !== 'completed') {
      return {
        success: false,
        error: 'Only completed projects can be showcased to the community.',
      }
    }

    // 2. Fetch project title
    const { data: proj } = await supabase
      .from('guided_projects')
      .select('title')
      .eq('id', projectId)
      .maybeSingle()

    const projectTitle = proj?.title || 'Guided Project'
    const postContent =
      reflectionText && reflectionText.trim().length > 0
        ? reflectionText.trim()
        : `Just completed the guided project "${projectTitle}" on CodeQuest! 🚀 Ready for the next build.`

    // 3. Post to existing community feed
    const post = await createCommunityPost(userId, postContent, 'project_showcase', projectId)

    if (!post) {
      return { success: false, error: 'Failed to publish showcase post.' }
    }

    return { success: true, post }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error creating project showcase.' }
  }
}

/**
 * Fetches server-aggregated analytics for guided projects (admin only)
 */
export async function fetchGuidedProjectsAnalytics(): Promise<GuidedProjectsAnalyticsPayload | null> {
  try {
    const { data, error } = await supabase.rpc('get_guided_projects_analytics')

    if (error || !data) {
      console.error('Error fetching guided projects analytics:', error)
      return null
    }

    return data as GuidedProjectsAnalyticsPayload
  } catch (err) {
    console.error('Unexpected error loading analytics:', err)
    return null
  }
}



