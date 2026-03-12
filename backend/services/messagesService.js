import { supabaseAdmin } from '../config/supabaseClient.js';

const TABLE = 'messages';

/**
 * Send a new message from the authenticated user to another user.
 * Accepts both 'text' and 'content' field names for compatibility.
 */
export const sendMessage = async (senderId, receiverId, text) => {
  if (!text || !text.trim()) {
    const err = new Error('Message text cannot be empty');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ sender_id: senderId, receiver_id: receiverId, content: text.trim() })
    .select()
    .single();
  if (error) throw error;

  // Attach sender profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', senderId)
    .single();

  return {
    id: data.id,
    text: data.content,
    time: 'Just now',
    created_at: data.created_at,
    sender: {
      id: senderId,
      name: profile?.name || 'Unknown',
      avatar: profile?.avatar_url || '',
    },
  };
};

/**
 * Retrieve the message thread between the authenticated user and another user.
 * Returns messages ordered chronologically with sender profiles.
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

  // Get sender profiles for the thread
  const senderIds = [...new Set((data || []).map((m) => m.sender_id))];
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', senderIds.length > 0 ? senderIds : ['00000000-0000-0000-0000-000000000000']);

  const profileMap = {};
  (profiles || []).forEach((p) => { profileMap[p.id] = p; });

  return (data || []).map((m) => {
    const p = profileMap[m.sender_id] || {};
    return {
      id: m.id,
      text: m.content,
      time: timeAgo(m.created_at),
      created_at: m.created_at,
      sender: {
        id: m.sender_id,
        name: p.name || 'Unknown',
        avatar: p.avatar_url || '',
      },
    };
  });
};

/**
 * Get conversation list for the current user.
 * Groups messages by the other participant and returns the latest message.
 */
export const getConversations = async (currentUserId) => {
  // Get all messages involving this user
  const { data: allMessages, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;

  if (!allMessages || allMessages.length === 0) return [];

  // Group by the "other" user
  const convMap = {};
  for (const msg of allMessages) {
    const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
    if (!convMap[otherId]) {
      convMap[otherId] = {
        id: otherId,
        lastMessage: msg.content,
        timestamp: timeAgo(msg.created_at),
        unread: false,
      };
    }
  }

  // Fetch profiles for all conversation partners
  const otherIds = Object.keys(convMap);
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', otherIds);

  (profiles || []).forEach((p) => {
    if (convMap[p.id]) {
      convMap[p.id].user = {
        id: p.id,
        name: p.name || 'Unknown',
        avatar: p.avatar_url || '',
      };
    }
  });

  // Ensure every conversation has a user object
  for (const id of otherIds) {
    if (!convMap[id].user) {
      convMap[id].user = { id, name: 'Unknown', avatar: '' };
    }
  }

  return Object.values(convMap);
};

/* ─── Helper ──────────────────────────────────────── */
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
