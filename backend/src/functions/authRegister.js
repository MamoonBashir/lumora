/* POST /api/auth/register */
const { app }        = require('@azure/functions');
const bcrypt         = require('bcryptjs');
const { v4: uuid }   = require('uuid');
const { containers } = require('../shared/cosmos');
const { signToken }  = require('../shared/auth');
const { ok, err, handle } = require('../shared/helpers');

app.http('authRegister', {
  methods:   ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'auth/register',
  handler:   handle(async (request) => {
    const { username, displayName, email, phone, password, role } = await request.json();

    if (!username || !password) return err('Username and password are required');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return err('Invalid username format');
    if (password.length < 8) return err('Password must be at least 8 characters');

    const c = containers.users();

    // Check username taken
    const { resources: existing } = await c.items
      .query({ query: 'SELECT * FROM c WHERE c.username = @u', parameters: [{ name: '@u', value: username }] })
      .fetchAll();
    if (existing.length > 0) return err('Username already taken', 409);

    const hash = await bcrypt.hash(password, 12);
    const user = {
      id:            uuid(),
      username:      username.toLowerCase(),
      displayName:   displayName || username,
      email:         email || null,
      phone:         phone || null,
      passwordHash:  hash,
      role:          'consumer', // All new accounts = consumer. Admin promotes to creator.
      bio:           '',
      location:      '',
      avatarUrl:     '',
      followerCount: 0,
      followingCount:0,
      likedPhotos:   [],
      savedPhotos:   [],
      createdAt:     new Date().toISOString(),
    };

    await c.items.create(user);

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    const { passwordHash, ...safeUser } = user;
    return ok({ token, user: safeUser }, 201);
  }),
});
