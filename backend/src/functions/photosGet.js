/* GET /api/photos/{id}  +  DELETE /api/photos/{id} */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { deleteBlob }  = require('../shared/blob');
const { ok, handle }  = require('../shared/helpers');

app.http('photosById', {
  methods:   ['GET', 'DELETE', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos/{id}',
  handler:   handle(async (request) => {
    const id = request.params.id;

    /* ── GET /api/photos/{id} ── */
    if (request.method === 'GET') {
      const { resource: photo } = await containers.photos().item(id, id).read();
      if (!photo) throw Object.assign(new Error('Photo not found'), { status: 404 });
      return ok(photo);
    }

    /* ── DELETE /api/photos/{id} ── */
    if (request.method === 'DELETE') {
      const claims = requireAuth(request);
      const { resource: photo } = await containers.photos().item(id, id).read();
      if (!photo) throw Object.assign(new Error('Photo not found'), { status: 404 });

      if (photo.creatorId !== claims.id && claims.role !== 'admin') {
        throw Object.assign(new Error('Forbidden'), { status: 403 });
      }

      try {
        const url      = new URL(photo.blobUrl);
        const segments = url.pathname.split('/');
        const blobName = segments[segments.length - 1];
        await deleteBlob(blobName);
      } catch (_) { /* ignore missing blob */ }

      await containers.photos().item(id, id).delete();
      return ok({ deleted: true });
    }
  }),
});
