'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function RequireAuth({ children, message }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="state-box">กำลังตรวจสอบการเข้าสู่ระบบ...</div>;
  }

  if (!user) {
    return (
      <div className="state-box">
        <p>{message || 'กรุณาเข้าสู่ระบบเพื่อใช้งานหน้านี้'}</p>
        <div className="state-actions">
          <Link href="/login" className="btn btn-primary">
            เข้าสู่ระบบ
          </Link>
          <Link href="/register" className="btn btn-secondary">
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    );
  }

  return children;
}