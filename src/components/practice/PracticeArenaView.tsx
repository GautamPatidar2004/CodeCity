import React, { useState, useRef } from 'react'
import {
  Search,
  ChevronRight,
  ChevronDown,
  Star,
  Flame,
  Gift,
  Lock,
  Check,
  Play,
  ArrowRight,
} from 'lucide-react'
import { LumiPixelBot, PixelPythonIcon } from '../brand/PixelArtAvatars'

interface PracticeArenaViewProps {
  onStartChallenge?: () => void
}

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const TECH_FILTERS = ['All', 'Python', 'JavaScript', 'HTML/CSS', 'SQL', 'React', 'Algorithms', 'Data Structures']
const LEVEL_FILTERS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
const SORT_OPTIONS = ['Recommended', 'Newest', 'Most Popular', 'XP Reward']

interface ChallengeCard {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tag: string
  xp: number
  lang: string
  locked: boolean
  isDaily?: boolean
  emoji: string
}

const CHALLENGES: ChallengeCard[] = [
  {
    id: 'reverse-string',
    title: 'Reverse the String',
    description: 'Reverse a string without using the built-in methods.',
    difficulty: 'EASY',
    tag: 'EASY',
    xp: 75,
    lang: 'Python',
    locked: false,
    isDaily: true,
    emoji: '🐍',
  },
  {
    id: 'fizz-buzz',
    title: 'Fizz Buzz',
    description: "Print numbers 1 to n. For multiples of 3 print 'Fizz', for 5 print 'Buzz'.",
    difficulty: 'EASY',
    tag: 'EASY',
    xp: 75,
    lang: 'Python',
    locked: false,
    emoji: '🧱',
  },
  {
    id: 'climb-stairs',
    title: 'Climb the Stairs',
    description: 'Count the number of distinct ways to climb n stairs.',
    difficulty: 'MEDIUM',
    tag: 'MEDIUM',
    xp: 125,
    lang: 'Python',
    locked: false,
    emoji: '🪜',
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    description: 'Find two numbers that add up to the target.',
    difficulty: 'MEDIUM',
    tag: 'MEDIUM',
    xp: 125,
    lang: 'Python',
    locked: false,
    emoji: '🎯',
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring',
    description: 'Find the length of the longest substring without repeating characters.',
    difficulty: 'HARD',
    tag: 'HARD',
    xp: 150,
    lang: 'Python',
    locked: true,
    emoji: '💎',
  },
]

const LEADERBOARD = [
  { rank: 1, emoji: '🥷', name: 'CodeNinja', xp: '3,240 XP' },
  { rank: 2, emoji: '⚔️', name: 'DevWarrior', xp: '2,890 XP' },
  { rank: 3, emoji: '🧙', name: 'SyntaxSorcerer', xp: '2,450 XP' },
  { rank: 4, emoji: '👨‍💻', name: 'LoopMaster', xp: '2,120 XP' },
  { rank: 5, emoji: '🛡️', name: 'ByteKnight', xp: '1,980 XP' },
]

/* ─── Difficulty Helpers ─────────────────────────────────────────────────────── */
function diffClass(d: ChallengeCard['difficulty']) {
  if (d === 'EASY') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (d === 'MEDIUM') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-rose-100 text-rose-700 border-rose-200'
}

/* ─── Component ──────────────────────────────────────────────────────────────── */
export const PracticeArenaView: React.FC<PracticeArenaViewProps> = ({ onStartChallenge }) => {
  const [techFilter, setTechFilter] = useState('All')
  const [levelFilter, setLevelFilter] = useState('All Levels')
  const [sortBy, setSortBy] = useState('Recommended')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const filteredCards = CHALLENGES.filter(c => {
    const matchSearch = searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTech = techFilter === 'All' || c.lang === techFilter
    const matchLevel =
      levelFilter === 'All Levels' ||
      (levelFilter === 'Beginner' && c.difficulty === 'EASY') ||
      (levelFilter === 'Intermediate' && c.difficulty === 'MEDIUM') ||
      (levelFilter === 'Advanced' && c.difficulty === 'HARD')
    return matchSearch && matchTech && matchLevel
  })

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 text-left pb-16 font-sans select-none animate-in fade-in duration-300">

      {/* ================================================================ */}
      {/* 2-COLUMN LAYOUT                                                   */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* ============================================================ */}
        {/* MAIN CONTENT COLUMN (~75%)                                    */}
        {/* ============================================================ */}
        <div className="xl:col-span-9 flex flex-col gap-6">

          {/* ── A. HERO BANNER ── */}
          <div className="relative bg-gradient-to-r from-sky-50 via-sky-100/40 to-emerald-50/40 border border-sky-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-sm gap-6">
            {/* Decorative background blobs */}
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-emerald-100/30 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 right-32 w-40 h-40 rounded-full bg-sky-200/20 blur-2xl pointer-events-none" />

            {/* Left text */}
            <div className="flex flex-col gap-3 z-10 max-w-lg">
              <div className="font-pixel text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                DAILY CODING ADVENTURE
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Sharpen Your<br />Coding Skills.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                Solve bite-sized challenges, master new concepts, and earn XP along the way.
              </p>
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={onStartChallenge}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Start Daily Challenge
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm shadow-xs cursor-pointer transition-colors"
                >
                  Explore Challenges
                </button>
              </div>
            </div>

            {/* Right pixel art illustration */}
            <div className="z-10 shrink-0 flex items-center justify-center relative w-64 h-40">
              {/* Floating code runes */}
              <div className="absolute top-2 left-4 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shadow-2xs rotate-[-8deg]">{`{}`}</div>
              <div className="absolute top-1 right-10 font-mono text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md shadow-2xs rotate-[6deg]">while</div>
              <div className="absolute bottom-4 left-8 font-mono text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md shadow-2xs rotate-[-4deg]">if</div>
              <div className="absolute bottom-1 right-4 font-mono text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md shadow-2xs rotate-[5deg]">fn()</div>
              {/* Coder illustration */}
              <img
                src="/extracted/course/course_hero_art.png"
                alt="Coder at desk with Lumi"
                className="w-full h-full object-contain filter drop-shadow-md"
                onError={e => { e.currentTarget.src = '/pixel_terminal_workspace.jpg' }}
              />
            </div>
          </div>

          {/* ── B. TODAY'S CHALLENGE SPOTLIGHT ── */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-400 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-50/50 blur-3xl pointer-events-none" />

            {/* Left */}
            <div className="flex flex-col gap-2 flex-1 z-10">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] font-pixel uppercase tracking-wider border border-rose-200">
                  🔥 DAILY
                </span>
                <span className="text-[10px] font-pixel font-bold text-slate-500 uppercase tracking-wider">
                  TODAY'S CHALLENGE
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Reverse the String</h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                Write a function that reverses a string without using Python's built-in reverse method.
              </p>
              <div className="flex items-center gap-3 flex-wrap text-xs font-medium mt-1">
                <span className="flex items-center gap-1 text-slate-600">
                  <PixelPythonIcon size={14} /> Python
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 text-[11px]">📶 Easy</span>
                <span className="text-slate-500">⏱ 5 min</span>
                <span className="flex items-center gap-1 font-bold text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> +75 XP
                </span>
              </div>
            </div>

            {/* Center pixel stone tablet */}
            <div className="shrink-0 flex flex-col items-center justify-center z-10">
              <div className="bg-stone-100 border-2 border-stone-300 rounded-2xl px-5 py-4 shadow-md font-mono text-xs text-center space-y-1.5">
                <div className="text-slate-700 font-bold">abcde</div>
                <div className="text-slate-400 text-lg">↓</div>
                <div className="text-emerald-700 font-bold">edcba</div>
              </div>
              <div className="flex gap-1 mt-1.5">
                {['🪨', '🌿', '🪨'].map((e, i) => <span key={i} className="text-sm">{e}</span>)}
              </div>
            </div>

            {/* Right action area */}
            <div className="flex flex-col items-end gap-3 shrink-0 z-10">
              <div className="text-[10px] font-pixel font-bold text-slate-500 uppercase tracking-wider">YOUR PROGRESS</div>
              <div className="flex items-center gap-3">
                {/* Circular progress 0% */}
                <div className="flex flex-col items-center gap-1">
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="0 94.25" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-bold text-xs text-slate-900">0%</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 font-bold">0 / 1</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onStartChallenge}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Start Challenge
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-800 font-medium">
                    <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
                    Complete today's challenge to protect your 7-day streak.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── C. SEARCH & FILTER ── */}
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by concept, language, or skill"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all shadow-2xs"
              />
            </div>

            {/* Tech Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {TECH_FILTERS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTechFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    techFilter === f
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Level + Sort Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {LEVEL_FILTERS.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLevelFilter(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      levelFilter === f
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-slate-300 cursor-pointer transition-colors shadow-2xs"
                >
                  Sort by: {sortBy}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-1 min-w-[160px]">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setSortBy(opt); setShowSortDropdown(false) }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          sortBy === opt ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── D. CHALLENGE CARDS CAROUSEL ── */}
          <div className="relative">
            {/* Carousel container */}
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none' }}
            >
              {filteredCards.map(c => (
                <div
                  key={c.id}
                  className={`snap-start shrink-0 w-[240px] bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    c.isDaily ? 'border-2 border-emerald-400' : 'border-slate-100'
                  } ${c.locked ? 'opacity-75' : ''}`}
                >
                  {/* Card top with emoji illustration */}
                  <div className={`p-4 flex items-center justify-between ${
                    c.difficulty === 'EASY' ? 'bg-emerald-50/50' :
                    c.difficulty === 'MEDIUM' ? 'bg-amber-50/50' : 'bg-rose-50/50'
                  }`}>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-pixel font-bold border ${diffClass(c.difficulty)}`}>
                      {c.tag}
                    </span>
                    <span className="text-3xl leading-none">{c.emoji}</span>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{c.title}</h3>
                      {c.locked && <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed flex-1">{c.description}</p>
                  </div>

                  {/* Card footer */}
                  <div className="px-4 pb-4 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-700 font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      +{c.xp} XP
                    </span>
                    {c.locked ? (
                      <button
                        type="button"
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
                      >
                        <Lock className="w-3 h-3" /> Locked
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onStartChallenge}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                          c.isDaily
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                            : 'bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 hover:border-emerald-400'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Start
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Placeholder if empty */}
              {filteredCards.length === 0 && (
                <div className="flex-1 py-12 flex flex-col items-center justify-center text-slate-400 gap-2 min-w-[320px]">
                  <Search className="w-8 h-8 opacity-40" />
                  <p className="text-sm font-medium">No challenges match your filters.</p>
                </div>
              )}
            </div>

            {/* Scroll button */}
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-all z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── E. ACHIEVEMENT BANNER ── */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                🏆
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-bold text-sm text-slate-900">
                  Complete more challenges to unlock achievements!
                </p>
                <p className="text-xs text-slate-600">
                  Earn badges, climb the leaderboard, and level up your skills.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs cursor-pointer transition-all shadow-xs"
              >
                View Achievements
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT SIDEBAR (~25%)                                          */}
        {/* ============================================================ */}
        <div className="xl:col-span-3 flex flex-col gap-4">

          {/* A. Practice Stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="font-pixel text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              PRACTICE STATS
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: '🎯', label: '36 Challenges Solved' },
                { icon: '⚡', label: '4 Day Streak' },
                { icon: '🏆', label: '1,280 XP Earned' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-3 text-sm">
                  <span className="text-xl w-8 shrink-0 text-center">{stat.icon}</span>
                  <span className="font-semibold text-slate-800">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* B. Streak Quest */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="font-pixel text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              STREAK QUEST
            </div>

            {/* Shield illustration */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="text-5xl">🛡️</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-pixel font-extrabold text-lg text-amber-700 mt-1">7</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="font-extrabold text-sm text-slate-900">7 Day Streak</p>
              <p className="text-xs text-slate-500 mt-0.5">Keep it up! 🔥</p>
            </div>

            {/* 6-day dot progress (5 done, 1 pending) */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {[true, true, true, true, true, false].map((done, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-slate-200 text-slate-300'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-2 h-2 rounded-full bg-slate-200 block" />}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600 font-medium pt-1">
              <Gift className="w-3.5 h-3.5 text-amber-500" />
              1 more day for bonus reward!
            </div>
          </div>

          {/* C. Top Practicers Leaderboard */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="font-pixel text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              TOP PRACTICERS
            </div>

            <div className="flex flex-col gap-2">
              {LEADERBOARD.map(entry => (
                <div key={entry.rank} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                    entry.rank === 1 ? 'bg-amber-400 text-white' :
                    entry.rank === 2 ? 'bg-slate-300 text-slate-700' :
                    entry.rank === 3 ? 'bg-amber-600/80 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {entry.rank}
                  </span>
                  <span className="text-lg">{entry.emoji}</span>
                  <span className="flex-1 text-xs font-semibold text-slate-800 truncate">{entry.name}</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 shrink-0">{entry.xp}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="w-full text-center text-xs font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer transition-colors pt-1"
            >
              View Leaderboard →
            </button>
          </div>

          {/* D. Lumi Motivational Card */}
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 shadow-sm space-y-3 text-center">
            <div className="font-pixel text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              LUMI SAYS
            </div>
            <div className="flex justify-center">
              <LumiPixelBot size={40} glowing={false} />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              "Consistency is the key to mastery. Solve just one challenge today! 💪"
            </p>
            <button
              type="button"
              className="w-full py-2 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Ask Lumi →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
