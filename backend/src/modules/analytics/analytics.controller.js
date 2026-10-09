const { getBaseUrl, parsePositiveInt } = require('../../common/http');
const { SHORT_CODE_PATTERN } = require('../../common/shortCode');
const urlsService = require('../urls/urls.service');
const analyticsService = require('./analytics.service');

const DEFAULT_DAYS = 14;
const MAX_DAYS = 90;

async function getUrlStats(req, res) {
  const { code } = req.params;

  if (!SHORT_CODE_PATTERN.test(code)) {
    return res.status(404).json({ error: 'ไม่พบลิงก์นี้' });
  }

  const days = Math.min(parsePositiveInt(req.query.days, DEFAULT_DAYS), MAX_DAYS);

  try {
    const url = await urlsService.findByShortCode(code);

    if (!url || url.userId !== req.user.id) {
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
        expiresAt: url.expiresAt,
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