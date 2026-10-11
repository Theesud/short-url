const prisma = require('../../db/prisma');
const { bus, EVENTS } = require('../../events/eventBus');

function register() {
  bus.on(EVENTS.URL_VISITED, async (event) => {
    try {
      await prisma.click.create({
        data: {
          urlId: event.urlId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          referer: event.referer,
          source: event.source === 'qr' ? 'qr' : 'link',
        },
      });
    } catch (error) {
      console.error('Failed to record click:', error);
    }
  });
}

module.exports = { register };