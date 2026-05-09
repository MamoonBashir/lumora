/* DELETE /api/photos/{id}  — creator can delete their own photo */
const { app }         = require('@azure/functions');
const { containers }  = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { ok, handle }  = require('../shared/helpers');

app.http('photosDelete', {
  methods:   ['DELETE', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos/{id}',
  handler:   handle(async (request) => {
    const claims  = requireAuth(request);
    const photoId = request.params.id;

    const { resource: photo } = await containers.photos().item(photoId, photoId).read();
    if (!photo) throw Object.assign(new Error('Photo not found'), { status: 404 });

    // Only the creator who uploaded it can delete it
    if (photo.creatorId !== claims.id) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }

    await containers.photos().item(photoId, photoId).delete();

    return ok({ deleted: true, id: photoId });
  }),
});
