# CodeCity: Backend Features & Frontend Data Mapping

This document provides a detailed breakdown of all the backend features available in CodeCity, focusing on the specific data models and fields exposed to the frontend. This information is crucial for redesigning the UI to ensure all available data is properly utilized and displayed.

---

## 1. Learning & Progression System (Islands, Courses, Lessons)
This system powers the core educational content, organizing it into languages, islands (paths), courses, and chapters.

### 1.1. Learning Paths (Islands)
The highest level of content grouping.
- **Fields to show on UI:** 
  - `title`, `description`, `icon`, `island_name`
  - **Progress Data:** `progressPercent`, `completedCourses`, `totalCourses`, `isCompleted`

### 1.2. Courses & Chapters
Courses belong to paths, and chapters belong to courses.
- **Course Fields:**
  - `title`, `description`, `track`, `difficulty`
  - `isUnlocked` (based on `prerequisite_course_id`)
  - **Progress Data:** `progressPercent`, `completedLessons`, `totalLessons`, `isCompleted`, `lastAccessedAt`
- **Chapter Fields:**
  - `title`, `order_index`
  - **Progress Data:** `progressPercent`, `completedLessons`, `totalLessons`

### 1.3. Lessons & Resume Points
The actual learning content. The UI needs to show where the user left off.
- **Lesson Detail Fields:**
  - `title`, `summary`, `content` (Markdown/Rich Text)
  - `isCompleted`, `isUnlocked`, `lockReason`
  - Connected `challenge` data (if the lesson includes a coding challenge)
- **Resume Point (For Dashboard "Continue Learning" UI):**
  - `courseTitle`, `lessonTitle`, `chapterTitle`, `progressPercent`

---

## 2. Gamification & User Stats
This data is essential for the user dashboard, top navigation bar, and profile pages.

### 2.1. Core Stats
- **GamificationStats Fields:**
  - `xp` (Total Experience Points)
  - `level` (Calculated from XP, e.g., floor(XP/200) + 1)
  - `streak` (Current daily login streak)
  - `dailyXpEarned`, `dailyGoalXp`, `dailyGoalPercent`, `dailyGoalCompleted`
  - `currentLevelBaseXp`, `nextLevelXp` (Useful for a progress bar to the next level)

### 2.2. Badges, Achievements & Activity
- **Achievements/Badges:** 
  - `name`, `description`, `icon`, `requirement_type`, `requirement_value`
  - `is_earned`, `earned_at` (For displaying colored vs grayscale icons)
- **Activity History:**
  - `action_type` (e.g., 'completed_lesson', 'earned_badge')
  - `xp_earned`, `created_at` (For a timeline or activity feed UI)
- **Notifications:**
  - `type`, `title`, `message`, `is_read`, `created_at` (For a notification dropdown/bell icon)

---

## 3. Coding Challenges
Interactive coding exercises with code execution capabilities.

### 3.1. Challenge Details
- **Challenge Fields:**
  - `title`, `description`, `difficulty`, `category`
  - `starter_code`, `language`, `instructions`, `sample_input`, `hints` (Array of strings)
  - `xp_reward`, `solution_explanation`, `solution_code` (Shown only after completion)
- **User Progress on Challenge:**
  - `is_completed`, `best_score`, `attempts_count`, `last_attempt_at`

### 3.2. Execution Results
When a user submits code, the backend Edge Function (`execute-code`) returns:
- **Result Fields:**
  - `stdout`, `stderr`, `error`, `isError`, `executionTimeMs`
  - Test case results (Pass/Fail per test case)

---

## 4. Arcade: Teams, Fests, & Battles (Competitive Coding)
Advanced multiplayer and competitive features.

### 4.1. Arcade Teams
- **Team Data:**
  - `name`, `avatar_url`, `motto`, `stats_total_xp`, `stats_battles_won`
  - `members` (Array of users with their roles: 'leader', 'co-leader', 'member')

### 4.2. Arcade Fests (Large Events)
- **Fest Data:**
  - `title`, `description`, `banner_url`, `status` ('upcoming', 'live', 'ended')
  - `start_date`, `end_date`
  - **Lobby/Challenges:** List of `FestChallenge` available during the event.
  - **Leaderboard:** `FestSquadScore` (Team rank, total score, time penalty).

### 4.3. Arcade Battles (Time-bound Competitions)
- **Battle Data:**
  - `title`, `description`, `mode` (e.g., 'solo', 'team'), `status`
  - `start_time`, `duration_minutes`
  - `tie_breaker_rule` ('fastest_time', 'least_submissions', etc.)
- **Battle Exercises:**
  - Similar to normal challenges but locked to the battle context.
- **Battle Workspace (Real-time Collab):**
  - Requires showing active `CollabPresenceUser` (who is currently typing/viewing).
- **Battle Leaderboard:**
  - `rank`, `team_name`, `total_score`, `total_time_penalty`, `exercises_completed`

---

## 5. Guided Projects
Multi-stage, real-world projects for advanced learning.

### 5.1. Project Overview
- **Fields:**
  - `title`, `description`, `difficulty`, `estimated_hours`, `skills_gained` (Array)
  - `prerequisites` (Text or links to courses)

### 5.2. Project Stages
- **Stage Fields:**
  - `title`, `description`, `order_index`
  - `validation_type` ('io_test' or 'dom_check')
  - `starter_code`, `solution_code`
- **User Progress:**
  - `status` ('locked', 'in_progress', 'completed')
  - `is_completed`, `completed_at`

---

## 6. Community & Social
- **Posts & Feed:**
  - `title`, `content`, `author` (Name, Avatar, Level), `tags`
  - `likes_count`, `comments_count`, `created_at`
  - `is_liked_by_user` (For the heart icon toggle)
- **Comments:**
  - `content`, `author`, `created_at`
- **Followers:**
  - Following/Follower counts on user profiles.

---

## UI Redesign Recommendations Based on Data:
1. **Global Header:** Must include XP, Level, Current Streak (with flame icon), Notification Bell (with unread count), and User Avatar.
2. **Dashboard:** Should prominently feature a "Resume Point" card, Daily XP Goal progress bar, and a quick glance at the Learning Path progress.
3. **Challenge Workspace:** Needs split panes: Instructions/Hints on the left, Code Editor in the middle, and Console/Test Results on the bottom or right.
4. **Arcade Lobby:** Needs a highly gamified, dynamic UI showing live event countdowns, active team members, and a scrolling leaderboard.
