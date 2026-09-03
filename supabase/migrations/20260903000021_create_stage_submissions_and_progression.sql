-- Migration: Create user_stage_submissions table and atomic complete_project_stage RPC
-- Description: Immutable stage submission history and server-authoritative stage unlocking & project completion.

-- 1. Create user_stage_submissions Table
CREATE TABLE IF NOT EXISTS public.user_stage_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  execution_status TEXT NOT NULL DEFAULT 'failed',
  test_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for Performance & Auditing
CREATE INDEX IF NOT EXISTS idx_user_stage_submissions_lookup
  ON public.user_stage_submissions(user_id, stage_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_stage_submissions_stage
  ON public.user_stage_submissions(stage_id);

-- 3. Row-Level Security
ALTER TABLE public.user_stage_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own submissions" ON public.user_stage_submissions;
CREATE POLICY "Users view own submissions"
ON public.user_stage_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own submissions" ON public.user_stage_submissions;
CREATE POLICY "Users insert own submissions"
ON public.user_stage_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Server-Authoritative Progression Stored Procedure
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
  v_submission_id UUID;
  v_current_order INT;
  v_proj_status TEXT;
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
    RAISE EXCEPTION 'Unauthorized: Invalid user identity.';
  END IF;

  -- 1. Validate stage exists and retrieve its project & order
  SELECT project_id, stage_order INTO v_project_id, v_stage_order
  FROM public.project_stages
  WHERE id = p_stage_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage not found.';
  END IF;

  -- 2. Insert immutable submission record
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

  -- 3. Submission Passed: Mark current stage as completed
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

  -- 4. Ensure user_project_progress exists
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

  -- Retrieve active progression order
  SELECT current_stage_order, status INTO v_current_order, v_proj_status
  FROM public.user_project_progress
  WHERE user_id = p_user_id AND project_id = v_project_id;

  -- 5. If this is the current active stage, advance progress
  IF v_current_order = v_stage_order THEN
    -- Check if next stage exists
    SELECT id, starter_code INTO v_next_stage_id, v_next_starter
    FROM public.project_stages
    WHERE project_id = v_project_id AND stage_order = v_stage_order + 1;

    IF v_next_stage_id IS NOT NULL THEN
      -- A next stage exists: advance current_stage_order
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
      ELSE
        RETURN jsonb_build_object(
          'submission_id', v_submission_id,
          'passed', true,
          'unlocked_next', false,
          'project_completed', false
        );
      END IF;
    END IF;
  ELSE
    -- Current progress is already ahead (e.g. re-running an already passed stage)
    RETURN jsonb_build_object(
      'submission_id', v_submission_id,
      'passed', true,
      'unlocked_next', false,
      'project_completed', (v_proj_status = 'completed')
    );
  END IF;
END;
$$;
