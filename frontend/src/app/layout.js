import Link from 'next/link';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import NavLinks from '@/components/NavLinks';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-thai',
  display: 'swap',
});

export const metadata = {
  title: 'Short URL | ย่อลิงก์ให้สั้น แชร์ได้ง่ายขึ้น',
  description: 'ระบบย่อลิงก์ รับลิงก์สั้นพร้อมใช้งานได้ทันที',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${inter.variable} ${notoThai.variable}`}>
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                <svg
                  width="18"

                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
                  <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
                </svg>
              </span>
              Short URL
            </Link>
            <NavLinks />
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container">Short URL — ย่อลิงก์ง่าย ๆ</div>
        </footer>
      </body>
    </html>
  );
}