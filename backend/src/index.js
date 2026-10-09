require('dotenv').config();

const express = require('express');
const cors = require('cors');
const prisma = require('./db/prisma');
const authRoutes = require('./modules/auth/auth.routes');
const urlsRoutes = require('./modules/urls/urls.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const redirectRoutes = require('./modules/redirect/redirect.routes');
const clickListener = require('./modules/analytics/clickListener');

const app = express();

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

clickListener.register();

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlsRoutes);
app.use('/api/urls', analyticsRoutes);


// ต้องอยู่หลังสุด เพราะ /:code จะดักทุกเส้นทางที่ยังไม่ถูกจับ
app.use('/', redirectRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'รูปแบบข้อมูลที่ส่งมาไม่ถูกต้อง' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบ' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});