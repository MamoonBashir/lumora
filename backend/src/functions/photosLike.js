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

    // Use photo.likedBy as the single source of truth — no cross-doc consistency issues
    const likedBy      = photo.likedBy || [];
    const alreadyLiked = likedBy.includes(claims.id);

    const newLikedBy = alreadyLiked
      ? likedBy.filter(uid => uid !== claims.id)
      : [...likedBy, claims.id];

    // Replace the photo document with updated likedBy + likeCount
    photo.likedBy   = newLikedBy;
    photo.likeCount = newLikedBy.length;
    await containers.photos().item(photoId, photoId).replace(photo);

    // Also keep user.likedPhotos in sync (used by profile/saved pages)
    const newUserLikes = alreadyLiked
      ? (user.likedPhotos || []).filter(id => id !== photoId)
      : [...(user.likedPhotos || []), photoId];
    await containers.users().item(claims.id, claims.id).patch([
      { op: 'set', path: '/likedPhotos', value: newUserLikes },
    ]);

    return ok({ liked: !alreadyLiked, likeCount: photo.likeCount });
  }),
});
