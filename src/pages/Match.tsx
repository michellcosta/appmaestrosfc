import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useMatchStore, GoalEvent, TeamColor } from "@/store/matchStore";

type FilterRange = "week" | "month" | "all";

/* Cores dos chips de time */
const colorChip: Record<TeamColor, string> = {
  Preto: "bg-zinc-900 text-white",
  Verde: "bg-emerald-600 text-white",
  Cinza: "bg-slate-400 text-zinc-900",
  Vermelho: "bg-red-600 text-white",
};

/* Badge do time */
const TeamBadge: React.FC<{ color: TeamColor; className?: string }> = ({
  color,
  className,
}) => (
  <span
    className={[
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
      colorChip[color],
      className || "",
    ].join(" ")}
  >
    {color}
  </span>
);

/* mock de permissão local (seu app pode trocar por auth real) */
const userRole: "owner" | "admin" | "aux" | "mensalista" | "diarista" = "owner";
const canEdit = (role: typeof userRole) => ["owner", "admin", "aux"].includes(role);

/* mock de jogadores por time */
const defaultTeamPlayers: Record<TeamColor, string[]> = {
  Preto: ["Michell", "Thiago"],
  Verde: ["Sérgio Jr", "Oton"],
  Cinza: ["Jorge", "Yuri"],
  Vermelho: ["Maurício", "Gabriel"],
};

const Match: React.FC = () => {
  const {
    round,
    durationMin,
    events,
    history,
    setDuration,
    start,
    pause,
    reset,
    addGoal,
    editGoal,
    deleteGoal,
    endRoundChooseNext,
  } = useMatchStore();

  /* Safeguards para não quebrar caso algo venha undefined */
  const roundSafe =
    round && Array.isArray(round.inPlay) && (round.inPlay as any[]).length === 2
      ? round
      : {
          inPlay: ["Preto", "Verde"] as TeamColor[],
          scores: {} as Record<TeamColor, number>,
          number: round?.number ?? 1,
          running: !!round?.running,
        };

  const eventsSafe: GoalEvent[] = Array.isArray(events) ? events : [];
  const historySafe = Array.isArray(history) ? history : [];

  /* Elapsed derivado do store (anti-NaN) */
  const elapsed = useMatchStore((s) => {
    const now = typeof s.now === "number" ? s.now : Date.now();
    const acc = typeof s.accumulatedSec === "number" ? s.accumulatedSec : 0;
    const live = s.runningSince ? Math.max(Math.floor((now - s.runningSince) / 1000), 0) : 0;
    return acc + live;
  });

  /* Estado e helpers do beep/alarme */
  const alvo = durationMin * 60;
  const exceeded = elapsed >= alvo;
  const beepRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = beepRef.current;
    if (!a) return;

    // toca se o tempo estourou e o cronômetro está parado
    if (exceeded && !roundSafe.running) {
      a.loop = true;
      a.volume = 0.5;
      a.play().catch(() => {});
    } else {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
    }
  }, [exceeded, roundSafe.running]);

  // se estourar durante a contagem, pausa automaticamente (trava o cronômetro)
  useEffect(() => {
    if (roundSafe.running && exceeded) {
      pause();
    }
  }, [exceeded, roundSafe.running, pause]);

  /* Cronômetro mm:ss */
  const mmss = useMemo(() => {
    const m = Math.floor(elapsed / 60)
      .toString()
      .padStart(2, "0");
    const s = (elapsed % 60).toString().padStart(2, "0");
    return m + ":" + s;
  }, [elapsed]);

  /* Modais: Gol / Deletar / Encerrar */
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalEditId, setGoalEditId] = useState<string | null>(null);
  const [goalTeam, setGoalTeam] = useState<TeamColor>("Preto");
  const [goalAuthor, setGoalAuthor] = useState<string>("");
  const [goalAssist, setGoalAssist] = useState<string>("none");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<GoalEvent | null>(null);

  const [endOpen, setEndOpen] = useState(false);
  const [nextTeamChoice, setNextTeamChoice] = useState<TeamColor | "_auto">("_auto");

  /* Helpers */
  const playerOptions = (team: TeamColor) => defaultTeamPlayers[team] ?? [];

  const openGoal = (team: TeamColor) => {
    if (!roundSafe.running) return;
    setGoalEditId(null);
    setGoalTeam(team);
    setGoalAuthor(playerOptions(team)[0] ?? "");
    setGoalAssist("none");
    setGoalOpen(true);
  };

  const openEditGoal = (ev: GoalEvent) => {
    setGoalEditId(ev.id);
    setGoalTeam(ev.team);
    setGoalAuthor(ev.author || playerOptions(ev.team)[0] || "");
    setGoalAssist(ev.assist ?? "none");
    setGoalOpen(true);
  };

  const openConfirmDelete = (ev: GoalEvent) => {
    setConfirmTarget(ev);
    setConfirmOpen(true);
  };

  // evita autoassistência
  useEffect(() => {
    if (!goalOpen) return;
    if (goalAssist !== "none" && goalAssist === goalAuthor) setGoalAssist("none");
  }, [goalAuthor, goalAssist, goalOpen]);

  const saveGoal = () => {
    if (!goalAuthor) return;
    const assistVal = goalAssist === "none" ? null : goalAssist;

    if (goalEditId) {
      editGoal(goalEditId, { author: goalAuthor, assist: assistVal ?? null });
    } else {
      addGoal({ team: goalTeam, author: goalAuthor, assist: assistVal ?? null });
    }
    setGoalOpen(false);
    setGoalEditId(null);
  };

  const confirmDelete = () => {
    if (!confirmTarget) return;
    deleteGoal(confirmTarget.id);
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  // times da rodada e scores
  const [left, right] = roundSafe.inPlay as TeamColor[];
  const leftScore = roundSafe.scores[left] ?? 0;
  const rightScore = roundSafe.scores[right] ?? 0;

  // candidatos para próxima rodada
  const candidatos = (["Preto", "Verde", "Cinza", "Vermelho"] as TeamColor[]).filter(
    (t) => t !== left && t !== right
  );

  // estatísticas da sessão
  const stats = useMemo(() => {
    const table: Record<string, { g: number; a: number }> = {};
    for (const e of eventsSafe) {
      if (e.author) {
        table[e.author] = table[e.author] || { g: 0, a: 0 };
        table[e.author].g += 1;
      }
      if (e.assist) {
        table[e.assist] = table[e.assist] || { g: 0, a: 0 };
        table[e.assist].a += 1;
      }
    }
    return Object.entries(table)
      .map(([name, ga]) => ({ name, g: ga.g, a: ga.a }))
      .sort((a, b) => b.g - a.g || b.a - a.a || a.name.localeCompare(b.name));
  }, [eventsSafe]);

  // filtro histórico
  const [historyFilter, setHistoryFilter] = useState<FilterRange>("week");
  const filteredHistory = useMemo(() => {
    const list = historySafe;
    if (historyFilter === "all") return list;

    const now = new Date();
    return list.filter((h) => {
      const d = new Date(h.ts);
      if (historyFilter === "week") {
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [historySafe, historyFilter]);

  // ações de topo
  const onRestart = () => {
    try {
      const a = beepRef.current;
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    } catch {}
    reset();
  };

  const openEnd = () => {
    setNextTeamChoice("_auto");
    setEndOpen(true);
  };

  const confirmEnd = () => {
    const choice = nextTeamChoice === "_auto" ? null : nextTeamChoice;
    endRoundChooseNext(choice as TeamColor | null);
    setEndOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 pb-24 sm:pb-5">
      <header className="mb-3">
        <h1 className="text-2xl font-semibold">Partida ao Vivo</h1>
        <p className="text-sm text-zinc-500">Rodada {roundSafe.number}</p>
      </header>

      {/* Cronômetro */}
      <Card className="mb-3 rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-3">
            <div
              className={[
                "text-5xl sm:text-6xl font-extrabold tabular-nums",
                exceeded && !roundSafe.running
                  ? "text-red-600 motion-safe:animate-pulse [animation-duration:350ms]"
                  : "",
              ].join(" ")}
              aria-live="polite"
            >
              {mmss}
            </div>

            {/* som do alarme */}
            <audio
              ref={beepRef}
              preload="auto"
              className="hidden"
              src="data:audio/wav;base64,UklGRm4AAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAChAAAAAAAaAABSUQAA////AP///wD///8A////AP///wD///8A////AP///wD///8A"
            />

            <div className="flex items-center gap-2">
              <Label className="text-sm text-zinc-600">Duração:</Label>
              <Select
                value={String(durationMin)}
                onValueChange={(v) => setDuration(Number(v))}
                disabled={roundSafe.running}
              >
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Minutos" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 8, 10, 12, 15].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ações do cronômetro — desktop (≥sm) */}
            <div className="hidden w-full sm:grid grid-cols-3 gap-2">
              {!roundSafe.running ? (
                <Button type="button" onClick={start} className="h-12 w-full">
                  Iniciar
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={pause}
                  className="h-12 w-full bg-amber-500 hover:bg-amber-500/90"
                >
                  Pausar
                </Button>
              )}

              <Button
                type="button"
                onClick={onRestart}
                className="h-12 w-full bg-sky-500 hover:bg-sky-600 text-white"
              >
                Recomeçar
              </Button>
              <Button
                type="button"
                onClick={openEnd}
                className="h-12 w-full bg-rose-500 hover:bg-rose-600 text-white"
              >
                Encerrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placar */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-emerald-600" /> Placar
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[left, right].map((team) => (
              <div
                key={team}
                className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 min-h-12"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <TeamBadge color={team} />
                  <span className="text-sm truncate">{team}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tabular-nums">
                    {roundSafe.scores[team] ?? 0}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openGoal(team)}
                    disabled={!roundSafe.running}
                    aria-label={"Adicionar gol do " + team}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gols recentes */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-2">Gols recentes</h3>
          {eventsSafe.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum gol registrado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {eventsSafe
                .slice()
                .reverse()
                .map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <TeamBadge color={e.team} />
                      <div className="text-sm">
                        <div>
                          <strong>{e.author}</strong>
                        </div>
                        {e.assist && (
                          <div className="text-xs text-zinc-500">assistência: {e.assist}</div>
                        )}
                      </div>
                    </div>
                    {canEdit(userRole) && (
                      <div className="flex items-center gap-2">
                        {/* Mobile: ícones compactos */}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="sm:hidden"
                          onClick={() => openEditGoal(e)}
                          aria-label="Editar gol"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="sm:hidden"
                          onClick={() => openConfirmDelete(e)}
                          aria-label="Excluir gol"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>

                        {/* ≥sm: botões com texto */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="hidden sm:inline-flex"
                          onClick={() => openEditGoal(e)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="hidden sm:inline-flex"
                          onClick={() => openConfirmDelete(e)}
                        >
                          Excluir
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-2">Estatísticas dos jogadores (sessão)</h3>
          {eventsSafe.length === 0 ? (
            <p className="text-sm text-zinc-500">Sem registros ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="text-left py-1">Jogador</th>
                    <th className="text-right py-1">G</th>
                    <th className="text-right py-1">A</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((row) => (
                    <tr key={row.name} className="border-t">
                      <td className="py-1">{row.name}</td>
                      <td className="py-1 text-right">{row.g}</td>
                      <td className="py-1 text-right">{row.a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs (Semana/Mês/Todos) */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-2 sm:p-3">
          <Tabs value={historyFilter} onValueChange={(v) => setHistoryFilter(v as FilterRange)}>
            <TabsList className="grid grid-cols-3 w-full rounded-xl">
              <TabsTrigger value="week" className="rounded-xl">Semana</TabsTrigger>
              <TabsTrigger value="month" className="rounded-xl">Mês</TabsTrigger>
              <TabsTrigger value="all" className="rounded-xl">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Histórico de Partidas */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardContent className="p-5 sm:p-7">
          <h3 className="text-base sm:text-lg font-semibold mb-3">Histórico de Partidas</h3>
          {historySafe.length === 0 ? (
            <p className="text-sm text-zinc-500">Sem registros ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.95rem]">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="text-left py-2">Rodada</th>
                    <th className="text-left py-2">Duelo</th>
                    <th className="text-right py-2">Placar</th>
                    <th className="text-right py-2">Vencedor</th>
                    <th className="text-right py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h) => (
                    <tr key={h.round + "-" + h.ts} className="border-t">
                      <td className="py-2">#{h.round}</td>
                      <td className="py-2">
                        {h.left} vs {h.right}
                      </td>
                      <td className="py-2 text-right">
                        {h.leftScore} - {h.rightScore}
                      </td>
                      <td className="py-2 text-right">{h.winner}</td>
                      <td className="py-2 text-right">{new Date(h.ts).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==== BARRA FLUTUANTE (MOBILE) ==== */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto max-w-4xl px-4 pb-3">
          <div className="rounded-2xl border border-zinc-200 bg-white/90 dark:bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-lg">
            <div className="grid grid-cols-3 gap-2 p-3">
              {!roundSafe.running ? (
                <Button type="button" onClick={start} className="h-12 w-full">
                  Iniciar
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={pause}
                  className="h-12 w-full bg-amber-500 hover:bg-amber-500/90"
                >
                  Pausar
                </Button>
              )}
              <Button
                type="button"
                onClick={onRestart}
                className="h-12 w-full bg-sky-500 hover:bg-sky-600 text-white"
              >
                Recomeçar
              </Button>
              <Button
                type="button"
                onClick={openEnd}
                className="h-12 w-full bg-rose-500 hover:bg-rose-600 text-white"
              >
                Encerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* ==== /BARRA FLUTUANTE ==== */}
    </div>
  );
};

export default Match;
export { Match };

