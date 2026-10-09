const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/+$/, '');

async function request(path, options) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch (error) {
    throw new Error(
      'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า backend กำลังทำงานอยู่'
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // ตอบกลับมาไม่ใช่ JSON: ใช้ข้อความมาตรฐานด้านล่าง
  }

  if (!response.ok) {
    throw new Error(
      (data && data.error) || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    );
  }

  return data;
}

export function createShortUrl(originalUrl) {

  return request('/api/urls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl }),
  });
}

export function fetchUrls({ page = 1, limit = 10 } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return request(`/api/urls?${query}`, { cache: 'no-store' });
}

export function fetchUrlStats(code, { days = 14 } = {}) {
  const query = new URLSearchParams({ days: String(days) });
  return request(`/api/urls/${encodeURIComponent(code)}/stats?${query}`, {
    cache: 'no-store',
  });
}