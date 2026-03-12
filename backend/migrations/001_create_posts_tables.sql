-- =====================================================
-- FoundersKick — Posts Tables Migration
-- Run this in Supabase SQL Editor to add posts support.
-- =====================================================

-- ─── POSTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  image       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── POST LIKES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- ─── POST COMMENTS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS post_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── INDEXES ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_user       ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created    ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post  ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user  ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);

-- ─── ROW LEVEL SECURITY ─────────────────────────────
ALTER TABLE posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments  ENABLE ROW LEVEL SECURITY;

-- Posts: anyone can read, owner can CUD
CREATE POLICY "Posts are viewable by everyone"   ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts"           ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts"       ON posts FOR DELETE USING (auth.uid() = user_id);

-- Likes: anyone can read, authenticated can insert/delete own
CREATE POLICY "Likes are viewable by everyone"   ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts"             ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts"           ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: anyone can read, authenticated can insert own
CREATE POLICY "Comments are viewable by everyone" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment on posts"        ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
