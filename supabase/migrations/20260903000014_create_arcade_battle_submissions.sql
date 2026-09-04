-- Migration: Create Team Arcade Phase 12 - Submissions, Speed Scoring & Quest Progression
-- Description: Tables for battle submissions and team quest progression, server-side cooldown enforcement, atomic speed-bonus calculation, wrong-answer penalty, and sequential quest unlock

-- 1. Create arcade_battle_submissions table
CREATE TABLE IF NOT EXISTS public.arcade_battle_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.arcade_battles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'execution_error', 'timeout')),
  passed_test_count INTEGER NOT NULL DEFAULT 0,
  total_test_count INTEGER NOT NULL DEFAULT 0,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create alias view for compatibility
CREATE OR REPLACE VIEW public.battle_submissions AS
  SELECT * FROM public.arcade_battle_submissions;

-- 3. Create arcade_battle_team_progress table (tracks quest unlock status, attempts, and scored points)
CREATE TABLE IF NOT EXISTS public.arcade_battle_team_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.arcade_battles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  order_position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'completed')),
  attempts_count INTEGER NOT NULL DEFAULT 0,
  base_points INTEGER NOT NULL DEFAULT 0,
  speed_bonus INTEGER NOT NULL DEFAULT 0,
  penalty INTEGER NOT NULL DEFAULT 0,
  score_awarded INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_battle_team_progress_unique UNIQUE (battle_id, team_id, exercise_id)
);

-- 4. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_battle_submissions_lookup ON public.arcade_battle_submissions (battle_id, team_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_team ON public.arcade_battle_submissions (team_id);
CREATE INDEX IF NOT EXISTS idx_battle_team_progress_lookup ON public.arcade_battle_team_progress (battle_id, team_id, order_position);

-- 5. Enable Row Level Security
ALTER TABLE public.arcade_battle_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arcade_battle_team_progress ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Submissions: squad members can view their own team's submissions; admins view all
DROP POLICY IF EXISTS "Members view own battle submissions" ON public.arcade_battle_submissions;
CREATE POLICY "Members view own battle submissions"
ON public.arcade_battle_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.arcade_team_members tm
    WHERE tm.team_id = arcade_battle_submissions.team_id
      AND tm.user_id = auth.uid()
  ) OR public.is_admin()
);

-- Progress: squad members can view their own team's quest progress; admins view all
DROP POLICY IF EXISTS "Members view own team battle progress" ON public.arcade_battle_team_progress;
CREATE POLICY "Members view own team battle progress"
ON public.arcade_battle_team_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.arcade_team_members tm
    WHERE tm.team_id = arcade_battle_team_progress.team_id
      AND tm.user_id = auth.uid()
  ) OR public.is_admin()
);

-- 7. Stored Procedure: get_or_init_battle_team_progress
-- Initializes the sequential quest progression for a team in a battle
CREATE OR REPLACE FUNCTION public.get_or_init_battle_team_progress(
  p_battle_id UUID,
  p_team_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_member BOOLEAN;
  v_is_registered BOOLEAN;
  v_ex RECORD;
  v_count INTEGER;
  v_result JSONB;
BEGIN
  -- 1. Security Check: verify user belongs to squad
  SELECT EXISTS (
    SELECT 1 FROM public.arcade_team_members
    WHERE team_id = p_team_id AND user_id = p_user_id
  ) INTO v_is_member;

  IF NOT v_is_member AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You are not a member of this squad.');
  END IF;

  -- 2. Security Check: verify squad registered for this battle
  SELECT EXISTS (
    SELECT 1 FROM public.arcade_battle_registrations
    WHERE battle_id = p_battle_id AND team_id = p_team_id AND status = 'confirmed'
  ) INTO v_is_registered;

  IF NOT v_is_registered AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Squad is not registered for this battle.');
  END IF;

  -- 3. Check if progress already initialized
  SELECT COUNT(*) INTO v_count
  FROM public.arcade_battle_team_progress
  WHERE battle_id = p_battle_id AND team_id = p_team_id;

  -- If not initialized, populate progress for all exercises configured in Prompt 2
  IF v_count = 0 THEN
    FOR v_ex IN
      SELECT exercise_id, order_position
      FROM public.arcade_battle_exercises
      WHERE battle_id = p_battle_id
      ORDER BY order_position ASC
    LOOP
      INSERT INTO public.arcade_battle_team_progress (
        battle_id,
        team_id,
        exercise_id,
        order_position,
        status
      ) VALUES (
        p_battle_id,
        p_team_id,
        v_ex.exercise_id,
        v_ex.order_position,
        CASE WHEN v_ex.order_position = 1 THEN 'unlocked' ELSE 'locked' END
      )
      ON CONFLICT (battle_id, team_id, exercise_id) DO NOTHING;
    END LOOP;
  END IF;

  -- 4. Return all progress rows for this team
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'battle_id', p.battle_id,
      'team_id', p.team_id,
      'exercise_id', p.exercise_id,
      'order_position', p.order_position,
      'status', p.status,
      'attempts_count', p.attempts_count,
      'base_points', p.base_points,
      'speed_bonus', p.speed_bonus,
      'penalty', p.penalty,
      'score_awarded', p.score_awarded,
      'completed_at', p.completed_at,
      'completed_by', p.completed_by,
      'last_submitted_at', p.last_submitted_at
    ) ORDER BY p.order_position ASC
  ) INTO v_result
  FROM public.arcade_battle_team_progress p
  WHERE p.battle_id = p_battle_id AND p.team_id = p_team_id;

  RETURN jsonb_build_object('success', true, 'progress', COALESCE(v_result, '[]'::jsonb));
END;
$$;

-- 8. Stored Procedure: validate_battle_submission_clearance
-- Pre-flight checks before code execution: timing, registration, quest unlock status, and cooldown
CREATE OR REPLACE FUNCTION public.validate_battle_submission_clearance(
  p_battle_id UUID,
  p_team_id UUID,
  p_exercise_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle RECORD;
  v_is_member BOOLEAN;
  v_is_registered BOOLEAN;
  v_progress RECORD;
  v_seconds_since_last NUMERIC;
  v_cooldown_remaining INTEGER;
BEGIN
  -- 1. Verify user membership
  SELECT EXISTS (
    SELECT 1 FROM public.arcade_team_members
    WHERE team_id = p_team_id AND user_id = p_user_id
  ) INTO v_is_member;

  IF NOT v_is_member AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Unauthorized: You are not a member of this squad.');
  END IF;

  -- 2. Verify battle registration
  SELECT EXISTS (
    SELECT 1 FROM public.arcade_battle_registrations
    WHERE battle_id = p_battle_id AND team_id = p_team_id AND status = 'confirmed'
  ) INTO v_is_registered;

  IF NOT v_is_registered AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Squad is not registered for this battle.');
  END IF;

  -- 3. Verify battle lifecycle timing
  SELECT * INTO v_battle
  FROM public.arcade_battles
  WHERE id = p_battle_id;

  IF v_battle.id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Battle not found.');
  END IF;

  IF now() < v_battle.start_time THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Battle has not started yet.');
  END IF;

  IF now() > v_battle.end_time THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Battle has already concluded. Submissions are closed.');
  END IF;

  -- 4. Verify quest unlock status in team progression
  SELECT * INTO v_progress
  FROM public.arcade_battle_team_progress
  WHERE battle_id = p_battle_id AND team_id = p_team_id AND exercise_id = p_exercise_id;

  IF v_progress.id IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Quest progress not initialized.');
  END IF;

  IF v_progress.status = 'locked' THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'This quest is locked. Complete preceding quests first.');
  END IF;

  -- 5. Enforce submission cooldown
  IF v_progress.last_submitted_at IS NOT NULL AND v_battle.submission_cooldown_seconds > 0 THEN
    v_seconds_since_last := EXTRACT(EPOCH FROM (now() - v_progress.last_submitted_at));
    IF v_seconds_since_last < v_battle.submission_cooldown_seconds THEN
      v_cooldown_remaining := CEIL(v_battle.submission_cooldown_seconds - v_seconds_since_last)::INTEGER;
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'Submission cooldown active. Please wait ' || v_cooldown_remaining || 's.',
        'cooldown_remaining_seconds', v_cooldown_remaining
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- 9. Stored Procedure: record_battle_quest_submission
-- Atomically records execution result, calculates tamper-proof speed bonus and wrong-answer penalty,
-- and advances progression to the next quest on successful pass.
CREATE OR REPLACE FUNCTION public.record_battle_quest_submission(
  p_battle_id UUID,
  p_team_id UUID,
  p_exercise_id UUID,
  p_user_id UUID,
  p_code TEXT,
  p_language TEXT,
  p_status TEXT,
  p_passed_count INTEGER,
  p_total_count INTEGER,
  p_exec_time_ms INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle RECORD;
  v_progress RECORD;
  v_elapsed_seconds NUMERIC;
  v_total_seconds NUMERIC;
  v_time_ratio NUMERIC;
  v_speed_bonus INTEGER := 0;
  v_penalty INTEGER := 0;
  v_awarded INTEGER := 0;
  v_submission_id UUID;
  v_next_order INTEGER;
  v_team_total_score INTEGER := 0;
BEGIN
  -- 1. Lock progress row for update to prevent concurrent race conditions
  SELECT * INTO v_progress
  FROM public.arcade_battle_team_progress
  WHERE battle_id = p_battle_id AND team_id = p_team_id AND exercise_id = p_exercise_id
  FOR UPDATE;

  IF v_progress.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quest progression not found.');
  END IF;

  -- 2. Verify battle timing
  SELECT * INTO v_battle
  FROM public.arcade_battles
  WHERE id = p_battle_id;

  IF v_battle.id IS NULL OR now() < v_battle.start_time OR now() > v_battle.end_time THEN
    RETURN jsonb_build_object('success', false, 'error', 'Submissions closed for this battle.');
  END IF;

  -- 3. Record submission in arcade_battle_submissions
  INSERT INTO public.arcade_battle_submissions (
    battle_id,
    team_id,
    exercise_id,
    submitted_by,
    code,
    language,
    status,
    passed_test_count,
    total_test_count,
    execution_time_ms
  ) VALUES (
    p_battle_id,
    p_team_id,
    p_exercise_id,
    p_user_id,
    p_code,
    COALESCE(p_language, 'javascript'),
    p_status,
    p_passed_count,
    p_total_count,
    p_exec_time_ms
  ) RETURNING id INTO v_submission_id;

  -- 4. Update last_submitted_at
  UPDATE public.arcade_battle_team_progress
  SET last_submitted_at = now()
  WHERE id = v_progress.id;

  -- 5. Process Outcome
  IF p_status = 'passed' THEN
    -- If quest already completed previously, do not award duplicate points
    IF v_progress.status = 'completed' THEN
      RETURN jsonb_build_object(
        'success', true,
        'submission_id', v_submission_id,
        'status', 'passed',
        'already_completed', true,
        'score_awarded', v_progress.score_awarded,
        'message', 'Solution accepted! Quest was already completed.'
      );
    END IF;

    -- Calculate Speed Bonus: elapsed time since battle start
    v_elapsed_seconds := EXTRACT(EPOCH FROM (now() - v_battle.start_time));
    v_total_seconds := GREATEST(60.0, v_battle.duration_minutes * 60.0);
    v_time_ratio := GREATEST(0.0, LEAST(1.0, 1.0 - (v_elapsed_seconds / v_total_seconds)));
    v_speed_bonus := ROUND(v_battle.speed_bonus_max * v_time_ratio);

    -- Calculate Wrong-Answer Penalty based on prior failed attempts
    v_penalty := v_progress.attempts_count * v_battle.wrong_answer_penalty;

    -- Total Score awarded
    v_awarded := GREATEST(0, v_battle.base_points + v_speed_bonus - v_penalty);

    -- Mark quest as completed
    UPDATE public.arcade_battle_team_progress
    SET
      status = 'completed',
      base_points = v_battle.base_points,
      speed_bonus = v_speed_bonus,
      penalty = v_penalty,
      score_awarded = v_awarded,
      completed_at = now(),
      completed_by = p_user_id,
      updated_at = now()
    WHERE id = v_progress.id;

    -- Automatically unlock next sequential quest
    v_next_order := v_progress.order_position + 1;
    UPDATE public.arcade_battle_team_progress
    SET status = 'unlocked', updated_at = now()
    WHERE battle_id = p_battle_id
      AND team_id = p_team_id
      AND order_position = v_next_order
      AND status = 'locked';

  ELSE
    -- Increment failed attempts count
    UPDATE public.arcade_battle_team_progress
    SET
      attempts_count = attempts_count + 1,
      updated_at = now()
    WHERE id = v_progress.id;
  END IF;

  -- 6. Calculate authoritative team score
  SELECT COALESCE(SUM(score_awarded), 0) INTO v_team_total_score
  FROM public.arcade_battle_team_progress
  WHERE battle_id = p_battle_id AND team_id = p_team_id AND status = 'completed';

  RETURN jsonb_build_object(
    'success', true,
    'submission_id', v_submission_id,
    'status', p_status,
    'already_completed', false,
    'base_points', CASE WHEN p_status = 'passed' THEN v_battle.base_points ELSE 0 END,
    'speed_bonus', v_speed_bonus,
    'penalty', v_penalty,
    'score_awarded', v_awarded,
    'team_total_score', v_team_total_score,
    'next_unlocked_order', CASE WHEN p_status = 'passed' THEN v_next_order ELSE NULL END
  );
END;
$$;

-- 10. Add tables to Supabase Realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_battle_submissions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_battle_team_progress;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
