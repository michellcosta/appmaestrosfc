import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

function inRange(dateIso: string | null | undefined, range: Range) {
  if (!dateIso || range === "all") return true;
  const d = new Date(dateIso);
  const now = new Date();
  if (range === "week") {
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function RankingPage() {
  const [range, setRange] = useState<Range>("month");
  const [pos, setPos] = useState<"Geral" | "Goleiro" | "Zagueiro" | "Meia" | "Atacante">("Geral");

  const [stats, setStats] = useState<PlayerRow[]>([]);
  const [votes, setVotes] = useState<VotesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const { data: s1, error: e1 } = await supabase
          .from("v_player_stats")
          .select("player_id,name,goals,assists,last_event_at");

        let statRows: PlayerRow[] = (s1 as any) ?? [];
        if (e1) {
          const { data: s2, error: e2 } = await supabase
            .from("v_goals_assists")
            .select("player_id,name,goals,assists,last_event_at");
          statRows = (s2 as any) ?? [];
          if (e2) statRows = [];
        }

        let voteRows: VotesRow[] = [];
        const { data: v1, error: ve } = await supabase
          .from("v_monthly_votes_current")
          .select("player_id,name,votes");
        if (!ve) voteRows = (v1 as any) ?? [];

        if (!active) return;
        setStats(statRows);
        setVotes(voteRows);
      } catch (e: any) {
        if (!active) return;
        setErr(e?.message || "Erro ao carregar ranking");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    let rows = stats.filter((r) => inRange(r.last_event_at, range));
    if (pos !== "Geral") {
      // quando tiver posição no profile, pode filtrar aqui
      // rows = rows.filter(r => r.position === pos);
    }
    return rows
      .slice()
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists || (a.name || "").localeCompare(b.name || ""));
  }, [stats, range, pos]);

  const topVotes = useMemo(() => {
    return votes
      .slice()
      .sort((a, b) => b.votes - a.votes || (a.name || "").localeCompare(b.name || ""))
      .slice(0, 10);
  }, [votes]);

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4">
      <header>
        <h1 className="text-xl font-semibold">Ranking</h1>
        <p className="text-sm text-zinc-500">Top jogadores por gols/assistências e votos (mobile-first).</p>
      </header>

      <Card className="rounded-2xl">
        <CardContent className="p-3 sm:p-4 flex flex-wrap items-center gap-3">
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={pos} onValueChange={(v) => setPos(v as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Posição" />
            </SelectTrigger>
            <SelectContent>
              {["Geral", "Goleiro", "Zagueiro", "Meia", "Atacante"].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2">Gols & Assistências</h3>
          {loading ? (
            <p className="text-sm text-zinc-500">Carregando…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {err ? `Falha ao carregar: ${err}` *Sem registros para o período."}
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

      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-2">Votos do mês</h3>
          {loading ? (
            <p className="text-sm text-zinc-500">Carregando…</p>
          ) : topVotes.length === 0 ? (
            <p className="text-sm text-zinc-500">Sem dados (a view de votos mensais pode não estar criada ainda).</p>
          ) : (
            <div className="space-y-2">
              {topVotes.map((r, i) => (
                <div key={r.player_id} className="flex items-center justify-between rounded-xl border p-3">
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
    </div>
  );
}

