import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'launchpad_submissions';

/**
 * Submit a new launchpad entry.
 */
export const createSubmission = async (userId, body) => {
  const { startup_name, pitch, stage } = body;

  if (!startup_name || !pitch) {
    const err = new Error('startup_name and pitch are required');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ user_id: userId, startup_name, pitch, stage: stage || 'idea' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Get all submissions for the authenticated user.
 */
export const getSubmissions = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};
