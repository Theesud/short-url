'use client';

import { useState } from 'react';
import { createShortUrl } from '@/lib/api';
import ResultCard from './ResultCard';

function normalizeInput(value) {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

export default function UrlForm() {
  const [value, setValue] = useState('');
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
      const data = await createShortUrl(originalUrl);
      setResult(data);
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
        <form className="url-form" onSubmit={handleSubmit} noValidate>
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                กำลังย่อลิงก์...
              </>
            ) : (
              'ย่อลิงก์'
            )}
          </button>
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