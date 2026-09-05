import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  useTeamArcade,
  useArcadeFests,
  useStudentFestHistory,
  useStudentBattles,
  registerBattleAction,
  type ArcadeFest,
} from '../lib/arcade'
import { BloodArenaBattleView } from '../components/crucible/BloodArenaBattleView'
import { RagnarokFestLobby, ClanProfileCard } from '../components/crucible/RagnarokFestLobby'
import { C, formatCountdown, relativeTime, statusBadgeStyle } from '../components/crucible/crucibleTokens'
import confetti from 'canvas-confetti'
import {
  Swords, Flame, Trophy, Clock, CheckCircle2,
  Users, UserPlus, LogOut, Loader2, AlertCircle,
  Copy, Shield, X, Calendar, Crown
} from 'lucide-react'

export const TeamArcadePage: React.FC = () => {
  const { user } = useAuth()
  const {
    team,
    members,
    registeredFestIds,
    loading: teamLoading,
    isCaptain,
    createTeamAction,
    joinTeamAction,
    leaveTeamAction,
    registerFestAction,
  } = useTeamArcade(user?.id)

  const { fests, loading: festsLoading, liveFests, upcomingFests, endedFests } = useArcadeFests()
  const { battles, registeredBattleIds, refreshBattles } = useStudentBattles(user?.id)

  const [activeArcadeTab, setActiveArcadeTab] = useState<'battles' | 'fests'>('battles')
  const [activeBattleTab, setActiveBattleTab] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all')
  const [activeLobbyBattleId, setActiveLobbyBattleId] = useState<string | null>(null)
  const [isRegisteringBattle, setIsRegisteringBattle] = useState(false)

  const handleRegisterBattle = async (battleId: string) => {
    if (!user?.id) {
      toast.error('You must log in to join the slaughter.')
      return
    }
    setIsRegisteringBattle(true)
    const result = await registerBattleAction(battleId, user.id)
    setIsRegisteringBattle(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to enter the Blood Arena.')
    } else {
      toast.success(`Clan Registered for ${result.battle_title || 'Battle'}! ⚔️`)
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 }, colors: [C.crimson, C.gold, '#fff'] })
      refreshBattles()
    }
  }

  const [activeFestTab, setActiveFestTab] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all')
  const [selectedFest, setSelectedFest] = useState<ArcadeFest | null>(null)
  const [activeLobbyFest, setActiveLobbyFest] = useState<ArcadeFest | null>(null)
  const [isRegisteringFest, setIsRegisteringFest] = useState(false)

  const handleRegisterFest = async (festId: string) => {
    setIsRegisteringFest(true)
    const result = await registerFestAction(festId)
    setIsRegisteringFest(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to pledge to Ragnarök.')
    } else {
      toast.success(`Clan registered for ${result.fest_title || 'Ragnarök'}! 🏆`)
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 }, colors: [C.crimson, C.gold, '#fff'] })
    }
  }

  const [teamNameInput, setTeamNameInput] = useState('')
  const [teamCodeInput, setTeamCodeInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      toast.success('Runic Code inscribed. 📋')
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      toast.error('Failed to scribe code.')
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    const trimmed = teamNameInput.trim()
    if (trimmed.length < 2) return setActionError('Clan name must be at least 2 runes.')
    if (trimmed.length > 50) return setActionError('Clan name must be 50 runes or less.')

    setIsSubmitting(true)
    const result = await createTeamAction(trimmed)
    setIsSubmitting(false)

    if (!result.success) {
      setActionError(result.error || 'Failed to forge clan.')
      toast.error(result.error || 'Failed to forge clan.')
    } else {
      setTeamNameInput('')
      toast.success(`Clan "${result.team_name}" forged! 🛡️`)
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: [C.crimson, '#fff'] })
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    const cleanCode = teamCodeInput.trim().toUpperCase()
    if (cleanCode.length !== 6) return setActionError('Runic code must be exactly 6 characters.')

    setIsSubmitting(true)
    const result = await joinTeamAction(cleanCode)
    setIsSubmitting(false)

    if (!result.success) {
      setActionError(result.error || 'Failed to swear fealty.')
      toast.error(result.error || 'Failed to swear fealty.')
    } else {
      setTeamCodeInput('')
      toast.success(`Sworn to clan "${result.team_name}"! ⚔️`)
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 }, colors: [C.crimson, '#fff'] })
    }
  }

  const handleLeaveTeam = async () => {
    setIsSubmitting(true)
    const result = await leaveTeamAction()
    setIsSubmitting(false)
    setShowLeaveConfirm(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to break oath.')
    } else {
      toast.success('Oath broken. You are a lone wolf again.')
    }
  }

  // Loading state
  if (teamLoading || festsLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-4" style={{ color: C.textPrimary }}>
        <div className="text-4xl animate-pulse" style={{ fontFamily: "'Cinzel Decorative', serif", color: C.crimson }}>⚔</div>
        <div className="text-[11px] uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.textSecondary }}>
          Summoning the Arena…
        </div>
      </div>
    )
  }

  // Active Lobbies
  if (activeLobbyBattleId) {
    return (
      <BloodArenaBattleView
        battleId={activeLobbyBattleId}
        userId={user?.id}
        onExit={() => setActiveLobbyBattleId(null)}
      />
    )
  }

  if (activeLobbyFest) {
    return (
      <RagnarokFestLobby
        fest={activeLobbyFest}
        team={team}
        members={members}
        userId={user?.id}
        onExit={() => setActiveLobbyFest(null)}
      />
    )
  }

  // Filtering
  const liveBattles = battles.filter((b) => b.effective_status === 'live')
  const upcomingBattles = battles.filter((b) => b.effective_status === 'upcoming')
  const endedBattles = battles.filter((b) => b.effective_status === 'ended')

  const displayedBattles = battles.filter((b) => {
    if (activeBattleTab === 'live') return b.effective_status === 'live'
    if (activeBattleTab === 'upcoming') return b.effective_status === 'upcoming'
    if (activeBattleTab === 'ended') return b.effective_status === 'ended'
    return true
  })

  const displayedFests = fests.filter((f) => {
    if (activeFestTab === 'live') return f.effective_status === 'live'
    if (activeFestTab === 'upcoming') return f.effective_status === 'upcoming'
    if (activeFestTab === 'ended') return f.effective_status === 'ended'
    return true
  })

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-10" style={{ color: C.textPrimary }}>
      
      {/* ── 1. THE CRUCIBLE HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl p-8 md:p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(20,12,12,0.95) 0%, rgba(14,10,10,0.95) 100%)',
          border: `1px solid ${C.border}`,
          boxShadow: `0 0 30px rgba(220,38,38,0.15) inset`
        }}>
        <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest w-fit"
            style={{ fontFamily: "'Cinzel', serif", background: C.crimsonDim, color: C.crimson, border: `1px solid ${C.borderHot}` }}>
            <Swords className="w-3 h-3" /> The Blood Arena
          </div>
          <h1 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "'Cinzel Decorative', serif", textShadow: '0 2px 20px rgba(220,38,38,0.4)' }}>
            Prove Your Valor
          </h1>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: C.textSecondary }}>
            Forge a war clan, pledge fealty to Ragnarök tournaments, and spill blood in real-time competitive duels. Only the strong survive the Crucible.
          </p>
        </div>
        {/* Runic background texture */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at right, rgba(220,38,38,0.4) 0%, transparent 70%)',
          }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── LEFT: MAIN ARENA TABS ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Tab selector */}
          <div className="flex gap-0" style={{ borderBottom: `1px solid ${C.border}` }}>
            {[
              { key: 'battles', label: 'Gladiatorial Battles', icon: <Swords className="w-4 h-4" />, count: battles.length },
              { key: 'fests', label: 'Ragnarök Tournaments', icon: <Flame className="w-4 h-4" />, count: fests.length },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveArcadeTab(t.key as any)}
                className="relative px-6 py-3 text-[11px] uppercase font-bold tracking-widest flex items-center gap-2 transition-all"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: activeArcadeTab === t.key ? C.crimson : C.textSecondary,
                  borderBottom: activeArcadeTab === t.key ? `2px solid ${C.crimson}` : '2px solid transparent',
                }}>
                {t.icon} {t.label} <span className="text-[9px]" style={{ color: activeArcadeTab === t.key ? C.crimson : C.textMuted }}>({t.count})</span>
              </button>
            ))}
          </div>

          {/* ── BATTLES CONTENT ── */}
          {activeArcadeTab === 'battles' && (
            <div className="flex flex-col gap-6">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {(['all', 'live', 'upcoming', 'ended'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveBattleTab(f)}
                    className="px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      background: activeBattleTab === f ? C.crimsonDim : 'rgba(20,12,12,0.6)',
                      color: activeBattleTab === f ? C.crimson : C.textMuted,
                      border: `1px solid ${activeBattleTab === f ? C.borderHot : C.border}`,
                    }}>
                    {f}
                  </button>
                ))}
              </div>

              {displayedBattles.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ border: `1px dashed ${C.border}` }}>
                  <div className="text-3xl opacity-40 mb-3 text-white">⚔</div>
                  <p className="text-sm" style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>No blood currently spilled here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedBattles.map(battle => {
                    const isLive = battle.effective_status === 'live'
                    const isUpcoming = battle.effective_status === 'upcoming'
                    const isRegistered = registeredBattleIds.includes(battle.id)
                    const { bg: statusBg, color: statusColor, label: statusLabel, pulse: statusPulse } = statusBadgeStyle(battle.effective_status)

                    return (
                      <div key={battle.id} className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
                        style={{ background: C.bgCard, border: `1px solid ${isLive ? C.borderHot : C.border}`, boxShadow: isLive ? `0 0 20px rgba(220,38,38,0.1)` : 'none' }}>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${statusPulse ? 'animate-pulse' : ''}`}
                            style={{ background: statusBg, color: statusColor, fontFamily: "'Cinzel', serif", border: `1px solid ${statusColor}44` }}>
                            ● {statusLabel}
                          </span>
                          {isRegistered && (
                            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold"
                              style={{ background: 'rgba(0,229,255,0.1)', color: C.frost, border: `1px solid ${C.frost}44` }}>
                              <CheckCircle2 className="w-2.5 h-2.5 inline mr-1" /> Pledged
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>{battle.title}</h3>
                          <p className="text-xs line-clamp-2" style={{ color: C.textSecondary }}>{battle.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: C.textMuted }}>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {battle.duration_minutes}m</span>
                          <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-yellow-600" /> {battle.base_points} Base XP</span>
                          <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-600" /> -{battle.wrong_answer_penalty} Pen</span>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                          {isLive && isRegistered ? (
                            <button onClick={() => setActiveLobbyBattleId(battle.id)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                              style={{ background: 'linear-gradient(135deg, #DC2626, #FF3D00)', color: '#fff', fontFamily: "'Cinzel', serif" }}>
                              Enter the Arena ⚔️
                            </button>
                          ) : isUpcoming && isRegistered ? (
                            <button onClick={() => setActiveLobbyBattleId(battle.id)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                              style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.borderHot}`, color: C.crimson, fontFamily: "'Cinzel', serif" }}>
                              Enter War Tent
                            </button>
                          ) : isUpcoming && !isRegistered ? (
                            <button onClick={() => handleRegisterBattle(battle.id)} disabled={!team || !isCaptain || isRegisteringBattle}
                              className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all disabled:opacity-40"
                              style={{ background: C.crimsonDim, border: `1px solid ${C.borderHot}`, color: C.crimson, fontFamily: "'Cinzel', serif" }}>
                              {isRegisteringBattle ? 'Scribing...' : !team ? 'Form a Clan First' : isCaptain ? 'Pledge Clan' : 'Warlord Only'}
                            </button>
                          ) : (
                            <button onClick={() => setActiveLobbyBattleId(battle.id)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                              style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.border}`, color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>
                              View Memorial
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── FESTS CONTENT ── */}
          {activeArcadeTab === 'fests' && (
            <div className="flex flex-col gap-6">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {(['all', 'live', 'upcoming', 'ended'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFestTab(f)}
                    className="px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      background: activeFestTab === f ? C.crimsonDim : 'rgba(20,12,12,0.6)',
                      color: activeFestTab === f ? C.crimson : C.textMuted,
                      border: `1px solid ${activeFestTab === f ? C.borderHot : C.border}`,
                    }}>
                    {f}
                  </button>
                ))}
              </div>

              {displayedFests.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ border: `1px dashed ${C.border}` }}>
                  <div className="text-3xl opacity-40 mb-3 text-white">🏆</div>
                  <p className="text-sm" style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>No tournaments echo in the halls.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedFests.map(fest => {
                    const isRegistered = registeredFestIds.includes(fest.id)
                    const { bg: statusBg, color: statusColor, label: statusLabel, pulse: statusPulse } = statusBadgeStyle(fest.effective_status)

                    return (
                      <div key={fest.id} className="rounded-2xl flex flex-col overflow-hidden transition-all group"
                        style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
                        
                        {/* Banner */}
                        <div className="h-24 relative overflow-hidden flex items-end p-4">
                          {fest.banner_url ? (
                            <img src={fest.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" style={{ filter: 'brightness(0.5)' }} />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-black" />
                          )}
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,10,10,1) 0%, transparent 100%)' }} />
                          
                          <div className="relative z-10 w-full flex justify-between items-end">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${statusPulse ? 'animate-pulse' : ''}`}
                              style={{ background: statusBg, color: statusColor, fontFamily: "'Cinzel', serif", border: `1px solid ${statusColor}44` }}>
                              ● {statusLabel}
                            </span>
                            {isRegistered && (
                              <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold"
                                style={{ background: 'rgba(0,229,255,0.1)', color: C.frost, border: `1px solid ${C.frost}44` }}>
                                <CheckCircle2 className="w-2.5 h-2.5 inline mr-1" /> Pledged
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col gap-3 flex-1">
                          <h3 className="font-bold text-lg" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>{fest.title}</h3>
                          <p className="text-xs line-clamp-2" style={{ color: C.textSecondary }}>{fest.description}</p>
                          
                          <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                            {isRegistered ? (
                              <button onClick={() => setActiveLobbyFest(fest)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                                style={{ background: fest.effective_status === 'live' ? 'linear-gradient(135deg, #DC2626, #FF3D00)' : 'rgba(20,12,12,0.8)', color: fest.effective_status === 'live' ? '#fff' : C.crimson, border: `1px solid ${fest.effective_status === 'live' ? 'transparent' : C.borderHot}`, fontFamily: "'Cinzel', serif" }}>
                                {fest.effective_status === 'live' ? 'Enter Live Fest ⚔️' : fest.effective_status === 'ended' ? 'View Standings' : 'Enter Lobby'}
                              </button>
                            ) : (
                              <button onClick={() => setSelectedFest(fest)} className="w-full py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all"
                                style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.border}`, color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>
                                View Runes
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: CLAN MANAGEMENT (SIDEBAR) ── */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: C.gold }} />
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: "'Cinzel', serif", color: C.gold }}>
              Your War Clan
            </h2>
          </div>

          {team ? (
            <div className="flex flex-col gap-4">
              {/* Using the phase 4 Crucible Clan Profile Card */}
              <ClanProfileCard team={team} members={members} isCaptain={isCaptain} />
              
              <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.textSecondary, fontFamily: "'Cinzel', serif" }}>Clan Directives</span>
                <button
                  onClick={() => handleCopyCode(team.code)}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-mono transition-all"
                  style={{ background: 'rgba(20,12,12,0.6)', border: `1px dashed ${C.borderHot}`, color: C.textPrimary }}
                >
                  <span style={{ color: C.textMuted }}>Code:</span> {team.code}
                  <Copy className="w-3.5 h-3.5" style={{ color: C.crimson }} />
                </button>
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                  style={{ color: C.textMuted, border: `1px solid transparent` }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.crimson; e.currentTarget.style.border = `1px solid ${C.borderHot}` }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.border = `1px solid transparent` }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Break Oath
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-5 flex flex-col gap-6" style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
              <div className="text-center pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-xl"
                  style={{ background: 'linear-gradient(135deg, #7F1D1D, #DC2626)', boxShadow: `0 0 14px rgba(220,38,38,0.4)` }}>
                  🛡
                </div>
                <h3 className="font-bold text-sm" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>Forge a Clan</h3>
                <p className="text-xs mt-1" style={{ color: C.textSecondary }}>You must swear allegiance to a clan before spilling blood.</p>
              </div>

              {actionError && (
                <div className="p-3 rounded-xl flex items-start gap-2 text-[10px]" style={{ background: C.crimsonDim, color: C.crimson, border: `1px solid ${C.borderHot}` }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {actionError}
                </div>
              )}

              {/* Form Create */}
              <form onSubmit={handleCreateTeam} className="flex flex-col gap-3 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.gold, fontFamily: "'Cinzel', serif" }}>Forge New Clan</span>
                <input
                  type="text"
                  placeholder="Clan Name (e.g. Valhalla Vanguard)"
                  value={teamNameInput}
                  onChange={e => setTeamNameInput(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl outline-none"
                  style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.border}`, color: C.textPrimary, fontFamily: "'Cinzel', serif" }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.borderHot)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
                <button type="submit" disabled={isSubmitting || !teamNameInput.trim()}
                  className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, rgba(120,78,16,0.3), rgba(197,155,39,0.15))', border: `1px solid ${C.borderGold}`, color: C.goldBright, fontFamily: "'Cinzel', serif" }}>
                  Forge Clan
                </button>
              </form>

              {/* Form Join */}
              <form onSubmit={handleJoinTeam} className="flex flex-col gap-3">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.textMuted, fontFamily: "'Cinzel', serif" }}>Swear Fealty (Join)</span>
                <input
                  type="text"
                  placeholder="6-Rune Code"
                  value={teamCodeInput}
                  onChange={e => setTeamCodeInput(e.target.value)}
                  maxLength={6}
                  className="w-full text-xs px-4 py-2.5 rounded-xl outline-none font-mono uppercase tracking-widest"
                  style={{ background: 'rgba(20,12,12,0.8)', border: `1px solid ${C.border}`, color: C.textPrimary }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.borderHot)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.border)}
                />
                <button type="submit" disabled={isSubmitting || teamCodeInput.length !== 6}
                  className="w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                  style={{ background: C.crimsonDim, border: `1px solid ${C.borderHot}`, color: C.crimson, fontFamily: "'Cinzel', serif" }}>
                  Swear Oath
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── FEST BRIEFING MODAL ── */}
      {selectedFest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black rounded-2xl w-full max-w-lg flex flex-col shadow-2xl"
            style={{ border: `1px solid ${C.border}`, boxShadow: `0 0 30px rgba(220,38,38,0.2)` }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
              <h3 className="font-bold text-lg" style={{ fontFamily: "'Cinzel', serif", color: C.textPrimary }}>Tournament Runes</h3>
              <button onClick={() => setSelectedFest(null)} className="p-1 text-xs" style={{ color: C.textMuted }}>✕</button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div>
                <h4 className="text-sm font-bold mb-1" style={{ color: C.gold, fontFamily: "'Cinzel', serif" }}>{selectedFest.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{selectedFest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono" style={{ color: C.textMuted }}>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(20,12,12,0.6)', border: `1px solid ${C.border}` }}>
                  <div className="text-[9px] uppercase mb-1 font-sans font-bold">Dawn</div>
                  <div className="text-white">{new Date(selectedFest.start_time).toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(20,12,12,0.6)', border: `1px solid ${C.border}` }}>
                  <div className="text-[9px] uppercase mb-1 font-sans font-bold">Dusk</div>
                  <div className="text-white">{new Date(selectedFest.end_time).toLocaleString()}</div>
                </div>
              </div>

              <div className="pt-2">
                {selectedFest.effective_status === 'upcoming' && team && isCaptain ? (
                  <button onClick={() => { handleRegisterFest(selectedFest.id); setSelectedFest(null) }}
                    className="w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    style={{ background: C.crimsonDim, border: `1px solid ${C.borderHot}`, color: C.crimson, fontFamily: "'Cinzel', serif" }}>
                    Pledge Clan to Ragnarök
                  </button>
                ) : selectedFest.effective_status === 'upcoming' && team && !isCaptain ? (
                  <div className="p-3 rounded-xl text-xs text-center" style={{ border: `1px dashed ${C.border}`, color: C.textMuted }}>
                    Only the Warlord (Captain) can pledge the clan.
                  </div>
                ) : selectedFest.effective_status === 'upcoming' && !team ? (
                  <div className="p-3 rounded-xl text-xs text-center" style={{ border: `1px dashed ${C.border}`, color: C.textMuted }}>
                    Forge or join a clan to compete.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BREAK OATH MODAL ── */}
      {showLeaveConfirm && team && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black rounded-2xl w-full max-w-sm flex flex-col p-6 gap-4"
            style={{ border: `1px solid ${C.borderHot}`, boxShadow: `0 0 30px rgba(220,38,38,0.2)` }}>
            <div className="flex items-center gap-3" style={{ color: C.crimson }}>
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-lg" style={{ fontFamily: "'Cinzel', serif" }}>Break Oath?</h3>
            </div>
            <p className="text-xs" style={{ color: C.textSecondary }}>
              {isCaptain && members.length === 1
                ? 'You are the last warrior. Breaking the oath will shatter this clan forever.'
                : 'You will need a new runic code to return.'}
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setShowLeaveConfirm(false)} className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase"
                style={{ color: C.textMuted }}>Stay</button>
              <button onClick={handleLeaveTeam} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase"
                style={{ background: C.crimson, color: '#fff' }}>{isSubmitting ? '...' : 'Break Oath'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
