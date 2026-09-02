-- Migration: Create Team Arcade Phase 6 - Live Team Leaderboard Function
-- Description: Deterministic ranking of registered teams by team average score with tie-breaking and fast index support

-- 1. Optimized indexes for leaderboard aggregation
CREATE INDEX IF NOT EXISTS idx_arcade_fest_scores_leaderboard ON public.arcade_fest_scores (fest_id, team_id, points_awarded);
CREATE INDEX IF NOT EXISTS idx_arcade_team_members_team_count ON public.arcade_team_members (team_id);

-- 2. Stored Function: get_fest_leaderboard
-- Returns all registered teams for a fest ranked by average member score with deterministic tie-breaking
CREATE OR REPLACE FUNCTION public.get_fest_leaderboard(p_fest_id UUID)
RETURNS TABLE (
  rank BIGINT,
  team_id UUID,
  team_name TEXT,
  team_code TEXT,
  member_count BIGINT,
  team_total_score BIGINT,
  team_average_score NUMERIC,
  last_scored_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH team_memberships AS (
    -- Count all members belonging to each registered team in this fest
    SELECT
      r.team_id,
      r.fest_id,
      r.registered_at,
      COUNT(m.id) AS member_count
    FROM public.arcade_fest_registrations r
    JOIN public.arcade_team_members m ON m.team_id = r.team_id
    WHERE r.fest_id = p_fest_id
    GROUP BY r.team_id, r.fest_id, r.registered_at
  ),
  team_scores AS (
    -- Aggregate total score and latest score timestamp for each registered team
    SELECT
      tm.team_id,
      tm.fest_id,
      tm.registered_at,
      tm.member_count,
      COALESCE(SUM(s.points_awarded), 0) AS team_total_score,
      MAX(s.scored_at) AS last_scored_at
    FROM team_memberships tm
    LEFT JOIN public.arcade_fest_scores s
      ON s.fest_id = tm.fest_id AND s.team_id = tm.team_id
    GROUP BY tm.team_id, tm.fest_id, tm.registered_at, tm.member_count
  ),
  calculated_ranks AS (
    SELECT
      ts.team_id,
      t.name AS team_name,
      t.code AS team_code,
      ts.member_count,
      ts.team_total_score,
      ROUND((ts.team_total_score::numeric / GREATEST(ts.member_count, 1)::numeric), 1) AS team_average_score,
      ts.last_scored_at,
      ts.registered_at
    FROM team_scores ts
    JOIN public.arcade_teams t ON t.id = ts.team_id
  )
  SELECT
    DENSE_RANK() OVER (
      ORDER BY
        team_average_score DESC,
        team_total_score DESC,
        last_scored_at ASC NULLS LAST,
        registered_at ASC,
        team_id ASC
    ) AS rank,
    team_id,
    team_name,
    team_code,
    member_count,
    team_total_score,
    team_average_score,
    last_scored_at,
    registered_at
  FROM calculated_ranks
  ORDER BY rank ASC, team_name ASC;
$$;
