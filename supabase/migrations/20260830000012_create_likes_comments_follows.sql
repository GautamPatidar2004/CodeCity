-- Likes, Comments, and Follows Migration
CREATE TABLE IF NOT EXISTS public.post_likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT prevent_self_follow CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- 1. Post Likes RLS
CREATE POLICY "Public read post likes" ON public.post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_posts
      WHERE id = post_likes.post_id
        AND (status = 'published' OR auth.uid() = community_posts.user_id OR public.is_admin())
    )
  );

CREATE POLICY "Users toggle own likes" ON public.post_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own likes" ON public.post_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2. Post Comments RLS
CREATE POLICY "Public read post comments" ON public.post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_posts
      WHERE id = post_comments.post_id
        AND (status = 'published' OR auth.uid() = community_posts.user_id OR public.is_admin())
    )
  );

CREATE POLICY "Users insert own comments" ON public.post_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and admins update comments" ON public.post_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users and admins delete comments" ON public.post_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- 3. User Follows RLS
CREATE POLICY "Public read user follows" ON public.user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users follow others" ON public.user_follows
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id AND follower_id != following_id);

CREATE POLICY "Users unfollow others" ON public.user_follows
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);
