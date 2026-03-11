import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'startups';

export const createStartup = async (userId, body) => {
  const { name, description, stage, location, website, tags } = body;
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ name, description, stage, location, website, tags: tags || [], created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAllStartups = async ({ search, stage, limit = 50, offset = 0 }) => {
  let query = supabaseAdmin.from(TABLE).select('*', { count: 'exact' });

  if (search) query = query.ilike('name', `%${search}%`);
  if (stage) query = query.eq('stage', stage);

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { startups: data, total: count };
};

export const getStartupById = async (id) => {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const updateStartup = async (id, userId, updates) => {
  // Only the creator can update
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from(TABLE)
    .select('created_by')
    .eq('id', id)
    .single();
  if (fetchErr) throw fetchErr;
  if (existing.created_by !== userId) {
    const err = new Error('Forbidden: you can only edit your own startups');
    err.statusCode = 403;
    throw err;
  }

  const allowed = ['name', 'description', 'stage', 'location', 'website', 'tags'];
  const clean = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) clean[key] = updates[key];
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(clean)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteStartup = async (id, userId) => {
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from(TABLE)
    .select('created_by')
    .eq('id', id)
    .single();
  if (fetchErr) throw fetchErr;
  if (existing.created_by !== userId) {
    const err = new Error('Forbidden: you can only delete your own startups');
    err.statusCode = 403;
    throw err;
  }

  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
};
