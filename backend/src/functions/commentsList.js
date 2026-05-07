/* GET /api/photos/{id}/comments  +  POST /api/photos/{id}/comments */
const { app }        = require('@azure/functions');
const { v4: uuid }   = require('uuid');
const { containers } = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { ok, err, handle } = require('../shared/helpers');

app.http('comments', {
  methods:   ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos/{id}/comments',
  handler:   handle(async (request) => {
    const photoId = request.params.id;

    /* ── GET /api/photos/{id}/comments ── */
    if (request.method === 'GET') {
      const page   = parseInt(request.query.get('page')  || '1');
      const limit  = parseInt(request.query.get('limit') || '20');
      const offset = (page - 1) * limit;

      const { resources } = await containers.comments().items
        .query({
          query: 'SELECT * FROM c WHERE c.photoId = @pid ORDER BY c.createdAt ASC OFFSET @offset LIMIT @limit',
          parameters: [
            { name: '@pid',    value: photoId },
            { name: '@offset', value: offset  },
            { name: '@limit',  value: limit + 1 },
          ],
        })
        .fetchAll();

      const hasMore  = resources.length > limit;
      const comments = hasMore ? resources.slice(0, limit) : resources;
      return ok({ comments, hasMore, page });
    }

    /* ── POST /api/photos/{id}/comments ── */
    if (request.method === 'POST') {
      const claims = requireAuth(request);
      const { text } = await request.json();

      if (!text || !text.trim()) return err('Comment text is required');
      if (text.length > 500) return err('Comment must be 500 characters or fewer');

      const { resources: photoCheck } = await containers.photos().items
        .query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: photoId }] })
        .fetchAll();
      const photo = photoCheck[0];
      if (!photo) throw Object.assign(new Error('Photo not found'), { status: 404 });

      const comment = {
        id:        uuid(),
        photoId,
        userId:    claims.id,
        username:  claims.username,
        text:      text.trim(),
        createdAt: new Date().toISOString(),
      };

      await containers.comments().items.create(comment);

      await containers.photos().item(photoId, photoId).patch([
        { op: 'incr', path: '/commentCount', value: 1 },
      ]);

      return ok(comment, 201);
    }
  }),
});
