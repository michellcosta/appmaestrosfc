import { useState } from "react";

export default function JogoSimple() {
    const [players, setPlayers] = useState<string[]>([]);
    const [name, setName] = useState("");
    const [matchId, setMatchId] = useState<string | null>(null);
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);
    const [teamA, setTeamA] = useState<string[]>([]);
    const [teamB, setTeamB] = useState<string[]>([]);

    const onAdd = () => {
        if (!name.trim()) return;
        setPlayers([...players, name.trim()]);
        setName("");
    };

    const onStart = () => {
        if (players.length < 2) return alert("Adicione pelo menos 2 jogadores");

        // Sortear times
        const shuffled = [...players].sort(() => Math.random() - 0.5);
        const half = Math.ceil(shuffled.length / 2);
        setTeamA(shuffled.slice(0, half));
        setTeamB(shuffled.slice(half));
        setMatchId("match-" + Date.now());
    };

    const addGoalA = () => setScoreA(scoreA + 1);
    const addGoalB = () => setScoreB(scoreB + 1);

    return (
        <main style={{ maxWidth: 820, margin: "24px auto", padding: 16 }}>
            <h2>Nexus Play — Jogo</h2>

            <section style={card}>
                <h3>Jogadores ({players.length})</h3>
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
                <button onClick={onStart} disabled={players.length < 2}>
                    Sortear times & Iniciar
                </button>
                {matchId && <p>Partida ativa: {matchId}</p>}
            </section>

            {matchId && (
                <section style={card}>
                    <h3>Ao vivo — Placar: A {scoreA} x {scoreB} B</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <h4>Time A ({teamA.length} jogadores)</h4>
                            {teamA.map((player, i) => (
                                <div key={i} style={{ margin: "4px 0" }}>
                                    <button onClick={addGoalA} style={{ marginRight: 8 }}>
                                        Gol
                                    </button>
                                    {player}
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4>Time B ({teamB.length} jogadores)</h4>
                            {teamB.map((player, i) => (
                                <div key={i} style={{ margin: "4px 0" }}>
                                    <button onClick={addGoalB} style={{ marginRight: 8 }}>
                                        Gol
                                    </button>
                                    {player}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section style={card}>
                <h3>Status do Sistema</h3>
                <p>✅ Sistema funcionando</p>
                <p>📊 Jogadores: {players.length}</p>
                <p>⚽ Partida: {matchId ? 'Ativa' : 'Inativa'}</p>
                <p>🏆 Placar: {scoreA} x {scoreB}</p>
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
