import { useState } from "react";

export default function JogoFallback() {
    const [players, setPlayers] = useState<string[]>([]);
    const [name, setName] = useState("");
    const [matchId, setMatchId] = useState<string | null>(null);
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);

    const onAdd = () => {
        if (!name.trim()) return;
        setPlayers([...players, name.trim()]);
        setName("");
    };

    const onStart = () => {
        if (players.length < 2) return alert("Adicione pelo menos 2 jogadores");
        setMatchId("match-" + Date.now());
    };

    const addGoalA = () => setScoreA(scoreA + 1);
    const addGoalB = () => setScoreB(scoreB + 1);

    return (
        <main style={{ maxWidth: 820, margin: "24px auto", padding: 16 }}>
            <h2>Nexus Play — Jogo (Modo Fallback)</h2>
            <p style={{ color: '#666', marginBottom: 20 }}>
                ⚠️ Convex não conectado - usando modo local
            </p>

            <section style={card}>
                <h3>Jogadores</h3>
                <ul>{players.map((p, i) => <li key={i}>{p}</li>)}</ul>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nome do jogador"
                    />
                    <button onClick={onAdd}>Adicionar</button>
                </div>
            </section>

            <section style={card}>
                <h3>Partida</h3>
                <button onClick={onStart} disabled={!players.length}>
                    Sortear times & Iniciar
                </button>
                {matchId && <p>Partida ativa: {matchId}</p>}
            </section>

            {matchId && (
                <section style={card}>
                    <h3>Ao vivo — Placar: A {scoreA} x {scoreB} B</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <h4>Time A</h4>
                            <button onClick={addGoalA}>Gol Time A</button>
                        </div>
                        <div>
                            <h4>Time B</h4>
                            <button onClick={addGoalB}>Gol Time B</button>
                        </div>
                    </div>
                </section>
            )}

            <section style={card}>
                <h3>Status</h3>
                <p>✅ Sistema funcionando em modo local</p>
                <p>⚠️ Dados não persistem (modo fallback)</p>
                <p>🔧 Para funcionalidade completa, configure o Convex dev</p>
            </section>
        </main>
    );
}

const card: React.CSSProperties = {
    margin: "16px 0",
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 12
};
