import React, { useEffect, useRef, useState, useCallback } from 'react'

/**
 * BladeOfOlympusCursor — The Crucible's interactive cursor.
 * Faithfully recreates the Blade of Olympus from God of War —
 * a straight divine sword with ornate golden crossguard,
 * blue-white divine energy, and full rune detailing.
 *
 * Strictly a visual presentation component — no backend logic.
 */

type CursorState = 'idle' | 'hover' | 'click'

const BLADE_W = 38
const BLADE_H = 110

export const BladeOfChaosCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -300, y: -300 })
  const [state, setCursorState] = useState<CursorState>('idle')
  const animRef = useRef<number | null>(null)
  const targetPos = useRef({ x: -300, y: -300 })
  const currentPos = useRef({ x: -300, y: -300 })

  // Smooth interpolation — blade glides toward the pointer
  const animate = useCallback(() => {
    const lerp = 0.16
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

    const attachHoverListeners = () => {
      document
        .querySelectorAll('button, a, [role="button"], label, select, input, textarea, [data-cursor="pointer"]')
        .forEach((el) => {
          el.addEventListener('mouseenter', onEnterInteractive)
          el.addEventListener('mouseleave', onLeaveInteractive)
        })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    animRef.current = requestAnimationFrame(animate)

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

  // State-driven transforms
  // Idle: tip points down-right at ~-45deg (blade pointing toward cursor hotspot)
  // Hover: tilts to ~-30deg, grows, glow intensifies
  // Click: stabs straight down at -60deg, snaps large
  const rotation = state === 'click' ? -65 : state === 'hover' ? -30 : -45
  const scale    = state === 'click' ? 1.45 : state === 'hover' ? 1.3 : 1.0
  const dur      = state === 'click' ? '65ms' : '200ms'

  // Divine glow color shifts with state
  const glowColor = state === 'click'
    ? '0 0 0 2px rgba(147,197,253,0.9), 0 0 20px rgba(96,165,250,1), 0 0 45px rgba(59,130,246,0.85), 0 0 80px rgba(37,99,235,0.5)'
    : state === 'hover'
    ? '0 0 0 1px rgba(147,197,253,0.6), 0 0 14px rgba(96,165,250,0.9), 0 0 30px rgba(59,130,246,0.6)'
    : '0 0 8px rgba(96,165,250,0.45), 0 0 18px rgba(59,130,246,0.25)'

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: BLADE_W,
        height: BLADE_H,
        // Anchor: tip of the blade sits exactly at the cursor hotspot (x: 19, y: 2)
        transform: `translate(-${BLADE_W * 0.5}px, -2px) rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: `${BLADE_W * 0.5}px 2px`,
        transition: `transform ${dur} cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        pointerEvents: 'none',
        zIndex: 99999,
        filter: `drop-shadow(${glowColor})`,
        willChange: 'transform, left, top',
      }}
    >
      <svg
        viewBox="0 0 38 110"
        width={BLADE_W}
        height={BLADE_H}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ── Gold gradient for metalwork ── */}
          <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#5C3D0A" />
            <stop offset="20%"  stopColor="#C59B27" />
            <stop offset="45%"  stopColor="#F5D060" />
            <stop offset="60%"  stopColor="#E8B824" />
            <stop offset="80%"  stopColor="#C59B27" />
            <stop offset="100%" stopColor="#5C3D0A" />
          </linearGradient>

          {/* ── Gold edge for crossguard ── */}
          <linearGradient id="goldEdge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#F5D060" />
            <stop offset="50%"  stopColor="#C59B27" />
            <stop offset="100%" stopColor="#784E10" />
          </linearGradient>

          {/* ── Left blade face (catches light) ── */}
          <linearGradient id="bladeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#0A1628" />
            <stop offset="30%"  stopColor="#1E3A5F" />
            <stop offset="60%"  stopColor="#2D5A8E" />
            <stop offset="100%" stopColor="#19294A" />
          </linearGradient>

          {/* ── Right blade face ── */}
          <linearGradient id="bladeRight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#19294A" />
            <stop offset="40%"  stopColor="#2D5A8E" />
            <stop offset="75%"  stopColor="#1E3A5F" />
            <stop offset="100%" stopColor="#0A1628" />
          </linearGradient>

          {/* ── Fuller divine energy glow ── */}
          <linearGradient id="divineFuller" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#93C5FD" stopOpacity="0.9" />
            <stop offset="40%"  stopColor="#60A5FA" stopOpacity="0.7" />
            <stop offset="80%"  stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.2" />
          </linearGradient>

          {/* ── Pommel gradient ── */}
          <radialGradient id="pommelGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#F5D060" />
            <stop offset="50%"  stopColor="#C59B27" />
            <stop offset="100%" stopColor="#3A2010" />
          </radialGradient>

          {/* ── Divine energy filter ── */}
          <filter id="divineGlow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* ── Clip path for blade shape ── */}
          <clipPath id="bladeClip">
            <path d="M19 2 L24 42 L19 44 L14 42 Z" />
          </clipPath>
        </defs>

        {/* ════════════════════════════════════
            POMMEL (bottom, ornate spherical)
        ════════════════════════════════════ */}
        {/* Outer pommel ring */}
        <ellipse cx="19" cy="103" rx="7" ry="5" fill="url(#goldMetal)" />
        <ellipse cx="19" cy="103" rx="7" ry="5" fill="none" stroke="#F5D060" strokeWidth="0.5" opacity="0.6" />

        {/* Pommel dome */}
        <ellipse cx="19" cy="100.5" rx="5.5" ry="4" fill="url(#pommelGrad)" />

        {/* Pommel gem / central eye */}
        <ellipse cx="19" cy="100.5" rx="2.5" ry="1.8" fill="#BFDBFE" opacity="0.9" />
        <ellipse cx="19" cy="100.5" rx="1.2" ry="0.9" fill="#EFF6FF" />

        {/* Pommel ornament flanges */}
        <path d="M12 103 L9 105 L9 102 L12 103Z" fill="url(#goldEdge)" />
        <path d="M26 103 L29 105 L29 102 L26 103Z" fill="url(#goldEdge)" />
        <line x1="9" y1="103.5" x2="12" y2="103.5" stroke="#F5D060" strokeWidth="0.5" />
        <line x1="26" y1="103.5" x2="29" y2="103.5" stroke="#F5D060" strokeWidth="0.5" />

        {/* ════════════════════════════════════
            GRIP (leather-wrapped handle)
        ════════════════════════════════════ */}
        {/* Core grip */}
        <rect x="16.5" y="75" width="5" height="24" rx="1.5" fill="#1A100A" />

        {/* Leather wrapping bands */}
        {[76.5, 78.5, 80.5, 82.5, 84.5, 86.5, 88.5, 90.5, 92.5, 94.5, 96.5].map((y, i) => (
          <rect
            key={i}
            x="16"
            y={y}
            width="6"
            height="1.2"
            rx="0.3"
            fill={i % 2 === 0 ? '#3D2010' : '#5C3A18'}
          />
        ))}

        {/* Grip edge highlight */}
        <rect x="16.5" y="75" width="1.2" height="24" rx="0.5" fill="rgba(255,255,255,0.07)" />

        {/* Grip gold collar (top of grip, below guard) */}
        <rect x="15.5" y="73" width="7" height="3" rx="1" fill="url(#goldMetal)" />
        <rect x="15.5" y="73" width="7" height="3" rx="1" fill="none" stroke="#F5D060" strokeWidth="0.4" opacity="0.5" />

        {/* Grip gold collar (bottom, above pommel) */}
        <rect x="15.5" y="97" width="7" height="3" rx="1" fill="url(#goldMetal)" />

        {/* ════════════════════════════════════
            CROSSGUARD — wide ornate wings
        ════════════════════════════════════ */}

        {/* Main crossguard bar */}
        <rect x="4" y="69" width="30" height="5" rx="2" fill="url(#goldMetal)" />
        <rect x="4" y="69" width="30" height="5" rx="2" fill="none" stroke="#F5D060" strokeWidth="0.6" opacity="0.5" />

        {/* Center raised boss */}
        <ellipse cx="19" cy="71.5" rx="5" ry="3" fill="url(#goldMetal)" />
        <ellipse cx="19" cy="71.5" rx="3.5" ry="2" fill="#C59B27" />
        <ellipse cx="19" cy="71.5" rx="1.5" ry="0.9" fill="#BFDBFE" opacity="0.8">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite" />
        </ellipse>

        {/* Left wing flare */}
        <path d="M4 69.5 Q2 67 0 68.5 Q1 71.5 4 74Z" fill="url(#goldMetal)" />
        <path d="M4 69.5 Q2 67 0 68.5" fill="none" stroke="#F5D060" strokeWidth="0.5" />

        {/* Right wing flare */}
        <path d="M34 69.5 Q36 67 38 68.5 Q37 71.5 34 74Z" fill="url(#goldMetal)" />
        <path d="M34 69.5 Q36 67 38 68.5" fill="none" stroke="#F5D060" strokeWidth="0.5" />

        {/* Left guard decorative notches */}
        <path d="M4 70.5 L7 69 L7 74 L4 72.5Z" fill="#C59B27" opacity="0.6" />
        <path d="M10 69.2 L12 68.5 L12 74.5 L10 73.8Z" fill="#C59B27" opacity="0.4" />

        {/* Right guard decorative notches */}
        <path d="M34 70.5 L31 69 L31 74 L34 72.5Z" fill="#C59B27" opacity="0.6" />
        <path d="M28 69.2 L26 68.5 L26 74.5 L28 73.8Z" fill="#C59B27" opacity="0.4" />

        {/* Guard top edge detailing */}
        <line x1="6" y1="69.2" x2="32" y2="69.2" stroke="#F5D060" strokeWidth="0.4" opacity="0.6" />
        <line x1="6" y1="73.5" x2="32" y2="73.5" stroke="#784E10" strokeWidth="0.4" opacity="0.5" />

        {/* ════════════════════════════════════
            RICASSO (blade base, wider)
        ════════════════════════════════════ */}
        {/* Ricasso — the unsharpened shoulder just above guard */}
        <rect x="15.5" y="58" width="7" height="12" rx="0.5" fill="url(#bladeLeft)" />
        <rect x="15.5" y="58" width="7" height="12" fill="none" stroke="rgba(96,165,250,0.3)" strokeWidth="0.5" />

        {/* Ricasso engraving — God of War omega-esque symbol */}
        <text
          x="19"
          y="67"
          textAnchor="middle"
          fontSize="5"
          fill="rgba(147,197,253,0.7)"
          fontFamily="serif"
          style={{ userSelect: 'none' }}
        >
          Ω
        </text>

        {/* ════════════════════════════════════
            BLADE — straight, double-edged
        ════════════════════════════════════ */}

        {/* Left blade face */}
        <path
          d="M15.5 60 L14 58 L13 45 L15 20 L17.5 4 L19 2 L19 44 L19 60Z"
          fill="url(#bladeLeft)"
        />

        {/* Right blade face */}
        <path
          d="M22.5 60 L24 58 L25 45 L23 20 L20.5 4 L19 2 L19 44 L19 60Z"
          fill="url(#bladeRight)"
        />

        {/* Central edge bevel — left */}
        <path
          d="M19 2 L15 20 L14 40 L15.5 58"
          fill="none"
          stroke="rgba(147,197,253,0.25)"
          strokeWidth="0.6"
        />

        {/* Central edge bevel — right */}
        <path
          d="M19 2 L23 20 L24 40 L22.5 58"
          fill="none"
          stroke="rgba(147,197,253,0.15)"
          strokeWidth="0.6"
        />

        {/* ── FULLER (blood groove) — divine energy channel ── */}
        <path
          d="M19 5 L19 56"
          stroke="url(#divineFuller)"
          strokeWidth="1.5"
          strokeLinecap="round"
          filter="url(#divineGlow)"
          opacity="0.85"
        >
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
        </path>

        {/* Fuller side glow lines */}
        <path d="M18.2 8 L18.2 54" stroke="rgba(147,197,253,0.15)" strokeWidth="0.4" />
        <path d="M19.8 8 L19.8 54" stroke="rgba(147,197,253,0.15)" strokeWidth="0.4" />

        {/* ── DIVINE RUNE ETCHINGS along blade ── */}
        {/* Each rune is a tiny geometric mark etched into the blade */}
        {[14, 22, 30, 38, 46].map((y, i) => (
          <g key={i} opacity="0.7">
            {/* Left rune mark */}
            <line
              x1="15.5"
              y1={y}
              x2="17"
              y2={y + 2}
              stroke="#93C5FD"
              strokeWidth="0.5"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.3;0.9;0.3"
                dur={`${1.4 + i * 0.3}s`}
                repeatCount="indefinite"
              />
            </line>
            {/* Right rune mark */}
            <line
              x1="22.5"
              y1={y}
              x2="21"
              y2={y + 2}
              stroke="#93C5FD"
              strokeWidth="0.5"
              strokeLinecap="round"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.3;0.9;0.3"
                dur={`${1.4 + i * 0.3}s`}
                begin={`${i * 0.15}s`}
                repeatCount="indefinite"
              />
            </line>
          </g>
        ))}

        {/* ── BLADE EDGE HIGHLIGHTS (polished bevels) ── */}
        {/* Left cutting edge */}
        <path
          d="M19 2 L13.5 45 L14 58"
          fill="none"
          stroke="rgba(191,219,254,0.45)"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        {/* Right cutting edge */}
        <path
          d="M19 2 L24.5 45 L24 58"
          fill="none"
          stroke="rgba(191,219,254,0.2)"
          strokeWidth="0.5"
          strokeLinecap="round"
        />

        {/* ── BLADE TIP (acute diamond point) ── */}
        <path d="M17.5 4 L19 2 L20.5 4 L19 3Z" fill="#BFDBFE" opacity="0.9" />

        {/* Tip divine flash */}
        <circle cx="19" cy="2.5" r="1">
          <animate attributeName="r" values="0.8;1.4;0.8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="fill" values="#93C5FD;#E0F2FE;#93C5FD" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* ════════════════════════════════════
            DIVINE AURA — soft blue corona
            (intensifies on hover/click)
        ════════════════════════════════════ */}
        <ellipse
          cx="19"
          cy="30"
          rx={state === 'click' ? 6 : state === 'hover' ? 5 : 3.5}
          ry={state === 'click' ? 30 : state === 'hover' ? 26 : 20}
          fill="rgba(59,130,246,0.06)"
          style={{ transition: 'all 0.2s ease' }}
        />
      </svg>
    </div>
  )
}
