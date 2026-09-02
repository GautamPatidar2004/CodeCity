-- Migration: Create Team Arcade Phase 5 - Fest Scoring & Team Score Aggregation
-- Description: Table for fest scores, database-side scoring trigger on exercise_submissions, atomic team average calculation function, RLS, and realtime

-- 1. Create arcade_fest_scores table
CREATE TABLE IF NOT EXISTS public.arcade_fest_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fest_id UUID REFERENCES public.arcade_fests(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  submission_id UUID REFERENCES public.exercise_submissions(id) ON DELETE SET NULL,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_fest_scores_unique UNIQUE (fest_id, challenge_id, user_id)
);

-- 2. Indexes for fast aggregation
CREATE INDEX IF NOT EXISTS idx_arcade_fest_scores_fest_team ON public.arcade_fest_scores (fest_id, team_id);
CREATE INDEX IF NOT EXISTS idx_arcade_fest_scores_user ON public.arcade_fest_scores (user_id);
CREATE INDEX IF NOT EXISTS idx_arcade_fest_scores_fest_user ON public.arcade_fest_scores (fest_id, user_id);

-- 3. Enable Row Level Security
ALTER TABLE public.arcade_fest_scores ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- All authenticated users can read fest scores
DROP POLICY IF EXISTS "Allow authenticated read arcade_fest_scores" ON public.arcade_fest_scores;
DROP POLICY IF EXISTS "Allow public read arcade_fest_scores" ON public.arcade_fest_scores;
CREATE POLICY "Allow public read arcade_fest_scores"
ON public.arcade_fest_scores
FOR SELECT
USING (true);

-- Direct client inserts/updates are restricted to admin or trigger/security definer
DROP POLICY IF EXISTS "Admin manage arcade_fest_scores" ON public.arcade_fest_scores;
CREATE POLICY "Admin manage arcade_fest_scores"
ON public.arcade_fest_scores
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Trigger Function: process_fest_exercise_submission()
-- Automatically invoked whenever an exercise_submission is recorded with status = 'passed'
CREATE OR REPLACE FUNCTION public.process_fest_exercise_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fest_challenge RECORD;
  v_access JSONB;
BEGIN
  -- Only process successful passes
  IF NEW.status != 'passed' THEN
    RETURN NEW;
  END IF;

  -- Find any currently LIVE fest that includes this exercise
  FOR v_fest_challenge IN
    SELECT fc.fest_id, fc.challenge_id, fc.points, f.start_time, f.end_time, f.status
    FROM public.arcade_fest_challenges fc
    JOIN public.arcade_fests f ON f.id = fc.fest_id
    WHERE fc.challenge_id = NEW.exercise_id
      AND now() >= f.start_time
      AND now() <= f.end_time
      AND f.status != 'ended'
  LOOP
    -- Verify the student is an authorized participant (registered squad, not late join)
    v_access := public.check_fest_participation_access(v_fest_challenge.fest_id, NEW.user_id);

    IF (v_access->>'allowed')::boolean IS TRUE AND (v_access->>'team_id') IS NOT NULL THEN
      -- Insert fest score safely and idempotently
      INSERT INTO public.arcade_fest_scores (
        fest_id,
        challenge_id,
        team_id,
        user_id,
        points_awarded,
        submission_id
      )
      VALUES (
        v_fest_challenge.fest_id,
        v_fest_challenge.challenge_id,
        (v_access->>'team_id')::UUID,
        NEW.user_id,
        v_fest_challenge.points,
        NEW.id
      )
      ON CONFLICT (fest_id, challenge_id, user_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create Trigger on exercise_submissions
DROP TRIGGER IF EXISTS trg_process_fest_exercise_submission ON public.exercise_submissions;
CREATE TRIGGER trg_process_fest_exercise_submission
AFTER INSERT OR UPDATE OF status ON public.exercise_submissions
FOR EACH ROW
EXECUTE FUNCTION public.process_fest_exercise_submission();

-- 6. Stored Function: get_fest_squad_score
-- Calculates student's score and deterministic team average score (sum / member_count)
-- Inactive members who have 0 submissions contribute 0 to the numerator but count toward the denominator
CREATE OR REPLACE FUNCTION public.get_fest_squad_score(
  p_fest_id UUID,
  p_team_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_team RECORD;
  v_member_count INT;
  v_team_total INT := 0;
  v_team_average NUMERIC := 0.0;
  v_my_score INT := 0;
  v_member_scores JSONB := '[]'::jsonb;
  v_member RECORD;
  v_m_score INT;
BEGIN
  -- Fetch team
  SELECT * INTO v_team
  FROM public.arcade_teams
  WHERE id = p_team_id;

  IF v_team.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not found');
  END IF;

  -- Count total team members (denominator for team average)
  SELECT COUNT(*) INTO v_member_count
  FROM public.arcade_team_members
  WHERE team_id = p_team_id;

  IF v_member_count = 0 THEN
    v_member_count := 1;
  END IF;

  -- Calculate each member's score and aggregate total
  FOR v_member IN
    SELECT m.user_id, m.role, p.username, p.full_name, p.level
    FROM public.arcade_team_members m
    LEFT JOIN public.profiles p ON p.id = m.user_id
    WHERE m.team_id = p_team_id
    ORDER BY m.joined_at ASC
  LOOP
    -- Calculate member's cumulative score for this fest
    SELECT COALESCE(SUM(points_awarded), 0) INTO v_m_score
    FROM public.arcade_fest_scores
    WHERE fest_id = p_fest_id AND user_id = v_member.user_id;

    v_team_total := v_team_total + v_m_score;

    IF p_user_id IS NOT NULL AND v_member.user_id = p_user_id THEN
      v_my_score := v_m_score;
    END IF;

    v_member_scores := v_member_scores || jsonb_build_object(
      'user_id', v_member.user_id,
      'username', COALESCE(v_member.username, 'student'),
      'full_name', COALESCE(v_member.full_name, v_member.username, 'Teammate'),
      'role', v_member.role,
      'level', COALESCE(v_member.level, 1),
      'score', v_m_score
    );
  END LOOP;

  -- Calculate team average with 1 decimal precision
  v_team_average := ROUND((v_team_total::numeric / v_member_count::numeric), 1);

  RETURN jsonb_build_object(
    'success', true,
    'fest_id', p_fest_id,
    'team_id', p_team_id,
    'team_name', v_team.name,
    'member_count', v_member_count,
    'team_total_score', v_team_total,
    'team_average_score', v_team_average,
    'my_score', v_my_score,
    'member_scores', v_member_scores
  );
END;
$$;

-- 7. Add arcade_fest_scores to realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_fest_scores;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
