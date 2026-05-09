/* POST /api/users/avatar-url — any authenticated user can upload their own avatar */
const { app }               = require('@azure/functions');
const { v4: uuid }          = require('uuid');
const { requireAuth }       = require('../shared/auth');
const { generateUploadSasUrl } = require('../shared/blob');
const { ok, handle }        = require('../shared/helpers');

app.http('usersAvatarUrl', {
  methods:   ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'users/avatar-url',
  handler:   handle(async (request) => {
    requireAuth(request);          // any logged-in user (creator OR consumer)

    const blobName  = `avatar-${uuid()}.jpg`;
    const sasUrl    = await generateUploadSasUrl(blobName);
    const account   = process.env.BLOB_ACCOUNT_NAME;
    const container = process.env.BLOB_CONTAINER || 'photos';
    const publicUrl = `https://${account}.blob.core.windows.net/${container}/${blobName}`;

    return ok({ sasUrl, publicUrl });
  }),
});
