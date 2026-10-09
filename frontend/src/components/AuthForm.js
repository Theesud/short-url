'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import './auth.css';

const COPY = {
  login: {
    title: 'เข้าสู่ระบบ',
    subtitle: 'เข้าสู่ระบบเพื่อดูประวัติและสถิติลิงก์ของคุณ',
    submit: 'เข้าสู่ระบบ',
    submitting: 'กำลังเข้าสู่ระบบ...',
    switchText: 'ยังไม่มีบัญชี?',
    switchLabel: 'สมัครสมาชิก',
    switchHref: '/register',
  },
  register: {
    title: 'สมัครสมาชิก',
    subtitle: 'สร้างบัญชีเพื่อเก็บประวัติลิงก์และดูสถิติการคลิก',
    submit: 'สมัครสมาชิก',
    submitting: 'กำลังสมัครสมาชิก...',
    switchText: 'มีบัญชีอยู่แล้ว?',
    switchLabel: 'เข้าสู่ระบบ',
    switchHref: '/login',
  },
};

export default function AuthForm({ mode }) {
  const copy = COPY[mode];
  const isRegister = mode === 'register';

  const router = useRouter();
  const { user, ready, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && user) router.replace('/');
  }, [ready, user, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (isRegister && password !== confirm) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      // สำเร็จแล้ว useEffect ด้านบนจะพาไปหน้าแรกเอง
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (ready && user) return null;

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{copy.title}</h1>
        <p className="auth-sub">{copy.subtitle}</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              className="text-input"
              type="email"
              autoComplete="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              className="text-input"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {isRegister && (
            <>
              <div className="field">
                <label htmlFor="confirm">ยืนยันรหัสผ่าน</label>
                <input
                  id="confirm"
                  className="text-input"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
              </div>
              <p className="auth-hint">
                ใช้อีเมลอะไรก็ได้ (ไม่ต้องยืนยันอีเมล) รหัสผ่านอย่างน้อย 8
                ตัวอักษร
              </p>
            </>
          )}

          {error && (
            <p className="error-box" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? copy.submitting : copy.submit}
          </button>
        </form>

        <p className="auth-switch">
          {copy.switchText} <Link href={copy.switchHref}>{copy.switchLabel}</Link>
        </p>
      </div>
    </section>
  );
}