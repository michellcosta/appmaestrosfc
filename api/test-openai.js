function withTimeout(promise, ms = 8000) {
  let t;
  const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error("fetch timeout")), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("OPENAI_API_KEY ausente no ambiente do Vercel.");
    res.status(500).json({ ok: false, message: "OPENAI_API_KEY não encontrada" });
    return;
  }

  try {
    console.log("Chamando OpenAI /v1/models ...");
    const r = await withTimeout(fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: Bearer ${key} },
    }));

    const text = await r.text();
    if (!r.ok) {
      console.error("OpenAI retornou erro:", r.status, text.slice(0, 300));
      res.status(r.status).json({ ok: false, message: text });
      return;
    }

    const data = JSON.parse(text);
    const models = Array.isArray(data?.data) ? data.data.slice(0, 3).map((m) => m.id) : [];
    res.status(200).json({ ok: true, models, runtime: "vercel-esm" });
  } catch (err) {
    console.error("Falha ao chamar OpenAI:", err?.message || err);
    res.status(500).json({ ok: false, message: err?.message || "erro desconhecido" });
  }
}
