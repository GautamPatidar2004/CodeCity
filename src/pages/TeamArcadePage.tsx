import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useTeamArcade, useArcadeFests, useStudentFestHistory, type ArcadeFest } from '../lib/arcade'
import { GamifiedCard } from '../components/ui/GamifiedCard'
import { GamifiedButton } from '../components/ui/GamifiedButton'
import { GamifiedInput } from '../components/ui/GamifiedInput'
import { AlexPixelAvatar } from '../components/brand/PixelArtAvatars'
import { showQuestToast } from '../components/ui/GameToast'
import { FestLobbyView } from '../components/arcade/FestLobbyView'
import confetti from 'canvas-confetti'
import {
  Gamepad2,
  Users,
  Crown,
  Copy,
  Check,
  UserPlus,
  LogOut,
  Shield,
  Sparkles,
  Info,
  Loader2,
  Swords,
  AlertCircle,
  Calendar,
  Clock,
  ExternalLink,
  X,
  Flame,
  CheckCircle2,
  History,
  Trophy,
} from 'lucide-react'

function formatFestDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return dateStr
  }
}

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

  const {
    fests,
    loading: festsLoading,
    liveFests,
    upcomingFests,
    endedFests,
  } = useArcadeFests()

  const [activeFestTab, setActiveFestTab] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all')
  const [selectedFest, setSelectedFest] = useState<ArcadeFest | null>(null)
  const [activeLobbyFest, setActiveLobbyFest] = useState<ArcadeFest | null>(null)
  const [isRegisteringFest, setIsRegisteringFest] = useState(false)
  const { history: studentHistory, loading: historyLoading } = useStudentFestHistory(user?.id)

  const handleRegisterFest = async (festId: string) => {
    setIsRegisteringFest(true)
    const result = await registerFestAction(festId)
    setIsRegisteringFest(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to register squad.')
    } else {
      showQuestToast({
        title: `Squad Registered for ${result.fest_title || 'Fest'}! 🏆`,
        variant: 'complete',
      })
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } })
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
      toast.success('Team Code copied to clipboard! 📋')
      setTimeout(() => setCopiedCode(false), 2500)
    } catch {
      toast.error('Failed to copy code.')
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    const trimmed = teamNameInput.trim()
    if (trimmed.length < 2) {
      setActionError('Team name must be at least 2 characters.')
      return
    }
    if (trimmed.length > 50) {
      setActionError('Team name must be 50 characters or less.')
      return
    }

    setIsSubmitting(true)
    const result = await createTeamAction(trimmed)
    setIsSubmitting(false)

    if (!result.success) {
      const err = result.error || 'Failed to create team.'
      setActionError(err)
      toast.error(err)
    } else {
      setTeamNameInput('')
      showQuestToast({ title: `Team "${result.team_name}" Created!`, variant: 'complete' })
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    const cleanCode = teamCodeInput.trim().toUpperCase()
    if (cleanCode.length !== 6) {
      setActionError('Team code must be exactly 6 characters.')
      return
    }

    setIsSubmitting(true)
    const result = await joinTeamAction(cleanCode)
    setIsSubmitting(false)

    if (!result.success) {
      const err = result.error || 'Failed to join team.'
      setActionError(err)
      toast.error(err)
    } else {
      setTeamCodeInput('')
      toast.success(`Joined team "${result.team_name}" successfully! ⚔️`)
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } })
    }
  }

  const handleLeaveTeam = async () => {
    setIsSubmitting(true)
    const result = await leaveTeamAction()
    setIsSubmitting(false)
    setShowLeaveConfirm(false)

    if (!result.success) {
      toast.error(result.error || 'Failed to leave team.')
    } else {
      toast.success('You have left the team.')
    }
  }

  if (teamLoading || festsLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-20 gap-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <div className="font-pixel text-xs text-stone-500 uppercase">
          SYNCHRONIZING ARCADE ARENA...
        </div>
      </div>
    )
  }

  if (activeLobbyFest) {
    return (
      <FestLobbyView
        fest={activeLobbyFest}
        team={team}
        members={members}
        userId={user?.id}
        onExit={() => setActiveLobbyFest(null)}
      />
    )
  }

  const displayedFests = fests.filter((f) => {
    if (activeFestTab === 'live') return f.effective_status === 'live'
    if (activeFestTab === 'upcoming') return f.effective_status === 'upcoming'
    if (activeFestTab === 'ended') return f.effective_status === 'ended'
    return true
  })

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10 pb-16 text-left animate-in fade-in duration-200">
      {/* 1. HERO HEADER BANNER */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-linear-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-lg border-2 border-emerald-600">
        <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-400/40 text-[10px] font-pixel uppercase font-bold text-emerald-200 w-fit">
            <Swords className="w-3.5 h-3.5" />
            <span>Team Arcade • Fest Arena</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-sans tracking-tight">
            Team Arcade Arena
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-sans leading-relaxed">
            Form 4-player squads, track scheduled competitive coding fests, and collaborate with your teammates to conquer challenges.
          </p>
        </div>
      </div>

      {/* 2. FEST DISCOVERY SECTION */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-stone-900 font-sans tracking-tight">
              Scheduled Coding Fests
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-pixel text-[9px] font-bold">
              {liveFests.length} LIVE
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveFestTab('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFestTab === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All ({fests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFestTab('live')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFestTab === 'live'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Live ({liveFests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFestTab('upcoming')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFestTab === 'upcoming'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Upcoming ({upcomingFests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFestTab('ended')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFestTab === 'ended'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              Concluded ({endedFests.length})
            </button>
          </div>
        </div>

        {/* Fests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedFests.map((fest) => {
            const isLive = fest.effective_status === 'live'
            const isUpcoming = fest.effective_status === 'upcoming'
            const isRegistered = registeredFestIds.includes(fest.id)

            return (
              <GamifiedCard
                key={fest.id}
                accentColor={isLive ? 'rose' : isUpcoming ? 'amber' : 'blue'}
                className="p-5 flex flex-col justify-between gap-5 relative bg-white"
              >
                <div className="flex flex-col gap-3">
                  {/* Status Pill Header */}
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isLive && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-700 font-pixel text-[9px] font-bold uppercase">
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                          LIVE NOW
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-pixel text-[9px] font-bold uppercase">
                          <Clock className="w-3 h-3 text-amber-600" />
                          UPCOMING
                        </span>
                      )}
                      {!isLive && !isUpcoming && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-300 text-stone-600 font-pixel text-[9px] font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3 text-stone-500" />
                          CONCLUDED
                        </span>
                      )}
                    </div>

                    {isRegistered && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-pixel text-[9px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        REGISTERED
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-stone-900 font-sans tracking-tight">
                    {fest.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {fest.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-stone-100">
                  <div className="flex flex-col gap-1 text-[11px] font-mono text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Starts: {formatFestDate(fest.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Ends: {formatFestDate(fest.end_time)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <GamifiedButton
                      variant={isLive ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFest(fest)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[10px]"
                    >
                      <span>Briefing</span>
                      <ExternalLink className="w-3 h-3" />
                    </GamifiedButton>

                    {isUpcoming && isRegistered && (
                      <GamifiedButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveLobbyFest(fest)}
                        className="text-[10px] shrink-0 flex items-center gap-1 font-bold"
                      >
                        <Swords className="w-3 h-3" />
                        <span>Enter Lobby</span>
                      </GamifiedButton>
                    )}

                    {isLive && isRegistered && (
                      <GamifiedButton
                        variant="primary"
                        size="sm"
                        onClick={() => setActiveLobbyFest(fest)}
                        className="text-[10px] shrink-0 flex items-center gap-1 font-bold"
                      >
                        <Swords className="w-3 h-3" />
                        <span>Enter Arena</span>
                      </GamifiedButton>
                    )}

                    {isUpcoming && !isRegistered && (
                      <GamifiedButton
                        variant="secondary"
                        size="sm"
                        disabled={!team || !isCaptain || isRegisteringFest}
                        onClick={() => handleRegisterFest(fest.id)}
                        className="text-[10px] shrink-0"
                        title={
                          !team
                            ? 'Squad required'
                            : !isCaptain
                            ? 'Captain only'
                            : 'Register squad'
                        }
                      >
                        {isRegisteringFest ? '...' : isCaptain ? 'Register' : 'Captain Only'}
                      </GamifiedButton>
                    )}
                  </div>
                </div>
              </GamifiedCard>
            )
          })}
        </div>
      </div>

      {/* 3. SQUAD HEADQUARTERS & MEMBERSHIP SECTION */}
      <div className="flex flex-col gap-5 pt-4 border-t border-stone-200">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-stone-900 font-sans tracking-tight">
            Squad Headquarters
          </h2>
        </div>

        {/* VIEW A: USER BELONGS TO A TEAM */}
        {team ? (
          <div className="flex flex-col gap-6">
            {/* Squad Banner Card */}
            <GamifiedCard accentColor="emerald" className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
                    <Gamepad2 className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-2xl sm:text-3xl font-black text-stone-900 font-sans tracking-tight">
                        {team.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-pixel font-bold uppercase">
                        ACTIVE SQUAD
                      </span>
                      {isCaptain && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-pixel font-bold uppercase flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-600" />
                          CAPTAIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 font-medium">
                      Team Arcade Squad • 4-Player Maximum Roster
                    </p>
                  </div>
                </div>

                {/* Team Code Display with 1-Click Copy */}
                <div className="flex flex-col items-start md:items-end gap-1.5 w-full md:w-auto">
                  <span className="text-[10px] font-pixel uppercase text-stone-400 font-bold tracking-wider">
                    TEAM INVITE CODE
                  </span>
                  <div className="flex items-center gap-2 bg-[#f4f1ea] border-2 border-[#e5dfd5] p-1.5 rounded-2xl">
                    <span className="font-mono font-black text-lg text-emerald-800 tracking-widest px-3">
                      {team.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(team.code)}
                      className="p-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-stone-900 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 text-xs font-bold font-sans"
                      title="Copy team code"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-[11px] text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-stone-500" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-400">
                    Share this code with up to {Math.max(0, 4 - members.length)} more classmate{Math.max(0, 4 - members.length) === 1 ? '' : 's'}.
                  </span>
                </div>
              </div>
            </GamifiedCard>

            {/* Team Members Roster Grid */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-stone-800 uppercase font-pixel tracking-wide">
                  SQUAD ROSTER ({members.length} / 4)
                </span>
                <span className="text-xs text-stone-500">
                  {4 - members.length > 0
                    ? `${4 - members.length} open slot${4 - members.length === 1 ? '' : 's'} available`
                    : 'Squad full'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {members.map((m) => {
                  const isUserCaptain = m.role === 'captain'
                  const isCurrentUser = m.user_id === user?.id

                  return (
                    <div
                      key={m.id}
                      className={`p-5 rounded-3xl border-2 flex flex-col justify-between transition-all relative ${
                        isCurrentUser
                          ? 'bg-white border-emerald-400 shadow-sm'
                          : 'bg-white border-[#ece7df] hover:border-emerald-200'
                      }`}
                    >
                      {isUserCaptain && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 flex items-center gap-1 text-[9px] font-pixel text-amber-900 font-bold uppercase">
                          <Crown className="w-3 h-3 text-amber-600" />
                          Captain
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <AlexPixelAvatar size={44} />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-stone-900 truncate">
                              {m.profile?.full_name || m.profile?.username || 'Teammate'}
                            </div>
                            <div className="text-[11px] text-stone-400 font-mono truncate">
                              @{m.profile?.username || 'student'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                          <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-pixel font-bold">
                            LVL {m.profile?.level || 1}
                          </span>
                          <span className="text-[11px] font-mono text-stone-500 font-medium">
                            {(m.profile?.xp || 0).toLocaleString()} XP
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-medium">
                        <span>Joined</span>
                        <span>{new Date(m.joined_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )
                })}

                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, 4 - members.length) }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="p-5 rounded-3xl border-2 border-dashed border-[#ded9cf] bg-[#faf8f4]/60 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="font-pixel text-[10px] font-bold text-stone-600 uppercase">
                        Slot {members.length + idx + 1}
                      </div>
                      <div className="text-[11px] text-stone-400 font-sans">
                        Awaiting player join
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(team.code)}
                      className="px-3 py-1 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 text-[10px] font-bold font-sans cursor-pointer transition-all active:scale-95"
                    >
                      Share Code
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Info className="w-4 h-4 text-stone-400" />
                <span>
                  {isCaptain
                    ? 'As Captain, leaving will automatically transfer leadership to the next squad member.'
                    : 'You can leave this squad at any time to join or create another team.'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowLeaveConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Squad</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW B: USER DOES NOT HAVE A TEAM YET (CREATE OR JOIN) */
          <div className="flex flex-col gap-6">
            {actionError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{actionError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Create a Team */}
              <GamifiedCard accentColor="emerald" className="p-6 sm:p-7 flex flex-col justify-between gap-6 bg-white">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 font-sans">
                        Create a New Squad
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        Become Captain and invite up to 3 teammates
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateTeam} className="flex flex-col gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5 font-sans">
                        Squad Name
                      </label>
                      <GamifiedInput
                        placeholder="e.g. Byte Brawlers, Matrix Hackers"
                        value={teamNameInput}
                        onChange={(e) => setTeamNameInput(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div className="text-[11px] text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        A unique 6-character code will be generated automatically for your teammates to join.
                      </span>
                    </div>

                    <GamifiedButton
                      type="submit"
                      variant="secondary"
                      disabled={!teamNameInput.trim() || isSubmitting}
                      className="w-full mt-1"
                    >
                      {isSubmitting ? 'Creating Squad...' : 'Create Squad (Become Captain)'}
                    </GamifiedButton>
                  </form>
                </div>

                <div className="text-[10px] text-stone-400 font-pixel uppercase tracking-wide text-center">
                  Max 4 Members per Squad
                </div>
              </GamifiedCard>

              {/* Card 2: Join with Code */}
              <GamifiedCard accentColor="purple" className="p-6 sm:p-7 flex flex-col justify-between gap-6 bg-white">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 font-sans">
                        Join Existing Squad
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        Enter the 6-character code shared by your Captain
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleJoinTeam} className="flex flex-col gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5 font-sans">
                        Team Code (6 Characters)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. ABC789"
                        value={teamCodeInput}
                        onChange={(e) => setTeamCodeInput(e.target.value.toUpperCase())}
                        disabled={isSubmitting}
                        className="w-full h-12 px-4 rounded-xl border-2 border-stone-200 bg-stone-50 font-mono font-black text-center text-lg uppercase tracking-widest text-stone-900 focus:outline-none focus:border-purple-500 focus:bg-white transition-all shadow-xs"
                        required
                      />
                    </div>

                    <div className="text-[11px] text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-start gap-2">
                      <Shield className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                      <span>
                        Joining will add you as an active member. Teams are capped at 4 members maximum.
                      </span>
                    </div>

                    <GamifiedButton
                      type="submit"
                      variant="primary"
                      disabled={teamCodeInput.trim().length !== 6 || isSubmitting}
                      className="w-full mt-1"
                    >
                      {isSubmitting ? 'Joining Squad...' : 'Join Squad'}
                    </GamifiedButton>
                  </form>
                </div>

                <div className="text-[10px] text-stone-400 font-pixel uppercase tracking-wide text-center">
                  One Active Team per Student
                </div>
              </GamifiedCard>
            </div>
          </div>
        )}
      </div>

      {/* 3. STUDENT FEST HISTORY & CAREER RECORDS */}
      <div className="flex flex-col gap-5 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-black text-stone-900 font-sans tracking-tight">
              My Fest Career & History
            </h2>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {studentHistory.length} {studentHistory.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {historyLoading ? (
          <div className="p-8 rounded-3xl bg-stone-50 border border-stone-200 flex items-center justify-center gap-2 text-stone-400 text-xs font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading career records...</span>
          </div>
        ) : studentHistory.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border-2 border-dashed border-stone-200 text-center flex flex-col items-center gap-2">
            <Trophy className="w-8 h-8 text-stone-300" />
            <span className="text-xs font-bold text-stone-700 font-sans">
              No completed fest participations yet
            </span>
            <p className="text-[11px] text-stone-400 max-w-sm">
              Form a squad, register for an upcoming coding fest, and conquer challenges together to build your official Team Arcade record!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentHistory.map((h) => {
              const isFirst = h.final_rank === 1
              const isSecond = h.final_rank === 2
              const isThird = h.final_rank === 3

              return (
                <GamifiedCard
                  key={h.fest_id}
                  accentColor={isFirst ? 'amber' : 'blue'}
                  className="p-5 flex flex-col justify-between gap-4 bg-white"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-pixel text-[9px] font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-stone-500" />
                        COMPLETED FEST
                      </span>
                      <span className="text-[11px] font-mono text-stone-400">
                        {new Date(h.end_time).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900 font-sans tracking-tight">
                      {h.fest_title}
                    </h3>

                    <div className="p-3 bg-[#faf8f4] rounded-2xl border border-[#ece7df] flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-pixel text-stone-400 uppercase">
                          SQUAD
                        </span>
                        <span className="font-bold text-xs text-stone-800">
                          {h.team_name}
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-pixel text-stone-400 uppercase">
                          OFFICIAL RANK
                        </span>
                        <span className="font-black font-mono text-sm text-stone-900">
                          {isFirst ? '🥇 1st' : isSecond ? '🥈 2nd' : isThird ? '🥉 3rd' : `#${h.final_rank}`}{' '}
                          <span className="text-[10px] font-sans text-stone-400 font-normal">
                            of {h.total_teams}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="flex flex-col">
                        <span className="text-stone-400 text-[10px] font-sans">Squad Avg Score</span>
                        <span className="font-bold text-emerald-800 text-sm">
                          {h.final_team_score} pts
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-stone-400 text-[10px] font-sans">Your Contribution</span>
                        <span className="font-bold text-amber-700 text-sm">
                          {h.my_score} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <GamifiedButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const festMatch = fests.find((f) => f.id === h.fest_id)
                      if (festMatch) {
                        setSelectedFest(festMatch)
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-[10px]"
                  >
                    <span>View Official Results Briefing</span>
                    <ExternalLink className="w-3 h-3" />
                  </GamifiedButton>
                </GamifiedCard>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. FEST BRIEFING & DETAILS MODAL */}
      {selectedFest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ece7df] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-stone-50 border-b border-stone-200 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {selectedFest.effective_status === 'live' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-700 font-pixel text-[9px] font-bold uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      LIVE FEST
                    </span>
                  )}
                  {selectedFest.effective_status === 'upcoming' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-pixel text-[9px] font-bold uppercase">
                      UPCOMING FEST
                    </span>
                  )}
                  {selectedFest.effective_status === 'ended' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 font-pixel text-[9px] font-bold uppercase">
                      CONCLUDED
                    </span>
                  )}
                </div>
                <h3 className="font-black text-xl text-stone-900 font-sans tracking-tight">
                  {selectedFest.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFest(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-pixel text-stone-400 uppercase font-bold tracking-wider">
                  FEST OVERVIEW
                </span>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {selectedFest.description}
                </p>
              </div>

              {/* Schedule Box */}
              <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ece7df] flex flex-col gap-2.5">
                <span className="text-[10px] font-pixel text-stone-500 uppercase font-bold tracking-wider">
                  SCHEDULE & TIME WINDOW
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-stone-400 font-sans text-[11px]">Start Time</span>
                    <span className="font-bold text-stone-800">
                      {formatFestDate(selectedFest.start_time)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-stone-400 font-sans text-[11px]">End Time</span>
                    <span className="font-bold text-stone-800">
                      {formatFestDate(selectedFest.end_time)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Squad Status Callout */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 leading-relaxed">
                  <span className="font-bold font-sans">Squad Collaboration Rules</span>
                  <span>
                    {team
                      ? `Your squad "${team.name}" (${members.length}/4 members) is ready in the arcade realm.`
                      : 'You do not have a squad yet. Create or join a 4-player team below before competing.'}
                  </span>
                </div>
              </div>

              {/* Fest Registration Box */}
              <div className="p-4 rounded-2xl bg-white border border-[#ece7df] shadow-2xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-pixel text-stone-500 uppercase font-bold tracking-wider">
                    SQUAD REGISTRATION
                  </span>
                  {selectedFest.effective_status === 'upcoming' && (
                    <span className="text-[10px] font-bold text-amber-700 font-mono">
                      Registration Open
                    </span>
                  )}
                </div>

                {registeredFestIds.includes(selectedFest.id) ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col gap-3 text-emerald-900 text-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold font-sans">Squad Registered!</span>
                        <span className="text-emerald-700 text-[11px]">
                          Your squad &quot;{team?.name}&quot; is officially enrolled and ready.
                        </span>
                      </div>
                    </div>

                    {selectedFest.effective_status !== 'ended' && (
                      <GamifiedButton
                        variant={selectedFest.effective_status === 'live' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => {
                          const target = selectedFest
                          setSelectedFest(null)
                          setActiveLobbyFest(target)
                        }}
                        className="w-full flex items-center justify-center gap-2 text-xs"
                      >
                        <Swords className="w-4 h-4" />
                        <span>
                          {selectedFest.effective_status === 'live'
                            ? 'Enter Live Arena ⚔️'
                            : 'Enter Fest Lobby 🚪'}
                        </span>
                      </GamifiedButton>
                    )}
                  </div>
                ) : selectedFest.effective_status === 'upcoming' ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {team
                        ? isCaptain
                          ? 'Registration is open for this competition. As squad Captain, you can register your team now.'
                          : `Registration is open. Your squad Captain (${
                              members.find((m) => m.role === 'captain')?.profile?.full_name || 'Captain'
                            }) must confirm registration.`
                        : 'You must form or join a 4-player squad below before registering for this fest.'}
                    </p>

                    {team && isCaptain && (
                      <GamifiedButton
                        variant="secondary"
                        size="md"
                        disabled={isRegisteringFest}
                        onClick={() => handleRegisterFest(selectedFest.id)}
                        className="w-full flex items-center justify-center gap-2 text-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isRegisteringFest ? 'Registering Squad...' : 'Register Squad for Fest'}</span>
                      </GamifiedButton>
                    )}

                    {team && !isCaptain && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Only your squad Captain can submit registration.</span>
                      </div>
                    )}
                  </div>
                ) : selectedFest.effective_status === 'ended' ? (
                  <div className="p-3 bg-stone-100 rounded-2xl flex flex-col gap-2.5 text-stone-700 text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>Registration closed: This fest has concluded.</span>
                    </div>
                    {registeredFestIds.includes(selectedFest.id) && (
                      <GamifiedButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const target = selectedFest
                          setSelectedFest(null)
                          setActiveLobbyFest(target)
                        }}
                        className="w-full flex items-center justify-center gap-2 text-xs"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>View Final Standings & Results</span>
                      </GamifiedButton>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-stone-100 rounded-xl text-stone-600 text-xs flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>Registration closed: This fest is currently live in competition.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
              <GamifiedButton
                variant="primary"
                size="sm"
                onClick={() => setSelectedFest(null)}
              >
                Close Briefing
              </GamifiedButton>
            </div>
          </div>
        </div>
      )}

      {/* 5. LEAVE SQUAD CONFIRMATION MODAL */}
      {showLeaveConfirm && team && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ece7df] shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900 font-sans">
                  Leave {team.name}?
                </h3>
                <p className="text-xs text-stone-500">
                  Are you sure you want to exit your current squad?
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-2xl border border-stone-100">
              {isCaptain && members.length === 1
                ? 'You are the only member. Leaving will permanently disband this team.'
                : 'You will need an invitation code to re-join.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <GamifiedButton
                variant="ghost"
                size="sm"
                onClick={() => setShowLeaveConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </GamifiedButton>
              <GamifiedButton
                variant="danger"
                size="sm"
                onClick={handleLeaveTeam}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Leaving...' : 'Confirm Leave'}
              </GamifiedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
