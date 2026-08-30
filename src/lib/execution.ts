import { supabase } from './supabase'

export interface ExecutionResult {
  status: 'success' | 'compile_error' | 'runtime_error' | 'timeout' | 'error'
  stdout: string
  stderr: string
  exit_code?: number
  execution_time?: number
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

function runJavaScriptInSandbox(sourceCode: string): ExecutionResult {
  const startTime = Date.now()
  const logs: string[] = []
  const errs: string[] = []

  try {
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map((a) => {
          if (typeof a === 'object' && a !== null) {
            try { return JSON.stringify(a) } catch { return String(a) }
          }
          return String(a)
        }).join(' '))
      },
      error: (...args: any[]) => {
        errs.push(args.map((a) => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
      },
      warn: (...args: any[]) => {
        logs.push(args.map((a) => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
      },
      info: (...args: any[]) => {
        logs.push(args.map((a) => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
      },
    }

    const runner = new Function('console', `"use strict";\n${sourceCode}`)
    runner(customConsole)

    const isRuntimeErr = errs.length > 0 && logs.length === 0
    return {
      status: isRuntimeErr ? 'runtime_error' : 'success',
      stdout: logs.join('\n'),
      stderr: errs.join('\n'),
      exit_code: isRuntimeErr ? 1 : 0,
      execution_time: Date.now() - startTime,
    }
  } catch (err: any) {
    return {
      status: 'runtime_error',
      stdout: logs.join('\n'),
      stderr: err?.message || String(err),
      exit_code: 1,
      execution_time: Date.now() - startTime,
    }
  }
}

export async function executeCode(
  language: string,
  sourceCode: string,
  stdin: string = '',
  exerciseId?: string
): Promise<ExecutionResult> {
  const cleanLang = language.trim().toLowerCase()

  if (!sourceCode.trim()) {
    return {
      status: 'error',
      stdout: '',
      stderr: 'Cannot execute empty source code.',
    }
  }

  // HTML / CSS preview mode
  if (cleanLang === 'html' || cleanLang === 'css') {
    return {
      status: 'success',
      stdout: 'HTML/CSS rendered in sandboxed preview.',
      stderr: '',
      exit_code: 0,
    }
  }

  // JavaScript native browser sandboxed execution (0ms network latency, 100% reliable)
  if (cleanLang === 'javascript' || cleanLang === 'js') {
    return runJavaScriptInSandbox(sourceCode)
  }

  const langConfig = SUPPORTED_LANGUAGES[cleanLang]
  if (!langConfig) {
    return {
      status: 'error',
      stdout: '',
      stderr: `Unsupported language "${language}". Supported: Python, JavaScript, C++, Java, HTML/CSS.`,
    }
  }

  // 1. Attempt execution via Supabase Edge Function if available
  try {
    const { data, error } = await supabase.functions.invoke('execute-code', {
      body: {
        language: cleanLang,
        source_code: sourceCode,
        stdin,
        exercise_id: exerciseId,
      },
    })

    if (!error && data && data.status) {
      return data as ExecutionResult
    }
  } catch {
    // Edge function not reachable, proceed to external provider
  }

  // 2. Direct isolated provider execution
  try {
    const startTime = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: sourceCode }],
        stdin,
        run_timeout: 10000,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    const elapsed = Date.now() - startTime

    if (res.ok) {
      const payload = await res.json()
      const compile = payload.compile
      const run = payload.run

      if (compile && compile.code !== 0) {
        return {
          status: 'compile_error',
          stdout: compile.stdout || '',
          stderr: compile.stderr || compile.output || 'Compilation failed.',
          exit_code: compile.code,
          execution_time: elapsed,
        }
      }

      if (run && (run.signal === 'SIGKILL' || run.signal === 'SIGTERM')) {
        return {
          status: 'timeout',
          stdout: run.stdout || '',
          stderr: 'Execution timed out (process exceeded 10-second limit).',
          exit_code: 124,
          execution_time: elapsed,
        }
      }

      const isRuntimeErr = Boolean(run && run.code !== 0)
      return {
        status: isRuntimeErr ? 'runtime_error' : 'success',
        stdout: run?.stdout || (isRuntimeErr ? '' : run?.output || ''),
        stderr: run?.stderr || (isRuntimeErr ? run?.output || '' : ''),
        exit_code: run?.code ?? 0,
        execution_time: elapsed,
      }
    }
  } catch {
    // Provider error
  }

    return {
      status: 'error',
      stdout: '',
      stderr: 'Code execution is temporarily unavailable. Please try again.',
    }
  }
