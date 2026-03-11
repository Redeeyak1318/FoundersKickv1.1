import { createClient } from '@supabase/supabase-js';

// ── Public client (uses anon key — respects RLS) ──
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

// ── Admin client (bypasses RLS — server-side only) ──
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export { supabase, supabaseAdmin };
