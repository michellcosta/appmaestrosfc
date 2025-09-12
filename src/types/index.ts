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
  match_id: string;
  user_id: string;
  status: DiaristStatus;
  accepted_by?: string;
  accepted_at?: Date;
  payment_id?: string;
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