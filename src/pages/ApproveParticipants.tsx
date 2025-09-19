import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Clock
} from 'lucide-react';
import { useToastHelpers } from '@/components/ui/toast';

export default function ApproveParticipants() {
  const [loading, setLoading] = useState<string | null>(null);
  const { success, error } = useToastHelpers();

  // Mock data - em produção viria do Supabase
  const [participants, setParticipants] = useState([
    {
      id: '1',
      name: 'Carlos Silva',
      email: 'carlos@exemplo.com',
      phone: '(11) 99999-9999',
      role: 'mensalista',
      status: 'pending',
      requestDate: '2024-01-20',
      invitedBy: 'João Silva'
    },
    {
      id: '2',
      name: 'Ana Costa',
      email: 'ana@exemplo.com', 
      phone: '(11) 88888-8888',
      role: 'diarista',
      status: 'pending',
      requestDate: '2024-01-21',
      invitedBy: 'Maria Santos'
    },
    {
      id: '3',
      name: 'Pedro Santos',
      email: 'pedro@exemplo.com',
      phone: '(11) 77777-7777',
      role: 'mensalista',
      status: 'approved',
      requestDate: '2024-01-18',
      invitedBy: 'João Silva'
    }
  ]);

  const handleApprove = async (participantId: string) => {
    setLoading(participantId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, status: 'approved' }
            : p
        )
      );
      
      const participant = participants.find(p => p.id === participantId);
      success('Participante aprovado', `${participant?.name} foi aprovado com sucesso`);
    } catch (err) {
      error('Erro ao aprovar', 'Tente novamente');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (participantId: string) => {
    setLoading(participantId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, status: 'rejected' }
            : p
        )
      );
      
      const participant = participants.find(p => p.id === participantId);
      success('Participante rejeitado', `${participant?.name} foi rejeitado`);
    } catch (err) {
      error('Erro ao rejeitar', 'Tente novamente');
    } finally {
      setLoading(null);
    }
  };

  const pendingParticipants = participants.filter(p => p.status === 'pending');
  const approvedParticipants = participants.filter(p => p.status === 'approved');
  const rejectedParticipants = participants.filter(p => p.status === 'rejected');

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-green-600" />
          Aprovar Participantes
        </h1>
        <p className="text-sm text-zinc-500">Gerencie as solicitações de participação no grupo</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="animate-scale-in">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-yellow-600">{pendingParticipants.length}</h3>
            <p className="text-sm text-zinc-500">Aguardando Aprovação</p>
          </CardContent>
        </Card>
        
        <Card className="animate-scale-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-600">{approvedParticipants.length}</h3>
            <p className="text-sm text-zinc-500">Aprovados</p>
          </CardContent>
        </Card>
        
        <Card className="animate-scale-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-4 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-red-600">{rejectedParticipants.length}</h3>
            <p className="text-sm text-zinc-500">Rejeitados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Participantes Pendentes */}
      {pendingParticipants.length > 0 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Aguardando Aprovação ({pendingParticipants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingParticipants.map((participant, index) => (
                <div 
                  key={participant.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{participant.name}</h3>
                      <p className="text-sm text-zinc-500">{participant.email}</p>
                      <p className="text-sm text-zinc-500">{participant.phone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {participant.role === 'mensalista' ? '⭐ Mensalista' : '💫 Diarista'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Convidado por {participant.invitedBy}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">
                      {new Date(participant.requestDate).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(participant.id)}
                        disabled={loading === participant.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {loading === participant.id ? 'Aprovando...' : 'Aprovar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(participant.id)}
                        disabled={loading === participant.id}
                        className="text-red-600 hover:bg-red-50 hover:border-red-200"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Participantes Aprovados */}
      {approvedParticipants.length > 0 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Participantes Aprovados ({approvedParticipants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedParticipants.map((participant) => (
                <div 
                  key={participant.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-900/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{participant.name}</h3>
                      <p className="text-sm text-zinc-500">{participant.email}</p>
                      <Badge variant="outline" className="text-xs">
                        {participant.role === 'mensalista' ? '⭐ Mensalista' : '💫 Diarista'}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Aprovado em {new Date(participant.requestDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
