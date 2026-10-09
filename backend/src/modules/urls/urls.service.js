const prisma = require('../../db/prisma');
const { generateShortCode } = require('../../common/shortCode');

const MAX_ATTEMPTS = 5;

async function createShortUrl(originalUrl, userId = null) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await prisma.url.create({
        data: {
          shortCode: generateShortCode(),
          originalUrl,
          userId,
        },
      });
    } catch (error) {
      // P2002 = ค่า unique ซ้ำ (shortCode ชนกัน) ให้สุ่มใหม่
      if (error.code === 'P2002') continue;
      throw error;
    }
  }
  throw new Error('Unable to generate a unique short code');
}

async function findByShortCode(shortCode) {
  return prisma.url.findUnique({ where: { shortCode } });
}

async function listUrls({ page, limit, userId }) {
  const skip = (page - 1) * limit;
  const where = { userId };

  const [items, total] = await Promise.all([
    prisma.url.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.url.count({ where }),
  ]);

  return { items, total };
}

module.exports = { createShortUrl, findByShortCode, listUrls };