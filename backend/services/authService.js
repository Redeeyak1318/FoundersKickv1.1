import { supabase, supabaseAdmin } from '../config/supabaseClient.js';

/**
 * Verify a session by retrieving the user from a JWT.
 */
export const getSession = async (token) => {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) throw error;
  return data.user;
};

/**
 * Sign out — revokes the session server-side.
 */
export const logout = async (token) => {
  // Admin client can revoke any session
  const { error } = await supabaseAdmin.auth.admin.signOut(token);
  if (error) {
    // Fallback: sign out via the public client scoped to the token
    const { error: fallbackErr } = await supabase.auth.signOut();
    if (fallbackErr) throw fallbackErr;
  }
  return true;
};

/**
 * Get the Google OAuth redirect URL from Supabase.
 * The frontend usually handles this directly, but we expose it for
 * server-driven flows too.
 */
export const getGoogleOAuthUrl = async (redirectTo) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
  return data;
};
