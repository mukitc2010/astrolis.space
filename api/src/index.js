const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');

// ── Route imports ───────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const postRoutes = require('./routes/posts');
const { commentsOnPost, commentsRoot } = require('./routes/comments');

// ── App setup ───────────────────────────────────────────────────────────────
const app = express();

// Security & parsing
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGINS
      ? config.CORS_ORIGINS.split(',')
      : ['http://localhost:3000'],
  })
);
app.use(morgan('dev'));
app.use(express.json());

// Global rate limiter — 100 requests per minute per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/profiles', profileRoutes);
app.use('/posts', postRoutes);
app.use('/posts/:postId/comments', commentsOnPost);
app.use('/comments', commentsRoot);

// ── Error handler ───────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ── Start server ────────────────────────────────────────────────────────────
const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Astrolis API listening on port ${PORT}`);
});

module.exports = app;
