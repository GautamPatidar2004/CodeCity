-- Migration: Create Team Arcade Phase 10 - Student Battle Participation & Lobby
-- Description: Table for battle registrations, unique team constraints, atomic stored procedures with row locks, late-join protection, and RLS policies

-- 1. Create arcade_battle_registrations table
CREATE TABLE IF NOT EXISTS public.arcade_battle_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.arcade_battles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  registered_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_battle_registrations_unique UNIQUE (battle_id, team_id)
);

-- 2. Create alias view for compatibility
CREATE OR REPLACE VIEW public.battle_registrations AS
  SELECT * FROM public.arcade_battle_registrations;

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_arcade_battle_registrations_battle ON public.arcade_battle_registrations (battle_id);
CREATE INDEX IF NOT EXISTS idx_arcade_battle_registrations_team ON public.arcade_battle_registrations (team_id);
CREATE INDEX IF NOT EXISTS idx_arcade_battle_registrations_registered_by ON public.arcade_battle_registrations (registered_by);

-- 4. Enable Row Level Security
ALTER TABLE public.arcade_battle_registrations ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Allow authenticated read arcade_battle_registrations" ON public.arcade_battle_registrations;
CREATE POLICY "Allow authenticated read arcade_battle_registrations"
ON public.arcade_battle_registrations
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow captain insert arcade_battle_registrations" ON public.arcade_battle_registrations;
CREATE POLICY "Allow captain insert arcade_battle_registrations"
ON public.arcade_battle_registrations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.arcade_teams
    WHERE id = team_id AND captain_id = auth.uid()
  ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Allow admin mutate arcade_battle_registrations" ON public.arcade_battle_registrations;
CREATE POLICY "Allow admin mutate arcade_battle_registrations"
ON public.arcade_battle_registrations
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow captain or admin delete arcade_battle_registrations" ON public.arcade_battle_registrations;
CREATE POLICY "Allow captain or admin delete arcade_battle_registrations"
ON public.arcade_battle_registrations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.arcade_teams
    WHERE id = team_id AND captain_id = auth.uid()
  ) OR public.is_admin()
);

-- 6. Stored Procedure: register_team_for_battle
-- Enforces:
--  - Student must be captain of an active squad
--  - Battle must exist and be strictly upcoming (now() < start_time)
--  - Cannot register for draft or ended battles
--  - Prevents race conditions with FOR UPDATE row locks
--  - Prevents duplicate registration
CREATE OR REPLACE FUNCTION public.register_team_for_battle(
  p_battle_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team RECORD;
  v_battle RECORD;
  v_reg_id UUID;
BEGIN
  -- 1. Lock the team row and verify captaincy
  SELECT * INTO v_team
  FROM public.arcade_teams
  WHERE captain_id = p_user_id AND status = 'active'
  FOR UPDATE;

  IF v_team.id IS NULL THEN
    IF EXISTS (SELECT 1 FROM public.arcade_team_members WHERE user_id = p_user_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Only the squad captain can register the team for a battle.');
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'You must create or join an active squad before registering for a battle.');
    END IF;
  END IF;

  -- 2. Lock the battle row and verify timing & status eligibility
  SELECT * INTO v_battle
  FROM public.arcade_battles
  WHERE id = p_battle_id
  FOR UPDATE;

  IF v_battle.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Battle not found.');
  END IF;

  IF v_battle.status = 'draft' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration closed: This battle is still an unpublished draft.');
  END IF;

  -- Battle must be strictly upcoming
  IF now() >= v_battle.start_time THEN
    IF now() > v_battle.end_time THEN
      RETURN jsonb_build_object('success', false, 'error', 'Registration closed: This battle has already concluded.');
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Registration closed: This battle is already live in competition.');
    END IF;
  END IF;

  -- 3. Check for existing registration
  IF EXISTS (
    SELECT 1 FROM public.arcade_battle_registrations
    WHERE battle_id = v_battle.id AND team_id = v_team.id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Your squad is already registered for this battle.');
  END IF;

  -- 4. Insert registration atomically
  INSERT INTO public.arcade_battle_registrations (
    battle_id,
    team_id,
    registered_by,
    status
  ) VALUES (
    v_battle.id,
    v_team.id,
    p_user_id,
    'confirmed'
  )
  RETURNING id INTO v_reg_id;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_reg_id,
    'battle_id', v_battle.id,
    'battle_title', v_battle.title,
    'team_id', v_team.id,
    'team_name', v_team.name,
    'start_time', v_battle.start_time
  );
END;
$$;

-- 7. Stored Procedure: check_battle_participation_access
-- Enforces:
--  1. Battle exists and is not draft
--  2. Battle is not ended
--  3. User belongs to an active squad
--  4. User's squad is registered in arcade_battle_registrations
--  5. Late-join prevention: user must have joined the squad before battle start_time
CREATE OR REPLACE FUNCTION public.check_battle_participation_access(
  p_battle_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_battle RECORD;
  v_membership RECORD;
  v_team RECORD;
  v_effective_status TEXT;
  v_is_registered BOOLEAN;
  v_is_late_join BOOLEAN := false;
BEGIN
  -- 1. Fetch Battle
  SELECT * INTO v_battle
  FROM public.arcade_battles
  WHERE id = p_battle_id;

  IF v_battle.id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Battle not found.'
    );
  END IF;

  IF v_battle.status = 'draft' THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Battle is not published.'
    );
  END IF;

  -- Dynamic time-evaluated status
  IF now() < v_battle.start_time THEN
    v_effective_status := 'upcoming';
  ELSIF now() <= v_battle.end_time THEN
    v_effective_status := 'live';
  ELSE
    v_effective_status := 'ended';
  END IF;

  IF v_effective_status = 'ended' THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'effective_status', 'ended',
      'reason', 'Participation locked: This battle has already concluded.'
    );
  END IF;

  -- 2. Fetch User Membership & Squad
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

  -- 3. Verify Team Registration for this Battle
  SELECT EXISTS (
    SELECT 1 FROM public.arcade_battle_registrations
    WHERE battle_id = v_battle.id AND team_id = v_team.id AND status = 'confirmed'
  ) INTO v_is_registered;

  IF NOT v_is_registered THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'effective_status', v_effective_status,
      'team_id', v_team.id,
      'team_name', v_team.name,
      'is_registered', false,
      'reason', 'Your squad is not registered for this battle.'
    );
  END IF;

  -- 4. Late-Join Rule: User must have joined the squad before battle start_time
  IF now() >= v_battle.start_time AND v_membership.joined_at > v_battle.start_time THEN
    v_is_late_join := true;
    RETURN jsonb_build_object(
      'allowed', false,
      'effective_status', v_effective_status,
      'team_id', v_team.id,
      'team_name', v_team.name,
      'is_registered', true,
      'is_late_join', true,
      'reason', 'Late-join locked: You joined this squad after the battle started.'
    );
  END IF;

  -- 5. Access Approved
  RETURN jsonb_build_object(
    'allowed', true,
    'effective_status', v_effective_status,
    'team_id', v_team.id,
    'team_name', v_team.name,
    'is_captain', (v_team.captain_id = p_user_id),
    'is_registered', true,
    'is_late_join', false
  );
END;
$$;

-- 8. Add to realtime replication if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_battle_registrations;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
