/* POST /api/photos/{id}/like  — toggle like */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { ok, handle }  = require('../shared/helpers');

app.http('photosLike', {
  methods:   ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos/{id}/like',
  handler:   handle(async (request) => {
    const claims  = requireAuth(request);
    const photoId = request.params.id;

    const [photoRes, userRes] = await Promise.all([
      containers.photos().item(photoId, photoId).read(),
      containers.users().item(claims.id, claims.id).read(),
    ]);

    const photo = photoRes.resource;
    const user  = userRes.resource;
    if (!photo) throw Object.assign(new Error('Photo not found'), { status: 404 });

    const liked    = (user.likedPhotos || []).includes(photoId);
    const delta    = liked ? -1 : 1;
    const newCount = Math.max(0, (photo.likeCount || 0) + delta);

    await containers.photos().item(photoId, photoId).patch([
      { op: 'set', path: '/likeCount', value: newCount },
    ]);

    const newLikes = liked
      ? (user.likedPhotos || []).filter(id => id !== photoId)
      : [...(user.likedPhotos || []), photoId];

    await containers.users().item(claims.id, claims.id).patch([
      { op: 'set', path: '/likedPhotos', value: newLikes },
    ]);

    return ok({ liked: !liked, likeCount: newCount });
  }),
});
