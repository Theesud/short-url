import { Suspense } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'ลิงก์ใช้งานไม่ได้ | Short URL',
};

const MESSAGES = {
  expired: {
    mark: '410',
    title: 'ลิงก์นี้หมดอายุแล้ว',
    text: 'เจ้าของลิงก์ตั้งวันหมดอายุไว้ และเลยกำหนดแล้ว ลองติดต่อผู้ที่ส่งลิงก์นี้มาให้คุณ',
  },
  'not-found': {
    mark: '404',
    title: 'ไม่พบลิงก์นี้',
    text: 'ลิงก์อาจพิมพ์ผิด หรือเจ้าของลบลิงก์นี้ไปแล้ว',
  },
};

async function UnavailableContent({ searchParams }) {
  const { reason } = await searchParams;
  const message = MESSAGES[reason] || MESSAGES['not-found'];

  return (
    <>
      <div className="unavailable-mark" aria-hidden="true">
        {message.mark}
      </div>
      <h1 className="unavailable-title">{message.title}</h1>
      <p className="unavailable-text">{message.text}</p>
      <Link href="/" className="btn btn-primary">
        ย่อลิงก์ของคุณเอง
      </Link>
    </>
  );
}

export default function LinkUnavailablePage({ searchParams }) {
  return (
    <section className="unavailable-page container">
      <Suspense fallback={<div className="state-box">กำลังโหลดข้อมูล...</div>}>
        <UnavailableContent searchParams={searchParams} />
      </Suspense>
    </section>
  );
}