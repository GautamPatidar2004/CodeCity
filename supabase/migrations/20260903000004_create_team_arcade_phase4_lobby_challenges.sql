-- Migration: Create Team Arcade Phase 4 - Fest Lobby, Challenge Mapping & Participation Access
-- Description: Maps existing challenges to fests, implements atomic participation access verification with late-join prevention, and seeds initial fest challenges

-- 1. Create arcade_fest_challenges table
CREATE TABLE IF NOT EXISTS public.arcade_fest_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fest_id UUID REFERENCES public.arcade_fests(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  points INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_fest_challenges_unique UNIQUE (fest_id, challenge_id)
);

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_arcade_fest_challenges_fest ON public.arcade_fest_challenges (fest_id, order_index ASC);
CREATE INDEX IF NOT EXISTS idx_arcade_fest_challenges_challenge ON public.arcade_fest_challenges (challenge_id);

-- 3. Enable Row Level Security
ALTER TABLE public.arcade_fest_challenges ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- All authenticated users can read challenges mapped to fests
DROP POLICY IF EXISTS "Allow authenticated read arcade_fest_challenges" ON public.arcade_fest_challenges;
CREATE POLICY "Allow authenticated read arcade_fest_challenges"
ON public.arcade_fest_challenges
FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage fest challenges
DROP POLICY IF EXISTS "Allow admin manage arcade_fest_challenges" ON public.arcade_fest_challenges;
CREATE POLICY "Allow admin manage arcade_fest_challenges"
ON public.arcade_fest_challenges
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Stored Procedure: check_fest_participation_access
-- Enforces:
--  1. Fest exists
--  2. Fest is not ended (if ended, locked)
--  3. User belongs to an active team
--  4. User's team is registered in arcade_fest_registrations
--  5. Late-join prevention: user joined squad before fest start_time
CREATE OR REPLACE FUNCTION public.check_fest_participation_access(
  p_fest_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_fest RECORD;
  v_membership RECORD;
  v_team RECORD;
  v_effective_status TEXT;
  v_is_registered BOOLEAN;
  v_is_late_join BOOLEAN := false;
BEGIN
  -- 1. Fetch Fest
  SELECT * INTO v_fest
  FROM public.arcade_fests
  WHERE id = p_fest_id;

  IF v_fest.id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Fest not found.'
    );
  END IF;

  -- Dynamic time-evaluated status
  IF now() < v_fest.start_time THEN
    v_effective_status := 'upcoming';
  ELSIF now() <= v_fest.end_time THEN
    v_effective_status := 'live';
  ELSE
    v_effective_status := 'ended';
  END IF;

  IF v_effective_status = 'ended' THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'effective_status', 'ended',
      'reason', 'Participation locked: This fest has already concluded.'
    );
  END IF;

  -- 2. Fetch User Membership & Team
  SELECT * INTO v_membership
  FROM public.arcade_team_members
  WHERE user_id = p_user_id;

  IF v_membership.id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'effective_status', v_effective_status,
      'reason', 'You are not a member of any squad.'
    );
  END IF;

  SELECT * INTO v_team
  FROM public.arcade_teams
  WHERE id = v_membership.team_id AND status = 'active';

  IF v_team.id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'effective_status', v_effective_status,
      'reason', 'Your squad is inactive or not found.'
    );
  END IF;

  -- 3. Verify Team Registration for this Fest
  SELECT EXISTS (
    SELECT 1 FROM public.arcade_fest_registrations
    WHERE fest_id = v_fest.id AND team_id = v_team.id
  ) INTO v_is_registered;

  IF NOT v_is_registered THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'effective_status', v_effective_status,
      'team_id', v_team.id,
      'team_name', v_team.name,
      'is_registered', false,
      'reason', 'Your squad is not registered for this fest.'
    );
  END IF;

  -- 4. Late-Join Rule: User must have joined the squad before fest start_time
  IF now() >= v_fest.start_time AND v_membership.joined_at > v_fest.start_time THEN
    v_is_late_join := true;
    RETURN jsonb_build_object(
      'allowed', false,
      'effective_status', v_effective_status,
      'team_id', v_team.id,
      'team_name', v_team.name,
      'is_registered', true,
      'is_late_join', true,
      'reason', 'Late join blocked: You joined this squad after the competition started.'
    );
  END IF;

  -- All checks passed!
  RETURN jsonb_build_object(
    'allowed', true,
    'can_enter_live', (v_effective_status = 'live'),
    'effective_status', v_effective_status,
    'fest_id', v_fest.id,
    'fest_title', v_fest.title,
    'team_id', v_team.id,
    'team_name', v_team.name,
    'team_code', v_team.code,
    'role', v_membership.role,
    'is_registered', true,
    'is_late_join', false
  );
END;
$$;

-- 6. Stored Function: get_fest_challenges
-- Returns ordered challenge curriculum for authorized fest participants
CREATE OR REPLACE FUNCTION public.get_fest_challenges(
  p_fest_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  challenge_id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  difficulty TEXT,
  category TEXT,
  order_index INT,
  points INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_access JSONB;
BEGIN
  -- Verify participation access first
  v_access := public.check_fest_participation_access(p_fest_id, p_user_id);

  IF (v_access->>'allowed')::boolean IS NOT TRUE THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    fc.id,
    c.id AS challenge_id,
    c.title,
    c.slug,
    c.description,
    c.difficulty,
    c.category,
    fc.order_index,
    fc.points
  FROM public.arcade_fest_challenges fc
  JOIN public.challenges c ON c.id = fc.challenge_id
  WHERE fc.fest_id = p_fest_id
  ORDER BY fc.order_index ASC;
END;
$$;

-- 7. Seed Challenges into Initial Fests
DO $$
DECLARE
  v_live_fest UUID;
  v_upcoming_fest UUID;
  v_ch1 UUID;
  v_ch2 UUID;
  v_ch3 UUID;
BEGIN
  SELECT id INTO v_live_fest FROM public.arcade_fests WHERE title = 'AlgoRush Clash: Spring 2026' LIMIT 1;
  SELECT id INTO v_upcoming_fest FROM public.arcade_fests WHERE title = 'PixelCraft Frontend Hack Fest' LIMIT 1;

  SELECT id INTO v_ch1 FROM public.challenges WHERE slug = 'variable-swap-matrix' LIMIT 1;
  SELECT id INTO v_ch2 FROM public.challenges WHERE slug = 'array-filter-pipeline' LIMIT 1;
  SELECT id INTO v_ch3 FROM public.challenges WHERE slug = 'python-list-comprehension-quest' LIMIT 1;

  IF v_live_fest IS NOT NULL THEN
    IF v_ch1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.arcade_fest_challenges WHERE fest_id = v_live_fest AND challenge_id = v_ch1) THEN
      INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
      VALUES (v_live_fest, v_ch1, 1, 100);
    END IF;
    IF v_ch2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.arcade_fest_challenges WHERE fest_id = v_live_fest AND challenge_id = v_ch2) THEN
      INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
      VALUES (v_live_fest, v_ch2, 2, 150);
    END IF;
  END IF;

  IF v_upcoming_fest IS NOT NULL THEN
    IF v_ch2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.arcade_fest_challenges WHERE fest_id = v_upcoming_fest AND challenge_id = v_ch2) THEN
      INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
      VALUES (v_upcoming_fest, v_ch2, 1, 120);
    END IF;
    IF v_ch3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.arcade_fest_challenges WHERE fest_id = v_upcoming_fest AND challenge_id = v_ch3) THEN
      INSERT INTO public.arcade_fest_challenges (fest_id, challenge_id, order_index, points)
      VALUES (v_upcoming_fest, v_ch3, 2, 180);
    END IF;
  END IF;
END $$;

-- 8. Add to realtime replication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_fest_challenges;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
