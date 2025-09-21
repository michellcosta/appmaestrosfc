// Core Types for Maestros FC

export type UserRole = 'owner' | 'admin' | 'aux' | 'mensalista' | 'diarista';
export type TeamColor = 'Preto' | 'Verde' | 'Cinza' | 'Vermelho';
export type ShirtSize = 'G' | 'GG';
export type MatchStatus = 'draft' | 'open' | 'live' | 'closed';
export type GKMode = 'two_fixed' | 'one_fixed' | 'by_team' | 'auto';
export type DiaristStatus = 'requested' | 'accepted' | 'payment_in_progress' | 'paid' | 'declined' | 'full_blocked';
export type PaymentStatus = 'pendente' | 'confirmado' | 'cancelado' | 'revisar';
export type PlayerPosition = 'Gol' | 'Zaga' | 'Lateral' | 'Meio' | 'Atacante' | 'Coringa';

export interface User {
  id: string;
  auth_id?: string;
  name: string;
  email?: string;
  role: UserRole;
  status?: string;
  position?: PlayerPosition;
  stars?: number;
  shirt_size: ShirtSize;
  approved?: boolean;
  photo_url?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface Match {
  id: string;
  date_time: Date;
  max_players: number;
  status: MatchStatus;
  gk_mode: GKMode;
  notes?: string;
  venue?: Venue;
  created_by: string;
  created_at: Date;
  updated_at?: Date;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius_m: number;
}

export type DiaristRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface CheckIn {
  id: string;
  match_id: string;
  user_id: string;
  timestamp: Date;
  lat: number;
  lng: number;
  accuracy?: number;
  mock_location?: boolean;
  selfie_url?: string;
}

export interface TeamDraw {
  match_id: string;
  seed?: string;
  criteria?: Record<string, any>;
  teams: {
    Preto: User[];
    Verde: User[];
    Cinza: User[];
    Vermelho: User[];
  };
}

export interface MatchEvent {
  id: string;
  match_id: string;
  round: number;
  type: 'START' | 'PAUSE' | 'GOAL' | 'SUB' | 'END';
  team_color?: TeamColor;
  player_id?: string;
  assist_id?: string;
  server_timestamp: Date;
  client_timestamp?: Date;
  by_user_id: string;
  meta?: Record<string, any>;
}

export interface Payment {
  id: string;
  user_id: string;
  type: 'mensal' | 'diaria';
  month_ref?: string;
  match_id?: string;
  amount: number;
  status: PaymentStatus;
  provider: 'mercadopago';
  reference_text: string;
  txid?: string;
  charge_id?: string;
  expires_at?: Date;
  created_at: Date;
}

export interface DiaristRequest {
  id: string;
  user_id: string;
  match_id: string;
  status: DiaristRequestStatus;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  payment_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Dados relacionados (joins)
  user?: User;
  reviewer?: User;
}

// Tipos para conflitos de pagamento
export type PaymentConflictReason = 'match_full' | 'duplicate_payment' | 'cancelled_match';
export type PaymentConflictStatus = 'pending' | 'refunded' | 'failed' | 'resolved';

export interface PaymentConflict {
  id: string;
  match_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  payment_id: string;
  conflict_reason: PaymentConflictReason;
  status: PaymentConflictStatus;
  created_at: string;
  resolved_at?: string;
  refund_id?: string;
  notes?: string;
  
  // Relacionamentos
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  match?: {
    id: string;
    date: string;
    time: string;
    location: string;
  };
}

// Tipos para participantes de partidas
export type ParticipantStatus = 'confirmed' | 'cancelled' | 'pending';

export interface MatchParticipant {
  id: string;
  match_id: string;
  user_id: string;
  status: ParticipantStatus;
  joined_at: string;
  payment_confirmed_at?: string;
  payment_amount?: number;
  
  // Relacionamentos
  user?: {
    id: string;
    email: string;
  };
}

// Interface para capacidade de partidas
export interface MatchCapacity {
  match_id: string;
  current_participants: number;
  max_participants: number;
  is_full: boolean;
  pending_payments: number;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  attachments?: any[];
  pinned?: boolean;
  critical?: boolean;
  expiration?: Date;
  created_by: string;
  created_at: Date;
}