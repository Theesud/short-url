import HomeForm from '@/components/HomeForm';

export default function HomePage() {
  return (
    <section className="hero container">
      <h1 className="hero-title">
        ย่อลิงก์ให้สั้น <span className="accent">แชร์ได้ง่ายขึ้น</span>
      </h1>
      <p className="hero-sub">
        วางลิงก์ยาว ๆ ของคุณ แล้วรับลิงก์สั้นพร้อมใช้งานได้ทันที
      </p>
      <HomeForm />
    </section>
  );
}