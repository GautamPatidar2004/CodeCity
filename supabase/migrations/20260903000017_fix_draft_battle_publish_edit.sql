-- Migration: Fix Draft Battle Publish and Edit Permissions, Stored Procedures & RLS
-- Description: Harden is_admin() with metadata fallbacks, allow battle creators to edit/publish their drafts, add atomic publish_arcade_battle and save_arcade_battle_exercises stored procedures

-- 1. Harden public.is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (role = 'admin'::public.user_role OR role::text = 'admin')
    )
    OR
    COALESCE((auth.jwt() ->> 'role'), '') = 'service_role'
    OR
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
    OR
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );
$$;

-- 2. Update RLS policies on arcade_battles
DROP POLICY IF EXISTS "Admin view all arcade_battles" ON public.arcade_battles;
CREATE POLICY "Admin view all arcade_battles"
ON public.arcade_battles
FOR SELECT
TO authenticated
USING (public.is_admin() OR created_by = auth.uid());

DROP POLICY IF EXISTS "Admin update arcade_battles" ON public.arcade_battles;
CREATE POLICY "Admin update arcade_battles"
ON public.arcade_battles
FOR UPDATE
TO authenticated
USING (public.is_admin() OR created_by = auth.uid())
WITH CHECK (public.is_admin() OR created_by = auth.uid());

DROP POLICY IF EXISTS "Admin delete arcade_battles" ON public.arcade_battles;
CREATE POLICY "Admin delete arcade_battles"
ON public.arcade_battles
FOR DELETE
TO authenticated
USING (public.is_admin() OR created_by = auth.uid());

-- 3. Update RLS policies on arcade_battle_exercises
DROP POLICY IF EXISTS "Admin view all arcade_battle_exercises" ON public.arcade_battle_exercises;
CREATE POLICY "Admin view all arcade_battle_exercises"
ON public.arcade_battle_exercises
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.arcade_battles b
    WHERE b.id = arcade_battle_exercises.battle_id
      AND b.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admin insert arcade_battle_exercises" ON public.arcade_battle_exercises;
CREATE POLICY "Admin insert arcade_battle_exercises"
ON public.arcade_battle_exercises
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.arcade_battles b
    WHERE b.id = arcade_battle_exercises.battle_id
      AND b.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admin update arcade_battle_exercises" ON public.arcade_battle_exercises;
CREATE POLICY "Admin update arcade_battle_exercises"
ON public.arcade_battle_exercises
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.arcade_battles b
    WHERE b.id = arcade_battle_exercises.battle_id
      AND b.created_by = auth.uid()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.arcade_battles b
    WHERE b.id = arcade_battle_exercises.battle_id
      AND b.created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admin delete arcade_battle_exercises" ON public.arcade_battle_exercises;
CREATE POLICY "Admin delete arcade_battle_exercises"
ON public.arcade_battle_exercises
FOR DELETE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.arcade_battles b
    WHERE b.id = arcade_battle_exercises.battle_id
      AND b.created_by = auth.uid()
  )
);

-- 4. Stored Procedure: publish_arcade_battle
-- Atomically validates battle configuration, checks question set, and publishes
CREATE OR REPLACE FUNCTION public.publish_arcade_battle(
  p_battle_id UUID,
  p_admin_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle RECORD;
  v_exercise_count INT;
BEGIN
  -- 1. Fetch battle
  SELECT * INTO v_battle
  FROM public.arcade_battles
  WHERE id = p_battle_id;

  IF v_battle.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Battle not found.');
  END IF;

  -- 2. Authorization check
  IF NOT public.is_admin() AND (p_admin_user_id IS NULL OR v_battle.created_by != p_admin_user_id) THEN
    IF auth.uid() IS NULL OR v_battle.created_by != auth.uid() THEN
      RETURN jsonb_build_object('success', false, 'error', 'Administrator permission required to publish battles.');
    END IF;
  END IF;

  -- 3. Status check
  IF v_battle.status != 'draft' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only draft battles can be published.');
  END IF;

  -- 4. Schedule checks
  IF v_battle.end_time <= now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot publish battle: End time is in the past. Please update the schedule first.');
  END IF;

  IF v_battle.end_time <= v_battle.start_time THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot publish battle: End time must be strictly after start time.');
  END IF;

  -- 5. Exercise requirement check
  SELECT COUNT(*) INTO v_exercise_count
  FROM public.arcade_battle_exercises
  WHERE battle_id = p_battle_id;

  IF v_exercise_count < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot publish battle: At least one coding exercise must be assigned.');
  END IF;

  -- 6. Transition to upcoming (or live if start_time has already arrived)
  UPDATE public.arcade_battles
  SET status = CASE WHEN now() >= v_battle.start_time THEN 'live' ELSE 'upcoming' END,
      updated_at = now()
  WHERE id = p_battle_id;

  -- 7. Audit log if user ID supplied
  IF p_admin_user_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
      VALUES (
        p_admin_user_id,
        'PUBLISH_ARCADE_BATTLE',
        'arcade_battle',
        p_battle_id,
        jsonb_build_object('title', v_battle.title, 'question_count', v_exercise_count)
      );
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;

  RETURN jsonb_build_object('success', true, 'battle_title', v_battle.title, 'status', CASE WHEN now() >= v_battle.start_time THEN 'live' ELSE 'upcoming' END);
END;
$$;

-- 5. Stored Procedure: save_arcade_battle_exercises
-- Atomically clears and saves the ordered exercise list for a battle
CREATE OR REPLACE FUNCTION public.save_arcade_battle_exercises(
  p_battle_id UUID,
  p_exercise_ids UUID[],
  p_admin_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle RECORD;
  v_ex_id UUID;
  v_idx INT := 1;
BEGIN
  -- 1. Fetch battle
  SELECT * INTO v_battle
  FROM public.arcade_battles
  WHERE id = p_battle_id;

  IF v_battle.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Battle not found.');
  END IF;

  -- 2. Mutation lock on live or concluded battles
  IF v_battle.status IN ('live', 'ended') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot modify questions of a live or concluded battle.');
  END IF;

  -- 3. Clear existing questions
  DELETE FROM public.arcade_battle_exercises
  WHERE battle_id = p_battle_id;

  -- 4. Insert new questions in deterministic order
  IF p_exercise_ids IS NOT NULL AND array_length(p_exercise_ids, 1) > 0 THEN
    FOREACH v_ex_id IN ARRAY p_exercise_ids
    LOOP
      INSERT INTO public.arcade_battle_exercises (battle_id, exercise_id, order_position, created_at)
      VALUES (p_battle_id, v_ex_id, v_idx, now())
      ON CONFLICT (battle_id, exercise_id) DO UPDATE SET order_position = EXCLUDED.order_position;
      v_idx := v_idx + 1;
    END LOOP;
  END IF;

  -- 5. Audit log
  IF p_admin_user_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
      VALUES (
        p_admin_user_id,
        'UPDATE_BATTLE_QUESTIONS',
        'arcade_battle',
        p_battle_id,
        jsonb_build_object('question_count', COALESCE(array_length(p_exercise_ids, 1), 0))
      );
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;

  RETURN jsonb_build_object('success', true, 'count', COALESCE(array_length(p_exercise_ids, 1), 0));
END;
$$;
