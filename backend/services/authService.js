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
  try {
    // Get user from token to find their ID
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      // Token is already invalid/expired — treat as logged out
      return true;
    }
    // Sign out all sessions for this user using admin API
    const { error } = await supabaseAdmin.auth.admin.signOut(user.id, 'global');
    if (error) {
      console.warn('Admin signOut failed, token may already be expired:', error.message);
    }
  } catch (err) {
    console.warn('Logout warning:', err.message);
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
