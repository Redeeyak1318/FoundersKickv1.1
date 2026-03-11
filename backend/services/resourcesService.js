import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'resources';

/**
 * List all resources, optionally filtered by category.
 */
export const getResources = async (category) => {
  let query = supabaseAdmin.from(TABLE).select('*').order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
