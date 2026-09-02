-- Migration: Create Team Arcade Phase 3 - Fest Registration
-- Description: Table for fest registrations, unique constraints, atomic stored procedure with row locks, and RLS policies

-- 1. Create arcade_fest_registrations table
CREATE TABLE IF NOT EXISTS public.arcade_fest_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fest_id UUID REFERENCES public.arcade_fests(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  registered_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_fest_registrations_unique UNIQUE (fest_id, team_id)
);

-- 2. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_arcade_fest_registrations_fest ON public.arcade_fest_registrations (fest_id);
CREATE INDEX IF NOT EXISTS idx_arcade_fest_registrations_team ON public.arcade_fest_registrations (team_id);
CREATE INDEX IF NOT EXISTS idx_arcade_fest_registrations_registered_by ON public.arcade_fest_registrations (registered_by);

-- 3. Enable Row Level Security
ALTER TABLE public.arcade_fest_registrations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- All authenticated users can read fest registrations
DROP POLICY IF EXISTS "Allow authenticated read arcade_fest_registrations" ON public.arcade_fest_registrations;
CREATE POLICY "Allow authenticated read arcade_fest_registrations"
ON public.arcade_fest_registrations
FOR SELECT
TO authenticated
USING (true);

-- Controlled insert policy for security definer RPC or captain insert
DROP POLICY IF EXISTS "Allow captain insert arcade_fest_registrations" ON public.arcade_fest_registrations;
CREATE POLICY "Allow captain insert arcade_fest_registrations"
ON public.arcade_fest_registrations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.arcade_teams
    WHERE id = team_id AND captain_id = auth.uid()
  ) OR public.is_admin()
);

-- 5. Stored Procedure: register_team_for_fest
-- Enforces:
--  - Student must be captain of an active team
--  - Fest must exist and be strictly upcoming (now() < start_time)
--  - Prevents race conditions with FOR UPDATE row locks
--  - Prevents duplicate registration
CREATE OR REPLACE FUNCTION public.register_team_for_fest(
  p_fest_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team RECORD;
  v_fest RECORD;
  v_reg_id UUID;
BEGIN
  -- 1. Lock the team row and verify captaincy
  SELECT * INTO v_team
  FROM public.arcade_teams
  WHERE captain_id = p_user_id AND status = 'active'
  FOR UPDATE;

  IF v_team.id IS NULL THEN
    -- Check if user is a member but not captain
    IF EXISTS (SELECT 1 FROM public.arcade_team_members WHERE user_id = p_user_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Only the squad captain can register the team for a fest.');
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'You must create or join a squad before registering for a fest.');
    END IF;
  END IF;

  -- 2. Lock the fest row and verify timing eligibility
  SELECT * INTO v_fest
  FROM public.arcade_fests
  WHERE id = p_fest_id
  FOR UPDATE;

  IF v_fest.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Fest not found.');
  END IF;

  -- Fest must be upcoming (start_time in the future)
  IF now() >= v_fest.start_time THEN
    IF now() > v_fest.end_time THEN
      RETURN jsonb_build_object('success', false, 'error', 'Registration closed: This fest has already concluded.');
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Registration closed: This fest is already live in competition.');
    END IF;
  END IF;

  -- 3. Check for existing registration
  IF EXISTS (
    SELECT 1 FROM public.arcade_fest_registrations
    WHERE fest_id = v_fest.id AND team_id = v_team.id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Your squad is already registered for this fest.');
  END IF;

  -- 4. Create registration record
  INSERT INTO public.arcade_fest_registrations (fest_id, team_id, registered_by)
  VALUES (v_fest.id, v_team.id, p_user_id)
  RETURNING id INTO v_reg_id;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_reg_id,
    'fest_id', v_fest.id,
    'fest_title', v_fest.title,
    'team_id', v_team.id,
    'team_name', v_team.name
  );
END;
$$;

-- 6. Realtime replication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_fest_registrations;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
