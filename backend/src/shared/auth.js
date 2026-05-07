/* Lumora — JWT auth utilities */
const jwt = require('jsonwebtoken');

const SECRET  = () => process.env.JWT_SECRET  || 'lumora-dev-secret';
const EXPIRES = () => process.env.JWT_EXPIRES || '7d';

function signToken(payload) {
  return jwt.sign(payload, SECRET(), { expiresIn: EXPIRES() });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET());
}

/* Extract + verify JWT from Authorization header.
   Returns decoded payload or throws. */
function requireAuth(request) {
  const header = request.headers.get('authorization') || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw Object.assign(new Error('No token provided'), { status: 401 });
  try {
    return verifyToken(token);
  } catch {
    throw Object.assign(new Error('Invalid or expired token'), { status: 401 });
  }
}

/* Same as requireAuth but also checks role === 'creator' */
function requireCreator(request) {
  const user = requireAuth(request);
  if (user.role !== 'creator') {
    throw Object.assign(new Error('Creator access required'), { status: 403 });
  }
  return user;
}

module.exports = { signToken, verifyToken, requireAuth, requireCreator };
