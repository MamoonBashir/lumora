/* GET /api/users/me/saved  — return the current user's saved photos */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { ok, handle }  = require('../shared/helpers');

app.http('usersSaved', {
  methods:   ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'users/me/saved',
  handler:   handle(async (request) => {
    const claims = requireAuth(request);
    const page   = parseInt(request.query.get('page')  || '1');
    const limit  = parseInt(request.query.get('limit') || '12');
    const offset = (page - 1) * limit;

    const { resource: user } = await containers.users().item(claims.id, claims.id).read();
    const savedIds = (user.savedPhotos || []).slice().reverse(); // newest first

    if (savedIds.length === 0) return ok({ photos: [], hasMore: false, page });

    // Batch fetch by id using IN query
    const idList = savedIds.slice(offset, offset + limit + 1);
    if (idList.length === 0) return ok({ photos: [], hasMore: false, page });

    const placeholders = idList.map((_, i) => `@id${i}`).join(', ');
    const params = idList.map((id, i) => ({ name: `@id${i}`, value: id }));

    const { resources } = await containers.photos().items
      .query({ query: `SELECT * FROM c WHERE c.id IN (${placeholders})`, parameters: params })
      .fetchAll();

    const hasMore = idList.length > limit;
    const photos  = hasMore ? resources.slice(0, limit) : resources;
    return ok({ photos, hasMore, page });
  }),
});
