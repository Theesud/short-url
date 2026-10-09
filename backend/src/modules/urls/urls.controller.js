const { validateOriginalUrl } = require('../../common/validateUrl');
const { getBaseUrl, parsePositiveInt } = require('../../common/http');
const urlsService = require('./urls.service');
const analyticsService = require('../analytics/analytics.service');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

async function createUrl(req, res) {
  const baseUrl = getBaseUrl(req);
  const result = validateOriginalUrl(req.body && req.body.originalUrl, baseUrl);

  if (!result.ok) {
    return res.status(400).json({ error: result.message });
  }

  try {
    const userId = req.user ? req.user.id : null;
    const url = await urlsService.createShortUrl(result.value, userId);

    return res.status(201).json({
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      owned: userId !== null,
    });
  } catch (error) {
    console.error('Failed to create short URL:', error);
    return res
      .status(500)

      .json({ error: 'ไม่สามารถสร้าง Short URL ได้ กรุณาลองใหม่อีกครั้ง' });
  }
}

async function listUrls(req, res) {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(
    parsePositiveInt(req.query.limit, DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const baseUrl = getBaseUrl(req);

  try {
    const { items, total } = await urlsService.listUrls({
      page,
      limit,
      userId: req.user.id,
    });
    const clickCounts = await analyticsService.countClicksByUrlIds(
      items.map((url) => url.id)
    );

    return res.json({
      items: items.map((url) => ({
        id: url.id,
        shortCode: url.shortCode,
        shortUrl: `${baseUrl}/${url.shortCode}`,
        originalUrl: url.originalUrl,
        createdAt: url.createdAt,
        clickCount: clickCounts[url.id] || 0,
      })),
      page,

      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error('Failed to list URLs:', error);
    return res
      .status(500)
      .json({ error: 'ไม่สามารถโหลดประวัติได้ กรุณาลองใหม่อีกครั้ง' });
  }
}

module.exports = { createUrl, listUrls };