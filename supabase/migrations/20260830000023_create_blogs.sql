-- Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 1. Read: Published blogs readable by everyone; Non-published readable by author & admin
CREATE POLICY "Public read published blogs" ON public.blogs
  FOR SELECT USING (is_published = true OR auth.uid() = author_id OR public.is_admin());

-- 2. Insert: Only Admins can create blogs
CREATE POLICY "Admins insert blogs" ON public.blogs
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 3. Update: Admins can update blogs
CREATE POLICY "Admins update blogs" ON public.blogs
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Delete: Admins can delete blogs
CREATE POLICY "Admins delete blogs" ON public.blogs
  FOR DELETE TO authenticated USING (public.is_admin());
