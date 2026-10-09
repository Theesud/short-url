const TOKEN_KEY = 'shorturl_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

export function setToken(token) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    // เก็บไม่ได้: ผู้ใช้ยังใช้งานได้ในรอบนี้ แต่จะไม่จำการล็อกอิน
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    // ไม่มีอะไรต้องทำ
  }
}