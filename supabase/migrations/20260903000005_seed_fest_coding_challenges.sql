-- Migration: Seed Fest Coding Challenges and Map to Active Fests
-- Description: Ensures standard coding challenges exist in public.challenges and maps them to arcade_fest_challenges

-- 1. Insert standalone coding challenges (without requiring course FKs)
INSERT INTO public.challenges (id, title, slug, description, difficulty, category, language, starter_code, instructions, xp_reward, is_published)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'Variable Swap Matrix',
    'variable-swap-matrix',
    'Given two variables a and b, swap their values and print them in format "a=20, b=10".',
    'Beginner',
    'JavaScript',
    'javascript',
    'let a = 10;\nlet b = 20;\n// Swap a and b below:\n\nconsole.log(`a=${a}, b=${b}`);',
    'Swap the values of variable a and variable b so that a becomes 20 and b becomes 10.',
    100,
    true
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'Array Filter Pipeline',
    'array-filter-pipeline',
    'Filter an array of integers keeping only even numbers greater than 10.',
    'Intermediate',
    'JavaScript',
    'javascript',
    'const numbers = [5, 12, 8, 130, 44, 3, 22];\n// Filter numbers below:\nconst result = numbers.filter(n => n > 10 && n % 2 === 0);\nconsole.log(JSON.stringify(result));',
    'Use JavaScript filter to extract even numbers strictly greater than 10.',
    150,
    true
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'Python List Comprehension Quest',
    'python-list-comprehension-quest',
    'Generate squares of odd numbers from 1 to 20 using Python list comprehension.',
    'Beginner',
    'Python',
    'python',
    '# Generate squares of odd numbers 1..20\nodd_squares = [x**2 for x in range(1, 21) if x % 2 != 0]\nprint(f"Odd Squares: {odd_squares}")',
    'Use Python list comprehension with condition syntax to square odd numbers.',
    120,
    true
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  starter_code = EXCLUDED.starter_code,
  language = EXCLUDED.language,
  instructions = EXCLUDED.instructions;

-- 2. Seed starter test cases for these challenges if missing
INSERT INTO public.exercise_test_cases (exercise_id, input, expected_output, order_index, is_hidden, is_active)
SELECT 'f0000000-0000-0000-0000-000000000001', '', 'a=20, b=10', 1, false, true
WHERE NOT EXISTS (SELECT 1 FROM public.exercise_test_cases WHERE exercise_id = 'f0000000-0000-0000-0000-000000000001');

INSERT INTO public.exercise_test_cases (exercise_id, input, expected_output, order_index, is_hidden, is_active)
SELECT 'f0000000-0000-0000-0000-000000000002', '', '[12,130,44,22]', 1, false, true
WHERE NOT EXISTS (SELECT 1 FROM public.exercise_test_cases WHERE exercise_id = 'f0000000-0000-0000-0000-000000000002');

INSERT INTO public.exercise_test_cases (exercise_id, input, expected_output, order_index, is_hidden, is_active)
SELECT 'f0000000-0000-0000-0000-000000000003', '', 'Odd Squares: [1, 9, 25, 49, 81, 121, 169, 225, 289, 361]', 1, false, true
WHERE NOT EXISTS (SELECT 1 FROM public.exercise_test_cases WHERE exercise_id = 'f0000000-0000-0000-0000-000000000003');

-- 3. Map to Live and Upcoming Fests
DO $$
DECLARE
  v_live_fest UUID;
  v_upcoming_fest UUID;
BEGIN
  SELECT id INTO v_live_fest FROM public.arcade_fests WHERE title = 'AlgoRush Clash: Spring 2026' LIMIT 1;
  SELECT id INTO v_upcoming_fest FROM public.arcade_fests WHERE title = 'PixelCraft Frontend Hack Fest' LIMIT 1;

  IF v_live_fest IS NOT NULL THEN
    INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
    VALUES
      (v_live_fest, 'f0000000-0000-0000-0000-000000000001', 1, 100),
      (v_live_fest, 'f0000000-0000-0000-0000-000000000002', 2, 150)
    ON CONFLICT (fest_id, challenge_id) DO NOTHING;
  END IF;

  IF v_upcoming_fest IS NOT NULL THEN
    INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
    VALUES
      (v_upcoming_fest, 'f0000000-0000-0000-0000-000000000002', 1, 120),
      (v_upcoming_fest, 'f0000000-0000-0000-0000-000000000003', 2, 180)
    ON CONFLICT (fest_id, challenge_id) DO NOTHING;
  END IF;
END $$;
