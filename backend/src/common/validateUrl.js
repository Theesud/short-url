const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

function validateOriginalUrl(input, ownBaseUrl) {
  if (typeof input !== 'string' || input.trim() === '') {
    return { ok: false, message: 'กรุณากรอก URL' };
  }

  const value = input.trim();

  if (value.length > MAX_URL_LENGTH) {
    return { ok: false, message: 'URL ยาวเกินไป' };
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch (error) {
    return {
      ok: false,
      message: 'รูปแบบ URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)',
    };
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return { ok: false, message: 'รองรับเฉพาะ URL แบบ http หรือ https' };
  }

  if (ownBaseUrl) {
    try {
      const own = new URL(ownBaseUrl);
      if (parsed.host === own.host) {

        return { ok: false, message: 'ไม่สามารถย่อลิงก์ของระบบนี้ซ้ำได้' };
      }
    } catch (error) {
      // ownBaseUrl ตั้งค่าผิดรูปแบบ: ข้ามการตรวจส่วนนี้
    }
  }

  return { ok: true, value };
}

module.exports = { validateOriginalUrl };