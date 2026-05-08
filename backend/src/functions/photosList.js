/* GET /api/photos  +  POST /api/photos */
const { app }          = require('@azure/functions');
const { v4: uuid }     = require('uuid');
const { containers }   = require('../shared/cosmos');
const { requireCreator } = require('../shared/auth');
const { ok, err, handle } = require('../shared/helpers');

app.http('photos', {
  methods:   ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos',
  handler:   handle(async (request) => {

    /* ── GET /api/photos ── */
    if (request.method === 'GET') {
      const filter = request.query.get('filter') || 'all';
      const page   = parseInt(request.query.get('page')  || '1');
      const limit  = parseInt(request.query.get('limit') || '10');
      const offset = (page - 1) * limit;

      const categories = ['travel', 'nature', 'urban', 'portrait', 'abstract'];
      let query  = 'SELECT * FROM c ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
      let params = [{ name: '@offset', value: offset }, { name: '@limit', value: limit + 1 }];

      if (categories.includes(filter)) {
        query  = 'SELECT * FROM c WHERE c.category = @cat ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit';
        params = [{ name: '@cat', value: filter }, ...params];
      } else if (filter === 'trending') {
        query  = 'SELECT * FROM c ORDER BY c.likeCount DESC OFFSET @offset LIMIT @limit';
      }

      const { resources } = await containers.photos().items
        .query({ query, parameters: params })
        .fetchAll();

      const hasMore = resources.length > limit;
      const photos  = hasMore ? resources.slice(0, limit) : resources;
      return ok({ photos, hasMore, page });
    }

    /* ── POST /api/photos ── */
    if (request.method === 'POST') {
      const claims = requireCreator(request);
      const { title, description, blobUrl, category, hashtags, mediaType } = await request.json();
      if (!blobUrl) return err('blobUrl is required');

      const validCategories = ['travel', 'nature', 'urban', 'portrait', 'abstract'];
      const cat = validCategories.includes(category) ? category : 'abstract';

      // Detect media type from extension if not provided
      const videoExts = ['mp4', 'mov', 'webm'];
      const ext = blobUrl.split('.').pop().toLowerCase();
      const resolvedMediaType = mediaType || (videoExts.includes(ext) ? 'video' : 'image');

      const photo = {
        id:           uuid(),
        creatorId:    claims.id,
        creatorName:  claims.username,
        title:        title       || '',
        description:  description || '',
        blobUrl,
        mediaType:    resolvedMediaType,
        category:     cat,
        hashtags:     Array.isArray(hashtags) ? hashtags.map(h => h.replace(/^#/, '').toLowerCase()) : [],
        likeCount:    0,
        saveCount:    0,
        commentCount: 0,
        avgRating:    0,
        ratingCount:  0,
        createdAt:    new Date().toISOString(),
      };

      await containers.photos().items.create(photo);
      return ok(photo, 201);
    }
  }),
});
