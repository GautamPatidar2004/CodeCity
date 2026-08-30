-- Project Showcase / Builds Table
CREATE TABLE IF NOT EXISTS public.project_showcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  preview_url TEXT,
  live_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS
ALTER TABLE public.project_showcases ENABLE ROW LEVEL SECURITY;

-- 1. Read: Published showcases readable by everyone; Unpublished readable by author & admin
CREATE POLICY "Public read published showcases" ON public.project_showcases
  FOR SELECT USING (is_published = true OR auth.uid() = user_id OR public.is_admin());

-- 2. Insert: Learners can submit only their own showcase
CREATE POLICY "Users insert own showcase" ON public.project_showcases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. Update: Authors and admins can update
CREATE POLICY "Users update own showcase" ON public.project_showcases
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 4. Delete: Authors and admins can delete/moderate
CREATE POLICY "Users and admins delete showcase" ON public.project_showcases
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Seed starter showcases
INSERT INTO public.project_showcases (id, user_id, project_id, title, description, is_published)
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Cyberpunk Dev Portfolio',
    'Custom neon-themed responsive developer portfolio built with semantic HTML and modern CSS flexbox layouts.',
    true
  )
ON CONFLICT (user_id, project_id) DO NOTHING;
