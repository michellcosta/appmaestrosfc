/**
 * Rota de diagnóstico da OpenAI em CommonJS.
 * - Sem ESM / export default
 * - Sem template strings (evita '$' fora de contexto)
 */
module.exports = async function (req, res) {
  try {
    var key = process.env.OPENAI_API_KEY || "";
    if (!key) {
      res.status(500).json({ ok: false, reason: "missing_key", message: "OPENAI_API_KEY não encontrada" });
      return;
    }

    // Chama a API de modelos
    var r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      }
    });

    var text = await r.text();
    var body;
    try { body = JSON.parse(text); } catch (e) { body = text; }

    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      body: body,
      runtime: "vercel-commonjs"
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      reason: "handler_crash",
      message: (err && err.message) ? err.message : String(err)
    });
  }
};
