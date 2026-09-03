import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Swords,
  Calendar,
  Clock,
  Award,
  Zap,
  AlertTriangle,
  Timer,
  Scale,
  FileText,
  Loader2,
  CheckCircle2,
  Send,
  Save,
  Search,
  Code2,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  ListOrdered,
  Layers,
} from 'lucide-react'
import {
  createBattle,
  updateBattle,
  publishBattle,
  validateBattleInput,
  fetchBattleExercises,
  saveBattleExercises,
  type ArcadeBattle,
  type TieBreakerRule,
} from '../../lib/arcade'
import { fetchAdminChallenges, type Challenge } from '../../lib/challenges'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
import { showQuestToast } from '../ui/GameToast'

interface BattleCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (battle: ArcadeBattle) => void
  battleToEdit?: ArcadeBattle | null
}

function toLocalDatetimeInputString(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date(Date.now() + 3600000) // Default 1 hour from now
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const BattleCreatorModal: React.FC<BattleCreatorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  battleToEdit,
}) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'config' | 'questions'>('config')

  // Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')
  const [startTime, setStartTime] = useState(() => toLocalDatetimeInputString())
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [endTime, setEndTime] = useState(() => toLocalDatetimeInputString(new Date(Date.now() + 7200000).toISOString()))
  
  // Scoring Config
  const [basePoints, setBasePoints] = useState(100)
  const [speedBonusMax, setSpeedBonusMax] = useState(50)
  const [wrongAnswerPenalty, setWrongAnswerPenalty] = useState(10)
  const [submissionCooldownSeconds, setSubmissionCooldownSeconds] = useState(30)
  const [tieBreakerRule, setTieBreakerRule] = useState<TieBreakerRule>('fastest_time')

  // Question Selection State
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([])
  const [selectedChallenges, setSelectedChallenges] = useState<Challenge[]>([])
  const [questionSearch, setQuestionSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [languageFilter, setLanguageFilter] = useState('All')
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load available challenges from existing catalog
  useEffect(() => {
    if (isOpen) {
      const loadCatalog = async () => {
        setLoadingQuestions(true)
        const challenges = await fetchAdminChallenges()
        setAvailableChallenges(challenges)
        setLoadingQuestions(false)
      }
      loadCatalog()
    }
  }, [isOpen])

  // Populate when editing or resetting
  useEffect(() => {
    if (!isOpen) return

    if (battleToEdit) {
      setTitle(battleToEdit.title)
      setDescription(battleToEdit.description || '')
      setRules(battleToEdit.rules || '')
      setStartTime(toLocalDatetimeInputString(battleToEdit.start_time))
      setEndTime(toLocalDatetimeInputString(battleToEdit.end_time))
      setDurationMinutes(battleToEdit.duration_minutes || 60)
      setBasePoints(battleToEdit.base_points ?? 100)
      setSpeedBonusMax(battleToEdit.speed_bonus_max ?? 50)
      setWrongAnswerPenalty(battleToEdit.wrong_answer_penalty ?? 10)
      setSubmissionCooldownSeconds(battleToEdit.submission_cooldown_seconds ?? 30)
      setTieBreakerRule(battleToEdit.tie_breaker_rule || 'fastest_time')

      // Fetch existing assigned questions for this battle
      const loadAssigned = async () => {
        const battleExercises = await fetchBattleExercises(battleToEdit.id)
        const mapped: Challenge[] = battleExercises
          .filter((be) => be.challenge)
          .map((be) => be.challenge as Challenge)
        setSelectedChallenges(mapped)
      }
      loadAssigned()
    } else {
      // Defaults for brand new battle
      const start = new Date(Date.now() + 3600000)
      const end = new Date(start.getTime() + 60 * 60000)
      setTitle('')
      setDescription('')
      setRules('1. Fair play: No unauthorized external bots.\n2. Collaborative submission: Team members work together.\n3. Scoring penalty applies to failed test suite submissions.')
      setStartTime(toLocalDatetimeInputString(start.toISOString()))
      setEndTime(toLocalDatetimeInputString(end.toISOString()))
      setDurationMinutes(60)
      setBasePoints(100)
      setSpeedBonusMax(50)
      setWrongAnswerPenalty(10)
      setSubmissionCooldownSeconds(30)
      setTieBreakerRule('fastest_time')
      setSelectedChallenges([])
    }
    setActiveTab('config')
    setErrors({})
  }, [battleToEdit, isOpen])

  // Sync end time when start time or duration changes
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart)
    const startDate = new Date(newStart)
    if (!isNaN(startDate.getTime()) && durationMinutes > 0) {
      const calculatedEnd = new Date(startDate.getTime() + durationMinutes * 60000)
      setEndTime(toLocalDatetimeInputString(calculatedEnd.toISOString()))
    }
  }

  const handleDurationChange = (newDuration: number) => {
    setDurationMinutes(newDuration)
    const startDate = new Date(startTime)
    if (!isNaN(startDate.getTime()) && newDuration > 0) {
      const calculatedEnd = new Date(startDate.getTime() + newDuration * 60000)
      setEndTime(toLocalDatetimeInputString(calculatedEnd.toISOString()))
    }
  }

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd)
    const startDate = new Date(startTime)
    const endDate = new Date(newEnd)
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diffMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)
      if (diffMinutes > 0) {
        setDurationMinutes(diffMinutes)
      }
    }
  }

  // Question selection actions
  const handleAddChallenge = (challenge: Challenge) => {
    if (selectedChallenges.some((c) => c.id === challenge.id)) {
      toast.error('This challenge is already in the question set.')
      return
    }
    setSelectedChallenges((prev) => [...prev, challenge])
  }

  const handleRemoveChallenge = (challengeId: string) => {
    setSelectedChallenges((prev) => prev.filter((c) => c.id !== challengeId))
  }

  const handleMoveChallenge = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= selectedChallenges.length) return
    const reordered = [...selectedChallenges]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    setSelectedChallenges(reordered)
  }

  // Filtered available challenges
  const filteredAvailableChallenges = availableChallenges.filter((ch) => {
    const term = questionSearch.toLowerCase().trim()
    const matchesSearch =
      !term ||
      ch.title.toLowerCase().includes(term) ||
      ch.slug.toLowerCase().includes(term) ||
      (ch.description && ch.description.toLowerCase().includes(term))

    const matchesDifficulty =
      difficultyFilter === 'All' || ch.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()

    const matchesLanguage =
      languageFilter === 'All' ||
      (ch.language && ch.language.toLowerCase() === languageFilter.toLowerCase()) ||
      (ch.category && ch.category.toLowerCase() === languageFilter.toLowerCase())

    return matchesSearch && matchesDifficulty && matchesLanguage
  })

  const handleSubmit = async (targetStatus: 'draft' | 'upcoming') => {
    setErrors({})

    // Publish Safety check
    if (targetStatus === 'upcoming') {
      if (selectedChallenges.length === 0) {
        setActiveTab('questions')
        setErrors({ questions: 'Publishing requires at least 1 coding exercise to be attached.' })
        toast.error('Cannot publish: At least 1 question must be selected.')
        return
      }
    }

    const startDateObj = new Date(startTime)
    const endDateObj = new Date(endTime)

    const payload = {
      title,
      description,
      rules,
      start_time: startDateObj.toISOString(),
      end_time: endDateObj.toISOString(),
      status: targetStatus,
      base_points: Number(basePoints),
      speed_bonus_max: Number(speedBonusMax),
      wrong_answer_penalty: Number(wrongAnswerPenalty),
      submission_cooldown_seconds: Number(submissionCooldownSeconds),
      tie_breaker_rule: tieBreakerRule,
    }

    const validation = validateBattleInput(payload, targetStatus === 'upcoming')
    if (!validation.valid) {
      setErrors(validation.errors)
      setActiveTab('config')
      toast.error('Please resolve highlighted configuration errors.')
      return
    }

    setIsSubmitting(true)

    try {
      if (battleToEdit) {
        // 1. Save ordered battle questions first
        const exerciseIds = selectedChallenges.map((c) => c.id)
        const saveExRes = await saveBattleExercises(battleToEdit.id, exerciseIds, user?.id)
        if (!saveExRes.success) {
          toast.error(saveExRes.error || 'Failed to save battle questions.')
          setIsSubmitting(false)
          return
        }

        // 2. Update battle parameters (maintain draft status if we are about to publish)
        const updatePayload = {
          ...payload,
          status: targetStatus === 'upcoming' ? 'draft' : targetStatus,
        }
        const updateRes = await updateBattle(battleToEdit.id, updatePayload, user?.id)
        if (!updateRes.success || !updateRes.battle) {
          toast.error(updateRes.error || 'Failed to update battle.')
          setIsSubmitting(false)
          return
        }

        // 3. If publishing, invoke publishBattle to verify and finalize publish lifecycle
        if (targetStatus === 'upcoming') {
          const pubRes = await publishBattle(battleToEdit.id, user?.id)
          if (!pubRes.success) {
            toast.error(pubRes.error || 'Failed to publish battle.')
            setIsSubmitting(false)
            return
          }
        }

        showQuestToast({
          title: targetStatus === 'upcoming'
            ? `Battle "${updateRes.battle.title}" Published! ⚔️`
            : `Battle "${updateRes.battle.title}" Updated!`,
          variant: 'complete',
        })
        onSuccess({
          ...updateRes.battle,
          exercise_count: exerciseIds.length,
          status: targetStatus === 'upcoming' ? 'upcoming' : updateRes.battle.status,
          effective_status: targetStatus === 'upcoming' ? 'upcoming' : updateRes.battle.effective_status,
        })
        onClose()
      } else {
        // Create new battle as draft first so questions can be safely attached
        const createRes = await createBattle({ ...payload, status: 'draft' }, user?.id)
        if (!createRes.success || !createRes.battle) {
          toast.error(createRes.error || 'Failed to create battle.')
          setIsSubmitting(false)
          return
        }

        // Save ordered battle questions
        const exerciseIds = selectedChallenges.map((c) => c.id)
        const saveExRes = await saveBattleExercises(createRes.battle.id, exerciseIds, user?.id)
        if (!saveExRes.success) {
          toast.error(saveExRes.error || 'Failed to attach questions to new battle.')
        }

        // If targetStatus is upcoming, invoke publishBattle to verify and finalize publish lifecycle
        if (targetStatus === 'upcoming') {
          const pubRes = await publishBattle(createRes.battle.id, user?.id)
          if (!pubRes.success) {
            toast.error(pubRes.error || 'Failed to publish battle.')
            setIsSubmitting(false)
            return
          }
        }

        showQuestToast({
          title: targetStatus === 'upcoming'
            ? `Battle "${createRes.battle.title}" Published! ⚔️`
            : `Draft "${createRes.battle.title}" Saved! 📝`,
          variant: 'complete',
        })
        onSuccess({
          ...createRes.battle,
          exercise_count: exerciseIds.length,
          status: targetStatus,
          effective_status: targetStatus,
        })
        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isEditing = !!battleToEdit
  const isLocked = isEditing && (battleToEdit.effective_status === 'live' || battleToEdit.effective_status === 'ended')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left overflow-y-auto animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 via-slate-50 to-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-pixel text-base font-bold text-slate-900 uppercase tracking-wide">
                  {isEditing ? 'Edit Arcade Battle' : 'Create Team Arcade Battle'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isEditing
                    ? `Updating parameters for Battle #${battleToEdit.id.slice(0, 8)}`
                    : 'Configure schedule, scoring rules, and select coding challenges.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Header Navigation Tabs: Config vs Questions */}
          <div className="px-6 pt-3 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-pixel uppercase text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'config'
                  ? 'border-purple-600 text-purple-900 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>1. Parameters & Scoring</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-pixel uppercase text-[11px] font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'questions'
                  ? 'border-purple-600 text-purple-900 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              <span>2. Question Selection</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  selectedChallenges.length > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {selectedChallenges.length}
              </span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 flex flex-col text-xs">
            {/* TAB 1: BATTLE CONFIGURATION & SCORING */}
            {activeTab === 'config' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-150">
                {/* Section 1: Basic Information */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-slate-800 font-pixel uppercase font-bold text-[11px]">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Battle Identity & Briefing</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">
                      Battle Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ByteClash 2026: Dynamic Programming Showdown"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isLocked}
                      className={`h-11 px-3.5 rounded-xl border font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-none transition-all disabled:opacity-50 ${
                        errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-purple-500'
                      }`}
                    />
                    {errors.title && <span className="text-rose-600 font-medium text-[11px]">{errors.title}</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief summary displayed to squads in the arcade battle catalog..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isLocked}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 transition-all resize-none disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">Official Rules & Guidelines</label>
                    <textarea
                      rows={3}
                      placeholder="Rules regarding test cases, allowed packages, team cooperation..."
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                      disabled={isLocked}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 text-[11px] focus:bg-white focus:outline-none focus:border-purple-500 transition-all resize-none disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Section 2: Schedule & Duration */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-slate-800 font-pixel uppercase font-bold text-[11px]">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Battle Window & Duration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Start Date & Time</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        disabled={isLocked}
                        className={`h-10 px-2.5 rounded-xl border bg-white font-medium text-slate-800 focus:outline-none text-[11px] disabled:opacity-50 ${
                          errors.start_time ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                      {errors.start_time && <span className="text-rose-600 text-[10px]">{errors.start_time}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration (Minutes)</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10080}
                        value={durationMinutes}
                        onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
                        disabled={isLocked}
                        className={`h-10 px-2.5 rounded-xl border bg-white font-medium text-slate-800 focus:outline-none text-[11px] disabled:opacity-50 ${
                          errors.duration ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                      {errors.duration && <span className="text-rose-600 text-[10px]">{errors.duration}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>End Date & Time</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => handleEndTimeChange(e.target.value)}
                        disabled={isLocked}
                        className={`h-10 px-2.5 rounded-xl border bg-white font-medium text-slate-800 focus:outline-none text-[11px] disabled:opacity-50 ${
                          errors.end_time ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-emerald-500'
                        }`}
                      />
                      {errors.end_time && <span className="text-rose-600 text-[10px]">{errors.end_time}</span>}
                    </div>
                  </div>
                </div>

                {/* Section 3: Scoring Configuration */}
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-purple-900 font-pixel uppercase font-bold text-[11px]">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Scoring & Competitive Mechanics</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Award className="w-3 h-3 text-purple-500" />
                        <span>Base Points</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={basePoints}
                        onChange={(e) => setBasePoints(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={isLocked}
                        className={`h-10 px-2.5 rounded-xl border bg-white font-mono font-bold text-slate-800 focus:outline-none text-xs disabled:opacity-50 ${
                          errors.base_points ? 'border-rose-400' : 'border-slate-200 focus:border-purple-500'
                        }`}
                      />
                      {errors.base_points && <span className="text-rose-600 text-[10px]">{errors.base_points}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Speed Bonus Max</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={speedBonusMax}
                        onChange={(e) => setSpeedBonusMax(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={isLocked}
                        className={`h-10 px-2.5 rounded-xl border bg-white font-mono font-bold text-amber-700 focus:outline-none text-xs disabled:opacity-50 ${
                          errors.speed_bonus_max ? 'border-rose-400' : 'border-slate-200 focus:border-purple-500'
                        }`}
                      />
                      {errors.speed_bonus_max && <span className="text-rose-600 text-[10px]">{errors.speed_bonus_max}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        <span>Wrong Penalty</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={wrongAnswerPenalty}
                        onChange={(e) => setWrongAnswerPenalty(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={isLocked}
                        className={`h-10 px-2.5 rounded-xl border bg-white font-mono font-bold text-rose-700 focus:outline-none text-xs disabled:opacity-50 ${
                          errors.wrong_answer_penalty ? 'border-rose-400' : 'border-slate-200 focus:border-purple-500'
                        }`}
                      />
                      {errors.wrong_answer_penalty && <span className="text-rose-600 text-[10px]">{errors.wrong_answer_penalty}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-blue-500" />
                        <span>Cooldown (Sec)</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={submissionCooldownSeconds}
                        onChange={(e) => setSubmissionCooldownSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={isLocked}
                        className={`h-10 px-2.5 rounded-xl border bg-white font-mono font-bold text-blue-700 focus:outline-none text-xs disabled:opacity-50 ${
                          errors.submission_cooldown_seconds ? 'border-rose-400' : 'border-slate-200 focus:border-purple-500'
                        }`}
                      />
                      {errors.submission_cooldown_seconds && (
                        <span className="text-rose-600 text-[10px]">{errors.submission_cooldown_seconds}</span>
                      )}
                    </div>
                  </div>

                  {/* Tie-breaker Rule */}
                  <div className="flex flex-col gap-1 mt-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-purple-600" />
                      <span>Tie-Breaker Rule</span>
                    </label>
                    <select
                      value={tieBreakerRule}
                      onChange={(e) => setTieBreakerRule(e.target.value as TieBreakerRule)}
                      disabled={isLocked}
                      className="h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-purple-500 text-xs disabled:opacity-50"
                    >
                      <option value="fastest_time">Fastest Total Solve Time (Standard Competitive)</option>
                      <option value="least_submissions">Fewest Incorrect Submissions Attempted</option>
                      <option value="highest_speed_bonus">Highest Accumulated Speed Bonus</option>
                      <option value="earliest_submission">Earliest Accepted Final Submission</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: QUESTION / QUEST SELECTION */}
            {activeTab === 'questions' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-150">
                {errors.questions && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errors.questions}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Catalog Browser & Filters (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-pixel uppercase font-bold text-slate-800 text-[11px]">
                        <Code2 className="w-4 h-4 text-purple-600" />
                        <span>Existing Exercises Catalog</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {filteredAvailableChallenges.length} challenges available
                      </span>
                    </div>

                    {/* Search & Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="relative sm:col-span-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search questions..."
                          value={questionSearch}
                          onChange={(e) => setQuestionSearch(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] focus:bg-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <select
                        value={languageFilter}
                        onChange={(e) => setLanguageFilter(e.target.value)}
                        className="h-8 px-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-700 focus:outline-none focus:border-purple-500"
                      >
                        <option value="All">All Tracks / Languages</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>

                      <select
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                        className="h-8 px-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-700 focus:outline-none focus:border-purple-500"
                      >
                        <option value="All">All Difficulties</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    {/* Challenges Scrollable List */}
                    <div className="border border-slate-200 rounded-2xl overflow-y-auto max-h-[380px] divide-y divide-slate-100 bg-slate-50/50">
                      {loadingQuestions ? (
                        <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span>Loading exercise catalog...</span>
                        </div>
                      ) : filteredAvailableChallenges.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 font-pixel text-[11px]">
                          No coding exercises match your filter.
                        </div>
                      ) : (
                        filteredAvailableChallenges.map((ch) => {
                          const isSelected = selectedChallenges.some((s) => s.id === ch.id)

                          return (
                            <div
                              key={ch.id}
                              className="p-3 bg-white hover:bg-purple-50/30 transition-colors flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs truncate">
                                    {ch.title}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-pixel uppercase font-bold bg-purple-100 text-purple-800">
                                    {ch.language || ch.category}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
                                    {ch.difficulty}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                  /{ch.slug} • +{ch.xp_reward ?? 75} XP
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddChallenge(ch)}
                                disabled={isSelected || isLocked}
                                className={`px-2.5 py-1.5 rounded-xl font-pixel uppercase text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default opacity-90'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Selected</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Ordered Battle Question Set (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-pixel uppercase font-bold text-slate-800 text-[11px]">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span>Ordered Question Set</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono">
                        {selectedChallenges.length} Questions
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2 min-h-[380px] max-h-[380px] overflow-y-auto">
                      {selectedChallenges.length === 0 ? (
                        <div className="my-auto p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                          <ListOrdered className="w-6 h-6 text-slate-300" />
                          <div className="font-pixel text-xs text-slate-500 uppercase">
                            NO QUESTIONS SELECTED YET
                          </div>
                          <p className="text-[10px] text-slate-400 max-w-xs">
                            Add exercises from the catalog on the left. The battle will present questions to participating squads in this deterministic order.
                          </p>
                        </div>
                      ) : (
                        selectedChallenges.map((ch, idx) => (
                          <div
                            key={ch.id}
                            className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-pixel text-[10px] font-bold flex items-center justify-center shrink-0">
                                #{idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-xs truncate">
                                  {ch.title}
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono">
                                  {ch.language || ch.category} • {ch.difficulty}
                                </div>
                              </div>
                            </div>

                            {!isLocked && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveChallenge(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveChallenge(idx, 'down')}
                                  disabled={idx === selectedChallenges.length - 1}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChallenge(ch.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="Remove from Battle"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-500">
              {isLocked ? (
                <span className="text-amber-700 font-medium">
                  🔒 Battle is {battleToEdit?.effective_status}. Questions and parameters cannot be altered.
                </span>
              ) : selectedChallenges.length === 0 ? (
                <span className="text-slate-500">
                  Select at least 1 exercise before publishing this battle.
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">
                  ✓ {selectedChallenges.length} coding challenge{selectedChallenges.length > 1 ? 's' : ''} locked in deterministic sequence.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              {!isLocked && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubmit('draft')}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-pixel uppercase font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubmit('upcoming')}
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-pixel uppercase font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isEditing && battleToEdit.status !== 'draft' ? 'Save & Update' : 'Publish Battle'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
