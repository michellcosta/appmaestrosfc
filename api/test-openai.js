export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY || "";
  if (!key) {
    res.status(500).json({ ok: false, reason: "missing_key", message: "OPENAI_API_KEY não encontrada" });
    return;
  }

  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      }
    });

    const text = await r.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }

    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      body: body,
      runtime: "vercel-esm-no-templates"
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      reason: "handler_crash",
      message: err?.message || String(err)
    });
  }
}
