import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { useSimpleInvites } from '@/hooks/useSimpleInvites';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToastHelpers } from '@/components/ui/toast';
import {
  UserPlus,
  Copy,
  CheckCircle,
  Clock,
  Users,
  Mail,
  Calendar,
  Shield,
  Star,
  Zap
} from 'lucide-react';

type Invite = {
  id: string;
  type: 'mensalista' | 'diarista';
  email: string;
  token: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  usedBy?: string;
};

export default function CreateInvite() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [newInvite, setNewInvite] = useState({
    type: 'mensalista' as 'mensalista' | 'diarista',
    email: '',
    expiresIn: '1' // 1 dia
  });

  // Verificar se tem permissão
  if (!user || !['owner', 'admin', 'aux'].includes(user.role || '')) {
    return (
      <div className='p-4 sm:p-6'>
        <Card>
          <CardContent className='p-6 text-center space-y-4'>
            <Shield className='w-12 h-12 mx-auto text-red-500' />
            <h2 className='text-lg font-semibold'>Acesso Restrito</h2>
            <p className='text-sm text-zinc-500'>Apenas Owner, Admin ou Auxiliar podem criar convites.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateInviteToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createInvite = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (!newInvite.email) {
        setMessage('Digite o email do convidado!');
        return;
      }

      const token = generateInviteToken();
      const expiresIn = parseInt(newInvite.expiresIn) * 24 * 60 * 60 * 1000; // converter para ms
      const expiresAt = new Date(Date.now() + expiresIn).toISOString();

      const invite: Invite = {
        id: `invite-${Date.now()}`,
        type: newInvite.type,
        email: newInvite.email,
        token: token,
        createdBy: user.name || 'Usuário',
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt,
        used: false
      };

      // Salvar no localStorage (simulação)
      const existingInvites = JSON.parse(localStorage.getItem('invites') || '[]');
      existingInvites.push(invite);
      localStorage.setItem('invites', JSON.stringify(existingInvites));

      setInvites(existingInvites);
      setMessage(`Convite ${newInvite.type} criado com sucesso!`);
      
      // Resetar formulário
      setNewInvite({
        type: 'mensalista',
        email: '',
        expiresIn: '1'
      });

    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(link);
    setMessage('Link copiado para a área de transferência!');
  };

  const getInviteStatus = (invite: Invite) => {
    if (invite.used) return { text: 'Usado', color: 'bg-green-100 text-green-800' };
    
    const now = new Date();
    const expires = new Date(invite.expiresAt);
    
    if (now > expires) return { text: 'Expirado', color: 'bg-red-100 text-red-800' };
    
    return { text: 'Ativo', color: 'bg-blue-100 text-blue-800' };
  };

  const getInviteIcon = (type: string) => {
    return type === 'mensalista' ? <Star className='w-4 h-4' /> : <Zap className='w-4 h-4' />;
  };

  const getInviteColor = (type: string) => {
    return type === 'mensalista' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  // Carregar convites existentes
  React.useEffect(() => {
    const existingInvites = JSON.parse(localStorage.getItem('invites') || '[]');
    setInvites(existingInvites);
  }, []);

  return (
    <div className='p-4 sm:p-6 space-y-6 pb-20'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <UserPlus className='w-6 h-6 text-blue-600' />
          Criar Convites
        </h1>
        <p className='text-sm text-zinc-500'>Convide novos jogadores para o grupo</p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Criar Convite</TabsTrigger>
          <TabsTrigger value="list">Convites Enviados</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Mail className='w-5 h-5' />
                Novo Convite
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor="type">Tipo de Convite</Label>
                <Select 
                  value={newInvite.type} 
                  onValueChange={(value: 'mensalista' | 'diarista') => 
                    setNewInvite({ ...newInvite, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensalista">
                      <div className='flex items-center gap-2'>
                        <Star className='w-4 h-4' />
                        Mensalista
                      </div>
                    </SelectItem>
                    <SelectItem value="diarista">
                      <div className='flex items-center gap-2'>
                        <Zap className='w-4 h-4' />
                        Diarista
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor="email">Email do Convidado</Label>
                <Input
                  id="email"
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  placeholder="exemplo@email.com"
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor="expires">Validade (dias)</Label>
                <Select 
                  value={newInvite.expiresIn} 
                  onValueChange={(value) => 
                    setNewInvite({ ...newInvite, expiresIn: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 dia</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={createInvite} 
                disabled={loading}
                className='w-full'
              >
                {loading ? 'Criando...' : 'Criar Convite'}
              </Button>

              {message && (
                <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                  <p className='text-sm text-green-800'>{message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='w-5 h-5' />
                Convites Enviados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invites.length === 0 ? (
                <p className='text-sm text-zinc-500 text-center py-4'>
                  Nenhum convite enviado ainda
                </p>
              ) : (
                <div className='space-y-3'>
                  {invites.map((invite) => {
                    const status = getInviteStatus(invite);
                    return (
                      <div key={invite.id} className='p-4 border rounded-lg space-y-3'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            {getInviteIcon(invite.type)}
                            <div>
                              <p className='font-medium'>{invite.email}</p>
                              <p className='text-sm text-zinc-500'>
                                Criado em {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Badge className={getInviteColor(invite.type)}>
                              {invite.type === 'mensalista' ? 'Mensalista' : 'Diarista'}
                            </Badge>
                            <Badge className={status.color}>
                              {status.text}
                            </Badge>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyInviteLink(invite.token)}
                          >
                            <Copy className='w-4 h-4 mr-2' />
                            Copiar Link
                          </Button>
                          <div className='text-xs text-zinc-500'>
                            Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>

                        {invite.used && (
                          <div className='p-2 bg-green-50 rounded text-sm text-green-800'>
                            ✅ Usado em {new Date(invite.usedAt!).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
