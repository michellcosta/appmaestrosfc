export type TeamColor =
  | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange' | 'gray'
  // rótulos PT usados na UI:
  | 'Preto' | 'Verde' | 'Cinza' | 'Coletes';

export type Player = {
  id: string;
  name: string;
  number?: number;
  avatarUrl?: string;
  preferredPosition?: 'GOL' | 'DEF' | 'MEI' | 'ATA';
};

export type GoalEvent = {
  id: string;
  scorerId: string;
  assistId?: string;
  minute: number;
  ownGoal?: boolean;
  createdAt: string;
  // opcionais usados em Match.tsx:
  team?: TeamColor;
  authorName?: string;
  assistName?: string;
  ts?: number; // segundos (ou ms) conforme uso
};

export type Venue = { name: string; address?: string; lat?: number; lng?: number };

export type Match = {
  id: string;
  date_time: Date | string;
  venue: Venue;
  max_players?: number;
  homeColor?: TeamColor;
  awayColor?: TeamColor;
  goals?: GoalEvent[];
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text?: string;
  createdAt: string;
};

// ---- exigidos por Financial.tsx e Match.tsx ----
export type DiaristRequest = {
  id: string;
  amountCents: number;
  status?: 'pending' | 'paid' | 'full';
  windowStartedAt?: number; // epoch ms
  createdAt?: string;
  updatedAt?: string;
};

export type TiebreakerMethod = 'PENALTIES' | 'DRAW' | 'COIN' | 'NONE';

export type TiebreakerEvent = {
  id: string;
  method: TiebreakerMethod;
  createdAt: string;
};
