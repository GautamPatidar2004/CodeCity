import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Compass,
  Clock,
  Award,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Save,
  Send,
  Sparkles,
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  Terminal,
  Zap,
} from 'lucide-react'
import {
  createGuidedProject,
  updateGuidedProject,
  publishGuidedProject,
  fetchAvailableBadges,
  fetchProjectStages,
  deleteProjectStage,
  reorderProjectStages,
  validateProjectForPublish,
  type GuidedProject,
  type GuidedProjectDifficulty,
  type BadgeSummary,
  type ProjectStage,
} from '../../lib/guidedProjects'
import { StageEditorModal } from './StageEditorModal'
import { useAuth } from '../../context/AuthContext'
import { showQuestToast } from '../ui/GameToast'
import { toast } from 'react-hot-toast'

interface GuidedProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (project: GuidedProject) => void
  projectToEdit?: GuidedProject | null
}

export const GuidedProjectModal: React.FC<GuidedProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectToEdit,
}) => {
  const { user } = useAuth()

  // Tabs: 'details' or 'stages'
  const [activeTab, setActiveTab] = useState<'details' | 'stages'>('details')

  // Project Form State
  const [currentProject, setCurrentProject] = useState<GuidedProject | null>(projectToEdit || null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<GuidedProjectDifficulty>('beginner')
  const [estimatedMinutes, setEstimatedMinutes] = useState(45)
  const [badgeId, setBadgeId] = useState<string>('')
  const [availableBadges, setAvailableBadges] = useState<BadgeSummary[]>([])
  const [loadingBadges, setLoadingBadges] = useState(false)

  // Stages State
  const [stages, setStages] = useState<ProjectStage[]>([])
  const [loadingStages, setLoadingStages] = useState(false)
  const [isStageModalOpen, setIsStageModalOpen] = useState(false)
  const [selectedStageToEdit, setSelectedStageToEdit] = useState<ProjectStage | null>(null)
  const [stageToDelete, setStageToDelete] = useState<ProjectStage | null>(null)
  const [isDeletingStage, setIsDeletingStage] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  // Validation State
  const [publishErrors, setPublishErrors] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load badges when modal opens
  useEffect(() => {
    if (isOpen) {
      let isMounted = true
      setLoadingBadges(true)
      fetchAvailableBadges().then((badges) => {
        if (isMounted) {
          setAvailableBadges(badges)
          setLoadingBadges(false)
        }
      })
      return () => {
        isMounted = false
      }
    }
  }, [isOpen])

  // Load stages when editing or after draft created
  const loadStages = useCallback(async (projId: string) => {
    setLoadingStages(true)
    const data = await fetchProjectStages(projId)
    setStages(data)
    setLoadingStages(false)

    // Check publish readiness
    validateProjectForPublish(projId).then((res) => {
      setPublishErrors(res.errors)
    })
  }, [])

  // Populate form when modal opens or projectToEdit changes
  useEffect(() => {
    if (!isOpen) return

    if (projectToEdit) {
      setCurrentProject(projectToEdit)
      setTitle(projectToEdit.title)
      setDescription(projectToEdit.description || '')
      setDifficulty(projectToEdit.difficulty)
      setEstimatedMinutes(projectToEdit.estimated_minutes || 45)
      setBadgeId(projectToEdit.badge_id || '')
      loadStages(projectToEdit.id)
    } else {
      setCurrentProject(null)
      setTitle('')
      setDescription('')
      setDifficulty('beginner')
      setEstimatedMinutes(45)
      setBadgeId('')
      setStages([])
      setActiveTab('details')
      setPublishErrors([])
    }
    setErrors({})
  }, [isOpen, projectToEdit, loadStages])

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) {
      errs.title = 'Project title is required.'
    }
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      errs.difficulty = 'Please select a valid difficulty level.'
    }
    if (!estimatedMinutes || Number(estimatedMinutes) <= 0) {
      errs.estimatedMinutes = 'Estimated duration must be at least 1 minute.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Save (Draft or Published)
  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (!validate()) {
      toast.error('Please fix the validation errors before saving.')
      return
    }

    setIsSubmitting(true)
    try {
      if (currentProject) {
        // If publishing, perform strict prompt 2 publish validation first!
        if (targetStatus === 'published') {
          const valRes = await validateProjectForPublish(currentProject.id)
          if (!valRes.valid) {
            toast.error(valRes.errors[0] || 'Project is not ready for publishing.')
            setPublishErrors(valRes.errors)
            setIsSubmitting(false)
            return
          }
        }

        // Update existing project
        const { data, error } = await updateGuidedProject(currentProject.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          difficulty,
          estimated_minutes: Number(estimatedMinutes),
          badge_id: badgeId ? badgeId : null,
          status: targetStatus,
        })

        if (error || !data) {
          toast.error(error || 'Failed to update guided project.')
          setIsSubmitting(false)
          return
        }

        if (targetStatus === 'published' && currentProject.status === 'draft') {
          const pubResult = await publishGuidedProject(data.id)
          if (!pubResult.success) {
            toast.error(pubResult.error || 'Failed to publish project.')
            setIsSubmitting(false)
            return
          }
          data.status = 'published'
        }

        showQuestToast({
          title: targetStatus === 'published' ? 'Project Published!' : 'Draft Saved!',
          variant: 'complete',
        })
        toast.success(targetStatus === 'published' ? 'Guided project is live.' : 'Guided project draft saved.')
        setCurrentProject(data)
        onSuccess(data)
        onClose()
      } else {
        // Create new project
        const { data, error } = await createGuidedProject(
          {
            title: title.trim(),
            description: description.trim() || undefined,
            difficulty,
            estimated_minutes: Number(estimatedMinutes),
            badge_id: badgeId ? badgeId : null,
            status: targetStatus,
          },
          user?.id
        )

        if (error || !data) {
          toast.error(error || 'Failed to create guided project.')
          setIsSubmitting(false)
          return
        }

        showQuestToast({
          title: 'Draft Created!',
          variant: 'complete',
        })
        toast.success('Project details saved. Now you can configure project stages.')
        setCurrentProject(data)
        onSuccess(data)
        setActiveTab('stages')
        loadStages(data.id)
      }
    } catch (err: any) {
      toast.error(err?.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stage Reordering
  const handleMoveStage = async (index: number, direction: 'up' | 'down') => {
    if (!currentProject || isReordering) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= stages.length) return

    const reordered = [...stages]
    const temp = reordered[index]
    reordered[index] = reordered[targetIndex]
    reordered[targetIndex] = temp

    // Optimistic UI update
    setStages(reordered)
    setIsReordering(true)

    const stageIds = reordered.map((s) => s.id)
    const res = await reorderProjectStages(currentProject.id, stageIds)
    setIsReordering(false)

    if (!res.success) {
      toast.error(res.error || 'Failed to reorder stages.')
      loadStages(currentProject.id)
    } else {
      toast.success('Stage order updated.')
      loadStages(currentProject.id)
    }
  }

  // Stage Deletion
  const handleDeleteStageConfirm = async () => {
    if (!stageToDelete || !currentProject) return
    setIsDeletingStage(true)
    try {
      const res = await deleteProjectStage(stageToDelete.id)
      if (res.success) {
        showQuestToast({ title: 'Stage Deleted', variant: 'complete' })
        toast.success(`Stage "${stageToDelete.title}" removed.`)
        setStageToDelete(null)
        await loadStages(currentProject.id)
      } else {
        toast.error(res.error || 'Failed to delete stage.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting stage.')
    } finally {
      setIsDeletingStage(false)
    }
  }

  if (!isOpen) return null

  const isEditing = Boolean(currentProject)
  const isCurrentlyPublished = currentProject?.status === 'published'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border-2 border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-700">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-pixel text-sm uppercase text-stone-900 font-bold tracking-wide">
                  {isEditing ? 'Guided Project Editor' : 'New Guided Project'}
                </h2>
                <p className="text-xs text-stone-500">
                  {isEditing
                    ? `Configure project settings & build stages (${currentProject?.status.toUpperCase()})`
                    : 'Set up metadata and prerequisites for your multi-stage project'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (Project Details vs Stages) */}
          <div className="px-6 pt-3 bg-stone-50/50 border-b border-stone-200 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-pixel text-xs uppercase font-bold transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Project Details</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!currentProject) {
                  toast.error('Please save basic project details first to access the Stage Builder.')
                  return
                }
                setActiveTab('stages')
              }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-pixel text-xs uppercase font-bold transition-all cursor-pointer ${
                activeTab === 'stages'
                  ? 'border-purple-600 text-purple-700'
                  : currentProject
                  ? 'border-transparent text-stone-500 hover:text-stone-800'
                  : 'border-transparent text-stone-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stages ({stages.length})</span>
              {stages.length > 0 && (
                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded-full text-[10px]">
                  {stages.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Project Details Form */}
          {activeTab === 'details' && (
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build an Interactive Pixel Art Drawing Board"
                  className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.title
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-stone-300 focus:border-purple-600 focus:ring-purple-100'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-sans">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel">
                  Description / Overview
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what learners will build in this guided project and what concepts they will master..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all resize-none"
                />
              </div>

              {/* Difficulty & Estimated Minutes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel">
                    Difficulty Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as GuidedProjectDifficulty)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all cursor-pointer capitalize"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  {errors.difficulty && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {errors.difficulty}
                    </p>
                  )}
                </div>

                {/* Estimated Minutes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel">
                    Estimated Time (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 transition-all ${
                        errors.estimatedMinutes
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-stone-300 focus:border-purple-600 focus:ring-purple-100'
                      }`}
                    />
                    <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                  {errors.estimatedMinutes && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {errors.estimatedMinutes}
                    </p>
                  )}
                </div>
              </div>

              {/* Badge Association */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel flex items-center justify-between">
                  <span>Completion Reward Badge (Optional)</span>
                  {loadingBadges && (
                    <span className="text-[10px] text-stone-400 font-sans flex items-center gap-1 font-normal">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading badges...
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all cursor-pointer"
                  >
                    <option value="">No Badge Attached</option>
                    {availableBadges.map((badge) => (
                      <option key={badge.id} value={badge.id}>
                        {badge.title} ({badge.category || 'General'})
                      </option>
                    ))}
                  </select>
                  <Award className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Notice */}
              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 flex items-start gap-3 text-xs text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Next Step:</span> Save your project details to unlock the ordered Stage Builder. You must add at least one stage with valid test cases before publishing.
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Stages (Stage Builder) */}
          {activeTab === 'stages' && currentProject && (
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Stages Header & Add Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-pixel text-sm uppercase text-stone-900 font-bold tracking-wide">
                    Ordered Project Stages
                  </h3>
                  <p className="text-xs text-stone-500">
                    Learners progress sequentially from Stage 1 to Stage {stages.length || 1}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStageToEdit(null)
                    setIsStageModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl font-pixel uppercase text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stage</span>
                </button>
              </div>

              {/* Publish Readiness Alerts */}
              {publishErrors.length > 0 && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-pixel uppercase">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Publish Requirements Pending</span>
                  </div>
                  <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5 font-sans pl-1">
                    {publishErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stages List */}
              {loadingStages ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                  <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-pixel uppercase text-stone-500">Loading stages...</p>
                </div>
              ) : stages.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="font-pixel text-xs uppercase font-bold text-stone-800 mb-1">
                    No Stages Added Yet
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
                    A guided project requires at least one stage to be completed and published.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStageToEdit(null)
                      setIsStageModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-pixel uppercase text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Stage</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stages.map((stage, idx) => {
                    const testCasesCount = stage.validation_config?.test_cases?.length || 0

                    return (
                      <div
                        key={stage.id}
                        className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        {/* Stage Info */}
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          {/* Order Badge */}
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-pixel font-bold text-xs flex items-center justify-center shrink-0">
                            #{stage.stage_order}
                          </div>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-stone-900 truncate">
                                {stage.title}
                              </h4>

                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-pixel uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Terminal className="w-3 h-3" />
                                <span>I/O Test</span>
                              </span>

                              <span className="px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                                {testCasesCount} {testCasesCount === 1 ? 'test case' : 'test cases'}
                              </span>

                              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-600 font-bold">
                                <Zap className="w-3 h-3" />+{stage.xp_reward} XP
                              </span>
                            </div>

                            {stage.instructions && (
                              <p className="text-xs text-stone-500 line-clamp-1">
                                {stage.instructions}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Reorder and Action Buttons */}
                        <div className="flex items-center gap-1.5 justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                          {/* Move Up */}
                          <button
                            type="button"
                            onClick={() => handleMoveStage(idx, 'up')}
                            disabled={idx === 0 || isReordering}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                            title="Move Stage Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveStage(idx, 'down')}
                            disabled={idx === stages.length - 1 || isReordering}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                            title="Move Stage Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>

                          {/* Edit Stage */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStageToEdit(stage)
                              setIsStageModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                            title="Edit Stage"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                          </button>

                          {/* Delete Stage */}
                          <button
                            type="button"
                            onClick={() => setStageToDelete(stage)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Stage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold font-pixel uppercase text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center gap-2">
              {/* Draft Save button */}
              {(!isEditing || !isCurrentlyPublished) && (
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-200 hover:bg-stone-300 active:bg-stone-400 text-stone-800 rounded-xl font-pixel uppercase text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Draft</span>
                </button>
              )}

              {/* Publish or Save Published */}
              <button
                type="button"
                onClick={() => handleSave('published')}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl font-pixel uppercase text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isCurrentlyPublished ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isCurrentlyPublished ? 'Save Changes' : 'Publish Project'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stage Editor Dialog */}
      {currentProject && (
        <StageEditorModal
          isOpen={isStageModalOpen}
          onClose={() => {
            setIsStageModalOpen(false)
            setSelectedStageToEdit(null)
          }}
          onSuccess={() => {
            loadStages(currentProject.id)
          }}
          projectId={currentProject.id}
          stageToEdit={selectedStageToEdit}
          currentStageCount={stages.length}
        />
      )}

      {/* Stage Delete Confirmation Dialog */}
      {stageToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white border-2 border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-pixel text-sm uppercase font-bold text-stone-900">
                Delete Stage #{stageToDelete.stage_order}
              </h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-stone-900">"{stageToDelete.title}"</span>? Remaining stages will be automatically renumbered to preserve contiguous ordering.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setStageToDelete(null)}
                disabled={isDeletingStage}
                className="px-3.5 py-1.5 text-xs font-pixel uppercase font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStageConfirm}
                disabled={isDeletingStage}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-pixel uppercase font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeletingStage && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Delete Stage</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
