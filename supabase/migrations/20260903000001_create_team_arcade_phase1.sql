-- Migration: Create Team Arcade Phase 1 Tables, Constraints, Indexes, Functions, and RLS
-- Description: Foundational student-side team system (Creation, Joining with 6-character code, 4-member limit, Race Condition Protection)

-- 1. Create arcade_teams table
CREATE TABLE IF NOT EXISTS public.arcade_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code VARCHAR(6) UNIQUE NOT NULL,
  captain_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 1 CHECK (member_count >= 1 AND member_count <= 4),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_teams_name_length CHECK (char_length(trim(name)) >= 2 AND char_length(trim(name)) <= 50)
);

-- 2. Create arcade_team_members table
CREATE TABLE IF NOT EXISTS public.arcade_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('captain', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_team_members_user_unique UNIQUE (user_id),
  CONSTRAINT arcade_team_members_team_user_unique UNIQUE (team_id, user_id)
);

-- 3. Indexes for fast lookups and code validation
CREATE INDEX IF NOT EXISTS idx_arcade_teams_code ON public.arcade_teams (code);
CREATE INDEX IF NOT EXISTS idx_arcade_teams_captain ON public.arcade_teams (captain_id);
CREATE INDEX IF NOT EXISTS idx_arcade_teams_status ON public.arcade_teams (status);
CREATE INDEX IF NOT EXISTS idx_arcade_team_members_team ON public.arcade_team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_arcade_team_members_user ON public.arcade_team_members (user_id);

-- 4. Enable Row Level Security
ALTER TABLE public.arcade_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arcade_team_members ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for arcade_teams
DROP POLICY IF EXISTS "Allow authenticated read arcade_teams" ON public.arcade_teams;
CREATE POLICY "Allow authenticated read arcade_teams"
ON public.arcade_teams
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert arcade_teams" ON public.arcade_teams;
CREATE POLICY "Allow authenticated insert arcade_teams"
ON public.arcade_teams
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = captain_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow captain update arcade_teams" ON public.arcade_teams;
CREATE POLICY "Allow captain update arcade_teams"
ON public.arcade_teams
FOR UPDATE
TO authenticated
USING (auth.uid() = captain_id OR public.is_admin())
WITH CHECK (auth.uid() = captain_id OR public.is_admin());

-- 6. RLS Policies for arcade_team_members
DROP POLICY IF EXISTS "Allow authenticated read arcade_team_members" ON public.arcade_team_members;
CREATE POLICY "Allow authenticated read arcade_team_members"
ON public.arcade_team_members
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow users insert own membership" ON public.arcade_team_members;
CREATE POLICY "Allow users insert own membership"
ON public.arcade_team_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow users delete own membership" ON public.arcade_team_members;
CREATE POLICY "Allow users delete own membership"
ON public.arcade_team_members
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- 7. Stored Procedure: create_arcade_team
-- Validates constraints, generates a unique 6-character code, creates team & sets creator as captain atomically
CREATE OR REPLACE FUNCTION public.create_arcade_team(
  p_name TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_name TEXT;
  v_code TEXT;
  v_attempts INT := 0;
  v_new_team_id UUID;
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Readable uppercase alphanumeric excluding 0/O, 1/I
  v_i INT;
BEGIN
  v_clean_name := trim(p_name);
  IF v_clean_name IS NULL OR char_length(v_clean_name) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team name must be at least 2 characters.');
  END IF;

  IF char_length(v_clean_name) > 50 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team name must be 50 characters or less.');
  END IF;

  -- Verify student is not already in any active team
  IF EXISTS (SELECT 1 FROM public.arcade_team_members WHERE user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You already belong to an active team. Leave your current team first.');
  END IF;

  -- Generate unique 6-character team code
  LOOP
    v_code := '';
    FOR v_i IN 1..6 LOOP
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::integer, 1);
    END LOOP;

    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.arcade_teams WHERE code = v_code);

    v_attempts := v_attempts + 1;
    IF v_attempts > 25 THEN
      RAISE EXCEPTION 'Failed to generate unique team code.';
    END IF;
  END LOOP;

  -- Insert team
  INSERT INTO public.arcade_teams (name, code, captain_id, member_count, status)
  VALUES (v_clean_name, v_code, p_user_id, 1, 'active')
  RETURNING id INTO v_new_team_id;

  -- Insert captain membership
  INSERT INTO public.arcade_team_members (team_id, user_id, role)
  VALUES (v_new_team_id, p_user_id, 'captain');

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_new_team_id,
    'team_name', v_clean_name,
    'team_code', v_code
  );
END;
$$;

-- 8. Stored Procedure: join_arcade_team
-- Uses row-level lock (FOR UPDATE) to prevent race conditions during concurrent joins on 4-member limit
CREATE OR REPLACE FUNCTION public.join_arcade_team(
  p_team_code TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_code TEXT;
  v_team RECORD;
  v_current_count INT;
  v_new_member_id UUID;
BEGIN
  v_clean_code := upper(trim(p_team_code));

  IF v_clean_code IS NULL OR char_length(v_clean_code) != 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team code must be exactly 6 characters.');
  END IF;

  -- Verify student is not already in any active team
  IF EXISTS (SELECT 1 FROM public.arcade_team_members WHERE user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You already belong to an active team. Leave your current team first.');
  END IF;

  -- Concurrency control: Lock the team row exclusively to evaluate capacity atomically
  SELECT * INTO v_team
  FROM public.arcade_teams
  WHERE code = v_clean_code AND status = 'active'
  FOR UPDATE;

  IF v_team.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not found with the provided code.');
  END IF;

  -- Check current member count under lock
  SELECT count(*) INTO v_current_count
  FROM public.arcade_team_members
  WHERE team_id = v_team.id;

  IF v_current_count >= 4 THEN
    RETURN jsonb_build_object('success', false, 'error', 'This team is full (maximum 4 members).');
  END IF;

  -- Insert new team member
  INSERT INTO public.arcade_team_members (team_id, user_id, role)
  VALUES (v_team.id, p_user_id, 'member')
  RETURNING id INTO v_new_member_id;

  -- Update member count on team
  UPDATE public.arcade_teams
  SET member_count = v_current_count + 1,
      updated_at = now()
  WHERE id = v_team.id;

  RETURN jsonb_build_object(
    'success', true,
    'team_id', v_team.id,
    'team_name', v_team.name,
    'team_code', v_team.code,
    'member_id', v_new_member_id
  );
END;
$$;

-- 9. Stored Procedure: leave_arcade_team
-- Handles leaving, promoting new captain if needed, or deleting team if last member leaves
CREATE OR REPLACE FUNCTION public.leave_arcade_team(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_membership RECORD;
  v_team RECORD;
  v_remaining_count INT;
  v_new_captain RECORD;
BEGIN
  SELECT * INTO v_membership
  FROM public.arcade_team_members
  WHERE user_id = p_user_id;

  IF v_membership.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'You are not a member of any team.');
  END IF;

  -- Lock team row
  SELECT * INTO v_team
  FROM public.arcade_teams
  WHERE id = v_membership.team_id
  FOR UPDATE;

  -- Remove user membership
  DELETE FROM public.arcade_team_members
  WHERE id = v_membership.id;

  -- Count remaining members
  SELECT count(*) INTO v_remaining_count
  FROM public.arcade_team_members
  WHERE team_id = v_team.id;

  IF v_remaining_count = 0 THEN
    -- If no members remain, delete the team
    DELETE FROM public.arcade_teams WHERE id = v_team.id;
  ELSE
    -- If captain left, promote the next oldest member to captain
    IF v_membership.role = 'captain' THEN
      SELECT * INTO v_new_captain
      FROM public.arcade_team_members
      WHERE team_id = v_team.id
      ORDER BY joined_at ASC
      LIMIT 1;

      UPDATE public.arcade_team_members
      SET role = 'captain'
      WHERE id = v_new_captain.id;

      UPDATE public.arcade_teams
      SET captain_id = v_new_captain.user_id,
          member_count = v_remaining_count,
          updated_at = now()
      WHERE id = v_team.id;
    ELSE
      UPDATE public.arcade_teams
      SET member_count = v_remaining_count,
          updated_at = now()
      WHERE id = v_team.id;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 10. Enable realtime for live roster updates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_teams;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_team_members;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
