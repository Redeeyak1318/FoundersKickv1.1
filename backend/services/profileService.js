import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'profiles';

/**
 * Fetch the profile for the authenticated user.
 * If no profile exists yet, auto-create a skeleton row.
 */
export const getProfile = async (userId, email) => {
  let { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Row not found — bootstrap a new profile
    const { data: newProfile, error: insertErr } = await supabaseAdmin
      .from(TABLE)
      .insert({ id: userId, email, name: '', bio: '', location: '', skills: [], avatar_url: '' })
      .select()
      .single();
    if (insertErr) throw insertErr;
    return newProfile;
  }

  if (error) throw error;
  return data;
};

/**
 * Update profile fields (name, bio, location, skills, avatar_url).
 */
export const updateProfile = async (userId, updates) => {
  const allowed = ['name', 'bio', 'location', 'skills', 'avatar_url'];
  const clean = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) clean[key] = updates[key];
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(clean)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
