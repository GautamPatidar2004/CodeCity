import React, { useState } from 'react'
import type { ExecutionResult } from '../../lib/execution'
import type { TestCaseResult } from './TestCaseList'
import { TestCaseList } from './TestCaseList'

type ConsoleTab = 'output' | 'tests' | 'errors'

interface ExecutionConsoleProps {
  result: ExecutionResult | null
  isRunning: boolean
  tests: TestCaseResult[]
  executionTimeMs?: number
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  result, isRunning, tests, executionTimeMs,
}) => {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('output')

  const isError = result ? (result.status !== 'success') : false
  const hasOutput = Boolean(result?.stdout)
  const hasError = Boolean(result?.stderr)
  const allPassed = tests.length > 0 && tests.every((t) => t.passed)
  const passedCount = tests.filter((t) => t.passed).length

  return (
    <div className="flex flex-col h-full" style={{ background: '#080606' }}>
      {/* ── Execution Status Bar ────────────────────────────────── */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid #2A1414', background: '#070505' }}
      >
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FF3D00' }} />
              <span className="font-black uppercase"
                style={{ color: '#FF3D00', fontSize: '9px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.4 }}
              >
                CARVING RUNES...
              </span>
            </>
          ) : result ? (
            isError ? (
              <>
                <div className="w-2 h-2 rounded-full" style={{ background: '#DC2626' }} />
                <span className="font-black uppercase"
                  style={{ color: '#DC2626', fontSize: '9px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.4 }}
                >
                  ✕ RUNE SHATTERED
                </span>
              </>
            ) : allPassed ? (
              <>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00E5FF' }} />
                <span className="font-black uppercase"
                  style={{ color: '#00E5FF', fontSize: '9px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.4 }}
                >
                  ● VICTORY
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
                <span className="font-black uppercase"
                  style={{ color: '#F59E0B', fontSize: '9px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.4 }}
                >
                  RUNES CAST
                </span>
              </>
            )
          ) : (
            <>
              <div className="w-2 h-2 rounded-full" style={{ background: '#3D1C1C' }} />
              <span className="font-black uppercase"
                style={{ color: '#3D1C1C', fontSize: '9px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.4 }}
              >
                AWAITING STRIKE
              </span>
            </>
          )}
        </div>

        {/* Execution time */}
        {executionTimeMs !== undefined && !isRunning && result && (
          <span className="font-black tabular-nums"
            style={{ color: '#57534e', fontSize: '10px' }}
          >
            ⚡ {executionTimeMs}ms
          </span>
        )}
      </div>

      {/* ── Tab navigation ─────────────────────────────────────── */}
      <div className="flex items-center px-3 pt-2 gap-1 shrink-0"
        style={{ borderBottom: '1px solid #1c1010' }}
      >
        {([
          { key: 'output', label: 'OUTPUT' },
          { key: 'tests',  label: `TESTS ${tests.length > 0 ? `(${passedCount}/${tests.length})` : ''}` },
          { key: 'errors', label: 'ERROR LOG' },
        ] as { key: ConsoleTab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className="px-3 py-1.5 rounded-t-lg font-black uppercase transition-all"
            style={{
              fontSize: '8px',
              fontFamily: 'Press Start 2P, monospace',
              background: activeTab === key ? '#0D0909' : 'transparent',
              color: activeTab === key
                ? key === 'errors' && hasError ? '#DC2626'
                  : key === 'tests' && allPassed ? '#00E5FF'
                  : '#FF3D00'
                : '#3D1C1C',
              borderBottom: activeTab === key ? '2px solid #FF3D00' : '2px solid transparent',
              lineHeight: 1.4,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Content panels ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto crucible-scroll p-4">
        {/* OUTPUT TAB */}
        {activeTab === 'output' && (
          <div>
            {isRunning ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-8 h-8 rounded-full animate-pulse flex items-center justify-center"
                  style={{ background: 'rgba(255,61,0,0.15)', border: '1px solid rgba(255,61,0,0.3)' }}
                >
                  <span style={{ fontSize: '16px' }}>🔥</span>
                </div>
                <span style={{ color: '#57534e', fontSize: '10px' }}>Executing code...</span>
              </div>
            ) : hasOutput ? (
              <pre className="text-xs leading-relaxed overflow-x-auto"
                style={{
                  color: '#e2e8f0',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  lineHeight: '20px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {result?.stdout}
              </pre>
            ) : result ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span style={{ color: '#3D1C1C', fontSize: '10px' }}>No output produced.</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span style={{ fontSize: '28px' }}>⚔️</span>
                <span style={{ color: '#3D1C1C', fontSize: '9px', fontFamily: 'Press Start 2P, monospace', lineHeight: 1.6, textAlign: 'center' }}>
                  STRIKE TO EXECUTE
                </span>
              </div>
            )}
          </div>
        )}

        {/* TESTS TAB */}
        {activeTab === 'tests' && (
          <TestCaseList tests={tests} />
        )}

        {/* ERROR LOG TAB */}
        {activeTab === 'errors' && (
          <div>
            {isRunning ? (
              <div className="flex items-center justify-center py-8">
                <span style={{ color: '#57534e', fontSize: '10px' }}>Running...</span>
              </div>
            ) : hasError ? (
              <div className="rounded-lg p-3 overflow-x-auto"
                style={{
                  background: 'rgba(127,29,29,0.2)',
                  border: '1px solid rgba(153,27,27,0.5)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black uppercase" style={{ color: '#DC2626', fontSize: '9px' }}>
                    ✕ {result?.status?.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
                <pre className="text-xs leading-relaxed whitespace-pre-wrap break-words"
                  style={{
                    color: '#fca5a5',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    margin: 0,
                  }}
                >
                  {result?.stderr}
                </pre>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span style={{ fontSize: '24px' }}>✅</span>
                <span style={{ color: '#57534e', fontSize: '10px' }}>No errors detected.</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <span style={{ color: '#3D1C1C', fontSize: '10px' }}>Run your code to see error log.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
