const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { createUrl, listUrls, deleteUrl } = require('./urls.controller');
const { optionalAuth, requireAuth } = require('../auth/auth.middleware');

const router = express.Router();

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) =>
    res
      .status(429)
      .json({ error: 'สร้างลิงก์ถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' }),
});

router.post('/', createLimiter, optionalAuth, createUrl);
router.get('/', requireAuth, listUrls);
router.delete('/:code', requireAuth, deleteUrl);

module.exports = router;