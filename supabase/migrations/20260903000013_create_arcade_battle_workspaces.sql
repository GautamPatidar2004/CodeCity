-- Migration: Create Team Arcade Phase 11 - Real-Time Collaborative Workspace
-- Description: Table for battle-team-quest workspace snapshots, atomic stored procedures, lifecycle validation, and team-isolated RLS

-- 1. Create arcade_battle_workspaces table
CREATE TABLE IF NOT EXISTS public.arcade_battle_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.arcade_battles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.arcade_teams(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'javascript',
  version INTEGER NOT NULL DEFAULT 1,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arcade_battle_workspaces_unique UNIQUE (battle_id, team_id, exercise_id)
);

-- 2. Create alias view for compatibility
CREATE OR REPLACE VIEW public.battle_workspaces AS
  SELECT * FROM public.arcade_battle_workspaces;

-- 3. Indexes for fast query and snapshot lookups
CREATE INDEX IF NOT EXISTS idx_arcade_battle_workspaces_lookup ON public.arcade_battle_workspaces (battle_id, team_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_arcade_battle_workspaces_team ON public.arcade_battle_workspaces (team_id);

-- 4. Enable Row Level Security
ALTER TABLE public.arcade_battle_workspaces ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Strictly isolate workspaces by team
-- Registered squad members can view their own team's workspace snapshot
DROP POLICY IF EXISTS "Members view own team battle workspace" ON public.arcade_battle_workspaces;
CREATE POLICY "Members view own team battle workspace"
ON public.arcade_battle_workspaces
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.arcade_team_members tm
    WHERE tm.team_id = arcade_battle_workspaces.team_id
      AND tm.user_id = auth.uid()
  ) OR public.is_admin()
);

-- Registered squad members can only insert/update workspace snapshots during a live battle
DROP POLICY IF EXISTS "Members modify own team workspace during live battle" ON public.arcade_battle_workspaces;
CREATE POLICY "Members modify own team workspace during live battle"
ON public.arcade_battle_workspaces
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.arcade_team_members tm
    JOIN public.arcade_battles b ON b.id = arcade_battle_workspaces.battle_id
    WHERE tm.team_id = arcade_battle_workspaces.team_id
      AND tm.user_id = auth.uid()
      AND b.status != 'draft'
      AND now() >= b.start_time
      AND now() <= b.end_time
  ) OR public.is_admin()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.arcade_team_members tm
    JOIN public.arcade_battles b ON b.id = arcade_battle_workspaces.battle_id
    WHERE tm.team_id = arcade_battle_workspaces.team_id
      AND tm.user_id = auth.uid()
      AND b.status != 'draft'
      AND now() >= b.start_time
      AND now() <= b.end_time
  ) OR public.is_admin()
);

-- 6. Stored Procedure: get_or_create_battle_workspace
-- Returns the existing workspace code or initializes with challenge starter_code
CREATE OR REPLACE FUNCTION public.get_or_create_battle_workspace(
  p_battle_id UUID,
  p_team_id UUID,
  p_exercise_id UUID,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace RECORD;
  v_challenge RECORD;
  v_is_registered BOOLEAN;
  v_is_member BOOLEAN;
BEGIN
  -- 1. Security Check: verify user belongs to team
  SELECT EXISTS (
    SELECT 1 FROM public.arcade_team_members
    WHERE team_id = p_team_id AND user_id = p_user_id
  ) INTO v_is_member;

  IF NOT v_is_member AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You are not a member of this squad.');
  END IF;

  -- 2. Security Check: verify squad registered for this battle
  SELECT EXISTS (
    SELECT 1 FROM public.arcade_battle_registrations
    WHERE battle_id = p_battle_id AND team_id = p_team_id AND status = 'confirmed'
  ) INTO v_is_registered;

  IF NOT v_is_registered AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Squad is not registered for this battle.');
  END IF;

  -- 3. Check for existing workspace snapshot
  SELECT * INTO v_workspace
  FROM public.arcade_battle_workspaces
  WHERE battle_id = p_battle_id AND team_id = p_team_id AND exercise_id = p_exercise_id;

  IF v_workspace.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'workspace_id', v_workspace.id,
      'code', v_workspace.code,
      'language', v_workspace.language,
      'version', v_workspace.version,
      'updated_at', v_workspace.updated_at
    );
  END IF;

  -- 4. If not found, fetch starter_code from challenge
  SELECT starter_code, language INTO v_challenge
  FROM public.challenges
  WHERE id = p_exercise_id;

  -- 5. Initialize workspace row
  INSERT INTO public.arcade_battle_workspaces (
    battle_id,
    team_id,
    exercise_id,
    code,
    language,
    version,
    updated_by
  ) VALUES (
    p_battle_id,
    p_team_id,
    p_exercise_id,
    COALESCE(v_challenge.starter_code, ''),
    COALESCE(v_challenge.language, 'javascript'),
    1,
    p_user_id
  )
  ON CONFLICT (battle_id, team_id, exercise_id)
  DO UPDATE SET updated_at = now()
  RETURNING * INTO v_workspace;

  RETURN jsonb_build_object(
    'success', true,
    'workspace_id', v_workspace.id,
    'code', v_workspace.code,
    'language', v_workspace.language,
    'version', v_workspace.version,
    'updated_at', v_workspace.updated_at
  );
END;
$$;

-- 7. Stored Procedure: save_battle_workspace_snapshot
-- Atomically updates workspace code snapshot (debounced, not per-keystroke)
CREATE OR REPLACE FUNCTION public.save_battle_workspace_snapshot(
  p_battle_id UUID,
  p_team_id UUID,
  p_exercise_id UUID,
  p_user_id UUID,
  p_code TEXT,
  p_language TEXT DEFAULT 'javascript',
  p_version INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle RECORD;
  v_is_member BOOLEAN;
  v_workspace RECORD;
BEGIN
  -- 1. Verify user membership
  SELECT EXISTS (
    SELECT 1 FROM public.arcade_team_members
    WHERE team_id = p_team_id AND user_id = p_user_id
  ) INTO v_is_member;

  IF NOT v_is_member AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You are not a member of this squad.');
  END IF;

  -- 2. Verify battle lifecycle timing
  SELECT * INTO v_battle
  FROM public.arcade_battles
  WHERE id = p_battle_id;

  IF v_battle.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Battle not found.');
  END IF;

  IF now() < v_battle.start_time THEN
    RETURN jsonb_build_object('success', false, 'error', 'Battle has not started yet.');
  END IF;

  IF now() > v_battle.end_time THEN
    RETURN jsonb_build_object('success', false, 'error', 'Battle has already concluded. Code modifications are locked.');
  END IF;

  -- 3. Upsert workspace snapshot
  INSERT INTO public.arcade_battle_workspaces (
    battle_id,
    team_id,
    exercise_id,
    code,
    language,
    version,
    updated_by,
    updated_at
  ) VALUES (
    p_battle_id,
    p_team_id,
    p_exercise_id,
    p_code,
    COALESCE(p_language, 'javascript'),
    p_version,
    p_user_id,
    now()
  )
  ON CONFLICT (battle_id, team_id, exercise_id)
  DO UPDATE SET
    code = EXCLUDED.code,
    language = EXCLUDED.language,
    version = EXCLUDED.version,
    updated_by = EXCLUDED.updated_by,
    updated_at = now()
  RETURNING * INTO v_workspace;

  RETURN jsonb_build_object(
    'success', true,
    'workspace_id', v_workspace.id,
    'version', v_workspace.version,
    'updated_at', v_workspace.updated_at
  );
END;
$$;

-- 8. Add to realtime replication if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.arcade_battle_workspaces;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
