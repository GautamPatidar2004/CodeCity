import React, { useRef, useCallback } from 'react'
import { RotateCcw, Play, Loader2 } from 'lucide-react'

const LANG_EXT: Record<string, string> = {
  python: 'py',
  javascript: 'js',
  typescript: 'ts',
  java: 'java',
  'c++': 'cpp',
  cpp: 'cpp',
  go: 'go',
  rust: 'rs',
}

const LANG_COLORS: Record<string, string> = {
  python: '#3B82F6',
  javascript: '#F59E0B',
  typescript: '#38BDF8',
  java: '#F97316',
  cpp: '#A78BFA',
  default: '#FF3D00',
}

function getTokenColor(token: string, type: string): string {
  const keywords = ['def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'print', 'function', 'const', 'let', 'var', 'new', 'this', 'console', 'log']
  if (keywords.includes(token)) return '#FF5722'
  return '#e2e8f0'
}

interface CodeEditorPaneProps {
  code: string
  language: string
  isRunning: boolean
  onCodeChange: (code: string) => void
  onRun: () => void
  onReset: () => void
}

export const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  code, language, isRunning, onCodeChange, onRun, onReset,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineScrollRef = useRef<HTMLDivElement>(null)

  const ext = LANG_EXT[language?.toLowerCase()] ?? 'py'
  const langColor = LANG_COLORS[language?.toLowerCase()] ?? LANG_COLORS.default
  const lines = code.split('\n')
  const lineCount = lines.length

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const s = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const next = code.substring(0, s) + '    ' + code.substring(end)
      onCodeChange(next)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = s + 4
          textareaRef.current.selectionEnd = s + 4
        }
      }, 0)
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const s = e.currentTarget.selectionStart
      const lineStart = code.lastIndexOf('\n', s - 1) + 1
      const currentLine = code.substring(lineStart, s)
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? ''
      const extraIndent = currentLine.trimEnd().endsWith(':') ? '    ' : ''
      const ins = '\n' + indent + extraIndent
      const next = code.substring(0, s) + ins + code.substring(s)
      onCodeChange(next)
      setTimeout(() => {
        if (textareaRef.current) {
          const pos = s + ins.length
          textareaRef.current.selectionStart = pos
          textareaRef.current.selectionEnd = pos
        }
      }, 0)
    }
  }, [code, onCodeChange])

  const syncScroll = () => {
    if (lineScrollRef.current && textareaRef.current) {
      lineScrollRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#070505' }}>
      {/* ── Window Chrome ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ background: '#070505', borderBottom: '1px solid #2A1414' }}
      >
        {/* File tab */}
        <div className="flex items-center gap-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-t-lg"
            style={{
              background: '#0D0909',
              border: '1px solid #2A1414',
              borderBottom: '1px solid #0D0909',
              marginBottom: '-1px',
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: langColor }} />
            <span className="font-black text-xs" style={{ color: '#c4b5a5', fontSize: '11px' }}>
              main.{ext}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all hover:opacity-80 active:scale-[0.97]"
            style={{
              color: '#78716c',
              border: '1px solid #3D1C1C',
              background: 'transparent',
              fontSize: '11px',
            }}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Rune</span>
          </button>

          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-60"
            style={{
              background: isRunning
                ? '#3D1C1C'
                : 'linear-gradient(135deg, #B91C1C 0%, #EA580C 50%, #D97706 100%)',
              boxShadow: isRunning ? 'none' : '0 0 20px rgba(220,38,38,0.5), 0 4px 12px rgba(0,0,0,0.4)',
              fontSize: '10px',
              border: '1px solid rgba(255,61,0,0.3)',
            }}
          >
            {isRunning ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>CARVING...</span></>
            ) : (
              <><span>⚔</span><span>STRIKE</span></>
            )}
          </button>
        </div>
      </div>

      {/* ── Editor body ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative" style={{ background: '#0D0909' }}>
        {/* Line numbers gutter */}
        <div
          ref={lineScrollRef}
          className="select-none overflow-hidden shrink-0"
          style={{
            width: '44px',
            background: '#080606',
            borderRight: '1px solid #1c1010',
            paddingTop: '16px',
            paddingBottom: '16px',
            overflowY: 'hidden',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}
              className="text-right pr-3 leading-[1.6] text-xs tabular-nums"
              style={{ color: '#7F1D1D', fontSize: '12px', lineHeight: '20px' }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => {
            onCodeChange(e.target.value)
            syncScroll()
          }}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          className="flex-1 resize-none outline-none bg-transparent leading-5 py-4 px-4 font-mono"
          style={{
            color: '#e2e8f0',
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            fontSize: '13px',
            lineHeight: '20px',
            caretColor: '#FF3D00',
            tabSize: 4,
          }}
        />

        {/* Magma caret glow overlay (decorative) */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(255,61,0,0.02) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* ── Status bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-1 shrink-0"
        style={{ background: '#070505', borderTop: '1px solid #1c1010' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: '#3D1C1C', fontSize: '10px' }}>
            {language?.toUpperCase() ?? 'UNKNOWN'}
          </span>
          <span style={{ color: '#1c1010', fontSize: '10px' }}>•</span>
          <span style={{ color: '#3D1C1C', fontSize: '10px' }}>
            {lineCount} lines
          </span>
        </div>
        <span style={{ color: '#3D1C1C', fontSize: '10px' }}>
          THE CRUCIBLE
        </span>
      </div>
    </div>
  )
}
