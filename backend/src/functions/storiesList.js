/* GET /api/stories  +  POST /api/stories */
const { app }        = require('@azure/functions');
const { v4: uuid }   = require('uuid');
const { containers } = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { ok, err, handle } = require('../shared/helpers');

app.http('stories', {
  methods:   ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'stories',
  handler:   handle(async (request) => {

    /* ── GET /api/stories ── */
    if (request.method === 'GET') {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { resources: stories } = await containers.stories().items
        .query({
          query: 'SELECT * FROM c WHERE c.createdAt >= @cutoff ORDER BY c.createdAt DESC OFFSET 0 LIMIT 50',
          parameters: [{ name: '@cutoff', value: cutoff }],
        })
        .fetchAll();

      return ok({ stories });
    }

    /* ── POST /api/stories ── */
    if (request.method === 'POST') {
      const claims = requireAuth(request);
      const { blobUrl, caption } = await request.json();

      if (!blobUrl) return err('blobUrl is required');

      const story = {
        id:        uuid(),
        userId:    claims.id,
        username:  claims.username,
        blobUrl,
        caption:   caption || '',
        createdAt: new Date().toISOString(),
      };

      await containers.stories().items.create(story);
      return ok(story, 201);
    }
  }),
});
