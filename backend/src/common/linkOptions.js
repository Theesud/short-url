const MIN_ALIAS_LENGTH = 3;
const MAX_ALIAS_LENGTH = 32;
const ALIAS_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_EXPIRES_DAYS = 365;

// ชื่อที่ไม่ให้ตั้งเป็น alias (กันสับสนกับเส้นทางของระบบ)
const RESERVED_ALIASES = new Set([
  'api',
  'health',
  'admin',
  'login',
  'register',
  'history',
  'stats',
  'static',
  'favicon',
  'robots',
  'sitemap',
]);

function validateAlias(input) {
  if (input === undefined || input === null || input === '') {
    return { ok: true, value: null };
  }

  if (typeof input !== 'string') {
    return { ok: false, message: 'ชื่อลิงก์ไม่ถูกต้อง' };
  }

  const value = input.trim();

  if (value === '') {
    return { ok: true, value: null };
  }

  if (value.length < MIN_ALIAS_LENGTH || value.length > MAX_ALIAS_LENGTH) {
    return {
      ok: false,
      message: `ชื่อลิงก์ต้องยาว ${MIN_ALIAS_LENGTH}–${MAX_ALIAS_LENGTH} ตัวอักษร`,
    };
  }

  if (!ALIAS_PATTERN.test(value)) {
    return {
      ok: false,
      message: 'ชื่อลิงก์ใช้ได้เฉพาะ a-z, A-Z, 0-9, - และ _ เท่านั้น',
    };
  }

  if (RESERVED_ALIASES.has(value.toLowerCase())) {
    return { ok: false, message: 'ชื่อนี้ถูกสงวนไว้ กรุณาเลือกชื่ออื่น' };
  }

  return { ok: true, value };
}

function parseExpiresInDays(input) {
  if (input === undefined || input === null || input === '') {
    return { ok: true, value: null };
  }

  const days = Number(input);

  if (!Number.isInteger(days) || days < 1 || days > MAX_EXPIRES_DAYS) {
    return {
      ok: false,
      message: `วันหมดอายุต้องเป็นจำนวนเต็ม 1–${MAX_EXPIRES_DAYS} วัน`,
    };
  }

  return { ok: true, value: days };
}

module.exports = { validateAlias, parseExpiresInDays };