-- Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  category TEXT NOT NULL DEFAULT 'JavaScript',
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  hints JSONB DEFAULT '[]'::jsonb,
  solution_explanation TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- 1. Read: Published challenges readable by all; Unpublished only by admins
CREATE POLICY "Public read published challenges" ON public.challenges
  FOR SELECT USING (is_published = true OR public.is_admin());

-- 2. Management: Admins only
CREATE POLICY "Admin manage challenges" ON public.challenges
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed Starter Challenges
INSERT INTO public.challenges (id, title, slug, description, difficulty, category, course_id, hints, solution_explanation, is_published)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'Variable Swap Matrix',
    'variable-swap-matrix',
    'Given two variables a and b, swap their values without creating a permanent global state.',
    'Beginner',
    'JavaScript',
    'c0000000-0000-0000-0000-000000000001',
    '["Use array destructuring [a, b] = [b, a]", "Or use a temporary holding variable temp"]'::jsonb,
    'Array destructuring allows clean swapping in a single atomic statement: [a, b] = [b, a].',
    true
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'Array Filter Pipeline',
    'array-filter-pipeline',
    'Transform an array of numbers to keep only even positive numbers greater than 10.',
    'Intermediate',
    'JavaScript',
    'c0000000-0000-0000-0000-000000000001',
    '["Combine array.filter() with modulo check num % 2 === 0 and num > 10"]'::jsonb,
    'Use arr.filter(n => n > 10 && n % 2 === 0) for declarative collection filtering.',
    true
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'Python List Comprehension Quest',
    'python-list-comprehension-quest',
    'Generate squares of odd numbers from 1 to 20 using a one-line Python list comprehension.',
    'Beginner',
    'Python',
    'c0000000-0000-0000-0000-000000000002',
    '["Syntax: [expr for item in iterable if condition]"]'::jsonb,
    '[x**2 for x in range(1, 21) if x % 2 != 0]',
    true
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'Stateful Counter Hook',
    'stateful-counter-hook',
    'Construct a reusable custom hook useCounter with increment, decrement, and reset capabilities.',
    'Intermediate',
    'React',
    'c0000000-0000-0000-0000-000000000003',
    '["Use useState(initialValue)", "Return an object with count and handler functions"]'::jsonb,
    'Custom hooks encapsulate stateful logic while keeping component render functions clean.',
    true
  )
ON CONFLICT (slug) DO NOTHING;
