'use client';

import { useRef, useState } from 'react';

export default function ResultCard({ result }) {
  const inputRef = useRef(null);
  const [copied, setCopied] = useState(false);

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
    </section>
  );
}