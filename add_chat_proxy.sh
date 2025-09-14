#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai"
FILE="api/chat.js"

echo "==> Trocando para a branch $BRANCH..."
git checkout "$BRANCH"

echo "==> Criando pasta /api (se faltar) e escrevendo $FILE..."
mkdir -p api
cat > "$FILE" <<'JS'
// /api/chat.js - Vercel Serverless (Vite/React)
// Proxy seguro para OpenAI (POST).
// Requer: OPENAI_API_KEY no Vercel (Development/Preview/Production).
// Uso (frontend):
// fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ message: 'Olá!', system: 'Você é um assistente.', model: 'gpt-4o-mini' })
// })

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ ok: false, message: 'Use POST' });
      return;
    }

    // Lê o corpo (Node IncomingMessage)
    const bodyStr = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', c => { data += c; });
      req.on('end', () => resolve(data || '{}'));
      req.on('error', reject);
    });

    let body;
    try { body = JSON.parse(bodyStr); } catch (e) {
      res.status(400).json({ ok: false, message: 'JSON inválido no body' });
      return;
    }

    const key = process.env.OPENAI_API_KEY || '';
    if (!key) {
      res.status(500).json({ ok: false, message: 'OPENAI_API_KEY não configurada' });
      return;
    }

    // Campos aceitos no request:
    const userMessage = body.message;                  // string opcional
    const messagesIn = body.messages;                  // array opcional (formato OpenAI)
    const system = body.system || 'Você é um assistente útil.';
    const model = body.model || 'gpt-4o-mini';
    const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
    const max_tokens = typeof body.max_tokens === 'number' ? body.max_tokens : 300;

    let messages;
    if (Array.isArray(messagesIn) && messagesIn.length) {
      messages = messagesIn;
    } else {
      // Monta um chat mínimo com system + user
      messages = [
        { role: 'system', content: system },
        { role: 'user', content: String(userMessage ?? '') }
      ];
    }

    // Chamada à OpenAI (Chat Completions)
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
      })
    });

    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }

    if (!r.ok) {
      res.status(r.status).json({ ok: false, status: r.status, error: data });
      return;
    }

    // Extrai a resposta mais comum
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ?? '';

    res.status(200).json({
      ok: true,
      model,
      content,
      // Se quiser só o texto, comente a linha abaixo:
      openai_raw: data
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: err?.message || String(err) });
  }
}
JS

echo "==> Commitando e enviando..."
git add "$FILE"
git commit -m "feat(api): adiciona proxy /api/chat (Vite + Vercel Serverless)"
git push origin "$BRANCH"

echo
echo "✅ Proxy /api/chat criado e enviado para $BRANCH."
echo "Assim que o Preview do Vercel ficar Ready, teste com POST em:"
echo "https://<seu-preview>.vercel.app/api/chat"
