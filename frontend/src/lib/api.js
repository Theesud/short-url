import { clearToken, getToken } from './authStorage';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/+$/, '');

async function request(path, options = {}) {
  const { auth = true, ...fetchOptions } = options;
  const token = auth ? getToken() : null;

  const headers = { ...(fetchOptions.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
  } catch (error) {
    throw new Error(
      'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า backend กำลังทำงานอยู่'
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // ตอบกลับมาไม่ใช่ JSON (เช่น 204 ไม่มีเนื้อหา): ปล่อยเป็น null
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event('auth:expired'));
    }

    const error = new Error(
      (data && data.error) || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

function jsonBody(payload) {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

export function registerUser(email, password) {
  return request('/api/auth/register', {
    method: 'POST',
    auth: false,
    ...jsonBody({ email, password }),
  });
}

export function loginUser(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    auth: false,
    ...jsonBody({ email, password }),
  });
}

export function fetchMe() {
  return request('/api/auth/me', { cache: 'no-store' });
}

export function createShortUrl({ originalUrl, alias, expiresInDays }) {
  const payload = { originalUrl };
  if (alias) payload.alias = alias;
  if (expiresInDays) payload.expiresInDays = Number(expiresInDays);

  return request('/api/urls', {
    method: 'POST',
    ...jsonBody(payload),
  });
}

export function fetchUrls({ page = 1, limit = 10 } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return request(`/api/urls?${query}`, { cache: 'no-store' });
}

export function deleteUrl(code) {
  return request(`/api/urls/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  });
}

export function fetchUrlStats(code, { days = 14 } = {}) {
  const query = new URLSearchParams({ days: String(days) });
  return request(`/api/urls/${encodeURIComponent(code)}/stats?${query}`, {
    cache: 'no-store',
  });
}