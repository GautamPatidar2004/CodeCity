// Supabase Edge Function: Multi-Language Code Execution
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPPORTED_LANGUAGES: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  py: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  js: { language: 'javascript', version: '18.15.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  'c++': { language: 'c++', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
}

const MAX_SOURCE_BYTES = 64 * 1024 // 64 KB
const MAX_INPUT_BYTES = 8 * 1024 // 8 KB
const EXECUTION_TIMEOUT_MS = 10000 // 10s

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          status: 'error',
          stderr: 'Unauthorized. Authentication token required for code execution.',
        }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const payload = await req.json()
    const { language, source_code, stdin } = payload

    if (!language || typeof language !== 'string') {
      return new Response(
        JSON.stringify({ status: 'error', stderr: 'Missing or invalid language parameter.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    if (!source_code || typeof source_code !== 'string') {
      return new Response(
        JSON.stringify({ status: 'error', stderr: 'Source code cannot be empty.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const sourceBytes = new TextEncoder().encode(source_code).length
    if (sourceBytes > MAX_SOURCE_BYTES) {
      return new Response(
        JSON.stringify({ status: 'error', stderr: `Source code exceeds payload limit (${MAX_SOURCE_BYTES / 1024} KB).` }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const inputBytes = stdin ? new TextEncoder().encode(stdin).length : 0
    if (inputBytes > MAX_INPUT_BYTES) {
      return new Response(
        JSON.stringify({ status: 'error', stderr: `Input exceeds payload limit (${MAX_INPUT_BYTES / 1024} KB).` }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const normalizedLang = language.trim().toLowerCase()

    // HTML/CSS client preview bypass
    if (normalizedLang === 'html' || normalizedLang === 'css') {
      return new Response(
        JSON.stringify({
          status: 'success',
          stdout: 'HTML/CSS rendered successfully in the sandboxed preview.',
          stderr: '',
          exit_code: 0,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const langConfig = SUPPORTED_LANGUAGES[normalizedLang]
    if (!langConfig) {
      return new Response(
        JSON.stringify({
          status: 'error',
          stderr: `Unsupported language "${language}". Supported: Python, JavaScript, C++, Java, HTML/CSS.`,
        }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS)

    const startTime = Date.now()

    const pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: source_code }],
        stdin: typeof stdin === 'string' ? stdin : '',
        run_timeout: EXECUTION_TIMEOUT_MS,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    const elapsedMs = Date.now() - startTime

    if (!pistonRes.ok) {
      return new Response(
        JSON.stringify({
          status: 'error',
          stderr: 'Execution provider error. Please try again.',
          execution_time: elapsedMs,
        }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const result = await pistonRes.json()
    const compile = result.compile
    const run = result.run

    if (compile && compile.code !== 0) {
      return new Response(
        JSON.stringify({
          status: 'compile_error',
          stdout: compile.stdout || '',
          stderr: compile.stderr || compile.output || 'Compilation failed.',
          exit_code: compile.code,
          execution_time: elapsedMs,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    if (run && (run.signal === 'SIGKILL' || run.signal === 'SIGTERM')) {
      return new Response(
        JSON.stringify({
          status: 'timeout',
          stdout: run.stdout || '',
          stderr: 'Execution timed out (process exceeded time limit).',
          exit_code: run.code ?? 124,
          execution_time: elapsedMs,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const isRuntimeError = run && run.code !== 0
    return new Response(
      JSON.stringify({
        status: isRuntimeError ? 'runtime_error' : 'success',
        stdout: run?.stdout || (isRuntimeError ? '' : run?.output || ''),
        stderr: run?.stderr || (isRuntimeError ? run?.output || '' : ''),
        exit_code: run?.code ?? 0,
        execution_time: elapsedMs,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return new Response(
        JSON.stringify({
          status: 'timeout',
          stdout: '',
          stderr: 'Execution request timed out after 10 seconds.',
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        status: 'error',
        stdout: '',
        stderr: 'An error occurred during code execution.',
      }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
