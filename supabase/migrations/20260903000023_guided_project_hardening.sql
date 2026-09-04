-- Migration: Guided Project Final Security Hardening & Progression Integrity
-- Description: Locks down RLS, prevents client-side bypasses of stage progression, and hardens validation stored procedures.

-- 1. Enforce starting defaults on user_project_progress inserts
CREATE OR REPLACE FUNCTION public.enforce_user_project_progress_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If invoked by a non-admin authenticated user, ensure safe initialized defaults
  IF (auth.uid() IS NOT NULL OR auth.role() = 'authenticated') AND NOT public.is_admin() THEN
    NEW.current_stage_order := 1;
    NEW.status := 'in_progress';
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_user_project_progress_insert ON public.user_project_progress;
CREATE TRIGGER trg_enforce_user_project_progress_insert
BEFORE INSERT ON public.user_project_progress
FOR EACH ROW
EXECUTE FUNCTION public.enforce_user_project_progress_insert();

-- 2. Enforce progression update security on user_project_progress
CREATE OR REPLACE FUNCTION public.enforce_user_project_progress_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent clients from directly mutating current_stage_order or status
  IF (auth.uid() IS NOT NULL OR auth.role() = 'authenticated') AND NOT public.is_admin() THEN
    IF (OLD.current_stage_order IS DISTINCT FROM NEW.current_stage_order) OR (OLD.status IS DISTINCT FROM NEW.status) THEN
      RAISE EXCEPTION 'Unauthorized: Stage progression and project completion must be achieved through authoritative stage validation.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_user_project_progress_update ON public.user_project_progress;
CREATE TRIGGER trg_enforce_user_project_progress_update
BEFORE UPDATE ON public.user_project_progress
FOR EACH ROW
EXECUTE FUNCTION public.enforce_user_project_progress_update();

-- 3. Enforce stage completion security on user_stage_progress
CREATE OR REPLACE FUNCTION public.enforce_user_stage_progress_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent clients from directly marking a stage as 'completed'
  IF (auth.uid() IS NOT NULL OR auth.role() = 'authenticated') AND NOT public.is_admin() THEN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
      RAISE EXCEPTION 'Unauthorized: Stage completion must be validated through complete_project_stage.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_user_stage_progress_security ON public.user_stage_progress;
CREATE TRIGGER trg_enforce_user_stage_progress_security
BEFORE INSERT OR UPDATE ON public.user_stage_progress
FOR EACH ROW
EXECUTE FUNCTION public.enforce_user_stage_progress_security();

-- 4. Hardened Server-Authoritative Stored Procedure: complete_project_stage
CREATE OR REPLACE FUNCTION public.complete_project_stage(
  p_user_id UUID,
  p_stage_id UUID,
  p_code TEXT,
  p_passed BOOLEAN,
  p_execution_status TEXT,
  p_test_results JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_stage_order INT;
  v_proj_status TEXT;
  v_submission_id UUID;
  v_current_order INT;
  v_user_prog_status TEXT;
  v_next_stage_id UUID;
  v_next_starter TEXT;
  v_init_code TEXT;
  v_uncompleted_count INT;
BEGIN
  -- Authorization check
  IF NOT (
    auth.uid() = p_user_id 
    OR public.is_admin() 
    OR CURRENT_USER IN ('postgres', 'service_role', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: User identity does not match authenticated session.';
  END IF;

  -- 1. Validate stage exists, retrieve project & order, verify project is published (or admin)
  SELECT s.project_id, s.stage_order, gp.status INTO v_project_id, v_stage_order, v_proj_status
  FROM public.project_stages s
  JOIN public.guided_projects gp ON gp.id = s.project_id
  WHERE s.id = p_stage_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage or associated guided project not found.';
  END IF;

  IF v_proj_status <> 'published' THEN
    RAISE EXCEPTION 'Submissions are strictly prohibited for unpublished or draft projects.';
  END IF;

  -- 2. Ensure user_project_progress exists and retrieve active unlocked stage order
  INSERT INTO public.user_project_progress (
    user_id,
    project_id,
    current_stage_order,
    status
  ) VALUES (
    p_user_id,
    v_project_id,
    1,
    'in_progress'
  )
  ON CONFLICT (user_id, project_id) DO NOTHING;

  SELECT current_stage_order, status INTO v_current_order, v_user_prog_status
  FROM public.user_project_progress
  WHERE user_id = p_user_id AND project_id = v_project_id;

  -- Strict locking enforcement: reject submissions targeting locked future stages
  IF v_stage_order > v_current_order THEN
    RAISE EXCEPTION 'Stage #% is currently locked. Complete previous stages first.', v_stage_order;
  END IF;

  -- 3. Insert immutable submission record
  INSERT INTO public.user_stage_submissions (
    user_id,
    stage_id,
    code,
    passed,
    execution_status,
    test_results,
    submitted_at
  ) VALUES (
    p_user_id,
    p_stage_id,
    p_code,
    p_passed,
    p_execution_status,
    COALESCE(p_test_results, '[]'::jsonb),
    now()
  ) RETURNING id INTO v_submission_id;

  -- If submission failed, return failure without mutating progression
  IF NOT p_passed THEN
    RETURN jsonb_build_object(
      'submission_id', v_submission_id,
      'passed', false,
      'unlocked_next', false,
      'project_completed', false
    );
  END IF;

  -- 4. Submission Passed: Mark stage as completed in user_stage_progress
  INSERT INTO public.user_stage_progress (
    user_id,
    project_id,
    stage_id,
    status,
    saved_code,
    completed_at,
    updated_at
  ) VALUES (
    p_user_id,
    v_project_id,
    p_stage_id,
    'completed',
    p_code,
    now(),
    now()
  )
  ON CONFLICT (user_id, stage_id) DO UPDATE SET
    status = 'completed',
    saved_code = p_code,
    completed_at = now(),
    updated_at = now();

  -- 5. If this is the current active stage, advance progress
  IF v_current_order = v_stage_order THEN
    -- Check if next stage exists
    SELECT id, starter_code INTO v_next_stage_id, v_next_starter
    FROM public.project_stages
    WHERE project_id = v_project_id AND stage_order = v_stage_order + 1;

    IF v_next_stage_id IS NOT NULL THEN
      -- Next stage exists: advance current_stage_order
      UPDATE public.user_project_progress
      SET current_stage_order = v_stage_order + 1, updated_at = now()
      WHERE user_id = p_user_id AND project_id = v_project_id;

      -- Code carry-forward: initialize next stage with starter code OR carried-forward code
      IF NOT EXISTS (
        SELECT 1 FROM public.user_stage_progress
        WHERE user_id = p_user_id AND stage_id = v_next_stage_id
      ) THEN
        IF v_next_starter IS NOT NULL AND length(trim(v_next_starter)) > 0 THEN
          v_init_code := v_next_starter;
        ELSE
          v_init_code := p_code;
        END IF;

        INSERT INTO public.user_stage_progress (
          user_id,
          project_id,
          stage_id,
          status,
          saved_code,
          updated_at
        ) VALUES (
          p_user_id,
          v_project_id,
          v_next_stage_id,
          'unlocked',
          v_init_code,
          now()
        );
      END IF;

      RETURN jsonb_build_object(
        'submission_id', v_submission_id,
        'passed', true,
        'unlocked_next', true,
        'next_stage_order', v_stage_order + 1,
        'project_completed', false
      );
    ELSE
      -- No next stage exists: check if all stages are completed
      SELECT COUNT(*) INTO v_uncompleted_count
      FROM public.project_stages s
      LEFT JOIN public.user_stage_progress sp
        ON sp.stage_id = s.id AND sp.user_id = p_user_id AND sp.status = 'completed'
      WHERE s.project_id = v_project_id AND sp.id IS NULL;

      IF v_uncompleted_count = 0 THEN
        UPDATE public.user_project_progress
        SET status = 'completed', completed_at = now(), updated_at = now()
        WHERE user_id = p_user_id AND project_id = v_project_id;

        RETURN jsonb_build_object(
          'submission_id', v_submission_id,
          'passed', true,
          'unlocked_next', false,
          'project_completed', true
        );
      END IF;
    END IF;
  END IF;

  -- Fallback for already advanced stages
  RETURN jsonb_build_object(
    'submission_id', v_submission_id,
    'passed', true,
    'unlocked_next', false,
    'project_completed', (v_user_prog_status = 'completed')
  );
END;
$$;
