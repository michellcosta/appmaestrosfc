import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

type AwardRow = {
  month_key: string;
  category: "Goleiro" | "Zagueiro" | "Meia" | "Atacante";
  winner_id: string | null;
  votes: number;
  profiles: { name: string | null } | null;
};

const CATEGORY_ORDER: AwardRow["category"][] = ["Goleiro", "Zagueiro", "Meia", "Atacante"];

function toMonthKey(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function monthLabel(monthKey: string) {
  const [y, m] = monthKey.split("-").slice(0, 2);
  return /;
}

export default function MonthlyAwards({
  initialMonthKey,
  showMonthPicker = true,
  monthsBack = 6,
}: {
  initialMonthKey?: string;
  showMonthPicker?: boolean;
  monthsBack?: number;
}) {
  const now = new Date();
  const defaultMonth = toMonthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));

  const [monthKey, setMonthKey] = useState<string>(initialMonthKey || defaultMonth);
  const [rows, setRows] = useState<AwardRow[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const monthOptions = useMemo(() => {
    const list: string[] = [];
    const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    for (let i = 0; i < monthsBack; i++) {
      const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - i, 1));
      list.push(toMonthKey(d));
    }
    return list;
  }, [monthsBack]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data, error } = await supabase
          .from("monthly_awards")
          .select("month_key, category, winner_id, votes, profiles:winner_id(name)")
          .eq("month_key", monthKey);

        if (!active) return;
        if (error) {
          setErr(error.message);
          setRows(null);
        } else {
          setRows((data as AwardRow[]) ?? []);
        }
      } catch (e: any) {
        if (!active) return;
        setErr(e?.message || "Erro ao carregar premiações");
        setRows(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [monthKey]);

  const ordered = useMemo(() => {
    const byCat: Record<string, AwardRow | undefined> = {};
    (rows || []).forEach(r => { byCat[r.category] = r; });
    return CATEGORY_ORDER.map(cat => byCat[cat]);
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Premiações do mês
        </h2>
        {showMonthPicker && (
          <Select value={monthKey} onValueChange={setMonthKey}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(mk => (
                <SelectItem key={mk} value={mk}>{monthLabel(mk)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : err ? (
        <div className="text-sm text-rose-600">{err}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORY_ORDER.map((cat, i) => {
            const row = ordered[i];
            const name = row?.profiles?.name || "—";
            const votes = row?.votes ?? 0;
            return (
              <Card key={cat} className="rounded-xl border">
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">{cat}</div>
                  <div className="mt-1 text-lg font-semibold">{name}</div>
                  <div className="text-sm text-zinc-600">{votes} voto{votes === 1 ? "" : "s"}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
