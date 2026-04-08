const { supabase } = require('../supabase');

/**
 * Express middleware that verifies a Supabase JWT from the Authorization header
 * and attaches the authenticated user to `req.user`.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = header.slice(7);

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
