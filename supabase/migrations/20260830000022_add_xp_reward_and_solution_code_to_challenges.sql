-- Migration 22: Add xp_reward and solution_code to Challenges table

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'challenges' AND column_name = 'xp_reward'
  ) THEN
    ALTER TABLE public.challenges ADD COLUMN xp_reward INTEGER NOT NULL DEFAULT 75;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'challenges' AND column_name = 'solution_code'
  ) THEN
    ALTER TABLE public.challenges ADD COLUMN solution_code TEXT DEFAULT '';
  END IF;
END $$;
