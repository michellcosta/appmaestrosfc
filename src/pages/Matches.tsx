import React, { useState } from 'react';
import { MapPin, Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/illustrations/empty-state';
import { ActionSheet } from '@/components/ActionSheet';
import { cn } from '@/lib/utils';
import { withinRadius } from '@/services/location';

// Mock - trocar por Supabase
const mockMatches = [
  {
    id: '1',
    date_time: new Date('2025-09-14T19:00:00'),
    venue: { name: 'Campo do Maestros', address: 'Rua das Flores, 123' },
    max_players: 28, // 4 times x 7 (com 2 GKs)
    confirmed_players: 18,
    checked_in: ['user1', 'user2'],
    teams_drawn: false,
  },
];

export const Matches: React.FC = () => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [flashDraw, setFlashDraw] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showRouteSheet, setShowRouteSheet] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  const currentUserId = 'user1'; // mock — virá do auth
  const VENUE = { lat: -23.55052, lng: -46.633308 }; // mock — virá do app_settings_venue
  const MAX_DISTANCE_METERS = 30;

  const handleCheckIn = async (matchId: string) => {
    setIsCheckingIn(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (pos.coords.accuracy > 50) {
          setLocationError('Sinal de GPS fraco — tente céu aberto');
          setIsCheckingIn(false);
          return;
        }
        const ok = withinRadius(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          VENUE,
          MAX_DISTANCE_METERS
        );
        if (!ok) {
          setLocationError('Aproxime-se do campo (≤ 30 m)');
          setIsCheckingIn(false);
          return;
        }
        // TODO: Supabase edge function: registrar check-in com order de chegada
        setIsCheckingIn(false);
      },
      () => {
        setLocationError('Erro ao obter localização');
        setIsCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleDrawTeams = async (matchId: string) => {
    if (isDrawing) return;
    setIsDrawing(true);
    try {
      // TODO: Supabase edge function: draw-teams (ordem de chegada + posição + estrelas)
      // await supabase.functions.invoke('draw-teams', { body: { matchId } });
      setFlashDraw(true);
      setTimeout(() => setFlashDraw(false), 800);
    } finally {
      setIsDrawing(false);
    }
  };

  const openNavigation = (app: 'googlemaps' | 'waze') => {
    const { lat, lng } = VENUE;
    if (app === 'googlemaps') {
      const deep = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
      const web = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(deep);
      setTimeout(() => window.open(web, '_blank'), 500);
    } else {
      const deep = `waze://?ll=${lat},${lng}&navigate=yes`;
      const web = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      window.open(deep);
      setTimeout(() => window.open(web, '_blank'), 500);
    }
  };

  if (mockMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <EmptyState type="matches" className="text-muted-foreground mb-4" />
        <h2 className="text-xl font-outfit font-semibold text-foreground mb-2">
          Nenhum jogo por enquanto
        </h2>
        <p className="text-muted-foreground text-center">
          Aguarde o próximo jogo ser criado
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-outfit font-bold text-foreground">Jogos</h1>
        <p className="text-muted-foreground mt-1">Próximos jogos do grupo</p>
      </header>

      {locationError && (
        <div className="text-sm text-warning bg-warning/10 border border-warning/20 rounded-lg p-2">
          {locationError}
        </div>
      )}

      {mockMatches.map((match) => {
        const isCheckedIn = match.checked_in.includes(currentUserId);
        const canDrawTeams = match.confirmed_players >= match.max_players * 0.7;
        const matchDate = new Date(match.date_time);
        const isToday = matchDate.toDateString() === new Date().toDateString();

        return (
          <Card key={match.id} className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {isToday
                        ? 'Hoje'
                        : matchDate.toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>
                      {matchDate.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {match.confirmed_players}/{match.max_players}
                  </div>
                  <div className="text-xs text-muted-foreground">jogadores</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <MapPin className="w-5 h-5 text-accent-foreground" />
                <div className="flex-1">
                  <div className="font-medium text-accent-foreground">
                    {match.venue.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {match.venue.address}
                  </div>
                </div>
              </div>

              {isCheckedIn && (
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-success">
                    Check-in realizado
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={isCheckedIn ? 'success' : 'default'}
                  size="lg"
                  onClick={() => handleCheckIn(match.id)}
                  disabled={isCheckedIn || isCheckingIn}
                  className="w-full"
                >
                  {isCheckingIn ? (
                    <span className="animate-pulse">Carregando…</span>
                  ) : isCheckedIn ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirmado
                    </>
                  ) : (
                    'Cheguei'
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowRouteSheet(true)}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4" />
                  Abrir rota
                </Button>
              </div>

              {canDrawTeams && !match.teams_drawn && (
                <Button
                  variant="warning"
                  size="lg"
                  onClick={() => handleDrawTeams(match.id)}
                  className={cn('w-full', flashDraw && 'animate-shine')}
                  disabled={isDrawing}
                >
                  <Users className="w-4 h-4" />
                  {isDrawing ? 'Sorteando…' : 'Sortear times'}
                </Button>
              )}
            </div>
          </Card>
        );
      })}

      <ActionSheet
        isOpen={showRouteSheet}
        onClose={() => setShowRouteSheet(false)}
        title="Abrir rota"
        description="Escolha o app de navegação"
        options={[
          { label: 'Google Maps', onClick: () => { openNavigation('googlemaps'); setShowRouteSheet(false); } },
          { label: 'Waze', onClick: () => { openNavigation('waze'); setShowRouteSheet(false); } },
        ]}
      />
    </div>
  );
};
