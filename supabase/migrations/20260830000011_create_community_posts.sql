-- Community Posts Table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'project_showcase')),
  project_build_id UUID REFERENCES public.project_showcases(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- 1. Read: Published posts readable by everyone; Non-published readable by author & admin
CREATE POLICY "Public read published community posts" ON public.community_posts
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.is_admin());

-- 2. Insert: Learners can create their own posts
CREATE POLICY "Users insert own community posts" ON public.community_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. Update: Authors and admins can update/moderate
CREATE POLICY "Users and admins update community posts" ON public.community_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 4. Delete: Authors and admins can delete/moderate
CREATE POLICY "Users and admins delete community posts" ON public.community_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());
