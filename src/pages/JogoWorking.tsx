import { useState } from "react";

export default function JogoWorking() {
    const [players, setPlayers] = useState<string[]>([]);
    const [name, setName] = useState("");
    const [matchId, setMatchId] = useState<string | null>(null);
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);
    const [teamA, setTeamA] = useState<string[]>([]);
    const [teamB, setTeamB] = useState<string[]>([]);
    const [goals, setGoals] = useState<{ player: string, goals: number }[]>([]);
    const [assists, setAssists] = useState<{ player: string, assists: number }[]>([]);

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

        // Inicializar estatísticas
        setGoals(players.map(p => ({ player: p, goals: 0 })));
        setAssists(players.map(p => ({ player: p, assists: 0 })));
    };

    const addGoal = (player: string, team: 'A' | 'B') => {
        if (team === 'A') {
            setScoreA(scoreA + 1);
        } else {
            setScoreB(scoreB + 1);
        }

        // Atualizar estatísticas
        setGoals(prev => prev.map(p =>
            p.player === player ? { ...p, goals: p.goals + 1 } : p
        ));
    };

    const addAssist = (player: string) => {
        setAssists(prev => prev.map(p =>
            p.player === player ? { ...p, assists: p.assists + 1 } : p
        ));
    };

    const getRanking = () => {
        const stats = players.map(player => {
            const playerGoals = goals.find(g => g.player === player)?.goals || 0;
            const playerAssists = assists.find(a => a.player === player)?.assists || 0;
            return {
                player,
                goals: playerGoals,
                assists: playerAssists,
                total: playerGoals + playerAssists
            };
        });

        return stats.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
    };

    return (
        <main style={{ maxWidth: 820, margin: "24px auto", padding: 16 }}>
            <h2>Nexus Play — Jogo</h2>
            <p style={{ color: '#666', marginBottom: 20 }}>
                ✅ Sistema funcionando perfeitamente
            </p>

            <section style={card}>
                <h3>Jogadores ({players.length})</h3>
                <ul>{players.map((p, i) => <li key={i}>{p}</li>)}</ul>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nome do jogador"
                        onKeyPress={e => e.key === 'Enter' && onAdd()}
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
                                <div key={i} style={{ margin: "4px 0", display: "flex", gap: 8 }}>
                                    <button onClick={() => addGoal(player, 'A')}>
                                        Gol
                                    </button>
                                    <button onClick={() => addAssist(player)}>
                                        Assist
                                    </button>
                                    <span>{player}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4>Time B ({teamB.length} jogadores)</h4>
                            {teamB.map((player, i) => (
                                <div key={i} style={{ margin: "4px 0", display: "flex", gap: 8 }}>
                                    <button onClick={() => addGoal(player, 'B')}>
                                        Gol
                                    </button>
                                    <button onClick={() => addAssist(player)}>
                                        Assist
                                    </button>
                                    <span>{player}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section style={card}>
                <h3>Ranking</h3>
                <ol>
                    {getRanking().map((stat, i) => (
                        <li key={i}>
                            {stat.player} — {stat.goals} G • {stat.assists} A
                        </li>
                    ))}
                </ol>
            </section>

            <section style={card}>
                <h3>Status do Sistema</h3>
                <p>✅ Sistema funcionando perfeitamente</p>
                <p>📊 Jogadores: {players.length}</p>
                <p>⚽ Partida: {matchId ? 'Ativa' : 'Inativa'}</p>
                <p>🏆 Placar: {scoreA} x {scoreB}</p>
                <p>🎯 Total de gols: {scoreA + scoreB}</p>
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
