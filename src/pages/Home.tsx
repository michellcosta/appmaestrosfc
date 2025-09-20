import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, CheckCircle, Navigation } from 'lucide-react';
import { LoadingCard, LoadingStats } from '@/components/ui/loading-card';
import { EmptyGames } from '@/components/ui/empty-state';
import { useToastHelpers } from '@/components/ui/toast';
import { useGamesStore } from '@/store/gamesStore';
import { RouteButton } from '@/components/RouteButton';
import PageLayout from '@/components/layout/PageLayout';
import WeatherForecast from '@/components/WeatherForecast';

export default function HomePage() {
  const navigate = useNavigate();
  const { matches } = useGamesStore();
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToastHelpers();

  // Função para formatar data em português
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${day} de ${month}`;
  };

  // Função para formatar hora
  const formatTime = (timeString: string) => {
    return `${timeString}h`;
  };

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PageLayout title="Início" subtitle="Temperatura Local e Jogos">
        <div className="space-y-4 pb-20">
          <LoadingStats />
          <LoadingCard />
        </div>
      </PageLayout>
    );
  }

  if (matches.length === 0) {
    return (
      <PageLayout title="Início" subtitle="Temperatura Local e Jogos">
        <div className="space-y-4 pb-20">
          <EmptyGames />
        </div>
      </PageLayout>
    );
  }

  const currentMatch = matches[0];

  return (
    <PageLayout title="Início" subtitle="Temperatura Local e Jogos">
      <div className="space-y-4 pb-20">
        <Card className="rounded-2xl">
          <CardContent className="p-6 space-y-4">
            {/* Data e Hora */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-zinc-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatDate(currentMatch.date)}</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatTime(currentMatch.time)}</span>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Users className="w-3 h-3 mr-1" />
                {currentMatch.confirmedPlayers}/{currentMatch.maxPlayers} jogadores
              </Badge>
            </div>

            {/* Localização */}
            <div className="flex items-center space-x-2 text-zinc-600">
              <MapPin className="w-4 h-4" />
              <div>
                <p className="font-medium">{currentMatch.location}</p>
                <p className="text-sm text-zinc-500">Local da partida</p>
              </div>
            </div>

            {/* Status do Check-in */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">Check-in realizado</span>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Button className="flex-1 btn-primary">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmado
                </Button>
                <RouteButton 
                  address={currentMatch.location} 
                  className="flex-1 border-maestros-green text-maestros-green hover:bg-maestros-green/10"
                />
              </div>
              <Button className="w-full btn-secondary">
                <Users className="w-4 h-4 mr-2" />
                Sortear Times
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previsão do Tempo */}
        <WeatherForecast 
          date={currentMatch.date} 
          location={currentMatch.location}
        />

        {/* Próximos Jogos */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Próximas Partidas</h2>
          {matches.slice(1).map((match) => (
            <Card key={match.id} className="rounded-2xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formatDate(match.date)}</p>
                    <p className="text-sm text-zinc-500">{formatTime(match.time)} - {match.location}</p>
                  </div>
                  <Badge variant="outline">{match.confirmedPlayers}/{match.maxPlayers} jogadores</Badge>
                </div>
                <WeatherForecast 
                  date={match.date} 
                  location={match.location}
                  className="border-0 shadow-none bg-zinc-50 dark:bg-zinc-800"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Seção de Testes - Apenas para desenvolvimento */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">🧪 Páginas de Teste</h2>
          <Card className="rounded-2xl">
            <CardContent className="p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/test-page')}
                >
                  Teste Simples
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/offline-auth')}
                >
                  Login Offline
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/test-auth')}
                >
                  Teste Auth
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/debug-auth')}
                >
                  Debug Auth
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

