/* GET /api/photos/search?q=&page=&limit= */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { ok, handle } = require('../shared/helpers');

app.http('photosSearch', {
  methods:   ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos/search',
  handler:   handle(async (request) => {
    const q     = (request.query.get('q') || '').trim().toLowerCase();
    const page  = parseInt(request.query.get('page')  || '1');
    const limit = parseInt(request.query.get('limit') || '12');
    const offset = (page - 1) * limit;

    if (!q) return ok({ photos: [], hasMore: false, page });

    // Search title, description, hashtags, creatorName (case-insensitive via LOWER())
    const query = `
      SELECT * FROM c
      WHERE CONTAINS(LOWER(c.title), @q)
         OR CONTAINS(LOWER(c.description), @q)
         OR CONTAINS(LOWER(c.creatorName), @q)
         OR ARRAY_CONTAINS(c.hashtags, @q)
      ORDER BY c.createdAt DESC
      OFFSET @offset LIMIT @limit
    `;

    const { resources } = await containers.photos().items
      .query({
        query,
        parameters: [
          { name: '@q',      value: q },
          { name: '@offset', value: offset },
          { name: '@limit',  value: limit + 1 },
        ],
      })
      .fetchAll();

    const hasMore = resources.length > limit;
    const photos  = hasMore ? resources.slice(0, limit) : resources;
    return ok({ photos, hasMore, page });
  }),
});
