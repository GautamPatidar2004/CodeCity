-- Migration: Create Student Guided Project Progress and Stage Code Persistence
-- Description: Sets up normalized user_project_progress and user_stage_progress tables, constraints, indexes, triggers, and RLS.

-- 1. Create user_project_progress Table
CREATE TABLE IF NOT EXISTS public.user_project_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.guided_projects(id) ON DELETE CASCADE NOT NULL,
  current_stage_order INTEGER NOT NULL DEFAULT 1 CHECK (current_stage_order >= 1),
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_project_progress UNIQUE (user_id, project_id)
);

-- 2. Create user_stage_progress Table (Stage-level tracking & student code isolation)
CREATE TABLE IF NOT EXISTS public.user_stage_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.guided_projects(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unlocked', 'in_progress', 'completed')) DEFAULT 'in_progress',
  saved_code TEXT NOT NULL DEFAULT '',
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_stage_progress UNIQUE (user_id, stage_id)
);

-- 3. Indexes for High-Frequency Progress Queries
CREATE INDEX IF NOT EXISTS idx_user_project_progress_lookup 
  ON public.user_project_progress(user_id, project_id);

CREATE INDEX IF NOT EXISTS idx_user_stage_progress_lookup 
  ON public.user_stage_progress(user_id, stage_id);

CREATE INDEX IF NOT EXISTS idx_user_stage_progress_project 
  ON public.user_stage_progress(user_id, project_id);

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_user_project_progress_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_project_progress_updated_at ON public.user_project_progress;
CREATE TRIGGER trg_user_project_progress_updated_at
BEFORE UPDATE ON public.user_project_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_project_progress_updated_at();

DROP TRIGGER IF EXISTS trg_user_stage_progress_updated_at ON public.user_stage_progress;
CREATE TRIGGER trg_user_stage_progress_updated_at
BEFORE UPDATE ON public.user_stage_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_project_progress_updated_at();

-- 5. Enable Row-Level Security
ALTER TABLE public.user_project_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stage_progress ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for user_project_progress
DROP POLICY IF EXISTS "Users view own project progress" ON public.user_project_progress;
CREATE POLICY "Users view own project progress"
ON public.user_project_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own project progress" ON public.user_project_progress;
CREATE POLICY "Users insert own project progress"
ON public.user_project_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own project progress" ON public.user_project_progress;
CREATE POLICY "Users update own project progress"
ON public.user_project_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 7. RLS Policies for user_stage_progress
DROP POLICY IF EXISTS "Users view own stage progress" ON public.user_stage_progress;
CREATE POLICY "Users view own stage progress"
ON public.user_stage_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own stage progress" ON public.user_stage_progress;
CREATE POLICY "Users insert own stage progress"
ON public.user_stage_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own stage progress" ON public.user_stage_progress;
CREATE POLICY "Users update own stage progress"
ON public.user_stage_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());
