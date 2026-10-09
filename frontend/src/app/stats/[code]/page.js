import RequireAuth from '@/components/RequireAuth';
import StatsView from '@/components/StatsView';

export const metadata = {
  title: 'สถิติลิงก์ | Short URL',
};

export default async function StatsPage({ params }) {
  const { code } = await params;

  return (
    <section className="stats-page">
      <RequireAuth message="กรุณาเข้าสู่ระบบเพื่อดูสถิติของลิงก์นี้">
        <StatsView code={code} />
      </RequireAuth>
    </section>
  );
}