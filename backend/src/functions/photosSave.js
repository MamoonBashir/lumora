/* POST /api/photos/{id}/save  — toggle save */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { ok, handle }  = require('../shared/helpers');

app.http('photosSave', {
  methods:   ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos/{id}/save',
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

    const saved    = (user.savedPhotos || []).includes(photoId);
    const delta    = saved ? -1 : 1;
    const newCount = Math.max(0, (photo.saveCount || 0) + delta);

    await containers.photos().item(photoId, photoId).patch([
      { op: 'set', path: '/saveCount', value: newCount },
    ]);

    const newSaves = saved
      ? (user.savedPhotos || []).filter(id => id !== photoId)
      : [...(user.savedPhotos || []), photoId];

    await containers.users().item(claims.id, claims.id).patch([
      { op: 'set', path: '/savedPhotos', value: newSaves },
    ]);

    return ok({ saved: !saved, saveCount: newCount });
  }),
});
