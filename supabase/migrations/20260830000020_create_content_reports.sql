-- Content Reports Migration
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- 1. Users can create reports
CREATE POLICY "Users create reports" ON public.content_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- 2. Users read own reports
CREATE POLICY "Users read own reports" ON public.content_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.is_admin());

-- 3. Admins manage and resolve reports
CREATE POLICY "Admins manage reports" ON public.content_reports
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
