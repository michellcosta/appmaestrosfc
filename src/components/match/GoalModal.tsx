// ===============================
// src/components/match/GoalModal.tsx
// ===============================
import React, { useMemo, useRef, useState } from "react";
import { ActionSheet } from "@/components/ActionSheet";
import { CheckCircle, User, Timer, Trophy } from "lucide-react";
import type { GoalEvent, Player } from "@/types";


export type GoalModalProps = {
open: boolean;
onClose: () => void;
players: Player[];
onSave: (goal: GoalEvent) => void;
defaultMinute?: number;
};


export function GoalModal({ open, onClose, players, onSave, defaultMinute = 0 }: GoalModalProps) {
const [scorerId, setScorerId] = useState<string>("");
const [assistId, setAssistId] = useState<string>("");
const [minute, setMinute] = useState<number>(defaultMinute);
const [isOwnGoal, setIsOwnGoal] = useState(false);
const saveBtnRef = useRef<HTMLButtonElement>(null);


const canSave = useMemo(() => scorerId !== "" && minute >= 0, [scorerId, minute]);


function submit() {
if (!canSave) return;
const goal: GoalEvent = {
id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `id_${Math.random().toString(36).slice(2)}`),
scorerId,
assistId: assistId || undefined,
minute,
ownGoal: isOwnGoal,
createdAt: new Date().toISOString(),
};
onSave(goal);
onClose();
}


return (
<ActionSheet
open={open}
onClose={onClose}
title="Registrar gol"
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
