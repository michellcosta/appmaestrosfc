import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

const USER = "owner";

// Debug da URL do Convex
console.log("VITE_CONVEX_URL =", import.meta.env.VITE_CONVEX_URL);

export default function Jogo() {
    const players = useQuery(api.players.listActive, {}) ?? [];
    const create = useMutation(api.matches.create);
    const draw = useMutation(api.matches.drawTeams);
    const start = useMutation(api.matches.start);
    const addPlayer = useMutation(api.players.add);
    const [name, setName] = useState("");
    const [matchId, setMatchId] = useState<any>(null);
    const live = useQuery(api.matches.liveView, matchId ? { matchId } : "skip");
    const addGoal = useMutation(api.events.addGoal);

    const onAdd = async () => {
        if (!name.trim()) return;
        await addPlayer({ name: name.trim(), userId: USER });
        setName("");
    };

    const onStart = async () => {
        if (players.length < 2) return alert("Adicione pelo menos 2 jogadores");
        const id = await create({ userId: USER });
        await draw({ matchId: id, playerIds: players.map(p => (p as any)._id) });
        await start({ matchId: id });
        setMatchId(id);
    };

    return (
        <main style={{ maxWidth: 820, margin: "24px auto", padding: 16 }}>
            <h2>Nexus Play — Jogo</h2>

            <section style={card}>
                <h3>Jogadores</h3>
                <ul>{players.map((p: any) => <li key={p._id}>{p.name}</li>)}</ul>
                <div style={{ display: "flex", gap: 8 }}>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do jogador" />
                    <button onClick={onAdd}>Adicionar</button>
                </div>
            </section>

            <section style={card}>
                <h3>Partida</h3>
                <button onClick={onStart} disabled={!players.length}>Sortear times & Iniciar</button>
                {matchId && <p>Partida ativa: {String((matchId as any).id ?? matchId)}</p>}
            </section>

            {matchId && live && (
                <section style={card}>
                    <h3>Ao vivo — Placar: A {live.scoreA} x {live.scoreB} B</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Team live={live} team="A" matchId={matchId} addGoal={addGoal} />
                        <Team live={live} team="B" matchId={matchId} addGoal={addGoal} />
                    </div>
                </section>
            )}

            <Ranking />
        </main>
    );
}

function Team({ live, team, matchId, addGoal }: any) {
    const roster = live.roster.filter((r: any) => r.team === team);
    return (
        <div>
            <h4>Time {team}</h4>
            {roster.map((r: any) => (
                <button key={r._id} onClick={() => addGoal({ matchId, scorerId: r.playerId, team, userId: "owner" })}>
                    Gol — #{r.playerId.id}
                </button>
            ))}
        </div>
    );
}

function Ranking() {
    const list = useQuery(api.events.rankingTop, { limit: 100 }) ?? [];
    return (
        <section style={card}>
            <h3>Ranking</h3>
            <ol>{list.map((r: any) => <li key={r.id.id}>{r.name} — {r.goals} G • {r.assists} A</li>)}</ol>
        </section>
    );
}

const card: React.CSSProperties = { margin: "16px 0", padding: 12, border: "1px solid #eee", borderRadius: 12 };
