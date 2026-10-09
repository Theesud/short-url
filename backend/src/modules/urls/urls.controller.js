const { validateOriginalUrl } = require('../../common/validateUrl');
const {
  validateAlias,
  parseExpiresInDays,
} = require('../../common/linkOptions');
const { SHORT_CODE_PATTERN } = require('../../common/shortCode');
const { getBaseUrl, parsePositiveInt } = require('../../common/http');
const urlsService = require('./urls.service');
const analyticsService = require('../analytics/analytics.service');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

function serializeUrl(url, baseUrl) {
  return {
    id: url.id,
    shortCode: url.shortCode,
    shortUrl: `${baseUrl}/${url.shortCode}`,
    originalUrl: url.originalUrl,
    createdAt: url.createdAt,
    expiresAt: url.expiresAt,
    expired: Boolean(url.expiresAt && url.expiresAt.getTime() <= Date.now()),
  };
}

async function createUrl(req, res) {
  const body = req.body || {};
  const baseUrl = getBaseUrl(req);

  const urlResult = validateOriginalUrl(body.originalUrl, baseUrl);
  if (!urlResult.ok) {
    return res.status(400).json({ error: urlResult.message });
  }

  const aliasResult = validateAlias(body.alias);
  if (!aliasResult.ok) {
    return res.status(400).json({ error: aliasResult.message });
  }

  const expiryResult = parseExpiresInDays(body.expiresInDays);
  if (!expiryResult.ok) {
    return res.status(400).json({ error: expiryResult.message });
  }

  const expiresAt = expiryResult.value
    ? new Date(Date.now() + expiryResult.value * DAY_MS)
    : null;

  try {
    const userId = req.user ? req.user.id : null;
    const url = await urlsService.createShortUrl(urlResult.value, userId, {
      alias: aliasResult.value,
      expiresAt,
    });

    return res
      .status(201)
      .json({ ...serializeUrl(url, baseUrl), owned: userId !== null });
  } catch (error) {
    if (error instanceof urlsService.AliasTakenError) {
      return res.status(409).json({
        error: 'ชื่อลิงก์นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น',
      });
    }

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
        ...serializeUrl(url, baseUrl),
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

async function deleteUrl(req, res) {
  const { code } = req.params;

  if (!SHORT_CODE_PATTERN.test(code)) {
    return res.status(404).json({ error: 'ไม่พบลิงก์นี้' });
  }

  try {
    const deleted = await urlsService.deleteOwnedUrl(req.user.id, code);

    if (!deleted) {
      return res.status(404).json({ error: 'ไม่พบลิงก์นี้' });
    }

    return res.status(204).end();
  } catch (error) {
    console.error('Failed to delete URL:', error);
    return res
      .status(500)
      .json({ error: 'ไม่สามารถลบลิงก์ได้ กรุณาลองใหม่อีกครั้ง' });
  }
}

module.exports = { createUrl, listUrls, deleteUrl };