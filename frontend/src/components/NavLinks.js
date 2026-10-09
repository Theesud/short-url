'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import './nav-links.css';

const LINKS = [
  { href: '/', label: 'สร้างลิงก์' },
  { href: '/history', label: 'ประวัติ' },
];

function isActive(pathname, href) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <div className="nav-wrap">
      <nav className="nav-links" aria-label="เมนูหลัก">
        {LINKS.map((link) => {
          const active = isActive(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${active ? ' active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="nav-auth">
        {ready && user && (
          <>
            <span className="nav-user" title={user.email}>
              {user.email}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={handleLogout}
            >
              ออกจากระบบ
            </button>
          </>
        )}

        {ready && !user && (
          <>
            <Link
              href="/login"
              className={`nav-link${pathname === '/login' ? ' active' : ''}`}
            >
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="btn btn-primary btn-small">
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </div>
  );
}