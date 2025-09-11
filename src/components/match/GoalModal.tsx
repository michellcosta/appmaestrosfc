// src/components/match/GoalModal.tsx
import type { GoalEvent, Player, TeamColor } from '@/types';

export type GoalModalProps = {
  open: boolean;
  onClose: () => void;
  players: Player[];
  // API original:
  onSave?: (goal: GoalEvent) => void;

  // Compat com Match.tsx:
  teamLabel?: TeamColor;
  onConfirm?: (author: Player, assist?: Player) => void;
};

// ... dentro do submit()
if (onConfirm) {
  const author = players.find(p => p.id === scorerId)!;
  const assist = players.find(p => p.id === assistId);
  onConfirm(author, assist);
} else if (onSave) {
  onSave({
    id: crypto.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`,
    scorerId,
    assistId: assistId || undefined,
    minute,
    ownGoal: isOwnGoal,
    createdAt: new Date().toISOString(),
  });
}
