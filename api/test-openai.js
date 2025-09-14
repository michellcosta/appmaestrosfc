function keyInfo(key) {
  if (!key) return { hasKey: false, type: "none", prefix: null };
  const pref = key.slice(0, 7);
  let type = "unknown";
  if (key.startsWith("sk-proj-")) type = "project";
  else if (key.startsWith("sk-live-")) type = "user-live";
  else if (key.startsWith("sk-")) type = "user";
  return { hasKey: true, type, prefix: pref };
}

export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY;
  const info = keyInfo(key);

  if (!info.hasKey) {
    res.status(500).json({
      ok: false,
      reason: "missing_key",
      message: "OPENAI_API_KEY não encontrada no ambiente do Vercel.",
      hints: [
        "No Vercel > Settings > Environment Variables, crie OPENAI_API_KEY (Preview/Production).",
        "Faça um redeploy do preview após adicionar/alterar a variável."
      ],
      diagnostics: { node: process.version, info }
    });
    return;
  }

  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": Bearer ${key},
        "Content-Type": "application/json"
      }
    });

    const text = await r.text();
    let body; try { body = JSON.parse(text); } catch { body = text; }

    if (!r.ok) {
      const status = r.status;
      const hints = [];

      // Sugestões baseadas no tipo da chave + status mais comuns
      if (status === 401) {
        hints.push(
          "Confirme se a chave está correta (sem espaços/quebras de linha).",
          "Se for 'sk-proj-': verifique se o Project permite uso da API de modelos.",
          "Se for 'sk-live-' ou 'sk-': verifique se sua conta tem saldo/quota ativa.",
          "Troque temporariamente por uma User API Key (sk-live-/sk-...) só para validar."
        );
      } else if (status === 429) {
        hints.push(
          "Limite/Quota atingido. Verifique billing e usage no painel da OpenAI.",
          "Espere alguns minutos ou use outra organização/projeto com limite disponível."
        );
      } else {
        hints.push(
          "Verifique permissões do Project/Organization e o tipo de chave.",
          "Teste localmente com a mesma chave: curl -H 'Authorization: Bearer <KEY>' https://api.openai.com/v1/models"
        );
      }

      res.status(status).json({
        ok: false,
        status,
        reason: "openai_error",
        body,
        diagnostics: { node: process.version, info },
        hints
      });
      return;
    }

    // Sucesso
    const models = Array.isArray(body?.data) ? body.data.slice(0, 5).map(m => m.id) : [];
    res.status(200).json({
      ok: true,
      models,
      diagnostics: { node: process.version, info }
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      reason: "fetch_failed",
      message: err?.message || "erro desconhecido",
      diagnostics: { node: process.version, info }
    });
  }
}
