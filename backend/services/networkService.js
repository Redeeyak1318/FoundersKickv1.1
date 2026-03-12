import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'connections';

/**
 * Get network suggestions — profiles not already connected/following.
 */
export const getSuggestions = async (userId) => {
  // Get IDs of users already connected
  const { data: existing } = await supabaseAdmin
    .from(TABLE)
    .select('sender_id, receiver_id')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

  const connectedIds = new Set();
  (existing || []).forEach((c) => {
    connectedIds.add(c.sender_id);
    connectedIds.add(c.receiver_id);
  });
  connectedIds.add(userId); // exclude self

  // Get profiles not in connectedIds
  let query = supabaseAdmin
    .from('profiles')
    .select('id, name, avatar_url, bio, location')
    .limit(20);

  // Filter out connected users
  const excludeIds = [...connectedIds];
  if (excludeIds.length > 0) {
    for (const id of excludeIds) {
      query = query.neq('id', id);
    }
  }

  const { data: profiles, error } = await query;
  if (error) throw error;

  return (profiles || []).map((p) => ({
    id: p.id,
    name: p.name || 'Unnamed',
    avatar_url: p.avatar_url || '',
    bio: p.bio || '',
    location: p.location || '',
    role: 'Founder',
    company: '',
    is_following: false,
    mutual_count: 0,
  }));
};

/**
 * Follow a user (create connection).
 */
export const followUser = async (senderId, receiverId) => {
  if (senderId === receiverId) {
    const err = new Error('Cannot follow yourself');
    err.statusCode = 400;
    throw err;
  }

  // Check if already exists
  const { data: existing } = await supabaseAdmin
    .from(TABLE)
    .select('id')
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .maybeSingle();

  if (existing) {
    return { message: 'Already following' };
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ sender_id: senderId, receiver_id: receiverId, status: 'accepted' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Unfollow a user (remove connection).
 */
export const unfollowUser = async (senderId, receiverId) => {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .delete()
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId);
  if (error) throw error;
  return { message: 'Unfollowed' };
};

/**
 * Send a connection request (legacy — kept for compatibility).
 */
export const sendConnectionRequest = async (senderId, receiverId) => {
  return followUser(senderId, receiverId);
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
