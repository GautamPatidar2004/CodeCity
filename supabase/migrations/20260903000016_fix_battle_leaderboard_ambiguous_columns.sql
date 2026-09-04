-- Migration: Fix ambiguous column references in get_battle_leaderboard
-- Description: Prefix CTE columns with table alias to eliminate PL/pgSQL variable vs table column ambiguity

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
  SELECT COALESCE(b.tie_breaker_rule, 'fastest_time')
  INTO v_tie_breaker
  FROM public.arcade_battles b
  WHERE b.id = p_battle_id;

  -- 2. Count total configured quests for this battle
  SELECT COUNT(*)
  INTO v_total_exercises
  FROM public.arcade_battle_exercises be
  WHERE be.battle_id = p_battle_id;

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
        spa.total_score DESC,
        spa.q_completed DESC,
        CASE
          WHEN v_tie_breaker = 'least_submissions' THEN spa.attempts_sum
          ELSE NULL
        END ASC NULLS LAST,
        CASE
          WHEN v_tie_breaker = 'highest_speed_bonus' THEN spa.speed_bonus_sum
          ELSE NULL
        END DESC NULLS LAST,
        spa.max_completed_at ASC NULLS LAST,
        spa.registered_at ASC,
        spa.team_id ASC
    ) AS rank,
    spa.team_id,
    spa.t_name AS team_name,
    spa.t_code AS team_code,
    spa.m_count AS member_count,
    spa.q_completed AS quests_completed,
    v_total_exercises AS total_quests,
    spa.total_score AS team_total_score,
    spa.attempts_sum AS total_attempts,
    spa.speed_bonus_sum AS total_speed_bonus,
    spa.max_completed_at AS last_completed_at,
    spa.registered_at
  FROM squad_progress_agg spa
  ORDER BY 1 ASC, spa.t_name ASC;
END;
$$;
