import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Star, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useDiaristRequests } from '@/hooks/useDiaristRequests';
import { useSessionProfile } from '@/hooks/useSessionProfile';
import { toast } from 'sonner';

export default function DiaristHome() {
  const { profile } = useSessionProfile();
  const { 
    requests, 
    loading, 
    createRequest, 
    cancelRequest, 
    hasRequestForMatch,
    getRequestForMatch 
  } = useDiaristRequests();
  
  const [requestingMatch, setRequestingMatch] = useState<string | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState<string | null>(null);

  // Mock data para partidas - em produção viria de uma API
  const upcomingMatches = [
    {
      id: '1',
      date: '2024-01-15',
      time: '19:00',
      venue: 'Campo Central',
      participants: 18,
      maxParticipants: 22,
      price: 25.00
    },
    {
      id: '2',
      date: '2024-01-17',
      time: '20:00',
      venue: 'Arena Sul',
      participants: 20,
      maxParticipants: 22,
      price: 30.00
    },
    {
      id: '3',
      date: '2024-01-20',
      time: '18:30',
      venue: 'Campo Norte',
      participants: 22,
      maxParticipants: 22,
      price: 25.00
    }
  ];

  const handleRequestMatch = async (matchId: string) => {
    try {
      setRequestingMatch(matchId);
      await createRequest(matchId);
      toast.success('Solicitação enviada com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao solicitar vaga');
    } finally {
      setRequestingMatch(null);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      setCancellingRequest(requestId);
      await cancelRequest(requestId);
      toast.success('Solicitação cancelada com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cancelar solicitação');
    } finally {
      setCancellingRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aguardando</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejeitada</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Área do Diarista</h1>
        <p className="text-gray-600 mt-2">
          Solicite participação nas próximas partidas
        </p>
        {profile?.approved === false && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Sua conta está aguardando aprovação. Você poderá solicitar vagas após a aprovação.
            </p>
          </div>
        )}
      </div>

      {/* Próximas Partidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Partidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMatches.map((match) => {
              const hasRequest = hasRequestForMatch(match.id);
              const request = getRequestForMatch(match.id);
              const isMatchFull = match.participants >= match.maxParticipants;
              const canRequest = !hasRequest && !isMatchFull && profile?.approved === true;
              
              return (
                <div
                  key={match.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(match.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {match.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {match.venue}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {match.participants}/{match.maxParticipants} participantes
                      </span>
                      <span className="font-medium text-green-600">
                        R$ {match.price.toFixed(2)}
                      </span>
                      {isMatchFull && (
                        <span className="text-red-600 font-medium">
                          (Partida Cheia)
                        </span>
                      )}
                    </div>
                    {hasRequest && request && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className="text-sm text-gray-600">
                          Solicitação: {getStatusBadge(request.status)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasRequest && request?.status === 'pending' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={cancellingRequest === request.id}
                      >
                        {cancellingRequest === request.id ? 'Cancelando...' : 'Cancelar Solicitação'}
                      </Button>
                    ) : (
                      <Button
                        disabled={!canRequest || requestingMatch === match.id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                        onClick={() => handleRequestMatch(match.id)}
                      >
                        {requestingMatch === match.id 
                          ? 'Solicitando...' 
                          : hasRequest 
                            ? 'Já Solicitado'
                            : isMatchFull 
                              ? 'Indisponível'
                              : profile?.approved === false
                                ? 'Aguardando Aprovação'
                                : 'Solicitar Vaga'
                        }
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Minhas Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Minhas Solicitações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => {
              const match = upcomingMatches.find(m => m.id === request.match_id);
              
              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      {match ? (
                        <>
                          {new Date(match.date).toLocaleDateString('pt-BR')} - {match.venue}
                          <span className="text-green-600 font-medium">
                            R$ {match.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        `Partida ${request.match_id}`
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Solicitado em: {new Date(request.requested_at).toLocaleDateString('pt-BR')}
                    </div>
                    {request.reviewed_at && (
                      <div className="text-sm text-gray-600">
                        Revisado em: {new Date(request.reviewed_at).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {request.notes && (
                      <div className="text-sm text-gray-600">
                        Observações: {request.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    {getStatusBadge(request.status)}
                    {request.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={cancellingRequest === request.id}
                      >
                        {cancellingRequest === request.id ? 'Cancelando...' : 'Cancelar'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {requests.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Nenhuma solicitação encontrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}