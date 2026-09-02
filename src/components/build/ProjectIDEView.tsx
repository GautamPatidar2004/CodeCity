import React, { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Plus,
  RotateCcw,
  Share2,
  Rocket,
  MoreHorizontal,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  X,
  Star,
  AlertTriangle,
  Trash2,
  PanelBottomClose,
  PanelBottomOpen,
  Send,
  File,
  Folder,
  FolderOpen,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import { LumiPixelBot } from '../brand/PixelArtAvatars'

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type FileKey = 'index.html' | 'styles.css' | 'app.js'
type ViewportMode = 'desktop' | 'tablet' | 'mobile'
type BottomTab = 'terminal' | 'console' | 'problems' | 'output'

interface ProjectIDEViewProps {
  onBack?: () => void
}

/* ─── File Contents ─────────────────────────────────────────────────────────── */
const FILE_CONTENTS: Record<FileKey, string> = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alex — Junior Developer</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="nav">
    <a href="#" class="brand">Alex</a>
    <nav>
      <a href="#home">Home</a>
      <a href="#projects">Projects</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <section class="hero" id="home">
    <div class="hero-content">
      <h1>Hi, I'm Alex.</h1>
      <p class="subtitle">Junior Developer</p>
      <p>Building things with code, one project at a time.</p>
      <div class="cta-buttons">
        <a href="#projects" class="btn-primary">View Projects</a>
        <a href="#contact" class="btn-secondary">Contact Me</a>
      </div>
    </div>
  </section>

  <section class="projects" id="projects">
    <h2>Featured Projects</h2>
    <div class="project-grid">
      <!-- Projects go here -->
    </div>
  </section>

  <script src="app.js"></script>
</body>
</html>`,
  'styles.css': `/* Personal Portfolio Styles */
:root {
  --primary: #10b981;
  --dark: #1e293b;
  --light: #f8fafc;
  --text: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--text);
  background: var(--light);
}

.nav {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 4rem 2rem;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 900;
  color: var(--dark);
}

/* Unused class — remove */
.hero-image {
  display: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
}`,
  'app.js': `// Personal Portfolio — App Logic
document.addEventListener('DOMContentLoaded', () => {
  console.log('Portfolio loaded!');
  initAnimations();
  loadProjects();
});

function initAnimations() {
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.classList.add('animate-in');
  }
}

function loadProjects() {
  const grid = document.querySelector('.project-grid');
  // TODO: load projects dynamically
  handleClick(); // handleClick is not defined
}

const PROJECTS = [
  { title: 'Portfolio Website', tags: ['HTML', 'CSS'] },
  { title: 'Number Guessing Game', tags: ['Python'] },
  { title: 'Pixel Runner', tags: ['JavaScript'] },
];
`,
}

/* ─── Syntax Highlight (pure CSS classes, not real AST parsing) ─────────────── */
function tokenizeHTML(code: string): React.ReactNode[] {
  // Lightweight line renderer with color spans
  return code.split('\n').map((line, i) => {
    const html = line
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // HTML tags
      .replace(/(&lt;\/?)([\w!-]+)/g, '<span class="tok-tag">$1$2</span>')
      // Attributes
      .replace(/(\s)([\w-]+=)(")/g, '$1<span class="tok-attr">$2</span><span class="tok-str">$3</span>')
      // Strings
      .replace(/(["'][^"']*["'])/g, '<span class="tok-str">$1</span>')
      // Comments
      .replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, '<span class="tok-comment">$1</span>')
      // CSS properties
      .replace(/^(\s*)([\w-]+)(:)(\s)/g, '$1<span class="tok-prop">$2</span>$3$4')
      // JS keywords
      .replace(/\b(const|let|var|function|return|document|if|else)\b/g, '<span class="tok-kw">$1</span>')
    return (
      <div key={i} className="flex">
        <span className="select-none w-9 pr-3 text-right text-slate-600 shrink-0 text-[11px]">{i + 1}</span>
        <span className="flex-1 text-[12px]" dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
      </div>
    )
  })
}

/* ─── Preview HTML ───────────────────────────────────────────────────────────── */
const PREVIEW_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:Inter,system-ui,sans-serif}
body{background:#f8fafc;color:#334155}
.nav{display:flex;justify-content:space-between;align-items:center;padding:12px 24px;background:white;border-bottom:1px solid #e2e8f0;font-size:13px}
.brand{font-weight:800;color:#1e293b;text-decoration:none}
nav a{margin-left:16px;color:#64748b;text-decoration:none;font-size:12px}
nav a:hover{color:#10b981}
.hero{padding:48px 32px;display:flex;align-items:center;gap:32px;background:linear-gradient(135deg,#f0fdf4 0%,#f8fafc 100%)}
.hero-content{flex:1}
h1{font-size:36px;font-weight:900;color:#0f172a;line-height:1.1}
.subtitle{color:#10b981;font-weight:700;font-size:14px;margin:6px 0}
.desc{font-size:12px;color:#64748b;margin:8px 0 16px}
.btns{display:flex;gap:8px}
.btn-p{background:#10b981;color:white;padding:8px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700}
.btn-s{border:2px solid #10b981;color:#10b981;padding:8px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700}
.avatar{width:96px;height:96px;background:#dbeafe;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:40px;flex-shrink:0}
.projects{padding:32px;background:white}
h2{font-size:20px;font-weight:800;color:#0f172a;margin-bottom:16px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.card{background:#f8fafc;border-radius:12px;padding:14px;border:1px solid #e2e8f0}
.card-img{width:100%;height:60px;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;font-size:24px}
.card h3{font-size:12px;font-weight:700;color:#1e293b}
.tag{display:inline-block;background:#dbeafe;color:#1d4ed8;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;margin-top:4px;margin-right:3px}
</style>
</head>
<body>
<div class="nav">
  <a class="brand" href="#">Alex</a>
  <nav>
    <a href="#">Home</a><a href="#">Projects</a><a href="#">About</a><a href="#">Contact</a>
  </nav>
</div>
<div class="hero">
  <div class="hero-content">
    <h1>Hi, I'm Alex.</h1>
    <div class="subtitle">Junior Developer</div>
    <div class="desc">Building things with code, one project at a time.</div>
    <div class="btns">
      <a class="btn-p" href="#">View Projects</a>
      <a class="btn-s" href="#">Contact Me</a>
    </div>
  </div>
  <div class="avatar">👨‍💻</div>
</div>
<div class="projects">
  <h2>Featured Projects</h2>
  <div class="grid">
    <div class="card"><div class="card-img" style="background:#ede9fe">🌐</div><h3>Portfolio Website</h3><span class="tag">HTML</span><span class="tag">CSS</span></div>
    <div class="card"><div class="card-img" style="background:#dcfce7">🎮</div><h3>Number Guessing Game</h3><span class="tag">Python</span></div>
    <div class="card"><div class="card-img" style="background:#dbeafe">🏃</div><h3>Pixel Runner</h3><span class="tag">JS</span><span class="tag">Canvas</span></div>
  </div>
</div>
</body></html>`

/* ─── Build Plan Tasks ───────────────────────────────────────────────────────── */
const BUILD_TASKS = [
  { label: 'Create hero section', xp: 25, done: true },
  { label: 'Add navigation', xp: 25, done: true },
  { label: 'Create project cards', xp: 25, done: true },
  { label: 'Add responsive layout', xp: 25, done: true },
  { label: 'Add contact section', xp: 25, done: false, active: true },
  { label: 'Add animations', xp: 25, done: false },
  { label: 'Test mobile layout', xp: 25, done: false },
  { label: 'Publish project', xp: 100, done: false },
]

/* ─── Component ─────────────────────────────────────────────────────────────── */
export const ProjectIDEView: React.FC<ProjectIDEViewProps> = ({ onBack }) => {
  const [activeFile, setActiveFile] = useState<FileKey>('index.html')
  const [openFiles, setOpenFiles] = useState<FileKey[]>(['index.html', 'styles.css', 'app.js'])
  const [viewport, setViewport] = useState<ViewportMode>('desktop')
  const [bottomTab, setBottomTab] = useState<BottomTab>('terminal')
  const [showBottom, setShowBottom] = useState(true)
  const [showExplorer] = useState(true)
  const [fileTreeExpanded, setFileTreeExpanded] = useState({ src: true, assets: false })
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Load preview into iframe
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = PREVIEW_HTML
    }
  }, [])

  const FILE_ICONS: Record<FileKey, { emoji: string; color: string }> = {
    'index.html': { emoji: '◈', color: 'text-orange-500' },
    'styles.css': { emoji: '◉', color: 'text-sky-500' },
    'app.js': { emoji: '◆', color: 'text-amber-400' },
  }

  const closeFile = (f: FileKey) => {
    const next = openFiles.filter(x => x !== f)
    setOpenFiles(next)
    if (activeFile === f && next.length > 0) setActiveFile(next[next.length - 1])
  }

  const doneTasks = BUILD_TASKS.filter((t: { done: boolean }) => t.done).length
  const totalTasks = BUILD_TASKS.length

  const viewportWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px'

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none animate-in fade-in duration-200" style={{ minHeight: 0 }}>

      {/* ── PROJECT HEADER BAR ── */}
      <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm flex flex-col gap-3">
        {/* Top line */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Projects
            </button>
            <div className="w-px h-5 bg-slate-200 shrink-0" />
            <h1 className="text-xl font-black text-slate-900 truncate">Personal Portfolio</h1>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-700 font-pixel text-[10px] font-bold uppercase border border-amber-200 shrink-0">IN PROGRESS</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {['HTML', 'CSS', 'JavaScript'].map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold">{t}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved just now
            </span>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button type="button" className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs">
              <Rocket className="w-3.5 h-3.5" /> Publish
            </button>
            <button type="button" className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-slate-600 shrink-0">68% Complete</span>
          <span className="text-[10px] text-slate-400 shrink-0">{doneTasks} / {totalTasks} tasks</span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(doneTasks / totalTasks) * 100}%` }} />
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> +300 XP available
          </span>
        </div>
      </div>

      {/* ── MAIN IDE WORKSPACE ── */}
      <div className="flex gap-0 bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-800 shadow-xl" style={{ height: 520 }}>

        {/* Pane 1: File Explorer */}
        {showExplorer && (
          <div className="w-48 flex-shrink-0 bg-[#0f172a] border-r border-slate-800 flex flex-col">
            {/* Explorer header */}
            <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800">
              <span className="font-pixel text-[9px] font-bold text-slate-500 uppercase tracking-wider">EXPLORER</span>
              <button type="button" className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Project folder */}
            <div className="px-2 py-1.5 text-[11px] text-slate-400 flex-1 overflow-y-auto">
              <div className="flex items-center gap-1 font-bold text-slate-300 mb-1 py-0.5 px-1">
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">personal-portfolio</span>
              </div>

              {/* src folder */}
              <button
                type="button"
                onClick={() => setFileTreeExpanded(p => ({ ...p, src: !p.src }))}
                className="flex items-center gap-1 pl-3 py-0.5 px-1 w-full text-left text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded cursor-pointer"
              >
                {fileTreeExpanded.src ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <FolderOpen className="w-3 h-3 text-amber-400" />
                <span className="ml-0.5">src</span>
              </button>

              {fileTreeExpanded.src && (
                <div className="pl-6">
                  {(Object.keys(FILE_ICONS) as FileKey[]).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        setActiveFile(f)
                        if (!openFiles.includes(f)) setOpenFiles(prev => [...prev, f])
                      }}
                      className={`flex items-center gap-1.5 w-full text-left py-0.5 px-1 rounded cursor-pointer transition-colors text-[11px] ${
                        activeFile === f ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`text-[10px] font-bold ${FILE_ICONS[f].color}`}>{FILE_ICONS[f].emoji}</span>
                      <span className="truncate">{f}</span>
                      <span className="ml-auto text-[8px] text-amber-400 font-bold">M</span>
                    </button>
                  ))}

                  {/* assets subfolder */}
                  <button
                    type="button"
                    onClick={() => setFileTreeExpanded(p => ({ ...p, assets: !p.assets }))}
                    className="flex items-center gap-1 w-full text-left py-0.5 px-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded cursor-pointer"
                  >
                    {fileTreeExpanded.assets ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <Folder className="w-3 h-3 text-amber-400" />
                    <span className="ml-0.5">assets</span>
                  </button>
                  {fileTreeExpanded.assets && (
                    <div className="pl-5 text-slate-500">
                      <div className="py-0.5 px-1">avatar.png</div>
                      <div className="py-0.5 px-1">preview.png</div>
                    </div>
                  )}
                </div>
              )}

              {/* Root files */}
              {['README.md', 'package.json'].map(f => (
                <div key={f} className="flex items-center gap-1.5 pl-4 py-0.5 px-1 text-slate-500 hover:text-slate-300 cursor-pointer rounded hover:bg-slate-800/50">
                  <File className="w-3 h-3" /><span className="text-[11px]">{f}</span>
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="border-t border-slate-800 px-3 py-2 flex items-center gap-3">
              <button type="button" className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer">
                <Plus className="w-3 h-3" /> New File
              </button>
              <button type="button" className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer">
                <Plus className="w-3 h-3" /> New Folder
              </button>
            </div>
          </div>
        )}

        {/* Center split: Editor + Preview stacked vertically */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top: Editor + Preview side by side */}
          <div className="flex flex-1 min-h-0">

            {/* Pane 2: Code Editor */}
            <div className="flex flex-col w-[45%] flex-shrink-0 border-r border-slate-800">
              {/* Editor tab bar */}
              <div className="bg-[#0f172a] flex items-center border-b border-slate-800 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {openFiles.map(f => (
                  <div
                    key={f}
                    className={`flex items-center gap-1.5 px-3 py-2 cursor-pointer whitespace-nowrap text-[11px] border-r border-slate-800 ${
                      activeFile === f
                        ? 'bg-[#1e293b] text-white border-t-2 border-t-emerald-500'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                    onClick={() => setActiveFile(f)}
                  >
                    <span className={`font-bold text-[10px] ${FILE_ICONS[f].color}`}>{FILE_ICONS[f].emoji}</span>
                    <span>{f}</span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); closeFile(f) }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button type="button" className="px-3 py-2 text-slate-500 hover:text-slate-300 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Code area */}
              <div className="flex-1 overflow-auto bg-[#1e293b] py-3 font-mono leading-6">
                <style>{`
                  .tok-tag { color: #7dd3fc; }
                  .tok-attr { color: #f9a8d4; }
                  .tok-str { color: #86efac; }
                  .tok-comment { color: #64748b; font-style: italic; }
                  .tok-prop { color: #c4b5fd; }
                  .tok-kw { color: #f472b6; }
                `}</style>
                {tokenizeHTML(FILE_CONTENTS[activeFile])}
              </div>

              {/* Status bar */}
              <div className="bg-[#0f172a] px-3 py-1 flex items-center gap-4 text-[9px] text-slate-500 border-t border-slate-800 flex-wrap">
                <span>Ln 14, Col 45</span>
                <span>Spaces: 2</span>
                <span>UTF-8</span>
                <span>LF</span>
                <span className={`font-bold ${activeFile === 'index.html' ? 'text-orange-400' : activeFile === 'styles.css' ? 'text-sky-400' : 'text-amber-400'}`}>
                  {activeFile === 'index.html' ? 'HTML' : activeFile === 'styles.css' ? 'CSS' : 'JavaScript'}
                </span>
                <span className="ml-auto">● Normal</span>
              </div>
            </div>

            {/* Pane 3: Live Preview */}
            <div className="flex flex-col flex-1 min-w-0">
              {/* Browser header */}
              <div className="bg-[#0f172a] px-3 py-2 flex items-center gap-2 border-b border-slate-800">
                <div className="flex items-center gap-1">
                  <button type="button" className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* URL bar */}
                <div className="flex-1 flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1 text-[11px] text-slate-300 mx-1">
                  <span className="text-emerald-400">🔒</span>
                  <span className="flex-1 text-center text-slate-400">localhost:3000</span>
                  <Star className="w-3 h-3 text-slate-500" />
                </div>

                {/* Viewport */}
                <div className="flex items-center gap-1">
                  {([
                    { mode: 'desktop' as ViewportMode, Icon: Monitor },
                    { mode: 'tablet' as ViewportMode, Icon: Tablet },
                    { mode: 'mobile' as ViewportMode, Icon: Smartphone },
                  ]).map(({ mode, Icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewport(mode)}
                      className={`p-1.5 rounded cursor-pointer transition-colors ${
                        viewport === mode ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                  <button type="button" className="p-1.5 rounded text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* iframe preview */}
              <div className="flex-1 bg-slate-700 overflow-auto flex items-start justify-center p-1">
                <div
                  className="bg-white h-full overflow-auto rounded transition-all duration-300 origin-top"
                  style={{ width: viewportWidth, minWidth: viewport === 'desktop' ? undefined : viewportWidth }}
                >
                  <iframe
                    ref={iframeRef}
                    title="Portfolio Preview"
                    className="w-full h-full border-0"
                    style={{ minHeight: 400 }}
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pane 4: Bottom Panel (Terminal + Problems) */}
          <div className={`border-t border-slate-800 flex ${showBottom ? 'h-36' : 'h-8'} transition-all duration-200`}>
            {/* Tab bar */}
            <div className="flex flex-col w-[50%] min-w-0 border-r border-slate-800">
              <div className="bg-[#0f172a] flex items-center justify-between border-b border-slate-800 px-2">
                <div className="flex">
                  {(['terminal', 'console', 'problems', 'output'] as BottomTab[]).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => { setBottomTab(tab); setShowBottom(true) }}
                      className={`px-3 py-1.5 text-[10px] font-pixel font-bold uppercase tracking-wide cursor-pointer transition-colors border-b-2 ${
                        bottomTab === tab ? 'text-white border-white' : 'text-slate-500 border-transparent hover:text-slate-300'
                      }`}
                    >
                      {tab === 'problems' ? 'PROBLEMS (2)' : tab.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"><Plus className="w-3 h-3" /></button>
                  <button type="button" className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                  <button type="button" onClick={() => setShowBottom(!showBottom)} className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer">
                    {showBottom ? <PanelBottomClose className="w-3.5 h-3.5" /> : <PanelBottomOpen className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              {showBottom && (
                <div className="flex-1 overflow-auto p-2 font-mono text-[10px] text-slate-300 space-y-0.5">
                  {bottomTab === 'terminal' && (
                    <>
                      <div className="text-slate-500">$ npm run dev</div>
                      <div className="text-slate-400">{'>'} live-server --port=3000</div>
                      <div className="text-slate-400">Local: <span className="text-sky-400">http://localhost:3000</span></div>
                      <div className="text-emerald-400">✓ Ready in 482ms</div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Process running
                      </div>
                    </>
                  )}
                  {bottomTab === 'console' && <div className="text-slate-500">No console output.</div>}
                  {bottomTab === 'problems' && <div className="text-slate-500">See problems panel →</div>}
                  {bottomTab === 'output' && <div className="text-slate-500">No output.</div>}
                </div>
              )}
            </div>

            {/* Problems panel */}
            <div className="w-[50%] flex flex-col min-w-0">
              <div className="bg-[#0f172a] flex items-center justify-between border-b border-slate-800 px-3 py-1.5">
                <span className="font-pixel text-[9px] font-bold text-slate-400 uppercase tracking-wide">PROBLEMS • 2</span>
                <button type="button" className="text-slate-500 hover:text-slate-300 cursor-pointer">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
              {showBottom && (
                <div className="flex-1 overflow-auto p-2 space-y-2">
                  <div className="flex items-start gap-2 text-[10px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-amber-300 font-bold">styles.css</div>
                      <div className="text-slate-400">src/styles.css — Line 42: Unused class .hero-image</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[10px]">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-rose-300 font-bold">app.js</div>
                      <div className="text-slate-400">src/app.js — Line 18: handleClick is not defined</div>
                    </div>
                  </div>
                  <button type="button" className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer">View all problems →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT WORKSPACE PANEL ── */}
      {/* (Rendered as a separate column in the grid below) */}

      {/* ── BOTTOM STATUS STRIP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Build Journey Stepper */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="font-bold text-sm text-slate-900 mb-4">Your Build Journey</div>
          <div className="flex items-center justify-between gap-1">
            {[
              { icon: '💡', label: 'Idea', done: true },
              { icon: '🔨', label: 'Prototype', done: true },
              { icon: '🖥️', label: 'Build', done: false, active: true },
              { icon: '✏️', label: 'Polish', done: false },
              { icon: '🚀', label: 'Ship', done: false },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 transition-all ${
                    step.done ? 'bg-emerald-100 border-emerald-400' :
                    step.active ? 'bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-200' :
                    'bg-slate-100 border-slate-200'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-[10px] font-bold ${step.active ? 'text-emerald-700' : step.done ? 'text-slate-500' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 ${step.done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Ready to Ship */}
        <div className="bg-gradient-to-r from-emerald-50/60 to-sky-50/40 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-emerald-100/40 blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-2 z-10">
            <div className="font-bold text-sm text-slate-900">Ready to Ship? 🚀</div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
              You're close! Complete the remaining tasks, polish your project and publish it to the world.
            </p>
            <button type="button" className="w-fit flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs cursor-pointer transition-colors shadow-xs">
              Publish Project →
            </button>
          </div>
          <div className="text-4xl shrink-0 z-10">🚀</div>
        </div>
      </div>
    </div>
  )
}

/* ─── Right Panel Companion (exported for use alongside the IDE) ─────────────── */
export const ProjectIDERightPanel: React.FC<{
  tasks: typeof BUILD_TASKS
  onToggleTask: (i: number) => void
}> = ({ tasks, onToggleTask }) => {
  const [lumiInput, setLumiInput] = useState('')
  const [lumiMessages, setLumiMessages] = useState<{ role: 'user' | 'lumi'; text: string }[]>([])
  const [activePrompt, setActivePrompt] = useState<string | null>(null)

  const doneTasks = tasks.filter(t => t.done).length

  const sendLumi = () => {
    const text = lumiInput.trim() || activePrompt || ''
    if (!text) return
    const reply = `I see you're working on "${text}". Try breaking this down into smaller steps. Start with the HTML structure, then add styles, then wire up the JS!`
    setLumiMessages(prev => [...prev, { role: 'user', text }, { role: 'lumi', text: reply }])
    setLumiInput('')
    setActivePrompt(null)
  }

  const PROMPTS = ['💡 Help Me Plan', '🔍 Review My Code', '🐛 Find the Bug', '🎨 Improve the UI', '📖 Explain This', '🚀 What Next?']

  return (
    <div className="flex flex-col gap-4">
      {/* Build Plan */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="font-pixel text-[10px] font-bold text-slate-500 uppercase tracking-wider">BUILD PLAN</span>
          <span className="text-[10px] font-bold text-emerald-600">{doneTasks} / {tasks.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          {tasks.map((task, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onToggleTask(i)}
              className={`flex items-center gap-2.5 w-full text-left p-2 rounded-xl transition-all cursor-pointer border ${
                task.done
                  ? 'bg-emerald-50 border-emerald-200'
                  : task.active
                  ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-200'
                  : 'bg-white border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                task.done ? 'bg-emerald-500 border-emerald-500' :
                task.active ? 'border-emerald-500 bg-white' :
                'border-slate-200 bg-white'
              }`}>
                {task.done && <Check className="w-3 h-3 text-white stroke-[3]" />}
                {task.active && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              <span className={`flex-1 text-xs ${task.done ? 'line-through text-slate-400' : 'font-semibold text-slate-800'}`}>
                {task.label}
              </span>
              <span className="text-[10px] font-bold text-amber-600">+{task.xp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lumi Assistant */}
      <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/70 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <LumiPixelBot size={28} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs text-slate-900">Lumi</div>
            <div className="text-[10px] text-slate-500">Your Coding Companion</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Working
          </div>
        </div>

        {/* Context chips */}
        <div className="flex gap-1.5 flex-wrap">
          {['index.html', 'styles.css', 'app.js'].map(f => (
            <span key={f} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] text-slate-600 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{f}
            </span>
          ))}
        </div>

        {/* Quick prompt pills */}
        <div className="grid grid-cols-2 gap-1.5">
          {PROMPTS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePrompt(activePrompt === p ? null : p)}
              className={`px-2 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all border text-left leading-snug ${
                activePrompt === p
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat messages */}
        {lumiMessages.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-2 space-y-2 max-h-24 overflow-y-auto">
            {lumiMessages.slice(-4).map((m, i) => (
              <div key={i} className={`text-[10px] leading-relaxed ${m.role === 'user' ? 'text-slate-600 font-semibold' : 'text-indigo-700'}`}>
                {m.role === 'lumi' ? '🤖 ' : '💬 '}{m.text}
              </div>
            ))}
          </div>
        )}

        {/* Chat input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={lumiInput}
            onChange={e => setLumiInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendLumi()}
            placeholder="Ask me anything..."
            className="flex-1 text-[11px] px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
          <button
            type="button"
            onClick={sendLumi}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Builder Level */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="font-pixel text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2.5">BUILDER LEVEL</div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-700">LVL 4</span>
              <span className="font-mono text-slate-500">1,240 / 1,500 XP</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
          <span className="text-2xl">🚶</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-200">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-amber-800">+25 XP</span>
            <span className="text-[10px] text-amber-700">Completed "Add navigation" • Just now</span>
          </div>
        </div>
      </div>
    </div>
  )
}
