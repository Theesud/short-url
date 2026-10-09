const { getBaseUrl, parsePositiveInt } = require('../../common/http');
const urlsService = require('../urls/urls.service');
const analyticsService = require('./analytics.service');

const CODE_PATTERN = /^[A-Za-z0-9]{1,32}$/;
const DEFAULT_DAYS = 14;
const MAX_DAYS = 90;

async function getUrlStats(req, res) {
  const { code } = req.params;

  if (!CODE_PATTERN.test(code)) {
    return res.status(404).json({ error: 'ไม่พบลิงก์นี้' });
  }

  const days = Math.min(parsePositiveInt(req.query.days, DEFAULT_DAYS), MAX_DAYS);

  try {
    const url = await urlsService.findByShortCode(code);

    if (!url) {
      return res.status(404).json({ error: 'ไม่พบลิงก์นี้' });
    }

    const stats = await analyticsService.getClickStats(url.id, {
      days,
      timeZone: process.env.STATS_TIMEZONE,
    });

    return res.json({
      url: {
        shortCode: url.shortCode,

        shortUrl: `${getBaseUrl(req)}/${url.shortCode}`,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt,
      },
      ...stats,
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return res
      .status(500)
      .json({ error: 'ไม่สามารถโหลดสถิติได้ กรุณาลองใหม่อีกครั้ง' });
  }
}

module.exports = { getUrlStats };