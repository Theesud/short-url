const authService = require('./auth.service');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function validateEmail(email) {
  if (!email) return 'กรุณากรอกอีเมล';
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return 'รูปแบบอีเมลไม่ถูกต้อง';
  }
  return null;
}

function validateNewPassword(password) {
  if (typeof password !== 'string' || password === '') {
    return 'กรุณากรอกรหัสผ่าน';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    return 'รหัสผ่านยาวเกินไป';
  }
  return null;
}


function sendError(res, error, logLabel) {
  if (error instanceof authService.AuthError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(logLabel, error);
  return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบ' });
}

async function register(req, res) {
  const body = req.body || {};
  const email = normalizeEmail(body.email);

  const message = validateEmail(email) || validateNewPassword(body.password);
  if (message) {
    return res.status(400).json({ error: message });
  }

  try {
    const result = await authService.register(email, body.password);
    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, error, 'Register failed:');
  }
}

async function login(req, res) {
  const body = req.body || {};
  const email = normalizeEmail(body.email);

  if (!email || typeof body.password !== 'string' || body.password === '') {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }


  try {
    const result = await authService.login(email, body.password);
    return res.json(result);
  } catch (error) {
    return sendError(res, error, 'Login failed:');
  }
}

async function me(req, res) {
  try {
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      return res
        .status(401)
        .json({ error: 'ไม่พบบัญชีผู้ใช้ กรุณาเข้าสู่ระบบใหม่' });
    }

    return res.json({ user });
  } catch (error) {
    return sendError(res, error, 'Get current user failed:');
  }
}

module.exports = { register, login, me };