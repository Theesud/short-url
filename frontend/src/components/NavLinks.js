'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './nav-links.css';

const LINKS = [
  { href: '/', label: 'สร้างลิงก์' },
  { href: '/history', label: 'ประวัติ' },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="nav-links" aria-label="เมนูหลัก">
      {LINKS.map((link) => {
        const active =
          link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

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
  );
}