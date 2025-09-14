import type { NextApiRequest, NextApiResponse } from "next";

/**
 * POST /api/analisa-partida
 * Body (exemplo):
 * {
 *   "rodada": 3,
 *   "duracaoMin": 10,
 *   "times": ["Preto","Verde"],
 *   "placar": {"Preto": 3, "Verde": 1},
 *   "gols": [
 *     {"min":1,"time":"Preto","jogador":"Michell"},
 *     {"min":4,"time":"Preto","jogador":"João","assistencia":"Leo"},
 *     {"min":7,"time":"Verde","jogador":"Pedro"},
 *     {"min":9,"time":"Preto","jogador":"Michell"}
 *   ],
 *   "observacoes": "Jogo pegado, muitas finalizações."
 * }
 *
 * Resposta:
 * {
 *   ok: true,
 *   resumo: "…",
 *   destaques: ["…","…"],
 *   mvp: "Michell",
 *   estatisticas: { chutes?: number, defesas?: number, posse?: string },
 *   modelo: "gpt-4o-mini"
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Use POST" });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ ok: false, message: "OPENAI_API_KEY não configurada" });

  try {
    const body = req.body || {};
    const { rodada, duracaoMin, times, placar, gols, observacoes } = body;

    // Validação mínima
    if (!times || !Array.isArray(times) || times.length !== 2 || !placar) {
      return res.status(400).json({ ok: false, message: "Payload inválido: envie times[2] e placar" });
    }

    const modelo = "gpt-4o-mini"; // barato e bom p/ texto
    const prompt = [
      "Você é um narrador esportivo. Gere um resumo conciso e empolgante da pelada.",
      "Dados da partida:",
      `• Rodada: ${rodada ?? "?"} | Duração: ${duracaoMin ?? "?"} min`,
      `• Times: ${times?.join(" vs ")} | Placar: ${JSON.stringify(placar)}`,
      `• Gols: ${Array.isArray(gols) ? gols.map((g:any)=>`${g.min}' ${g.time} – ${g.jogador}${g.assistencia?` (assist. ${g.assistencia})`:""}`).join("; ") : "—"}`,
      observacoes ? `• Observações: ${observacoes}` : "",
      "",
      "Devolva um JSON com as chaves exatamente: resumo (string), destaques (array de strings), mvp (string) e estatisticas (objeto com chaves opcionais como chutes, defesas, posse). Nada além do JSON."
    ].join("\n");

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelo,
        messages: [
          { role: "system", content: "Você escreve como narrador esportivo e responde em JSON válido." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: "json_object" } // força JSON
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ ok: false, message: text });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { /* já pedimos JSON */ }

    return res.status(200).json({ ok: true, ...parsed, modelo });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err?.message ?? "erro desconhecido" });
  }
}
