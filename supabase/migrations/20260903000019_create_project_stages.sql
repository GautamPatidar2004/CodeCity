-- Migration: Create Project Stages Foundation and Ordering Procedures
-- Description: Normalized project_stages table, order constraints, reordering & deletion stored procedures, and RLS.

-- 1. Create project_stages Table
CREATE TABLE IF NOT EXISTS public.project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.guided_projects(id) ON DELETE CASCADE NOT NULL,
  stage_order INTEGER NOT NULL CHECK (stage_order >= 1),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  instructions TEXT NOT NULL DEFAULT '',
  starter_code TEXT NOT NULL DEFAULT '',
  validation_type TEXT NOT NULL CHECK (validation_type IN ('io_test', 'dom_check')) DEFAULT 'io_test',
  validation_config JSONB NOT NULL DEFAULT '{"test_cases": []}'::jsonb,
  xp_reward INTEGER NOT NULL DEFAULT 20 CHECK (xp_reward >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_project_stage_order UNIQUE (project_id, stage_order) DEFERRABLE INITIALLY DEFERRED
);

-- 2. Indexes for Fast Stage Lookup and Order Resolution
CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON public.project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stages_order ON public.project_stages(project_id, stage_order);

-- 3. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_project_stages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_project_stages_updated_at ON public.project_stages;
CREATE TRIGGER trg_project_stages_updated_at
BEFORE UPDATE ON public.project_stages
FOR EACH ROW
EXECUTE FUNCTION public.handle_project_stages_updated_at();

-- 4. Stored Procedure: Transactional Stage Reordering
CREATE OR REPLACE FUNCTION public.reorder_project_stages(
  p_project_id UUID,
  p_stage_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  IF NOT (public.is_admin() OR CURRENT_USER IN ('postgres', 'service_role', 'supabase_admin')) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can reorder stages.';
  END IF;

  -- Validate that array is not empty
  IF p_stage_ids IS NULL OR array_length(p_stage_ids, 1) = 0 THEN
    RETURN jsonb_build_object('success', true, 'reordered_count', 0);
  END IF;

  -- Verify all stage IDs belong to this project
  SELECT COUNT(*) INTO v_count
  FROM public.project_stages
  WHERE project_id = p_project_id AND id = ANY(p_stage_ids);

  IF v_count <> array_length(p_stage_ids, 1) THEN
    RAISE EXCEPTION 'Invalid stage IDs: all stages must belong to the specified project.';
  END IF;

  -- Phase 1: Temporary offset to ensure zero collision while satisfying stage_order >= 1
  FOR i IN 1..array_length(p_stage_ids, 1) LOOP
    UPDATE public.project_stages
    SET stage_order = 1000000 + i
    WHERE id = p_stage_ids[i] AND project_id = p_project_id;
  END LOOP;

  -- Phase 2: Final contiguous 1-based order
  FOR i IN 1..array_length(p_stage_ids, 1) LOOP
    UPDATE public.project_stages
    SET stage_order = i, updated_at = now()
    WHERE id = p_stage_ids[i] AND project_id = p_project_id;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'reordered_count', array_length(p_stage_ids, 1));
END;
$$;

-- 5. Stored Procedure: Safe Stage Deletion with Contiguous Order Compaction
CREATE OR REPLACE FUNCTION public.delete_project_stage(
  p_stage_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_project_id UUID;
  v_deleted_order INT;
BEGIN
  IF NOT (public.is_admin() OR CURRENT_USER IN ('postgres', 'service_role', 'supabase_admin')) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can delete stages.';
  END IF;

  SELECT project_id, stage_order INTO v_project_id, v_deleted_order
  FROM public.project_stages
  WHERE id = p_stage_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage not found.';
  END IF;

  -- Delete the stage
  DELETE FROM public.project_stages WHERE id = p_stage_id;

  -- Compact remaining stage orders to maintain 1..N contiguous sequence
  UPDATE public.project_stages
  SET stage_order = stage_order - 1, updated_at = now()
  WHERE project_id = v_project_id AND stage_order > v_deleted_order;

  RETURN jsonb_build_object('success', true, 'deleted_id', p_stage_id, 'project_id', v_project_id);
END;
$$;

-- 6. Enable Row-Level Security
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Admins have full access to manage all project stages
DROP POLICY IF EXISTS "Admins manage project_stages" ON public.project_stages;
CREATE POLICY "Admins manage project_stages"
ON public.project_stages
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Students and public can only read stages belonging to published projects
DROP POLICY IF EXISTS "Read published project stages" ON public.project_stages;
CREATE POLICY "Read published project stages"
ON public.project_stages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.guided_projects gp
    WHERE gp.id = project_stages.project_id
    AND (gp.status = 'published' OR public.is_admin())
  )
);
