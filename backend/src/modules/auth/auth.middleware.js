const { verifyToken } = require('../../common/jwt');

const INVALID_SESSION_MESSAGE =
  'เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่';

function readBearerToken(req) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme && scheme.toLowerCase() === 'bearer' && token) {
    return token;
  }
  return null;
}

function optionalAuth(req, res, next) {
  const token = readBearerToken(req);
  if (!token) return next();

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: INVALID_SESSION_MESSAGE });
  }
}

function requireAuth(req, res, next) {
  const token = readBearerToken(req);

  if (!token) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });

  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: INVALID_SESSION_MESSAGE });
  }
}

module.exports = { optionalAuth, requireAuth };