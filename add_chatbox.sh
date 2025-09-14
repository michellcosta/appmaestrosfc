#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai"

echo "==> Garantindo que está na branch $BRANCH..."
git checkout $BRANCH

echo "==> Criando pasta src/components (se não existir)..."
mkdir -p src/components

echo "==> Criando ChatBox.tsx..."
cat > src/components/ChatBox.tsx <<'TSX'
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setLoading(true);
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: text }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          system: "Você é um assistente do App Maestros FC.",
          model: "gpt-4o-mini",
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || json?.message || HTTP ${res.status});
      }

      const reply: string =
        json.content ??
        json.openai_raw?.choices?.[0]?.message?.content ??
        "(sem conteúdo)";
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e?.message || "Falha ao chamar /api/chat");
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-4 shadow">
      <div
        ref={listRef}
        className="mb-3 h-80 overflow-y-auto rounded-xl border bg-gray-50 p-3"
      >
        {msgs.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            diga “olá” para começar o bate-papo 👋
          </p>
        )}
        <div className="space-y-3">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-emerald-600 px-3 py-2 text-white"
                  : "mr-auto max-w-[85%] rounded-2xl bg-gray-200 px-3 py-2 text-gray-900"
              }
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="mr-auto w-24 animate-pulse rounded-2xl bg-gray-200 px-3 py-2 text-gray-500">
              digitando…
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-2 rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Escreva sua mensagem…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
TSX

echo "==> Injetando ChatBox no App.tsx (se não existir já)..."
if grep -q "ChatBox" src/App.tsx 2>/dev/null; then
  echo "App.tsx já tem ChatBox, não modificado."
else
  cat > src/App.tsx <<'TSX'
import ChatBox from "./components/ChatBox";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-4 text-center text-2xl font-bold">Chat • Maestros FC</h1>
      <ChatBox />
    </div>
  );
}
TSX
fi

echo "==> Commitando e fazendo push..."
git add src/components/ChatBox.tsx src/App.tsx
git commit -m "feat(ui): adiciona ChatBox integrado com /api/chat"
git push origin "$BRANCH"

echo "✅ Pronto! Deploy sendo feito no Vercel, teste o chat no preview."
