import React, { useState } from 'react';
import { MapPin, Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/illustrations/empty-state';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';

type Venue = { name: string; address?: string };
type MatchItem = {
  id: string;
  date_time: Date;
  venue: Venue;
  max_players: number;
  confirmed_players: number;
  checkin_window_start?: Date;
  checkin_window_end?: Date;
  teams_drawn?: boolean;
};

// Mock data - trocaremos por Supabase
const mockMatches: MatchItem[] = [
  {
    id: '1',
    date_time: new Date('2025-09-14T19:00:00'),
    venue: { name: 'Campo do Maestros', address: 'Rua das Flores, 123' },
    max_players: 22,
    confirmed_players: 18,
    checkin_window_start: new Date('2025-09-14T18:30:00'),
    checkin_window_end: new Date('2025-09-14T19:15:00'),
    teams_drawn: false,
  },
  {
    id: '2',
    date_time: new Date('2025-09-21T20:00:00'),
    venue: { name: 'Arena Central' },
    max_players: 22,
    confirmed_players: 22,
    checkin_window_start: new Date('2025-09-21T19:30:00'),
    checkin_window_end: new Date('2025-09-21T20:15:00'),
    teams_drawn: true,
  },
];

export const Matches: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const currentUserId = 'user1'; // Mock

  const fmt = (d?: Date) =>
    d ? d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '--';

  const canCheckIn = (m: MatchItem) => {
    const now = new Date();
    if (!m.checkin_window_start || !m.checkin_window_end) return false;
    return now >= m.checkin_window_start && now <= m.checkin_window_end;
  };

  const handleCheckIn = async (matchId: string) => {
    setIsCheckingIn(true);
    try {
      // MVP: simula sucesso
      console.log('Check-in OK para partida', matchId, 'usuário', currentUserId);
      alert(pt.messages?.checkinSuccess || 'Check-in realizado!');
    } catch (e) {
      alert(pt.errors?.generic || 'Erro no check-in');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleOpenRoute = (venue: Venue) => {
    const q = encodeURIComponent(venue.name);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${q}`, '_blank');
  };

  const handleDrawTeams = (matchId: string) => {
    console.log('Sortear times para', matchId);
    alert('Sorteio simulado (MVP)');
  };

  if (mockMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <EmptyState type="matches" className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{pt.messages?.noMatches || 'Sem partidas'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <header className="mb-2">
        <h1 className="text-2xl font-outfit font-bold text-foreground">{pt.navigation.matches}</h1>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {mockMatches.map((match) => {
          const full = match.confirmed_players >= match.max_players;
          const open = canCheckIn(match);
          return (
            <Card key={match.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{fmt(match.date_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{match.venue.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn('text-sm', full ? 'text-red-500' : 'text-green-600')}>
                    {match.confirmed_players}/{match.max_players}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {open ? 'Check-in aberto' : 'Check-in fechado'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                <Button variant="outline" onClick={() => handleOpenRoute(match.venue)}>
                  <MapPin className="w-4 h-4" />
                  Rotas
                </Button>
                <Button
                  variant={open ? 'success' : 'secondary'}
                  disabled={!open || isCheckingIn}
                  onClick={() => handleCheckIn(match.id)}
                >
                  <CheckCircle className="w-4 h-4" />
                  {pt.match?.checkIn || 'Check-in'}
                </Button>
                {!match.teams_drawn && (
                  <Button variant="outline" onClick={() => handleDrawTeams(match.id)}>
                    <Users className="w-4 h-4" />
                    {pt.match?.drawTeams || 'Sortear times'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
