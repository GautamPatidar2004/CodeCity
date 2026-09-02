# 🏰 CodeQuest — Complete Frontend Architecture & Design System Analysis

> Comprehensive, element-by-element deep dive into the frontend engineering, UI/UX aesthetics, design tokens, typography, gradients, animations, component hierarchy, and gamification mechanics of the **CodeQuest** platform.

---

## 📑 Table of Contents
1. [Executive Overview & Tech Stack](#1-executive-overview--tech-stack)
2. [Design System & Visual Tokens](#2-design-system--visual-tokens)
   - [Typography & Font System](#typography--font-system)
   - [Custom Pixel Cursors](#custom-pixel-cursors)
   - [Color Palette & CSS Variables](#color-palette--css-variables)
   - [Gradients & Brand Monograms](#gradients--brand-monograms)
   - [Glow Effects, Shadows & 3D Tactile Buttons](#glow-effects-shadows--3d-tactile-buttons)
   - [Custom Keyframe Animations](#custom-keyframe-animations)
3. [Frontend Directory & File Structure](#3-frontend-directory--file-structure)
4. [Component Architecture & UI Library](#4-component-architecture--ui-library)
   - [Brand Components](#brand-components)
   - [Core UI Elements & Gamified HUD](#core-ui-elements--gamified-hud)
   - [Navigation Bar](#navigation-bar)
5. [Page-by-Page Deep Dive](#5-page-by-page-deep-dive)
   - [1. Authentication & Onboarding (AuthPage & 5-Step Flow)](#1-authentication--onboarding-authpage--5-step-flow)
   - [2. Learner Dashboard (LearnerDashboard)](#2-learner-dashboard-learnerdashboard)
   - [3. Quests & Learning Paths (QuestsPage)](#3-quests--learning-paths-questspage)
   - [4. Split-Screen Code Studio (LessonPage & CodeExerciseEditor)](#4-split-screen-code-studio-lessonpage--codeexerciseeditor)
   - [5. Guided Project Blueprints (ProjectsPage)](#5-guided-project-blueprints-projectspage)
   - [6. Community Realm (CommunityPage)](#6-community-realm-communitypage)
   - [7. Analytics & Leaderboard (AnalyticsPage)](#7-analytics--leaderboard-analyticspage)
   - [8. Super Admin Dashboard (AdminDashboard)](#8-super-admin-dashboard-admindashboard)
6. [State Management & Backend Integration](#6-state-management--backend-integration)
7. [Design Polish & Micro-Interactions Summary](#7-design-polish--micro-interactions-summary)

---

## 1. Executive Overview & Tech Stack

CodeQuest is built with a state-of-the-art gamified web stack combining modern high-performance tools with retro 16-bit RPG aesthetics:

| Technology | Role & Version | Purpose & Implementation |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Declarative component tree, Hooks (`useCallback`, `useMemo`, `useState`, `useEffect`) |
| **TypeScript** | `~6.0.2` | Complete type safety, strict interface models for curriculum, submissions, users, and HUD stats |
| **Vite** | `^8.2.2` | Lightning-fast HMR and bundle pipeline |
| **Tailwind CSS** | `@tailwindcss/vite ^4.3.3` | Modern Tailwind v4 engine using `@theme`, utility classes, and custom base layers |
| **Framer Motion** | `^13.1.1` | Smooth spring physics, layout animations, exit transitions, hover scaling, HUD pill floating |
| **Monaco Editor** | `@monaco-editor/react ^4.7.0` | In-browser VS Code editor engine supporting JS, Python, HTML/CSS, C++, Java with dark mode |
| **Canvas Confetti** | `canvas-confetti ^1.9.4` | Particle bursts for level-ups, quest completions, badge unlocks, and onboarding finishes |
| **React Hot Toast** | `react-hot-toast ^2.6.0` | Custom retro RPG floating toast cards with audio-visual feedback |
| **Lucide React & Pixelarticons** | `^1.37.0` & `^2.4.1` | Hybrid icon system: clean SVGs for system controls, 16-bit sprites for RPG rewards |
| **Supabase Client** | `@supabase/supabase-js ^2.112.4` | Authentication, Postgres database, Row Level Security (RLS), and Realtime updates |

---

## 2. Design System & Visual Tokens

### Typography & Font System

The application employs a 3-tier font hierarchy loaded through Google Fonts and local variable font fallbacks:

```html
<!-- Google Fonts CDN link in index.html -->
https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Mulish:ital,wght@0,300..1000;1,300..1000&family=Press+Start+2P&display=swap
```

1. **Primary Sans (`--font-sans` / `.font-sans`)**:
   - **Font**: `'Mulish', system-ui, -apple-system, sans-serif`
   - **Characteristics**: Modern geometric humanist sans-serif with rounded terminals.
   - **Usage**: Body text, card descriptions, standard UI labels, buttons, form inputs, modal dialogs.
   
2. **Retro 16-Bit Pixel Font (`--font-pixel` / `.font-pixel`)**:
   - **Font**: `'Press Start 2P', monospace, cursive`
   - **Characteristics**: Chunky bitmap monospace retro gaming font.
   - **Usage**: Level badges (`LVL 12`), XP indicators (`+120 XP`), quest titles, streak tags (`3D STREAK`), HUD pills, button callouts, section headers.

3. **Code & Console Monospace (`--font-mono` / `.font-mono`)**:
   - **Font**: `'JetBrains Mono', 'Geist Mono', monospace`
   - **Characteristics**: High-legibility coding font with clear punctuation and mathematical ligatures.
   - **Usage**: Monaco Editor, terminal output logs, test case I/O, code fences, timestamps.

---

### Custom Pixel Cursors

Every element in the application uses custom base64 pixel art cursors configured at the `@layer base` level in `src/index.css`:

- **Default Pointer Cursor (`*`)**: Custom pixel sword cursor (`data:image/png;base64,...`).
- **Interactive Cursor (`a, button, [role="button"], label, select`)**: Pixelated pointing gauntlet / hand.
- **Text Selection Cursor (`input, textarea, p, h1-h6, span`)**: Custom retro I-beam caret.

---

### Color Palette & CSS Variables

Configured in `src/index.css` under `:root` and extended across Tailwind:

```css
:root {
  --background: #f8fafc;        /* Slate 50 canvas */
  --foreground: #0f172a;        /* Slate 900 primary text */
  --card: #ffffff;              /* Pure white card backgrounds */
  --card-foreground: #0f172a;   /* Slate 900 text */

  --primary: #fbbf24;           /* Amber 400 (Golden Sparkles & XP) */
  --primary-foreground: #0f172a;/* Deep Slate */
  --secondary: #10b981;         /* Emerald 500 (Success, Coding, Progress) */
  --secondary-foreground: #ffffff;
  --accent: #c084fc;            /* Purple 400 (Mystic Portal, Badges) */
  --accent-foreground: #0f172a;

  --muted: #f1f5f9;             /* Slate 100 */
  --muted-foreground: #64748b;  /* Slate 500 */
  --border: #e2e8f0;            /* Slate 200 */
}
```

#### Detailed Realm & Gamification Palette:

| Palette Role | Hex Code | Purpose & Application |
| :--- | :--- | :--- |
| **Emerald Realm** | `#10b981`, `#059669`, `#047857`, `#34d399` | Primary action buttons, progress bars, solved lessons, student tags |
| **Gold / Amber Sun** | `#fbbf24`, `#f59e0b`, `#d97706`, `#fef08a` | XP points, star awards, trophies, daily goal streaks |
| **Flame Orange** | `#f97316`, `#ea580c`, `#ff4b4b` | Consecutive day streak counter, danger buttons |
| **Mystic Violet** | `#7c3aed`, `#9333ea`, `#c084fc`, `#191535` | Admin role badges, portal scenes, level HUD backgrounds, challenges |
| **Cyan / Sky Blue** | `#00c6ff`, `#0ea5e9`, `#38bdf8`, `#0284c7` | Brand monogram 'C', mascot robot eyes, React track, terminal highlights |
| **Dark HUD Void** | `#0b0e1b`, `#191535`, `#1e1e2e`, `#0f172a` | Level badges, terminal backgrounds, Monaco editor theme |
| **Soft Cream Grass** | `#f8faf4`, `#f4f8f0`, `#f8fafc` | Page backdrop canvas blending seamlessly with pixel RPG islands |

---

### Gradients & Brand Monograms

1. **Brand CQ Monogram (`CodeQuestMonogram` in `CodeQuestLogo.tsx`)**:
   - **Letter 'C' Gradient**: `#00c6ff` (0%) → `#0ea5e9` (50%) → `#2563eb` (100%) [Cyan to Royal Blue]
   - **Letter 'Q' Gradient**: `#7c3aed` (0%) → `#9333ea` (60%) → `#c084fc` (100%) [Vivid Purple to Violet]
   - **Sparkle Star Gradient**: `#fef08a` (0%) → `#facc15` (50%) → `#eab308` (100%) [Gold 4-point star]
   - **Wordmark Gradient**: `bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent`

2. **Welcome Mascot Banner Gradient**:
   - `bg-gradient-to-r from-emerald-500/10 via-white to-white` with emerald-500 left accent border.

3. **Wooden RPG Signposts**:
   - `bg-gradient-to-r from-[#854d0e] to-[#a16207]` with border `#713f12` and gold text `#fef08a`.

---

### Glow Effects, Shadows & 3D Tactile Buttons

1. **3D Tactile Push Buttons (`GamifiedButton` & `.btn-3d`)**:
   - **Primary (`#1cb0f6`)**: Sky blue surface with `#1899d6` 4px bevel bottom border.
   - **Secondary (`#58cc02`)**: Duolingo/CodeQuest emerald surface with `#58a700` 4px bottom border.
   - **Warning (`#ffc800`)**: Yellow surface with `#e5b400` 4px bottom border.
   - **Danger (`#ff4b4b`)**: Red surface with `#cc3333` 4px bottom border.
   - **Tactile Active Press**: `active:translate-y-1 active:border-b-1` with Framer Motion spring physics (`stiffness: 600, damping: 28`).

2. **Gamified Card Glow Styles (`GamifiedCard.tsx`)**:
   - `glow="cyan"`: `shadow-[0_8px_30px_rgba(56,189,248,0.15)] hover:shadow-[0_12px_40px_rgba(56,189,248,0.25)]`
   - `glow="emerald"`: `shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.25)]`
   - `glow="amber"`: `shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.25)]`
   - `glow="purple"`: `shadow-[0_8px_30px_rgba(168,85,247,0.15)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.25)]`

---

### Custom Keyframe Animations

Defined in `src/index.css`:

```css
/* Smooth continuous floating */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

/* Slow ambient floating for companions & code sigils */
@keyframes float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Delayed phase floating */
@keyframes float-delayed {
  0%, 100% { transform: translateY(-6px); }
  50% { transform: translateY(2px); }
}

/* Neon Glow Filters */
@keyframes neon-glow-cyan {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.6)) drop-shadow(0 0 12px rgba(56, 189, 248, 0.4)); }
  50% { filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.9)) drop-shadow(0 0 20px rgba(56, 189, 248, 0.6)); }
}

@keyframes neon-glow-orange {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.6)) drop-shadow(0 0 12px rgba(249, 115, 22, 0.4)); }
  50% { filter: drop-shadow(0 0 12px rgba(249, 115, 22, 0.9)) drop-shadow(0 0 20px rgba(249, 115, 22, 0.6)); }
}

@keyframes neon-glow-yellow {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(234, 179, 8, 0.6)) drop-shadow(0 0 12px rgba(234, 179, 8, 0.4)); }
  50% { filter: drop-shadow(0 0 12px rgba(234, 179, 8, 0.9)) drop-shadow(0 0 20px rgba(234, 179, 8, 0.6)); }
}

/* Star particle breathing */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.15); }
}

/* Pulse Glow for completed quests */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35); }
  50% { box-shadow: 0 6px 24px rgba(16, 185, 129, 0.7); }
}
```

---

## 3. Frontend Directory & File Structure

```
d:\Hackathon\Hack Synapse\CodeCity\
├── index.html                   # HTML entrypoint with font imports and root configuration
├── package.json                 # Dependencies and build scripts
├── tsconfig.json                # TypeScript compiler config
├── vite.config.ts               # Vite configuration with @tailwindcss/vite
├── public/                      # Static assets, fonts, and pixel background scenery
│   ├── bouncingbot.webp         # Animated mascot sprite
│   ├── questbot.png             # QuestBot high-res artwork
│   ├── codequest_bg.jpg         # 16-bit RPG castle scene
│   ├── codequest_stage_bg.jpg   # Coding stage scene
│   ├── codequest_trail_bg.jpg   # RPG trailhead waypoint scene
│   ├── codequest_rpg_bottom.jpg # Bottom grass pixel strip
│   ├── codequest_rpg_sidebar.jpg# Left/Right RPG island sidebars
│   ├── codequest_onboarding_bg.jpg # Onboarding background
│   ├── login_world_bg.jpg       # Login screen scenery
│   ├── fonts/                   # Local variable fonts (GeistMono, Mulish, PressStart2P)
│   └── favicon.svg              # Brand SVG favicon
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── App.tsx                  # Root application router & authentication controller
    ├── App.css                  # Custom styling overrides
    ├── index.css                # Base Tailwind v4 layer, fonts, cursors, keyframe animations
    ├── context/
    │   └── AuthContext.tsx      # Global Supabase authentication & user role context
    ├── components/
    │   ├── brand/
    │   │   ├── CodeQuestLogo.tsx    # CQ Monogram, Wordmark, QuestBot Head & SVG assets
    │   │   └── GameBackground.tsx   # Parallax island scenery with floating code runes
    │   ├── layout/
    │   │   └── AppNavbar.tsx        # Top floating glassmorphic navbar with HUD stats & bell
    │   ├── ui/
    │   │   ├── GamifiedButton.tsx   # 3D tactile push buttons with spring physics
    │   │   ├── GamifiedCard.tsx     # Rounded-3xl glowing cards with accent color borders
    │   │   ├── GamifiedInput.tsx    # Rounded text inputs with emerald focus rings
    │   │   ├── PixelHUD.tsx         # Segmented XP bar, Level badges, streak counter, XP pill
    │   │   ├── PixelTooltip.tsx     # Indigo tooltip with pixelated directional tails
    │   │   ├── GameToast.tsx        # Floating RPG toast notifications (XP, badges, streaks)
    │   │   ├── Confetti.tsx         # Canvas confetti trigger utilities & auto-fire hooks
    │   │   └── Fireflies.tsx        # Ambient floating luminous particles
    │   ├── auth/
    │   │   ├── CodeQuestLoginCard.tsx           # Login card with quick demo presets
    │   │   ├── CodeQuestRegisterCard.tsx        # Character creation card with role selection
    │   │   ├── CodeQuestForgotPasswordCard.tsx  # Password recovery card
    │   │   ├── CodeQuestRpgScene.tsx            # Interactive 16-bit retro RPG login scene
    │   │   └── CodeQuestTrailheadScene.tsx      # Waypoint trailhead register scene
    │   ├── onboarding/
    │   │   ├── CodeQuestOnboardingFlow.tsx      # 5-step wizard state machine
    │   │   ├── CodeQuestOnboardingStep1.tsx     # Goals selection (Websites, Games, AI, etc.)
    │   │   ├── CodeQuestOnboardingStep2.tsx     # Experience level selection
    │   │   ├── CodeQuestOnboardingStep3.tsx     # Language preference selection
    │   │   ├── CodeQuestOnboardingStep4.tsx     # Character & Companion customization
    │   │   └── CodeQuestOnboardingStep5.tsx     # Final realm entry celebration
    │   ├── dashboard/
    │   │   ├── LearnerDashboard.tsx             # Student dashboard (resume learning, stats, badges)
    │   │   └── AdminDashboard.tsx               # Comprehensive Super Admin control center
    │   └── learning/
    │       ├── CodeExerciseEditor.tsx           # Monaco editor, STDIN, test case runner, submission history
    │       └── LessonModal.tsx                  # Pop-up coding exercise modal
    ├── pages/
    │   ├── AuthPage.tsx             # Auth split-screen canvas
    │   ├── DashboardPage.tsx        # Role-based dashboard dispatcher
    │   ├── QuestsPage.tsx           # Language tracks, Islands, Course journeys, Practice sandbox
    │   ├── LessonPage.tsx           # Split 50/50 CodeDex journey page with safe Markdown parser
    │   ├── ProjectsPage.tsx         # Guided project blueprints, step checklists, showcase gallery
    │   ├── CommunityPage.tsx        # Social realm, creations feed, likes, comments drawer, reports
    │   └── AnalyticsPage.tsx        # Skill matrix, streak breakdown, all-time/weekly leaderboards
    └── lib/
        ├── supabase.ts              # Supabase client initialization & types
        ├── utils.ts                 # `cn` clsx/tailwind-merge helper
        ├── learning.ts              # Courses, chapters, lessons, progressive unlocking API
        ├── challenges.ts            # Practice challenges & attempts API
        ├── submissions.ts           # Code execution, test cases evaluation & submission history
        ├── execution.ts             # Sandboxed code execution provider
        ├── projects.ts              # Projects, blueprint steps, and user enrollments API
        ├── community.ts             # Feed posts, likes, comments, follow system & moderation API
        ├── achievements.ts          # Badges, achievements, notifications, and activity logger
        ├── gamification.ts          # XP, levels, streaks, and daily goal calculation
        ├── leaderboard.ts           # Multi-period leaderboard rankings API
        └── admin.ts                 # Platform analytics, audit logging, and learner administration
```

---

## 4. Component Architecture & UI Library

### Brand Components

1. **`CodeQuestMonogram` (`CodeQuestLogo.tsx`)**:
   - Custom SVG rendering overlapping 'C' and 'Q' glyphs with smooth geometric radii.
   - Embeds radial and linear gradients plus a 4-point golden sparkle.
   
2. **`QuestBotHead` (`CodeQuestLogo.tsx`)**:
   - Pixelated robot companion SVG with cyan ear pods, white head casing, dark CRT screen, and an animated star eye polygon.
   - Includes speech bubble with directional tail: `"Let's Build Together!"`.

3. **`GameBackground` (`GameBackground.tsx`)**:
   - Fixed viewport background featuring left and right pixelated RPG islands masked with linear alpha gradients.
   - Floating syntax sigils (`{}`, `</>`, `[]`) animating via `animate-float-slow`.

---

### Core UI Elements & Gamified HUD

1. **`PixelXPBar` (`PixelHUD.tsx`)**:
   - 8-segment neon green progress bar.
   - Active segments illuminated with `bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]`.
   - Staggered entry animation (`delay: i * 0.05`).

2. **`LevelBadge` (`PixelHUD.tsx`)**:
   - Dark translucent badge (`bg-[#191535]/95 border-2 border-[#382f6b]`).
   - Displays current level, sword icon `⚔️`, integrated `PixelXPBar`, and gold star XP counter.

3. **`PixelStreakCounter` (`PixelHUD.tsx`)**:
   - Orange flame counter with continuous pulsing fire animation (`scale: [1, 1.18, 1]`).
   - Displays consecutive learning days.

4. **`GameToaster` & `showXPToast` (`GameToast.tsx`)**:
   - Custom toasts for `showXPToast` (XP pill popup) and `showQuestToast` (with variants: `complete`, `badge`, `streak`, `levelup`).
   - Automatically triggers `fireConfetti()` on quest completion or level ups.

5. **`Confetti` (`Confetti.tsx`)**:
   - Presets: `xp`, `levelup` (dual-cannon side bursts), `questcomplete` (center burst), and `default`.

6. **`FirefliesBackground` (`Fireflies.tsx`)**:
   - 24 animated luminous micro-particles cycling through emerald, amber, purple, and cyan with randomized positions and delay timings.

---

### Navigation Bar (`AppNavbar.tsx`)

A floating top navigation bar with rounded-3xl borders, glassmorphic blur (`backdrop-blur-md`), and gamified status indicators:

- **Left Section**: `CodeQuestLogo` (small) + Role Pill (`STUDENT` in emerald or `ADMIN` in purple).
- **Center Section**: 5 tactile navigation pills with active scale and drop shadows:
  - 📊 **Dashboard** (`LayoutDashboard` — emerald-600)
  - 📖 **Quests** (`BookOpen` — blue-600)
  - 📁 **Projects** (`FolderGit2` — amber-600)
  - 💬 **Community** (`MessageSquare` — purple-600)
  - 📈 **Analytics** (`BarChart3` — cyan-600)
- **Right Section**:
  - Gold XP pill (`Star` + XP count)
  - Orange Streak pill (`Flame` + Day count)
  - Dark Level badge (`LVL {level}`)
  - Notification Bell with unread counter badge and interactive drop-down drawer
  - User Avatar portrait with emerald border and username lockup
  - Sign Out button with hover red glow

---

## 5. Page-by-Page Deep Dive

### 1. Authentication & Onboarding (`AuthPage` & 5-Step Flow)

- **Layout**: Split-screen responsive grid (12-column layout).
  - Left: Clean, high-converting auth cards (`CodeQuestLoginCard`, `CodeQuestRegisterCard`, `CodeQuestForgotPasswordCard`).
  - Right: Immersive 16-bit retro RPG scenes (`CodeQuestRpgScene`, `CodeQuestTrailheadScene`).
- **Interactive Features**:
  - **Quick Demo Presets**: Instant auto-fill buttons for `🎓 Student` (`student@codequest.dev`) and `🛡️ Admin` (`admin@codequest.dev`).
  - **Password Strength Meter**: Real-time 3-stage visual strength bar (Weak / Fair / Strong).
  - **Role Selector Tabs**: Student vs Admin/Mentor toggle during registration with instant badge and color scheme shift.
  - **Character Creator / Onboarding Wizard**:
    - **Step 1**: Goal selection with custom SVG game cards.
    - **Step 2**: Experience tier selector (Beginner, Intermediate, Advanced).
    - **Step 3**: Tech stack & language interests.
    - **Step 4**: Avatar selector & cosmetic skin customizer.
    - **Step 5**: Celebration screen with initial bonus XP award and confetti burst.

---

### 2. Learner Dashboard (`LearnerDashboard.tsx`)

- **Welcome Hero**: Dynamic greeting card with animated mascot sprite (`/bouncingbot.webp`), streak notice, and 1-click **Resume Learning** CTA.
- **Gamified Stats Trio**:
  1. **Streak Card**: Amber card with fire icon and consecutive days count.
  2. **XP & Daily Goal**: Emerald card displaying current XP, daily progress bar, and percentage (`{dailyXp}/{dailyGoalXp}`).
  3. **Level Power**: Purple card with level indicator and remaining XP calculation for the next level.
- **Badges & Achievements Grid**: Unlocked vs locked (grayscale with opacity) badge showcases.
- **Active Courses & Quests**: Card grid showing course tracks, completion progress bars, and direct "Learn: Lesson Name" action buttons.
- **Recent Activity History**: Chronological log of recent quest completions and XP gains.

---

### 3. Quests & Learning Paths (`QuestsPage.tsx`)

- **Programming Realm Filter Bar**: Dynamic language selector tabs (JavaScript, Python, React, HTML/CSS, C++, Java, etc.).
- **CodeDex Islands & Learning Paths**: Visual island tiles showing archipelago progress, completed course ratios, and progress bars.
- **Progressive Course Journey Tree**:
  - Course cards with difficulty badges and prerequisite locks.
  - Expandable **Quest Path**: Shows chapters and sequential journey nodes:
    - ✅ **Completed Node**: Emerald background with checkmark.
    - ⚡ **Current Node**: Pulsing emerald border with play icon.
    - 🔓 **Unlocked Node**: White card with order number.
    - 🔒 **Locked Node**: Slate background with lock icon (enforces sequential progression).
- **Practice Sandbox**: Standalone coding challenges with difficulty badges, attempts counter, expandable hints, and solution explanations.

---

### 4. Split-Screen Code Studio (`LessonPage.tsx` & `CodeExerciseEditor.tsx`)

A full-screen split workspace inspired by the CodeDex learning interface:

```
+-----------------------------------------------------------------------------------+
| Top Navigation: Back to Course | Lesson X of Y | Track Badge | Completed Status    |
+--------------------------------------------------+--------------------------------+
| LEFT COLUMN (50%):                              | RIGHT COLUMN (50%):            |
| - Lesson Title & Chapter Hierarchy              | - Monaco Code Editor           |
| - Quest Objective Highlight Box                 | - Multi-Language Syntax Dropdown|
| - Safe Markdown Parser:                         | - Program Input / STDIN Box    |
|   * Copyable Code Examples                      | - Run Code & Submit Buttons    |
|   * Console Output Blocks                       | - Test Cases Validation Panel  |
| - Continuous Navigation Bar:                     | - Terminal Output Window       |
|   * Prev Lesson / Start of Course               | - Expandable Hint Drawer       |
|   * Completed Status                            | - Solution Explanation Drawer  |
|   * Next Lesson (Locked until tests pass)       | - Submission History Logs      |
+--------------------------------------------------+--------------------------------+
```

- **Safe Lesson Markdown Parser**: Custom parser supporting code fences, copy-to-clipboard buttons, syntax highlighting, blockquotes, numbered steps, and lists without raw HTML injection.
- **Monaco Code Editor**: Full IDE experience with syntax highlighting, automatic layout, line numbers, and word wrap.
- **Test Case Validation System**:
  - Evaluates both public and hidden test cases.
  - Displays passed/failed counts, execution time (ms), expected output vs actual output, and runtime errors.
  - Triggers confetti and unlocks the **Next Lesson** button upon 100% test completion.

---

### 5. Guided Project Blueprints (`ProjectsPage.tsx`)

- **View Mode Switcher**:
  - 📋 **Project Blueprints**: Step-by-step guided project builds.
  - 🌟 **Community Showcase**: Gallery of student-built creations with live demo links.
- **Interactive Checklists**: Checkboxes for each project milestone step that sync to database progress.
- **Project Showcase Submissions**: Modal allowing students to submit project titles, descriptions, live demo URLs, and GitHub repos.

---

### 6. Community Realm (`CommunityPage.tsx`)

- **Community Feed**: Live stream of student breakthroughs, quest victories, and project showcases.
- **Interactive Feed Features**:
  - **Quick Post Composer**: Text & showcase creation.
  - **Like Button**: Heart toggle with real-time like count.
  - **Follow / Unfollow**: Interactive follower networking.
  - **Comments Drawer**: Slide-out conversation thread supporting threaded replies and comment moderation.
  - **Content Reporting Modal**: Flagging system for safety and moderation.

---

### 7. Analytics & Leaderboard (`AnalyticsPage.tsx`)

- **KPI Metric Cards**: Total Power & Level, Lessons Solved, Coding Streak.
- **Track Skill Matrix**: Progress bars grouped by language track (JavaScript, Python, React, Backend) displaying percentage mastery and earned XP.
- **Gamified Leaderboard**:
  - Period tabs: `All-Time`, `Weekly`, `Monthly`.
  - Top 3 Podium: Special gold (`🥇`), silver (`🥈`), and bronze (`🥉`) styling with glowing avatars.
  - User position highlight card.

---

### 8. Super Admin Dashboard (`AdminDashboard.tsx`)

A massive (200KB+), industrial-grade control center accessible exclusively by users with the `admin` role:

- **Curriculum & Course Studio**:
  - Create, edit, delete, and reorder Languages, Learning Paths, Courses, Chapters, and Lessons.
- **Coding Challenge & Test Case Studio**:
  - Create challenges, specify starter code, sample input/output, hints, and solution code.
  - **Test Case Builder**: Add public and hidden unit test cases with expected outputs.
- **Project Blueprint Manager**:
  - Manage guided projects and create sequential step milestones.
- **Learner Administration**:
  - View all registered adventurers, XP, levels, and switch user roles (Student ⇄ Admin).
- **Moderation & Safety Center**:
  - Review flagged content reports and manage post moderation statuses (`approved`, `flagged`, `removed`).
- **Platform Analytics & Audit Logs**:
  - Real-time user metrics, course completion rates, active streaks, and immutable admin action audit logs.

---

## 6. State Management & Backend Integration

The frontend uses custom React hooks backed by Supabase client libraries:

```
                      +-----------------------------+
                      |       AuthContext.tsx       |
                      | (User Session, Profile, Role)|
                      +--------------+--------------+
                                     |
    +-----------------+--------------+---------------+-----------------+
    |                 |                              |                 |
    v                 v                              v                 v
lib/learning.ts  lib/challenges.ts              lib/projects.ts   lib/community.ts
- Courses        - Practice Quests              - Blueprints      - Feed Posts
- Chapters       - Attempts                     - Steps           - Likes
- Lessons        - Exercise Test Cases          - Showcases       - Comments
- Unlocks                                                         - Reports
    |                 |                              |                 |
    +-----------------+--------------+---------------+-----------------+
                                     |
                      +--------------v--------------+
                      |     lib/gamification.ts     |
                      |   lib/achievements.ts       |
                      |     lib/leaderboard.ts      |
                      | (XP, Streaks, Badges, Ranks)|
                      +-----------------------------+
```

---

## 7. Design Polish & Micro-Interactions Summary

- **Pixel Perfection**: Consistent 8px/12px grid system, rounded-2xl/rounded-3xl pill borders, and 16-bit retro assets.
- **Immediate Audio-Visual Feedback**: Spring animations on button presses, glowing hover rings, particle confetti explosions, and smooth level-up notifications.
- **Responsive Layout**: Fluid flex and grid layouts adapting from mobile screens to 4K ultra-wide monitors.
- **Accessibility & Polish**: Semantic HTML, distinct focus outlines, custom pixel selection colors (`selection:bg-emerald-500 selection:text-white`), and clean contrast ratios across both light and dark UI elements.
