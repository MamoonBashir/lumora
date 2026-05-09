/* PUT /api/users/me */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { requireAuth } = require('../shared/auth');
const { ok, err, handle } = require('../shared/helpers');

app.http('usersUpdate', {
  methods:   ['PUT', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'users/me',
  handler:   handle(async (request) => {
    const claims = requireAuth(request);
    const body   = await request.json();

    // Whitelist of updatable fields
    const allowed = ['displayName', 'bio', 'location', 'avatarUrl', 'coverUrl', 'email', 'phone'];
    const patches = [];

    for (const field of allowed) {
      if (body[field] !== undefined) {
        const value = typeof body[field] === 'string' ? body[field].trim() : body[field];
        patches.push({ op: 'set', path: `/${field}`, value });
      }
    }

    if (patches.length === 0) return err('No valid fields to update');

    const { resource: updated } = await containers.users()
      .item(claims.id, claims.id)
      .patch(patches);

    const { passwordHash, ...safeUser } = updated;
    return ok(safeUser);
  }),
});
