-- Migration: Create Team Arcade Phase 7 - Fest History and Final Results Function
-- Description: Deterministic retrieval of student participated fest history and final official rankings

CREATE OR REPLACE FUNCTION public.get_student_fest_history(p_user_id UUID)
RETURNS TABLE (
  fest_id UUID,
  fest_title TEXT,
  fest_description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  team_id UUID,
  team_name TEXT,
  team_code TEXT,
  member_count BIGINT,
  my_score BIGINT,
  final_team_score NUMERIC,
  final_rank BIGINT,
  total_teams BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH user_teams AS (
    -- Active team(s) the user belongs to
    SELECT m.team_id, m.user_id, m.joined_at
    FROM public.arcade_team_members m
    WHERE m.user_id = p_user_id
  ),
  ended_participations AS (
    -- Registered fests for these teams where the fest has concluded
    SELECT
      f.id AS f_id,
      f.title::TEXT AS f_title,
      f.description::TEXT AS f_description,
      f.start_time AS f_start_time,
      f.end_time AS f_end_time,
      t.id AS t_id,
      t.name::TEXT AS t_name,
      t.code::TEXT AS t_code,
      ut.user_id AS u_id
    FROM public.arcade_fests f
    JOIN public.arcade_fest_registrations r ON r.fest_id = f.id
    JOIN public.arcade_teams t ON t.id = r.team_id
    JOIN user_teams ut ON ut.team_id = t.id
    WHERE (now() > f.end_time OR f.status = 'ended')
      AND ut.joined_at <= f.start_time
  )
  SELECT
    ep.f_id AS fest_id,
    ep.f_title AS fest_title,
    ep.f_description AS fest_description,
    ep.f_start_time AS start_time,
    ep.f_end_time AS end_time,
    ep.t_id AS team_id,
    ep.t_name AS team_name,
    ep.t_code::TEXT AS team_code,
    COALESCE(lb.member_count, 1)::BIGINT AS member_count,
    COALESCE((
      SELECT SUM(s.points_awarded)
      FROM public.arcade_fest_scores s
      WHERE s.fest_id = ep.f_id AND s.user_id = ep.u_id
    ), 0)::BIGINT AS my_score,
    COALESCE(lb.team_average_score, 0.0) AS final_team_score,
    COALESCE(lb.rank, 1)::BIGINT AS final_rank,
    COALESCE((
      SELECT COUNT(*)
      FROM public.get_fest_leaderboard(ep.f_id)
    ), 1)::BIGINT AS total_teams
  FROM ended_participations ep
  LEFT JOIN LATERAL (
    SELECT l.rank, l.team_average_score, l.member_count
    FROM public.get_fest_leaderboard(ep.f_id) l
    WHERE l.team_id = ep.t_id
    LIMIT 1
  ) lb ON true
  ORDER BY ep.f_end_time DESC;
END;
$$;
