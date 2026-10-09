function getBaseUrl(req) {
  const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return base.replace(/\/+$/, '');
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

module.exports = { getBaseUrl, parsePositiveInt };