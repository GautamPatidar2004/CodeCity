import React from 'react'
import { Lock } from 'lucide-react'
import type { LearningPath } from '../../../lib/learning'

interface RealmPathProps {
  islands: LearningPath[]
  onSelectRealm?: (islandId: string) => void
}

const REALM_ICONS: Record<string, string> = {
  python: '🐍',
  javascript: '⚡',
  web: '🕸️',
  data: '📊',
  ai: '🤖',
  default: '🌌',
}

function getRealmIcon(island: LearningPath): string {
  const slug = (island.slug || island.island_name || '').toLowerCase()
  for (const key of Object.keys(REALM_ICONS)) {
    if (slug.includes(key)) return REALM_ICONS[key]
  }
  return REALM_ICONS.default
}

export const RealmPath: React.FC<RealmPathProps> = ({ islands, onSelectRealm }) => {
  if (!islands || islands.length === 0) {
    return (
      <div className="rounded-2xl p-6 text-center"
        style={{ background: '#150F0F', border: '1px solid #3D1C1C' }}
      >
        <p className="text-xs font-black tracking-widest uppercase"
          style={{ color: '#57534e', fontFamily: 'Press Start 2P, monospace', fontSize: '8px' }}
        >
          NO REALMS DISCOVERED YET
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: '#0E0A0A', border: '1px solid #3D1C1C' }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(61, 28, 28, 0.6)' }}
      >
        <span style={{ fontSize: '16px' }}>🌍</span>
        <span className="font-black tracking-widest uppercase"
          style={{ color: '#FF3D00', fontFamily: 'Press Start 2P, monospace', fontSize: '9px' }}
        >
          NINE REALMS PATH
        </span>
      </div>

      {/* Scrollable realm nodes */}
      <div className="overflow-x-auto">
        <div className="flex items-stretch gap-0 min-w-max px-2 py-4">
          {islands.map((island, idx) => {
            const isCompleted = island.isCompleted
            const isActive = !isCompleted && island.completedCourses > 0
            const isLocked = !isCompleted && !isActive && island.completedCourses === 0 && idx > 0

            return (
              <React.Fragment key={island.id}>
                {/* Connecting bridge */}
                {idx > 0 && (
                  <div className="self-center shrink-0 w-8 h-1 relative"
                    style={{
                      background: isCompleted
                        ? 'linear-gradient(90deg, #991B1B, #DC2626)'
                        : isActive
                        ? 'linear-gradient(90deg, #DC2626, #3D1C1C)'
                        : '#1c1010',
                    }}
                  >
                    {(isCompleted || isActive) && (
                      <div className="absolute inset-0 opacity-60"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,61,0,0.4), transparent)' }}
                      />
                    )}
                  </div>
                )}

                {/* Realm Node */}
                <button
                  type="button"
                  onClick={() => !isLocked && onSelectRealm?.(island.id)}
                  disabled={isLocked}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 shrink-0 w-36 group"
                  style={{
                    background: isCompleted
                      ? 'linear-gradient(135deg, #1a0e0e 0%, #0E0A0A 100%)'
                      : isActive
                      ? 'linear-gradient(135deg, #1a0808 0%, #150F0F 100%)'
                      : '#0a0808',
                    border: isCompleted
                      ? '2px solid #F59E0B'
                      : isActive
                      ? '2px solid #DC2626'
                      : '1px solid #1c1010',
                    boxShadow: isCompleted
                      ? '0 0 16px rgba(245, 158, 11, 0.3), inset 0 0 8px rgba(245, 158, 11, 0.05)'
                      : isActive
                      ? '0 0 16px rgba(220, 38, 38, 0.25), inset 0 0 8px rgba(255, 61, 0, 0.05)'
                      : 'none',
                    opacity: isLocked ? 0.4 : 1,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  {/* Lock overlay for locked realms */}
                  {isLocked && (
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                    >
                      <Lock className="w-5 h-5" style={{ color: '#57534e' }} />
                    </div>
                  )}

                  {/* Realm icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: isCompleted
                        ? 'rgba(245, 158, 11, 0.15)'
                        : isActive
                        ? 'rgba(220, 38, 38, 0.15)'
                        : 'rgba(28, 16, 16, 0.8)',
                      border: isCompleted
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : isActive
                        ? '1px solid rgba(220, 38, 38, 0.4)'
                        : '1px solid #1c1010',
                    }}
                  >
                    {getRealmIcon(island)}
                  </div>

                  {/* Realm name */}
                  <div className="text-center">
                    <div className="font-black text-xs leading-tight"
                      style={{
                        color: isCompleted ? '#F59E0B' : isActive ? '#f1f5f9' : '#57534e',
                        fontFamily: 'Georgia, serif',
                        fontSize: '11px',
                      }}
                    >
                      {island.title}
                    </div>
                    {island.island_name && (
                      <div className="text-xs mt-0.5"
                        style={{ color: '#57534e', fontSize: '9px' }}
                      >
                        {island.island_name}
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  {isCompleted && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)' }}
                    >
                      <span style={{ fontSize: '10px' }}>🌳</span>
                      <span className="font-black uppercase" style={{ color: '#F59E0B', fontSize: '7px' }}>
                        CONQUERED
                      </span>
                    </div>
                  )}

                  {/* Course progress for active realms */}
                  {!isCompleted && !isLocked && (
                    <>
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span style={{ color: '#78716c', fontSize: '8px' }}>
                            {island.completedCourses}/{island.totalCourses} sagas
                          </span>
                          <span style={{ color: '#FF3D00', fontSize: '8px', fontWeight: 700 }}>
                            {island.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden"
                          style={{ background: '#1c1010' }}
                        >
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${island.progressPercent}%`,
                              background: 'linear-gradient(90deg, #991B1B, #FF3D00)',
                              boxShadow: '0 0 6px rgba(255,61,0,0.5)',
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {isLocked && (
                    <span className="font-black uppercase" style={{ color: '#3D1C1C', fontSize: '7px' }}>
                      SEALED
                    </span>
                  )}
                </button>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
