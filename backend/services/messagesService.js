import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'messages';

/**
 * Send a new message from the authenticated user to another user.
 */
export const sendMessage = async (senderId, receiverId, content) => {
  if (!content || !content.trim()) {
    const err = new Error('Message content cannot be empty');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ sender_id: senderId, receiver_id: receiverId, content: content.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Retrieve the message thread between the authenticated user and another user.
 * Returns messages ordered chronologically.
 */
export const getThread = async (currentUserId, otherUserId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`,
    )
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};
