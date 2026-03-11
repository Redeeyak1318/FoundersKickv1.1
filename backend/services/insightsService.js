import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'insights';

/**
 * Get all insight metrics for the authenticated user.
 */
export const getInsights = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};
