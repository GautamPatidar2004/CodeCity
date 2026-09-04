-- Migration: Create Guided Projects Foundation
-- Description: Sets up normalized guided_projects table with difficulty, status, badge association, and RLS.

-- 1. Create guided_projects Table
CREATE TABLE IF NOT EXISTS public.guided_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_minutes INTEGER NOT NULL DEFAULT 30 CHECK (estimated_minutes > 0),
  badge_id UUID REFERENCES public.badges(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_guided_projects_status ON public.guided_projects(status);
CREATE INDEX IF NOT EXISTS idx_guided_projects_created_by ON public.guided_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_guided_projects_badge_id ON public.guided_projects(badge_id);

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_guided_projects_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guided_projects_updated_at ON public.guided_projects;
CREATE TRIGGER trg_guided_projects_updated_at
BEFORE UPDATE ON public.guided_projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_guided_projects_updated_at();

-- 4. Enable Row-Level Security
ALTER TABLE public.guided_projects ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Admins have full access to manage all guided projects
DROP POLICY IF EXISTS "Admins manage guided_projects" ON public.guided_projects;
CREATE POLICY "Admins manage guided_projects"
ON public.guided_projects
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Students and public can only read published guided projects
DROP POLICY IF EXISTS "Read published or admin guided_projects" ON public.guided_projects;
CREATE POLICY "Read published or admin guided_projects"
ON public.guided_projects
FOR SELECT
USING (
  status = 'published' 
  OR public.is_admin()
);
