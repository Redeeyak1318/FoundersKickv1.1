-- =====================================================
-- FoundersKick — Supabase Postgres Schema
-- Run this in the Supabase SQL Editor to bootstrap all tables.
-- =====================================================

-- ─── 1. PROFILES ─────────────────────────────────────
-- Linked to Supabase Auth users via id (uuid).
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  bio        TEXT DEFAULT '',
  location   TEXT DEFAULT '',
  skills     TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create a profile row when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. STARTUPS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS startups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  stage       TEXT DEFAULT 'idea',
  location    TEXT DEFAULT '',
  website     TEXT DEFAULT '',
  tags        TEXT[] DEFAULT '{}',
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. CONNECTIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS connections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sender_id, receiver_id)
);

-- ─── 4. MESSAGES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. NOTIFICATIONS ──────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'general',
  content    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. LAUNCHPAD SUBMISSIONS ──────────────────────
CREATE TABLE IF NOT EXISTS launchpad_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_name TEXT NOT NULL,
  pitch        TEXT NOT NULL,
  stage        TEXT DEFAULT 'idea',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 7. RESOURCES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  link       TEXT NOT NULL,
  category   TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 8. INSIGHTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS insights (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric     TEXT NOT NULL,
  value      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 9. INDEXES (performance) ──────────────────────
CREATE INDEX IF NOT EXISTS idx_startups_created_by   ON startups(created_by);
CREATE INDEX IF NOT EXISTS idx_connections_sender     ON connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver   ON connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender        ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver      ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_launchpad_user         ON launchpad_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user          ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_category     ON resources(category);

-- ─── 10. ROW LEVEL SECURITY (RLS) ─────────────────
-- Enable RLS on all tables (recommended for Supabase).
-- The backend uses the service_role key which bypasses RLS,
-- but these policies protect direct Supabase client access.

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups              ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE launchpad_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources             ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights              ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone"    ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"         ON profiles FOR UPDATE USING (auth.uid() = id);

-- Startups: anyone can read, owner can CUD
CREATE POLICY "Startups are viewable by everyone"    ON startups FOR SELECT USING (true);
CREATE POLICY "Users can insert own startups"        ON startups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own startups"        ON startups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own startups"        ON startups FOR DELETE USING (auth.uid() = created_by);

-- Connections: participants can read, sender can insert
CREATE POLICY "Users can view own connections"       ON connections FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));
CREATE POLICY "Users can send connections"           ON connections FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can accept connections"      ON connections FOR UPDATE USING (auth.uid() = receiver_id);

-- Messages: participants can read/write
CREATE POLICY "Users can view own messages"          ON messages FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));
CREATE POLICY "Users can send messages"              ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: owner only
CREATE POLICY "Users can view own notifications"     ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"   ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Launchpad: owner only
CREATE POLICY "Users can view own submissions"       ON launchpad_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions"         ON launchpad_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Resources: public read
CREATE POLICY "Resources are public"                 ON resources FOR SELECT USING (true);

-- Insights: owner only
CREATE POLICY "Users can view own insights"          ON insights FOR SELECT USING (auth.uid() = user_id);
