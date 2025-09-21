import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Trophy, Crown, Shield, Star, Zap, User } from "lucide-react";

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
import { usePlayersStore } from "@/store/playersStore";
import { useAuth } from '@/auth/OfflineAuthProvider';
import { usePermissions } from '@/hooks/usePermissions';

type FilterRange = "week" | "month" | "all";

/* Cores dos chips de time */
const colorChip: Record<TeamColor, string> = {
  Preto: "bg-zinc-800 text-white border-2 border-zinc-300 dark:border-zinc-600",
  Verde: "bg-emerald-600 text-white border-2 border-emerald-300 dark:border-emerald-400",
  Cinza: "bg-slate-500 text-white border-2 border-slate-300 dark:border-slate-400",
  Vermelho: "bg-red-600 text-white border-2 border-red-300 dark:border-red-400",
};

/* Badge do time */
const TeamBadge: React.FC<{ color: TeamColor; className?: string }> = ({
  color,
  className,
}) => (
  <span
    className={[
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-8 h-8 shadow-md",
      colorChip[color],
      className || "",
    ].join(" ")}
  >
  </span>
);

/* Permissões usando hook real */

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
  const { 
    players, 
    currentMatchId,
    loadPlayersFromTeamDraw, 
    getPlayersByTeam,
    getActivePlayersByTeam,
    substitutePlayer,
    addSubstitution,
    getPlayerByName,
    loadExampleData
  } = usePlayersStore();
  const { canControlMatch } = usePermissions();

  // Função para obter times disponíveis
  const getAvailableTeams = () => {
    const teams: TeamColor[] = [];
    const teamColors: TeamColor[] = ['Preto', 'Verde', 'Cinza', 'Vermelho'];
    
    teamColors.forEach(color => {
      if (getPlayersByTeam(color).length > 0) {
        teams.push(color);
      }
    });
    
    return teams;
  };
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className='w-4 h-4 text-role-owner' />;
      case 'admin': return <Shield className='w-4 h-4 text-role-admin' />;
      case 'aux': return <Zap className='w-4 h-4 text-role-aux' />;
      case 'mensalista': return <Star className='w-4 h-4 text-role-mensalista' />;
      case 'diarista': return <Zap className='w-4 h-4 text-role-diarista' />;
      default: return <User className='w-4 h-4 text-role-default' />;
    }
  };

  /* Safeguards */
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

  /* Elapsed derivado do store */
  const elapsed = useMatchStore((s) => {
    const now = typeof s.now === "number" ? s.now : Date.now();
    const acc = typeof s.accumulatedSec === "number" ? s.accumulatedSec : 0;
    const live = s.runningSince ? Math.max(Math.floor((now - s.runningSince) / 1000), 0) : 0;
    return acc + live;
  });

  /* Beep/alarme */
  const alvo = durationMin * 60;
  const exceeded = elapsed >= alvo;
  const beepRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = beepRef.current;
    if (!a) return;
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

  useEffect(() => {
    if (roundSafe.running && exceeded) pause();
  }, [exceeded, roundSafe.running, pause]);

  /* Cronômetro mm:ss */
  const mmss = useMemo(() => {
    const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
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

  /* Carregar dados do sorteio de times */
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        // Aqui você pode passar o matchId real quando disponível
        // Por enquanto, vamos tentar carregar dados existentes
        await loadPlayersFromTeamDraw('');
      } catch (error) {
        console.warn('Erro ao carregar dados do sorteio:', error);
        // Continua usando dados mock em caso de erro
      }
    };

    loadTeamData();
  }, [loadPlayersFromTeamDraw]);

  const [endOpen, setEndOpen] = useState(false);
  const [nextTeamChoice, setNextTeamChoice] = useState<TeamColor | "_auto">("_auto");

  /* Modal de Substituições */
  const [substitutionOpen, setSubstitutionOpen] = useState(false);
  const [substitutionTeam, setSubstitutionTeam] = useState<TeamColor>("Preto");
  const [playerOut, setPlayerOut] = useState<string>("");
  const [playerIn, setPlayerIn] = useState<string>("");

  /* Helpers */
  const playerOptions = (team: TeamColor) => {
    // Primeiro tenta buscar TODOS os jogadores do time (incluindo substitutos)
    const teamPlayers = getPlayersByTeam(team);
    console.log(`Jogadores do time ${team}:`, teamPlayers);
    
    if (teamPlayers.length > 0) {
      const playerNames = teamPlayers.map(p => p.name);
      console.log(`Nomes dos jogadores do time ${team}:`, playerNames);
      return playerNames;
    }
    
    // Fallback para jogadores mock se não houver dados reais
    const mockPlayers = defaultTeamPlayers[team] ?? [];
    console.log(`Usando jogadores mock para time ${team}:`, mockPlayers);
    return mockPlayers;
  };

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
    if (!goalAuthor) {
      alert("Selecione o autor do gol");
      return;
    }

    const assistVal = goalAssist === "none" ? null : goalAssist;

    // Validações avançadas quando há dados reais do sorteio
    if (getAvailableTeams().length > 0) {
      try {
        const authorPlayer = getPlayerByName(goalAuthor);
        
        if (!authorPlayer) {
          alert(`Jogador "${goalAuthor}" não encontrado no sorteio`);
          return;
        }

        if (authorPlayer.team_color !== goalTeam) {
          alert(`Jogador "${goalAuthor}" não pertence ao time ${goalTeam}`);
          return;
        }

        if (authorPlayer.is_substitute) {
          alert(`Jogador "${goalAuthor}" está no banco e não pode marcar gol`);
          return;
        }

        // Validar assistência se fornecida
        if (assistVal) {
          const assistPlayer = getPlayerByName(assistVal);
          
          if (!assistPlayer) {
            alert(`Jogador da assistência "${assistVal}" não encontrado no sorteio`);
            return;
          }

          if (assistPlayer.team_color !== goalTeam) {
            alert(`Jogador da assistência "${assistVal}" não pertence ao time ${goalTeam}`);
            return;
          }

          if (assistPlayer.is_substitute) {
            alert(`Jogador da assistência "${assistVal}" está no banco`);
            return;
          }

          if (goalAuthor === assistVal) {
            alert("Jogador não pode dar assistência para si mesmo");
            return;
          }
        }
      } catch (error) {
        alert("Erro na validação: " + (error as Error).message);
        return;
      }
    }

    // Salvar o gol se todas as validações passaram
    try {
      if (goalEditId) {
        editGoal(goalEditId, { author: goalAuthor, assist: assistVal ?? null });
      } else {
        addGoal({ team: goalTeam, author: goalAuthor, assist: assistVal ?? null });
      }
      setGoalOpen(false);
      setGoalEditId(null);
    } catch (error) {
      alert("Erro ao salvar gol: " + (error as Error).message);
    }
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

  // times e placar
  const [left, right] = roundSafe.inPlay as TeamColor[];
  const leftScore = roundSafe.scores[left] ?? 0;
  const rightScore = roundSafe.scores[right] ?? 0;

  // candidatos próxima rodada
  const candidatos = (["Preto", "Verde", "Cinza", "Vermelho"] as TeamColor[]).filter(
    (t) => t !== left && t !== right
  );

  // estatísticas sessão
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

  // ações topo
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

  /* Funções de Substituição */
  const openSubstitution = (team: TeamColor) => {
    setSubstitutionTeam(team);
    setPlayerOut("");
    setPlayerIn("");
    setSubstitutionOpen(true);
  };

  const saveSubstitution = () => {
    if (!playerOut || !playerIn) {
      alert("Selecione ambos os jogadores para a substituição");
      return;
    }

    if (playerOut === playerIn) {
      alert("Jogador que sai deve ser diferente do que entra");
      return;
    }

    try {
      addSubstitution(substitutionTeam, playerOut, playerIn);
      setSubstitutionOpen(false);
      setPlayerOut("");
      setPlayerIn("");
    } catch (error) {
      alert("Erro ao realizar substituição: " + (error as Error).message);
    }
  };

  const getAvailablePlayersForSubstitution = (team: TeamColor) => {
    const allPlayers = getPlayersByTeam(team);
    const activePlayers = getActivePlayersByTeam(team);
    
    return {
      playersOut: activePlayers.map(p => p.name), // Jogadores que podem sair (ativos)
      playersIn: allPlayers
        .filter(p => !activePlayers.find(ap => ap.name === p.name))
        .map(p => p.name) // Jogadores que podem entrar (inativos)
    };
  };

  // esconder barra quando qualquer modal aberto
  const anyModalOpen = goalOpen || confirmOpen || endOpen || substitutionOpen;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 pb-[120px] sm:pb-5">
      <header className="bg-white border-b border-gray-200 shadow-sm rounded-lg mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Partida ao Vivo</h1>
            <p className="text-sm text-gray-600">Rodada {roundSafe.number}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {user?.role === 'owner' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/owner-dashboard')}
                className="p-2 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                title="Acesso rápido ao Dashboard do Owner"
              >
                <Crown className="w-4 h-4 text-purple-600" />
              </Button>
            )}
            
            {user?.role && user.role !== 'owner' && (
              <div className="flex items-center space-x-1 text-sm text-maestros-green">
                {getRoleIcon(user.role)}
                <span className="hidden sm:inline font-medium">
                  {user.role === 'admin' ? 'Admin' : 
                   user.role === 'aux' ? 'Auxiliar' : 
                   user.role === 'mensalista' ? 'Mensalista' : 
                   user.role === 'diarista' ? 'Diarista' : 
                   'Usuário'}
                </span>
              </div>
            )}
          </div>
        </div>
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

            {canControlMatch() && (
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
            )}

            {/* Ações do cronômetro — desktop (≥sm) */}
            {canControlMatch() && (
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Menu de Controle da Partida (Mobile) */}
      {canControlMatch() && (
        <div className="md:hidden mb-3">
          <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-center gap-3">
                {!roundSafe.running ? (
                  <button
                    type="button"
                    onClick={start}
                    className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all duration-200 flex items-center justify-center text-white shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pause}
                    className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 transition-all duration-200 flex items-center justify-center text-white shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onRestart}
                  className="w-12 h-12 rounded-full bg-sky-500 hover:bg-sky-600 active:scale-95 transition-all duration-200 flex items-center justify-center text-white shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={openEnd}
                  className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all duration-200 flex items-center justify-center text-white shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  {canControlMatch() && getAvailableTeams().length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openSubstitution(team)}
                      disabled={!roundSafe.running}
                      aria-label={"Substituição do " + team}
                      className="h-8 w-8 p-0"
                    >
                      ⇄
                    </Button>
                  )}
                  {canControlMatch() && (
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
                  )}
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
                    {canControlMatch() && (
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
          <h3 className="text-sm font-semibold mb-2">Estatísticas dos jogadores</h3>
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
      <div className="mb-3">
        <Tabs value={historyFilter} onValueChange={(v) => setHistoryFilter(v as FilterRange)}>
          <TabsList className="grid grid-cols-3 w-full h-12 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
            <TabsTrigger 
              value="week" 
              className="flex items-center justify-center h-6 px-1.5 rounded text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-zinc-100 text-zinc-600 dark:text-zinc-300"
            >
              Semana
            </TabsTrigger>
            <TabsTrigger 
              value="month" 
              className="flex items-center justify-center h-6 px-1.5 rounded text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-zinc-100 text-zinc-600 dark:text-zinc-300"
            >
              Mês
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="flex items-center justify-center h-6 px-1.5 rounded text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-zinc-100 text-zinc-600 dark:text-zinc-300"
            >
              Todos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
                      <td className="py-2 text-right">
                        {new Date(h.ts).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Modal: Registrar/Editar Gol (sempre montado) */}
      <Dialog
        open={goalOpen}
        onOpenChange={(o) => {
          setGoalOpen(o);
          if (!o) setGoalEditId(null);
        }}
      >
        <DialogContent className="z-[99999] max-w-md">
          <DialogHeader>
            <DialogTitle>{goalEditId ? "Editar Gol" : "Registrar Gol"}</DialogTitle>
            <DialogDescription>
              Autor pré-selecionado; assistência é opcional. Autoassistência não é permitida.
              {getAvailableTeams().length > 0 ? (
                <div className="mt-2 text-green-600 text-xs flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Usando jogadores do sorteio oficial
                </div>
              ) : (
                <div className="mt-2 text-amber-600 text-xs flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Usando jogadores de exemplo (carregue o sorteio)
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm">
              <span className="mr-2">Time:</span>
              <TeamBadge color={goalTeam} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal-author">Autor do gol</Label>
              <Select
                value={goalAuthor}
                onValueChange={(v) => {
                  console.log("Selecionando autor:", v);
                  setGoalAuthor(v);
                  if (goalAssist === v) setGoalAssist("none");
                }}
              >
                <SelectTrigger id="goal-author">
                  <SelectValue placeholder="Selecione o autor" />
                </SelectTrigger>
                <SelectContent className="z-[100000]" position="popper" sideOffset={5}>
                  {playerOptions(goalTeam).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal-assist">Assistência (opcional)</Label>
              <Select 
                value={goalAssist} 
                onValueChange={(v) => {
                  console.log("Selecionando assistência:", v);
                  setGoalAssist(v);
                }}
              >
                <SelectTrigger id="goal-assist">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent className="z-[100000]" position="popper" sideOffset={5}>
                  <SelectItem value="none">Sem assistência</SelectItem>
                  {playerOptions(goalTeam)
                    .filter((p) => p !== goalAuthor)
                    .map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2">
            <div className="text-xs text-gray-500">
              Debug: Autor atual = "{goalAuthor}" | Jogadores disponíveis = {playerOptions(goalTeam).length}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setGoalOpen(false);
                  setGoalEditId(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={saveGoal}>
                {goalEditId ? "Salvar alterações" : "Salvar Gol"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) setConfirmTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir gol?</DialogTitle>
            <DialogDescription>
              Essa ação não pode ser desfeita. O placar será atualizado.
            </DialogDescription>
          </DialogHeader>

          {confirmTarget && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Time:</span>
                <TeamBadge color={confirmTarget.team} />
              </div>
              <div className="text-sm">
                <div>
                  <strong>Autor:</strong> {confirmTarget.author}
                </div>
                {confirmTarget.assist && (
                  <div className="text-zinc-600">
                    <strong>Assistência:</strong> {confirmTarget.assist}
                  </div>
                )}
                <div className="text-zinc-600">
                  <strong>Horário:</strong>{" "}
                  {new Date(confirmTarget.ts).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={cancelDelete}>
              Não
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-600/90"
              onClick={confirmDelete}
            >
              Sim, excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Encerrar Rodada */}
      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar rodada</DialogTitle>
            <DialogDescription>
              O vencedor permanece. Escolha o próximo adversário ou deixe automático.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label>Próximo time a entrar</Label>
            <Select
              value={nextTeamChoice}
              onValueChange={(v) => setNextTeamChoice(v as TeamColor | "_auto")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o próximo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_auto">Automático</SelectItem>
                {candidatos.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setEndOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmEnd}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Substituições */}
      <Dialog
        open={substitutionOpen}
        onOpenChange={(o) => {
          setSubstitutionOpen(o);
          if (!o) {
            setPlayerOut("");
            setPlayerIn("");
          }
        }}
      >
        <DialogContent className="z-[99999]">
          <DialogHeader>
            <DialogTitle>Substituição - {substitutionTeam}</DialogTitle>
            <DialogDescription>
              Selecione o jogador que sai e o que entra. A substituição será registrada no histórico.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm">
              <span className="mr-2">Time:</span>
              <TeamBadge color={substitutionTeam} />
            </div>

            <div className="grid gap-2">
              <Label>Jogador que sai (ativo)</Label>
              <Select
                value={playerOut}
                onValueChange={setPlayerOut}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione quem sai" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePlayersForSubstitution(substitutionTeam).playersOut.map((player) => (
                    <SelectItem key={player} value={player}>
                      {player}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Jogador que entra (banco)</Label>
              <Select
                value={playerIn}
                onValueChange={setPlayerIn}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione quem entra" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePlayersForSubstitution(substitutionTeam).playersIn.map((player) => (
                    <SelectItem key={player} value={player}>
                      {player}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {getAvailablePlayersForSubstitution(substitutionTeam).playersIn.length === 0 && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ Não há jogadores no banco para substituição
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSubstitutionOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={saveSubstitution}
              disabled={!playerOut || !playerIn}
            >
              Confirmar Substituição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Match;
export { Match };