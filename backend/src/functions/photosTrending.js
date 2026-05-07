/* GET /api/photos/trending  — top hashtags + top photos by likes */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { ok, handle } = require('../shared/helpers');

app.http('photosTrending', {
  methods:   ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos/trending',
  handler:   handle(async (request) => {
    const limit = parseInt(request.query.get('limit') || '20');

    // Top photos by likeCount
    const { resources: photos } = await containers.photos().items
      .query({
        query: 'SELECT * FROM c ORDER BY c.likeCount DESC OFFSET 0 LIMIT @limit',
        parameters: [{ name: '@limit', value: limit }],
      })
      .fetchAll();

    // Aggregate hashtag counts from those photos
    const tagMap = {};
    for (const p of photos) {
      for (const tag of (p.hashtags || [])) {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      }
    }

    const hashtags = Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return ok({ photos, hashtags });
  }),
});
