import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Clock, CheckCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/illustrations/empty-state';
import { ActionSheet } from '@/components/ui/action-sheet';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';
import { TeamColor } from '@/types/teams';

// Mock data - será substituído por dados do Supabase
const mockMatches = [
  {
    id: '1',
    date_time: new Date('2025-09-14T19:00:00'),
    venue: { name: 'Campo do Maestros', address: 'Rua das Flores, 123' },
    max_players: 22,
    confirmed_players: 18,
    checked_in: ['user1', 'user2'],
    teams_drawn: false,
  },
];

export const Matches: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showRouteSheet, setShowRouteSheet] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  
  const currentUserId = 'user1'; // Mock - será obtido do contexto de auth
  const VENUE_LAT = -23.550520; // Mock - virá do app_settings_venue
  const VENUE_LNG = -46.633308;
  const MAX_DISTANCE_METERS = 30;

  // Calcular distância entre dois pontos
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCheckIn = async (matchId: string) => {
    setIsCheckingIn(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          VENUE_LAT,
          VENUE_LNG
        );
        
        if (position.coords.accuracy > 50) {
          setLocationError(pt.match.weakGpsSignal);
          setIsCheckingIn(false);
          return;
        }
        
        if (distance > MAX_DISTANCE_METERS) {
          setLocationError(pt.match.approachField);
          setIsCheckingIn(false);
          return;
        }
        
        // Check-in válido
        setTimeout(() => {
          setIsCheckingIn(false);
          // TODO: Chamar edge function para registrar check-in
        }, 1000);
      },
      (error) => {
        setLocationError('Erro ao obter localização');
        setIsCheckingIn(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleDrawTeams = (matchId: string) => {
    // TODO: Mostrar action sheet de confirmação
    console.log('Drawing teams for match:', matchId);
  };

  const handleOpenRoute = (venue: any) => {
    setSelectedVenue(venue);
    setShowRouteSheet(true);
  };

  const openNavigation = (app: 'googlemaps' | 'waze') => {
    const lat = VENUE_LAT;
    const lng = VENUE_LNG;
    
    if (app === 'googlemaps') {
      // Try deep link first, then fallback to web
      const deepLink = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
      const webLink = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(deepLink);
      setTimeout(() => window.open(webLink, '_blank'), 500);
    } else {
      // Waze
      const deepLink = `waze://?ll=${lat},${lng}&navigate=yes`;
      const webLink = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      window.open(deepLink);
      setTimeout(() => window.open(webLink, '_blank'), 500);
    }
  };

  if (mockMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <EmptyState type="matches" className="text-muted-foreground mb-4" />
        <h2 className="text-xl font-outfit font-semibold text-foreground mb-2">
          {pt.messages.noMatches}
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
        <h1 className="text-2xl font-outfit font-bold text-foreground">
          {pt.navigation.matches}
        </h1>
        <p className="text-muted-foreground mt-1">
          Próximos jogos do grupo
        </p>
      </header>

      {mockMatches.map((match) => {
        const isCheckedIn = match.checked_in.includes(currentUserId);
        const canDrawTeams = match.confirmed_players >= match.max_players * 0.7;
        const matchDate = new Date(match.date_time);
        const isToday = matchDate.toDateString() === new Date().toDateString();
        
        return (
          <Card key={match.id} className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="space-y-4">
              {/* Header do card */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {isToday ? pt.time.today : matchDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {match.confirmed_players}/{match.max_players}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pt.match.players}
                  </div>
                </div>
              </div>

              {/* Local */}
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <MapPin className="w-5 h-5 text-accent-foreground" />
                <div className="flex-1">
                  <div className="font-medium text-accent-foreground">{match.venue.name}</div>
                  <div className="text-sm text-muted-foreground">{match.venue.address}</div>
                </div>
              </div>

              {/* Status de check-in */}
              {isCheckedIn && (
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium text-success">
                    Check-in realizado
                  </span>
                </div>
              )}

              {/* Ações */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={isCheckedIn ? 'success' : 'default'}
                  size="lg"
                  onClick={() => handleCheckIn(match.id)}
                  disabled={isCheckedIn || isCheckingIn}
                  className="w-full"
                >
                  {isCheckingIn ? (
                    <span className="animate-pulse">{pt.messages.loading}</span>
                  ) : isCheckedIn ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirmado
                    </>
                  ) : (
                    pt.match.checkIn
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleOpenRoute(match.venue)}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4" />
                  {pt.match.openRoute}
                </Button>
              </div>

              {/* Ação de sortear times (apenas para admin/aux/owner) */}
              {canDrawTeams && !match.teams_drawn && (
                <Button
                  variant="warning"
                  size="lg"
                  onClick={() => handleDrawTeams(match.id)}
                  className="w-full animate-pulse-glow"
                >
                  <Users className="w-4 h-4" />
                  {pt.match.drawTeams}
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};