import HistoryTable from '@/components/HistoryTable';

export const metadata = {
  title: 'ประวัติการสร้างลิงก์ | Short URL',
};

export default function HistoryPage() {
  return (
    <section className="history-page">
      <h1 className="page-title">ประวัติการสร้างลิงก์</h1>
      <p className="page-sub">
        รายการลิงก์ที่สร้างทั้งหมด พร้อมจำนวนครั้งที่ถูกคลิกหรือสแกน QR Code
      </p>
      <HistoryTable />
    </section>
  );
}