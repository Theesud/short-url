const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { register, login, me } = require('./auth.controller');
const { requireAuth } = require('./auth.middleware');

const router = express.Router();

function createLimiter(windowMs, limit, message) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: message }),
  });
}

const loginLimiter = createLimiter(
  15 * 60 * 1000,
  20,
  'ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่'
);

const registerLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'สมัครสมาชิกหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่'
);

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', requireAuth, me);


module.exports = router;