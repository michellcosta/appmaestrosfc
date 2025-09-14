// Função com logs detalhados para capturar erros da OpenAI
export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(500).json({ ok: false, message: "OPENAI_API_KEY não encontrada" });
    return;
  }

  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": \Bearer \${key}\,
        "Content-Type": "application/json",
      },
    });

    const text = await r.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      body: parsed,
      note: "log detalhado para depuração"
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message || "erro desconhecido",
    });
  }
}
