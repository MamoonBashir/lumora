/* Lumora — Response helpers + CORS */

const ALLOWED = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());

function corsHeaders(request) {
  const origin = (request && request.headers && request.headers.get('origin')) || '';
  const allowed = ALLOWED.includes('*')
    ? '*'
    : ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age':       '86400',
  };
}

/* Standard JSON success response */
function ok(data, status = 200, request) {
  return {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    body: JSON.stringify(data),
  };
}

/* Standard JSON error response */
function err(message, status = 400, request) {
  return {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
    body: JSON.stringify({ error: message }),
  };
}

/* CORS preflight response */
function preflight(request) {
  return { status: 204, headers: corsHeaders(request) };
}

/* Wrap handler — catches errors + handles OPTIONS automatically */
function handle(fn) {
  return async (request, context) => {
    if (request.method === 'OPTIONS') return preflight(request);
    try {
      const result = await fn(request, context);
      // Inject correct CORS origin into whatever the handler returned
      if (result && result.headers) {
        Object.assign(result.headers, corsHeaders(request));
      }
      return result;
    } catch (e) {
      context?.error?.(e);
      return err(e.message || 'Internal server error', e.status || 500, request);
    }
  };
}

module.exports = { ok, err, preflight, handle, corsHeaders };
