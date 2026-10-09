import { Suspense } from 'react';
import RequireAuth from '@/components/RequireAuth';
import StatsView from '@/components/StatsView';

export const metadata = {
  title: 'สถิติลิงก์ | Short URL',
};

async function StatsContent({ params }) {
  const { code } = await params;

  return (
    <RequireAuth message="กรุณาเข้าสู่ระบบเพื่อดูสถิติของลิงก์นี้">
      <StatsView code={code} />
    </RequireAuth>
  );
}

export default function StatsPage({ params }) {
  return (
    <section className="stats-page">
      <Suspense fallback={<div className="state-box">กำลังโหลดข้อมูล...</div>}>
        <StatsContent params={params} />
      </Suspense>
    </section>
  );
}