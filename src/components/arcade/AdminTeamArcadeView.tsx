import React, { useState } from 'react'
import {
  Swords,
  PlusCircle,
  Search,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Send,
  CheckCircle2,
  Radio,
  RefreshCw,
  Code2,
  Trophy,
  X,
} from 'lucide-react'
import {
  useAdminBattles,
  deleteBattle,
  publishBattle,
  fetchBattleLeaderboard,
  type BattleLeaderboardEntry,
  type ArcadeBattle,
  type ArcadeBattleStatus,
} from '../../lib/arcade'
import { useAuth } from '../../context/AuthContext'
import { GamifiedCard } from '../ui/GamifiedCard'
import { GamifiedButton } from '../ui/GamifiedButton'
import { BattleCreatorModal } from './BattleCreatorModal'
import { BattleLeaderboardTable } from './BattleLeaderboardTable'
import { toast } from 'react-hot-toast'
import { showQuestToast } from '../ui/GameToast'

function formatDateTime(isoStr: string) {
  try {
    const d = new Date(isoStr)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoStr
  }
}

export const AdminTeamArcadeView: React.FC = () => {
  const { user } = useAuth()
  const { battles, loading, refreshBattles } = useAdminBattles()

  const [searchTerm, setSearchTerm] = useState('')
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | ArcadeBattleStatus>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBattleToEdit, setSelectedBattleToEdit] = useState<ArcadeBattle | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [resultsBattle, setResultsBattle] = useState<ArcadeBattle | null>(null)
  const [resultsData, setResultsData] = useState<BattleLeaderboardEntry[]>([])
  const [isLoadingResults, setIsLoadingResults] = useState(false)

  const handleViewResults = async (b: ArcadeBattle) => {
    setResultsBattle(b)
    setIsLoadingResults(true)
    const data = await fetchBattleLeaderboard(b.id)
    setResultsData(data)
    setIsLoadingResults(false)
  }

  // KPI Calculations
  const totalCount = battles.length
  const liveCount = battles.filter((b) => b.effective_status === 'live').length
  const upcomingCount = battles.filter((b) => b.effective_status === 'upcoming').length
  const draftCount = battles.filter((b) => b.effective_status === 'draft').length
  const endedCount = battles.filter((b) => b.effective_status === 'ended').length

  // Filtered battles
  const filteredBattles = battles.filter((b) => {
    const matchesTab = activeStatusTab === 'all' ? true : b.effective_status === activeStatusTab
    const term = searchTerm.toLowerCase().trim()
    const matchesSearch =
      !term ||
      b.title.toLowerCase().includes(term) ||
      b.description.toLowerCase().includes(term) ||
      b.rules.toLowerCase().includes(term)
    return matchesTab && matchesSearch
  })

  const handleOpenCreateModal = () => {
    setSelectedBattleToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (battle: ArcadeBattle) => {
    setSelectedBattleToEdit(battle)
    setIsModalOpen(true)
  }

  const handlePublishDraft = async (battle: ArcadeBattle) => {
    setActionLoadingId(battle.id)
    const res = await publishBattle(battle.id, user?.id)
    setActionLoadingId(null)

    if (!res.success) {
      toast.error(res.error || 'Failed to publish battle.')
    } else {
      showQuestToast({
        title: `Battle "${battle.title}" is now Published! ⚔️`,
        variant: 'complete',
      })
      refreshBattles()
    }
  }

  const handleDelete = async (battle: ArcadeBattle) => {
    if (!confirm(`Are you sure you want to delete battle "${battle.title}"? This cannot be undone.`)) {
      return
    }

    setActionLoadingId(battle.id)
    const res = await deleteBattle(battle.id, user?.id)
    setActionLoadingId(null)

    if (!res.success) {
      toast.error(res.error || 'Failed to delete battle.')
    } else {
      toast.success('Battle deleted successfully.')
      refreshBattles()
    }
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-12 text-left animate-in fade-in duration-300">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl border border-purple-200/60 shadow-xs">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 font-pixel uppercase tracking-wide">
                Admin Team Arcade • Battles
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-pixel font-bold">
                Competitive Ops
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Design, schedule, configure scoring, and publish squad coding battles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshBattles}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Battles"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          <GamifiedButton
            variant="secondary"
            size="md"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Battle</span>
          </GamifiedButton>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GamifiedCard className="p-4 flex items-center gap-3 border-l-4 border-l-purple-500">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 font-pixel">{totalCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">Total Battles</div>
          </div>
        </GamifiedCard>

        <GamifiedCard className="p-4 flex items-center gap-3 border-l-4 border-l-emerald-500">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Radio className="w-5 h-5 animate-pulse text-emerald-600" />
          </div>
          <div>
            <div className="text-lg font-black text-emerald-600 font-pixel">{liveCount} Live</div>
            <div className="text-[11px] text-slate-500 font-medium">Active Arena</div>
          </div>
        </GamifiedCard>

        <GamifiedCard className="p-4 flex items-center gap-3 border-l-4 border-l-blue-500">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-blue-600 font-pixel">{upcomingCount} Upcoming</div>
            <div className="text-[11px] text-slate-500 font-medium">Scheduled</div>
          </div>
        </GamifiedCard>

        <GamifiedCard className="p-4 flex items-center gap-3 border-l-4 border-l-amber-500">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-amber-600 font-pixel">{draftCount} Drafts</div>
            <div className="text-[11px] text-slate-500 font-medium">Unpublished</div>
          </div>
        </GamifiedCard>
      </div>

      {/* Battles Management Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        {/* Table Filter and Search Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto">
            {(['all', 'live', 'upcoming', 'draft', 'ended'] as const).map((tab) => {
              const isActive = activeStatusTab === tab
              const count =
                tab === 'all'
                  ? totalCount
                  : tab === 'live'
                  ? liveCount
                  : tab === 'upcoming'
                  ? upcomingCount
                  : tab === 'draft'
                  ? draftCount
                  : endedCount

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveStatusTab(tab)}
                  className={`px-3 py-1.5 rounded-xl font-pixel uppercase text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                      isActive ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search battles by title or rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Battles List Content */}
        {filteredBattles.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <Swords className="w-6 h-6" />
            </div>
            <div className="font-pixel text-sm font-bold text-slate-700 uppercase">
              No Arcade Battles Found
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchTerm || activeStatusTab !== 'all'
                ? 'No battles match your active filter criteria. Clear filters or search term to see all.'
                : 'Create your first Team Arcade competitive coding battle to get started!'}
            </p>
            {activeStatusTab === 'all' && !searchTerm && (
              <GamifiedButton
                variant="secondary"
                size="sm"
                onClick={handleOpenCreateModal}
                className="mt-2"
              >
                + Create Battle Now
              </GamifiedButton>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 font-pixel text-[10px] text-slate-400 tracking-wider">
                  <th className="py-3 px-5">BATTLE</th>
                  <th className="py-3 px-4">LIFECYCLE</th>
                  <th className="py-3 px-4">SCHEDULE & DURATION</th>
                  <th className="py-3 px-4">SCORING SYSTEM</th>
                  <th className="py-3 px-4 text-right">ADMIN ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBattles.map((battle) => {
                  const isDraft = battle.status === 'draft'
                  const isEnded = battle.effective_status === 'ended'
                  const isLive = battle.effective_status === 'live'
                  const isUpcoming = battle.effective_status === 'upcoming'

                  return (
                    <tr
                      key={battle.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Battle Info */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0 border border-purple-100">
                            <Swords className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm truncate">
                              {battle.title}
                            </div>
                            {battle.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {battle.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {battle.id.slice(0, 8)}...
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-pixel uppercase font-bold flex items-center gap-1 ${
                                  (battle.exercise_count ?? 0) > 0
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                <Code2 className="w-2.5 h-2.5" />
                                <span>{battle.exercise_count ?? 0} Quest{(battle.exercise_count ?? 0) !== 1 ? 's' : ''}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status / Lifecycle Badge */}
                      <td className="py-4 px-4">
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-pixel font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>LIVE ARENA</span>
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-pixel font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                            <Calendar className="w-3 h-3 text-blue-600" />
                            <span>UPCOMING</span>
                          </span>
                        )}
                        {isDraft && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-pixel font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                            <Edit3 className="w-3 h-3 text-amber-600" />
                            <span>DRAFT</span>
                          </span>
                        )}
                        {isEnded && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-pixel font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            <span>CONCLUDED</span>
                          </span>
                        )}
                      </td>

                      {/* Schedule & Duration */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{formatDateTime(battle.start_time)}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span>➔ {formatDateTime(battle.end_time)}</span>
                            <span className="font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                              {battle.duration_minutes}m
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Scoring Configuration */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-mono text-[10px] font-bold"
                            title="Base Points"
                          >
                            ⭐ {battle.base_points} pts
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold"
                            title="Speed Bonus Max"
                          >
                            ⚡ +{battle.speed_bonus_max}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px] font-bold"
                            title="Wrong Answer Penalty"
                          >
                            ⚠️ -{battle.wrong_answer_penalty}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-bold"
                            title="Submission Cooldown"
                          >
                            ⏱️ {battle.submission_cooldown_seconds}s
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 capitalize font-medium">
                          Tie-break: {battle.tie_breaker_rule.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDraft && (
                            <button
                              type="button"
                              onClick={() => handlePublishDraft(battle)}
                              disabled={actionLoadingId === battle.id}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-pixel text-[10px] uppercase font-bold transition-all cursor-pointer flex items-center gap-1 border border-emerald-200"
                              title="Publish Draft Battle"
                            >
                              <Send className="w-3 h-3" />
                              <span>Publish</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleViewResults(battle)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 transition-all cursor-pointer"
                            title="View Standings & Live Results"
                          >
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(battle)}
                            disabled={isEnded || actionLoadingId === battle.id}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-all cursor-pointer disabled:opacity-40"
                            title={isEnded ? 'Concluded battles cannot be modified' : 'Edit Battle Parameters'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(battle)}
                            disabled={actionLoadingId === battle.id}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                            title="Delete Battle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Battle Creator / Editor Modal */}
      <BattleCreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        battleToEdit={selectedBattleToEdit}
        onSuccess={() => {
          refreshBattles()
        }}
      />

      {/* Admin Battle Results Modal */}
      {resultsBattle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-sans">
                    {resultsBattle.title} — Official Standings
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    Status: <span className="uppercase font-pixel text-[10px]">{resultsBattle.effective_status}</span> • Duration: {resultsBattle.duration_minutes}m
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResultsBattle(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
              {isLoadingResults ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-7 h-7 animate-spin text-purple-600" />
                  <span className="font-pixel text-xs">Loading Leaderboard Standings...</span>
                </div>
              ) : (
                <BattleLeaderboardTable
                  entries={resultsData}
                  isEnded={resultsBattle.effective_status === 'ended'}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
