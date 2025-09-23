import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bell, Calendar, Clock, MapPin, User, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useDiaristRequests } from '@/hooks/useDiaristRequests';
import { useSessionProfile } from '@/hooks/useSessionProfile';
import { toast } from 'sonner';

type RequestStatus = 'pending' | 'approved' | 'rejected';

interface DiaristRequest {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    position: string;
    stars: number;
  };
  match: {
    id: string;
    date: string;
    time: string;
    location: string;
    confirmedPlayers: number;
    maxPlayers: number;
    dailyPrice: number;
  };
  requestedAt: string;
  status: RequestStatus;
}

export default function AdminNotifications() {
  const { profile } = useSessionProfile();
  const { requests, loading, reviewRequest } = useDiaristRequests();
  
  const [reviewingRequest, setReviewingRequest] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    requestId: string;
    action: 'approve' | 'reject';
    diaristName: string;
  }>({
    isOpen: false,
    requestId: '',
    action: 'approve',
    diaristName: ''
  });
  const [reviewNotes, setReviewNotes] = useState('');

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

  // Verificar se o usuário tem permissão de staff
  const isStaff = profile?.role && ['owner', 'admin', 'aux'].includes(profile.role);

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleReviewAction = (requestId: string, action: 'approve' | 'reject', diaristName: string) => {
    setReviewModal({
      isOpen: true,
      requestId,
      action,
      diaristName
    });
    setReviewNotes('');
  };

  const confirmReview = async () => {
    try {
      setReviewingRequest(reviewModal.requestId);
      await reviewRequest(
        reviewModal.requestId, 
        reviewModal.action === 'approve' ? 'approved' : 'rejected',
        reviewNotes || undefined
      );
      
      toast.success(
        reviewModal.action === 'approve' 
          ? 'Solicitação aprovada com sucesso!' 
          : 'Solicitação rejeitada com sucesso!'
      );
      
      setReviewModal({ isOpen: false, requestId: '', action: 'approve', diaristName: '' });
      setReviewNotes('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar solicitação');
    } finally {
      setReviewingRequest(null);
    }
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pendente</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Rejeitada</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300">Cancelada</Badge>;
      default:
        return <Badge variant="secondary" className="dark:bg-zinc-700 dark:text-zinc-300">{status}</Badge>;
    }
  };

  const getMatchInfo = (matchId: string) => {
    return upcomingMatches.find(m => m.id === matchId);
  };

  if (!isStaff) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 dark:text-zinc-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">Carregando notificações...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">Notificações</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">
            Gerencie solicitações de participação de diaristas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600 dark:text-zinc-400" />
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            {pendingRequests.length} pendentes
          </Badge>
        </div>
      </div>

      {/* Solicitações Pendentes */}
      <Card className="dark:bg-zinc-800 dark:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-zinc-100">
            <Bell className="h-5 w-5 dark:text-zinc-400" />
            Solicitações Pendentes ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const match = getMatchInfo(request.match_id);
              const diaristName = request.user?.email || 'Diarista';
              
              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600 dark:text-zinc-400" />
                        <span className="font-medium dark:text-zinc-100">{diaristName}</span>
                        {request.user?.email && (
                          <span className="text-sm text-gray-600 dark:text-zinc-400">({request.user.email})</span>
                        )}
                      </div>
                      {match && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-zinc-400">
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
                          <span className="font-medium text-green-600 dark:text-green-400">
                            R$ {match.price.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-gray-600 dark:text-zinc-400">
                        Solicitado em: {new Date(request.requested_at).toLocaleDateString('pt-BR')} às {new Date(request.requested_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                        onClick={() => handleReviewAction(request.id, 'approve', diaristName)}
                        disabled={reviewingRequest === request.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                        onClick={() => handleReviewAction(request.id, 'reject', diaristName)}
                        disabled={reviewingRequest === request.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {pendingRequests.length === 0 && (
              <p className="text-gray-500 dark:text-zinc-400 text-center py-4">
                Nenhuma solicitação pendente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Solicitações */}
      <Card className="dark:bg-zinc-800 dark:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-zinc-100">
            <Bell className="h-5 w-5 dark:text-zinc-400" />
            Histórico de Solicitações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => {
              const match = getMatchInfo(request.match_id);
              const diaristName = request.user?.email || 'Diarista';
              
              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 flex items-center justify-between dark:border-zinc-600"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600 dark:text-zinc-400" />
                      <span className="font-medium dark:text-zinc-100">{diaristName}</span>
                      {request.user?.email && (
                        <span className="text-sm text-gray-600 dark:text-zinc-400">({request.user.email})</span>
                      )}
                    </div>
                    {match && (
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-zinc-400">
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
                        <span className="font-medium text-green-600 dark:text-green-400">
                          R$ {match.price.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-zinc-400">
                      Solicitado em: {new Date(request.requested_at).toLocaleDateString('pt-BR')}
                    </div>
                    {request.reviewed_at && (
                      <div className="text-sm text-gray-600 dark:text-zinc-400">
                        Revisado em: {new Date(request.reviewed_at).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {request.notes && (
                      <div className="text-sm text-gray-600 dark:text-zinc-400 flex items-start gap-1">
                        <MessageSquare className="h-3 w-3 mt-0.5" />
                        <span>Observações: {request.notes}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              );
            })}
            {requests.length === 0 && (
              <p className="text-gray-500 dark:text-zinc-400 text-center py-4">
                Nenhuma solicitação encontrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Revisão */}
      <Dialog open={reviewModal.isOpen} onOpenChange={(open) => setReviewModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="dark:bg-zinc-800 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="dark:text-zinc-100">
              {reviewModal.action === 'approve' ? 'Aprovar' : 'Rejeitar'} Solicitação
            </DialogTitle>
            <DialogDescription className="dark:text-zinc-400">
              Você está {reviewModal.action === 'approve' ? 'aprovando' : 'rejeitando'} a solicitação de {reviewModal.diaristName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium dark:text-zinc-100">
                Observações {reviewModal.action === 'reject' ? '(obrigatório)' : '(opcional)'}
              </label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewModal.action === 'approve' 
                    ? 'Adicione observações sobre a aprovação...'
                    : 'Explique o motivo da rejeição...'
                }
                className="mt-1 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder-zinc-400"
              />
            </div>
            
            {reviewModal.action === 'approve' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 dark:bg-green-900/20 dark:border-green-800">
                <p className="text-green-800 text-sm dark:text-green-400">
                  ✅ Ao aprovar, o diarista receberá uma notificação e poderá prosseguir com o pagamento.
                </p>
              </div>
            )}
            
            {reviewModal.action === 'reject' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 dark:bg-red-900/20 dark:border-red-800">
                <p className="text-red-800 text-sm dark:text-red-400">
                  ❌ Ao rejeitar, o diarista receberá uma notificação com o motivo da rejeição.
                </p>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                disabled={reviewingRequest === reviewModal.requestId}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmReview}
                className={`flex-1 ${
                  reviewModal.action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
                }`}
                disabled={
                  reviewingRequest === reviewModal.requestId || 
                  (reviewModal.action === 'reject' && !reviewNotes.trim())
                }
              >
                {reviewingRequest === reviewModal.requestId 
                  ? 'Processando...' 
                  : reviewModal.action === 'approve' 
                    ? 'Confirmar Aprovação' 
                    : 'Confirmar Rejeição'
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}