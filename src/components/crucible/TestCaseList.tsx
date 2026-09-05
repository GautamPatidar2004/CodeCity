import React from 'react'

export interface TestCaseResult {
  index: number
  label: string
  passed: boolean
  expected?: string
  actual?: string
}

interface TestCaseListProps {
  tests: TestCaseResult[]
}

export const TestCaseList: React.FC<TestCaseListProps> = ({ tests }) => {
  if (!tests.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <span style={{ fontSize: '28px' }}>⚗️</span>
        <p className="font-black uppercase" style={{ color: '#2a1010', fontSize: '8px', fontFamily: 'Press Start 2P, monospace' }}>
          AWAIT THE STRIKE
        </p>
      </div>
    )
  }

  const passed = tests.filter((t) => t.passed).length
  const total = tests.length
  const allPassed = passed === total

  return (
    <div className="flex flex-col gap-3">
      {/* Summary pill */}
      <div className="flex items-center justify-center py-2 px-4 rounded-xl"
        style={{
          background: allPassed
            ? 'rgba(0,229,255,0.08)'
            : passed > 0
            ? 'rgba(220,38,38,0.1)'
            : 'rgba(28,16,16,0.8)',
          border: allPassed
            ? '1px solid rgba(0,229,255,0.25)'
            : '1px solid #3D1C1C',
        }}
      >
        <span className="font-black"
          style={{
            color: allPassed ? '#00E5FF' : '#DC2626',
            fontSize: '11px',
            fontFamily: 'Press Start 2P, monospace',
            lineHeight: 1.6,
          }}
        >
          {passed} / {total} TESTS SLASHED
        </span>
      </div>

      {/* Individual test cases */}
      <div className="flex flex-col gap-2">
        {tests.map((tc) => (
          <div key={tc.index}
            className="rounded-xl overflow-hidden"
            style={{
              border: tc.passed
                ? '1px solid rgba(0,229,255,0.25)'
                : '1px solid rgba(220,38,38,0.3)',
              background: tc.passed
                ? 'rgba(0,229,255,0.04)'
                : 'rgba(220,38,38,0.06)',
            }}
          >
            {/* Test header */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: tc.passed
                    ? 'rgba(0,229,255,0.15)'
                    : 'rgba(220,38,38,0.2)',
                  border: tc.passed
                    ? '1px solid rgba(0,229,255,0.4)'
                    : '1px solid rgba(220,38,38,0.5)',
                }}
              >
                <span style={{
                  fontSize: '10px',
                  color: tc.passed ? '#00E5FF' : '#DC2626',
                  fontWeight: 900,
                }}>
                  {tc.passed ? '✓' : '✕'}
                </span>
              </div>
              <span className="flex-1 font-bold text-xs"
                style={{ color: tc.passed ? '#c4b5a5' : '#f87171', fontSize: '11px' }}
              >
                Test Case {tc.index + 1}{tc.label ? `: ${tc.label}` : ''}
              </span>
              <span className="font-black text-xs"
                style={{
                  color: tc.passed ? '#00E5FF' : '#DC2626',
                  fontSize: '9px',
                }}
              >
                {tc.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>

            {/* Diff output for failed tests */}
            {!tc.passed && (tc.expected || tc.actual) && (
              <div className="px-3 pb-3 flex flex-col gap-1.5">
                {tc.expected !== undefined && (
                  <div className="flex gap-2 items-start">
                    <span className="font-black shrink-0" style={{ color: '#00E5FF', fontSize: '9px', width: '60px' }}>EXPECTED</span>
                    <pre className="text-xs flex-1 overflow-x-auto"
                      style={{ color: '#86efac', fontFamily: 'JetBrains Mono, monospace', margin: 0, fontSize: '11px' }}
                    >{tc.expected}</pre>
                  </div>
                )}
                {tc.actual !== undefined && (
                  <div className="flex gap-2 items-start">
                    <span className="font-black shrink-0" style={{ color: '#DC2626', fontSize: '9px', width: '60px' }}>ACTUAL</span>
                    <pre className="text-xs flex-1 overflow-x-auto"
                      style={{ color: '#fca5a5', fontFamily: 'JetBrains Mono, monospace', margin: 0, fontSize: '11px' }}
                    >{tc.actual}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
