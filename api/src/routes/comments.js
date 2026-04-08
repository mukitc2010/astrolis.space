const express = require('express');

const { supabaseAdmin } = require('../supabase');
const { requireAuth } = require('../middleware/auth');

// ── Comment creation router (mounted at /posts/:postId/comments) ────────────

const commentsOnPost = express.Router({ mergeParams: true });

// POST /posts/:postId/comments
commentsOnPost.post('/', requireAuth, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parent_id } = req.body;

    if (!content || content.length < 1 || content.length > 2000) {
      return res
        .status(400)
        .json({ error: 'content must be between 1 and 2000 characters' });
    }

    // Verify the post exists
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const row = {
      post_id: postId,
      author_id: req.user.id,
      content,
    };

    if (parent_id) row.parent_id = parent_id;

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert(row)
      .select('*, author:profiles!author_id(*)')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
});

// ── Comment deletion router (mounted at /comments) ─────────────────────────

const commentsRoot = express.Router();

// DELETE /comments/:id
commentsRoot.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('comments')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (existing.author_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: 'Not authorized to delete this comment' });
    }

    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = { commentsOnPost, commentsRoot };
