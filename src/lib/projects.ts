import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { awardXp } from './gamification'
import { recordUserActivity, createUserNotification } from './achievements'

export interface ProjectStep {
  id: string
  project_id: string
  title: string
  description: string
  step_order: number
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  instructions?: string
  category: string
  difficulty: string
  is_published: boolean
  created_at?: string
  updated_at?: string
  steps?: ProjectStep[]
}

export interface ProjectProgressSummary {
  project: Project
  isEnrolled: boolean
  isCompleted: boolean
  completedStepsCount: number
  totalStepsCount: number
  progressPercent: number
  completedStepIds: string[]
  currentStep?: ProjectStep
  completedAt?: string
  lastAccessedAt?: string
}

export interface ProjectShowcase {
  id: string
  user_id: string
  project_id: string
  title: string
  description: string
  preview_url?: string
  live_url?: string
  is_published: boolean
  created_at?: string
  updated_at?: string
  author_name?: string
  project_title?: string
}

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Personal Portfolio Website',
    slug: 'personal-portfolio-website',
    description: 'Build a clean, responsive developer portfolio showcasing your skills, bio, and featured quests.',
    instructions: 'Structure your markup with semantic tags, create modern flex/grid layouts with CSS, and deploy to the web.',
    category: 'Web',
    difficulty: 'Beginner',
    is_published: true,
    steps: [
      {
        id: 'b1000000-0000-0000-0000-000000000001',
        project_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Structure Semantic HTML',
        description: 'Create index.html with a semantic header, about bio, project showcase grid, and contact footer.',
        step_order: 1,
      },
      {
        id: 'b1000000-0000-0000-0000-000000000002',
        project_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Apply Responsive Styles',
        description: 'Implement responsive CSS styling with mobile-first media queries and clean typography.',
        step_order: 2,
      },
      {
        id: 'b1000000-0000-0000-0000-000000000003',
        project_id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Add Interactivity & Polish',
        description: 'Add theme toggle, smooth scrolling navigation, and validation to the contact form.',
        step_order: 3,
      },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    title: 'Interactive Task Matrix',
    slug: 'interactive-task-matrix',
    description: 'Create an interactive productivity tracker with state management and local storage persistence.',
    instructions: 'Implement task creation, toggling completion, filtering views, and persisting task state in localStorage.',
    category: 'JavaScript',
    difficulty: 'Beginner',
    is_published: true,
    steps: [
      {
        id: 'b1000000-0000-0000-0000-000000000004',
        project_id: 'b0000000-0000-0000-0000-000000000002',
        title: 'DOM Manipulation & Event Binding',
        description: 'Create UI input fields and write event listeners to dynamically insert new task cards.',
        step_order: 1,
      },
      {
        id: 'b1000000-0000-0000-0000-000000000005',
        project_id: 'b0000000-0000-0000-0000-000000000002',
        title: 'Local Storage Synchronization',
        description: 'Serialize task data to JSON and sync to window.localStorage on every mutation.',
        step_order: 2,
      },
      {
        id: 'b1000000-0000-0000-0000-000000000006',
        project_id: 'b0000000-0000-0000-0000-000000000002',
        title: 'Filtering & Active Counts',
        description: 'Add filter buttons for All, Active, and Completed tasks, plus an active counter indicator.',
        step_order: 3,
      },
    ],
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    title: 'Markdown Note Engine',
    slug: 'markdown-note-engine',
    description: 'Develop a real-time markdown editor with instant preview parsing and category tagging.',
    instructions: 'Assemble React components with dual-pane layout, controlled editor state, and export options.',
    category: 'React',
    difficulty: 'Intermediate',
    is_published: true,
    steps: [
      {
        id: 'b1000000-0000-0000-0000-000000000007',
        project_id: 'b0000000-0000-0000-0000-000000000003',
        title: 'Split-Pane Editor Component',
        description: 'Build dual-pane React component connecting raw markdown input to rendered preview HTML.',
        step_order: 1,
      },
      {
        id: 'b1000000-0000-0000-0000-000000000008',
        project_id: 'b0000000-0000-0000-0000-000000000003',
        title: 'Category Tagging & Search',
        description: 'Enable assigning tags to notes and instant client-side searching across notes.',
        step_order: 2,
      },
      {
        id: 'b1000000-0000-0000-0000-000000000009',
        project_id: 'b0000000-0000-0000-0000-000000000003',
        title: 'Export & Download Pipeline',
        description: 'Support exporting individual notes as .md files and downloading note bundles as JSON.',
        step_order: 3,
      },
    ],
  },
]

const FALLBACK_SHOWCASES: ProjectShowcase[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    user_id: 'f0000000-0000-0000-0000-000000000001',
    project_id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Cyberpunk Dev Portfolio',
    description: 'Custom neon-themed responsive developer portfolio built with semantic HTML and modern CSS flexbox layouts.',
    is_published: true,
    author_name: 'Alex Rivers',
    project_title: 'Personal Portfolio Website',
    created_at: '2 hours ago',
  },
]

export async function fetchProjects(categoryFilter?: string, includeUnpublished = false): Promise<Project[]> {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        steps:project_steps (
          id,
          project_id,
          title,
          description,
          step_order,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: true })

    if (!includeUnpublished) {
      query = query.eq('is_published', true)
    }

    if (categoryFilter && categoryFilter !== 'All') {
      query = query.eq('category', categoryFilter)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      if (categoryFilter && categoryFilter !== 'All') {
        return FALLBACK_PROJECTS.filter((p) => p.category === categoryFilter)
      }
      return FALLBACK_PROJECTS
    }

    return data.map((item) => ({
      ...item,
      steps: (item.steps || []).sort((a: ProjectStep, b: ProjectStep) => a.step_order - b.step_order),
    }))
  } catch {
    return FALLBACK_PROJECTS
  }
}

export async function fetchUserProjectsWithProgress(
  userId?: string,
  categoryFilter?: string,
  includeUnpublished = false
): Promise<ProjectProgressSummary[]> {
  const projectsList = await fetchProjects(categoryFilter, includeUnpublished)

  if (!userId) {
    return projectsList.map((p) => ({
      project: p,
      isEnrolled: false,
      isCompleted: false,
      completedStepsCount: 0,
      totalStepsCount: p.steps?.length || 0,
      progressPercent: 0,
      completedStepIds: [],
      currentStep: p.steps?.[0],
    }))
  }

  try {
    const [enrollmentsRes, stepProgressRes] = await Promise.all([
      supabase.from('project_enrollments').select('*').eq('user_id', userId),
      supabase.from('project_step_progress').select('project_id, step_id, is_completed').eq('user_id', userId),
    ])

    const enrollmentMap = new Map<string, { is_completed: boolean; completed_at?: string; last_accessed_at?: string; last_step_id?: string }>()
    if (enrollmentsRes.data) {
      enrollmentsRes.data.forEach((e) => {
        enrollmentMap.set(e.project_id, {
          is_completed: e.is_completed || e.status === 'completed',
          completed_at: e.completed_at,
          last_accessed_at: e.last_accessed_at,
          last_step_id: e.last_step_id,
        })
      })
    }

    const completedStepsByProject = new Map<string, Set<string>>()
    if (stepProgressRes.data) {
      stepProgressRes.data.forEach((sp) => {
        if (sp.is_completed) {
          if (!completedStepsByProject.has(sp.project_id)) {
            completedStepsByProject.set(sp.project_id, new Set())
          }
          completedStepsByProject.get(sp.project_id)!.add(sp.step_id)
        }
      })
    }

    return projectsList.map((p) => {
      const enrollment = enrollmentMap.get(p.id)
      const completedSet = completedStepsByProject.get(p.id) || new Set<string>()
      const completedStepIds = Array.from(completedSet)
      const steps = p.steps || []
      const totalStepsCount = steps.length
      const completedStepsCount = completedStepIds.length

      const allStepsDone = totalStepsCount > 0 && completedStepsCount >= totalStepsCount
      const isCompleted = enrollment?.is_completed || allStepsDone
      const progressPercent = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0
      const currentStep = steps.find((s) => !completedSet.has(s.id)) || steps[steps.length - 1]

      return {
        project: p,
        isEnrolled: !!enrollment || completedStepsCount > 0,
        isCompleted,
        completedStepsCount,
        totalStepsCount,
        progressPercent,
        completedStepIds,
        currentStep,
        completedAt: enrollment?.completed_at,
        lastAccessedAt: enrollment?.last_accessed_at,
      }
    })
  } catch {
    return projectsList.map((p) => ({
      project: p,
      isEnrolled: false,
      isCompleted: false,
      completedStepsCount: 0,
      totalStepsCount: p.steps?.length || 0,
      progressPercent: 0,
      completedStepIds: [],
      currentStep: p.steps?.[0],
    }))
  }
}

export async function startProject(userId: string, projectId: string, firstStepId?: string): Promise<boolean> {
  try {
    const now = new Date().toISOString()
    const { data: existing } = await supabase
      .from('project_enrollments')
      .select('status, is_completed')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle()

    // Prevent completed project from reverting
    if (existing?.is_completed || existing?.status === 'completed') {
      await supabase
        .from('project_enrollments')
        .update({ last_accessed_at: now })
        .eq('user_id', userId)
        .eq('project_id', projectId)
      return true
    }

    const { error } = await supabase.from('project_enrollments').upsert(
      {
        user_id: userId,
        project_id: projectId,
        status: 'in_progress',
        is_completed: false,
        last_step_id: firstStepId || null,
        last_accessed_at: now,
      },
      { onConflict: 'user_id,project_id' }
    )

    return !error
  } catch {
    return false
  }
}

export async function completeProjectStep(
  userId: string,
  projectId: string,
  stepId: string,
  projectTitle?: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString()

    // 1. Mark step completed (idempotent upsert)
    const { error: stepErr } = await supabase.from('project_step_progress').upsert(
      {
        user_id: userId,
        project_id: projectId,
        step_id: stepId,
        is_completed: true,
        completed_at: now,
      },
      { onConflict: 'user_id,step_id' }
    )

    if (stepErr) {
      console.error('Error completing project step:', stepErr)
      return false
    }

    // 2. Check total steps vs completed steps to automatically complete project if done
    const [allStepsRes, completedStepsRes, enrollmentRes] = await Promise.all([
      supabase.from('project_steps').select('id').eq('project_id', projectId),
      supabase.from('project_step_progress').select('step_id').eq('user_id', userId).eq('project_id', projectId).eq('is_completed', true),
      supabase.from('project_enrollments').select('is_completed, status, completed_at').eq('user_id', userId).eq('project_id', projectId).maybeSingle(),
    ])

    const totalSteps = allStepsRes.data?.length || 1
    const completedCount = completedStepsRes.data?.length || 1
    const isAllDone = completedCount >= totalSteps
    const wasAlreadyCompleted = enrollmentRes.data?.is_completed || enrollmentRes.data?.status === 'completed'

    const updatePayload: {
      user_id: string
      project_id: string
      last_step_id: string
      last_accessed_at: string
      status: 'in_progress' | 'completed'
      is_completed: boolean
      completed_at?: string | null
    } = {
      user_id: userId,
      project_id: projectId,
      last_step_id: stepId,
      last_accessed_at: now,
      status: wasAlreadyCompleted || isAllDone ? 'completed' : 'in_progress',
      is_completed: wasAlreadyCompleted || isAllDone,
      completed_at: wasAlreadyCompleted ? enrollmentRes.data?.completed_at : (isAllDone ? now : null),
    }

    await supabase.from('project_enrollments').upsert(updatePayload, { onConflict: 'user_id,project_id' })

    if (isAllDone && !wasAlreadyCompleted) {
      await completeProject(userId, projectId, projectTitle)
    }

    return true
  } catch (err) {
    console.error('Error updating step completion:', err)
    return false
  }
}

export async function completeProject(
  userId: string,
  projectId: string,
  projectTitle?: string
): Promise<boolean> {
  try {
    const now = new Date().toISOString()
    const { error } = await supabase.from('project_enrollments').upsert(
      {
        user_id: userId,
        project_id: projectId,
        status: 'completed',
        is_completed: true,
        completed_at: now,
        last_accessed_at: now,
      },
      { onConflict: 'user_id,project_id' }
    )

    if (!error) {
      // Award 150 XP for project completion (idempotent via transaction source check)
      const xpResult = await awardXp(userId, 150, 'project_completed', projectId)

      if (xpResult.awarded) {
        const title = projectTitle || 'Featured Project'
        await recordUserActivity(userId, 'project_completed', `Mastered project "${title}" 🏆`)
        await createUserNotification(
          userId,
          'Project Mastered! 🏆',
          `You completed "${title}" and earned 150 XP!`,
          '🏆'
        )
      }
    }

    return !error
  } catch {
    return false
  }
}

export async function fetchShowcases(projectId?: string): Promise<ProjectShowcase[]> {
  try {
    let query = supabase
      .from('project_showcases')
      .select(`
        *,
        profile:profiles(full_name, username),
        project:projects(title)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return FALLBACK_SHOWCASES
    }

    return data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      project_id: item.project_id,
      title: item.title,
      description: item.description,
      preview_url: item.preview_url,
      live_url: item.live_url,
      is_published: item.is_published,
      created_at: item.created_at,
      updated_at: item.updated_at,
      author_name: item.profile?.full_name || item.profile?.username || 'Adventurer',
      project_title: item.project?.title || 'Coding Project',
    }))
  } catch {
    return FALLBACK_SHOWCASES
  }
}

export async function fetchUserShowcase(userId: string, projectId: string): Promise<ProjectShowcase | null> {
  try {
    const { data, error } = await supabase
      .from('project_showcases')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function submitProjectShowcase(
  userId: string,
  projectId: string,
  title: string,
  description: string,
  previewUrl?: string,
  liveUrl?: string
): Promise<ProjectShowcase | null> {
  try {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('project_showcases')
      .upsert(
        {
          user_id: userId,
          project_id: projectId,
          title,
          description,
          preview_url: previewUrl || null,
          live_url: liveUrl || null,
          is_published: true,
          updated_at: now,
        },
        { onConflict: 'user_id,project_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error submitting showcase:', error)
      return null
    }

    await recordUserActivity(userId, 'showcase_submitted', `Published showcase "${title}" to Community ✨`)
    return data
  } catch (err) {
    console.error('Error submitting showcase:', err)
    return null
  }
}

export async function deleteProjectShowcase(showcaseId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('project_showcases').delete().eq('id', showcaseId)
    return !error
  } catch {
    return false
  }
}

export async function createProject(
  project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'steps'>,
  steps?: Array<Omit<ProjectStep, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
): Promise<Project | null> {
  try {
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error || !newProject) {
      console.error('Error creating project:', error)
      return null
    }

    if (steps && steps.length > 0) {
      const stepsToInsert = steps.map((s, idx) => ({
        project_id: newProject.id,
        title: s.title,
        description: s.description,
        step_order: s.step_order || idx + 1,
      }))

      const { data: insertedSteps } = await supabase
        .from('project_steps')
        .insert(stepsToInsert)
        .select()

      newProject.steps = insertedSteps || []
    }

    return newProject
  } catch (err) {
    console.error('Error creating project:', err)
    return null
  }
}

export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'steps'>>
): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Error updating project:', err)
    return null
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    return !error
  } catch {
    return false
  }
}

export function useProjects(userId?: string, categoryFilter?: string, includeUnpublished = false) {
  const [projects, setProjects] = useState<ProjectProgressSummary[]>([])
  const [showcases, setShowcases] = useState<ProjectShowcase[]>(FALLBACK_SHOWCASES)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [projectsRes, showcasesRes] = await Promise.all([
      fetchUserProjectsWithProgress(userId, categoryFilter, includeUnpublished),
      fetchShowcases(),
    ])
    setProjects(projectsRes)
    setShowcases(showcasesRes)
    setLoading(false)
  }, [userId, categoryFilter, includeUnpublished])

  useEffect(() => {
    let mounted = true
    if (mounted) {
      loadData()
    }
    return () => {
      mounted = false
    }
  }, [loadData])

  const enrollProject = useCallback(
    async (projectId: string, firstStepId?: string) => {
      if (!userId) return false
      const ok = await startProject(userId, projectId, firstStepId)
      await loadData()
      return ok
    },
    [userId, loadData]
  )

  const completeStep = useCallback(
    async (projectId: string, stepId: string, projectTitle?: string) => {
      if (!userId) return false
      const ok = await completeProjectStep(userId, projectId, stepId, projectTitle)
      await loadData()
      return ok
    },
    [userId, loadData]
  )

  const finalizeProject = useCallback(
    async (projectId: string, projectTitle?: string) => {
      if (!userId) return false
      const ok = await completeProject(userId, projectId, projectTitle)
      await loadData()
      return ok
    },
    [userId, loadData]
  )

  const submitShowcase = useCallback(
    async (projectId: string, title: string, description: string, previewUrl?: string, liveUrl?: string) => {
      if (!userId) return null
      const res = await submitProjectShowcase(userId, projectId, title, description, previewUrl, liveUrl)
      await loadData()
      return res
    },
    [userId, loadData]
  )

  const removeShowcase = useCallback(
    async (showcaseId: string) => {
      const ok = await deleteProjectShowcase(showcaseId)
      await loadData()
      return ok
    },
    [loadData]
  )

  return {
    projects,
    showcases,
    loading,
    startProject: enrollProject,
    completeStep,
    completeProject: finalizeProject,
    submitShowcase,
    removeShowcase,
    refreshProjects: loadData,
  }
}
