/* POST /api/photos/upload-url */
const { app }               = require('@azure/functions');
const { v4: uuid }          = require('uuid');
const { requireCreator }    = require('../shared/auth');
const { generateUploadSasUrl } = require('../shared/blob');
const { ok, err, handle }   = require('../shared/helpers');

app.http('photosUploadUrl', {
  methods:   ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'photos/upload-url',
  handler:   handle(async (request) => {
    requireCreator(request);

    const body      = await request.json();
    const ext       = (body.extension || 'jpg').replace(/^\./, '').toLowerCase();
    const allowed   = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowed.includes(ext)) return err('Unsupported file type');

    const blobName = `${uuid()}.${ext}`;
    const sasUrl   = await generateUploadSasUrl(blobName);

    // The public read URL (without SAS) is returned so the client can save it
    const account   = process.env.BLOB_ACCOUNT_NAME;
    const container = process.env.BLOB_CONTAINER || 'photos';
    const publicUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}`;

    return ok({ sasUrl, publicUrl, blobName });
  }),
});
