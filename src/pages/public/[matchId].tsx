import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMatchTimer } from '@/stores/useMatchTimer';
import { useRealtime } from '@/stores/useRealtime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Clock, MapPin } from 'lucide-react';

interface MatchData {
  id: string;
  status: string;
  started_at: string | null;
  paused_ms: number;
  venue?: {
    name: string;
    address: string;
  };
}

interface Event {
  id: string;
  type: string;
  team: string;
  player_id?: string;
  timestamp: string;
}

export default function PublicMatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { 
    status, 
    elapsed, 
    isRunning 
  } = useMatchTimer();
  const { connect, disconnect, events } = useRealtime();
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  // Conectar ao realtime quando a página carregar
  useEffect(() => {
    if (matchId) {
      connect(matchId);
      fetchMatchData();
    }
    
    return () => {
      disconnect();
    };
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      // Mock de dados da partida
      const mockMatch: MatchData = {
        id: matchId!,
        status: 'live',
        started_at: new Date(Date.now() - 300000).toISOString(), // 5 minutos atrás
        paused_ms: 0,
        venue: {
          name: 'Campo do Maestros',
          address: 'Rua das Flores, 123'
        }
      };
      
      setMatchData(mockMatch);
    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'ended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'AO VIVO';
      case 'paused': return 'PAUSADO';
      case 'ended': return 'FINALIZADO';
      default: return 'AGENDADO';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'GOAL': return <Target className="w-4 h-4 text-green-600" />;
      case 'CARD': return <Users className="w-4 h-4 text-yellow-600" />;
      case 'SUB': return <Users className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventText = (event: Event) => {
    switch (event.type) {
      case 'GOAL':
        return `Gol do time ${event.team === 'home' ? 'Casa' : 'Visitante'}`;
      case 'CARD':
        return `Cartão para o time ${event.team === 'home' ? 'Casa' : 'Visitante'}`;
      case 'SUB':
        return `Substituição no time ${event.team === 'home' ? 'Casa' : 'Visitante'}`;
      case 'START':
        return 'Partida iniciada';
      case 'PAUSE':
        return 'Partida pausada';
      case 'END':
        return 'Partida finalizada';
      default:
        return event.type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando partida...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com informações da partida */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {matchData?.venue?.name || 'Partida'}
              </h1>
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {matchData?.venue?.address}
              </p>
            </div>
            <Badge className={`${getStatusColor(status)} text-white text-lg px-4 py-2`}>
              {getStatusText(status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cronômetro principal */}
          <div className="lg:col-span-2">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-4xl font-bold text-gray-900">
                  {formatTime(elapsed)}
                </CardTitle>
                <p className="text-gray-600">
                  {isRunning ? 'Tempo correndo' : 'Tempo parado'}
                </p>
              </CardHeader>
            </Card>

            {/* Placar (mock) */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-center">Placar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">2</div>
                    <div className="text-sm text-gray-600">Casa</div>
                  </div>
                  <div className="text-2xl text-gray-400">×</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">1</div>
                    <div className="text-sm text-gray-600">Visitante</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline de eventos */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Nenhum evento ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {getEventText(event)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações adicionais */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{getStatusText(status)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tempo:</span>
                  <span className="font-medium">{formatTime(elapsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Eventos:</span>
                  <span className="font-medium">{events.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rodapé com informações do app */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nexus Play
            </h3>
            <p className="text-gray-600 text-sm">
              Sistema de gestão de peladas do Maestros FC
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Acompanhe a partida em tempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
