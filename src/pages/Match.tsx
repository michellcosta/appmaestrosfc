import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Trophy, Crown, Shield, Star, Zap, User, RotateCcw, Database, History, AlertTriangle, Sparkles, Zap as ZapIcon, FileText, Download, Calendar } from "lucide-react";

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
import { usePlayerStatsStore } from "@/store/playerStatsStore";
import { useGamesStore } from "@/store/gamesStore";
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

// Sistema de jogadores completamente baseado em dados reais

const Match: React.FC = () => {
  const { 
    round,
    durationMin,
    events,
    allEvents,
    history,
    setDuration,
    start,
    pause,
    reset,
    addGoal,
    editGoal,
    deleteGoal,
    endRoundChooseNext,
    getAllEvents,
    clearHistory,
    clearEvents,
    clearAll,
    resetToInitialState,
    recomputeScores,
  } = useMatchStore();

  // Store de estatísticas dos jogadores
  const { addGoal: addGoalToStats, addAssist: addAssistToStats } = usePlayerStatsStore();

  const {
    players,
    currentMatchId,
    loadPlayersFromTeamDraw,
    getPlayersByTeam,
    getActivePlayersByTeam,
    substitutePlayer,
    addSubstitution,
    getPlayerByName,
  } = usePlayersStore();
  // Removido: estatísticas persistentes não são mais usadas
  const { getUpcomingMatches } = useGamesStore();
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
        // Sistema continua sem dados mock
      }
    };

    loadTeamData();
  }, [loadPlayersFromTeamDraw]);

  // Removido: verificação de reset de estatísticas persistentes não é mais necessária

  const [endOpen, setEndOpen] = useState(false);
  const [nextTeamChoice, setNextTeamChoice] = useState<TeamColor>("Preto");

  /* Modal de Substituições */
  const [substitutionOpen, setSubstitutionOpen] = useState(false);
  const [substitutionTeam, setSubstitutionTeam] = useState<TeamColor>("Preto");
  const [playerOut, setPlayerOut] = useState<string>("");
  const [playerIn, setPlayerIn] = useState<string>("");

  /* Modal de Gols da Rodada */
  const [roundGoalsOpen, setRoundGoalsOpen] = useState(false);
  const [selectedRoundHistory, setSelectedRoundHistory] = useState<typeof historySafe[0] | null>(null);

  /* Estados para animação de empate */
  const [tieAnimationOpen, setTieAnimationOpen] = useState(false);
  const [tieWinner, setTieWinner] = useState<TeamColor | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [savedTieWinner, setSavedTieWinner] = useState<TeamColor | null>(null);
  const [tieTimeout, setTieTimeout] = useState<number | null>(null);

  // Cleanup de estados de empate quando componente desmonta
  useEffect(() => {
    return () => {
      if (tieTimeout) {
        clearTimeout(tieTimeout);
      }
    };
  }, [tieTimeout]);

  /* Função para limpar estados de empate */
  const clearTieStates = () => {
    if (tieTimeout) {
      clearTimeout(tieTimeout);
      setTieTimeout(null);
    }
    setTieAnimationOpen(false);
    setTieWinner(null);
    setIsAnimating(false);
    setSavedTieWinner(null);
  };

  /* Função para determinar vencedor em empate com animação */
  const determineTieWinner = (leftTeam: TeamColor, rightTeam: TeamColor) => {
    // Validar times
    const validTeams: TeamColor[] = ['Preto', 'Verde', 'Cinza', 'Vermelho'];
    if (!validTeams.includes(leftTeam) || !validTeams.includes(rightTeam)) {
      console.error('❌ Times inválidos para empate:', leftTeam, rightTeam);
      return;
    }

    // Limpar estados anteriores
    clearTieStates();
    
    setIsAnimating(true);
    setTieAnimationOpen(true);
    
    // Animação de 3 segundos com as cores dos times
    const timeout = setTimeout(() => {
      // Sorteio justo entre os dois times
      const winner = Math.random() > 0.5 ? leftTeam : rightTeam;
      setTieWinner(winner);
      setIsAnimating(false);
      setTieTimeout(null);
    }, 3000);
    
    setTieTimeout(timeout);
  };

  /* Função para confirmar vencedor do empate */
  const confirmTieWinner = () => {
    if (!tieWinner) {
      console.error('❌ Nenhum vencedor de empate para confirmar');
      return;
    }

    try {
      // Salvar o vencedor do empate para usar no modal de encerrar rodada
      setSavedTieWinner(tieWinner);
      
      console.log('🏆 Empate - Vencedor salvo:', tieWinner);
      
      // Fechar modal de empate e abrir modal de encerrar rodada
      setTieAnimationOpen(false);
      setTieWinner(null);
      setIsAnimating(false);
      
      // Abrir modal de encerrar rodada para escolher próximo adversário
      setEndOpen(true);
    } catch (error) {
      console.error('❌ Erro ao confirmar vencedor do empate:', error);
      clearTieStates();
    }
  };

  /* Função para fechar modal de empate de forma controlada */
  const handleTieModalClose = (open: boolean) => {
    if (!open) {
      if (isAnimating) {
        // Se estiver animando, não permite fechar
        setTieAnimationOpen(true);
        return;
      }
      // Limpar todos os estados de empate
      clearTieStates();
    }
  };

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
    
    // Sistema baseado apenas em jogadores reais
    console.log(`Nenhum jogador encontrado para o time ${team}`);
    return [];
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

  // Recomputar scores quando a página carregar
  useEffect(() => {
    recomputeScores();
  }, [recomputeScores]);

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

        // Registrar estatísticas do ranking
        addGoalToStats(goalAuthor);
        if (assistVal) {
          addAssistToStats(assistVal);
        }
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

  // estatísticas da partida atual (todos os gols da partida)
  const stats = useMemo(() => {
    // Usar todos os gols da partida (allEvents) para estatísticas acumuladas
    const allEventsSafe = Array.isArray(allEvents) ? allEvents : [];
    const sessionStats: Record<string, { g: number; a: number }> = {};
    
    // Contar gols de TODAS as rodadas da partida
    for (const e of allEventsSafe) {
      if (e.author) {
        sessionStats[e.author] = sessionStats[e.author] || { g: 0, a: 0 };
        sessionStats[e.author].g += 1;
      }
      if (e.assist) {
        sessionStats[e.assist] = sessionStats[e.assist] || { g: 0, a: 0 };
        sessionStats[e.assist].a += 1;
      }
    }

    // Retornar estatísticas acumuladas de toda a partida
    return Object.entries(sessionStats)
      .map(([name, ga]) => ({ name, g: ga.g, a: ga.a }))
      .sort((a, b) => b.g - a.g || b.a - a.a || a.name.localeCompare(b.name));
  }, [allEvents]);

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
    // Verificar se é empate antes de abrir modal
    const [leftTeam, rightTeam] = round.inPlay;
    const leftScore = round.scores[leftTeam] ?? 0;
    const rightScore = round.scores[rightTeam] ?? 0;
    
    if (leftScore === rightScore) {
      // É empate! Mostrar animação
      console.log('⚽ Empate detectado em openEnd! Iniciando animação...');
      determineTieWinner(leftTeam, rightTeam);
      return; // Não abrir modal de encerrar
    }
    
    // Lógica para selecionar o próximo time automaticamente
    const allTeams: TeamColor[] = ['Preto', 'Verde', 'Cinza', 'Vermelho'];
    
    // Se Cinza não está jogando, selecionar Cinza
    if (leftTeam !== 'Cinza' && rightTeam !== 'Cinza') {
      setNextTeamChoice('Cinza');
    } else {
      // Se Cinza está jogando, selecionar um dos times de fora
      const availableTeams = allTeams.filter(team => team !== leftTeam && team !== rightTeam);
      setNextTeamChoice(availableTeams[0] || 'Preto'); // Fallback para Preto se algo der errado
    }
    
    setEndOpen(true);
  };

  const confirmEnd = () => {
    try {
      // Se há um vencedor de empate salvo, usar ele
      if (savedTieWinner) {
        console.log('🏆 Usando vencedor de empate salvo:', savedTieWinner);
        console.log('⚽ Próximo adversário escolhido:', nextTeamChoice);
        
        // Validar próximo adversário
        const validTeams: TeamColor[] = ['Preto', 'Verde', 'Cinza', 'Vermelho'];
        if (!validTeams.includes(nextTeamChoice as TeamColor)) {
          console.error('❌ Próximo adversário inválido:', nextTeamChoice);
          return;
        }
        
        // Usar o vencedor do empate e o adversário escolhido pelo usuário
        const { round, events } = useMatchStore.getState();
        const [left, right] = round.inPlay;
        const l = round.scores[left] ?? 0;
        const r = round.scores[right] ?? 0;
        
        const historyItem = {
          round: round.number, 
          left, 
          right, 
          leftScore: l, 
          rightScore: r, 
          winner: savedTieWinner, 
          ts: Date.now(),
          goals: [...events]
        };
        
        // O vencedor fica, o próximo adversário é o escolhido pelo usuário
        const stay = savedTieWinner;
        const next = nextTeamChoice as TeamColor;
        
        // Atualizar o estado
        useMatchStore.setState({
          history: [...useMatchStore.getState().history, historyItem],
          round: {
            number: round.number + 1,
            inPlay: [stay, next],
            scores: { Preto:0, Verde:0, Cinza:0, Vermelho:0 },
            running: false,
          },
          events: [], // RESETAR lista de gols da rodada
          allEvents: [...useMatchStore.getState().allEvents], // MANTER todos os gols para estatísticas
          accumulatedSec: 0,
          runningSince: null,
        });
        
        console.log('✅ Rodada finalizada - Vencedor:', stay, 'Próximo:', next);
    setEndOpen(false);
        setSavedTieWinner(null); // Limpar o vencedor salvo
      } else {
        // Não é empate, finalizar normalmente com o time selecionado
        endRoundChooseNext(nextTeamChoice as TeamColor);
        setEndOpen(false);
      }
    } catch (error) {
      console.error('❌ Erro ao finalizar rodada:', error);
      setEndOpen(false);
    }
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

  /* Função para abrir modal de gols da rodada */
  const openRoundGoalsModal = (historyItem: typeof historySafe[0]) => {
    setSelectedRoundHistory(historyItem);
    setRoundGoalsOpen(true);
  };

  // esconder barra quando qualquer modal aberto
  const anyModalOpen = goalOpen || confirmOpen || endOpen || substitutionOpen || roundGoalsOpen;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 pb-[120px] sm:pb-5">
      <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm rounded-lg mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Partida ao Vivo</h1>
            <p className="text-sm text-gray-600 dark:text-zinc-400">Rodada {roundSafe.number}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {user?.role === 'owner' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/owner-dashboard')}
                className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                title="Acesso rápido ao Dashboard do Owner"
              >
                <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </Button>
            )}
            
            {user?.role && user.role !== 'owner' && (
              <div className="flex items-center space-x-1 text-sm text-maestros-green dark:text-green-400">
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

      {/* Gols da partida */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-sm font-semibold mb-2">Gols da partida</h3>
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

      {/* Estatísticas dos Jogadores - Melhorada */}
      <Card className="rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 mb-3">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-maestros-green" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Estatísticas dos Jogadores</h3>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {eventsSafe.length} {eventsSafe.length === 1 ? 'gol' : 'gols'} nesta partida
            </div>
          </div>
          
          {stats.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum gol registrado ainda</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Os gols aparecerão aqui conforme forem marcados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top 3 Jogadores */}
              {stats.slice(0, 3).map((player, index) => (
                <div key={player.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      'bg-amber-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{player.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {player.g + player.a} participações • {player.g}G {player.a}A
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{player.g}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Gols</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{player.a}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Assist.</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Demais Jogadores */}
              {stats.length > 3 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Outros jogadores</div>
                  {stats.slice(3).map((player) => (
                    <div key={player.name} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                          <User className="w-3 h-3 text-zinc-500" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{player.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{player.g}G</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">{player.a}A</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Informação sobre as estatísticas persistentes */}
          {stats.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                <Trophy className="w-3 h-3" />
                <span>As estatísticas são persistentes e só zeram na próxima partida agendada ou ao usar "Reset Total"</span>
              </div>
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
          <h3 className="text-base sm:text-lg font-semibold mb-4">Histórico de Partidas</h3>
          
          {/* Estatísticas Resumo */}
          {filteredHistory.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800/30 dark:to-zinc-700/30 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Estatísticas do Período</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['Preto', 'Verde', 'Cinza', 'Vermelho'] as TeamColor[]).map(team => {
                  const teamStats = filteredHistory.reduce((acc, h) => {
                    const isParticipant = h.left === team || h.right === team;
                    if (!isParticipant) return acc;
                    
                    const isWinner = h.winner === team;
                    const isDraw = h.winner === 'Empate';
                    
                    return {
                      games: acc.games + 1,
                      wins: acc.wins + (isWinner ? 1 : 0),
                      draws: acc.draws + (isDraw ? 1 : 0),
                      losses: acc.losses + (!isWinner && !isDraw ? 1 : 0),
                      goalsFor: acc.goalsFor + (h.left === team ? h.leftScore : h.rightScore),
                      goalsAgainst: acc.goalsAgainst + (h.left === team ? h.rightScore : h.leftScore)
                    };
                  }, { games: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 });

                  if (teamStats.games === 0) return null;

                  const winRate = Math.round((teamStats.wins / teamStats.games) * 100);

                  return (
                    <div key={team} className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <TeamBadge color={team} />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{team}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {teamStats.games} {teamStats.games === 1 ? 'jogo' : 'jogos'}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{teamStats.wins}V</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium">{teamStats.draws}E</span>
                          <span className="text-red-600 dark:text-red-400 font-medium">{teamStats.losses}D</span>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {teamStats.goalsFor}-{teamStats.goalsAgainst} gols
                        </div>
                        <div className={`text-xs font-medium ${winRate >= 60 ? 'text-emerald-600 dark:text-emerald-400' : winRate >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                          {winRate}% vitórias
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          )}
          {historySafe.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-zinc-400" />
              </div>
            <p className="text-sm text-zinc-500">Sem registros ainda.</p>
              <p className="text-xs text-zinc-400 mt-1">As partidas aparecerão aqui após serem finalizadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((h) => {
                const isWinner = (team: TeamColor) => h.winner === team;
                const isEmpate = h.winner === 'Empate';
                const matchDate = new Date(h.ts);
                
                return (
                  <button 
                    key={h.round + "-" + h.ts} 
                    onClick={() => openRoundGoalsModal(h)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200/50 dark:border-zinc-700/50 hover:shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-700/50 hover:border-maestros-green/30 transition-all duration-200 cursor-pointer group text-left"
                    title="Clique para ver os gols da partida"
                  >
                    {/* Header da partida */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-maestros-green/10 text-maestros-green px-2 py-1 rounded-lg text-xs font-medium">
                          Rodada #{h.round}
                        </div>
                        {isEmpate && (
                          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-medium">
                            Empate
                          </div>
                        )}
                      </div>
                      <div className="text-right relative">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {matchDate.toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-zinc-400 dark:text-zinc-500">
                          {matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        {/* Indicador de clique */}
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 bg-maestros-green rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Confronto */}
                    <div className="flex items-center justify-between">
                      {/* Time Esquerda */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <TeamBadge color={h.left} />
                          <span className={`font-medium text-sm ${isWinner(h.left) ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            {h.left}
                          </span>
                          {isWinner(h.left) && (
                            <Trophy className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </div>

                      {/* Placar */}
                      <div className="flex items-center gap-2 px-4 py-2">
                        <div className={`text-xl font-bold transition-colors ${isWinner(h.left) ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'} group-hover:text-maestros-green`}>
                          {h.leftScore}
                        </div>
                        <div className="text-zinc-400 dark:text-zinc-500 font-medium group-hover:text-maestros-green transition-colors">×</div>
                        <div className={`text-xl font-bold transition-colors ${isWinner(h.right) ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'} group-hover:text-maestros-green`}>
                          {h.rightScore}
                        </div>
                      </div>

                      {/* Time Direita */}
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="flex items-center gap-2">
                          {isWinner(h.right) && (
                            <Trophy className="w-4 h-4 text-emerald-500" />
                          )}
                          <span className={`font-medium text-sm ${isWinner(h.right) ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            {h.right}
                          </span>
                          <TeamBadge color={h.right} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
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

      {/* Exportar PDF - Apenas para Owner */}
      {user?.role === 'owner' && (
        <Card className="rounded-2xl border border-emerald-200 shadow-sm dark:border-emerald-800 mb-3">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Exportar Relatório</h3>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                PDF completo
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {stats.length} jogadores
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {historySafe.length} partidas
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={async () => {
                  try {
                    // Importação dinâmica do jsPDF
                    const { default: jsPDF } = await import('jspdf');
                    const doc = new jsPDF();
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    let yPosition = 20;

                    // Cabeçalho
                    doc.setFontSize(20);
                    doc.setFont('helvetica', 'bold');
                    doc.text('MAESTROS FC - RELATÓRIO DE PARTIDA', pageWidth / 2, yPosition, { align: 'center' });
                    yPosition += 10;

                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');
                    const currentDate = new Date().toLocaleDateString('pt-BR');
                    doc.text(`Data: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
                    yPosition += 20;

                    // Estatísticas dos Jogadores
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text('ESTATÍSTICAS DOS JOGADORES', 20, yPosition);
                    yPosition += 15;

                    if (stats.length > 0) {
                      // Cabeçalho da tabela
                      doc.setFontSize(10);
                      doc.setFont('helvetica', 'bold');
                      doc.text('Posição', 20, yPosition);
                      doc.text('Jogador', 40, yPosition);
                      doc.text('Gols', 120, yPosition);
                      doc.text('Assistências', 140, yPosition);
                      doc.text('Total', 170, yPosition);
                      yPosition += 8;

                      // Linha separadora
                      doc.line(20, yPosition, 190, yPosition);
                      yPosition += 5;

                      // Dados dos jogadores
                      doc.setFont('helvetica', 'normal');
                      stats.forEach((player, index) => {
                        if (yPosition > pageHeight - 30) {
                          doc.addPage();
                          yPosition = 20;
                        }

                        const safeName = player?.name || 'Jogador Desconhecido';
                        const safeGoals = player?.g || 0;
                        const safeAssists = player?.a || 0;
                        const total = safeGoals + safeAssists;
                        
                        doc.text(`${index + 1}º`, 20, yPosition);
                        doc.text(safeName, 40, yPosition);
                        doc.text(safeGoals.toString(), 120, yPosition);
                        doc.text(safeAssists.toString(), 140, yPosition);
                        doc.text(total.toString(), 170, yPosition);
                        yPosition += 8;
                      });
                    } else {
                      doc.setFontSize(10);
                      doc.setFont('helvetica', 'italic');
                      doc.text('Nenhuma estatística registrada', 20, yPosition);
                      yPosition += 10;
                    }

                    yPosition += 10;

                    // Histórico de Partidas
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text('HISTÓRICO DE PARTIDAS', 20, yPosition);
                    yPosition += 15;

                    if (historySafe.length > 0) {
                      doc.setFontSize(10);
                      doc.setFont('helvetica', 'bold');
                      doc.text('Rodada', 20, yPosition);
                      doc.text('Partida', 40, yPosition);
                      doc.text('Placar', 120, yPosition);
                      doc.text('Vencedor', 140, yPosition);
                      doc.text('Data/Hora', 170, yPosition);
                      yPosition += 8;

                      // Linha separadora
                      doc.line(20, yPosition, 190, yPosition);
                      yPosition += 5;

                      doc.setFont('helvetica', 'normal');
                      historySafe.forEach((match) => {
                        if (yPosition > pageHeight - 30) {
                          doc.addPage();
                          yPosition = 20;
                        }

                        const safeTs = match?.ts || Date.now();
                        const safeRound = match?.round || 0;
                        const safeLeft = match?.left || 'Time A';
                        const safeRight = match?.right || 'Time B';
                        const safeLeftScore = match?.leftScore || 0;
                        const safeRightScore = match?.rightScore || 0;
                        const safeWinner = match?.winner || 'Empate';
                        
                        const matchDate = new Date(safeTs).toLocaleString('pt-BR');
                        const score = `${safeLeftScore} x ${safeRightScore}`;
                        const matchTeams = `${safeLeft} vs ${safeRight}`;
                        
                        doc.text(`#${safeRound}`, 20, yPosition);
                        doc.text(matchTeams, 40, yPosition);
                        doc.text(score, 120, yPosition);
                        doc.text(safeWinner, 140, yPosition);
                        doc.text(matchDate, 170, yPosition);
                        yPosition += 8;
                      });
                    } else {
                      doc.setFontSize(10);
                      doc.setFont('helvetica', 'italic');
                      doc.text('Nenhuma partida registrada', 20, yPosition);
                    }

                    // Rodapé
                    const footerY = pageHeight - 20;
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'italic');
                    doc.text('Relatório gerado automaticamente pelo sistema Maestros FC', pageWidth / 2, footerY, { align: 'center' });

                    // Salvar o PDF
                    const fileName = `maestros-fc-relatorio-${currentDate.replace(/\//g, '-')}.pdf`;
                    doc.save(fileName);
                  } catch (error) {
                    console.error('❌ Erro ao gerar PDF:', error);
                    alert('Erro ao gerar PDF: ' + (error as Error).message);
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <TestControls
        clearEvents={clearEvents}
        clearHistory={clearHistory}
        clearAll={clearAll}
        resetToInitialState={resetToInitialState}
        canControlMatch={canControlMatch()}
      />

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
              onValueChange={(v) => setNextTeamChoice(v as TeamColor)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o próximo" />
              </SelectTrigger>
              <SelectContent>
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

      {/* Modal de Animação de Empate */}
      <Dialog open={tieAnimationOpen} onOpenChange={handleTieModalClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {isAnimating ? 'Determinando Vencedor...' : 'Empate! Vencedor Sorteado'}
            </DialogTitle>
            <DialogDescription>
              {isAnimating 
                ? 'As cores dos times estão competindo para determinar o vencedor!'
                : 'O vencedor foi determinado por sorteio justo!'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Animação das cores dos times */}
            <div className="flex justify-center items-center space-x-4">
              {round.inPlay.map((team, index) => {
                const isWinner = !isAnimating && tieWinner === team;
                const teamColors = {
                  'Preto': 'bg-zinc-800',
                  'Verde': 'bg-green-500', 
                  'Cinza': 'bg-gray-500',
                  'Vermelho': 'bg-red-500'
                };
                
                return (
                  <div
                    key={team}
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg
                      ${teamColors[team]}
                      ${isAnimating ? 'animate-pulse animate-bounce' : ''}
                      ${isWinner ? 'ring-4 ring-yellow-400 scale-110' : ''}
                      transition-all duration-500
                    `}
                  >
                    {isAnimating ? (
                      <ZapIcon className="w-8 h-8 animate-spin" />
                    ) : isWinner ? (
                      <Trophy className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <span className="text-xs">{team.charAt(0)}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Placar do empate */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {round.scores[round.inPlay[0]]} - {round.scores[round.inPlay[1]]}
              </div>
              <div className="text-sm text-gray-500">Empate!</div>
            </div>

            {/* Resultado da animação */}
            {!isAnimating && tieWinner && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-amber-800 mb-2">
                    🏆 Vencedor: {tieWinner}
                  </div>
                  <div className="text-sm text-amber-600">
                    O time {tieWinner} continuará na próxima rodada!
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {!isAnimating && (
              <Button 
                onClick={confirmTieWinner}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Continuar com {tieWinner}
              </Button>
            )}
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

      {/* Modal Gols da Rodada */}
      <Dialog open={roundGoalsOpen} onOpenChange={setRoundGoalsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-maestros-green" />
              Gols da Rodada #{selectedRoundHistory?.round}
            </DialogTitle>
            <DialogDescription>
              {selectedRoundHistory && (
                <>
                  <span className="font-medium">{selectedRoundHistory.left}</span> vs <span className="font-medium">{selectedRoundHistory.right}</span>
                  <span className="ml-2 text-sm">
                    ({selectedRoundHistory.leftScore}-{selectedRoundHistory.rightScore})
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRoundHistory?.goals && selectedRoundHistory.goals.length > 0 ? (
              <div className="space-y-3">
                {selectedRoundHistory.goals
                  .slice()
                  .sort((a, b) => a.ts - b.ts) // Ordenar por tempo
                  .map((goal, index) => (
                    <div 
                      key={goal.id} 
                      className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                          {index + 1}º
                        </span>
                        <TeamBadge color={goal.team} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                            {goal.author}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            ({goal.team})
                          </span>
                        </div>
                        {goal.assist && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Assistência: <span className="font-medium">{goal.assist}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-zinc-400 dark:text-zinc-500">
                          {new Date(goal.ts).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-500">Nenhum gol foi marcado nesta rodada</p>
                <p className="text-xs text-zinc-400 mt-1">A partida terminou 0-0</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRoundGoalsOpen(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Match;
export { Match };

/* Controles de Teste (apenas para desenvolvimento) */
function TestControls({ clearEvents, clearHistory, clearAll, resetToInitialState, canControlMatch }) {
  if (!canControlMatch) return null;

  return (
    <Card className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-950/30 mt-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Controles de Teste
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            onClick={clearEvents}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/50"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Limpar Gols
          </Button>

          <Button
            onClick={clearHistory}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/50"
          >
            <History className="w-3 h-3 mr-1" />
            Limpar Histórico
          </Button>

          <Button
            onClick={clearAll}
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/50"
          >
            <Database className="w-3 h-3 mr-1" />
            Limpar Tudo
          </Button>

          <Button
            onClick={() => {
              // Zerar tudo da página
              resetToInitialState();
              alert('Página resetada completamente! Estatísticas zeradas!');
            }}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Reset Total
          </Button>
        </div>

        <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
          ⚠️ Estes botões são para facilitar testes durante o desenvolvimento
        </p>
      </CardContent>
    </Card>
  );
}