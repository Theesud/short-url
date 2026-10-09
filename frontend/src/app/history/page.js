import HistoryTable from '@/components/HistoryTable';
import RequireAuth from '@/components/RequireAuth';

export const metadata = {
  title: 'ประวัติการสร้างลิงก์ | Short URL',
};

export default function HistoryPage() {
  return (
    <section className="history-page">
      <h1 className="page-title">ประวัติการสร้างลิงก์</h1>
      <p className="page-sub">
        รายการลิงก์ของคุณทั้งหมด พร้อมจำนวนครั้งที่ถูกคลิกหรือสแกน QR Code
      </p>
      <RequireAuth message="กรุณาเข้าสู่ระบบเพื่อดูประวัติลิงก์ของคุณ">
        <HistoryTable />
      </RequireAuth>
    </section>
  );
}