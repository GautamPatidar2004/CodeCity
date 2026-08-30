-- Migration 19: Create Exercise Test Cases and Submissions Tables

-- 1. Exercise Test Cases
CREATE TABLE IF NOT EXISTS public.exercise_test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  input TEXT DEFAULT '',
  expected_output TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Exercise Submissions
CREATE TABLE IF NOT EXISTS public.exercise_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  submitted_code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'passed', 'failed', 'execution_error', 'timeout', 'pending'
  passed_test_count INTEGER NOT NULL DEFAULT 0,
  total_test_count INTEGER NOT NULL DEFAULT 0,
  test_results JSONB DEFAULT '[]'::jsonb,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.exercise_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Test Cases RLS
-- Students can read active non-hidden test cases; Admins can read/manage all test cases
CREATE POLICY "Learners read active public test cases" ON public.exercise_test_cases
  FOR SELECT USING (is_active = true AND (is_hidden = false OR public.is_admin()));

CREATE POLICY "Admin manage test cases" ON public.exercise_test_cases
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Submissions RLS
-- Students can select and insert own submissions; Admins can select all
CREATE POLICY "Users read own submissions" ON public.exercise_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own submissions" ON public.exercise_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin manage submissions" ON public.exercise_submissions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Seed Starter Test Cases for Default Challenges dynamically
DO $$
DECLARE
  v_ch1 UUID;
  v_ch2 UUID;
  v_ch3 UUID;
BEGIN
  SELECT id INTO v_ch1 FROM public.challenges WHERE slug = 'variable-swap-matrix' LIMIT 1;
  SELECT id INTO v_ch2 FROM public.challenges WHERE slug = 'array-filter-pipeline' LIMIT 1;
  SELECT id INTO v_ch3 FROM public.challenges WHERE slug = 'python-list-comprehension-quest' LIMIT 1;

  IF v_ch1 IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.exercise_test_cases WHERE exercise_id = v_ch1) THEN
      INSERT INTO public.exercise_test_cases (exercise_id, input, expected_output, order_index, is_hidden, is_active)
      VALUES 
        (v_ch1, '', 'a=20, b=10', 1, false, true),
        (v_ch1, '', 'a=20, b=10', 2, true, true);
    END IF;
  END IF;

  IF v_ch2 IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.exercise_test_cases WHERE exercise_id = v_ch2) THEN
      INSERT INTO public.exercise_test_cases (exercise_id, input, expected_output, order_index, is_hidden, is_active)
      VALUES (v_ch2, '', '[ 12, 130, 44, 22 ]', 1, false, true);
    END IF;
  END IF;

  IF v_ch3 IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.exercise_test_cases WHERE exercise_id = v_ch3) THEN
      INSERT INTO public.exercise_test_cases (exercise_id, input, expected_output, order_index, is_hidden, is_active)
      VALUES (v_ch3, '', 'Odd Squares: [1, 9, 25, 49, 81, 121, 169, 225, 289, 361]', 1, false, true);
    END IF;
  END IF;
END $$;
