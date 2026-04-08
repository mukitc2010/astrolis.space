const express = require('express');
const router = express.Router();

const { supabaseAdmin } = require('../supabase');
const { requireAuth } = require('../middleware/auth');

// PATCH /profiles/me  — must be defined before /:username
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['display_name', 'bio', 'avatar_url'];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

// GET /profiles/:username
router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Follower / following counts
    const [{ count: followers_count }, { count: following_count }] =
      await Promise.all([
        supabaseAdmin
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profile.id),
        supabaseAdmin
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profile.id),
      ]);

    res.json({ profile: { ...profile, followers_count, following_count } });
  } catch (err) {
    next(err);
  }
});

// POST /profiles/:id/follow
router.post('/:id/follow', requireAuth, async (req, res, next) => {
  try {
    const { id: following_id } = req.params;
    const follower_id = req.user.id;

    if (follower_id === following_id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const { error } = await supabaseAdmin.from('follows').insert({
      follower_id,
      following_id,
    });

    if (error) {
      // Unique constraint violation means already following
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Already following this user' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Followed' });
  } catch (err) {
    next(err);
  }
});

// DELETE /profiles/:id/follow
router.delete('/:id/follow', requireAuth, async (req, res, next) => {
  try {
    const { id: following_id } = req.params;
    const follower_id = req.user.id;

    const { error } = await supabaseAdmin
      .from('follows')
      .delete()
      .eq('follower_id', follower_id)
      .eq('following_id', following_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Unfollowed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
