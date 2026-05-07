/* POST /api/auth/login */
const { app }        = require('@azure/functions');
const bcrypt         = require('bcryptjs');
const { containers } = require('../shared/cosmos');
const { signToken }  = require('../shared/auth');
const { ok, err, handle } = require('../shared/helpers');

app.http('authLogin', {
  methods:   ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route:     'auth/login',
  handler:   handle(async (request) => {
    const { email, username, password } = await request.json();

    if (!password) return err('Password is required');
    if (!email && !username) return err('Email or username is required');

    const c = containers.users();
    let query, params;

    if (email) {
      query  = 'SELECT * FROM c WHERE c.email = @val';
      params = [{ name: '@val', value: email }];
    } else {
      query  = 'SELECT * FROM c WHERE c.username = @val';
      params = [{ name: '@val', value: username.toLowerCase() }];
    }

    const { resources } = await c.items.query({ query, parameters: params }).fetchAll();
    if (resources.length === 0) return err('Invalid credentials', 401);

    const user = resources[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return err('Invalid credentials', 401);

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    const { passwordHash, ...safeUser } = user;
    return ok({ token, user: safeUser });
  }),
});
