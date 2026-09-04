-- Migration: Create Team Arcade Phase 13 - Live Leaderboard, Final Rankings & Battle History
-- Description: Deterministic team leaderboard calculation with tie-breaking, immutable final results table, finalization procedure, and student battle history function

-- 1. Create arcade_battle_results table for immutable historical persistence
CREATE TABLE IF NOT EXISTS public.arcade_battle_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.arcade_battles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  final_rank INTEGER NOT NULL CHECK (final_rank >= 1),
  final_score INTEGER NOT NULL CHECK (final_score >= 0),
  quests_completed INTEGER NOT NULL DEFAULT 0,
  total_quests INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  total_speed_bonus INTEGER NOT NULL DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_battle_results_unique UNIQUE (battle_id, team_id)
);

-- 2. Create alias view for compatibility
CREATE OR REPLACE VIEW public.battle_results AS
  SELECT * FROM public.arcade_battle_results;

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_arcade_battle_results_battle ON public.arcade_battle_results (battle_id, final_rank ASC);
CREATE INDEX IF NOT EXISTS idx_arcade_battle_results_team ON public.arcade_battle_results (team_id);

-- 4. Enable Row Level Security
ALTER TABLE public.arcade_battle_results ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- All authenticated users can view battle results
DROP POLICY IF EXISTS "Allow authenticated read arcade_battle_results" ON public.arcade_battle_results;
CREATE POLICY "Allow authenticated read arcade_battle_results"
ON public.arcade_battle_results
FOR SELECT
TO authenticated
USING (true);

-- Only admins or SECURITY DEFINER functions can insert/modify results
DROP POLICY IF EXISTS "Admin manage arcade_battle_results" ON public.arcade_battle_results;
CREATE POLICY "Admin manage arcade_battle_results"
ON public.arcade_battle_results
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Stored Function: get_battle_leaderboard
-- Returns live, authoritative standings of all registered teams with deterministic tie-breaking
CREATE OR REPLACE FUNCTION public.get_battle_leaderboard(p_battle_id UUID)
RETURNS TABLE (
  rank BIGINT,
  team_id UUID,
  team_name TEXT,
  team_code TEXT,
  member_count BIGINT,
  quests_completed BIGINT,
  total_quests BIGINT,
  team_total_score BIGINT,
  total_attempts BIGINT,
  total_speed_bonus BIGINT,
  last_completed_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_tie_breaker TEXT;
  v_total_exercises BIGINT;
BEGIN
  -- 1. Fetch battle configuration
  SELECT COALESCE(tie_breaker_rule, 'fastest_time')
  INTO v_tie_breaker
  FROM public.arcade_battles
  WHERE id = p_battle_id;

  -- 2. Count total configured quests for this battle
  SELECT COUNT(*)
  INTO v_total_exercises
  FROM public.arcade_battle_exercises
  WHERE battle_id = p_battle_id;

  -- 3. Return ranked teams
  RETURN QUERY
  WITH registered_squads AS (
    SELECT
      r.team_id,
      r.registered_at,
      t.name::TEXT AS t_name,
      t.code::TEXT AS t_code,
      COUNT(DISTINCT m.id) AS m_count
    FROM public.arcade_battle_registrations r
    JOIN public.arcade_teams t ON t.id = r.team_id
    LEFT JOIN public.arcade_team_members m ON m.team_id = r.team_id
    WHERE r.battle_id = p_battle_id AND r.status = 'confirmed'
    GROUP BY r.team_id, r.registered_at, t.name, t.code
  ),
  squad_progress_agg AS (
    SELECT
      rs.team_id,
      rs.t_name,
      rs.t_code,
      rs.m_count,
      rs.registered_at,
      COALESCE(COUNT(p.id) FILTER (WHERE p.status = 'completed'), 0)::BIGINT AS q_completed,
      COALESCE(SUM(p.score_awarded) FILTER (WHERE p.status = 'completed'), 0)::BIGINT AS total_score,
      COALESCE(SUM(p.attempts_count), 0)::BIGINT AS attempts_sum,
      COALESCE(SUM(p.speed_bonus) FILTER (WHERE p.status = 'completed'), 0)::BIGINT AS speed_bonus_sum,
      MAX(p.completed_at) AS max_completed_at
    FROM registered_squads rs
    LEFT JOIN public.arcade_battle_team_progress p
      ON p.battle_id = p_battle_id AND p.team_id = rs.team_id
    GROUP BY rs.team_id, rs.t_name, rs.t_code, rs.m_count, rs.registered_at
  )
  SELECT
    DENSE_RANK() OVER (
      ORDER BY
        total_score DESC,
        q_completed DESC,
        CASE
          WHEN v_tie_breaker = 'least_submissions' THEN attempts_sum
          ELSE NULL
        END ASC NULLS LAST,
        CASE
          WHEN v_tie_breaker = 'highest_speed_bonus' THEN speed_bonus_sum
          ELSE NULL
        END DESC NULLS LAST,
        max_completed_at ASC NULLS LAST,
        registered_at ASC,
        team_id ASC
    ) AS rank,
    team_id,
    t_name AS team_name,
    t_code AS team_code,
    m_count AS member_count,
    q_completed AS quests_completed,
    v_total_exercises AS total_quests,
    total_score AS team_total_score,
    attempts_sum AS total_attempts,
    speed_bonus_sum AS total_speed_bonus,
    max_completed_at AS last_completed_at,
    registered_at
  FROM squad_progress_agg
  ORDER BY rank ASC, team_name ASC;
END;
$$;

-- 7. Stored Procedure: finalize_battle_rankings
-- Freezes final official rankings in arcade_battle_results when match ends
CREATE OR REPLACE FUNCTION public.finalize_battle_rankings(p_battle_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle RECORD;
  v_row RECORD;
  v_count INTEGER := 0;
BEGIN
  -- 1. Verify battle exists
  SELECT * INTO v_battle
  FROM public.arcade_battles
  WHERE id = p_battle_id;

  IF v_battle.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Battle not found.');
  END IF;

  -- 2. Snapshot leaderboard rankings into arcade_battle_results
  FOR v_row IN
    SELECT * FROM public.get_battle_leaderboard(p_battle_id)
  LOOP
    INSERT INTO public.arcade_battle_results (
      battle_id,
      team_id,
      final_rank,
      final_score,
      quests_completed,
      total_quests,
      total_attempts,
      total_speed_bonus,
      last_completed_at,
      finalized_at
    ) VALUES (
      p_battle_id,
      v_row.team_id,
      v_row.rank::INTEGER,
      v_row.team_total_score::INTEGER,
      v_row.quests_completed::INTEGER,
      v_row.total_quests::INTEGER,
      v_row.total_attempts::INTEGER,
      v_row.total_speed_bonus::INTEGER,
      v_row.last_completed_at,
      now()
    )
    ON CONFLICT (battle_id, team_id) DO UPDATE SET
      final_rank = EXCLUDED.final_rank,
      final_score = EXCLUDED.final_score,
      quests_completed = EXCLUDED.quests_completed,
      total_quests = EXCLUDED.total_quests,
      total_attempts = EXCLUDED.total_attempts,
      total_speed_bonus = EXCLUDED.total_speed_bonus,
      last_completed_at = EXCLUDED.last_completed_at,
      finalized_at = now();

    v_count := v_count + 1;
  END LOOP;

  -- 3. Update battle status to 'ended' if expired
  IF now() >= v_battle.end_time AND v_battle.status != 'ended' THEN
    UPDATE public.arcade_battles
    SET status = 'ended', updated_at = now()
    WHERE id = p_battle_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'teams_finalized', v_count);
END;
$$;

-- 8. Stored Procedure: get_student_battle_history
-- Returns completed competitive battles for a student with final rankings and scores
CREATE OR REPLACE FUNCTION public.get_student_battle_history(p_user_id UUID)
RETURNS TABLE (
  battle_id UUID,
  battle_title TEXT,
  battle_description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  team_id UUID,
  team_name TEXT,
  team_code TEXT,
  member_count BIGINT,
  final_rank BIGINT,
  final_score BIGINT,
  quests_completed BIGINT,
  total_quests BIGINT,
  total_teams BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH user_squads AS (
    SELECT m.team_id, m.joined_at
    FROM public.arcade_team_members m
    WHERE m.user_id = p_user_id
  ),
  ended_battles AS (
    SELECT
      b.id AS b_id,
      b.title::TEXT AS b_title,
      b.description::TEXT AS b_description,
      b.start_time AS b_start_time,
      b.end_time AS b_end_time,
      t.id AS t_id,
      t.name::TEXT AS t_name,
      t.code::TEXT AS t_code
    FROM public.arcade_battles b
    JOIN public.arcade_battle_registrations r ON r.battle_id = b.id AND r.status = 'confirmed'
    JOIN public.arcade_teams t ON t.id = r.team_id
    JOIN user_squads us ON us.team_id = t.id
    WHERE (now() > b.end_time OR b.status = 'ended')
      AND us.joined_at <= b.start_time
  )
  SELECT
    eb.b_id AS battle_id,
    eb.b_title AS battle_title,
    eb.b_description AS battle_description,
    eb.b_start_time AS start_time,
    eb.b_end_time AS end_time,
    eb.t_id AS team_id,
    eb.t_name AS team_name,
    eb.t_code AS team_code,
    COALESCE(lb.member_count, 1)::BIGINT AS member_count,
    COALESCE(lb.rank, 1)::BIGINT AS final_rank,
    COALESCE(lb.team_total_score, 0)::BIGINT AS final_score,
    COALESCE(lb.quests_completed, 0)::BIGINT AS quests_completed,
    COALESCE(lb.total_quests, 0)::BIGINT AS total_quests,
    COALESCE((
      SELECT COUNT(*)
      FROM public.arcade_battle_registrations r2
      WHERE r2.battle_id = eb.b_id AND r2.status = 'confirmed'
    ), 1)::BIGINT AS total_teams
  FROM ended_battles eb
  LEFT JOIN LATERAL (
    SELECT l.rank, l.team_total_score, l.quests_completed, l.total_quests, l.member_count
    FROM public.get_battle_leaderboard(eb.b_id) l
    WHERE l.team_id = eb.t_id
    LIMIT 1
  ) lb ON true
  ORDER BY eb.b_end_time DESC;
END;
$$;

-- 9. Add arcade_battle_results to realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_battle_results;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
