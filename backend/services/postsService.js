import { supabaseAdmin } from '../config/supabaseClient.js';

const POSTS = 'posts';
const LIKES = 'post_likes';
const COMMENTS = 'post_comments';

/**
 * Create a new post.
 */
export const createPost = async (userId, content) => {
  const { data: post, error } = await supabaseAdmin
    .from(POSTS)
    .insert({ user_id: userId, content: content.trim() })
    .select()
    .single();
  if (error) throw error;

  // Attach author profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name, avatar_url, bio, location')
    .eq('id', userId)
    .single();

  return {
    ...post,
    author: {
      name: profile?.name || 'Unknown',
      avatar: profile?.avatar_url || '',
      role: '',
      company: '',
    },
    likes: 0,
    comments: 0,
    shares: 0,
    liked: false,
    isOwner: true,
    commentList: [],
  };
};

/**
 * Get all posts (newest first) with author info, like/comment counts,
 * and whether the current user has liked each post.
 */
export const getPosts = async (currentUserId) => {
  const { data: posts, error } = await supabaseAdmin
    .from(POSTS)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  if (!posts || posts.length === 0) return [];

  // Gather all post IDs and user IDs
  const postIds = posts.map((p) => p.id);
  const userIds = [...new Set(posts.map((p) => p.user_id))];

  // Batch fetch profiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', userIds);
  const profileMap = {};
  (profiles || []).forEach((p) => { profileMap[p.id] = p; });

  // Batch fetch like counts
  const { data: likeCounts } = await supabaseAdmin
    .from(LIKES)
    .select('post_id')
    .in('post_id', postIds);
  const likeCountMap = {};
  (likeCounts || []).forEach((l) => {
    likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1;
  });

  // Batch fetch current user's likes
  const { data: myLikes } = await supabaseAdmin
    .from(LIKES)
    .select('post_id')
    .eq('user_id', currentUserId)
    .in('post_id', postIds);
  const myLikeSet = new Set((myLikes || []).map((l) => l.post_id));

  // Batch fetch comment counts
  const { data: commentCounts } = await supabaseAdmin
    .from(COMMENTS)
    .select('post_id')
    .in('post_id', postIds);
  const commentCountMap = {};
  (commentCounts || []).forEach((c) => {
    commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
  });

  return posts.map((post) => {
    const profile = profileMap[post.user_id] || {};
    return {
      id: post.id,
      content: post.content,
      image: post.image || null,
      created_at: post.created_at,
      timestamp: timeAgo(post.created_at),
      author: {
        name: profile.name || 'Unknown',
        avatar: profile.avatar_url || '',
        role: '',
        company: '',
      },
      likes: likeCountMap[post.id] || 0,
      liked: myLikeSet.has(post.id),
      comments: commentCountMap[post.id] || 0,
      shares: 0,
      isOwner: post.user_id === currentUserId,
      commentList: [],
    };
  });
};

/**
 * Toggle like on a post. Returns new like count and liked state.
 */
export const toggleLike = async (userId, postId) => {
  // Check if already liked
  const { data: existing } = await supabaseAdmin
    .from(LIKES)
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    // Unlike
    await supabaseAdmin.from(LIKES).delete().eq('id', existing.id);
  } else {
    // Like
    await supabaseAdmin.from(LIKES).insert({ post_id: postId, user_id: userId });
  }

  // Get new count
  const { count } = await supabaseAdmin
    .from(LIKES)
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  return { likes: count || 0, liked: !existing };
};

/**
 * Add a comment to a post.
 */
export const addComment = async (userId, postId, text) => {
  const { data: comment, error } = await supabaseAdmin
    .from(COMMENTS)
    .insert({ post_id: postId, user_id: userId, text: text.trim() })
    .select()
    .single();
  if (error) throw error;

  // Attach author
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', userId)
    .single();

  // Get new comment count
  const { count } = await supabaseAdmin
    .from(COMMENTS)
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  return {
    comment: {
      id: comment.id,
      text: comment.text,
      created_at: comment.created_at,
      author: { name: profile?.name || 'Unknown', avatar: profile?.avatar_url || '' },
    },
    comments: count || 0,
  };
};

/**
 * Delete a post (only owner).
 */
export const deletePost = async (userId, postId) => {
  const { data: post, error: fetchErr } = await supabaseAdmin
    .from(POSTS)
    .select('user_id')
    .eq('id', postId)
    .single();
  if (fetchErr) throw fetchErr;

  if (post.user_id !== userId) {
    const err = new Error('Forbidden: you can only delete your own posts');
    err.statusCode = 403;
    throw err;
  }

  // Cascade will handle likes/comments due to FK ON DELETE CASCADE
  const { error } = await supabaseAdmin.from(POSTS).delete().eq('id', postId);
  if (error) throw error;
  return true;
};

/* ─── Helpers ──────────────────────────────────────── */
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
