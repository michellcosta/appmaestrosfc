import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { usePermissions } from '@/hooks/usePermissions';
import RestrictedAccess from './RestrictedAccess';

type CurrentPoll = { poll_id: string; opens_at: string; closes_at: string; };
type PartialRow = { poll_id: string; category: 'Goleiro'|'Zagueiro'|'Meia'|'Atacante'; player_id: string; player_name: string|null; votes: number; };
const CATS: PartialRow['category'][] = ['Goleiro','Zagueiro','Meia','Atacante'];

export default function VotePage() {
  const { canSeeVote } = usePermissions();
  const [poll, setPoll] = useState<CurrentPoll|null>(null);
  const [partials, setPartials] = useState<PartialRow[]>([]);
  const [choice, setChoice] = useState<Record<string,string>>({}); // category -> player_id

  // Verificar permissão
  if (!canSeeVote()) {
    return <RestrictedAccess />;
  }

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from('v_current_polls').select('*').maybeSingle();
      setPoll((p as any) ?? null);
      if (p?.poll_id) {
        const { data: rows } = await supabase
          .from('v_poll_partials')
          .select('poll_id,category,player_id,player_name,votes')
          .eq('poll_id', p.poll_id);
        setPartials((rows as any) ?? []);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const byCat: Record<string, PartialRow[]> = { Goleiro:[],Zagueiro:[],Meia:[],Atacante:[] };
    for (const r of partials) byCat[r.category].push(r);
    for (const c of CATS) byCat[c].sort((a,b)=> b.votes - a.votes || (a.player_name||'').localeCompare(b.player_name||''));
    return byCat;
  }, [partials]);

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
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4">
      <h2 className="text-xl font-semibold">Votações Semanais</h2>
      {!poll ? (
        <div className="text-sm text-zinc-500">Nenhuma votação em andamento.</div>
      ) : (
        <>
          {CATS.map(cat => (
            <Card key={cat} className="rounded-2xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{cat}</div>
                  <div className="text-xs text-zinc-500">Fecha: {new Date(poll.closes_at).toLocaleString()}</div>
                </div>

                <div className="grid sm:grid-cols-[1fr_auto] gap-2">
                  <Select value={choice[cat]||''} onValueChange={(v)=>setChoice(prev=>({...prev,[cat]:v}))}>
                    <SelectTrigger><SelectValue placeholder="Escolha o jogador" /></SelectTrigger>
                    <SelectContent>
                      {grouped[cat].map(r => (
                        <SelectItem key={r.player_id} value={r.player_id}>
                          {r.player_name || r.player_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={()=>submitVote(cat)}>Votar</Button>
                </div>

                <div className="space-y-1">
                  {grouped[cat].length === 0 ? (
                    <div className="text-xs text-zinc-500">Sem votos ainda.</div>
                  ) : grouped[cat].map(r => (
                    <div key={r.player_id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{r.player_name || r.player_id}</span>
                      <span className="font-semibold">{r.votes}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
