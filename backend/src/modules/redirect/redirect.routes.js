const express = require('express');
const urlsService = require('../urls/urls.service');
const { bus, EVENTS } = require('../../events/eventBus');

const router = express.Router();

const CODE_PATTERN = /^[A-Za-z0-9]{1,32}$/;

router.get('/:code', async (req, res) => {
  const { code } = req.params;

  if (!CODE_PATTERN.test(code)) {
    return res.status(404).json({ error: 'ไม่พบลิงก์นี้' });
  }

  try {
    const url = await urlsService.findByShortCode(code);

    if (!url) {
      return res.status(404).json({ error: 'ไม่พบลิงก์นี้' });
    }

    bus.emit(EVENTS.URL_VISITED, {
      urlId: url.id,
      ipAddress: req.ip || null,
      userAgent: req.get('user-agent') || null,
      referer: req.get('referer') || null,
    });

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.error('Redirect failed:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบ' });
  }
});

module.exports = router;