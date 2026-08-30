-- Migration 18: Add Coding Exercise Configuration to Challenges

-- 1. Add exercise configuration columns to challenges table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'challenges' AND column_name = 'starter_code'
  ) THEN
    ALTER TABLE public.challenges ADD COLUMN starter_code TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'challenges' AND column_name = 'language'
  ) THEN
    ALTER TABLE public.challenges ADD COLUMN language TEXT NOT NULL DEFAULT 'javascript';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'challenges' AND column_name = 'instructions'
  ) THEN
    ALTER TABLE public.challenges ADD COLUMN instructions TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'challenges' AND column_name = 'sample_input'
  ) THEN
    ALTER TABLE public.challenges ADD COLUMN sample_input TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'challenges' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE public.challenges ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 2. Populate starter code, language, and instructions for starter exercises
UPDATE public.challenges
SET
  language = 'javascript',
  instructions = 'Given two variables a and b, swap their values without hardcoding raw numbers.',
  starter_code = '// 01. Variable Swap Matrix
let a = 10;
let b = 20;

// Write code below to swap a and b:
[a, b] = [b, a];

// Output result
console.log(`a=${a}, b=${b}`);',
  sample_input = ''
WHERE slug = 'variable-swap-matrix';

UPDATE public.challenges
SET
  language = 'javascript',
  instructions = 'Transform an array of numbers to retain only even numbers greater than 10.',
  starter_code = '// 02. Array Filter Pipeline
const numbers = [5, 12, 8, 130, 44, 3, 9, 22];

// Retain numbers that are even AND > 10:
const filtered = numbers.filter(n => n > 10 && n % 2 === 0);

console.log(filtered);',
  sample_input = ''
WHERE slug = 'array-filter-pipeline';

UPDATE public.challenges
SET
  language = 'python',
  instructions = 'Generate squares of odd numbers from 1 to 20 using a Python list comprehension.',
  starter_code = '# 03. Python List Comprehension Quest
# Generate squares of odd numbers from 1 to 20
odd_squares = [x**2 for x in range(1, 21) if x % 2 != 0]

print("Odd Squares:", odd_squares)',
  sample_input = ''
WHERE slug = 'python-list-comprehension-quest';

UPDATE public.challenges
SET
  language = 'javascript',
  instructions = 'Construct a stateful custom counter hook with count, increment, and reset functions.',
  starter_code = '// 04. Stateful Counter Hook
function useCounter(initialValue = 0) {
  let count = initialValue;
  const increment = () => { count += 1; return count; };
  const decrement = () => { count -= 1; return count; };
  const reset = () => { count = initialValue; return count; };
  return { count, increment, decrement, reset };
}',
  sample_input = ''
WHERE slug = 'stateful-counter-hook';
