import React, { useState, useEffect, useCallback } from 'react'
import { GamifiedCard } from '../ui/GamifiedCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  createProjectStep,
  deleteProjectStep,
  type Project,
} from '../../lib/projects'
import {
  fetchAdminChallenges,
  createAdminChallenge,
  updateAdminChallenge,
  deleteAdminChallenge,
  reorderChallenges,
  type Challenge,
} from '../../lib/challenges'
import {
  fetchExerciseTestCases,
  createAdminTestCase,
  updateAdminTestCase,
  deleteAdminTestCase,
  reorderTestCases,
  type ExerciseTestCase,
} from '../../lib/submissions'
import {
  fetchAdminReports,
  resolveReport,
  fetchCommunityFeed,
  setPostModerationStatus,
  deleteCommunityPost,
  type ContentReport,
  type CommunityPost,
} from '../../lib/community'
import {
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  reorderCourses,
  createAdminChapter,
  updateAdminChapter,
  deleteAdminChapter,
  reorderChapters,
  createAdminLesson,
  updateAdminLesson,
  deleteAdminLesson,
  reorderLessons,
  fetchLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  reorderLanguages,
  fetchAdminLearningPaths,
  createAdminLearningPath,
  updateAdminLearningPath,
  deleteAdminLearningPath,
  reorderLearningPaths,
  fetchCoursesWithProgress,
  type Language,
  type LearningPath,
  type CourseProgressSummary,
} from '../../lib/learning'
import {
  fetchPlatformAnalytics,
  fetchAdminAuditLogs,
  fetchDetailedLearnerInfo,
  updateUserRole,
  logAdminAction,
  type PlatformAnalytics,
  type AdminAuditLog,
  type DetailedLearnerInfo,
} from '../../lib/admin'
import {
  Users,
  PlusCircle,
  Search,
  CheckCircle,
  ShieldAlert,
  FolderGit2,
  Trash2,
  Eye,
  EyeOff,
  Code2,
  ListChecks,
  ListOrdered,
  Flag,
  MessageSquare,
  BookOpen,
  Layers,
  ShieldCheck,
  History,
  Zap,
  UserCheck,
  X,
  ArrowUp,
  ArrowDown,
  Edit3,
  Globe,
  Compass,
  FileText,
  Sparkles,
} from 'lucide-react'

interface LearnerRecord {
  id: string
  name: string
  email: string
  role: string
  xp: number
  level: number
  status: string
}

export const AdminDashboard: React.FC = () => {
  const { user, role, isAdmin, signOut } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [learners, setLearners] = useState<LearnerRecord[]>([])

  // Project Admin State
  const [adminProjects, setAdminProjects] = useState<Project[]>([])
  const [showAddProject, setShowAddProject] = useState(false)
  const [projTitle, setProjTitle] = useState('')
  const [projSlug, setProjSlug] = useState('')
  const [projCategory, setProjCategory] = useState('Web')
  const [projDifficulty, setProjDifficulty] = useState('Beginner')
  const [projDescription, setProjDescription] = useState('')
  const [projInstructions, setProjInstructions] = useState('')
  const [projStep1Title, setProjStep1Title] = useState('')
  const [projStep1Desc, setProjStep1Desc] = useState('')
  const [projectAlert, setProjectAlert] = useState<string | null>(null)

  // Coding Exercises Admin State
  const [adminChallenges, setAdminChallenges] = useState<Challenge[]>([])
  const [adminLessons, setAdminLessons] = useState<{ id: string; title: string; course_id: string; course_title?: string; chapter_title?: string }[]>([])
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Challenge | null>(null)
  const [exTitle, setExTitle] = useState('')
  const [exSlug, setExSlug] = useState('')
  const [exLanguage, setExLanguage] = useState('javascript')
  const [exDifficulty, setExDifficulty] = useState('Beginner')
  const [exLessonId, setExLessonId] = useState('')
  const [exInstructions, setExInstructions] = useState('')
  const [exStarterCode, setExStarterCode] = useState('')
  const [exSampleInput, setExSampleInput] = useState('')
  const [exHint, setExHint] = useState('')
  const [exSolution, setExSolution] = useState('')
  const [exSolutionCode, setExSolutionCode] = useState('')
  const [exXpReward, setExXpReward] = useState(75)
  const [exerciseAlert, setExerciseAlert] = useState<string | null>(null)

  // Test Case Management State
  const [selectedExerciseForTests, setSelectedExerciseForTests] = useState<Challenge | null>(null)
  const [exerciseTestCases, setExerciseTestCases] = useState<ExerciseTestCase[]>([])
  const [tcInput, setTcInput] = useState('')
  const [tcExpectedOutput, setTcExpectedOutput] = useState('')
  const [tcIsHidden, setTcIsHidden] = useState(false)
  const [tcIsActive, setTcIsActive] = useState(true)
  const [editingTestCase, setEditingTestCase] = useState<ExerciseTestCase | null>(null)

  // Project Steps Management State
  const [selectedProjectForSteps, setSelectedProjectForSteps] = useState<Project | null>(null)
  const [stepTitleInput, setStepTitleInput] = useState('')
  const [stepDescInput, setStepDescInput] = useState('')
  const [stepOrderInput, setStepOrderInput] = useState(1)

  // Community & Reports Moderation State
  const [adminReports, setAdminReports] = useState<ContentReport[]>([])
  const [adminPosts, setAdminPosts] = useState<CommunityPost[]>([])

  // Course & Curriculum Studio State
  const [curriculumTab, setCurriculumTab] = useState<'courses' | 'languages' | 'paths'>('courses')

  // Languages State
  const [adminLanguages, setAdminLanguages] = useState<Language[]>([])
  const [showAddLanguage, setShowAddLanguage] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null)
  const [langName, setLangName] = useState('')
  const [langSlug, setLangSlug] = useState('')
  const [langIcon, setLangIcon] = useState('🐍')
  const [langColor, setLangColor] = useState('#10b981')
  const [langDesc, setLangDesc] = useState('')

  // Learning Paths / Islands State
  const [adminPaths, setAdminPaths] = useState<LearningPath[]>([])
  const [showAddPath, setShowAddPath] = useState(false)
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null)
  const [pathTitle, setPathTitle] = useState('')
  const [pathSlug, setPathSlug] = useState('')
  const [pathIslandName, setPathIslandName] = useState('')
  const [pathIcon, setPathIcon] = useState('🏝️')
  const [pathLanguageId, setPathLanguageId] = useState('')
  const [pathDesc, setPathDesc] = useState('')

  // Course State
  const [adminCourses, setAdminCourses] = useState<CourseProgressSummary[]>([])
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseProgressSummary | null>(null)
  const [courseTitle, setCourseTitle] = useState('')
  const [courseSlug, setCourseSlug] = useState('')
  const [courseTrack, setCourseTrack] = useState('JavaScript')
  const [courseDifficulty, setCourseDifficulty] = useState('Beginner')
  const [courseLanguageId, setCourseLanguageId] = useState('')
  const [coursePathId, setCoursePathId] = useState('')
  const [coursePrereqId, setCoursePrereqId] = useState('')
  const [courseDesc, setCourseDesc] = useState('')

  // Curriculum Editor (Course -> Chapters -> Lessons) State
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<CourseProgressSummary | null>(null)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [editingChapter, setEditingChapter] = useState<{ id: string; title: string } | null>(null)

  const [selectedChapterIdForLesson, setSelectedChapterIdForLesson] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<{
    id: string
    chapterId: string
    title: string
    slug: string
    summary: string
    content: string
  } | null>(null)

  const DEFAULT_LESSON_CONTENT_TEMPLATE = `### 1. Explanation
Explain the core concept here in clear, engaging terms.

### 2. Code Examples
\`\`\`javascript
// Example Code
const adventurer = "Hero";
console.log(\`Welcome, \${adventurer}!\`);
\`\`\`

### 3. Step-by-Step Instructions
1. Declare your variables.
2. Initialize them with the appropriate values.
3. Print or return the result.

### 4. Hint
Look closely at the syntax and variable declaration rules.

### 5. Solution & Deep Dive
A comprehensive explanation of the solution logic.`

  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newLessonSlug, setNewLessonSlug] = useState('')
  const [newLessonSummary, setNewLessonSummary] = useState('')
  const [newLessonContent, setNewLessonContent] = useState(DEFAULT_LESSON_CONTENT_TEMPLATE)

  // Platform Analytics & Audit Logs State
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([])
  const [inspectedUser, setInspectedUser] = useState<DetailedLearnerInfo | null>(null)
  const [loadingInspect, setLoadingInspect] = useState(false)

  const loadAdminProjects = useCallback(async () => {
    const data = await fetchProjects(undefined, true)
    setAdminProjects(data)
  }, [])

  const loadAdminLanguages = useCallback(async () => {
    const data = await fetchLanguages(true)
    setAdminLanguages(data)
  }, [])

  const loadAdminPaths = useCallback(async () => {
    const data = await fetchAdminLearningPaths()
    setAdminPaths(data)
  }, [])

  const loadAdminCourses = useCallback(async () => {
    const data = await fetchCoursesWithProgress(undefined, undefined)
    setAdminCourses(data)
  }, [])

  const loadAdminAnalyticsAndLogs = useCallback(async () => {
    const [stats, logs] = await Promise.all([
      fetchPlatformAnalytics(),
      fetchAdminAuditLogs(15),
    ])
    setAnalytics(stats)
    setAuditLogs(logs)
  }, [])

  const loadAdminCommunity = useCallback(async () => {
    const [reps, postsData] = await Promise.all([
      fetchAdminReports(),
      fetchCommunityFeed(undefined, undefined, true),
    ])
    setAdminReports(reps)
    setAdminPosts(postsData)
  }, [])

  const loadAdminChallenges = useCallback(async () => {
    const data = await fetchAdminChallenges()
    setAdminChallenges(data)

    const { data: coursesData } = await supabase.from('courses').select('id, title')
    const courseTitleMap = new Map((coursesData || []).map((c) => [c.id, c.title]))

    const { data: chaptersData } = await supabase.from('chapters').select('id, title, course_id')
    const chapterCourseMap = new Map((chaptersData || []).map((c) => [c.id, c.course_id]))
    const chapterTitleMap = new Map((chaptersData || []).map((c) => [c.id, c.title]))

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('id, title, chapter_id')
      .order('order_index', { ascending: true })

    if (lessonsData) {
      setAdminLessons(
        lessonsData.map((l) => {
          const courseId = chapterCourseMap.get(l.chapter_id) || ''
          const courseTitle = courseTitleMap.get(courseId) || 'Course'
          const chapterTitle = chapterTitleMap.get(l.chapter_id) || 'Chapter'
          return {
            id: l.id,
            title: l.title,
            course_id: courseId,
            course_title: courseTitle,
            chapter_title: chapterTitle,
          }
        })
      )
    }
  }, [])

  const loadTestCasesForSelected = useCallback(async (exerciseId: string) => {
    const tests = await fetchExerciseTestCases(exerciseId, true)
    setExerciseTestCases(tests)
  }, [])

  useEffect(() => {
    const loadLearners = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, email, role, xp, level')
          .order('xp', { ascending: false })

        if (!error && data) {
          setLearners(
            data.map((item) => ({
              id: item.id,
              name: item.full_name || item.username || 'Adventurer',
              email: item.email || '',
              role: item.role,
              xp: item.xp ?? 0,
              level: item.level ?? 1,
              status: item.role === 'admin' ? 'Staff' : 'Active',
            }))
          )
        } else {
          setLearners([])
        }
      } catch {
        setLearners([])
      }
    }

    if (isAdmin) {
      loadLearners()
      loadAdminLanguages()
      loadAdminPaths()
      loadAdminCourses()
      loadAdminProjects()
      loadAdminChallenges()
      loadAdminCommunity()
      loadAdminAnalyticsAndLogs()
    }
  }, [
    isAdmin,
    loadAdminLanguages,
    loadAdminPaths,
    loadAdminCourses,
    loadAdminProjects,
    loadAdminChallenges,
    loadAdminCommunity,
    loadAdminAnalyticsAndLogs,
  ])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projTitle.trim()) return

    const newProj = await createProject(
      {
        title: projTitle,
        slug: projSlug.trim() || projTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: projCategory as any,
        difficulty: projDifficulty as any,
        description: projDescription,
        instructions: projInstructions,
        is_published: true,
      },
      projStep1Title.trim()
        ? [{ title: projStep1Title, description: projStep1Desc, step_order: 1 }]
        : []
    )

    if (newProj) {
      if (user?.id) {
        await logAdminAction(user.id, 'CREATE_PROJECT', 'project', newProj.id, { title: projTitle })
      }
      setProjectAlert('Project successfully deployed to realm catalog!')
      setShowAddProject(false)
      setProjTitle('')
      setProjSlug('')
      setProjDescription('')
      setProjInstructions('')
      setProjStep1Title('')
      setProjStep1Desc('')
      loadAdminProjects()
      loadAdminAnalyticsAndLogs()
      setTimeout(() => setProjectAlert(null), 4000)
    }
  }

  const handleTogglePublishProject = async (p: Project) => {
    await updateProject(p.id, { is_published: !p.is_published })
    if (user?.id) {
      await logAdminAction(user.id, 'TOGGLE_PUBLISH_PROJECT', 'project', p.id, { is_published: !p.is_published })
    }
    loadAdminProjects()
    loadAdminAnalyticsAndLogs()
  }

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project template?')) {
      await deleteProject(id)
      if (user?.id) {
        await logAdminAction(user.id, 'DELETE_PROJECT', 'project', id)
      }
      loadAdminProjects()
      loadAdminAnalyticsAndLogs()
    }
  }

  const handleOpenChallengeEditorForLesson = async (lessonId: string) => {
    const existing = adminChallenges.find((ch) => ch.lesson_id === lessonId)
    if (existing) {
      handleEditExercise(existing)
    } else {
      const targetLes = adminLessons.find((l) => l.id === lessonId)
      setEditingExercise(null)
      setShowAddExercise(true)
      setExLessonId(lessonId)
      setExTitle(targetLes?.title ? `Challenge: ${targetLes.title}` : 'New Coding Quest')
      setExSlug('')
      const defaultLang = selectedCourseForCurriculum?.course.track.toLowerCase().includes('python') ? 'python' : 'javascript'
      setExLanguage(defaultLang)
      setExDifficulty(selectedCourseForCurriculum?.course.difficulty || 'Beginner')
      setExInstructions('Solve the problem according to the instructions.')
      setExStarterCode('// Write your solution below:\n')
      setExSampleInput('')
      setExHint('')
      setExSolution('')
      setExSolutionCode('')
      setExXpReward(75)
    }
  }

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exTitle.trim()) return

    const matchedLesson = adminLessons.find((l) => l.id === exLessonId)

    const created = await createAdminChallenge({
      title: exTitle.trim(),
      slug: exSlug.trim() || undefined,
      language: exLanguage,
      category: exLanguage === 'python' ? 'Python' : exLanguage === 'cpp' ? 'C++' : exLanguage === 'java' ? 'Java' : 'JavaScript',
      difficulty: exDifficulty,
      description: exInstructions,
      instructions: exInstructions,
      starter_code: exStarterCode,
      sample_input: exSampleInput,
      lesson_id: exLessonId || undefined,
      course_id: matchedLesson?.course_id || undefined,
      hints: exHint.trim() ? [exHint.trim()] : [],
      solution_explanation: exSolution.trim() || undefined,
      solution_code: exSolutionCode.trim() || undefined,
      xp_reward: exXpReward >= 0 ? exXpReward : 75,
      is_published: true,
      order_index: adminChallenges.length + 1,
    })

    if (created) {
      if (user?.id) {
        await logAdminAction(user.id, 'CREATE_CHALLENGE', 'challenge', created.id, { title: exTitle, language: exLanguage })
      }
      setExerciseAlert('Coding exercise successfully authored and published!')
      setShowAddExercise(false)
      setExTitle('')
      setExSlug('')
      setExLessonId('')
      setExInstructions('')
      setExStarterCode('')
      setExSampleInput('')
      setExHint('')
      setExSolution('')
      setExSolutionCode('')
      setExXpReward(75)
      await loadAdminChallenges()
      setTimeout(() => setExerciseAlert(null), 4000)
    }
  }

  const handleEditExercise = async (ch: Challenge) => {
    setEditingExercise(ch)
    setExTitle(ch.title)
    setExSlug(ch.slug)
    setExLanguage(ch.language || 'javascript')
    setExDifficulty(ch.difficulty || 'Beginner')
    setExLessonId(ch.lesson_id || '')
    setExInstructions(ch.instructions || ch.description || '')
    setExStarterCode(ch.starter_code || '')
    setExSampleInput(ch.sample_input || '')
    setExHint((ch.hints && ch.hints[0]) || '')
    setExSolution(ch.solution_explanation || '')
    setExSolutionCode(ch.solution_code || '')
    setExXpReward(ch.xp_reward ?? 75)
    await loadTestCasesForSelected(ch.id)
  }

  const handleUpdateExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExercise || !exTitle.trim()) return

    const matchedLesson = adminLessons.find((l) => l.id === exLessonId)
    const ok = await updateAdminChallenge(editingExercise.id, {
      title: exTitle.trim(),
      slug: exSlug.trim() || editingExercise.slug,
      language: exLanguage,
      category: exLanguage === 'python' ? 'Python' : exLanguage === 'cpp' ? 'C++' : exLanguage === 'java' ? 'Java' : 'JavaScript',
      difficulty: exDifficulty,
      description: exInstructions,
      instructions: exInstructions,
      starter_code: exStarterCode,
      sample_input: exSampleInput,
      lesson_id: exLessonId || undefined,
      course_id: matchedLesson?.course_id || editingExercise.course_id,
      hints: exHint.trim() ? [exHint.trim()] : [],
      solution_explanation: exSolution.trim() || undefined,
      solution_code: exSolutionCode.trim() || undefined,
      xp_reward: exXpReward >= 0 ? exXpReward : 75,
    })

    if (ok) {
      if (user?.id) {
        await logAdminAction(user.id, 'UPDATE_CHALLENGE', 'challenge', editingExercise.id, { title: exTitle })
      }
      setExerciseAlert('Coding exercise successfully updated!')
      setEditingExercise(null)
      await loadAdminChallenges()
      setTimeout(() => setExerciseAlert(null), 4000)
    }
  }

  const handleTogglePublishExercise = async (ch: Challenge) => {
    await updateAdminChallenge(ch.id, { is_published: !ch.is_published })
    if (user?.id) {
      await logAdminAction(user.id, 'TOGGLE_PUBLISH_CHALLENGE', 'challenge', ch.id, { is_published: !ch.is_published })
    }
    await loadAdminChallenges()
  }

  const handleMoveChallenge = async (challengeId: string, direction: 'up' | 'down') => {
    const index = adminChallenges.findIndex((c) => c.id === challengeId)
    if (index < 0) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= adminChallenges.length) return

    const reordered = [...adminChallenges]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    const payload = reordered.map((item, idx) => ({ id: item.id, order_index: idx + 1 }))
    await reorderChallenges(payload)
    await loadAdminChallenges()
  }

  const handleDeleteExercise = async (id: string) => {
    if (confirm('Delete this coding exercise from the realm?')) {
      await deleteAdminChallenge(id)
      if (user?.id) {
        await logAdminAction(user.id, 'DELETE_CHALLENGE', 'challenge', id)
      }
      await loadAdminChallenges()
      if (selectedExerciseForTests?.id === id) {
        setSelectedExerciseForTests(null)
      }
    }
  }

  const handleOpenTestCases = async (ch: Challenge) => {
    setSelectedExerciseForTests(ch)
    setEditingTestCase(null)
    setTcInput('')
    setTcExpectedOutput('')
    setTcIsHidden(false)
    setTcIsActive(true)
    await loadTestCasesForSelected(ch.id)
  }

  const handleAddTestCase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExerciseForTests || !tcExpectedOutput.trim()) return

    await createAdminTestCase({
      exercise_id: selectedExerciseForTests.id,
      input: tcInput,
      expected_output: tcExpectedOutput,
      is_hidden: tcIsHidden,
      is_active: tcIsActive,
      order_index: exerciseTestCases.length + 1,
    })

    setTcInput('')
    setTcExpectedOutput('')
    setTcIsHidden(false)
    setTcIsActive(true)
    await loadTestCasesForSelected(selectedExerciseForTests.id)
  }

  const handleStartEditTestCase = (tc: ExerciseTestCase) => {
    setEditingTestCase(tc)
    setTcInput(tc.input || '')
    setTcExpectedOutput(tc.expected_output || '')
    setTcIsHidden(tc.is_hidden)
    setTcIsActive(tc.is_active)
  }

  const handleUpdateTestCase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTestCase || !tcExpectedOutput.trim() || !selectedExerciseForTests) return

    await updateAdminTestCase(editingTestCase.id, {
      input: tcInput,
      expected_output: tcExpectedOutput,
      is_hidden: tcIsHidden,
      is_active: tcIsActive,
    })

    setEditingTestCase(null)
    setTcInput('')
    setTcExpectedOutput('')
    setTcIsHidden(false)
    setTcIsActive(true)
    await loadTestCasesForSelected(selectedExerciseForTests.id)
  }

  const handleToggleTestCaseHidden = async (tc: ExerciseTestCase) => {
    await updateAdminTestCase(tc.id, { is_hidden: !tc.is_hidden })
    if (selectedExerciseForTests) {
      await loadTestCasesForSelected(selectedExerciseForTests.id)
    }
  }

  const handleToggleTestCaseActive = async (tc: ExerciseTestCase) => {
    await updateAdminTestCase(tc.id, { is_active: !tc.is_active })
    if (selectedExerciseForTests) {
      await loadTestCasesForSelected(selectedExerciseForTests.id)
    }
  }

  const handleMoveTestCase = async (tcId: string, direction: 'up' | 'down') => {
    if (!selectedExerciseForTests) return
    const index = exerciseTestCases.findIndex((t) => t.id === tcId)
    if (index < 0) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= exerciseTestCases.length) return

    const reordered = [...exerciseTestCases]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    const payload = reordered.map((item, idx) => ({ id: item.id, order_index: idx + 1 }))
    await reorderTestCases(payload)
    await loadTestCasesForSelected(selectedExerciseForTests.id)
  }

  const handleDeleteTestCase = async (id: string) => {
    if (confirm('Delete this test case?')) {
      await deleteAdminTestCase(id)
      if (selectedExerciseForTests) {
        await loadTestCasesForSelected(selectedExerciseForTests.id)
      }
    }
  }

  const handleOpenProjectSteps = (project: Project) => {
    setSelectedProjectForSteps(project)
    setStepTitleInput('')
    setStepDescInput('')
    setStepOrderInput((project.steps?.length || 0) + 1)
  }

  const handleAddProjectStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectForSteps || !stepTitleInput.trim()) return

    const newStep = await createProjectStep(
      selectedProjectForSteps.id,
      stepTitleInput.trim(),
      stepDescInput.trim(),
      stepOrderInput
    )

    if (newStep) {
      setSelectedProjectForSteps((prev) => {
        if (!prev) return null
        const updatedSteps = [...(prev.steps || []), newStep].sort((a, b) => a.step_order - b.step_order)
        return { ...prev, steps: updatedSteps }
      })
      setStepTitleInput('')
      setStepDescInput('')
      setStepOrderInput((selectedProjectForSteps.steps?.length || 0) + 2)
      await loadAdminProjects()
    }
  }

  const handleDeleteProjectStep = async (stepId: string) => {
    const ok = await deleteProjectStep(stepId)
    if (ok && selectedProjectForSteps) {
      setSelectedProjectForSteps((prev) => {
        if (!prev) return null
        return { ...prev, steps: (prev.steps || []).filter((s) => s.id !== stepId) }
      })
      await loadAdminProjects()
    }
  }

  const handleResolveReport = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    await resolveReport(reportId, status)
    if (user?.id) {
      await logAdminAction(user.id, 'RESOLVE_REPORT', 'content_report', reportId, { status })
    }
    await loadAdminCommunity()
    await loadAdminAnalyticsAndLogs()
  }

  const handleModeratePost = async (postId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'hidden' : 'published'
    if (user?.id) {
      await setPostModerationStatus(user.id, postId, nextStatus)
      await logAdminAction(user.id, 'MODERATE_COMMUNITY_POST', 'community_post', postId, { nextStatus })
      await loadAdminCommunity()
      await loadAdminAnalyticsAndLogs()
    }
  }

  const handleDeletePost = async (postId: string) => {
    await deleteCommunityPost(postId)
    if (user?.id) {
      await logAdminAction(user.id, 'DELETE_COMMUNITY_POST', 'community_post', postId)
    }
    await loadAdminCommunity()
    await loadAdminAnalyticsAndLogs()
  }

  // ----------------------------------------------------
  // LANGUAGES HANDLERS
  // ----------------------------------------------------
  const handleCreateLanguage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!langName.trim()) return

    const slug = langSlug.trim() || langName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const created = await createLanguage({
      name: langName.trim(),
      slug,
      icon: langIcon.trim() || '🐍',
      color: langColor.trim() || '#10b981',
      description: langDesc.trim() || undefined,
      order_index: adminLanguages.length + 1,
      is_published: true,
    })

    if (created) {
      if (user?.id) {
        await logAdminAction(user.id, 'CREATE_LANGUAGE', 'language', created.id, { name: langName })
      }
      setLangName('')
      setLangSlug('')
      setLangDesc('')
      setShowAddLanguage(false)
      await loadAdminLanguages()
      await loadAdminAnalyticsAndLogs()
    }
  }

  const handleEditLanguage = (lang: Language) => {
    setEditingLanguage(lang)
    setLangName(lang.name)
    setLangSlug(lang.slug)
    setLangIcon(lang.icon || '🐍')
    setLangColor(lang.color || '#10b981')
    setLangDesc(lang.description || '')
  }

  const handleUpdateLanguage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLanguage || !langName.trim()) return

    const ok = await updateLanguage(editingLanguage.id, {
      name: langName.trim(),
      slug: langSlug.trim() || editingLanguage.slug,
      icon: langIcon.trim() || '🐍',
      color: langColor.trim() || '#10b981',
      description: langDesc.trim() || undefined,
    })

    if (ok) {
      if (user?.id) {
        await logAdminAction(user.id, 'UPDATE_LANGUAGE', 'language', editingLanguage.id, { name: langName })
      }
      setEditingLanguage(null)
      setLangName('')
      setLangSlug('')
      setLangDesc('')
      await loadAdminLanguages()
    }
  }

  const handleTogglePublishLanguage = async (lang: Language) => {
    const next = !lang.is_published
    await updateLanguage(lang.id, { is_published: next })
    if (user?.id) {
      await logAdminAction(user.id, 'TOGGLE_PUBLISH_LANGUAGE', 'language', lang.id, { is_published: next })
    }
    await loadAdminLanguages()
  }

  const handleMoveLanguage = async (langId: string, direction: 'up' | 'down') => {
    const index = adminLanguages.findIndex((l) => l.id === langId)
    if (index < 0) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= adminLanguages.length) return

    const reordered = [...adminLanguages]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    const payload = reordered.map((item, idx) => ({ id: item.id, order_index: idx + 1 }))
    await reorderLanguages(payload)
    await loadAdminLanguages()
  }

  const handleDeleteLanguage = async (langId: string) => {
    await deleteLanguage(langId)
    if (user?.id) {
      await logAdminAction(user.id, 'DELETE_LANGUAGE', 'language', langId)
    }
    await loadAdminLanguages()
    await loadAdminAnalyticsAndLogs()
  }

  // ----------------------------------------------------
  // LEARNING PATHS / ISLANDS HANDLERS
  // ----------------------------------------------------
  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pathTitle.trim()) return

    const slug = pathSlug.trim() || pathTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const ok = await createAdminLearningPath({
      title: pathTitle.trim(),
      slug,
      island_name: pathIslandName.trim() || pathTitle.trim(),
      icon: pathIcon.trim() || '🏝️',
      language_id: pathLanguageId || undefined,
      description: pathDesc.trim() || undefined,
      order_index: adminPaths.length + 1,
      is_published: true,
    })

    if (ok) {
      if (user?.id) {
        await logAdminAction(user.id, 'CREATE_LEARNING_PATH', 'learning_path', undefined, { title: pathTitle })
      }
      setPathTitle('')
      setPathSlug('')
      setPathIslandName('')
      setPathDesc('')
      setPathLanguageId('')
      setShowAddPath(false)
      await loadAdminPaths()
      await loadAdminAnalyticsAndLogs()
    }
  }

  const handleEditPath = (p: LearningPath) => {
    setEditingPath(p)
    setPathTitle(p.title)
    setPathSlug(p.slug)
    setPathIslandName(p.island_name || p.title)
    setPathIcon(p.icon || '🏝️')
    setPathLanguageId(p.language_id || '')
    setPathDesc(p.description || '')
  }

  const handleUpdatePath = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPath || !pathTitle.trim()) return

    const ok = await updateAdminLearningPath(editingPath.id, {
      title: pathTitle.trim(),
      slug: pathSlug.trim() || editingPath.slug,
      island_name: pathIslandName.trim() || pathTitle.trim(),
      icon: pathIcon.trim() || '🏝️',
      language_id: pathLanguageId || undefined,
      description: pathDesc.trim() || undefined,
    })

    if (ok) {
      if (user?.id) {
        await logAdminAction(user.id, 'UPDATE_LEARNING_PATH', 'learning_path', editingPath.id, { title: pathTitle })
      }
      setEditingPath(null)
      setPathTitle('')
      setPathSlug('')
      setPathIslandName('')
      setPathDesc('')
      setPathLanguageId('')
      await loadAdminPaths()
    }
  }

  const handleTogglePublishPath = async (p: LearningPath) => {
    const next = !p.is_published
    await updateAdminLearningPath(p.id, { is_published: next })
    if (user?.id) {
      await logAdminAction(user.id, 'TOGGLE_PUBLISH_LEARNING_PATH', 'learning_path', p.id, { is_published: next })
    }
    await loadAdminPaths()
  }

  const handleMovePath = async (pathId: string, direction: 'up' | 'down') => {
    const index = adminPaths.findIndex((p) => p.id === pathId)
    if (index < 0) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= adminPaths.length) return

    const reordered = [...adminPaths]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    const payload = reordered.map((item, idx) => ({ id: item.id, order_index: idx + 1 }))
    await reorderLearningPaths(payload)
    await loadAdminPaths()
  }

  const handleDeletePath = async (pathId: string) => {
    await deleteAdminLearningPath(pathId)
    if (user?.id) {
      await logAdminAction(user.id, 'DELETE_LEARNING_PATH', 'learning_path', pathId)
    }
    await loadAdminPaths()
    await loadAdminAnalyticsAndLogs()
  }

  // ----------------------------------------------------
  // COURSES HANDLERS
  // ----------------------------------------------------
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseTitle.trim()) return

    const slug = courseSlug.trim() || courseTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const ok = await createAdminCourse({
      title: courseTitle.trim(),
      slug,
      track: courseTrack,
      difficulty: courseDifficulty,
      description: courseDesc.trim() || undefined,
      language_id: courseLanguageId || undefined,
      path_id: coursePathId || undefined,
      prerequisite_course_id: coursePrereqId || null,
      is_published: true,
      order_index: adminCourses.length + 1,
    })

    if (ok) {
      if (user?.id) {
        await logAdminAction(user.id, 'CREATE_COURSE', 'course', undefined, { title: courseTitle, track: courseTrack })
      }
      setCourseTitle('')
      setCourseSlug('')
      setCourseDesc('')
      setCourseLanguageId('')
      setCoursePathId('')
      setCoursePrereqId('')
      setShowAddCourse(false)
      await loadAdminCourses()
      await loadAdminAnalyticsAndLogs()
    }
  }

  const handleEditCourse = (cSummary: CourseProgressSummary) => {
    setEditingCourse(cSummary)
    setCourseTitle(cSummary.course.title)
    setCourseSlug(cSummary.course.slug)
    setCourseTrack(cSummary.course.track)
    setCourseDifficulty(cSummary.course.difficulty)
    setCourseLanguageId(cSummary.course.language_id || '')
    setCoursePathId(cSummary.course.path_id || '')
    setCoursePrereqId(cSummary.course.prerequisite_course_id || '')
    setCourseDesc(cSummary.course.description || '')
  }

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse || !courseTitle.trim()) return

    const ok = await updateAdminCourse(editingCourse.course.id, {
      title: courseTitle.trim(),
      slug: courseSlug.trim() || editingCourse.course.slug,
      track: courseTrack,
      difficulty: courseDifficulty,
      language_id: courseLanguageId || undefined,
      path_id: coursePathId || undefined,
      prerequisite_course_id: coursePrereqId || null,
      description: courseDesc.trim() || undefined,
    })

    if (ok) {
      if (user?.id) {
        await logAdminAction(user.id, 'UPDATE_COURSE', 'course', editingCourse.course.id, { title: courseTitle })
      }
      setEditingCourse(null)
      setCourseTitle('')
      setCourseSlug('')
      setCourseDesc('')
      setCourseLanguageId('')
      setCoursePathId('')
      setCoursePrereqId('')
      await loadAdminCourses()
    }
  }

  const handleMoveCourse = async (courseId: string, direction: 'up' | 'down') => {
    const index = adminCourses.findIndex((c) => c.course.id === courseId)
    if (index < 0) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= adminCourses.length) return

    const reordered = [...adminCourses]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    const payload = reordered.map((item, idx) => ({ id: item.course.id, order_index: idx + 1 }))
    await reorderCourses(payload)
    await loadAdminCourses()
  }

  const handleTogglePublishCourse = async (courseSummary: CourseProgressSummary) => {
    const nextPublished = !courseSummary.course.is_published
    await updateAdminCourse(courseSummary.course.id, { is_published: nextPublished })
    if (user?.id) {
      await logAdminAction(user.id, 'TOGGLE_PUBLISH_COURSE', 'course', courseSummary.course.id, { is_published: nextPublished })
    }
    await loadAdminCourses()
    await loadAdminAnalyticsAndLogs()
  }

  const handleDeleteCourse = async (courseId: string) => {
    await deleteAdminCourse(courseId)
    if (user?.id) {
      await logAdminAction(user.id, 'DELETE_COURSE', 'course', courseId)
    }
    await loadAdminCourses()
    await loadAdminAnalyticsAndLogs()
  }

  // ----------------------------------------------------
  // CHAPTERS HANDLERS
  // ----------------------------------------------------
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseForCurriculum || !newChapterTitle.trim()) return

    const newChap = await createAdminChapter({
      course_id: selectedCourseForCurriculum.course.id,
      title: newChapterTitle.trim(),
      order_index: (selectedCourseForCurriculum.chapters?.length || 0) + 1,
    })

    if (newChap) {
      if (user?.id) {
        await logAdminAction(user.id, 'CREATE_CHAPTER', 'chapter', newChap.id, { title: newChapterTitle })
      }
      setNewChapterTitle('')
      await loadAdminCourses()
      await loadAdminAnalyticsAndLogs()
      const refreshedCourses = await fetchCoursesWithProgress(undefined, undefined)
      const updated = refreshedCourses.find((c) => c.course.id === selectedCourseForCurriculum.course.id)
      if (updated) setSelectedCourseForCurriculum(updated)
    }
  }

  const handleUpdateChapter = async (chapterId: string, title: string) => {
    if (!title.trim() || !selectedCourseForCurriculum) return
    await updateAdminChapter(chapterId, { title: title.trim() })
    setEditingChapter(null)
    await loadAdminCourses()
    const refreshedCourses = await fetchCoursesWithProgress(undefined, undefined)
    const updated = refreshedCourses.find((c) => c.course.id === selectedCourseForCurriculum.course.id)
    if (updated) setSelectedCourseForCurriculum(updated)
  }

  const handleMoveChapter = async (chapterId: string, direction: 'up' | 'down') => {
    if (!selectedCourseForCurriculum) return
    const chaps = selectedCourseForCurriculum.chapters || []
    const index = chaps.findIndex((c) => c.id === chapterId)
    if (index < 0) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= chaps.length) return

    const reordered = [...chaps]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    const payload = reordered.map((item, idx) => ({ id: item.id, order_index: idx + 1 }))
    await reorderChapters(payload)
    await loadAdminCourses()
    const refreshedCourses = await fetchCoursesWithProgress(undefined, undefined)
    const updated = refreshedCourses.find((c) => c.course.id === selectedCourseForCurriculum.course.id)
    if (updated) setSelectedCourseForCurriculum(updated)
  }

  const handleDeleteChapter = async (chapterId: string) => {
    await deleteAdminChapter(chapterId)
    if (user?.id) {
      await logAdminAction(user.id, 'DELETE_CHAPTER', 'chapter', chapterId)
    }
    await loadAdminCourses()
    await loadAdminAnalyticsAndLogs()
    if (selectedCourseForCurriculum) {
      const refreshedCourses = await fetchCoursesWithProgress(undefined, undefined)
      const updated = refreshedCourses.find((c) => c.course.id === selectedCourseForCurriculum.course.id)
      if (updated) setSelectedCourseForCurriculum(updated)
    }
  }

  // ----------------------------------------------------
  // LESSONS HANDLERS
  // ----------------------------------------------------
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChapterIdForLesson || !newLessonTitle.trim() || !selectedCourseForCurriculum) return

    const currentChapter = (selectedCourseForCurriculum.chapters || []).find((c) => c.id === selectedChapterIdForLesson)
    const lessonCount = currentChapter?.lessons?.length || 0

    const slug = newLessonSlug.trim() || newLessonTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const newLes = await createAdminLesson({
      chapter_id: selectedChapterIdForLesson,
      title: newLessonTitle.trim(),
      slug,
      summary: newLessonSummary.trim() || undefined,
      content: newLessonContent.trim() || undefined,
      order_index: lessonCount + 1,
    })

    if (newLes) {
      if (user?.id) {
        await logAdminAction(user.id, 'CREATE_LESSON', 'lesson', newLes.id, { title: newLessonTitle })
      }
      setNewLessonTitle('')
      setNewLessonSlug('')
      setNewLessonSummary('')
      setNewLessonContent(DEFAULT_LESSON_CONTENT_TEMPLATE)
      setSelectedChapterIdForLesson(null)
      await loadAdminCourses()
      const refreshedCourses = await fetchCoursesWithProgress(undefined, undefined)
      const updated = refreshedCourses.find((c) => c.course.id === selectedCourseForCurriculum.course.id)
      if (updated) setSelectedCourseForCurriculum(updated)
    }
  }

  const handleEditLesson = (les: any, chapterId: string) => {
    setEditingLesson({
      id: les.id,
      chapterId,
      title: les.title,
      slug: les.slug,
      summary: les.summary || '',
      content: les.content || DEFAULT_LESSON_CONTENT_TEMPLATE,
    })
  }

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLesson || !editingLesson.title.trim() || !selectedCourseForCurriculum) return

    const ok = await updateAdminLesson(editingLesson.id, {
      title: editingLesson.title.trim(),
      slug: editingLesson.slug.trim(),
      summary: editingLesson.summary.trim() || undefined,
      content: editingLesson.content.trim() || undefined,
    })

    if (ok) {
      if (user?.id) {
        await logAdminAction(user.id, 'UPDATE_LESSON', 'lesson', editingLesson.id, { title: editingLesson.title })
      }
      setEditingLesson(null)
      await loadAdminCourses()
      const refreshedCourses = await fetchCoursesWithProgress(undefined, undefined)
      const updated = refreshedCourses.find((c) => c.course.id === selectedCourseForCurriculum.course.id)
      if (updated) setSelectedCourseForCurriculum(updated)
    }
  }

  const handleMoveLesson = async (chapterId: string, lessonId: string, direction: 'up' | 'down') => {
    if (!selectedCourseForCurriculum) return
    const currentChapter = (selectedCourseForCurriculum.chapters || []).find((c) => c.id === chapterId)
    if (!currentChapter) return
    const lessons = currentChapter.lessons || []
    const index = lessons.findIndex((l) => l.id === lessonId)
    if (index < 0) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= lessons.length) return

    const reordered = [...lessons]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    const payload = reordered.map((item, idx) => ({ id: item.id, order_index: idx + 1 }))
    await reorderLessons(payload)
    await loadAdminCourses()
    const refreshedCourses = await fetchCoursesWithProgress(undefined, undefined)
    const updated = refreshedCourses.find((c) => c.course.id === selectedCourseForCurriculum.course.id)
    if (updated) setSelectedCourseForCurriculum(updated)
  }

  const handleDeleteLesson = async (lessonId: string) => {
    await deleteAdminLesson(lessonId)
    if (user?.id) {
      await logAdminAction(user.id, 'DELETE_LESSON', 'lesson', lessonId)
    }
    await loadAdminCourses()
    if (selectedCourseForCurriculum) {
      const refreshedCourses = await fetchCoursesWithProgress(undefined, undefined)
      const updated = refreshedCourses.find((c) => c.course.id === selectedCourseForCurriculum.course.id)
      if (updated) setSelectedCourseForCurriculum(updated)
    }
  }

  const handleInspectLearner = async (learnerId: string) => {
    setLoadingInspect(true)
    const details = await fetchDetailedLearnerInfo(learnerId)
    setInspectedUser(details)
    setLoadingInspect(false)
  }

  const handleToggleUserRole = async (targetUserId: string, currentRole: string) => {
    if (!user?.id) return
    const nextRole = currentRole === 'admin' ? 'student' : 'admin'
    const ok = await updateUserRole(user.id, targetUserId, nextRole)
    if (ok) {
      const loadLearnersData = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, username, email, role, xp, level')
          .order('xp', { ascending: false })
        if (data) {
          setLearners(
            data.map((item) => ({
              id: item.id,
              name: item.full_name || item.username || 'Adventurer',
              email: item.email || '',
              role: item.role,
              xp: item.xp ?? 0,
              level: item.level ?? 1,
              status: item.role === 'admin' ? 'Staff' : 'Active',
            }))
          )
        }
      }
      await loadLearnersData()
      await loadAdminAnalyticsAndLogs()
      if (inspectedUser && inspectedUser.id === targetUserId) {
        setInspectedUser((prev) => (prev ? { ...prev, role: nextRole } : null))
      }
    }
  }

  // Strict RBAC Guard
  if (!isAdmin || role !== 'admin') {
    return (
      <div className="w-full max-w-xl mx-auto my-12 p-8 bg-rose-50 border-2 border-rose-200 rounded-3xl text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-pixel text-rose-900 uppercase">Access Denied</h2>
        <p className="text-xs text-rose-700">You must have verified Administrator credentials in the database to view this command center.</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-pixel uppercase rounded-xl transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    )
  }

  const filteredLearners = learners.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12 text-left">
      {/* Test Case Manager Modal */}
      {selectedExerciseForTests && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                    Test Case Builder: {selectedExerciseForTests.title}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Language: <span className="uppercase text-purple-700 font-bold">{selectedExerciseForTests.language || selectedExerciseForTests.category}</span> • XP: {selectedExerciseForTests.xp_reward ?? 75} XP • {exerciseTestCases.length} Test Cases Total
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedExerciseForTests(null)
                  setEditingTestCase(null)
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {/* Existing Test Cases Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold font-pixel uppercase text-slate-800">
                    Challenge Validation Suite ({exerciseTestCases.length} Cases)
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Public cases give immediate feedback; Hidden cases validate edge cases securely.
                  </span>
                </div>
                {exerciseTestCases.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-pixel text-xs">
                    NO TEST CASES CONFIGURED YET. ADD AT LEAST ONE TEST CASE BELOW.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-pixel text-[10px] text-slate-400">
                          <th className="p-3">#</th>
                          <th className="p-3">INPUT (STDIN)</th>
                          <th className="p-3">EXPECTED OUTPUT</th>
                          <th className="p-3">VISIBILITY</th>
                          <th className="p-3">STATE</th>
                          <th className="p-3">ORDER</th>
                          <th className="p-3 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exerciseTestCases.map((tc, idx) => (
                          <tr key={tc.id} className="border-b border-slate-100 last:border-0 font-mono hover:bg-slate-50/50">
                            <td className="p-3 font-bold">{tc.order_index ?? idx + 1}</td>
                            <td className="p-3 text-slate-600 truncate max-w-36 font-mono">{tc.input ? tc.input : <span className="text-slate-300 italic">(none)</span>}</td>
                            <td className="p-3 text-emerald-700 font-bold truncate max-w-48 font-mono">{tc.expected_output}</td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => handleToggleTestCaseHidden(tc)}
                                className={`px-2 py-0.5 rounded text-[9px] font-pixel font-bold uppercase cursor-pointer transition-colors ${
                                  tc.is_hidden ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                }`}
                                title="Click to toggle Public / Hidden"
                              >
                                {tc.is_hidden ? '🔒 Hidden' : '👁️ Public'}
                              </button>
                            </td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => handleToggleTestCaseActive(tc)}
                                className={`px-2 py-0.5 rounded text-[9px] font-pixel font-bold uppercase cursor-pointer transition-colors ${
                                  tc.is_active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                                title="Click to toggle Active / Inactive"
                              >
                                {tc.is_active ? 'Active' : 'Disabled'}
                              </button>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveTestCase(tc.id, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveTestCase(tc.id, 'down')}
                                  disabled={idx === exerciseTestCases.length - 1}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditTestCase(tc)}
                                  className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                                  title="Edit Test Case"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTestCase(tc.id)}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="Delete Test Case"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add / Edit Test Case Form */}
              <form
                onSubmit={editingTestCase ? handleUpdateTestCase : handleAddTestCase}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-pixel uppercase text-slate-900">
                    {editingTestCase ? `Edit Test Case (#${editingTestCase.order_index})` : 'Add New Test Case'}
                  </h4>
                  {editingTestCase && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTestCase(null)
                        setTcInput('')
                        setTcExpectedOutput('')
                        setTcIsHidden(false)
                        setTcIsActive(true)
                      }}
                      className="text-[10px] font-pixel text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Input / STDIN (Passed to execution script)
                    </label>
                    <textarea
                      rows={2}
                      value={tcInput}
                      onChange={(e) => setTcInput(e.target.value)}
                      placeholder="e.g. 5 or [1, 2, 3] (leave blank if input is embedded in starter code)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Expected Output (Exact stdout string match)
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={tcExpectedOutput}
                      onChange={(e) => setTcExpectedOutput(e.target.value)}
                      placeholder="e.g. 25 or Hello World"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={tcIsHidden}
                        onChange={(e) => setTcIsHidden(e.target.checked)}
                        className="rounded"
                      />
                      <span>🔒 Hidden Test Case (Output obscured from student)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={tcIsActive}
                        onChange={(e) => setTcIsActive(e.target.checked)}
                        className="rounded"
                      />
                      <span>Active Test Case</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold font-pixel uppercase cursor-pointer"
                  >
                    {editingTestCase ? 'Save Test Case Changes' : '+ Add Test Case'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Coding Challenge Editor Modal */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                  Edit Coding Challenge: {editingExercise.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenTestCases(editingExercise)}
                  className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold font-pixel uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>Test Cases ({exerciseTestCases.filter((t) => t.exercise_id === editingExercise.id).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateExercise} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Challenge Title</label>
                  <input
                    type="text"
                    required
                    value={exTitle}
                    onChange={(e) => setExTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug</label>
                  <input
                    type="text"
                    value={exSlug}
                    onChange={(e) => setExSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Language</label>
                  <select
                    value={exLanguage}
                    onChange={(e) => setExLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="html">HTML / Web Preview</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={exDifficulty}
                    onChange={(e) => setExDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">XP Reward</label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={exXpReward}
                    onChange={(e) => setExXpReward(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-amber-600 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Linked Lesson</label>
                  <select
                    value={exLessonId}
                    onChange={(e) => setExLessonId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">-- Standalone Challenge --</option>
                    {adminLessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.course_title ? `${l.course_title} > ${l.title}` : l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instructions / Challenge Goal</label>
                <textarea
                  required
                  rows={3}
                  value={exInstructions}
                  onChange={(e) => setExInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Starter Code (Editor Seed)</label>
                <textarea
                  rows={5}
                  value={exStarterCode}
                  onChange={(e) => setExStarterCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hint (Optional)</label>
                  <input
                    type="text"
                    value={exHint}
                    onChange={(e) => setExHint(e.target.value)}
                    placeholder="e.g. Try using string interpolation"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sample Input / STDIN</label>
                  <input
                    type="text"
                    value={exSampleInput}
                    onChange={(e) => setExSampleInput(e.target.value)}
                    placeholder="e.g. [1, 2, 3]"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Solution Code (Secure)</label>
                  <textarea
                    rows={3}
                    value={exSolutionCode}
                    onChange={(e) => setExSolutionCode(e.target.value)}
                    placeholder="// Reference solution code"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Solution Explanation</label>
                  <textarea
                    rows={3}
                    value={exSolution}
                    onChange={(e) => setExSolution(e.target.value)}
                    placeholder="Explains the optimal approach and concepts"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-pixel uppercase rounded-xl cursor-pointer"
                >
                  Save Challenge Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Steps Manager Modal */}
      {selectedProjectForSteps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                  Project Steps: {selectedProjectForSteps.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectForSteps(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {/* Existing Steps Table */}
              <div>
                <h4 className="text-xs font-bold font-pixel uppercase text-slate-800 mb-3">
                  Configured Steps ({(selectedProjectForSteps.steps || []).length})
                </h4>
                {(selectedProjectForSteps.steps || []).length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-pixel text-xs">
                    NO STEPS CONFIGURED FOR THIS PROJECT
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-pixel text-[10px] text-slate-400">
                          <th className="p-3"># ORDER</th>
                          <th className="p-3">TITLE</th>
                          <th className="p-3">DESCRIPTION</th>
                          <th className="p-3 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedProjectForSteps.steps || []).map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-bold text-slate-700">{st.step_order}</td>
                            <td className="p-3 font-bold text-slate-900">{st.title}</td>
                            <td className="p-3 text-slate-600 max-w-xs truncate">{st.description}</td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteProjectStep(st.id)}
                                className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete Step"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add Step Form */}
              <form onSubmit={handleAddProjectStep} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <h5 className="font-pixel text-xs font-bold text-slate-800 uppercase">+ Add New Project Step</h5>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Step Order</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={stepOrderInput}
                      onChange={(e) => setStepOrderInput(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Step Title</label>
                    <input
                      type="text"
                      required
                      value={stepTitleInput}
                      onChange={(e) => setStepTitleInput(e.target.value)}
                      placeholder="e.g. Implement Responsive Grid Layout"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Step Description / Instructions</label>
                  <textarea
                    rows={2}
                    required
                    value={stepDescInput}
                    onChange={(e) => setStepDescInput(e.target.value)}
                    placeholder="Provide clear milestone guidance for student..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-pixel uppercase cursor-pointer"
                  >
                    + Add Step
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Curriculum (Chapters & Lessons) Manager Modal */}
      {selectedCourseForCurriculum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                    Curriculum Editor: {selectedCourseForCurriculum.course.title}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Track: {selectedCourseForCurriculum.course.track} • {selectedCourseForCurriculum.course.difficulty}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCourseForCurriculum(null)
                  setSelectedChapterIdForLesson(null)
                  setEditingChapter(null)
                  setEditingLesson(null)
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              {/* Chapters & Lessons Hierarchy List */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-pixel uppercase text-slate-800">
                    Chapters & Lessons Structure ({(selectedCourseForCurriculum.chapters || []).length} Chapters)
                  </h4>
                </div>

                {(selectedCourseForCurriculum.chapters || []).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-400 font-pixel text-xs">
                    NO CHAPTERS IN THIS COURSE YET. ADD YOUR FIRST CHAPTER BELOW!
                  </div>
                ) : (
                  (selectedCourseForCurriculum.chapters || []).map((chap, cIdx) => (
                    <div key={chap.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-pixel text-[10px] font-bold">
                            Ch. {chap.order_index}
                          </span>
                          {editingChapter?.id === chap.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingChapter.title}
                                onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                                className="px-2 py-1 rounded border border-emerald-300 text-xs font-bold font-pixel"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateChapter(chap.id, editingChapter.title)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold font-pixel uppercase cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingChapter(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span className="font-bold text-sm text-slate-900 font-pixel uppercase">{chap.title}</span>
                          )}
                          <span className="text-xs text-slate-400">({chap.lessons?.length || 0} lessons)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveChapter(chap.id, 'up')}
                            disabled={cIdx === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Move Chapter Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveChapter(chap.id, 'down')}
                            disabled={cIdx === (selectedCourseForCurriculum.chapters || []).length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                            title="Move Chapter Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingChapter({ id: chap.id, title: chap.title })}
                            className="p-1 rounded text-slate-500 hover:bg-slate-200 cursor-pointer"
                            title="Edit Chapter Title"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedChapterIdForLesson(selectedChapterIdForLesson === chap.id ? null : chap.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-pixel uppercase font-bold cursor-pointer"
                          >
                            {selectedChapterIdForLesson === chap.id ? 'Close' : '+ Add Lesson'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(chap.id)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-100 cursor-pointer"
                            title="Delete Chapter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons inside Chapter */}
                      {(chap.lessons || []).length > 0 && (
                        <div className="pl-4 border-l-2 border-slate-200 flex flex-col gap-1.5">
                          {(chap.lessons || []).map((les, lIdx) => {
                            const linkedChallenge = adminChallenges.find((ch) => ch.lesson_id === les.id)
                            const linkedTestsCount = linkedChallenge ? exerciseTestCases.filter((t) => t.exercise_id === linkedChallenge.id).length : 0

                            return (
                              <div key={les.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 text-xs hover:border-slate-300 transition-colors gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-slate-400 font-mono text-[10px] font-bold">#{les.order_index ?? lIdx + 1}</span>
                                  <span className="font-bold text-slate-900">{les.title}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">/{les.slug}</span>
                                  {les.summary && (
                                    <span className="text-[11px] text-slate-500 truncate max-w-48 hidden md:inline">— {les.summary}</span>
                                  )}
                                  {linkedChallenge ? (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenChallengeEditorForLesson(les.id)}
                                      className="px-2 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-pixel uppercase font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Edit Associated Coding Challenge & Test Cases"
                                    >
                                      <Code2 className="w-3 h-3 text-purple-600" />
                                      <span>Quest: {linkedChallenge.title}</span>
                                      <span className="text-[9px] px-1 py-0.2 bg-purple-200 text-purple-900 rounded font-mono">{linkedChallenge.language || 'code'}</span>
                                      <span className="text-[9px] px-1 py-0.2 bg-purple-300/60 text-purple-950 rounded font-bold">+{linkedChallenge.xp_reward ?? 75} XP</span>
                                      <span className="text-[9px] px-1 py-0.2 bg-purple-200/50 text-purple-800 rounded font-bold">{linkedTestsCount} tests</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenChallengeEditorForLesson(les.id)}
                                      className="px-2 py-0.5 rounded-lg border border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 text-[10px] font-pixel uppercase font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Link a new Coding Challenge to this Lesson"
                                    >
                                      <PlusCircle className="w-3 h-3" />
                                      <span>+ Attach Challenge</span>
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 self-end sm:self-auto">
                                  {linkedChallenge && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenTestCases(linkedChallenge)}
                                      className="px-2 py-1 rounded bg-slate-100 hover:bg-purple-100 text-purple-700 font-pixel text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                                      title="Manage Test Cases for this Challenge"
                                    >
                                      <ListChecks className="w-3 h-3" />
                                      <span>Tests</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleMoveLesson(chap.id, les.id, 'up')}
                                    disabled={lIdx === 0}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                    title="Move Lesson Up"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveLesson(chap.id, les.id, 'down')}
                                    disabled={lIdx === (chap.lessons || []).length - 1}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                    title="Move Lesson Down"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEditLesson(les, chap.id)}
                                    className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                                    title="Edit Lesson Content"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLesson(les.id)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Add Lesson Form inside Chapter */}
                      {selectedChapterIdForLesson === chap.id && (
                        <form onSubmit={handleCreateLesson} className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-sm flex flex-col gap-3 mt-1 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <h6 className="text-[10px] font-pixel font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Create Lesson under {chap.title}</span>
                            </h6>
                            <span className="text-[10px] text-slate-400">Structured Markdown Template Loaded</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Lesson Title</label>
                              <input
                                type="text"
                                required
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                placeholder="e.g. 01. Print Statements & Standard Output"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Slug (URL identifier)</label>
                              <input
                                type="text"
                                value={newLessonSlug}
                                onChange={(e) => setNewLessonSlug(e.target.value)}
                                placeholder="print-statements"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Summary (1-2 sentences)</label>
                            <input
                              type="text"
                              value={newLessonSummary}
                              onChange={(e) => setNewLessonSummary(e.target.value)}
                              placeholder="Brief description of what student achieves in this lesson..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                              Educational Lesson Content (Markdown with Explanation, Examples, Instructions, Hint, Solution)
                            </label>
                            <textarea
                              rows={8}
                              value={newLessonContent}
                              onChange={(e) => setNewLessonContent(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setSelectedChapterIdForLesson(null)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer"
                            >
                              Save Lesson
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Chapter Form */}
              <form onSubmit={handleCreateChapter} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <h5 className="font-pixel text-xs font-bold text-slate-800 uppercase">+ Add New Chapter to Course</h5>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Chapter Title (e.g. Chapter 3: Functions & Control Flow)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-pixel uppercase cursor-pointer"
                  >
                    + Add Chapter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lesson Full Content Modal */}
      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                  Edit Lesson: {editingLesson.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLesson} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingLesson.title}
                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={editingLesson.slug}
                    onChange={(e) => setEditingLesson({ ...editingLesson, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Summary</label>
                <input
                  type="text"
                  value={editingLesson.summary}
                  onChange={(e) => setEditingLesson({ ...editingLesson, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Lesson Markdown Content (Explanation, Examples, Instructions, Hint, Solution)
                </label>
                <textarea
                  rows={12}
                  value={editingLesson.content}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer"
                >
                  Update Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                  Edit Course: {editingCourse.course.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={courseSlug}
                    onChange={(e) => setCourseSlug(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Track</label>
                  <input
                    type="text"
                    required
                    value={courseTrack}
                    onChange={(e) => setCourseTrack(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={courseDifficulty}
                    onChange={(e) => setCourseDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Language Association</label>
                  <select
                    value={courseLanguageId}
                    onChange={(e) => setCourseLanguageId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="">-- None --</option>
                    {adminLanguages.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.icon} {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Island / Path Association</label>
                  <select
                    value={coursePathId}
                    onChange={(e) => setCoursePathId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="">-- None --</option>
                    {adminPaths.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon || '🏝️'} {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prerequisite Course (Must solve to unlock)</label>
                  <select
                    value={coursePrereqId}
                    onChange={(e) => setCoursePrereqId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="">-- No Prerequisite (Freely Unlocked) --</option>
                    {adminCourses
                      .filter((c) => c.course.id !== editingCourse.course.id)
                      .map((c) => (
                        <option key={c.course.id} value={c.course.id}>
                          {c.course.title} ({c.course.track})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer"
                >
                  Save Course Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Language Modal */}
      {editingLanguage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                  Edit Language: {editingLanguage.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLanguage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLanguage} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Language Name</label>
                  <input
                    type="text"
                    required
                    value={langName}
                    onChange={(e) => setLangName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={langSlug}
                    onChange={(e) => setLangSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    value={langIcon}
                    onChange={(e) => setLangIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={langColor}
                    onChange={(e) => setLangColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={langDesc}
                  onChange={(e) => setLangDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLanguage(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer"
                >
                  Save Language
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Island / Path Modal */}
      {editingPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                  Edit Learning Path: {editingPath.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPath(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePath} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Path Title</label>
                  <input
                    type="text"
                    required
                    value={pathTitle}
                    onChange={(e) => setPathTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={pathSlug}
                    onChange={(e) => setPathSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Island Realm Name</label>
                  <input
                    type="text"
                    value={pathIslandName}
                    onChange={(e) => setPathIslandName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    value={pathIcon}
                    onChange={(e) => setPathIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Linked Language</label>
                  <select
                    value={pathLanguageId}
                    onChange={(e) => setPathLanguageId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <option value="">-- No Language Lock --</option>
                    {adminLanguages.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.icon} {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={pathDesc}
                  onChange={(e) => setPathDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPath(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer"
                >
                  Save Path
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Inspection Modal */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900 font-pixel uppercase">
                  Learner Profile Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* User Overview */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-pixel uppercase">{inspectedUser.name}</h4>
                  <div className="text-xs text-slate-400 font-mono">@{inspectedUser.username || 'unknown'} • {inspectedUser.email}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-pixel uppercase font-bold ${
                  inspectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {inspectedUser.role}
                </span>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-pixel text-slate-400 font-bold uppercase">XP</div>
                  <div className="text-sm font-black text-amber-600 font-pixel mt-0.5">{inspectedUser.xp}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-pixel text-slate-400 font-bold uppercase">Level</div>
                  <div className="text-sm font-black text-purple-600 font-mono mt-0.5">Lvl {inspectedUser.level}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-pixel text-slate-400 font-bold uppercase">Streak</div>
                  <div className="text-sm font-black text-rose-500 font-pixel mt-0.5">{inspectedUser.streak} Days</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-pixel text-slate-400 font-bold uppercase">Submissions</div>
                  <div className="text-sm font-black text-emerald-600 font-mono mt-0.5">{inspectedUser.submissionsCount}</div>
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-600">Course Enrollments:</span>
                  <span className="font-bold text-slate-900">{inspectedUser.enrolledCount} active courses</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-600">Completed Lessons:</span>
                  <span className="font-bold text-emerald-700">{inspectedUser.completedLessonsCount} lessons solved</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-600">Completed Guided Projects:</span>
                  <span className="font-bold text-blue-700">{inspectedUser.completedProjectsCount} completed</span>
                </div>
                <div className="flex items-center justify-between font-medium text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  <span>Joined Platform:</span>
                  <span>{new Date(inspectedUser.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Role Management Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500 font-medium">
                  Modify Account Privileges:
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleUserRole(inspectedUser.id, inspectedUser.role)}
                  className={`px-3 py-1.5 rounded-xl font-pixel text-xs font-bold uppercase cursor-pointer transition-all ${
                    inspectedUser.role === 'admin'
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {inspectedUser.role === 'admin' ? 'Demote to Student' : 'Promote to Staff Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Real-Data Analytics KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GamifiedCard className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-pixel">
              {analytics?.totalLearners ?? learners.length}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Learners ({analytics?.totalStaff ?? 1} Staff)
            </div>
          </div>
        </GamifiedCard>

        <GamifiedCard className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-pixel">
              {analytics?.totalCourses ?? adminCourses.length} Courses
            </div>
            <div className="text-xs text-emerald-600 font-bold">
              {analytics?.totalLessonsCompleted ?? 0} Completed Lessons
            </div>
          </div>
        </GamifiedCard>

        <GamifiedCard className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-pixel">
              {analytics?.totalProjects ?? adminProjects.length} Projects
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {analytics?.totalShowcaseBuilds ?? 0} Showcase Builds
            </div>
          </div>
        </GamifiedCard>

        <GamifiedCard className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 font-pixel text-amber-600">
              {(analytics?.totalXpDistributed ?? 0).toLocaleString()} XP
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {analytics?.totalSubmissions ?? 0} Code Submissions
            </div>
          </div>
        </GamifiedCard>
      </div>

      {/* Main Admin Management Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-8">
        {/* Learning Paths & Courses Curriculum Studio */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">
                  Learning Content & Curriculum Studio
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Author & manage Languages, Island Paths, Courses, Chapters, and rich Markdown Lessons
              </p>
            </div>

            {/* Sub-Tabs Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-pixel uppercase font-bold">
              <button
                type="button"
                onClick={() => setCurriculumTab('courses')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  curriculumTab === 'courses'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Courses ({adminCourses.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCurriculumTab('languages')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  curriculumTab === 'languages'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Languages ({adminLanguages.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setCurriculumTab('paths')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  curriculumTab === 'paths'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Islands ({adminPaths.length})</span>
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* TAB 1: COURSES & CURRICULUM                          */}
          {/* ==================================================== */}
          {curriculumTab === 'courses' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase">Courses Catalog & Prerequisite Chains</div>
                <button
                  type="button"
                  onClick={() => setShowAddCourse(!showAddCourse)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-pixel uppercase transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{showAddCourse ? 'Close Form' : 'New Course'}</span>
                </button>
              </div>

              {/* Add Course Form */}
              {showAddCourse && (
                <form onSubmit={handleCreateCourse} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-bold font-pixel uppercase text-slate-900">Create New Course</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course Title</label>
                      <input
                        type="text"
                        required
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        placeholder="e.g. Master TypeScript Basics"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug</label>
                      <input
                        type="text"
                        value={courseSlug}
                        onChange={(e) => setCourseSlug(e.target.value)}
                        placeholder="master-typescript"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Track</label>
                      <input
                        type="text"
                        required
                        value={courseTrack}
                        onChange={(e) => setCourseTrack(e.target.value)}
                        placeholder="JavaScript"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                      <select
                        value={courseDifficulty}
                        onChange={(e) => setCourseDifficulty(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Language Association</label>
                      <select
                        value={courseLanguageId}
                        onChange={(e) => setCourseLanguageId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">-- None --</option>
                        {adminLanguages.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.icon} {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Island / Path Association</label>
                      <select
                        value={coursePathId}
                        onChange={(e) => setCoursePathId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">-- None --</option>
                        {adminPaths.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.icon || '🏝️'} {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prerequisite Course</label>
                      <select
                        value={coursePrereqId}
                        onChange={(e) => setCoursePrereqId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">-- No Prerequisite (Freely Unlocked) --</option>
                        {adminCourses.map((c) => (
                          <option key={c.course.id} value={c.course.id}>
                            {c.course.title} ({c.course.track})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                      placeholder="Provide an overview of what the student will learn in this quest..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCourse(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer"
                    >
                      Create Course
                    </button>
                  </div>
                </form>
              )}

              {/* Courses Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-pixel text-[10px] text-slate-400">
                      <th className="p-3">#</th>
                      <th className="p-3">COURSE</th>
                      <th className="p-3">TRACK / LANG</th>
                      <th className="p-3">DIFFICULTY</th>
                      <th className="p-3">PREREQUISITE</th>
                      <th className="p-3">CURRICULUM</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminCourses.map((cSummary, idx) => {
                      const prereqCourse = adminCourses.find((c) => c.course.id === cSummary.course.prerequisite_course_id)
                      return (
                        <tr key={cSummary.course.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{cSummary.course.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">/{cSummary.course.slug}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold bg-emerald-50 text-emerald-700">
                              {cSummary.course.track}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-600">{cSummary.course.difficulty}</td>
                          <td className="p-3">
                            {prereqCourse ? (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200">
                                Requires: {prereqCourse.course.title}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">None (Free)</span>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => setSelectedCourseForCurriculum(cSummary)}
                              className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-pixel text-[9px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Layers className="w-3 h-3" />
                              <span>Manage ({cSummary.chapters.length} Ch, {cSummary.totalLessons} Les)</span>
                            </button>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleTogglePublishCourse(cSummary)}
                              className={`px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold cursor-pointer ${
                                cSummary.course.is_published !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {cSummary.course.is_published !== false ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveCourse(cSummary.course.id, 'up')}
                                disabled={idx === 0}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveCourse(cSummary.course.id, 'down')}
                                disabled={idx === adminCourses.length - 1}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditCourse(cSummary)}
                                className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                                title="Edit Course"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCourse(cSummary.course.id)}
                                className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete Course"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: PROGRAMMING LANGUAGES                         */}
          {/* ==================================================== */}
          {curriculumTab === 'languages' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase">Available Languages Catalog</div>
                <button
                  type="button"
                  onClick={() => setShowAddLanguage(!showAddLanguage)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-pixel uppercase transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{showAddLanguage ? 'Close Form' : 'New Language'}</span>
                </button>
              </div>

              {/* Add Language Form */}
              {showAddLanguage && (
                <form onSubmit={handleCreateLanguage} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-bold font-pixel uppercase text-slate-900">Add Programming Language</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Language Name</label>
                      <input
                        type="text"
                        required
                        value={langName}
                        onChange={(e) => setLangName(e.target.value)}
                        placeholder="e.g. TypeScript"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug</label>
                      <input
                        type="text"
                        value={langSlug}
                        onChange={(e) => setLangSlug(e.target.value)}
                        placeholder="typescript"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Icon / Emoji</label>
                      <input
                        type="text"
                        value={langIcon}
                        onChange={(e) => setLangIcon(e.target.value)}
                        placeholder="🔷"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Theme Color</label>
                      <input
                        type="color"
                        value={langColor}
                        onChange={(e) => setLangColor(e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-200 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={langDesc}
                      onChange={(e) => setLangDesc(e.target.value)}
                      placeholder="Brief summary of language world and concepts..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddLanguage(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer"
                    >
                      Add Language
                    </button>
                  </div>
                </form>
              )}

              {/* Languages Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-pixel text-[10px] text-slate-400">
                      <th className="p-3">#</th>
                      <th className="p-3">LANGUAGE</th>
                      <th className="p-3">COLOR</th>
                      <th className="p-3">DESCRIPTION</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminLanguages.map((lang, idx) => (
                      <tr key={lang.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{lang.icon || '🐍'}</span>
                            <div>
                              <div className="font-bold text-slate-900">{lang.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">/{lang.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-200" style={{ backgroundColor: lang.color || '#10b981' }} />
                            <span className="font-mono text-[10px] text-slate-600">{lang.color}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">{lang.description || '(No description)'}</td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleTogglePublishLanguage(lang)}
                            className={`px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold cursor-pointer ${
                              lang.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {lang.is_published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveLanguage(lang.id, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveLanguage(lang.id, 'down')}
                              disabled={idx === adminLanguages.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditLanguage(lang)}
                              className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title="Edit Language"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLanguage(lang.id)}
                              className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Delete Language"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: LEARNING PATHS / ISLANDS                      */}
          {/* ==================================================== */}
          {curriculumTab === 'paths' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase">Islands & Learning Paths</div>
                <button
                  type="button"
                  onClick={() => setShowAddPath(!showAddPath)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-pixel uppercase transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{showAddPath ? 'Close Form' : 'New Island'}</span>
                </button>
              </div>

              {/* Add Path Form */}
              {showAddPath && (
                <form onSubmit={handleCreatePath} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-bold font-pixel uppercase text-slate-900">Create Island Learning Path</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Path Title</label>
                      <input
                        type="text"
                        required
                        value={pathTitle}
                        onChange={(e) => setPathTitle(e.target.value)}
                        placeholder="e.g. Web Developer Odyssey"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug</label>
                      <input
                        type="text"
                        value={pathSlug}
                        onChange={(e) => setPathSlug(e.target.value)}
                        placeholder="web-dev-odyssey"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Island Name</label>
                      <input
                        type="text"
                        value={pathIslandName}
                        onChange={(e) => setPathIslandName(e.target.value)}
                        placeholder="e.g. The Silicon Archipelago"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Icon / Emoji</label>
                      <input
                        type="text"
                        value={pathIcon}
                        onChange={(e) => setPathIcon(e.target.value)}
                        placeholder="🏝️"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Linked Language</label>
                      <select
                        value={pathLanguageId}
                        onChange={(e) => setPathLanguageId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                      >
                        <option value="">-- No Language Lock --</option>
                        {adminLanguages.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.icon} {l.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={pathDesc}
                      onChange={(e) => setPathDesc(e.target.value)}
                      placeholder="Comprehensive overview of this island pathway..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddPath(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-pixel uppercase font-bold cursor-pointer"
                    >
                      Create Island Path
                    </button>
                  </div>
                </form>
              )}

              {/* Paths Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-pixel text-[10px] text-slate-400">
                      <th className="p-3">#</th>
                      <th className="p-3">ISLAND / PATH</th>
                      <th className="p-3">LANGUAGE</th>
                      <th className="p-3">DESCRIPTION</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminPaths.map((p, idx) => {
                      const linkedLang = adminLanguages.find((l) => l.id === p.language_id)
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{p.icon || '🏝️'}</span>
                              <div>
                                <div className="font-bold text-slate-900">{p.title}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {p.island_name ? `${p.island_name} • ` : ''}/{p.slug}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {linkedLang ? (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                                {linkedLang.icon} {linkedLang.name}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">General</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs truncate">{p.description || '(No description)'}</td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleTogglePublishPath(p)}
                              className={`px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold cursor-pointer ${
                                p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {p.is_published ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleMovePath(p.id, 'up')}
                                disabled={idx === 0}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMovePath(p.id, 'down')}
                                disabled={idx === adminPaths.length - 1}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditPath(p)}
                                className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                                title="Edit Path"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePath(p.id)}
                                className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Delete Path"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Coding Exercises Authoring Studio */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">
                  Coding Exercises Authoring Studio
                </h3>
              </div>
              <p className="text-xs text-slate-500">Configure starter code, language syntax, instructions, and test cases for CodeDex exercises</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddExercise(!showAddExercise)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold font-pixel uppercase transition-all flex items-center gap-2 cursor-pointer w-fit"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showAddExercise ? 'Close Form' : 'New Exercise'}</span>
            </button>
          </div>

          {exerciseAlert && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{exerciseAlert}</span>
            </div>
          )}

          {showAddExercise && (
            <form onSubmit={handleCreateExercise} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 mb-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Exercise Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Array Summation Matrix"
                    value={exTitle}
                    onChange={(e) => setExTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Custom Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="auto-generated-if-blank"
                    value={exSlug}
                    onChange={(e) => setExSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Programming Language</label>
                  <select
                    value={exLanguage}
                    onChange={(e) => setExLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="html">HTML / Web Preview</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={exDifficulty}
                    onChange={(e) => setExDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">XP Reward</label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={exXpReward}
                    onChange={(e) => setExXpReward(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-amber-600 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Linked Lesson (Optional)</label>
                  <select
                    value={exLessonId}
                    onChange={(e) => setExLessonId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">-- Standalone Challenge --</option>
                    {adminLessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.course_title ? `${l.course_title} > ${l.title}` : l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instructions / Goal</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain the coding challenge objective..."
                  value={exInstructions}
                  onChange={(e) => setExInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Starter Code (Monaco Template)</label>
                <textarea
                  rows={4}
                  placeholder="// Starter code template loaded in student Monaco editor"
                  value={exStarterCode}
                  onChange={(e) => setExStarterCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sample Input / STDIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. [1, 2, 3]"
                    value={exSampleInput}
                    onChange={(e) => setExSampleInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hint (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Use reduce or a loop"
                    value={exHint}
                    onChange={(e) => setExHint(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Solution Code (Secure)</label>
                  <textarea
                    rows={2}
                    placeholder="// Reference solution code"
                    value={exSolutionCode}
                    onChange={(e) => setExSolutionCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Solution Explanation</label>
                  <textarea
                    rows={2}
                    placeholder="Brief explanation of solution"
                    value={exSolution}
                    onChange={(e) => setExSolution(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExercise(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-pixel uppercase rounded-xl cursor-pointer"
                >
                  Deploy Challenge 🚀
                </button>
              </div>
            </form>
          )}

          {/* Exercises Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-pixel text-[10px]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">CHALLENGE</th>
                  <th className="py-3 px-4">LINKED LESSON</th>
                  <th className="py-3 px-4">LANGUAGE</th>
                  <th className="py-3 px-4">DIFFICULTY</th>
                  <th className="py-3 px-4">XP</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {adminChallenges.map((ch, idx) => {
                  const matchedLesson = adminLessons.find((l) => l.id === ch.lesson_id)
                  const testCasesCount = exerciseTestCases.filter((t) => t.exercise_id === ch.id).length

                  return (
                    <tr key={ch.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{ch.order_index ?? idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ch.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">/{ch.slug}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {matchedLesson ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-medium truncate max-w-40 block">
                            {matchedLesson.title}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Standalone</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold bg-purple-100 text-purple-700">
                          {ch.language || ch.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{ch.difficulty}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-600">+{ch.xp_reward ?? 75} XP</td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublishExercise(ch)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            ch.is_published ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {ch.is_published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveChallenge(ch.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveChallenge(ch.id, 'down')}
                            disabled={idx === adminChallenges.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenTestCases(ch)}
                            className="p-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 text-purple-700 transition-colors cursor-pointer flex items-center gap-1 font-pixel text-[10px]"
                            title="Manage Test Cases"
                          >
                            <ListChecks className="w-3.5 h-3.5" />
                            <span>Tests ({testCasesCount})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditExercise(ch)}
                            className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit Challenge"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExercise(ch.id)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Exercise"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guided Projects Section */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">
                  Guided Projects Management
                </h3>
              </div>
              <p className="text-xs text-slate-500">Curate multi-step project blueprints for student portfolio showcases</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddProject(!showAddProject)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-pixel uppercase transition-all flex items-center gap-2 cursor-pointer w-fit"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showAddProject ? 'Close Form' : 'New Project'}</span>
            </button>
          </div>

          {projectAlert && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{projectAlert}</span>
            </div>
          )}

          {showAddProject && (
            <form onSubmit={handleCreateProject} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 mb-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chat App"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="chat-app"
                    value={projSlug}
                    onChange={(e) => setProjSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Web">Web</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="React">React</option>
                    <option value="Backend">Backend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={projDifficulty}
                    onChange={(e) => setProjDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Brief summary of the project goals..."
                  value={projDescription}
                  onChange={(e) => setProjDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instructions / Guidelines</label>
                <textarea
                  rows={2}
                  placeholder="Specific instructions or technical stack requirements..."
                  value={projInstructions}
                  onChange={(e) => setProjInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col gap-3">
                <span className="font-pixel text-xs font-bold text-slate-800 uppercase">Initial Milestone Step</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Step 1 Title (e.g. Initialize Repo & Layout)"
                    value={projStep1Title}
                    onChange={(e) => setProjStep1Title(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Step 1 Description"
                    value={projStep1Desc}
                    onChange={(e) => setProjStep1Desc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-pixel uppercase rounded-xl cursor-pointer"
                >
                  Deploy Project 🚀
                </button>
              </div>
            </form>
          )}

          {/* Projects Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-pixel text-[10px]">
                  <th className="py-3 px-4">PROJECT</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">DIFFICULTY</th>
                  <th className="py-3 px-4">STEPS</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {adminProjects.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold bg-blue-100 text-blue-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{p.difficulty}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.steps?.length || 0}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.is_published ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenProjectSteps(p)}
                          className="p-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-700 transition-colors cursor-pointer flex items-center gap-1 font-pixel text-[10px]"
                          title="Manage Project Steps"
                        >
                          <ListOrdered className="w-3.5 h-3.5" />
                          <span>Steps</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePublishProject(p)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                          title={p.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {p.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Community & Reports Moderation Section */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-5 h-5 text-rose-600" />
            <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">
              Community & Reports Moderation
            </h3>
          </div>

          {/* Reports Review Queue */}
          <div className="mb-6">
            <h4 className="font-pixel text-xs uppercase font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <span>Flagged Content Queue</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-100 text-rose-700 font-mono font-bold">
                {adminReports.filter((r) => r.status === 'pending').length} PENDING
              </span>
            </h4>

            {adminReports.length === 0 ? (
              <div className="p-5 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-pixel text-xs">
                NO FLAGGED REPORTS. ALL CLEAN! ✨
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-pixel text-[10px] text-slate-400">
                      <th className="p-3">REPORTER</th>
                      <th className="p-3">FLAGGED CONTENT</th>
                      <th className="p-3">REASON</th>
                      <th className="p-3">STATUS</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminReports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{rep.reporter_name}</td>
                        <td className="p-3 text-slate-700 max-w-xs truncate">{rep.target_content}</td>
                        <td className="p-3 text-rose-700 font-medium">{rep.reason}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold ${
                            rep.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : rep.status === 'reviewed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rep.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {rep.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleResolveReport(rep.id, 'reviewed')}
                                  className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[10px] font-pixel uppercase font-bold cursor-pointer"
                                >
                                  Resolve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolveReport(rep.id, 'dismissed')}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-pixel uppercase font-bold cursor-pointer"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Community Posts Moderation Roster */}
          <div>
            <h4 className="font-pixel text-xs uppercase font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Community Feed Items ({adminPosts.length})</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-pixel text-[10px] text-slate-400">
                    <th className="p-3">AUTHOR</th>
                    <th className="p-3">TYPE</th>
                    <th className="p-3">CONTENT</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right">MODERATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminPosts.slice(0, 15).map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">@{post.author_name}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-pixel uppercase font-bold bg-slate-100 text-slate-700">
                          {post.post_type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 max-w-sm truncate">{post.content}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold ${
                          post.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleModeratePost(post.id, post.status)}
                            className="p-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                            title={post.status === 'published' ? 'Hide Post' : 'Publish Post'}
                          >
                            {post.status === 'published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Learners Table */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h4 className="font-pixel text-xs uppercase font-bold text-slate-800">Learners & XP Leaderboard</h4>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search learners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-pixel text-[10px]">
                  <th className="py-3 px-4">LEARNER</th>
                  <th className="py-3 px-4">ROLE</th>
                  <th className="py-3 px-4">XP</th>
                  <th className="py-3 px-4">LEVEL</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">DOSSIER</th>
                </tr>
              </thead>
              <tbody>
                {filteredLearners.map((learner) => (
                  <tr key={learner.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{learner.name}</div>
                      <div className="text-[10px] text-slate-400">{learner.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold ${
                        learner.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {learner.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 font-pixel">{learner.xp} XP</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 font-mono">Lvl {learner.level}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{learner.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleInspectLearner(learner.id)}
                        disabled={loadingInspect}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 rounded-lg text-[10px] font-pixel uppercase font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform Audit Logs Section */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-600" />
              <h4 className="font-pixel text-xs uppercase font-bold text-slate-800">
                Administrative Operations & Audit Trail
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              {auditLogs.length} RECENT ACTIONS
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 font-pixel text-xs">
              NO ADMINISTRATIVE MUTATIONS RECORDED YET
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-pixel text-[10px] text-slate-400">
                    <th className="p-3">ADMIN OPERATOR</th>
                    <th className="p-3">ACTION</th>
                    <th className="p-3">TARGET ENTITY</th>
                    <th className="p-3">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800 font-mono">
                        {log.admin_name}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold bg-slate-100 text-slate-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">
                        {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}
                      </td>
                      <td className="p-3 text-slate-400 text-[10px] font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
