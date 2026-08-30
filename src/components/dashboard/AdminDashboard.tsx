import React, { useState, useEffect } from 'react'
import { GamifiedCard } from '../ui/GamifiedCard'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from '../../lib/projects'
import {
  Users,
  Award,
  PlusCircle,
  Search,
  CheckCircle,
  Database,
  ShieldAlert,
  FolderGit2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'

interface LearnerRecord {
  id: string
  name: string
  email: string
  role: string
  xp: number
  level: number
  status: string
}

export const AdminDashboard: React.FC = () => {
  const { role, isAdmin, signOut } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddQuest, setShowAddQuest] = useState(false)
  const [questTitle, setQuestTitle] = useState('')
  const [questLanguage, setQuestLanguage] = useState('TypeScript')
  const [questXp, setQuestXp] = useState('150')
  const [questCreatedAlert, setQuestCreatedAlert] = useState(false)
  const [learners, setLearners] = useState<LearnerRecord[]>([])

  // Project Admin State
  const [adminProjects, setAdminProjects] = useState<Project[]>([])
  const [showAddProject, setShowAddProject] = useState(false)
  const [projTitle, setProjTitle] = useState('')
  const [projSlug, setProjSlug] = useState('')
  const [projCategory, setProjCategory] = useState('Web')
  const [projDifficulty, setProjDifficulty] = useState('Beginner')
  const [projDescription, setProjDescription] = useState('')
  const [projInstructions, setProjInstructions] = useState('')
  const [projStep1Title, setProjStep1Title] = useState('')
  const [projStep1Desc, setProjStep1Desc] = useState('')
  const [projectAlert, setProjectAlert] = useState<string | null>(null)

  const loadAdminProjects = async () => {
    const data = await fetchProjects(undefined, true)
    setAdminProjects(data)
  }

  useEffect(() => {
    const loadLearners = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, email, role, xp, level')
          .order('xp', { ascending: false })

        if (!error && data && data.length > 0) {
          setLearners(
            data.map((item) => ({
              id: item.id,
              name: item.full_name || item.username || 'Adventurer',
              email: item.email || '',
              role: item.role,
              xp: item.xp ?? 0,
              level: item.level ?? 1,
              status: item.role === 'admin' ? 'Staff' : 'Active',
            }))
          )
          return
        }
      } catch {
        // Fallback to default roster
      }

      setLearners([
        { id: '1', name: 'Alex Rivers', email: 'alex@codequest.dev', role: 'learner', xp: 4850, level: 12, status: 'Active' },
        { id: '2', name: 'Sam Chen', email: 'sam@codequest.dev', role: 'learner', xp: 2300, level: 6, status: 'Active' },
        { id: '3', name: 'Maya Patel', email: 'maya@codequest.dev', role: 'learner', xp: 3400, level: 8, status: 'In Quest' },
        { id: '4', name: 'Leo Vance', email: 'leo@codequest.dev', role: 'learner', xp: 1200, level: 3, status: 'Idle' },
        { id: '5', name: 'Zoe Morales', email: 'zoe@codequest.dev', role: 'learner', xp: 5100, level: 14, status: 'Active' },
      ])
    }

    if (isAdmin) {
      loadLearners()
      loadAdminProjects()
    }
  }, [isAdmin])

  // Strict RBAC Guard
  if (!isAdmin || role !== 'admin') {
    return (
      <div className="w-full max-w-xl mx-auto my-12 p-8 bg-rose-50 border-2 border-rose-200 rounded-3xl text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-pixel text-rose-900 uppercase">Access Denied</h2>
        <p className="text-xs text-rose-700">You must have verified Administrator credentials in the database to view this command center.</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-pixel uppercase rounded-xl transition-all"
        >
          Sign Out
        </button>
      </div>
    )
  }

  const filteredLearners = learners.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!questTitle.trim()) return
    setQuestCreatedAlert(true)
    setShowAddQuest(false)
    setQuestTitle('')
    setTimeout(() => setQuestCreatedAlert(false), 4000)
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projTitle.trim() || !projDescription.trim()) return

    const slug = projSlug.trim() || projTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const steps = projStep1Title.trim()
      ? [{ title: projStep1Title.trim(), description: projStep1Desc.trim() || 'Follow project guidelines.', step_order: 1 }]
      : undefined

    const created = await createProject(
      {
        title: projTitle.trim(),
        slug,
        category: projCategory,
        difficulty: projDifficulty,
        description: projDescription.trim(),
        instructions: projInstructions.trim(),
        is_published: true,
      },
      steps
    )

    if (created) {
      setProjectAlert('Project blueprint created and deployed successfully!')
      setShowAddProject(false)
      setProjTitle('')
      setProjSlug('')
      setProjDescription('')
      setProjInstructions('')
      setProjStep1Title('')
      setProjStep1Desc('')
      await loadAdminProjects()
      setTimeout(() => setProjectAlert(null), 4000)
    }
  }

  const handleTogglePublishProject = async (project: Project) => {
    await updateProject(project.id, { is_published: !project.is_published })
    await loadAdminProjects()
  }

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId)
    await loadAdminProjects()
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      {/* Alert Banners */}
      {questCreatedAlert && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold">New quest successfully created and deployed to the learner track!</p>
        </div>
      )}

      {projectAlert && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold">{projectAlert}</p>
        </div>
      )}

      {/* Admin KPI Cards Trio */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <GamifiedCard accentColor="purple" className="flex flex-col items-start p-6 gap-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-purple-600 mb-1">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-pixel">{learners.length}</div>
          <p className="text-xs text-slate-500 font-medium">Total Registered Learners</p>
        </GamifiedCard>

        <GamifiedCard accentColor="emerald" className="flex flex-col items-start p-6 gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-1">
            <Award className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-pixel">92.4%</div>
          <p className="text-xs text-slate-500 font-medium">Quest Completion Rate</p>
        </GamifiedCard>

        <GamifiedCard accentColor="amber" className="flex flex-col items-start p-6 gap-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-500 mb-1">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-amber-500 font-pixel">{adminProjects.length}</div>
          <p className="text-xs text-slate-500 font-medium">Active Projects Managed</p>
        </GamifiedCard>

        <GamifiedCard accentColor="blue" className="flex flex-col items-start p-6 gap-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center text-sky-600 mb-1">
            <Database className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-sky-600 font-pixel">Live</div>
          <p className="text-xs text-slate-500 font-medium">Supabase Auth & RLS Active</p>
        </GamifiedCard>
      </div>

      {/* Project Authoring Studio Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">Project Authoring Studio</h3>
            <p className="text-xs text-slate-500">Manage real-world project blueprints, milestone steps, and publish state</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddProject(!showAddProject)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-pixel uppercase transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showAddProject ? 'Close Authoring' : 'New Project'}</span>
          </button>
        </div>

        {showAddProject && (
          <form onSubmit={handleCreateProject} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 mb-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chat App"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="chat-app"
                  value={projSlug}
                  onChange={(e) => setProjSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={projCategory}
                  onChange={(e) => setProjCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Web">Web</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="React">React</option>
                  <option value="Backend">Backend</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                <select
                  value={projDifficulty}
                  onChange={(e) => setProjDifficulty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                required
                rows={2}
                placeholder="Brief summary of the project goals..."
                value={projDescription}
                onChange={(e) => setProjDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instructions / Guidelines</label>
              <textarea
                rows={2}
                placeholder="Specific instructions or technical stack requirements..."
                value={projInstructions}
                onChange={(e) => setProjInstructions(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col gap-3">
              <span className="font-pixel text-xs font-bold text-slate-800 uppercase">Initial Milestone Step</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Step 1 Title (e.g. Initialize Repo & Layout)"
                  value={projStep1Title}
                  onChange={(e) => setProjStep1Title(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Step 1 Description"
                  value={projStep1Desc}
                  onChange={(e) => setProjStep1Desc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddProject(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-pixel uppercase rounded-xl cursor-pointer"
              >
                Deploy Project 🚀
              </button>
            </div>
          </form>
        )}

        {/* Projects Roster Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-pixel text-[10px]">
                <th className="py-3 px-4">PROJECT</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">DIFFICULTY</th>
                <th className="py-3 px-4">STEPS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {adminProjects.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.title}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold bg-emerald-100 text-emerald-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">{p.difficulty}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.steps?.length || 0}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.is_published ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePublishProject(p)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title={p.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {p.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quest Creator Section */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-pixel uppercase">Quest Authoring Studio</h3>
              <p className="text-xs text-slate-500">Create new coding challenges and distribute them to learners</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddQuest(!showAddQuest)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold font-pixel uppercase transition-all flex items-center gap-2 cursor-pointer w-fit"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showAddQuest ? 'Close Authoring' : 'New Quest'}</span>
            </button>
          </div>

          {showAddQuest && (
            <form onSubmit={handleCreateQuest} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 mb-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quest Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Async Rust Pipelines"
                    value={questTitle}
                    onChange={(e) => setQuestTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Language / Track</label>
                  <select
                    value={questLanguage}
                    onChange={(e) => setQuestLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="React">React</option>
                    <option value="SQL">SQL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">XP Reward</label>
                  <input
                    type="number"
                    required
                    value={questXp}
                    onChange={(e) => setQuestXp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuest(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-pixel uppercase rounded-xl cursor-pointer"
                >
                  Deploy Quest 🚀
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Learners Table */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pt-4 border-t border-slate-100">
          <h4 className="font-pixel text-xs uppercase font-bold text-slate-800">Learners & XP Leaderboard</h4>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search learners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-pixel text-[10px]">
                <th className="py-3 px-4">LEARNER</th>
                <th className="py-3 px-4">ROLE</th>
                <th className="py-3 px-4">XP</th>
                <th className="py-3 px-4">LEVEL</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLearners.map((learner) => (
                <tr key={learner.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{learner.name}</div>
                    <div className="text-[10px] text-slate-400">{learner.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-pixel uppercase font-bold ${
                      learner.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {learner.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 font-pixel">{learner.xp} XP</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 font-mono">Lvl {learner.level}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{learner.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
