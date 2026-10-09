'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchUrls } from '@/lib/api';
import './history-table.css';

const PAGE_SIZE = 10;

function formatDate(isoString) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString));
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      // เบราว์เซอร์ไม่อนุญาต clipboard: ข้ามไป ผู้ใช้ยังคัดลอกจากลิงก์ได้เอง
    }
  }

  return (
    <button
      type="button"
      className="btn btn-secondary btn-small"
      onClick={handleCopy}
    >
      {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
    </button>
  );
}

export default function HistoryTable() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    fetchUrls({ page, limit: PAGE_SIZE })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  if (error) {
    return (
      <div>
        <p className="error-box" role="alert">
          {error}
        </p>
        <button type="button" className="btn btn-primary" onClick={reload}>
          ลองใหม่
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="state-box">กำลังโหลดข้อมูล...</div>;
  }

  if (data.total === 0) {
    return (
      <div className="state-box">
        <p>ยังไม่มีลิงก์ที่สร้างไว้</p>
        <Link href="/" className="btn btn-primary">
          สร้างลิงก์แรก
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="toolbar">
        <span className="toolbar-total">ทั้งหมด {data.total} ลิงก์</span>
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={reload}
          disabled={loading}
        >
          {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
        </button>
      </div>

      <div className={`table-wrap${loading ? ' is-loading' : ''}`}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Short URL</th>
              <th>URL ต้นฉบับ</th>
              <th>สร้างเมื่อ</th>
              <th className="cell-num">จำนวนคลิก</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td className="cell-short">
                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.shortUrl}
                  </a>
                </td>
                <td>
                  <span className="cell-url" title={item.originalUrl}>
                    {item.originalUrl}
                  </span>
                </td>
                <td className="cell-date">{formatDate(item.createdAt)}</td>
                <td className="cell-num">
                  <span className="count-badge">{item.clickCount}</span>
                </td>
                <td>
                  <CopyButton text={item.shortUrl} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          ก่อนหน้า
        </button>
        <span>
          หน้า {data.page} จาก {data.totalPages}
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
          disabled={page >= data.totalPages || loading}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}