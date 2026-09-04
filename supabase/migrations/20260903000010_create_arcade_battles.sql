-- Migration: Create Team Arcade Phase 8 - Battles Foundation & Admin Battle Creator
-- Description: Normalized arcade_battles schema, scoring configuration, lifecycle constraints, RLS policies, and effective status procedures

-- 1. Create arcade_battles table
CREATE TABLE IF NOT EXISTS public.arcade_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rules TEXT NOT NULL DEFAULT '',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER GENERATED ALWAYS AS (ROUND(EXTRACT(EPOCH FROM (end_time - start_time)) / 60)::INTEGER) STORED,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'live', 'ended')),

  -- Normalized scoring configuration
  base_points INTEGER NOT NULL DEFAULT 100 CHECK (base_points >= 0),
  speed_bonus_max INTEGER NOT NULL DEFAULT 50 CHECK (speed_bonus_max >= 0),
  wrong_answer_penalty INTEGER NOT NULL DEFAULT 10 CHECK (wrong_answer_penalty >= 0),
  submission_cooldown_seconds INTEGER NOT NULL DEFAULT 30 CHECK (submission_cooldown_seconds >= 0),
  tie_breaker_rule TEXT NOT NULL DEFAULT 'fastest_time' CHECK (tie_breaker_rule IN ('fastest_time', 'least_submissions', 'highest_speed_bonus', 'earliest_submission')),

  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT arcade_battles_title_length CHECK (char_length(trim(title)) >= 3 AND char_length(trim(title)) <= 120),
  CONSTRAINT arcade_battles_time_window CHECK (end_time > start_time)
);

-- 2. Create alias view for battles compatibility
CREATE OR REPLACE VIEW public.battles AS
  SELECT * FROM public.arcade_battles;

-- 3. Indexes for fast lookup, lifecycle filtering, and ordering
CREATE INDEX IF NOT EXISTS idx_arcade_battles_status ON public.arcade_battles (status);
CREATE INDEX IF NOT EXISTS idx_arcade_battles_start_time ON public.arcade_battles (start_time ASC);
CREATE INDEX IF NOT EXISTS idx_arcade_battles_end_time ON public.arcade_battles (end_time ASC);
CREATE INDEX IF NOT EXISTS idx_arcade_battles_created_by ON public.arcade_battles (created_by);

-- 4. Enable Row Level Security
ALTER TABLE public.arcade_battles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Admins can view all battles (including drafts)
DROP POLICY IF EXISTS "Admin view all arcade_battles" ON public.arcade_battles;
CREATE POLICY "Admin view all arcade_battles"
ON public.arcade_battles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Students can only view published/upcoming/live/ended battles (never drafts)
DROP POLICY IF EXISTS "Students view non_draft arcade_battles" ON public.arcade_battles;
CREATE POLICY "Students view non_draft arcade_battles"
ON public.arcade_battles
FOR SELECT
TO authenticated
USING (status != 'draft');

-- Only administrators can insert battles
DROP POLICY IF EXISTS "Admin insert arcade_battles" ON public.arcade_battles;
CREATE POLICY "Admin insert arcade_battles"
ON public.arcade_battles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only administrators can update battles
DROP POLICY IF EXISTS "Admin update arcade_battles" ON public.arcade_battles;
CREATE POLICY "Admin update arcade_battles"
ON public.arcade_battles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only administrators can delete battles
DROP POLICY IF EXISTS "Admin delete arcade_battles" ON public.arcade_battles;
CREATE POLICY "Admin delete arcade_battles"
ON public.arcade_battles
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 6. Trigger Function: Validate lifecycle and time window transitions
CREATE OR REPLACE FUNCTION public.check_arcade_battle_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Prevent modifying ended battles back to active/draft states
  IF OLD.status = 'ended' AND NEW.status != 'ended' THEN
    RAISE EXCEPTION 'Cannot reopen or modify an ended battle.';
  END IF;

  -- Prevent publishing a battle with end_time <= start_time
  IF NEW.status != 'draft' AND NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'Cannot publish a battle with end_time <= start_time.';
  END IF;

  -- Ensure updated_at is refreshed
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_arcade_battle_lifecycle ON public.arcade_battles;
CREATE TRIGGER trg_arcade_battle_lifecycle
BEFORE UPDATE ON public.arcade_battles
FOR EACH ROW
EXECUTE FUNCTION public.check_arcade_battle_lifecycle();

-- 7. Stored Procedure: get_arcade_battles()
-- Safely derives dynamic effective_status relative to current time while honoring drafts
CREATE OR REPLACE FUNCTION public.get_arcade_battles()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  rules TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  status TEXT,
  effective_status TEXT,
  base_points INTEGER,
  speed_bonus_max INTEGER,
  wrong_answer_penalty INTEGER,
  submission_cooldown_seconds INTEGER,
  tie_breaker_rule TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    b.id,
    b.title,
    b.description,
    b.rules,
    b.start_time,
    b.end_time,
    b.duration_minutes,
    b.status,
    CASE
      WHEN b.status = 'draft' THEN 'draft'
      WHEN now() < b.start_time THEN 'upcoming'
      WHEN now() >= b.start_time AND now() <= b.end_time THEN 'live'
      ELSE 'ended'
    END AS effective_status,
    b.base_points,
    b.speed_bonus_max,
    b.wrong_answer_penalty,
    b.submission_cooldown_seconds,
    b.tie_breaker_rule,
    b.created_by,
    b.created_at,
    b.updated_at
  FROM public.arcade_battles b
  ORDER BY
    CASE
      WHEN b.status = 'draft' THEN 4
      WHEN now() >= b.start_time AND now() <= b.end_time THEN 1
      WHEN now() < b.start_time THEN 2
      ELSE 3
    END,
    b.start_time ASC;
$$;

-- 8. Maintenance procedure: sync_arcade_battle_statuses()
CREATE OR REPLACE FUNCTION public.sync_arcade_battle_statuses()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Transition non-draft upcoming to live
  UPDATE public.arcade_battles
  SET status = 'live', updated_at = now()
  WHERE status = 'upcoming' AND now() >= start_time AND now() <= end_time;

  -- Transition non-draft live to ended
  UPDATE public.arcade_battles
  SET status = 'ended', updated_at = now()
  WHERE status IN ('upcoming', 'live') AND now() > end_time;
END;
$$;

-- 9. Add to realtime replication if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_battles;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
