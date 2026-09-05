-- Migration 26: Community Interactions Expansion (Blog likes, Blog comments, and Multi-target Content Reports)

-- 1. Extend content_reports to support blogs and project showcases
ALTER TABLE public.content_reports
  ADD COLUMN IF NOT EXISTS blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.project_showcases(id) ON DELETE CASCADE;

-- 2. Blog Likes Table
CREATE TABLE IF NOT EXISTS public.blog_likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, blog_id)
);

-- 3. Blog Comments Table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Blog Likes RLS
CREATE POLICY "Public read blog likes" ON public.blog_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blogs
      WHERE id = blog_likes.blog_id
        AND (is_published = true OR auth.uid() = blogs.author_id OR public.is_admin())
    )
  );

CREATE POLICY "Users toggle own blog likes" ON public.blog_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own blog likes" ON public.blog_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Blog Comments RLS
CREATE POLICY "Public read blog comments" ON public.blog_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.blogs
      WHERE id = blog_comments.blog_id
        AND (is_published = true OR auth.uid() = blogs.author_id OR public.is_admin())
    )
  );

CREATE POLICY "Users insert own blog comments" ON public.blog_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and admins update blog comments" ON public.blog_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users and admins delete blog comments" ON public.blog_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());
