// src/pages/Ranking.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Crown, Shield, Star, Zap, User } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/auth/OfflineAuthProvider';
import RestrictedAccess from './RestrictedAccess';

type Range = "week" | "month" | "all";

type PlayerRow = {
  player_id: string;
  name: string | null;
  goals: number;
  assists: number;
  last_event_at?: string | null;
};

type VotesRow = {
  player_id: string;
  name: string | null;
  votes: number;
};

// Tipos para votação
type CurrentPoll = { poll_id: string; opens_at: string; closes_at: string; };
type PartialRow = { poll_id: string; category: 'Goleiro'|'Zagueiro'|'Meia'|'Atacante'; player_id: string; player_name: string|null; votes: number; };
const CATS: PartialRow['category'][] = ['Goleiro','Zagueiro','Meia','Atacante'];

function inRange(dateIso: string | null | undefined, range: Range) {
  if (!dateIso || range === "all") return true;
  const d = new Date(dateIso);
  const now = new Date();
  if (range === "week") {
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }
  // "month"
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function RankingPage() {
  const { canSeeRanking, canSeeVote } = usePermissions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"ranking" | "voting">("ranking");

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
  const [range, setRange] = useState<Range>("month");
  const [pos, setPos] = useState<"Geral" | "Goleiro" | "Zagueiro" | "Meia" | "Atacante">("Geral");

  const [stats, setStats] = useState<PlayerRow[]>([]);
  const [votes, setVotes] = useState<VotesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Estados para votação
  const [poll, setPoll] = useState<CurrentPoll|null>(null);
  const [partials, setPartials] = useState<PartialRow[]>([]);
  const [choice, setChoice] = useState<Record<string,string>>({});

  // Verificar permissão
  if (!canSeeRanking()) {
    return <RestrictedAccess />;
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // Tenta view principal
        const { data: s1, error: e1 } = await supabase
          .from("v_player_stats")
          .select("player_id,name,goals,assists,last_event_at");

        let statRows: PlayerRow[] = (s1 as any) ?? [];

        // Se falhar, tenta uma alternativa com mesmo shape
        if (e1) {
          const { data: s2, error: e2 } = await supabase
            .from("v_goals_assists")
            .select("player_id,name,goals,assists,last_event_at");
          statRows = (s2 as any) ?? [];
          if (e2) {
            // Sem views -> não trata como erro fatal, só mostra vazio
            statRows = [];
          }
        }

        // Votos do mês (opcional)
        let voteRows: VotesRow[] = [];
        const { data: v1, error: vErr } = await supabase
          .from("v_monthly_votes_current")
          .select("player_id,name,votes");
        if (!vErr) voteRows = (v1 as any) ?? [];

        // Carregar dados de votação se o usuário tem permissão
        if (canSeeVote()) {
          const { data: p } = await supabase.from('v_current_polls').select('*').maybeSingle();
          setPoll((p as any) ?? null);
          if (p?.poll_id) {
            const { data: rows } = await supabase
              .from('v_poll_partials')
              .select('poll_id,category,player_id,player_name,votes')
              .eq('poll_id', p.poll_id);
            setPartials((rows as any) ?? []);
          }
        }

        if (!alive) return;
        setStats(statRows);
        setVotes(voteRows);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Erro inesperado ao carregar ranking");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [canSeeVote]);

  const filtered = useMemo(() => {
    const rows = stats.filter((r) => inRange(r.last_event_at, range));
    if (pos !== "Geral") {
      // Quando você tiver a coluna "position" na view, dá para filtrar aqui.
      // rows = rows.filter(r => r.position === pos);
    }
    return rows
      .slice()
      .sort(
        (a, b) =>
          b.goals - a.goals ||
          b.assists - a.assists ||
          (a.name || "").localeCompare(b.name || "")
      );
  }, [stats, range, pos]);

  const topVotes = useMemo(() => {
    return votes
      .slice()
      .sort(
        (a, b) => b.votes - a.votes || (a.name || "").localeCompare(b.name || "")
      )
      .slice(0, 10);
  }, [votes]);

  // Agrupamento de dados de votação por categoria
  const grouped = useMemo(() => {
    const byCat: Record<string, PartialRow[]> = { Goleiro:[],Zagueiro:[],Meia:[],Atacante:[] };
    for (const r of partials) byCat[r.category].push(r);
    for (const c of CATS) byCat[c].sort((a,b)=> b.votes - a.votes || (a.player_name||'').localeCompare(b.player_name||''));
    return byCat;
  }, [partials]);

  // Função para submeter voto
  const submitVote = async (cat: PartialRow['category']) => {
    const player_id = choice[cat];
    if (!poll?.poll_id || !player_id) return;
    const { error } = await supabase.from('ballot_choices').insert({
      poll_id: poll.poll_id, category: cat, player_id, voter_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (!error) {
      // refresh parciais
      const { data: rows } = await supabase
        .from('v_poll_partials')
        .select('poll_id,category,player_id,player_name,votes')
        .eq('poll_id', poll.poll_id);
      setPartials((rows as any) ?? []);
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4 pb-20">
      <header className="bg-white border-b border-gray-200 shadow-sm rounded-lg mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Ranking & Votações</h1>
            <p className="text-sm text-gray-600">
              Rankings dos jogadores e votações ativas.
            </p>
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

      {/* Abas principais */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ranking" | "voting")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ranking">📊 Rankings</TabsTrigger>
          {canSeeVote() && <TabsTrigger value="voting">🗳️ Votações</TabsTrigger>}
        </TabsList>

        {/* Conteúdo da aba Ranking */}
        <TabsContent value="ranking" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList className="grid grid-cols-3 w-full h-10 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
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

            <Select value={pos} onValueChange={(v) => setPos(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Posição" />
              </SelectTrigger>
              <SelectContent>
                {["Geral", "Goleiro", "Zagueiro", "Meia", "Atacante"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

      {/* Gols & Assistências */}
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2">Gols & Assistências</h3>
          {loading ? (
            <p className="text-sm text-zinc-500">Carregando…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {err ? "Falha ao carregar: " + err : "Sem registros para o período."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="text-left py-2">Jogador</th>
                    <th className="text-right py-2">G</th>
                    <th className="text-right py-2">A</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map((r) => (
                    <tr key={r.player_id} className="border-t">
                      <td className="py-2">{r.name || r.player_id}</td>
                      <td className="py-2 text-right">{r.goals}</td>
                      <td className="py-2 text-right">{r.assists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

          {/* Votos do mês */}
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Votos do mês</h3>
              {loading ? (
                <p className="text-sm text-zinc-500">Carregando…</p>
              ) : topVotes.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Sem dados (a view de votos mensais pode não estar criada ainda).
                </p>
              ) : (
                <div className="space-y-2">
                  {topVotes.map((r, i) => (
                    <div
                      key={r.player_id}
                      className="flex items-center justify-between rounded-xl border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-right font-semibold">{i + 1}</span>
                        <span className="truncate">{r.name || r.player_id}</span>
                      </div>
                      <span className="font-semibold">{r.votes}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo da aba Votações */}
        {canSeeVote() && (
          <TabsContent value="voting" className="space-y-4">
            {!poll ? (
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-zinc-500">Nenhuma votação ativa no momento.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {CATS.map((cat) => (
                  <Card key={cat} className="rounded-2xl">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold mb-3">{cat}</h3>
                      
                      {/* Select para escolher jogador */}
                      <Select 
                        value={choice[cat] || ""} 
                        onValueChange={(v) => setChoice(prev => ({ ...prev, [cat]: v }))}
                      >
                        <SelectTrigger className="w-full mb-3">
                          <SelectValue placeholder={`Escolha um ${cat.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {grouped[cat]?.map((p) => (
                            <SelectItem key={p.player_id} value={p.player_id}>
                              {p.player_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Botão de votar */}
                      <Button 
                        onClick={() => submitVote(cat)} 
                        disabled={!choice[cat]}
                        className="w-full mb-3"
                      >
                        Votar em {cat}
                      </Button>

                      {/* Resultados parciais */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-zinc-500">Resultados parciais:</h4>
                        {grouped[cat]?.slice(0, 5).map((p, i) => (
                          <div
                            key={p.player_id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 text-right text-xs text-zinc-500">{i + 1}</span>
                              <span className="truncate">{p.player_name}</span>
                            </div>
                            <span className="font-medium">{p.votes}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
