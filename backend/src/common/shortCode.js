const crypto = require('crypto');

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const DEFAULT_LENGTH = 7;

// รูปแบบรหัสลิงก์ที่ถูกต้อง (ทั้งรหัสสุ่มและ alias)
const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

function generateShortCode(length = DEFAULT_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  return code;
}

module.exports = { generateShortCode, SHORT_CODE_PATTERN };