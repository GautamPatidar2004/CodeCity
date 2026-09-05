import React from 'react'
import { Crown, Users, Swords, Star, Shield } from 'lucide-react'
import {
  useFestLobby,
  useFestSquadScore,
  useFestLeaderboard,
  type ArcadeFest,
  type ArcadeTeam,
  type ArcadeTeamMember,
} from '../../lib/arcade'
import { FestLobbyView } from '../arcade/FestLobbyView'
import { C, statusBadgeStyle, relativeTime } from './crucibleTokens'

/* ─────────────────────────────────────────────────────────────
   ClanProfileCard — War Clan with crest, stats, roster
───────────────────────────────────────────────────────────────── */
interface ClanProfileCardProps {
  team: ArcadeTeam
  members: ArcadeTeamMember[]
  isCaptain?: boolean
}

export const ClanProfileCard: React.FC<ClanProfileCardProps> = ({ team, members, isCaptain }) => {
  const totalXp   = members.reduce((s, m) => s + (m.profile?.xp ?? 0), 0)
  const captain   = members.find(m => m.role === 'captain')
  const coLeaders = members.filter(m => m.role === 'member' && m.user_id !== captain?.user_id).slice(0, 1)
  const warriors  = members.filter(m => m.user_id !== captain?.user_id && !coLeaders.find(c => c.user_id === m.user_id))

  const roleGroups = [
    { label: 'Warlord', icon: '👑', members: captain ? [captain] : [] },
    { label: 'Chieftain', icon: '⚔', members: coLeaders },
    { label: 'Warrior', icon: '🛡', members: warriors },
  ]

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
      {/* Clan Banner */}
      <div className="relative px-6 py-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(127,29,29,0.3) 0%, rgba(14,10,10,0.9) 100%)', borderBottom: `1px solid ${C.border}` }}>
        {/* Clan Crest Avatar */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
          style={{
            background: 'linear-gradient(135deg, #7F1D1D, #DC2626)',
            border: `2px solid ${C.borderHot}`,
            boxShadow: `0 0 20px rgba(220,38,38,0.4)`,
            fontFamily: "'Cinzel Decorative', serif",
            color: C.textPrimary,
          }}>
          {team.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>
            {team.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Shield className="w-3 h-3" style={{ color: C.textMuted }} />
            <span className="text-[10px] font-mono" style={{ color: C.textSecondary }}>CODE: {team.code}</span>
            {isCaptain && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-bold"
                style={{ background: C.crimsonDim, color: C.crimson, fontFamily: "'Cinzel', serif", border: `1px solid ${C.borderHot}` }}>
                YOUR CLAN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* War Chest Metrics */}
      <div className="grid grid-cols-2 gap-px" style={{ background: C.border }}>
        {[
          { label: 'Total Hacksilver', value: `ᚱ ${totalXp.toLocaleString()} XP`, icon: <Star className="w-3.5 h-3.5" />, color: C.gold },
          { label: 'Clan Members', value: `${members.length} Warriors`, icon: <Users className="w-3.5 h-3.5" />, color: C.frost },
        ].map(m => (
          <div key={m.label} className="flex flex-col items-center gap-1 py-4"
            style={{ background: C.bgCard }}>
            <div style={{ color: m.color }}>{m.icon}</div>
            <div className="text-base font-bold" style={{ fontFamily: "'Cinzel', serif", color: m.color }}>{m.value}</div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted, fontFamily: "'Cinzel', serif" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* War Council Roster */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5" style={{ color: C.crimson }} />
          <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.crimson }}>War Council</span>
        </div>

        {roleGroups.map(group => group.members.length > 0 && (
          <div key={group.label}>
            <div className="text-[9px] uppercase tracking-wider mb-1.5 flex items-center gap-1"
              style={{ color: C.textMuted, fontFamily: "'Cinzel', serif" }}>
              <span>{group.icon}</span> {group.label}
            </div>
            <div className="flex flex-col gap-1">
              {group.members.map(m => (
                <div key={m.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(20,12,12,0.6)', border: `1px solid ${C.border}` }}>
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      background: m.profile?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #7F1D1D, #DC2626)',
                      border: m.role === 'captain' ? `1.5px solid ${C.gold}` : `1px solid ${C.borderHot}`,
                      color: C.textPrimary,
                      fontFamily: "'Cinzel', serif",
                    }}>
                    {m.profile?.avatar_url
                      ? <img src={m.profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                      : (m.profile?.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: C.textPrimary, fontFamily: "'Cinzel', serif" }}>
                      {m.profile?.full_name || m.profile?.username || 'Anonymous Warrior'}
                    </div>
                    <div className="text-[9px]" style={{ color: C.textMuted }}>LVL {m.profile?.level ?? 1}</div>
                  </div>
                  {m.role === 'captain' && <Crown className="w-3 h-3 shrink-0" style={{ color: C.gold }} />}
                </div>
              ))}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-4 text-xs" style={{ color: C.textMuted }}>No warriors have pledged allegiance yet.</div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   RagnarokFestLobby — Grand tournament hero + challenges
───────────────────────────────────────────────────────────────── */
interface RagnarokFestLobbyProps {
  fest: ArcadeFest
  team: ArcadeTeam | null
  members: ArcadeTeamMember[]
  userId?: string
  onExit: () => void
}

export const RagnarokFestLobby: React.FC<RagnarokFestLobbyProps> = ({ fest, team, members, userId, onExit }) => {
  const { bg: statusBg, color: statusColor, label: statusLabel, pulse: statusPulse } = statusBadgeStyle(fest.effective_status)

  function formatEpoch(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
      })
    } catch { return dateStr }
  }

  return (
    <div className="flex flex-col gap-0" style={{ color: C.textPrimary }}>

      {/* ── Hero Tournament Banner ── */}
      <div className="relative overflow-hidden" style={{ minHeight: '280px' }}>
        {/* Banner image */}
        {fest.banner_url ? (
          <img
            src={fest.banner_url}
            alt={fest.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.3) contrast(1.2) saturate(0.7)' }}
          />
        ) : (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #0B0404 0%, #1A0808 50%, #0E0505 100%)'
          }} />
        )}

        {/* Charcoal vignette overlay */}
        <div className="absolute inset-0" style={{
          background: [
            'radial-gradient(ellipse at 50% 0%, rgba(185,28,28,0.25) 0%, transparent 60%)',
            'linear-gradient(to bottom, rgba(7,5,5,0.3) 0%, rgba(7,5,5,0.85) 100%)',
          ].join(', ')
        }} />

        {/* Runic pillars - decorative */}
        <div className="absolute left-4 top-0 bottom-0 w-px opacity-30" style={{ background: `linear-gradient(to bottom, transparent, ${C.gold}, transparent)` }} />
        <div className="absolute right-4 top-0 bottom-0 w-px opacity-30" style={{ background: `linear-gradient(to bottom, transparent, ${C.gold}, transparent)` }} />

        {/* Content */}
        <div className="relative z-10 px-8 py-8 flex flex-col gap-4">
          {/* Back button */}
          <button type="button" onClick={onExit} className="flex items-center gap-2 w-fit text-xs transition-colors"
            style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.crimson)}
            onMouseLeave={e => (e.currentTarget.style.color = C.textSecondary)}>
            ← Return to Fests
          </button>

          {/* Status badge */}
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${statusPulse ? 'animate-pulse' : ''}`}
              style={{ background: statusBg, color: statusColor, fontFamily: "'Cinzel', serif", border: `1px solid ${statusColor}44` }}>
              ● {statusLabel}
            </span>
          </div>

          {/* Title & description */}
          <h1 className="text-3xl font-black leading-tight max-w-2xl"
            style={{ fontFamily: "'Cinzel Decorative', serif", color: C.textPrimary, textShadow: '0 2px 20px rgba(220,38,38,0.4)' }}>
            {fest.title}
          </h1>
          {fest.description && (
            <p className="max-w-2xl text-sm leading-relaxed" style={{ color: '#B09090' }}>{fest.description}</p>
          )}

          {/* Norse epoch date markers */}
          <div className="flex items-center gap-6 flex-wrap">
            {[
              { label: 'Dawn of Battle', value: formatEpoch(fest.start_time) },
              { label: 'Twilight of War', value: formatEpoch(fest.end_time) },
            ].map(d => (
              <div key={d.label} className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.gold }}>
                  {d.label}
                </span>
                <span className="text-[11px] font-mono" style={{ color: C.textSecondary }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Existing FestLobbyView (wired backend — pass-through) ── */}
      <div className="p-4" style={{ background: C.bg }}>
        <FestLobbyView
          fest={fest}
          team={team}
          members={members}
          userId={userId}
          onExit={onExit}
        />
      </div>
    </div>
  )
}
