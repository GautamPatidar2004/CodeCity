import React, { useEffect, useRef, useState, useCallback } from 'react'

/**
 * BladeOfChaosCursor — The Crucible's custom interactive cursor.
 * Models the iconic God of War Blade of Chaos silhouette.
 * Strictly a visual presentation component — no backend interaction.
 */

type CursorState = 'idle' | 'hover' | 'click'

const BLADE_SIZE = 44

export const BladeOfChaosCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [state, setCursorState] = useState<CursorState>('idle')
  const animRef = useRef<number | null>(null)
  const targetPos = useRef({ x: -200, y: -200 })
  const currentPos = useRef({ x: -200, y: -200 })

  // Smooth interpolation — the blade chases the pointer
  const animate = useCallback(() => {
    const lerp = 0.18
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerp
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerp
    setPos({ x: currentPos.current.x, y: currentPos.current.y })
    animRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY }
    }

    const onEnterInteractive = () => setCursorState('hover')
    const onLeaveInteractive = () => setCursorState('idle')

    const onMouseDown = () => {
      setCursorState('click')
      setTimeout(() => setCursorState('idle'), 170)
    }
    const onMouseUp = () => setCursorState('idle')

    // Detect hover targets
    const attachHoverListeners = () => {
      const interactives = document.querySelectorAll(
        'button, a, [role="button"], label, select, input, textarea, [data-cursor="pointer"]'
      )
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', onEnterInteractive)
        el.addEventListener('mouseleave', onLeaveInteractive)
      })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    animRef.current = requestAnimationFrame(animate)

    // Attach on mount + MutationObserver for dynamic elements
    attachHoverListeners()
    const observer = new MutationObserver(attachHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      if (animRef.current) cancelAnimationFrame(animRef.current)
      observer.disconnect()
    }
  }, [animate])

  // Derived transform values per cursor state
  const rotation = state === 'click' ? -80 : state === 'hover' ? -30 : -50
  const scale = state === 'click' ? 1.5 : state === 'hover' ? 1.35 : 1
  const glowIntensity = state === 'click' ? '0 0 28px #FF2A00, 0 0 48px rgba(220,38,38,0.85)' :
                        state === 'hover' ? '0 0 18px #FF2A00, 0 0 32px rgba(220,38,38,0.6)' :
                        '0 0 10px rgba(220,38,38,0.4)'

  const transitionDuration = state === 'click' ? '70ms' : '180ms'

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: BLADE_SIZE,
        height: BLADE_SIZE,
        transform: `translate(-6px, -6px) rotate(${rotation}deg) scale(${scale})`,
        transition: `transform ${transitionDuration} cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        pointerEvents: 'none',
        zIndex: 99999,
        filter: `drop-shadow(${glowIntensity})`,
        willChange: 'transform, left, top',
      }}
    >
      <svg
        viewBox="0 0 44 80"
        width={BLADE_SIZE}
        height={BLADE_SIZE * 1.82}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── CHAIN LINK 1 (hanging below grip) ── */}
        <ellipse cx="22" cy="77" rx="3.5" ry="2" fill="none" stroke="#8A8A8A" strokeWidth="1.2" opacity="0.7" />
        <ellipse cx="22" cy="73" rx="2" ry="3.5" fill="none" stroke="#8A8A8A" strokeWidth="1.2" opacity="0.7" />

        {/* ── LEATHER GRIP ── */}
        <rect x="18.5" y="55" width="7" height="16" rx="2" fill="#3A2010" />
        {/* Grip wrapping bands */}
        {[57, 60, 63, 66, 69].map((y) => (
          <line key={y} x1="18.5" y1={y} x2="25.5" y2={y} stroke="#5A3018" strokeWidth="1.2" />
        ))}
        {/* Grip highlight */}
        <rect x="19.5" y="55" width="2" height="16" rx="1" fill="rgba(255,255,255,0.06)" />

        {/* ── CROSSGUARD / DEMONIC GUARD ── */}
        <path d="M10 54 Q12 51 22 52 Q32 51 34 54 L32 57 Q22 58.5 12 57 Z" fill="#1E1715" />
        <path d="M10 54 Q12 51 22 52 Q32 51 34 54" stroke="#C59B27" strokeWidth="0.8" opacity="0.5" fill="none" />
        {/* Guard detail wings */}
        <path d="M10 54 L6 50 L10 56Z" fill="#2A1E1A" />
        <path d="M34 54 L38 50 L34 56Z" fill="#2A1E1A" />
        {/* Gem eye in center of crossguard */}
        <ellipse cx="22" cy="55" rx="3.5" ry="2.5" fill="#FF1E00" />
        <ellipse cx="22" cy="55" rx="2" ry="1.4" fill="#FF6040" />
        <ellipse cx="21" cy="54.4" rx="0.7" ry="0.5" fill="rgba(255,255,255,0.6)" />
        {/* Gem glow ring */}
        <ellipse cx="22" cy="55" rx="4" ry="3" fill="none" stroke="rgba(255,30,0,0.5)" strokeWidth="0.8">
          <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </ellipse>

        {/* ── BLADE SPINE (dark iron core) ── */}
        <path
          d="M19.5 54 L16 30 L15 12 L22 2 L29 12 L28 30 L24.5 54Z"
          fill="#1E1715"
        />

        {/* ── BLADE EDGE (oxidized bronze gradient right side) ── */}
        <path
          d="M24.5 54 L28 30 L29 12 L22 2 L34 28 L32 48Z"
          fill="url(#bronzeEdge)"
        />

        {/* ── BLADE EDGE (left beveled face) ── */}
        <path
          d="M19.5 54 L16 30 L15 12 L22 2 L10 28 L12 48Z"
          fill="url(#ironFace)"
        />

        {/* ── SERRATED UNDER-HOOK (bottom of blade) ── */}
        <path
          d="M19.5 54 L12 48 L10 52 L13 55 L10 57 L14 59 L19 57Z"
          fill="#1E1715"
          stroke="#C59B27"
          strokeWidth="0.6"
          opacity="0.8"
        />
        <path
          d="M24.5 54 L32 48 L34 52 L31 55 L34 57 L30 59 L25 57Z"
          fill="#1E1715"
          stroke="#C59B27"
          strokeWidth="0.6"
          opacity="0.8"
        />

        {/* ── MOLTEN RUNES along the spine ── */}
        {[20, 30, 40].map((y, i) => (
          <line
            key={i}
            x1="21"
            y1={y}
            x2="23"
            y2={y + 6}
            stroke="#FF4400"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.7"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.4;1;0.4"
              dur={`${1.2 + i * 0.4}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}

        {/* Blade tip highlight */}
        <circle cx="22" cy="3" r="1.5" fill="rgba(197,155,39,0.6)" />

        {/* ── SVG GRADIENT DEFS ── */}
        <defs>
          <linearGradient id="bronzeEdge" x1="22" y1="2" x2="34" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C59B27" />
            <stop offset="60%" stopColor="#784E10" />
            <stop offset="100%" stopColor="#3A2010" />
          </linearGradient>
          <linearGradient id="ironFace" x1="22" y1="2" x2="10" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3A3030" />
            <stop offset="50%" stopColor="#1E1715" />
            <stop offset="100%" stopColor="#100C0A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
