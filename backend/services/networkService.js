import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'connections';

/**
 * Send a connection request.
 */
export const sendConnectionRequest = async (senderId, receiverId) => {
  if (senderId === receiverId) {
    const err = new Error('Cannot connect with yourself');
    err.statusCode = 400;
    throw err;
  }

  // Check for existing connection in either direction
  const { data: existing } = await supabaseAdmin
    .from(TABLE)
    .select('id, status')
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`,
    );

  if (existing && existing.length > 0) {
    const err = new Error('Connection already exists');
    err.statusCode = 409;
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ sender_id: senderId, receiver_id: receiverId, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * List all connections for a user (accepted + pending incoming).
 */
export const getConnections = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, sender:profiles!connections_sender_id_fkey(*), receiver:profiles!connections_receiver_id_fkey(*)')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

/**
 * Accept a pending connection request.
 */
export const acceptConnection = async (connectionId, userId) => {
  // Only the receiver can accept
  const { data: conn, error: fetchErr } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', connectionId)
    .single();
  if (fetchErr) throw fetchErr;

  if (conn.receiver_id !== userId) {
    const err = new Error('Only the receiver can accept a connection');
    err.statusCode = 403;
    throw err;
  }

  if (conn.status === 'accepted') {
    const err = new Error('Connection already accepted');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .select()
    .single();
  if (error) throw error;
  return data;
};
