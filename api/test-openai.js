export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(500).json({ ok: false, message: "OPENAI_API_KEY não encontrada" });
    return;
  }

  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: Bearer ${key} },
    });

    if (!r.ok) {
      const text = await r.text();
      res.status(r.status).json({ ok: false, message: text });
      return;
    }

    const data = await r.json();
    res.status(200).json({
      ok: true,
      models: Array.isArray(data?.data) ? data.data.slice(0, 3).map((m) => m.id) : [],
      runtime: "vercel-esm",
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message || "erro desconhecido" });
  }
}
