/* GET /api/auth/me */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { ok, handle }  = require('../shared/helpers');

app.http('authMe', {
  methods:   ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'auth/me',
  handler:   handle(async (request) => {
    const claims = requireAuth(request);
    const { resource: user } = await containers.users().item(claims.id, claims.id).read();
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    const { passwordHash, ...safeUser } = user;
    return ok(safeUser);
  }),
});
