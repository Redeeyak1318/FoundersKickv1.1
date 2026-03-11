import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'notifications';

/**
 * Get all notifications for a user, newest first.
 */
export const getNotifications = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

/**
 * Mark all unread notifications as read for a user.
 */
export const markAllRead = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();
  if (error) throw error;
  return data;
};

/**
 * Create a notification (used internally by other services).
 */
export const createNotification = async ({ userId, type, content }) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ user_id: userId, type, content, is_read: false })
    .select()
    .single();
  if (error) throw error;
  return data;
};
