# Frontend UI Architecture & Connection Status

This document catalogs all the current UI features and tabs available on the frontend of CodeCity (The Crucible), evaluating their connection to the backend and their adherence to the new Phase 1–4 "Charred Basalt/Nordic" design language.

## 1. Global Shell & Navigation
- **Blade of Olympus Cursor (`BladeOfChaosCursor`)** 
  - **Theme:** Updated to Crucible theme.
  - **Status:** Fully functional custom pointer tracking.
- **Helm of War Header (`CrucibleHeader`)**
  - **Theme:** Updated to Crucible theme.
  - **Status:** Connected to `AuthContext` for XP, Level, and Streak.
- **Lumi AI Mentor (`LumiAIFloatingButton`)**
  - **Theme:** Legacy light theme/glassmorphism.
  - **Status:** **Not Connected**. Currently uses mock/hardcoded responses.
- **Atmospheric Background Canvas**
  - **Theme:** Updated to Crucible theme (Blood mist, frost vignettes, Omega watermark).

---

## 2. Main Navigation Tabs

### 🗺️ Dashboard (`/dashboard`)
- **Views:** `AppShellOverviewView`, `AppShellDashboardView`, `FirstTimeDashboardView`
- **Theme:** Legacy Ivory/Light theme. Not updated to Crucible style.
- **Status:** **Not Connected**. Relies on hardcoded mock data for recent activity, recommended quests, and daily tasks.

### 📚 Learn (`/learn`)
- **Views:** `LearnCatalogView`, `CourseDetailView`, `InteractiveLessonView`, `CodingChallengeView`, `QuestIDEView`
- **Theme:** Legacy Light theme.
- **Status:** **Not Connected**. The Python curriculum and course progress are completely hardcoded. No dynamic fetching of courses or lesson state from Supabase.

### ⚔️ Practice (`/practice`)
- **Views:** `PracticeArenaView`, `ChallengeBriefingView`, `CrucibleWorkspace`
- **Theme:** Mixed/Legacy Light theme.
- **Status:** **Not Connected**. Exercises are fetched from a mock data function (`getCrucibleChallenge`) rather than real backend tables.

### ⚒️ Build / Projects (`/build`)
- **Views:** `ProjectsStudioView`, `ProjectIDEView`, `DwarvenForgeWorkbench`
- **Theme:** 
  - `DwarvenForgeWorkbench`: Updated to Crucible theme.
  - `ProjectsStudioView` & `ProjectIDEView`: Legacy Light theme.
- **Status:** 
  - **Dwarven Forge (Guided Projects):** **Connected** to Supabase backend (`lib/guidedProjects.ts`).
  - **Project IDE (Free-form):** **Not Connected**. The project tasks and sandbox are hardcoded and do not save to a database.

### 🛡️ Clan Arcade (`/arcade`)
- **Views:** `BloodArenaBattleView`, `RagnarokFestLobby`, `ClanProfileCard`
- **Theme:** Fully updated to Crucible theme.
- **Status:** **Fully Connected**. Wired securely to Supabase via `lib/arcade.ts` (Clan management, registering for fests/battles, real-time presence).

### 📜 Shield-Wall Community (`/community`)
- **Views:** `ShieldWallFeed`, `CommentThread`, `PostCard`
- **Theme:** Fully updated to Crucible theme.
- **Status:** **Fully Connected**. Wired securely to Supabase via `lib/community.ts` (Posts, comments, likes, following logic).

### ⚙️ Settings (`/settings`)
- **Views:** In-line settings profile page.
- **Theme:** Legacy Light theme (bg-white, stone text).
- **Status:** **Not Connected**. Profile data (e.g., "Alex Morgan", 4,850 XP) is hardcoded inside `AppShell.tsx` rather than fetching dynamic `user_metadata` or profile row data.

---

## Summary of Disconnected / Legacy UI
If you wish to continue the Crucible redesign or backend integration, the following areas require immediate attention:
1. **The Dashboard:** Needs a dark basalt reskin and dynamic data fetching.
2. **The Learn Tab:** Needs a real curriculum database schema and a visual redesign.
3. **The Practice Tab:** Needs to query real exercises from the DB and adopt the Blood Arena aesthetic.
4. **The Settings Page:** Needs to map to real user context and remove hardcoded "Alex Morgan" values.
