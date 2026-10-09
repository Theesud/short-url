const prisma = require('../../db/prisma');

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

module.exports = { countClicksByUrlIds };