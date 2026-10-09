'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import './result-card.css';

function formatDateTime(isoString) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString));
}

export default function ResultCard({ result }) {
  const inputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(result.shortUrl, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#14284b', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [result.shortUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
    } catch (error) {
      if (inputRef.current) {
        inputRef.current.select();
        document.execCommand('copy');
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="result-card" aria-live="polite">
      <p className="result-label">ลิงก์ที่ย่อแล้ว</p>

      <div className="result-row">
        <input
          ref={inputRef}
          className="result-input"
          readOnly
          value={result.shortUrl}
          aria-label="Short URL"
          onFocus={(event) => event.target.select()}
        />
        <button type="button" className="btn btn-primary" onClick={handleCopy}>
          {copied ? 'คัดลอกแล้ว ✓' : 'คัดลอก'}
        </button>
        <a
          className="btn btn-secondary"
          href={result.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          เปิดลิงก์
        </a>
      </div>

      <p className="result-original" title={result.originalUrl}>
        ปลายทาง: {result.originalUrl}
      </p>

      {result.expiresAt && (
        <p className="result-note">
          ลิงก์นี้จะหมดอายุเมื่อ {formatDateTime(result.expiresAt)}
        </p>
      )}

      {result.owned ? (
        <p className="result-note">
          บันทึกลิงก์นี้ในบัญชีของคุณแล้ว{' '}
          <Link href={`/stats/${result.shortCode}`}>ดูสถิติของลิงก์นี้ →</Link>
        </p>
      ) : (
        <p className="result-note">
          ลิงก์นี้ใช้งานได้ แต่สร้างโดยไม่ได้เข้าสู่ระบบ จึงไม่อยู่ในประวัติและดูสถิติไม่ได้{' '}
          <Link href="/login">เข้าสู่ระบบ</Link> หรือ{' '}
          <Link href="/register">สมัครสมาชิก</Link> เพื่อเก็บลิงก์ครั้งต่อไป
        </p>
      )}

      <div className="qr-block">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="qr-image"
            src={qrDataUrl}
            alt={`QR Code ของ ${result.shortUrl}`}
            width={140}
            height={140}
          />
        ) : (
          <div className="qr-image qr-placeholder">
            {qrFailed ? 'สร้าง QR ไม่สำเร็จ' : 'กำลังสร้าง QR...'}
          </div>
        )}

        <div className="qr-text">
          <p className="qr-title">QR Code</p>
          <p className="qr-desc">
            สแกนด้วยมือถือเพื่อเปิดลิงก์นี้ (นับเป็นการคลิกด้วย)
          </p>
          {qrDataUrl && (
            <a
              className="btn btn-secondary"
              href={qrDataUrl}
              download={`qr-${result.shortCode}.png`}
            >
              ดาวน์โหลด QR (PNG)
            </a>
          )}
        </div>
      </div>
    </section>
  );
}