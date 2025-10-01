import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const USER = "owner";

export default function Jogo() {
  const players = useQuery(api.players.listActive, {}) ?? [];
  const create = useMutation(api.matches.create);
  const draw = useMutation(api.matches.drawTeams);
  const start = useMutation(api.matches.start);
  const end = useMutation(api.matches.end);
  const addPlayer = useMutation(api.players.add);

  const [name, setName] = useState("");
  const [matchId, setMatchId] = useState<any>(null);

  const live = useQuery(api.matches.liveView, matchId ? { matchId } : "skip");
  const addGoal = useMutation(api.events.addGoal);

  // Estado para registrar assistência
  const [pendingGoal, setPendingGoal] = useState<null | { team: "A" | "B"; scorerId: any }>(null);
  const [assistId, setAssistId] = useState<any | null>(null);

  // Roster por time (já com playerName retornado pelo backend)
  const rosterA = useMemo(
    () => (live?.roster ?? []).filter((r: any) => r.team === "A"),
    [live]
  );
  const rosterB = useMemo(
    () => (live?.roster ?? []).filter((r: any) => r.team === "B"),
    [live]
  );

  const onAdd = async () => {
    if (!name.trim()) return;
    await addPlayer({ name: name.trim(), userId: USER });
    setName("");
  };

  const onStart = async () => {
    if (players.length < 2) return alert("Adicione pelo menos 2 jogadores");
    const id = await create({ userId: USER });
    await draw({ matchId: id, playerIds: players.map((p: any) => p._id) });
    await start({ matchId: id });
    setMatchId(id);
  };

  const onEnd = async () => {
    if (!matchId) return;
    await end({ matchId });
    setMatchId(null);
    setPendingGoal(null);
    setAssistId(null);
  };

  // Abrir UI de assistência (opcional) após escolher o autor do gol
  const promptAssistFor = (scorerId: any, team: "A" | "B") => {
    setPendingGoal({ team, scorerId });
    setAssistId(null);
  };

  // Confirmar gol com/sem assistência
  const confirmGoal = async () => {
    if (!pendingGoal || !matchId) return;
    await addGoal({
      matchId,
      scorerId: pendingGoal.scorerId,
      team: pendingGoal.team,
      userId: USER,
      assistId: assistId || undefined,
    });
    setPendingGoal(null);
    setAssistId(null);
  };

  // Para popular o select de assistência do mesmo time (exclui o autor do gol)
  const assistOptions = useMemo(() => {
    if (!pendingGoal) return [];
    const pool = pendingGoal.team === "A" ? rosterA : rosterB;
    return pool.filter((r: any) => r.playerId.id !== pendingGoal.scorerId.id);
  }, [pendingGoal, rosterA, rosterB]);

  return (
    <main style={{ maxWidth: 860, margin: "24px auto", padding: 16 }}>
      <h2>Nexus Play — Jogo</h2>

      <section style={card}>
        <h3>Jogadores</h3>
        <ul>
          {players.map((p: any) => (
            <li key={p._id}>{p.name}</li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do jogador"
          />
          <button onClick={onAdd}>Adicionar</button>
        </div>
      </section>

      <section style={card}>
        <h3>Partida</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onStart} disabled={!players.length}>
            Sortear times & Iniciar
          </button>
          <button onClick={onEnd} disabled={!matchId}>
            Encerrar partida
          </button>
        </div>
        {matchId && <p style={{ marginTop: 8 }}>Partida ativa: {String(matchId.id ?? matchId)}</p>}
      </section>

      {matchId && live && (
        <section style={card}>
          <h3>
            Ao vivo — Placar: A {live.scoreA} x {live.scoreB} B
          </h3>

          {/* UI de assistência (aparece quando clicou em um autor do gol) */}
          {pendingGoal && (
            <div style={assistBox}>
              <div>
                <strong>Registrar gol — Time {pendingGoal.team}</strong>
              </div>
              <div style={{ marginTop: 6 }}>
                <div>Autor: <code>#{pendingGoal.scorerId.id}</code></div>
                <label style={{ display: "block", marginTop: 6 }}>
                  Assistência (opcional):
                  <select
                    value={assistId?.id ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return setAssistId(null);
                      const found = assistOptions.find((o: any) => o.playerId.id === val);
                      setAssistId(found?.playerId ?? null);
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    <option value="">Sem assistência</option>
                    {assistOptions.map((o: any) => (
                      <option key={o._id} value={o.playerId.id}>
                        {o.playerName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={confirmGoal}>Confirmar gol</button>
                <button onClick={() => { setPendingGoal(null); setAssistId(null); }}>Cancelar</button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <Team
              title="Time A"
              roster={rosterA}
              team="A"
              onScore={(r: any) => promptAssistFor(r.playerId, "A")}
            />
            <Team
              title="Time B"
              roster={rosterB}
              team="B"
              onScore={(r: any) => promptAssistFor(r.playerId, "B")}
            />
          </div>
        </section>
      )}

      <Ranking />
    </main>
  );
}

function Team({
  title,
  roster,
  team,
  onScore,
}: {
  title: string;
  roster: any[];
  team: "A" | "B";
  onScore: (r: any) => void;
}) {
  return (
    <div>
      <h4>{title}</h4>
      {roster.map((r: any) => (
        <button key={r._id} onClick={() => onScore(r)}>
          Gol — {r.playerName}
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
      <ol>
        {list.map((r: any) => (
          <li key={r.id.id}>
            {r.name} — {r.goals} G • {r.assists} A
          </li>
        ))}
      </ol>
    </section>
  );
}

const card: React.CSSProperties = {
  margin: "16px 0",
  padding: 12,
  border: "1px solid #eee",
  borderRadius: 12,
};

const assistBox: React.CSSProperties = {
  padding: 12,
  border: "1px dashed #999",
  borderRadius: 10,
  background: "#fafafa",
  margin: "8px 0 12px",
};