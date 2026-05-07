/* GET /api/users/{id} */
const { app }        = require('@azure/functions');
const { containers } = require('../shared/cosmos');
const { ok, handle } = require('../shared/helpers');

app.http('usersProfile', {
  methods:   ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'users/{id}',
  handler:   handle(async (request) => {
    const id = request.params.id;
    const { resource: user } = await containers.users().item(id, id).read();
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

    // Strip sensitive fields before returning
    const { passwordHash, likedPhotos, savedPhotos, ...publicUser } = user;
    return ok(publicUser);
  }),
});
