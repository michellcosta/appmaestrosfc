import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { usePaymentConflicts } from '@/hooks/usePaymentConflicts';
import { useSessionProfile } from '@/hooks/useSessionProfile';
import { PaymentConflict } from '@/types';
import { toast } from 'sonner';

export default function PaymentConflicts() {
  const { profile } = useSessionProfile();
  const { 
    conflicts, 
    loading, 
    fetchConflicts, 
    resolveConflict, 
    processAutomaticRefund 
  } = usePaymentConflicts();
  
  const [resolvingConflict, setResolvingConflict] = useState<string | null>(null);
  const [resolveModal, setResolveModal] = useState<{
    isOpen: boolean;
    conflict: PaymentConflict | null;
    action: 'refund' | 'approve';
  }>({
    isOpen: false,
    conflict: null,
    action: 'refund'
  });
  const [resolveNotes, setResolveNotes] = useState('');

  // Mock data para partidas - em produção viria de uma API
  const upcomingMatches = [
    {
      id: '1',
      date: '2024-01-15',
      time: '19:00',
      venue: 'Campo Central',
      participants: 22,
      maxParticipants: 22,
      price: 25.00
    },
    {
      id: '2',
      date: '2024-01-17',
      time: '20:00',
      venue: 'Arena Sul',
      participants: 22,
      maxParticipants: 22,
      price: 30.00
    }
  ];

  // Verificar se o usuário tem permissão de staff
  const isStaff = profile?.role && ['owner', 'admin', 'aux'].includes(profile.role);

  useEffect(() => {
    if (isStaff) {
      fetchConflicts();
    }
  }, [isStaff, fetchConflicts]);

  const pendingConflicts = conflicts.filter(c => c.status === 'pending');
  const resolvedConflicts = conflicts.filter(c => c.status !== 'pending');

  const handleResolveAction = (conflict: PaymentConflict, action: 'refund' | 'approve') => {
    setResolveModal({
      isOpen: true,
      conflict,
      action
    });
    setResolveNotes('');
  };

  const confirmResolve = async () => {
    if (!resolveModal.conflict) return;

    try {
      setResolvingConflict(resolveModal.conflict.id);
      await resolveConflict(
        resolveModal.conflict.id,
        resolveModal.action,
        resolveNotes || undefined
      );
      
      setResolveModal({ isOpen: false, conflict: null, action: 'refund' });
      setResolveNotes('');
    } catch (error) {
      toast.error('Erro ao resolver conflito');
    } finally {
      setResolvingConflict(null);
    }
  };

  const handleAutomaticRefund = async (conflictId: string) => {
    try {
      setResolvingConflict(conflictId);
      await processAutomaticRefund(conflictId);
      await fetchConflicts(); // Recarregar lista
    } catch (error) {
      toast.error('Erro ao processar estorno automático');
    } finally {
      setResolvingConflict(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'refunded':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Estornado</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Resolvido</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Falhou</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConflictReasonText = (reason: string) => {
    switch (reason) {
      case 'match_full':
        return 'Partida Cheia';
      case 'duplicate_payment':
        return 'Pagamento Duplicado';
      case 'cancelled_match':
        return 'Partida Cancelada';
      default:
        return reason;
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando conflitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conflitos de Pagamento</h1>
          <p className="text-gray-600 mt-2">
            Gerencie conflitos quando partidas ficam cheias ou há problemas de pagamento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {pendingConflicts.length} pendentes
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConflicts}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Conflitos Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Conflitos Pendentes ({pendingConflicts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingConflicts.map((conflict) => {
              const match = getMatchInfo(conflict.match_id);
              const userName = conflict.user?.name || conflict.user?.email || 'Usuário';
              
              return (
                <div
                  key={conflict.id}
                  className="border rounded-lg p-4 bg-orange-50 border-orange-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">
                          {getConflictReasonText(conflict.conflict_reason)}
                        </span>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {getStatusBadge(conflict.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{userName}</span>
                      </div>
                      
                      {match && (
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
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            R$ {conflict.amount.toFixed(2)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-600">{conflict.payment_method}</span>
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Conflito detectado em: {new Date(conflict.created_at).toLocaleDateString('pt-BR')} às {new Date(conflict.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        ID do Pagamento: {conflict.payment_id}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {conflict.conflict_reason === 'match_full' && (
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => handleAutomaticRefund(conflict.id)}
                          disabled={resolvingConflict === conflict.id}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Estorno Automático
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleResolveAction(conflict, 'refund')}
                        disabled={resolvingConflict === conflict.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Estornar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleResolveAction(conflict, 'approve')}
                        disabled={resolvingConflict === conflict.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {pendingConflicts.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Nenhum conflito pendente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Conflitos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Histórico de Conflitos Resolvidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resolvedConflicts.map((conflict) => {
              const match = getMatchInfo(conflict.match_id);
              const userName = conflict.user?.name || conflict.user?.email || 'Usuário';
              
              return (
                <div
                  key={conflict.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">
                        {getConflictReasonText(conflict.conflict_reason)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium">{userName}</span>
                    </div>
                    
                    {match && (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(match.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          R$ {conflict.amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600">
                      Resolvido em: {conflict.resolved_at && new Date(conflict.resolved_at).toLocaleDateString('pt-BR')}
                    </div>
                    
                    {conflict.refund_id && (
                      <div className="text-xs text-gray-500">
                        ID do Estorno: {conflict.refund_id}
                      </div>
                    )}
                    
                    {conflict.notes && (
                      <div className="text-sm text-gray-600 flex items-start gap-1">
                        <MessageSquare className="h-3 w-3 mt-0.5" />
                        <span>{conflict.notes}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(conflict.status)}
                  </div>
                </div>
              );
            })}
            {resolvedConflicts.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Nenhum conflito resolvido
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Resolução */}
      <Dialog open={resolveModal.isOpen} onOpenChange={(open) => setResolveModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolveModal.action === 'refund' ? 'Estornar' : 'Aprovar'} Conflito
            </DialogTitle>
            <DialogDescription>
              Você está {resolveModal.action === 'refund' ? 'estornando' : 'aprovando'} o conflito de pagamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {resolveModal.conflict && (
              <div className="bg-gray-50 border rounded-lg p-3">
                <div className="text-sm space-y-1">
                  <div><strong>Usuário:</strong> {resolveModal.conflict.user?.email}</div>
                  <div><strong>Valor:</strong> R$ {resolveModal.conflict.amount.toFixed(2)}</div>
                  <div><strong>Motivo:</strong> {getConflictReasonText(resolveModal.conflict.conflict_reason)}</div>
                  <div><strong>Pagamento ID:</strong> {resolveModal.conflict.payment_id}</div>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">
                Observações {resolveModal.action === 'refund' ? '(opcional)' : '(recomendado)'}
              </label>
              <Textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder={
                  resolveModal.action === 'refund' 
                    ? 'Adicione observações sobre o estorno...'
                    : 'Explique por que o conflito foi aprovado...'
                }
                className="mt-1"
              />
            </div>
            
            {resolveModal.action === 'refund' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  ⚠️ O estorno será processado e o usuário será notificado.
                </p>
              </div>
            )}
            
            {resolveModal.action === 'approve' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  ✅ O conflito será marcado como resolvido sem estorno.
                </p>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setResolveModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1"
                disabled={resolvingConflict === resolveModal.conflict?.id}
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmResolve}
                className={`flex-1 ${
                  resolveModal.action === 'refund' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={resolvingConflict === resolveModal.conflict?.id}
              >
                {resolvingConflict === resolveModal.conflict?.id 
                  ? 'Processando...' 
                  : resolveModal.action === 'refund' 
                    ? 'Confirmar Estorno' 
                    : 'Confirmar Aprovação'
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}