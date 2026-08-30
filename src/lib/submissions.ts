import { supabase } from './supabase'
import { executeCode } from './execution'
import { recordChallengeSubmission } from './challenges'
import { recordLessonCompletion } from './learning'
import { awardXp } from './gamification'
import { recordUserActivity, createUserNotification, syncUserBadgesAndAchievements } from './achievements'

export interface ExerciseTestCase {
  id: string
  exercise_id: string
  input: string
  expected_output: string
  order_index: number
  is_hidden: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface TestCaseResult {
  testCaseId: string
  orderIndex: number
  isHidden: boolean
  passed: boolean
  input?: string
  expectedOutput?: string
  actualOutput?: string
  error?: string
}

export interface SubmissionResult {
  submissionId?: string
  status: 'passed' | 'failed' | 'execution_error' | 'timeout' | 'pending'
  passedCount: number
  totalCount: number
  testResults: TestCaseResult[]
  executionTimeMs?: number
}

export interface UserSubmissionRecord {
  id: string
  exercise_id: string
  language: string
  status: string
  passed_test_count: number
  total_test_count: number
  execution_time_ms?: number
  created_at: string
}

export async function fetchExerciseTestCases(
  exerciseId: string
): Promise<ExerciseTestCase[]> {
  try {
    const { data, error } = await supabase
      .from('exercise_test_cases')
      .select('*')
      .eq('exercise_id', exerciseId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error || !data) {
      return []
    }

    return data as ExerciseTestCase[]
  } catch (err) {
    console.error('Error fetching test cases:', err)
    return []
  }
}

export async function createAdminTestCase(
  testCase: Partial<ExerciseTestCase>
): Promise<ExerciseTestCase | null> {
  try {
    const { data, error } = await supabase
      .from('exercise_test_cases')
      .insert({
        exercise_id: testCase.exercise_id,
        input: testCase.input ?? '',
        expected_output: testCase.expected_output ?? '',
        order_index: testCase.order_index ?? 0,
        is_hidden: testCase.is_hidden ?? false,
        is_active: testCase.is_active ?? true,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating test case:', error)
      return null
    }

    return data as ExerciseTestCase
  } catch (err) {
    console.error('Error creating test case:', err)
    return null
  }
}

export async function updateAdminTestCase(
  id: string,
  updates: Partial<ExerciseTestCase>
): Promise<ExerciseTestCase | null> {
  try {
    const { data, error } = await supabase
      .from('exercise_test_cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      console.error('Error updating test case:', error)
      return null
    }

    return data as ExerciseTestCase
  } catch (err) {
    console.error('Error updating test case:', err)
    return null
  }
}

export async function deleteAdminTestCase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('exercise_test_cases').delete().eq('id', id)
    return !error
  } catch (err) {
    console.error('Error deleting test case:', err)
    return false
  }
}

function normalizeOutput(str: string): string {
  return str
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim()
}

export async function fetchUserExerciseSubmissions(
  userId: string,
  exerciseId: string
): Promise<UserSubmissionRecord[]> {
  try {
    const { data, error } = await supabase
      .from('exercise_submissions')
      .select('id, exercise_id, language, status, passed_test_count, total_test_count, execution_time_ms, created_at')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error || !data) {
      return []
    }

    return data as UserSubmissionRecord[]
  } catch (err) {
    console.error('Error fetching user submissions:', err)
    return []
  }
}

export async function submitExerciseSolution(
  userId: string,
  exerciseId: string,
  language: string,
  sourceCode: string
): Promise<SubmissionResult> {
  const startTime = Date.now()

  // 1. Fetch active test cases for this exercise
  const testCases = await fetchExerciseTestCases(exerciseId)

  // 2. Fetch challenge metadata to link course/lesson if applicable
  const { data: challengeData } = await supabase
    .from('challenges')
    .select('id, course_id, lesson_id, is_published')
    .eq('id', exerciseId)
    .maybeSingle()

  const testResults: TestCaseResult[] = []
  let overallStatus: SubmissionResult['status'] = 'passed'

  // If no test cases are in the DB, run once and check for clean execution
  if (testCases.length === 0) {
    const execRes = await executeCode(language, sourceCode, '', exerciseId)
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
    // Evaluate sequentially across each active test case
    for (const tc of testCases) {
      const execRes = await executeCode(language, sourceCode, tc.input, exerciseId)

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
  const executionTimeMs = Date.now() - startTime

  // 3. Record submission in exercise_submissions
  let submissionId: string | undefined
  try {
    const { data: subData } = await supabase
      .from('exercise_submissions')
      .insert({
        user_id: userId,
        exercise_id: exerciseId,
        submitted_code: sourceCode,
        language,
        status: overallStatus,
        passed_test_count: passedCount,
        total_test_count: totalCount,
        test_results: testResults,
        execution_time_ms: executionTimeMs,
      })
      .select('id')
      .single()

    submissionId = subData?.id
  } catch (err) {
    console.error('Error recording exercise submission:', err)
  }

  // 4. If all tests passed, update challenge and lesson progress idempotently
  if (overallStatus === 'passed') {
    await recordChallengeSubmission(userId, exerciseId, true, 100)

    // Idempotently award 75 XP for coding challenge
    const chalXp = await awardXp(userId, 75, 'challenge_completed', exerciseId)
    if (chalXp.awarded) {
      await recordUserActivity(userId, 'challenge_completed', 'Solved a coding challenge (+75 XP) ⭐')
      await createUserNotification(
        userId,
        'Challenge Conquered! ⭐',
        'You solved all test cases for this coding challenge and earned 75 XP!',
        '🏆'
      )
      await syncUserBadgesAndAchievements(userId)
    }

    if (challengeData?.course_id && challengeData?.lesson_id) {
      await recordLessonCompletion(userId, challengeData.course_id, challengeData.lesson_id, true)
    }
  }

  return {
    submissionId,
    status: overallStatus,
    passedCount,
    totalCount,
    testResults,
    executionTimeMs,
  }
}

export async function fetchAdminSubmissions(exerciseId?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('exercise_submissions')
      .select(`
        id,
        user_id,
        exercise_id,
        language,
        status,
        passed_test_count,
        total_test_count,
        execution_time_ms,
        created_at,
        profiles (
          full_name,
          username,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId)
    }

    const { data, error } = await query
    if (error || !data) return []
    return data
  } catch (err) {
    console.error('Error fetching admin submissions:', err)
    return []
  }
}
