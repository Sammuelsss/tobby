# Tobby

Chat PWA para hablar con el agente de Dify desde el teléfono. Se despliega en Cloudflare Workers.

- `public/` — la app (HTML, manifest, service worker, íconos)
- `src/worker.js` — Worker que reenvía el chat a Dify con la API key oculta
- `wrangler.jsonc` — configuración de Cloudflare

Variables en Cloudflare (Settings → Variables and Secrets):
- `DIFY_API_KEY` (Secret) — API key de la app en Dify
- `DIFY_API_URL` (opcional) — por defecto `https://api.dify.ai/v1`
