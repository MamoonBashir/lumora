/* GET /api/users/{id}/photos */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { ok, handle } = require('../shared/helpers');

app.http('usersPhotos', {
  methods:   ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'users/{id}/photos',
  handler:   handle(async (request) => {
    const creatorId = request.params.id;
    const page      = parseInt(request.query.get('page')  || '1');
    const limit     = parseInt(request.query.get('limit') || '12');
    const offset    = (page - 1) * limit;

    const { resources } = await containers.photos().items
      .query({
        query: 'SELECT * FROM c WHERE c.creatorId = @cid ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit',
        parameters: [
          { name: '@cid',    value: creatorId },
          { name: '@offset', value: offset     },
          { name: '@limit',  value: limit + 1  },
        ],
      })
      .fetchAll();

    const hasMore = resources.length > limit;
    const photos  = hasMore ? resources.slice(0, limit) : resources;
    return ok({ photos, hasMore, page });
  }),
});
