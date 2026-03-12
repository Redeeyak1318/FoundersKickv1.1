import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as postsService from '../services/postsService.js';
import { supabaseAdmin } from '../config/supabaseClient.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch latest posts (real data from DB)
    let posts = [];
    try {
      posts = await postsService.getPosts(userId);
    } catch (e) {
      // posts table may not exist yet
    }

    // Trending topics — empty for now (no dedicated table yet)
    const trending = [];

    // Connection suggestions — fetch other profiles (not self, limit 5)
    let connections = [];
    try {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, name, avatar_url, bio, location')
        .neq('id', userId)
        .limit(5);
      connections = (profiles || []).map((p) => ({
        id: p.id,
        user: {
          name: p.name || 'Unnamed',
          avatar: p.avatar_url || '',
        },
        industry: p.location || '',
      }));
    } catch (e) {
      // graceful fallback
    }

    // Status metrics — real counts from DB
    let status = null;
    try {
      const { count: connCount } = await supabaseAdmin
        .from('connections')
        .select('id', { count: 'exact', head: true })
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted');

      const { count: postCount } = await supabaseAdmin
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      status = {
        networkValue: `${connCount || 0} connections`,
        progress: Math.min(100, (connCount || 0) * 10),
        rank: postCount ? `${postCount} posts` : '—',
      };
    } catch (e) {
      status = { networkValue: '—', progress: 0, rank: '—' };
    }

    res.json({ posts, trending, connections, status });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;