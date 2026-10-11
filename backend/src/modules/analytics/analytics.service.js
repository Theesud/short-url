const prisma = require('../../db/prisma');
const { parseUserAgent } = require('../../common/userAgent');

const DEFAULT_TIMEZONE = 'Asia/Bangkok';
const DAY_MS = 24 * 60 * 60 * 1000;

async function countClicksByUrlIds(urlIds) {
  if (!urlIds || urlIds.length === 0) return {};

  const rows = await prisma.click.groupBy({
    by: ['urlId'],
    where: { urlId: { in: urlIds } },
    _count: { _all: true },
  });

  const counts = {};
  for (const row of rows) {
    counts[row.urlId] = row._count._all;
  }
  return counts;
}

function formatDateInTimezone(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function buildDayList(days, timeZone) {
  const list = [];
  for (let i = days - 1; i >= 0; i--) {
    list.push(formatDateInTimezone(new Date(Date.now() - i * DAY_MS), timeZone));
  }
  return list;
}

async function getClickStats(urlId, options = {}) {
  const days = options.days || 14;
  const timeZone = options.timeZone || DEFAULT_TIMEZONE;
  const recentLimit = options.recentLimit || 20;

  const dayList = buildDayList(days, timeZone);
  // เผื่อเวลาเพิ่ม 1 วัน กันขอบเขตของเขตเวลา (ส่วนที่เกินจะถูกตัดทิ้งตอนจับคู่กับ dayList)
  const since = new Date(Date.now() - (days + 1) * DAY_MS);

  const [totalClicks, rows, recentRows] = await Promise.all([
    prisma.click.count({ where: { urlId } }),
    prisma.$queryRaw`
      SELECT
        to_char((clicked_at AT TIME ZONE 'UTC') AT TIME ZONE ${timeZone}::text, 'YYYY-MM-DD') AS day,
        COUNT(*)::int AS count
      FROM url_clicks
      WHERE url_id = ${urlId} AND clicked_at >= ${since}
      GROUP BY day
      ORDER BY day
    `,
    prisma.click.findMany({
      where: { urlId },
      orderBy: { clickedAt: 'desc' },
      take: recentLimit,
      select: { id: true, clickedAt: true, userAgent: true, source: true },
    }),
  ]);

  const countsByDay = {};
  for (const row of rows) {
    countsByDay[row.day] = row.count;
  }

  const daily = dayList.map((date) => ({
    date,
    count: countsByDay[date] || 0,
  }));

  const today = daily.length > 0 ? daily[daily.length - 1].count : 0;
  const last7Days = daily
    .slice(-7)
    .reduce((sum, item) => sum + item.count, 0);

  return {
    totalClicks,
    timeZone,
    days,
    daily,
    summary: { today, last7Days },
    recent: recentRows.map((row) => {
      const { os, device } = parseUserAgent(row.userAgent);
      return {
        id: row.id,
        clickedAt: row.clickedAt,
        os,
        device,
        source: row.source,
      };
    }),
  };
}

module.exports = { countClicksByUrlIds, getClickStats };