-- Migration 15: Create Programming Languages and CodeDex Islands Foundation

-- 1. Languages Table
CREATE TABLE IF NOT EXISTS public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add language and island metadata to learning paths
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'learning_paths' AND column_name = 'language_id'
  ) THEN
    ALTER TABLE public.learning_paths ADD COLUMN language_id UUID REFERENCES public.languages(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'learning_paths' AND column_name = 'island_name'
  ) THEN
    ALTER TABLE public.learning_paths ADD COLUMN island_name TEXT;
  END IF;
END $$;

-- 3. Add language_id to courses for direct language association
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'language_id'
  ) THEN
    ALTER TABLE public.courses ADD COLUMN language_id UUID REFERENCES public.languages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Enable RLS on languages
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read languages" ON public.languages
  FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Admin manage languages" ON public.languages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Seed Core Programming Languages
INSERT INTO public.languages (id, name, slug, icon, color, description, order_index, is_published)
VALUES
  ('1a000000-0000-0000-0000-000000000001', 'Python', 'python', '🐍', '#10b981', 'Explore the Pythonic Jungle with data structures and scripting.', 1, true),
  ('1a000000-0000-0000-0000-000000000002', 'JavaScript', 'javascript', '⚡', '#f59e0b', 'Conquer web dynamics, functions, DOM, and async programming.', 2, true),
  ('1a000000-0000-0000-0000-000000000003', 'HTML/CSS', 'html-css', '🌐', '#06b6d4', 'Architect responsive layouts, flexbox, and modern CSS styling.', 3, true),
  ('1a000000-0000-0000-0000-000000000004', 'C++', 'cpp', '⚙️', '#6366f1', 'Master memory management, pointers, and high-performance algorithms.', 4, true),
  ('1a000000-0000-0000-0000-000000000005', 'Java', 'java', '☕', '#ef4444', 'Build object-oriented software patterns and backend systems.', 5, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_published = EXCLUDED.is_published;

-- 6. Link existing paths & courses to seed languages and assign island names
UPDATE public.learning_paths
SET
  language_id = '1a000000-0000-0000-0000-000000000002',
  island_name = 'The JavaScript Archipelago'
WHERE slug = 'frontend';

UPDATE public.learning_paths
SET
  language_id = '1a000000-0000-0000-0000-000000000001',
  island_name = 'The Pythonic Jungle'
WHERE slug = 'fullstack';

UPDATE public.courses
SET language_id = '1a000000-0000-0000-0000-000000000002'
WHERE slug = 'javascript-awakening' OR track = 'JavaScript' OR track = 'React';

UPDATE public.courses
SET language_id = '1a000000-0000-0000-0000-000000000001'
WHERE slug = 'pythonic-dungeon' OR track = 'Python';
