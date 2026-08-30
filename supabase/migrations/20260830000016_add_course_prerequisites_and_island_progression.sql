-- Migration 16: Course Prerequisites and Island Progression Foundation

-- 1. Add prerequisite_course_id to courses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'prerequisite_course_id'
  ) THEN
    ALTER TABLE public.courses 
      ADD COLUMN prerequisite_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Configure prerequisite relationships for seed courses
-- React & Vite Fortress requires completion of The JavaScript Awakening
UPDATE public.courses
SET 
  prerequisite_course_id = (SELECT id FROM public.courses WHERE slug = 'javascript-awakening' LIMIT 1),
  order_index = 2
WHERE slug = 'react-vite-fortress';

UPDATE public.courses
SET 
  prerequisite_course_id = NULL,
  order_index = 1
WHERE slug = 'javascript-awakening';

UPDATE public.courses
SET 
  prerequisite_course_id = NULL,
  order_index = 1
WHERE slug = 'pythonic-dungeon';
