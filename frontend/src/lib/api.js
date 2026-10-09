const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/+$/, '');

export async function createShortUrl(originalUrl) {
  let response;

  try {
    response = await fetch(`${API_URL}/api/urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl }),
    });
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