-- Migration 17: Seed Lesson Educational Content and Link Challenges

-- 1. Populate real lesson content for JavaScript Awakening lessons
UPDATE public.lessons
SET content = 'In JavaScript, variables are containers for storing data values. We use `let` and `const` to declare variables.

### Key Concepts:
- `const`: Used for values that should not be reassigned.
- `let`: Used for variables whose values will change over time.
- `var`: The legacy variable declaration keyword (avoid in modern JS).

### Example:
```javascript
const playerName = "Adventurer";
let playerLevel = 1;
let currentXp = 0;

console.log("Welcome " + playerName + "! Starting Level: " + playerLevel);
```

### Best Practice:
Always default to using `const` unless you explicitly know the variable needs to be reassigned later.'
WHERE slug = 'setting-up-variables';

UPDATE public.lessons
SET content = 'Strings represent text, and math operators allow computational arithmetic in JavaScript.

### Arithmetic Operators:
- `+` Addition & String Concatenation
- `-` Subtraction
- `*` Multiplication
- `/` Division
- `%` Modulo (Remainder)

### Template Literals:
Template literals use backticks (`` ` ``) and `${expression}` interpolation.

### Example:
```javascript
const baseDamage = 25;
const critMultiplier = 1.5;
const totalDamage = baseDamage * critMultiplier;

console.log(`Dealt ${totalDamage} critical damage to enemy!`);
```'
WHERE slug = 'strings-and-math';

UPDATE public.lessons
SET content = 'Control flow directs how your code branches depending on conditional boolean evaluations.

### Comparison Operators:
- `===` Strict equality (checks value and type)
- `!==` Strict inequality
- `>`, `<`, `>=`, `<=` Relative comparisons

### Example:
```javascript
const playerHealth = 45;

if (playerHealth > 50) {
  console.log("Player is in fighting condition!");
} else if (playerHealth > 0) {
  console.log("Player is low on health, drink a potion!");
} else {
  console.log("Player has fallen in battle.");
}
```'
WHERE slug = 'decision-gates';

UPDATE public.lessons
SET content = 'Loops repeat a code block while a condition remains true or over an iterable collection.

### Common Loop Types:
- `for (let i = 0; i < n; i++)`: Standard indexed iteration.
- `for (const item of array)`: Iterates over array elements.
- `while (condition)`: Repeats while condition holds true.

### Example:
```javascript
const inventory = ["Health Potion", "Iron Sword", "Magic Scroll"];

for (let i = 0; i < inventory.length; i++) {
  console.log(`Slot ${i + 1}: ${inventory[i]}`);
}
```'
WHERE slug = 'loops-and-iteration';

-- 2. Link challenges to lessons
UPDATE public.challenges
SET lesson_id = (SELECT id FROM public.lessons WHERE slug = 'setting-up-variables' LIMIT 1)
WHERE slug = 'variable-swap-matrix';

UPDATE public.challenges
SET lesson_id = (SELECT id FROM public.lessons WHERE slug = 'strings-and-math' LIMIT 1)
WHERE slug = 'array-filter-pipeline';

-- 3. Seed chapters and lessons for Python and React courses dynamically if needed
DO $$
DECLARE
  v_python_course_id UUID;
  v_react_course_id UUID;
  v_python_chapter_id UUID;
  v_react_chapter_id UUID;
  v_python_lesson_id UUID;
  v_react_lesson_id UUID;
BEGIN
  -- Python Course
  SELECT id INTO v_python_course_id FROM public.courses WHERE slug = 'pythonic-dungeon' LIMIT 1;
  IF v_python_course_id IS NOT NULL THEN
    SELECT id INTO v_python_chapter_id FROM public.chapters WHERE course_id = v_python_course_id LIMIT 1;
    IF v_python_chapter_id IS NULL THEN
      INSERT INTO public.chapters (course_id, title, order_index)
      VALUES (v_python_course_id, 'Chapter 1: Python Basics & Collections', 1)
      RETURNING id INTO v_python_chapter_id;
    END IF;

    IF v_python_chapter_id IS NOT NULL THEN
      SELECT id INTO v_python_lesson_id FROM public.lessons WHERE slug = 'python-lists-and-dicts' LIMIT 1;
      IF v_python_lesson_id IS NULL THEN
        INSERT INTO public.lessons (chapter_id, title, slug, summary, content, order_index)
        VALUES (
          v_python_chapter_id,
          '01. Python Lists and Dictionaries',
          'python-lists-and-dicts',
          'Construct dynamic collections and key-value maps in Python.',
          'Python lists and dictionaries form the cornerstone of data manipulation in the Python ecosystem.',
          1
        )
        RETURNING id INTO v_python_lesson_id;
      END IF;

      IF v_python_lesson_id IS NOT NULL THEN
        UPDATE public.challenges
        SET lesson_id = v_python_lesson_id
        WHERE slug = 'python-list-comprehension-quest';
      END IF;
    END IF;
  END IF;

  -- React Course
  SELECT id INTO v_react_course_id FROM public.courses WHERE slug = 'react-vite-fortress' LIMIT 1;
  IF v_react_course_id IS NOT NULL THEN
    SELECT id INTO v_react_chapter_id FROM public.chapters WHERE course_id = v_react_course_id LIMIT 1;
    IF v_react_chapter_id IS NULL THEN
      INSERT INTO public.chapters (course_id, title, order_index)
      VALUES (v_react_course_id, 'Chapter 1: React Component State', 1)
      RETURNING id INTO v_react_chapter_id;
    END IF;

    IF v_react_chapter_id IS NOT NULL THEN
      SELECT id INTO v_react_lesson_id FROM public.lessons WHERE slug = 'react-hooks-and-state' LIMIT 1;
      IF v_react_lesson_id IS NULL THEN
        INSERT INTO public.lessons (chapter_id, title, slug, summary, content, order_index)
        VALUES (
          v_react_chapter_id,
          '01. React Hooks and Component State',
          'react-hooks-and-state',
          'Assemble interactive stateful components with useState.',
          'React components manage local interactive state using the useState hook.',
          1
        )
        RETURNING id INTO v_react_lesson_id;
      END IF;

      IF v_react_lesson_id IS NOT NULL THEN
        UPDATE public.challenges
        SET lesson_id = v_react_lesson_id
        WHERE slug = 'stateful-counter-hook';
      END IF;
    END IF;
  END IF;
END $$;
