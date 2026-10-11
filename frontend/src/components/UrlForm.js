'use client';

import { useState } from 'react';
import { createShortUrl } from '@/lib/api';
import ResultCard from './ResultCard';
import './url-form.css';

const SHORT_HOST = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
  .replace(/^https?:\/\//, '')
  .replace(/\/+$/, '');

const EXPIRY_OPTIONS = [
  { value: '', label: 'ไม่หมดอายุ' },
  { value: '1', label: '1 วัน' },
  { value: '7', label: '7 วัน' },
  { value: '30', label: '30 วัน' },
  { value: '90', label: '90 วัน' },
];

function normalizeInput(value) {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

export default function UrlForm() {
  const [value, setValue] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    const originalUrl = normalizeInput(value);

    if (!originalUrl) {
      setResult(null);
      setError('กรุณากรอก URL ที่ต้องการย่อ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await createShortUrl({
        originalUrl,
        alias: alias.trim(),
        expiresInDays,
      });
      setResult(data);
      setAlias('');
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="card">
        <form className="shorten-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="original-url" className="sr-only">
            URL ที่ต้องการย่อ
          </label>
          <input
            id="original-url"
            className="url-input"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="วางลิงก์ยาว ๆ ที่นี่ เช่น https://www.synerry.com"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />

          <button
            type="button"
            className="options-toggle"
            onClick={() => setShowOptions((open) => !open)}
            aria-expanded={showOptions}
            aria-controls="link-options"
          >
            {showOptions ? 'ซ่อนตัวเลือกเพิ่มเติม ▴' : 'ตัวเลือกเพิ่มเติม ▾'}
          </button>

          {showOptions && (
            <div id="link-options" className="options-panel">
              <div className="field">
                <label htmlFor="alias">ตั้งชื่อลิงก์เอง (ไม่บังคับ)</label>
                <div className="alias-wrap">
                  <span className="alias-prefix">{SHORT_HOST}/</span>
                  <input
                    id="alias"
                    className="alias-input"
                    type="text"
                    autoComplete="off"
                    maxLength={32}
                    placeholder="promo-2026"
                    value={alias}
                    onChange={(event) => setAlias(event.target.value)}
                  />
                </div>
                <p className="field-hint">
                  3–32 ตัวอักษร ใช้ a-z, A-Z, 0-9, - และ _
                </p>
              </div>

              <div className="field">
                <label htmlFor="expiry">วันหมดอายุ</label>
                <select
                  id="expiry"
                  className="text-input"
                  value={expiresInDays}
                  onChange={(event) => setExpiresInDays(event.target.value)}
                >
                  {EXPIRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  กำลังย่อลิงก์...
                </>
              ) : (
                'ย่อลิงก์'
              )}
            </button>
          </div>
        </form>

        {error && (
          <p className="error-box" role="alert">
            {error}
          </p>
        )}

        {result && <ResultCard key={result.shortCode} result={result} />}
      </div>
    </div>
  );
}