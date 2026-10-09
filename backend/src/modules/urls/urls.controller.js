const { validateOriginalUrl } = require('../../common/validateUrl');
const urlsService = require('./urls.service');

function getBaseUrl(req) {
  const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return base.replace(/\/+$/, '');
}

async function createUrl(req, res) {
  const baseUrl = getBaseUrl(req);
  const result = validateOriginalUrl(req.body && req.body.originalUrl, baseUrl);

  if (!result.ok) {
    return res.status(400).json({ error: result.message });
  }

  try {
    const url = await urlsService.createShortUrl(result.value);

    return res.status(201).json({
      id: url.id,
      shortCode: url.shortCode,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
    });
  } catch (error) {
    console.error('Failed to create short URL:', error);
    return res
      .status(500)
      .json({ error: 'ไม่สามารถสร้าง Short URL ได้ กรุณาลองใหม่อีกครั้ง' });
  }
}

module.exports = { createUrl };