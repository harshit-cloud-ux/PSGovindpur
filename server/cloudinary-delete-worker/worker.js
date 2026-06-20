/**
 * Cloudflare Worker — signed Cloudinary delete.
 *
 * The api_secret lives ONLY here (as a Worker secret), never in the app.
 * The app POSTs { publicId } and an admin token; this worker signs the
 * request and calls Cloudinary's destroy API.
 *
 * Secrets (set with `wrangler secret put NAME`):
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   ADMIN_TOKEN            a long random string the app sends in the X-Admin-Token header
 *
 * Plain var (in wrangler.toml):
 *   CLOUDINARY_CLOUD_NAME = "dgjxqjvbv"
 */

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') {
      return json({ error: 'method not allowed' }, 405, cors);
    }

    // Gate: only callers with the shared admin token may delete.
    if (request.headers.get('X-Admin-Token') !== env.ADMIN_TOKEN) {
      return json({ error: 'unauthorized' }, 401, cors);
    }

    let publicId;
    try {
      ({ publicId } = await request.json());
    } catch {
      return json({ error: 'bad json' }, 400, cors);
    }
    if (!publicId) return json({ error: 'publicId required' }, 400, cors);

    // Cloudinary destroy requires a SHA-1 signature of the sorted params + secret.
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
    const signature = await sha1(toSign);

    const form = new URLSearchParams();
    form.set('public_id', publicId);
    form.set('timestamp', String(timestamp));
    form.set('api_key', env.CLOUDINARY_API_KEY);
    form.set('signature', signature);

    const cdRes = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      { method: 'POST', body: form }
    );
    const data = await cdRes.json();

    // data.result is "ok" on success, "not found" if already gone.
    return json(data, cdRes.ok ? 200 : 502, cors);
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

async function sha1(str) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
