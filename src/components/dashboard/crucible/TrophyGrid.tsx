import React from 'react'
import type { BadgeItem, AchievementItem, ActivityItem } from '../../../lib/achievements'

// ─── Trophy Grid (Badges & Achievements) ────────────────────────────────────

interface TrophyGridProps {
  badges: BadgeItem[]
  achievements: AchievementItem[]
  activities: ActivityItem[]
}

function formatActivityIcon(actionType: string): string {
  switch (actionType) {
    case 'completed_lesson': return '⚔️'
    case 'earned_badge': return '🏆'
    case 'level_up': return '⬆️'
    case 'streak': return '🔥'
    case 'completed_course': return '📜'
    default: return '📌'
  }
}

export const TrophyGrid: React.FC<TrophyGridProps> = ({ badges, achievements, activities }) => {
  const earnedBadges = badges.filter((b) => b.isUnlocked)
  const lockedBadges = badges.filter((b) => !b.isUnlocked)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* ── Left: Trophies of War ──────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#0E0A0A', border: '1px solid #3D1C1C' }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(61, 28, 28, 0.6)' }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '16px' }}>🏆</span>
            <span className="font-black tracking-widest uppercase"
              style={{ color: '#FF3D00', fontFamily: 'Press Start 2P, monospace', fontSize: '9px' }}
            >
              TROPHIES OF WAR
            </span>
          </div>
          <span className="font-black tabular-nums"
            style={{ color: '#57534e', fontSize: '10px' }}
          >
            {earnedBadges.length}/{badges.length}
          </span>
        </div>

        <div className="p-4">
          {badges.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-black uppercase" style={{ color: '#2a1010', fontSize: '8px' }}>
                NO TROPHIES CLAIMED YET
              </p>
            </div>
          ) : (
            <>
              {/* Earned badges */}
              {earnedBadges.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {earnedBadges.map((badge) => (
                    <div key={badge.id}
                      className="flex flex-col items-center text-center gap-2 p-3 rounded-xl transition-all duration-200 hover:scale-[1.03]"
                      style={{
                        background: 'linear-gradient(135deg, #1a0e0e 0%, #150a0a 100%)',
                        border: '1px solid rgba(220, 38, 38, 0.4)',
                        boxShadow: '0 0 12px rgba(220, 38, 38, 0.15), inset 0 0 8px rgba(245, 158, 11, 0.05)',
                      }}
                    >
                      {/* Badge icon with crimson backlight */}
                      <div className="relative w-12 h-12 flex items-center justify-center rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
                          boxShadow: '0 0 16px rgba(220, 38, 38, 0.3)',
                        }}
                      >
                        <span style={{ fontSize: '24px', filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' }}>
                          {badge.icon}
                        </span>
                      </div>

                      <div>
                        <div className="font-bold text-xs leading-tight" style={{ color: '#f1f5f9', fontSize: '10px' }}>
                          {badge.title}
                        </div>
                        {badge.unlockedAt && (
                          <div style={{ color: '#F59E0B', fontSize: '8px', marginTop: '2px' }}>
                            {new Date(badge.unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Locked badges (weathered stone) */}
              {lockedBadges.length > 0 && (
                <>
                  <div style={{ borderTop: '1px solid rgba(61, 28, 28, 0.4)', marginBottom: '12px' }} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {lockedBadges.map((badge) => (
                      <div key={badge.id}
                        className="flex flex-col items-center text-center gap-2 p-3 rounded-xl"
                        style={{
                          background: '#0a0606',
                          border: '1px solid #1c1010',
                          opacity: 0.45,
                        }}
                      >
                        <div className="w-12 h-12 flex items-center justify-center rounded-full"
                          style={{ background: '#150F0F', filter: 'grayscale(1)' }}
                        >
                          <span style={{ fontSize: '24px', filter: 'grayscale(1)' }}>{badge.icon}</span>
                        </div>
                        <div className="font-bold text-xs leading-tight" style={{ color: '#57534e', fontSize: '10px' }}>
                          {badge.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Achievements progress */}
              {achievements.length > 0 && (
                <div className="mt-4">
                  <div style={{ borderTop: '1px solid rgba(61, 28, 28, 0.4)', marginBottom: '12px' }} />
                  <div className="flex items-center gap-2 mb-3">
                    <span style={{ fontSize: '12px' }}>⚡</span>
                    <span className="font-black uppercase"
                      style={{ color: '#78716c', fontSize: '8px', fontFamily: 'Press Start 2P, monospace' }}
                    >
                      MYTHIC LABORS
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {achievements.slice(0, 4).map((ach) => (
                      <div key={ach.id}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: ach.isUnlocked ? 'rgba(245, 158, 11, 0.08)' : 'rgba(10, 6, 6, 0.8)',
                          border: ach.isUnlocked ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #1c1010',
                          opacity: ach.isUnlocked ? 1 : 0.5,
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{ach.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs truncate" style={{ color: ach.isUnlocked ? '#f1f5f9' : '#57534e', fontSize: '10px' }}>
                            {ach.title}
                          </div>
                          <div className="text-xs truncate" style={{ color: '#3D1C1C', fontSize: '9px' }}>
                            {ach.description}
                          </div>
                          {/* Mini progress */}
                          {!ach.isUnlocked && ach.targetCount > 1 && (
                            <div className="w-full h-1 rounded-full mt-1 overflow-hidden" style={{ background: '#1c1010' }}>
                              <div className="h-full rounded-full" style={{
                                width: `${Math.min(100, (ach.progressCount / ach.targetCount) * 100)}%`,
                                background: 'linear-gradient(90deg, #991B1B, #DC2626)',
                              }} />
                            </div>
                          )}
                        </div>
                        <span className="font-black shrink-0" style={{ color: '#F59E0B', fontSize: '9px' }}>
                          +{ach.rewardXp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Right: Saga Chronicles (Activity History) ──────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#0E0A0A', border: '1px solid #3D1C1C' }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(61, 28, 28, 0.6)' }}
        >
          <span style={{ fontSize: '16px' }}>📜</span>
          <span className="font-black tracking-widest uppercase"
            style={{ color: '#FF3D00', fontFamily: 'Press Start 2P, monospace', fontSize: '9px' }}
          >
            SAGA CHRONICLES
          </span>
        </div>

        <div className="p-4">
          {activities.length === 0 ? (
            <div className="py-8 text-center">
              <p className="font-black uppercase" style={{ color: '#2a1010', fontSize: '8px' }}>
                NO CHRONICLES RECORDED YET
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col gap-0">
              {/* Vertical timeline line */}
              <div className="absolute left-5 top-3 bottom-3 w-0.5"
                style={{ background: 'linear-gradient(to bottom, #3D1C1C, transparent)' }}
              />

              {activities.map((act, idx) => {
                const icon = formatActivityIcon(act.actionType)
                const isEarnedBadge = act.actionType === 'earned_badge'

                return (
                  <div key={act.id}
                    className="relative flex items-start gap-4 py-3"
                    style={{ paddingLeft: '44px' }}
                  >
                    {/* Timeline node */}
                    <div className="absolute left-2 top-3 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: isEarnedBadge
                          ? 'linear-gradient(135deg, #B91C1C, #DC2626)'
                          : 'rgba(28, 16, 16, 0.9)',
                        border: isEarnedBadge
                          ? '1px solid rgba(255, 61, 0, 0.5)'
                          : '1px solid #3D1C1C',
                        boxShadow: isEarnedBadge ? '0 0 8px rgba(220, 38, 38, 0.4)' : 'none',
                        zIndex: 1,
                      }}
                    >
                      <span style={{ fontSize: '12px' }}>{icon}</span>
                    </div>

                    {/* Activity content */}
                    <div className="flex-1 min-w-0">
                      {isEarnedBadge ? (
                        // Badge earned: glowing achievement banner
                        <div className="p-2 rounded-lg"
                          style={{
                            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.15), rgba(245, 158, 11, 0.1))',
                            border: '1px solid rgba(220, 38, 38, 0.3)',
                          }}
                        >
                          <div className="font-bold text-xs" style={{ color: '#f1f5f9', fontSize: '11px' }}>
                            {act.title}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#F59E0B', fontSize: '9px' }}>
                            ⚡ Achievement Unlocked
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-sm leading-tight" style={{ color: '#9ca3af', fontSize: '12px' }}>
                            {act.title}
                          </div>
                        </div>
                      )}
                      <div className="mt-1 text-xs" style={{ color: '#3D2C2C', fontSize: '9px' }}>
                        {act.createdAt}
                      </div>
                    </div>

                    {/* Separator line (not last) */}
                    {idx < activities.length - 1 && (
                      <div className="absolute bottom-0 left-10 right-0 h-px"
                        style={{ background: 'rgba(61, 28, 28, 0.3)' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
