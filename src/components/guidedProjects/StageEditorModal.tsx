import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Layers,
  Code2,
  Terminal,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  FileText,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react'
import {
  createProjectStage,
  updateProjectStage,
  type ProjectStage,
  type ValidationType,
  type IOTestCase,
} from '../../lib/guidedProjects'
import { toast } from 'react-hot-toast'
import { showQuestToast } from '../ui/GameToast'

interface StageEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (stage: ProjectStage) => void
  projectId: string
  stageToEdit?: ProjectStage | null
  currentStageCount?: number
}

export const StageEditorModal: React.FC<StageEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  stageToEdit,
  currentStageCount = 0,
}) => {
  // Form State
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [starterCode, setStarterCode] = useState('')
  const [validationType, setValidationType] = useState<ValidationType>('io_test')
  const [testCases, setTestCases] = useState<IOTestCase[]>([
    { input: '', expected_output: '', is_hidden: false },
  ])
  const [xpReward, setXpReward] = useState<number>(20)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form on open
  useEffect(() => {
    if (!isOpen) return

    if (stageToEdit) {
      setTitle(stageToEdit.title)
      setInstructions(stageToEdit.instructions || '')
      setStarterCode(stageToEdit.starter_code || '')
      setValidationType(stageToEdit.validation_type || 'io_test')
      setTestCases(
        stageToEdit.validation_config?.test_cases?.length > 0
          ? stageToEdit.validation_config.test_cases
          : [{ input: '', expected_output: '', is_hidden: false }]
      )
      setXpReward(stageToEdit.xp_reward ?? 20)
    } else {
      setTitle(`Stage ${currentStageCount + 1}: Initial Setup`)
      setInstructions('')
      setStarterCode('// Write your solution here\n')
      setValidationType('io_test')
      setTestCases([{ input: '', expected_output: '', is_hidden: false }])
      setXpReward(20)
    }
    setErrors({})
  }, [isOpen, stageToEdit, currentStageCount])

  // Test Case Handlers
  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expected_output: '', is_hidden: false }])
  }

  const handleUpdateTestCase = (index: number, field: keyof IOTestCase, value: any) => {
    const updated = [...testCases]
    updated[index] = { ...updated[index], [field]: value }
    setTestCases(updated)
  }

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) {
      toast.error('A stage must have at least one test case.')
      return
    }
    setTestCases(testCases.filter((_, i) => i !== index))
  }

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) {
      errs.title = 'Stage title is required.'
    }

    if (validationType === 'io_test') {
      if (testCases.length === 0) {
        errs.testCases = 'At least one I/O test case is required.'
      } else {
        const missingOutput = testCases.some((tc) => !tc.expected_output || !tc.expected_output.trim())
        if (missingOutput) {
          errs.testCases = 'All test cases must specify an expected output.'
        }
      }
    }

    if (xpReward < 0) {
      errs.xpReward = 'XP reward cannot be negative.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Save
  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the validation errors before saving.')
      return
    }

    setIsSubmitting(true)
    try {
      if (stageToEdit) {
        // Update Stage
        const res = await updateProjectStage(stageToEdit.id, {
          title: title.trim(),
          instructions: instructions.trim(),
          starter_code: starterCode,
          validation_type: validationType,
          validation_config: { test_cases: testCases },
          xp_reward: Number(xpReward),
        })

        if (res.error || !res.data) {
          toast.error(res.error || 'Failed to update stage.')
          setIsSubmitting(false)
          return
        }

        showQuestToast({ title: 'Stage Updated!', variant: 'complete' })
        toast.success(`Stage "${title}" saved successfully.`)
        onSuccess(res.data)
        onClose()
      } else {
        // Create Stage
        const res = await createProjectStage({
          project_id: projectId,
          title: title.trim(),
          instructions: instructions.trim(),
          starter_code: starterCode,
          validation_type: validationType,
          validation_config: { test_cases: testCases },
          xp_reward: Number(xpReward),
        })

        if (res.error || !res.data) {
          toast.error(res.error || 'Failed to create stage.')
          setIsSubmitting(false)
          return
        }

        showQuestToast({ title: 'Stage Added!', variant: 'complete' })
        toast.success(`Stage #${res.data.stage_order} created.`)
        onSuccess(res.data)
        onClose()
      }
    } catch (err: any) {
      toast.error(err?.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isEditing = Boolean(stageToEdit)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border-2 border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-pixel text-sm uppercase text-stone-900 font-bold tracking-wide">
                  {isEditing ? `Edit Stage #${stageToEdit?.stage_order}` : 'New Project Stage'}
                </h2>
                <p className="text-xs text-stone-500">
                  Configure instructions, starter code, and verification rules
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

          {/* Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Title & XP Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel">
                  Stage Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stage 1: Implement the Grid Matrix"
                  className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.title
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-sans">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel">
                  XP Reward
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={xpReward}
                    onChange={(e) => setXpReward(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 transition-all font-mono"
                  />
                  <Zap className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Stage Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel flex items-center justify-between">
                <span>Stage Instructions / Prompt</span>
                <span className="text-[10px] text-stone-400 font-sans font-normal">
                  Markdown syntax supported
                </span>
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Explain the goal of this stage, parameters, constraints, and instructions for the learner..."
                rows={4}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 transition-all resize-y font-sans"
              />
            </div>

            {/* Starter Code Editor */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel flex items-center justify-between">
                <span>Starter Code Template</span>
                <span className="text-[10px] text-stone-400 font-sans font-normal">
                  Pre-populated in learner's editor
                </span>
              </label>
              <div className="border border-stone-300 rounded-xl overflow-hidden bg-stone-900 shadow-inner">
                <div className="bg-stone-800 px-3 py-1.5 border-b border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[10px] font-mono text-stone-400 ml-2">starter_solution</span>
                  </div>
                  <Code2 className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <textarea
                  value={starterCode}
                  onChange={(e) => setStarterCode(e.target.value)}
                  placeholder="// Provide starter code or function signatures for this stage..."
                  rows={6}
                  className="w-full p-3.5 bg-stone-900 text-stone-100 font-mono text-xs focus:outline-hidden resize-y"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Validation Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-pixel">
                Validation Engine
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setValidationType('io_test')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                    validationType === 'io_test'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                  }`}
                >
                  <Terminal className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-pixel text-xs uppercase font-bold text-stone-900">
                      I/O Test Suite
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Validates standard input (STDIN) and expected standard output.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 opacity-60 flex items-center gap-3 cursor-not-allowed">
                  <FileText className="w-5 h-5 text-stone-400 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-pixel text-xs uppercase font-bold text-stone-500">
                        DOM / HTML Check
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-stone-200 text-stone-600 rounded-md font-sans">
                        Future
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      DOM and CSS selector assertion engine.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* I/O Test Cases Configuration */}
            {validationType === 'io_test' && (
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-pixel text-xs uppercase text-stone-800 font-bold tracking-wide">
                      Test Cases Configuration
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      At least one test case with expected output is required to publish this project.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-pixel uppercase text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Test Case</span>
                  </button>
                </div>

                {errors.testCases && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 font-sans">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {errors.testCases}
                  </p>
                )}

                <div className="space-y-3">
                  {testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[10px] uppercase font-bold text-stone-600">
                          Test Case #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {/* Hidden toggle */}
                          <button
                            type="button"
                            onClick={() => handleUpdateTestCase(idx, 'is_hidden', !tc.is_hidden)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              tc.is_hidden
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                            title="Toggle hidden test case (hidden from learner preview)"
                          >
                            {tc.is_hidden ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Hidden</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Public</span>
                              </>
                            )}
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            disabled={testCases.length <= 1}
                            className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
                            title="Remove test case"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 uppercase font-mono mb-1">
                            Input (STDIN)
                          </label>
                          <textarea
                            value={tc.input}
                            onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                            placeholder="Optional standard input"
                            rows={2}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-hidden focus:border-emerald-500 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 uppercase font-mono mb-1">
                            Expected Output <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            value={tc.expected_output}
                            onChange={(e) => handleUpdateTestCase(idx, 'expected_output', e.target.value)}
                            placeholder="Expected program output"
                            rows={2}
                            className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-hidden focus:border-emerald-500 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold font-pixel uppercase text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-pixel uppercase text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isEditing ? 'Update Stage' : 'Add Stage to Project'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
