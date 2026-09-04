-- Migration: Guided Project Analytics & Reward Processing
-- Description: Stored procedures for authoritative project rewards and admin analytics aggregation.

-- 1. Stored Procedure: Authoritative Project Completion Rewards
CREATE OR REPLACE FUNCTION public.award_project_completion_rewards(
  p_user_id UUID,
  p_project_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prog_status TEXT;
  v_badge_id UUID;
  v_total_xp INT;
  v_badge_record RECORD;
  v_badge_unlocked BOOLEAN := false;
  v_xp_result JSONB;
BEGIN
  -- Authorization check
  IF NOT (
    auth.uid() = p_user_id 
    OR public.is_admin() 
    OR CURRENT_USER IN ('postgres', 'service_role', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: User does not match authenticated identity.';
  END IF;

  -- 1. Authoritative verification that project is completed
  SELECT status INTO v_prog_status
  FROM public.user_project_progress
  WHERE user_id = p_user_id AND project_id = p_project_id;

  IF v_prog_status IS NULL OR v_prog_status <> 'completed' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Project completion rewards require authoritative completion status.'
    );
  END IF;

  -- 2. Calculate configured project XP (sum of stage XP rewards, minimum 50)
  SELECT COALESCE(SUM(xp_reward), 50) INTO v_total_xp
  FROM public.project_stages
  WHERE project_id = p_project_id;

  IF v_total_xp <= 0 THEN
    v_total_xp := 50;
  END IF;

  -- 3. Award XP idempotently via award_xp RPC if it exists, or directly via xp_transactions
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'award_xp') THEN
    SELECT public.award_xp(
      p_user_id,
      v_total_xp,
      'guided_project_completed',
      p_project_id::text
    ) INTO v_xp_result;
  ELSE
    -- Direct idempotent fallback
    IF NOT EXISTS (
      SELECT 1 FROM public.xp_transactions 
      WHERE user_id = p_user_id 
        AND source_type = 'guided_project_completed' 
        AND source_id = p_project_id::text
    ) THEN
      INSERT INTO public.xp_transactions (user_id, amount, source_type, source_id)
      VALUES (p_user_id, v_total_xp, 'guided_project_completed', p_project_id::text);

      UPDATE public.profiles
      SET xp = COALESCE(xp, 0) + v_total_xp, updated_at = now()
      WHERE id = p_user_id;

      v_xp_result := jsonb_build_object('awarded', true, 'xp', v_total_xp);
    ELSE
      v_xp_result := jsonb_build_object('awarded', false);
    END IF;
  END IF;

  -- 4. Check for configured badge
  SELECT badge_id INTO v_badge_id
  FROM public.guided_projects
  WHERE id = p_project_id;

  IF v_badge_id IS NOT NULL THEN
    SELECT id, title, icon, description INTO v_badge_record
    FROM public.badges
    WHERE id = v_badge_id;

    IF v_badge_record.id IS NOT NULL THEN
      -- Idempotent unlock in user_badges
      IF NOT EXISTS (
        SELECT 1 FROM public.user_badges
        WHERE user_id = p_user_id AND badge_id = v_badge_id
      ) THEN
        INSERT INTO public.user_badges (user_id, badge_id, unlocked_at)
        VALUES (p_user_id, v_badge_id, now())
        ON CONFLICT (user_id, badge_id) DO NOTHING;

        v_badge_unlocked := true;
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', v_total_xp,
    'xp_result', v_xp_result,
    'badge_awarded', CASE 
      WHEN v_badge_record.id IS NOT NULL THEN jsonb_build_object(
        'id', v_badge_record.id,
        'title', v_badge_record.title,
        'icon', v_badge_record.icon,
        'description', v_badge_record.description,
        'unlocked', v_badge_unlocked
      )
      ELSE NULL
    END
  );
END;
$$;

-- 2. Stored Procedure: Admin Analytics Aggregation
CREATE OR REPLACE FUNCTION public.get_guided_projects_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_projects INT := 0;
  v_published_projects INT := 0;
  v_draft_projects INT := 0;
  v_total_starts INT := 0;
  v_total_completions INT := 0;
  v_global_rate NUMERIC := 0.0;
  v_projects_data JSONB := '[]'::jsonb;
BEGIN
  -- Authorization check: Admin only
  IF NOT (
    public.is_admin() 
    OR CURRENT_USER IN ('postgres', 'service_role', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Administrator privileges required for analytics.';
  END IF;

  -- 1. Overall System Metrics
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'published'),
    COUNT(*) FILTER (WHERE status = 'draft')
  INTO v_total_projects, v_published_projects, v_draft_projects
  FROM public.guided_projects;

  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_starts, v_total_completions
  FROM public.user_project_progress;

  IF v_total_starts > 0 THEN
    v_global_rate := ROUND((v_total_completions::numeric / v_total_starts::numeric) * 100, 1);
  END IF;

  -- 2. Per-Project Detailed Analytics & Stage Funnels
  WITH stage_stats AS (
    SELECT 
      s.id AS stage_id,
      s.project_id,
      s.stage_order,
      s.title,
      s.xp_reward,
      -- Reached count (users whose progress is at or beyond this stage)
      COUNT(DISTINCT p.user_id) FILTER (WHERE p.current_stage_order >= s.stage_order) AS reached_count,
      -- Completed count
      COUNT(DISTINCT sp.user_id) FILTER (WHERE sp.status = 'completed') AS completed_count,
      -- Total submissions
      COUNT(sub.id) AS submissions_count,
      -- Pass rate
      ROUND((COUNT(sub.id) FILTER (WHERE sub.passed = true)::numeric / NULLIF(COUNT(sub.id), 0)) * 100, 1) AS pass_rate
    FROM public.project_stages s
    LEFT JOIN public.user_project_progress p ON p.project_id = s.project_id
    LEFT JOIN public.user_stage_progress sp ON sp.stage_id = s.id AND sp.project_id = s.project_id
    LEFT JOIN public.user_stage_submissions sub ON sub.stage_id = s.id
    GROUP BY s.id, s.project_id, s.stage_order, s.title, s.xp_reward
  ),
  funnel_agg AS (
    SELECT 
      project_id,
      jsonb_agg(
        jsonb_build_object(
          'stage_id', stage_id,
          'stage_order', stage_order,
          'title', title,
          'xp_reward', xp_reward,
          'reached_count', reached_count,
          'completed_count', completed_count,
          'submissions_count', submissions_count,
          'pass_rate', COALESCE(pass_rate, 0.0)
        ) ORDER BY stage_order ASC
      ) AS stage_funnel
    FROM stage_stats
    GROUP BY project_id
  ),
  proj_metrics AS (
    SELECT 
      gp.id,
      gp.title,
      gp.difficulty,
      gp.status,
      gp.estimated_minutes,
      gp.created_at,
      COUNT(upp.id) AS starts_count,
      COUNT(upp.id) FILTER (WHERE upp.status = 'completed') AS completions_count,
      ROUND((COUNT(upp.id) FILTER (WHERE upp.status = 'completed')::numeric / NULLIF(COUNT(upp.id), 0)) * 100, 1) AS completion_rate,
      ROUND(AVG(upp.current_stage_order)::numeric, 1) AS avg_stage_reached,
      COALESCE(fa.stage_funnel, '[]'::jsonb) AS stage_funnel
    FROM public.guided_projects gp
    LEFT JOIN public.user_project_progress upp ON upp.project_id = gp.id
    LEFT JOIN funnel_agg fa ON fa.project_id = gp.id
    GROUP BY gp.id, gp.title, gp.difficulty, gp.status, gp.estimated_minutes, gp.created_at, fa.stage_funnel
    ORDER BY gp.created_at DESC
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'title', title,
      'difficulty', difficulty,
      'status', status,
      'estimated_minutes', estimated_minutes,
      'starts_count', starts_count,
      'completions_count', completions_count,
      'completion_rate', COALESCE(completion_rate, 0.0),
      'avg_stage_reached', COALESCE(avg_stage_reached, 1.0),
      'stage_funnel', stage_funnel
    )
  ) INTO v_projects_data
  FROM proj_metrics;

  RETURN jsonb_build_object(
    'summary', jsonb_build_object(
      'total_projects', v_total_projects,
      'published_projects', v_published_projects,
      'draft_projects', v_draft_projects,
      'total_starts', v_total_starts,
      'total_completions', v_total_completions,
      'completion_rate', v_global_rate
    ),
    'projects', COALESCE(v_projects_data, '[]'::jsonb)
  );
END;
$$;
