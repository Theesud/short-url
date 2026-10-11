'use client';

import { useAuth } from './AuthProvider';
import UrlForm from './UrlForm';

export default function HomeForm() {
  const { user, ready } = useAuth();

  // key เปลี่ยนเมื่อสถานะการล็อกอินเปลี่ยน (เข้าสู่ระบบ / ออกจากระบบ / สลับบัญชี)
  // ทำให้ฟอร์มถูกสร้างใหม่ ไม่มีผลลัพธ์หรือข้อความเก่าค้างอยู่
  const formKey = ready && user ? `user-${user.id}` : 'guest';

  return <UrlForm key={formKey} />;
}