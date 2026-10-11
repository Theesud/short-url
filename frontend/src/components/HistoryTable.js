'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteUrl, fetchUrls } from '@/lib/api';
import './history-table.css';

const PAGE_SIZE = 10;

function formatDate(isoString) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString));
}

// แสดงลิงก์โดยตัด http:// หรือ https:// ออกเพื่อประหยัดพื้นที่ (ลิงก์จริงยังครบ)
function displayUrl(url) {
  return url.replace(/^https?:\/\//i, '');
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
      className="btn btn-primary btn-small btn-copy"
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
  const [confirmingCode, setConfirmingCode] = useState(null);
  const [deletingCode, setDeletingCode] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchUrls({ page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError('');
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

  function goToPage(nextPage) {
    if (nextPage === page) return;
    setLoading(true);
    setError('');
    setConfirmingCode(null);
    setPage(nextPage);
  }

  function reload() {
    setLoading(true);
    setError('');
    setReloadKey((key) => key + 1);
  }

  async function handleDelete(item) {
    setDeletingCode(item.shortCode);
    setActionError('');

    try {
      await deleteUrl(item.shortCode);
      setConfirmingCode(null);

      if (data.items.length === 1 && page > 1) {
        goToPage(page - 1);
      } else {
        reload();
      }
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingCode(null);
    }
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
        <div className="state-actions">
          <Link href="/" className="btn btn-primary">
            สร้างลิงก์แรก
          </Link>
        </div>
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

      {actionError && (
        <p className="error-box" role="alert">
          {actionError}
        </p>
      )}

      <div className={`table-wrap${loading ? ' is-loading' : ''}`}>
        <table className="data-table">
          <colgroup>
            <col className="col-short" />
            <col className="col-original" />
            <col className="col-created" />
            <col className="col-expires" />
            <col className="col-clicks" />
            <col className="col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Short URL</th>
              <th>URL ต้นฉบับ</th>
              <th>สร้างเมื่อ</th>
              <th>หมดอายุ</th>
              <th>จำนวนคลิก</th>
              <th>
                <span className="sr-only">การดำเนินการ</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => {
              const confirming = confirmingCode === item.shortCode;
              const deleting = deletingCode === item.shortCode;

              return (
                <tr key={item.id}>
                  <td className="cell-short" data-label="Short URL">
                    <div className="cell-body">
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item.shortUrl}
                      >
                        {displayUrl(item.shortUrl)}
                      </a>
                    </div>
                  </td>
                  <td data-label="URL ต้นฉบับ">
                    <div className="cell-body">
                      <span className="cell-url" title={item.originalUrl}>
                        {displayUrl(item.originalUrl)}
                      </span>
                    </div>
                  </td>
                  <td className="cell-date" data-label="สร้างเมื่อ">
                    <div className="cell-body">
                      {formatDate(item.createdAt)}
                    </div>
                  </td>
                  <td className="cell-date" data-label="หมดอายุ">
                    <div className="cell-body">
                      {item.expiresAt ? (
                        <>
                          {formatDate(item.expiresAt)}
                          {item.expired && (
                            <span className="badge badge-expired">
                              หมดอายุแล้ว
                            </span>
                          )}
                        </>
                      ) : (
                        'ไม่หมดอายุ'
                      )}
                    </div>
                  </td>
                  <td className="cell-num" data-label="จำนวนคลิก">
                    <div className="cell-body">
                      <span className="count-badge">{item.clickCount}</span>
                    </div>
                  </td>
                  <td className="cell-actions">
                    <div
                      className={`row-actions${confirming ? ' is-confirming' : ''}`}
                    >
                      {confirming ? (
                        <>
                          <span className="confirm-text">ลบลิงก์และสถิติ?</span>
                          <div className="confirm-buttons">
                            <button
                              type="button"
                              className="btn btn-danger btn-small"
                              onClick={() => handleDelete(item)}
                              disabled={deleting}
                            >
                              {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => setConfirmingCode(null)}
                              disabled={deleting}
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <CopyButton text={item.shortUrl} />
                          <Link
                            href={`/stats/${item.shortCode}`}
                            className="btn btn-secondary btn-small"
                          >
                            สถิติ
                          </Link>
                          <button
                            type="button"
                            className="btn btn-danger btn-small"
                            onClick={() => {
                              setActionError('');
                              setConfirmingCode(item.shortCode);
                            }}
                          >
                            ลบ
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => goToPage(Math.max(1, page - 1))}
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
          onClick={() => goToPage(Math.min(data.totalPages, page + 1))}
          disabled={page >= data.totalPages || loading}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}