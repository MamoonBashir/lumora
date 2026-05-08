/* POST /api/photos/{id}/rate  — 1-5 star rating */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { ok, err, handle } = require('../shared/helpers');

app.http('photosRate', {
  methods:   ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos/{id}/rate',
  handler:   handle(async (request) => {
    const claims  = requireAuth(request);
    const photoId = request.params.id;
    const { rating } = await request.json();

    if (!rating || rating < 1 || rating > 5) return err('Rating must be between 1 and 5');

    const { resource: photo } = await containers.photos().item(photoId, photoId).read();
    if (!photo) throw Object.assign(new Error('Photo not found'), { status: 404 });

    // Per-user rating map — prevents duplicate counts
    const ratings  = photo.ratings || {};         // { userId: score }
    ratings[claims.id] = rating;                  // overwrite if already rated

    const values   = Object.values(ratings);
    const newCount = values.length;
    const newAvg   = parseFloat((values.reduce((a, b) => a + b, 0) / newCount).toFixed(2));

    await containers.photos().item(photoId, photoId).patch([
      { op: 'set', path: '/ratings',     value: ratings  },
      { op: 'set', path: '/avgRating',   value: newAvg   },
      { op: 'set', path: '/ratingCount', value: newCount },
    ]);

    return ok({ avgRating: newAvg, ratingCount: newCount, userRating: rating });
  }),
});
