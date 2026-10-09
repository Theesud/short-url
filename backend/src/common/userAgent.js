function parseUserAgent(userAgent) {
  const ua = userAgent || '';

  if (!ua) {
    return { browser: 'ไม่ทราบ', os: 'ไม่ทราบ', device: 'ไม่ทราบ' };
  }

  let browser = 'อื่น ๆ';
  if (/curl|wget|PowerShell|Postman|python-requests|axios|node-fetch|bot|crawler|spider/i.test(ua)) {
    browser = 'บอต/เครื่องมือ';
  } else if (/Edg(e|A|iOS)?\//.test(ua)) {
    browser = 'Edge';
  } else if (/OPR\/|Opera/.test(ua)) {
    browser = 'Opera';
  } else if (/Firefox\/|FxiOS\//.test(ua)) {
    browser = 'Firefox';
  } else if (/Chrome\/|CriOS\//.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari\//.test(ua)) {
    browser = 'Safari';
  }

  let os = 'อื่น ๆ';
  if (/Windows/.test(ua)) {
    os = 'Windows';
  } else if (/Android/.test(ua)) {
    os = 'Android';
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
  } else if (/Mac OS X|Macintosh/.test(ua)) {
    os = 'macOS';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  let device = 'คอมพิวเตอร์';
  if (/iPad|Tablet/i.test(ua)) {
    device = 'แท็บเล็ต';
  } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
    device = 'มือถือ';
  }

  return { browser, os, device };
}

module.exports = { parseUserAgent };