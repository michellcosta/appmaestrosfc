/**
 * CommonJS handler para projetos ESM ("type":"module").
 * Mantém a URL /api/test-openai (Vercel resolve .cjs automaticamente).
 */
module.exports = async function (req, res) {
  try {
    var key = process.env.OPENAI_API_KEY || "";
    if (!key) {
      res.status(500).json({ ok: false, reason: "missing_key", message: "OPENAI_API_KEY não encontrada" });
      return;
    }

    // Chamada simples à API de modelos (retorna texto para evitar JSON malformado)
    var r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      }
    });

    var text = await r.text();
    var parsed;
    try { parsed = JSON.parse(text); } catch (e) { parsed = text; }

    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      body: parsed,
      runtime: "vercel-commonjs(.cjs)"
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      reason: "handler_crash",
      message: (err && err.message) ? err.message : String(err)
    });
  }
};
