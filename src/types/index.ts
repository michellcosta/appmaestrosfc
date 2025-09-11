// Maestros FC - central types
export type TeamColor = 'Preto' | 'Verde' | 'Cinza' | 'Coletes';

export interface GoalEvent {
  id: string;
  ts: number;                // seconds since match start
  team: TeamColor;
  authorId: string;
  authorName: string;
  assistId?: string;
  assistName?: string;
  byUserId: string;          // who registered the goal
}

export type TiebreakerMethod = 'cara_coroa' | 'roleta';

export interface TiebreakerEvent {
  id: string;
  method: TiebreakerMethod;
  winner: TeamColor;
  ts: number;
  byUserId: string;
}

export type DiaristRequestState =
  | 'awaiting_approval'
  | 'approved'
  | 'paying'
  | 'paid'
  | 'full'
  | 'credited';

export interface DiaristRequest {
  id: string;
  userId: string;
  matchId: string;
  state: DiaristRequestState;
  approvedBy?: string;
  approvedAt?: number;
  paymentStartedAt?: number;   // epoch ms when 30:00 window begins
  paidAt?: number;
  creditedAt?: number;
}
