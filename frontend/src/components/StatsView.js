'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchUrlStats } from '@/lib/api';
import DailyChart from './DailyChart';
import './stats.css';

const RANGES = [7, 14, 30];

function formatDateTime(isoString) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(isoString));
}

export default function StatsView({ code }) {
  const [days, setDays] = useState(14);
  const [reloadKey, setReloadKey] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchUrlStats(code, { days })
      .then((result) => {
        if (cancelled) return;
        setStats(result);
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
  }, [code, days, reloadKey]);

  function changeDays(nextDays) {
    if (nextDays === days) return;
    setLoading(true);
    setError('');
    setDays(nextDays);
  }

  function reload() {
    setLoading(true);
    setError('');
    setReloadKey((key) => key + 1);
  }

  if (error) {
    return (
      <div>
        <Link href="/history" className="back-link">
          ← กลับไปหน้าประวัติ
        </Link>

        <p className="error-box" role="alert">
          {error}
        </p>
        <div className="stats-actions">
          <button type="button" className="btn btn-primary" onClick={reload}>
            ลองใหม่
          </button>
          <Link href="/history" className="btn btn-secondary">
            กลับไปหน้าประวัติ
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="state-box">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div>
      <Link href="/history" className="back-link">
        ← กลับไปหน้าประวัติ
      </Link>

      <div className="stats-header">
        <h1 className="stats-short">
          <a href={stats.url.shortUrl} target="_blank" rel="noopener noreferrer">
            {stats.url.shortUrl}
          </a>
        </h1>
        <p className="stats-original">ปลายทาง: {stats.url.originalUrl}</p>

        <p className="stats-meta">
          สร้างเมื่อ {formatDateTime(stats.url.createdAt)}
        </p>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-value">{stats.totalClicks}</p>
          <p className="summary-label">คลิกทั้งหมด</p>
        </div>
        <div className="summary-card">
          <p className="summary-value">{stats.summary.today}</p>
          <p className="summary-label">วันนี้</p>
        </div>
        <div className="summary-card">
          <p className="summary-value">{stats.summary.last7Days}</p>
          <p className="summary-label">7 วันล่าสุด</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">จำนวนคลิกรายวัน</h2>
            <p className="panel-note">เวลาอ้างอิง: {stats.timeZone}</p>
          </div>
          <div className="range-toggle" role="group" aria-label="ช่วงเวลา">
            {RANGES.map((range) => (
              <button
                key={range}
                type="button"
                className={`range-btn${range === days ? ' active' : ''}`}

                onClick={() => changeDays(range)}
                disabled={loading}
                aria-pressed={range === days}
              >
                {range} วัน
              </button>
            ))}
          </div>
        </div>
        <DailyChart data={stats.daily} />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">คลิกล่าสุด</h2>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={reload}
            disabled={loading}
          >
            {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
        </div>

        {stats.recent.length === 0 ? (
          <p className="panel-note">ยังไม่มีการคลิกลิงก์นี้</p>
        ) : (
          <div className="recent-table-wrap">
            <table className="recent-table">
              <thead>
                <tr>

                  <th>เวลา</th>
                  <th>อุปกรณ์</th>
                  <th>เบราว์เซอร์</th>
                  <th>ระบบปฏิบัติการ</th>
                  <th>ที่มา</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((click) => (
                  <tr key={click.id}>
                    <td>{formatDateTime(click.clickedAt)}</td>
                    <td>{click.device}</td>
                    <td>{click.browser}</td>
                    <td>{click.os}</td>
                    <td>{click.referer || 'ตรง / สแกน QR'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}