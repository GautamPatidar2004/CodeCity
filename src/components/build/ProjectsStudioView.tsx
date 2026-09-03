import React, { useState } from 'react'
import {
  Search,
  Plus,
  Eye,
  Star,
  GitFork,
  ChevronDown,
  MoreHorizontal,
  Play,
  Check,
  Lock,
  Share2,
  Crown,
  Compass,
  Layers,
} from 'lucide-react'
import { LumiPixelBot, AlexPixelAvatar } from '../brand/PixelArtAvatars'
import { StudentGuidedProjectsLibrary } from '../guidedProjects/StudentGuidedProjectsLibrary'

interface ProjectsStudioViewProps {
  onNewProject?: () => void
  onSelectGuidedProject?: (projectId: string) => void
}

/* ─── Types ──────────────────────────────────────────────────────────────────── */
type ProjectStatus = 'published' | 'in_progress' | 'completed' | 'archived'
type FilterTab = 'all' | ProjectStatus

interface Project {
  id: string
  title: string
  subtitle: string
  status: ProjectStatus
  tags: string[]
  xp: number
  views?: number
  stars?: number
  progress?: number
  updatedLabel: string
  bgClass: string
  thumbnail: React.ReactNode
}

/* ─── Thumbnail Components ───────────────────────────────────────────────────── */
const TerminalThumb: React.FC = () => (
  <div className="w-full h-full bg-[#1e293b] rounded-xl p-3 font-mono text-[9px] space-y-0.5">
    <div className="text-slate-400"># Number Guessing Game</div>
    <div className="text-slate-300">Guess the number (1-100)...</div>
    <div className="text-amber-400">{'> '}42</div>
    <div className="text-slate-400">Too low! Try again.</div>
    <div className="text-amber-400">{'> '}73</div>
    <div className="text-emerald-400">Correct! 🎉 Score: 840</div>
  </div>
)

const PortfolioThumb: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-br from-sky-100 to-blue-50 rounded-xl p-3 overflow-hidden">
    <div className="w-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg h-10 flex items-center px-3 mb-2">
      <span className="text-white font-bold text-[9px]">Hi, I'm Alex — Developer</span>
    </div>
    <div className="flex gap-1.5">
      <div className="flex-1 h-4 bg-white/60 rounded-md" />
      <div className="flex-1 h-4 bg-white/60 rounded-md" />
      <div className="flex-1 h-4 bg-white/60 rounded-md" />
    </div>
    <div className="mt-1.5 h-8 bg-white/60 rounded-md" />
  </div>
)

const PixelRunnerThumb: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-b from-sky-300 to-sky-500 rounded-xl p-2 overflow-hidden relative">
    <div className="absolute bottom-4 left-0 right-0 h-6 bg-green-600 rounded-t-lg" />
    <div className="absolute bottom-8 left-0 right-0 flex gap-3 px-2">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 shadow-sm" />
      ))}
    </div>
    <div className="absolute bottom-4 left-5 w-5 h-6 bg-violet-500 rounded-t-md" />
    <div className="absolute top-2 right-3 text-lg">☁️</div>
    <div className="absolute top-1 left-6 text-base">🌤️</div>
  </div>
)

const MovieExplorerThumb: React.FC = () => (
  <div className="w-full h-full bg-[#f8fafc] rounded-xl p-3 flex gap-2">
    <div className="flex-1 flex flex-col gap-1.5 justify-end">
      {[60, 80, 50, 90, 70].map((h, i) => (
        <div key={i} className="flex items-end gap-0.5">
          <div className="w-4 rounded-t" style={{ height: `${h * 0.3}px`, backgroundColor: '#10b981' }} />
        </div>
      ))}
      <div className="flex gap-0.5 mt-0.5">
        {[60, 80, 50, 90, 70].map((h, i) => (
          <div key={i} className="w-4 rounded-t bg-emerald-500" style={{ height: `${h * 0.28}px` }} />
        ))}
      </div>
    </div>
    <div className="flex items-center justify-center">
      <div className="relative w-14 h-14">
        <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="13" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle cx="18" cy="18" r="13" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="55 82" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700">67%</div>
      </div>
    </div>
  </div>
)

const LumiMiniThumb: React.FC = () => (
  <div className="w-full h-full bg-indigo-50 rounded-xl p-3 flex flex-col gap-2">
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full bg-indigo-400 flex items-center justify-center">
        <span className="text-[8px]">🤖</span>
      </div>
      <div className="bg-white border border-indigo-200 rounded-lg px-2 py-1 text-[8px] text-slate-700">
        Hello! How can I help you today?
      </div>
    </div>
    <div className="flex justify-end">
      <div className="bg-indigo-500 text-white rounded-lg px-2 py-1 text-[8px]">
        What is Python?
      </div>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full bg-indigo-400 flex items-center justify-center">
        <span className="text-[8px]">🤖</span>
      </div>
      <div className="bg-white border border-indigo-200 rounded-lg px-2 py-1 text-[8px] text-slate-700">
        Python is a high-level...
      </div>
    </div>
  </div>
)

const STATUS_BADGE: Record<ProjectStatus, { label: string; className: string }> = {
  published: { label: 'PUBLISHED', className: 'bg-emerald-500 text-white' },
  in_progress: { label: 'IN PROGRESS', className: 'bg-amber-400 text-white' },
  completed: { label: 'COMPLETED', className: 'bg-sky-500 text-white' },
  archived: { label: 'ARCHIVED', className: 'bg-slate-400 text-white' },
}

const PROJECTS: Project[] = [
  {
    id: 'num-guess',
    title: 'Number Guessing Game',
    subtitle: 'A terminal-based guessing game with difficulty levels and score tracking.',
    status: 'published',
    tags: ['Python'],
    xp: 250,
    views: 248,
    stars: 18,
    updatedLabel: 'Updated 2 days ago',
    bgClass: 'bg-slate-900',
    thumbnail: <TerminalThumb />,
  },
  {
    id: 'portfolio',
    title: 'Personal Portfolio',
    subtitle: 'My first personal developer portfolio built from scratch.',
    status: 'in_progress',
    tags: ['HTML', 'CSS'],
    xp: 300,
    progress: 68,
    updatedLabel: 'Updated 1 day ago',
    bgClass: 'bg-sky-100',
    thumbnail: <PortfolioThumb />,
  },
  {
    id: 'pixel-runner',
    title: 'Pixel Runner',
    subtitle: 'A tiny endless-runner game built with JavaScript.',
    status: 'published',
    tags: ['JavaScript', 'Canvas'],
    xp: 400,
    views: 521,
    stars: 42,
    updatedLabel: 'Updated 5 days ago',
    bgClass: 'bg-sky-300',
    thumbnail: <PixelRunnerThumb />,
  },
  {
    id: 'movie-explorer',
    title: 'Movie Explorer',
    subtitle: 'Explore movie ratings and discover trends through data.',
    status: 'completed',
    tags: ['Python', 'Pandas'],
    xp: 350,
    updatedLabel: 'Completed 3 days ago',
    bgClass: 'bg-slate-50',
    thumbnail: <MovieExplorerThumb />,
  },
  {
    id: 'lumi-mini',
    title: 'Lumi Mini',
    subtitle: "An experimental conversational assistant inspired by what I've learned.",
    status: 'in_progress',
    tags: ['Python', 'AI'],
    xp: 0,
    progress: 42,
    updatedLabel: 'Updated yesterday',
    bgClass: 'bg-indigo-50',
    thumbnail: <LumiMiniThumb />,
  },
]

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'published', label: 'Published' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
]

const JOURNEY_STEPS = [
  { icon: '📦', label: 'First Build', xp: 100, done: true },
  { icon: '🚀', label: 'Publish First Project', xp: 150, done: true },
  { icon: '🌐', label: 'Build With APIs', xp: 200, done: true },
  { icon: '📱', label: 'Create Interactive App', xp: 250, done: true },
  { icon: '🔒', label: 'Build Something Original', xp: 300, done: false },
]

const ACHIEVEMENTS = [
  { label: 'First Build', unlocked: true, icon: '🏗️' },
  { label: 'Ship It', unlocked: true, icon: '🚀' },
  { label: 'Web Creator', unlocked: true, icon: '🌐' },
  { label: 'Problem Solver', unlocked: true, icon: '🧩' },
  { label: 'Original Creator', unlocked: false, icon: '💡' },
]

/* ─── Project Card Component ─────────────────────────────────────────────────── */
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const badge = STATUS_BADGE[project.status]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden flex-shrink-0">
        <div className="w-full h-full p-2">{project.thumbnail}</div>
        {/* Status badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-pixel font-bold uppercase ${badge.className}`}>
          {badge.label}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{project.title}</h3>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-1 min-w-[130px]">
                {['Open Project', 'Edit', 'Share', 'Archive', 'Delete'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed flex-1">{project.subtitle}</p>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {project.tags.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold">{t}</span>
          ))}
        </div>

        {/* Progress bar (if in_progress) */}
        {project.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-medium text-slate-500">{project.progress}% complete</span>
              {project.xp > 0 && (
                <span className="flex items-center gap-0.5 font-bold text-amber-700">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> +{project.xp} XP
                </span>
              )}
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          {project.views !== undefined && (
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views}</span>
          )}
          {project.stars !== undefined && (
            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-slate-300 text-slate-300" />{project.stars}</span>
          )}
          {project.xp > 0 && project.progress === undefined && (
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />+{project.xp} XP
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400">{project.updatedLabel}</span>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export const ProjectsStudioView: React.FC<ProjectsStudioViewProps> = ({
  onNewProject,
  onSelectGuidedProject,
}) => {
  const [studioMode, setStudioMode] = useState<'guided' | 'freeform'>('guided')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [langOpen, setLangOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [activeLumiPrompt, setActiveLumiPrompt] = useState<string | null>(null)

  const filteredProjects = PROJECTS.filter(p => {
    const matchFilter = activeFilter === 'all' || p.status === activeFilter
    const matchSearch = searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchFilter && matchSearch
  })

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 text-left pb-16 font-sans select-none animate-in fade-in duration-300">
      {/* Studio Navigation Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl w-fit border border-[#ece7df] shadow-2xs">
        <button
          type="button"
          onClick={() => setStudioMode('guided')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-pixel uppercase font-bold transition-all cursor-pointer ${
            studioMode === 'guided'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Guided Projects</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioMode('freeform')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-pixel uppercase font-bold transition-all cursor-pointer ${
            studioMode === 'freeform'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Freeform Studio</span>
        </button>
      </div>

      {studioMode === 'guided' ? (
        <StudentGuidedProjectsLibrary
          onSelectProject={(id) => onSelectGuidedProject?.(id)}
        />
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* ============================================================ */}
        {/* MAIN STUDIO COLUMN (~74%)                                     */}
        {/* ============================================================ */}
        <div className="xl:col-span-9 flex flex-col gap-6">

          {/* ── A. HERO CREATION BANNER ── */}
          <div className="relative bg-[#fffdfa] border border-amber-100/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-sm gap-6">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-emerald-50/60 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 right-40 w-48 h-48 rounded-full bg-amber-50/40 blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-3 z-10 max-w-lg">
              <div className="font-pixel text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                YOUR CREATION SPACE
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Build Something<br />That's Yours.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                Turn the skills you've learned into projects you can experiment with, share, and be proud of.
              </p>
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={onNewProject}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> New Project
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm shadow-xs cursor-pointer transition-colors"
                >
                  Explore Templates
                </button>
              </div>
            </div>

            {/* Pixel art right */}
            <div className="z-10 shrink-0 flex items-center justify-center relative w-64 h-44">
              <div className="absolute top-0 left-2 font-mono text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded rotate-[-6deg]">{`{}`}</div>
              <div className="absolute top-2 right-10 font-mono text-[9px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded rotate-[5deg]">while</div>
              <div className="absolute bottom-10 left-3 font-mono text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded rotate-[-3deg]">fn()</div>
              <div className="absolute top-3 left-16 text-xl">🚀</div>
              <img
                src="/extracted/course/course_hero_art.png"
                alt="Coder at workstation"
                className="w-full h-full object-contain filter drop-shadow-md"
                onError={e => { e.currentTarget.src = '/pixel_terminal_workspace.jpg' }}
              />
            </div>
          </div>

          {/* ── B. METRICS STRIP ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📁', label: 'PROJECTS', value: '12', sub: '3 this month', color: 'text-emerald-600' },
              { icon: '📦', label: 'BUILDS PUBLISHED', value: '7', sub: '↑ 2 this month', color: 'text-emerald-600', subColor: 'text-emerald-600' },
              { icon: '⭐', label: 'TOTAL XP', value: '3,420 XP', sub: 'From projects', color: 'text-amber-600' },
              { icon: '👁', label: 'COMMUNITY VIEWS', value: '1,284', sub: 'Across your builds', color: 'text-sky-600' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-pixel text-[9px] font-bold text-slate-500 uppercase tracking-wider">{m.label}</span>
                </div>
                <div className={`text-2xl font-extrabold ${m.color}`}>{m.value}</div>
                <div className={`text-[11px] font-medium ${m.subColor ?? 'text-slate-400'}`}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* ── C. PROJECTS TOOLBAR & FILTER BAR ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xl font-extrabold text-slate-900">My Projects</h2>
                <p className="text-xs text-slate-500">Your coding experiments, challenges, and creations—all in one place.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onNewProject}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> New Project
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  View Portfolio →
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search your projects..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all shadow-2xs"
              />
            </div>

            {/* Filter row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Status tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      activeFilter === tab.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dropdowns */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-slate-300 cursor-pointer transition-colors"
                  >
                    Language <ChevronDown className="w-3 h-3" />
                  </button>
                  {langOpen && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-1 min-w-[130px]">
                      {['All', 'Python', 'JavaScript', 'HTML/CSS'].map(l => (
                        <button key={l} type="button" onClick={() => setLangOpen(false)} className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">{l}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-slate-300 cursor-pointer transition-colors"
                  >
                    Sort: Recently Updated <ChevronDown className="w-3 h-3" />
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-1 min-w-[160px]">
                      {['Recently Updated', 'Oldest First', 'Most Views', 'Most Stars', 'XP Reward'].map(s => (
                        <button key={s} type="button" onClick={() => setSortOpen(false)} className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── D. PROJECTS GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProjects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}

            {/* Empty starter card */}
            {(activeFilter === 'all' || filteredProjects.length < 3) && (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer group min-h-[220px]">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 border border-slate-200 group-hover:border-emerald-300 flex items-center justify-center mb-3 transition-all">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="font-extrabold text-sm text-slate-700 mb-1">Start Your Next Build</div>
                <div className="text-xs text-slate-400 mb-4 leading-relaxed">Choose a template or start with a blank project.</div>
                <button
                  type="button"
                  onClick={onNewProject}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors shadow-2xs"
                >
                  Create Project →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT SIDEBAR (~26%)                                           */}
        {/* ============================================================ */}
        <div className="xl:col-span-3 flex flex-col gap-4">

          {/* A. Developer Portfolio Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col gap-0.5">
              <div className="font-bold text-sm text-slate-900">Your Developer Portfolio</div>
              <div className="text-[11px] text-slate-500">Show the world what you've built.</div>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
              <AlexPixelAvatar size={32} />
              <div>
                <div className="font-bold text-xs text-slate-900">Alex</div>
                <div className="text-[10px] text-slate-500">Junior Developer</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { val: '12', label: 'Projects' },
                { val: '7', label: 'Published' },
                { val: '3', label: 'Skills' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl py-2 border border-slate-100">
                  <div className="font-extrabold text-sm text-slate-900">{s.val}</div>
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Featured project */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
              <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-sky-300">
                <PixelRunnerThumb />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">Pixel Runner</div>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {['JavaScript', 'Game'].map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[9px] font-bold">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                  <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />521</span>
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-slate-300 text-slate-300" />42</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors">
                View Portfolio →
              </button>
              <button type="button" className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors">
                Edit Portfolio
              </button>
            </div>
          </div>

          {/* B. Featured Build Spotlight */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="font-pixel text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              FEATURED BUILD
            </div>

            {/* Playable preview */}
            <div className="relative h-32 rounded-xl overflow-hidden bg-sky-300">
              <PixelRunnerThumb />
              <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md cursor-pointer hover:bg-white transition-colors">
                  <Play className="w-5 h-5 text-slate-900 fill-slate-900" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-sm text-slate-900">Pixel Runner</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-pixel text-[9px] font-bold">PUBLISHED</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['JavaScript', 'Game'].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold">{t}</span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">My first playable browser game.</p>
              <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                🏆 Featured Build
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium py-1 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />521</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-slate-300 text-slate-300" />42</span>
              <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" />18</span>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                Open Build →
              </button>
              <button type="button" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* C. Builder Journey Stepper */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Your Builder Journey</div>
            <div className="flex flex-col gap-3">
              {JOURNEY_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border-2 ${
                    step.done ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-100 border-slate-200'
                  }`}>
                    {step.done ? <span>{step.icon}</span> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</div>
                    <div className={`text-[10px] font-bold ${step.done ? 'text-emerald-600' : 'text-slate-400'}`}>+{step.xp} XP</div>
                  </div>
                  {step.done && <Check className="w-4 h-4 text-emerald-500 stroke-[3] shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* D. Builder Achievements */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="font-bold text-sm text-slate-900">Builder Achievements</div>
              <button type="button" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer transition-colors">View All →</button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-around">
              {ACHIEVEMENTS.map(a => (
                <div key={a.label} className="flex flex-col items-center gap-1.5 min-w-[52px]">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 ${
                    a.unlocked ? 'bg-amber-50 border-amber-200' : 'bg-slate-100 border-slate-200 grayscale opacity-50'
                  }`}>
                    {a.icon}
                  </div>
                  <div className={`text-[9px] font-bold text-center leading-tight ${a.unlocked ? 'text-slate-700' : 'text-slate-400'}`}>
                    {a.label}
                  </div>
                  {a.unlocked && <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[3]" />}
                </div>
              ))}
            </div>
          </div>

          {/* E. Lumi Builder Helper */}
          <div className="bg-indigo-50/40 rounded-3xl p-5 border border-indigo-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <LumiPixelBot size={32} />
              <div>
                <div className="font-extrabold text-sm text-slate-900">Build something awesome?</div>
                <div className="text-[11px] text-slate-600 leading-snug mt-0.5">
                  You've been practicing JavaScript lately. Want to turn your skills into a small interactive game?
                </div>
              </div>
            </div>

            {activeLumiPrompt && (
              <div className="bg-white border border-indigo-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-150">
                {activeLumiPrompt === 'Suggest a Project' && "How about a Flashcard Quiz App? It uses arrays, functions, and DOM manipulation — perfect for your level!"}
                {activeLumiPrompt === 'Find a Template' && "I found 3 great templates: Snake Game, Weather Dashboard, and a Todo List. Want me to set one up?"}
                {activeLumiPrompt === 'Help Me Plan' && "Let's break your project into tasks. Start with the data model, then the UI, then wire them together!"}
                {activeLumiPrompt === 'Start From My Challenge' && "Your 'Reverse the String' solution looks great! Want to turn it into a word-scramble mini-game?"}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {['Suggest a Project', 'Find a Template', 'Help Me Plan', 'Start From My Challenge'].map(btn => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => setActiveLumiPrompt(activeLumiPrompt === btn ? null : btn)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold cursor-pointer transition-all border text-left leading-snug ${
                    activeLumiPrompt === btn
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {/* Pro Banner */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
            <Crown className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <div className="text-xs font-bold text-indigo-950">Upgrade to Pro</div>
              <div className="text-[11px] text-indigo-700">Unlock advanced features and more XP.</div>
              <button type="button" className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer w-fit mt-0.5">
                Upgrade Now →
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
