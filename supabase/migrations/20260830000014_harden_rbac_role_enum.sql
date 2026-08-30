-- 1. Create user_role ENUM type if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('student', 'admin');
  END IF;
END $$;

-- 2. Drop existing CHECK constraints on profiles (which compared text to 'learner'/'admin')
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
  ) LOOP
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- 3. Drop existing default on role
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- 4. Convert public.profiles.role to public.user_role enum
ALTER TABLE public.profiles
  ALTER COLUMN role TYPE public.user_role
  USING (
    CASE
      WHEN role::text = 'admin' THEN 'admin'::public.user_role
      ELSE 'student'::public.user_role
    END
  );

-- 5. Set new enum default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'student'::public.user_role;

-- 6. Update public.is_admin() function to use the user_role enum
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
  );
$$;

-- 7. Update handle_new_user() trigger function to use the user_role enum and default to 'student'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, role, xp, level, streak)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    CASE
      WHEN (NEW.raw_user_meta_data->>'role') = 'admin' THEN 'admin'::public.user_role
      ELSE 'student'::public.user_role
    END,
    CASE WHEN (NEW.raw_user_meta_data->>'role') = 'admin' THEN 9999 ELSE 50 END,
    CASE WHEN (NEW.raw_user_meta_data->>'role') = 'admin' THEN 99 ELSE 1 END,
    1
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, profiles.username),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- 8. Update get_leaderboard function to cast role to text for public API stability
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INT DEFAULT 20)
RETURNS TABLE (
  rank BIGINT,
  id UUID,
  username TEXT,
  full_name TEXT,
  role TEXT,
  xp INTEGER,
  level INTEGER,
  avatar_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY p.xp DESC, p.created_at ASC, p.id ASC) AS rank,
    p.id,
    p.username,
    p.full_name,
    p.role::text AS role,
    p.xp,
    p.level,
    p.avatar_url
  FROM public.profiles p
  ORDER BY p.xp DESC, p.created_at ASC, p.id ASC
  LIMIT limit_count;
$$;
