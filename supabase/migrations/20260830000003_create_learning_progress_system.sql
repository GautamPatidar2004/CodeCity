-- Learning Paths
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  track TEXT NOT NULL DEFAULT 'JavaScript',
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chapters / Modules
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learner Enrollments & Last Accessed Course tracking
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  last_lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Lesson Progress tracking
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security (RLS) on all learning tables
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- 1. Learning Content RLS: Anyone can read published content; Admins can manage all
CREATE POLICY "Public read learning paths" ON public.learning_paths
  FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Admin manage learning paths" ON public.learning_paths
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read courses" ON public.courses
  FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Admin manage courses" ON public.courses
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read chapters" ON public.chapters
  FOR SELECT USING (true);

CREATE POLICY "Admin manage chapters" ON public.chapters
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public read lessons" ON public.lessons
  FOR SELECT USING (true);

CREATE POLICY "Admin manage lessons" ON public.lessons
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Enrollments RLS: Users can select/insert/update own enrollments; Admins can view all
CREATE POLICY "Users read own enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users manage own enrollments" ON public.enrollments
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Lesson Progress RLS: Users can select/insert/update own progress; Admins can view all
CREATE POLICY "Users read own lesson progress" ON public.lesson_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users manage own lesson progress" ON public.lesson_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed Starter Content for Courses and Lessons
INSERT INTO public.learning_paths (id, title, slug, description, icon, order_index)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Frontend Developer', 'frontend', 'Learn HTML, CSS, JavaScript, and React from scratch.', '🚀', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Full Stack Pioneer', 'fullstack', 'Master Python, Backend REST APIs, and Supabase.', '⚡', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.courses (id, path_id, title, slug, description, track, difficulty, order_index)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'The JavaScript Awakening', 'javascript-awakening', 'Master variables, console output, logic operators, and control flow in modern JS.', 'JavaScript', 'Beginner', 1),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Pythonic Dungeon Crawl', 'pythonic-dungeon', 'Construct lists, dictionaries, tuples, and automated scripting pipelines.', 'Python', 'Intermediate', 2),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'React & Vite Fortress', 'react-vite-fortress', 'Assemble stateful components, hooks, props, and modern build tooling.', 'React', 'Intermediate', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.chapters (id, course_id, title, order_index)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Chapter 1: The Basics', 1),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Chapter 2: Control Flow', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, chapter_id, title, slug, summary, order_index)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '01. Setting Up Variables', 'setting-up-variables', 'Learn const, let, and primitive types in JS.', 1),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', '02. Strings & Math Operators', 'strings-and-math', 'Perform operations and string formatting.', 2),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', '03. If/Else Decision Gates', 'decision-gates', 'Branch your code with conditional statements.', 3),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', '04. Loops & Iteration', 'loops-and-iteration', 'Iterate collections with while and for loops.', 4)
ON CONFLICT (id) DO NOTHING;
