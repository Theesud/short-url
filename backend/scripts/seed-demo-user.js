require('dotenv').config();

const bcrypt = require('bcryptjs');
const prisma = require('../src/db/prisma');
const { createShortUrl } = require('../src/modules/urls/urls.service');

const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@example.com')
  .trim()
  .toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo@12345';

const SAMPLE_LINKS = [
  { originalUrl: 'https://www.synerry.com', clicks: 23 },
  { originalUrl: 'https://nextjs.org/docs', clicks: 11 },
  { originalUrl: 'https://www.prisma.io/docs', clicks: 4 },
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

const REFERERS = [
  null,
  null,
  'https://www.facebook.com/',
  'https://line.me/',
  'https://www.google.com/',
];

const DAY_MS = 24 * 60 * 60 * 1000;
const SPREAD_DAYS = 10;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomClickTime() {
  return new Date(Date.now() - Math.random() * SPREAD_DAYS * DAY_MS);
}

async function ensureUser() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  return prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash },
    create: { email: DEMO_EMAIL, passwordHash },
  });
}

async function seedSampleLinks(user) {
  const existing = await prisma.url.count({ where: { userId: user.id } });

  if (existing > 0) {
    console.log('Demo user already has links. Skipping sample data.');
    return;
  }

  for (const sample of SAMPLE_LINKS) {
    const url = await createShortUrl(sample.originalUrl, user.id);

    await prisma.url.update({
      where: { id: url.id },
      data: { createdAt: new Date(Date.now() - SPREAD_DAYS * DAY_MS) },
    });

    const clicks = Array.from({ length: sample.clicks }, (_, index) => ({
      urlId: url.id,
      clickedAt: randomClickTime(),
      ipAddress: `203.0.113.${(index % 250) + 1}`,
      userAgent: pick(USER_AGENTS),
      referer: pick(REFERERS),
    }));

    await prisma.click.createMany({ data: clicks });
    console.log(`Created ${url.shortCode} -> ${sample.originalUrl} (${sample.clicks} clicks)`);
  }
}

async function main() {
  const user = await ensureUser();
  await seedSampleLinks(user);

  console.log('');
  console.log('Demo account ready:');
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());