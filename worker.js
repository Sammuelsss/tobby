// Worker: sirve la app (public/) y reenvía el chat a Dify sin exponer la API key.
// Variables en Cloudflare (Settings → Variables and Secrets):
//   DIFY_API_KEY  (Secret, obligatoria)  -> la API key de tu app en Dify
//   DIFY_API_URL  (opcional)             -> por defecto https://api.dify.ai/v1

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      if (!env.DIFY_API_KEY) {
        return json({ error: "Falta el secret DIFY_API_KEY en Cloudflare." }, 500);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Solicitud inválida." }, 400);
      }

      const query = String(body.query || "").slice(0, 4000);
      if (!query.trim()) return json({ error: "Mensaje vacío." }, 400);

      const base = (env.DIFY_API_URL || "https://api.dify.ai/v1").replace(/\/$/, "");
      const upstream = await fetch(`${base}/chat-messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.DIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {},
          query,
          response_mode: "streaming",
          conversation_id: body.conversation_id || "",
          user: String(body.user || "tobby-user").slice(0, 64),
        }),
      });

      if (!upstream.ok) {
        const text = await upstream.text();
        return json({ error: `Dify respondió ${upstream.status}`, detail: text.slice(0, 500) }, 502);
      }

      return new Response(upstream.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
