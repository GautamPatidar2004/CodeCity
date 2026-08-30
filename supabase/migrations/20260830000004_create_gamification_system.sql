-- XP Transactions Table (Unique source_type + source_id prevents double awarding)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, source_type, source_id)
);

-- Add Daily Goal & Streak Tracking Columns to profiles if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'daily_goal_xp'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN daily_goal_xp INTEGER NOT NULL DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'daily_xp_earned'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN daily_xp_earned INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_active_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_active_date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Enable RLS on xp_transactions
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own xp transactions" ON public.xp_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own xp transactions" ON public.xp_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Stored procedure to award XP and update streak and level safely in one transaction
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source_type TEXT,
  p_source_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted_id UUID;
  v_current_profile RECORD;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_streak INTEGER;
  v_new_daily_xp INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- 1. Attempt idempotent insert into xp_transactions
  INSERT INTO public.xp_transactions (user_id, amount, source_type, source_id)
  VALUES (p_user_id, p_amount, p_source_type, p_source_id)
  ON CONFLICT (user_id, source_type, source_id) DO NOTHING
  RETURNING id INTO v_inserted_id;

  -- If already awarded previously, return without changes
  IF v_inserted_id IS NULL THEN
    SELECT xp, level, streak, daily_goal_xp, daily_xp_earned INTO v_current_profile
    FROM public.profiles WHERE id = p_user_id;

    RETURN jsonb_build_object(
      'awarded', false,
      'xp', v_current_profile.xp,
      'level', v_current_profile.level,
      'streak', v_current_profile.streak
    );
  END IF;

  -- 2. Fetch current profile
  SELECT * INTO v_current_profile FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  -- Calculate new XP and Level (1 Level per 200 XP)
  v_new_xp := COALESCE(v_current_profile.xp, 0) + p_amount;
  v_new_level := GREATEST(1, FLOOR(v_new_xp / 200) + 1);

  -- Calculate Streak
  IF v_current_profile.last_active_date = v_today THEN
    v_new_streak := COALESCE(v_current_profile.streak, 1);
    v_new_daily_xp := COALESCE(v_current_profile.daily_xp_earned, 0) + p_amount;
  ELSIF v_current_profile.last_active_date = v_today - 1 THEN
    v_new_streak := COALESCE(v_current_profile.streak, 0) + 1;
    v_new_daily_xp := p_amount;
  ELSE
    v_new_streak := 1;
    v_new_daily_xp := p_amount;
  END IF;

  -- Update profile record
  UPDATE public.profiles
  SET
    xp = v_new_xp,
    level = v_new_level,
    streak = v_new_streak,
    daily_xp_earned = v_new_daily_xp,
    last_active_date = v_today,
    updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'awarded', true,
    'xp', v_new_xp,
    'level', v_new_level,
    'streak', v_new_streak,
    'daily_xp_earned', v_new_daily_xp
  );
END;
$$;
