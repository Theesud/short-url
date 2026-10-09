import StatsView from '@/components/StatsView';

export const metadata = {
  title: 'สถิติลิงก์ | Short URL',
};

export default async function StatsPage({ params }) {
  const { code } = await params;

  return (
    <section className="stats-page">
      <StatsView code={code} />
    </section>
  );
}