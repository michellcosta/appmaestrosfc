import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMatchTimer } from '@/stores/useMatchTimer';
import { useRealtime } from '@/stores/useRealtime';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Square, Target, Users } from 'lucide-react';

interface MatchData {
  id: string;
  status: string;
  started_at: string | null;
  paused_ms: number;
  duration: number;
  venue?: {
    name: string;
    address: string;
  };
}

export default function MatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    status, 
    elapsed, 
    isRunning, 
    setMatch, 
    setDuration,
    reset 
  } = useMatchTimer();
  const { connect, disconnect, events } = useRealtime();
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  // Conectar ao realtime quando a página carregar
  useEffect(() => {
    if (matchId) {
      connect(matchId);
      
      // Buscar dados da partida
      fetchMatchData();
    }
    
    return () => {
      disconnect();
    };
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      // Aqui você faria a requisição para buscar dados da partida
      // Por enquanto, usando dados mockados
      const mockMatch: MatchData = {
        id: matchId!,
        status: 'scheduled',
        started_at: null,
        paused_ms: 0,
        duration: 600, // 10 minutos
        venue: {
          name: 'Campo do Maestros',
          address: 'Rua das Flores, 123'
        }
      };
      
      setMatchData(mockMatch);
      setDuration(mockMatch.duration);
      setMatch(
        mockMatch.id,
        mockMatch.status,
        mockMatch.started_at,
        mockMatch.paused_ms
      );
    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!matchId || !user) return;
    
    try {
      const response = await fetch('/api/events/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
          'X-User-Id': user.id
        },
        body: JSON.stringify({ match_id: matchId })
      });
      
      if (response.ok) {
        console.log('Match started');
      }
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const handlePause = async () => {
    if (!matchId || !user) return;
    
    try {
      const response = await fetch('/api/events/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
          'X-User-Id': user.id
        },
        body: JSON.stringify({ match_id: matchId })
      });
      
      if (response.ok) {
        console.log('Match paused');
      }
    } catch (error) {
      console.error('Error pausing match:', error);
    }
  };

  const handleReset = async () => {
    if (!matchId || !user) return;
    
    try {
      const response = await fetch('/api/events/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
          'X-User-Id': user.id
        },
        body: JSON.stringify({ match_id: matchId })
      });
      
      if (response.ok) {
        console.log('Match reset');
        reset();
      }
    } catch (error) {
      console.error('Error resetting match:', error);
    }
  };

  const handleEnd = async () => {
    if (!matchId || !user) return;
    
    try {
      const response = await fetch('/api/events/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
          'X-User-Id': user.id
        },
        body: JSON.stringify({ match_id: matchId })
      });
      
      if (response.ok) {
        console.log('Match ended');
      }
    } catch (error) {
      console.error('Error ending match:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-600"
          >
            ← Voltar
          </Button>
          <Badge className={`${getStatusColor(status)} text-white`}>
            {getStatusText(status)}
          </Badge>
        </div>

        {/* Cronômetro */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {formatTime(elapsed)}
            </CardTitle>
            <p className="text-gray-600">
              {matchData?.venue?.name}
            </p>
          </CardHeader>
        </Card>

        {/* Controles */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {status === 'scheduled' && (
                <Button
                  onClick={handleStart}
                  className="h-12 text-lg"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  INICIAR
                </Button>
              )}
              
              {status === 'live' && (
                <Button
                  onClick={handlePause}
                  variant="outline"
                  className="h-12 text-lg"
                  size="lg"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  PAUSAR
                </Button>
              )}
              
              {status === 'paused' && (
                <Button
                  onClick={handleStart}
                  className="h-12 text-lg"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  RETOMAR
                </Button>
              )}
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-12 text-lg"
                size="lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                RESET
              </Button>
              
              {(status === 'live' || status === 'paused') && (
                <Button
                  onClick={handleEnd}
                  variant="destructive"
                  className="h-12 text-lg"
                  size="lg"
                >
                  <Square className="w-5 h-5 mr-2" />
                  ENCERRAR
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center"
            onClick={() => navigate(`/match/${matchId}/admin`)}
          >
            <Target className="w-6 h-6 mb-2" />
            <span className="text-sm">Gols & Cartões</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center"
            onClick={() => navigate('/checkin')}
          >
            <Users className="w-6 h-6 mb-2" />
            <span className="text-sm">Check-in</span>
          </Button>
        </div>

        {/* Eventos recentes */}
        {events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events.slice(-5).map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">
                      {event.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(event.received_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
