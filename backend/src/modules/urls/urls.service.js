const prisma = require('../../db/prisma');
const { generateShortCode } = require('../../common/shortCode');

const MAX_ATTEMPTS = 5;

class AliasTakenError extends Error {
  constructor() {
    super('Alias already taken');
    this.name = 'AliasTakenError';
  }
}

async function createShortUrl(
  originalUrl,
  userId = null,
  { alias = null, expiresAt = null } = {}
) {
  if (alias) {
    try {
      return await prisma.url.create({
        data: { shortCode: alias, originalUrl, userId, expiresAt },
      });
    } catch (error) {
      // P2002 = ค่า unique ซ้ำ: มีคนใช้ชื่อนี้แล้ว
      if (error.code === 'P2002') throw new AliasTakenError();
      throw error;
    }
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await prisma.url.create({
        data: {
          shortCode: generateShortCode(),
          originalUrl,
          userId,
          expiresAt,
        },
      });
    } catch (error) {
      // รหัสสุ่มชนกับของเดิม ให้สุ่มใหม่
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

async function deleteOwnedUrl(userId, shortCode) {
  const result = await prisma.url.deleteMany({ where: { shortCode, userId } });
  return result.count > 0;
}

module.exports = {
  AliasTakenError,
  createShortUrl,
  findByShortCode,
  listUrls,
  deleteOwnedUrl,
};