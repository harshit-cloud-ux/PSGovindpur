# Cloudinary delete worker

Tiny server endpoint that performs the **signed** Cloudinary delete so the
`api_secret` never ships inside the mobile app.

## Deploy (Cloudflare, free)

```bash
npm install -g wrangler
cd server/cloudinary-delete-worker

wrangler login

# set the three secrets (you'll be prompted to paste each value)
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET
wrangler secret put ADMIN_TOKEN          # any long random string, e.g. `openssl rand -hex 24`

wrangler deploy
```

Deploy prints a URL like `https://ps-govindpur-delete.<you>.workers.dev`.

## Wire it into the app

1. Put that URL in `src/config/cloudinary.js` → `deleteEndpoint`.
2. Put the **same** ADMIN_TOKEN value in the app so it can send the
   `X-Admin-Token` header. Keep it out of git — read it from an Expo
   env/extra config, not a hardcoded string in a committed file.

## Prefer Cloud Run / FastAPI instead?

The logic is ~30 lines (sign params with SHA-1, POST to `/image/destroy`).
Say the word and I'll hand you the FastAPI equivalent for your existing
Cloud Run setup.
