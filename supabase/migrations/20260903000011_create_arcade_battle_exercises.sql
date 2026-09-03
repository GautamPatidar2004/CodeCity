-- Migration: Create Team Arcade Phase 9 - Battle Question / Quest Selection
-- Description: Table for battle-exercise associations, deterministic ordering, RLS, live battle mutation protection, and publish safety verification

-- 1. Create arcade_battle_exercises table
CREATE TABLE IF NOT EXISTS public.arcade_battle_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.arcade_battles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  order_position INTEGER NOT NULL DEFAULT 1 CHECK (order_position >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_battle_exercises_unique UNIQUE (battle_id, exercise_id)
);

-- 2. Create alias view for compatibility
CREATE OR REPLACE VIEW public.battle_exercises AS
  SELECT * FROM public.arcade_battle_exercises;

-- 3. Indexes for deterministic fast ordering and lookups
CREATE INDEX IF NOT EXISTS idx_arcade_battle_exercises_battle ON public.arcade_battle_exercises (battle_id, order_position ASC);
CREATE INDEX IF NOT EXISTS idx_arcade_battle_exercises_exercise ON public.arcade_battle_exercises (exercise_id);

-- 4. Enable Row Level Security
ALTER TABLE public.arcade_battle_exercises ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Admins can view all battle questions
DROP POLICY IF EXISTS "Admin view all arcade_battle_exercises" ON public.arcade_battle_exercises;
CREATE POLICY "Admin view all arcade_battle_exercises"
ON public.arcade_battle_exercises
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Students can view exercises for published, live, or ended battles (never drafts)
DROP POLICY IF EXISTS "Students view published arcade_battle_exercises" ON public.arcade_battle_exercises;
CREATE POLICY "Students view published arcade_battle_exercises"
ON public.arcade_battle_exercises
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.arcade_battles b
    WHERE b.id = arcade_battle_exercises.battle_id
      AND b.status != 'draft'
  )
);

-- Only administrators can insert, update, or delete battle exercises
DROP POLICY IF EXISTS "Admin insert arcade_battle_exercises" ON public.arcade_battle_exercises;
CREATE POLICY "Admin insert arcade_battle_exercises"
ON public.arcade_battle_exercises
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update arcade_battle_exercises" ON public.arcade_battle_exercises;
CREATE POLICY "Admin update arcade_battle_exercises"
ON public.arcade_battle_exercises
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin delete arcade_battle_exercises" ON public.arcade_battle_exercises;
CREATE POLICY "Admin delete arcade_battle_exercises"
ON public.arcade_battle_exercises
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 6. Trigger Function: Lock live and ended battles from question-set mutations
CREATE OR REPLACE FUNCTION public.check_battle_exercises_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_battle_status TEXT;
  v_battle_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_battle_id := OLD.battle_id;
  ELSE
    v_battle_id := NEW.battle_id;
  END IF;

  SELECT status INTO v_battle_status
  FROM public.arcade_battles
  WHERE id = v_battle_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referenced battle does not exist.';
  END IF;

  -- Disallow question set mutations on live or concluded battles
  IF v_battle_status IN ('live', 'ended') THEN
    RAISE EXCEPTION 'Cannot modify question set of a live or ended battle.';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_battle_exercises_mutation ON public.arcade_battle_exercises;
CREATE TRIGGER trg_battle_exercises_mutation
BEFORE INSERT OR UPDATE OR DELETE ON public.arcade_battle_exercises
FOR EACH ROW
EXECUTE FUNCTION public.check_battle_exercises_mutation();

-- 7. Trigger Function: Publish Safety Verification on arcade_battles
-- Ensures at least one valid coding exercise is assigned before transitioning away from draft
CREATE OR REPLACE FUNCTION public.check_arcade_battle_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_exercise_count INT;
BEGIN
  -- Prevent modifying ended battles back to active/draft states
  IF OLD.status = 'ended' AND NEW.status != 'ended' THEN
    RAISE EXCEPTION 'Cannot reopen or modify an ended battle.';
  END IF;

  -- Prevent publishing a battle with end_time <= start_time
  IF NEW.status != 'draft' AND NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'Cannot publish a battle with end_time <= start_time.';
  END IF;

  -- Enforce publish safety: verify at least 1 exercise is assigned when publishing
  IF OLD.status = 'draft' AND NEW.status IN ('upcoming', 'live') THEN
    SELECT COUNT(*) INTO v_exercise_count
    FROM public.arcade_battle_exercises be
    JOIN public.challenges c ON c.id = be.exercise_id
    WHERE be.battle_id = NEW.id;

    IF v_exercise_count < 1 THEN
      RAISE EXCEPTION 'Cannot publish battle: At least one valid exercise must be assigned.';
    END IF;
  END IF;

  -- Ensure updated_at is refreshed
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 8. Stored Procedure: get_battle_exercises()
-- Returns ordered questions joined with challenge metadata
CREATE OR REPLACE FUNCTION public.get_battle_exercises(p_battle_id UUID)
RETURNS TABLE (
  id UUID,
  battle_id UUID,
  exercise_id UUID,
  order_position INTEGER,
  created_at TIMESTAMPTZ,
  challenge_title TEXT,
  challenge_slug TEXT,
  challenge_difficulty TEXT,
  challenge_category TEXT,
  challenge_language TEXT,
  challenge_xp_reward INTEGER,
  challenge_description TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    be.id,
    be.battle_id,
    be.exercise_id,
    be.order_position,
    be.created_at,
    c.title AS challenge_title,
    c.slug AS challenge_slug,
    c.difficulty AS challenge_difficulty,
    c.category AS challenge_category,
    c.language AS challenge_language,
    c.xp_reward AS challenge_xp_reward,
    c.description AS challenge_description
  FROM public.arcade_battle_exercises be
  JOIN public.challenges c ON c.id = be.exercise_id
  WHERE be.battle_id = p_battle_id
  ORDER BY be.order_position ASC, be.created_at ASC;
$$;

-- 9. Add to realtime replication if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_battle_exercises;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
