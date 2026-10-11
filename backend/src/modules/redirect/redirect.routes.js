const express = require('express');
const urlsService = require('../urls/urls.service');
const { SHORT_CODE_PATTERN } = require('../../common/shortCode');
const { bus, EVENTS } = require('../../events/eventBus');

const router = express.Router();

// ไม่ให้เบราว์เซอร์/proxy จำผลของลิงก์สั้น เพื่อให้ทุกครั้งผ่านเซิร์ฟเวอร์
// (ทั้งการตรวจวันหมดอายุและการนับคลิก)
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

function getFrontendUrl() {
  return (process.env.FRONTEND_URL || '').replace(/\/+$/, '');
}

function sendUnavailable(req, res, status, reason, message) {
  const frontendUrl = getFrontendUrl();

  if (frontendUrl && req.accepts(['html', 'json']) === 'html') {
    return res.redirect(302, `${frontendUrl}/link-unavailable?reason=${reason}`);
  }

  return res.status(status).json({ error: message });
}

router.get('/:code', async (req, res) => {
  const { code } = req.params;

  if (!SHORT_CODE_PATTERN.test(code)) {
    return res.status(404).json({ error: 'ไม่พบลิงก์นี้' });
  }

  try {
    const url = await urlsService.findByShortCode(code);

    if (!url) {
      return sendUnavailable(req, res, 404, 'not-found', 'ไม่พบลิงก์นี้');
    }

    if (url.expiresAt && url.expiresAt.getTime() <= Date.now()) {
      return sendUnavailable(req, res, 410, 'expired', 'ลิงก์นี้หมดอายุแล้ว');
    }

    // QR Code ของระบบเก็บลิงก์ที่ต่อท้ายด้วย ?src=qr เพื่อแยกจากการกดลิงก์ปกติ
    const source = req.query.src === 'qr' ? 'qr' : 'link';

    bus.emit(EVENTS.URL_VISITED, {
      urlId: url.id,
      ipAddress: req.ip || null,
      userAgent: req.get('user-agent') || null,
      referer: req.get('referer') || null,
      source,
    });

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error('Redirect failed:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
});

module.exports = router;