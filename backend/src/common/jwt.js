const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (
  !JWT_SECRET ||
  JWT_SECRET.length < 32 ||
  JWT_SECRET.startsWith('change-me')
) {
  throw new Error(
    'JWT_SECRET is missing, too short, or still the example value. Set a long random value in backend/.env'
  );
}

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: EXPIRES_IN,
  });
}

function verifyToken(token) {
  const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  const id = Number(payload.sub);

  if (!Number.isInteger(id)) {
    throw new Error('Invalid token subject');
  }

  return { id };
}


module.exports = { signToken, verifyToken };