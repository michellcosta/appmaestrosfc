import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActionSheet } from "@/components/ActionSheet";
import { CheckCircle, User, Timer, Trophy } from "lucide-react";
import type { GoalEvent, Player, TeamColor } from "@/types";

export type GoalModalProps = {
  open: boolean;
  onClose: () => void;
  players: Player[];
  // API original:
  onSave?: (goal: GoalEvent) => void;

  // Compatibilidade com uso em Match.tsx:
  teamLabel?: TeamColor;
  onConfirm?: (author: Player, assist?: Player) => void;

  defaultMinute?: number;
};

export function GoalModal({
  open,
  onClose,
  players,
  onSave,
  teamLabel,
  onConfirm,
  defaultMinute = 0,
}: GoalModalProps) {
  const [scorerId, setScorerId] = useState<string>("");
  const [assistId, setAssistId] = useState<string>("");
  const [minute, setMinute] = useState<number>(defaultMinute);
  const [isOwnGoal, setIsOwnGoal] = useState(false);
  const saveBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) setMinute(defaultMinute);
  }, [open, defaultMinute]);

  const canSave = useMemo(() => scorerId !== "" && minute >= 0, [scorerId, minute]);

  function submit() {
    if (!canSave) return;

    if (onConfirm) {
      const author = players.find(p => p.id === scorerId)!;
      const assist = players.find(p => p.id === assistId);
      onConfirm(author, assist);
      onClose();
      return;
    }

    const goal: GoalEvent = {
      id: crypto.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`,
      scorerId,
      assistId: assistId || undefined,
      minute,
      ownGoal: isOwnGoal,
      createdAt: new Date().toISOString(),
      team: teamLabel,
    };
    onSave?.(goal);
    onClose();
  }

  return (
    <ActionSheet
      open={open}
      onClose={onClose}
      title={teamLabel ? `Registrar gol — ${teamLabel}` : "Registrar gol"}
      initialFocusRef={saveBtnRef}
      footer={
        <button
          ref={saveBtnRef}
          disabled={!canSave}
          onClick={submit}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border bg-primary text-primary-foreground px-4 py-3 font-medium disabled:opacity-50"
        >
          <CheckCircle className="h-5 w-5" /> Salvar gol
        </button>
      }
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium">Quem fez o gol?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => setScorerId(p.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left ${
                scorerId === p.id ? "ring-2 ring-primary border-primary" : "hover:bg-muted/50"
              }`}
            >
              <User className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                {p.number != null && (
                  <div className="text-xs text-muted-foreground">#{p.number}</div>
                )}
              </div>
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium mt-2">Assistência (opcional)</label>
        <select
          value={assistId}
          onChange={(e) => setAssistId(e.target.value)}
          className="w-full rounded-xl border p-3 bg-background"
        >
          <option value="">— Sem assistência —</option>
          {players
            .filter((p) => p.id !== scorerId)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>

        <label className="block text-sm font-medium mt-2">Minuto</label>
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4" />
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className="flex-1 rounded-xl border p-3"
            value={minute}
            onChange={(e) => setMinute(Math.max(0, Number(e.target.value)))}
          />
          <span className="text-sm text-muted-foreground">min</span>
        </div>

        <label className="mt-2 inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isOwnGoal}
            onChange={(e) => setIsOwnGoal(e.target.checked)}
          />
          Gol contra
        </label>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy className="h-4 w-4" />
          Dica: toque no jogador para definir o autor do gol e registre o minuto aproximado.
        </div>
      </div>
    </ActionSheet>
  );
}
