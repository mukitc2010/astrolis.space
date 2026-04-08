const express = require('express');
const router = express.Router();

const { supabaseAdmin } = require('../supabase');
const { requireAuth } = require('../middleware/auth');
const { paginatedQuery } = require('../lib/pagination');

// GET /posts/feed  — must be defined before /:id
router.get('/feed', requireAuth, async (req, res, next) => {
  try {
    const { cursor, limit: rawLimit } = req.query;
    const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 20, 1), 50);

    // Get IDs the current user follows
    const { data: followRows, error: followError } = await supabaseAdmin
      .from('follows')
      .select('following_id')
      .eq('follower_id', req.user.id);

    if (followError) throw followError;

    const feedUserIds = [
      req.user.id,
      ...followRows.map((r) => r.following_id),
    ];

    let query = supabaseAdmin
      .from('posts')
      .select('*, author:profiles!author_id(*)')
      .in('author_id', feedUserIds);

    const { data: posts, next_cursor } = await paginatedQuery(
      query,
      cursor || null,
      limit
    );

    res.json({ posts, next_cursor });
  } catch (err) {
    next(err);
  }
});

// POST /posts
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { content, post_type, tags } = req.body;

    if (!content || content.length < 1 || content.length > 5000) {
      return res
        .status(400)
        .json({ error: 'content must be between 1 and 5000 characters' });
    }

    const row = {
      author_id: req.user.id,
      content,
    };

    if (post_type) row.post_type = post_type;
    if (tags) row.tags = tags;

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert(row)
      .select('*, author:profiles!author_id(*)')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select('*, author:profiles!author_id(*)')
      .eq('id', id)
      .single();

    if (error || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Fetch comments with their authors
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select('*, author:profiles!author_id(*)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    res.json({ post: { ...post, comments } });
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existing.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);

    if (error) throw error;

    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /posts/:id/like  — toggle like
router.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const { id: post_id } = req.params;
    const user_id = req.user.id;

    // Check if the like already exists
    const { data: existingLike } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user_id)
      .maybeSingle();

    let liked;

    if (existingLike) {
      // Unlike
      const { error } = await supabaseAdmin
        .from('likes')
        .delete()
        .eq('id', existingLike.id);

      if (error) throw error;
      liked = false;
    } else {
      // Like
      const { error } = await supabaseAdmin
        .from('likes')
        .insert({ post_id, user_id });

      if (error) throw error;
      liked = true;
    }

    // Update likes_count on the post
    const { count } = await supabaseAdmin
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post_id);

    await supabaseAdmin
      .from('posts')
      .update({ likes_count: count })
      .eq('id', post_id);

    res.json({ liked, likes_count: count });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
