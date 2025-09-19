import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  Zap,
  Shield,
  Mail,
  User
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

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [invite, setInvite] = useState<Invite | null>(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (token) {
      // Buscar convite pelo token
      const invites = JSON.parse(localStorage.getItem('invites') || '[]');
      const foundInvite = invites.find((inv: Invite) => inv.token === token);
      
      if (foundInvite) {
        setInvite(foundInvite);
        setUserData({ ...userData, email: foundInvite.email });
      } else {
        setMessage('Convite não encontrado ou inválido!');
      }
    }
  }, [token]);

  const validateInvite = (invite: Invite) => {
    const now = new Date();
    const expires = new Date(invite.expiresAt);
    
    if (invite.used) {
      return { valid: false, message: 'Este convite já foi usado!' };
    }
    
    if (now > expires) {
      return { valid: false, message: 'Este convite expirou!' };
    }
    
    return { valid: true, message: '' };
  };

  const acceptInvite = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (!invite) {
        setMessage('Convite não encontrado!');
        return;
      }

      if (!userData.name || !userData.email) {
        setMessage('Preencha todos os campos obrigatórios!');
        return;
      }

      const validation = validateInvite(invite);
      if (!validation.valid) {
        setMessage(validation.message);
        return;
      }

      // Marcar convite como usado
      const invites = JSON.parse(localStorage.getItem('invites') || '[]');
      const updatedInvites = invites.map((inv: Invite) => 
        inv.token === token 
          ? { ...inv, used: true, usedAt: new Date().toISOString(), usedBy: userData.name }
          : inv
      );
      localStorage.setItem('invites', JSON.stringify(updatedInvites));

      // Criar usuário
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: invite.type,
        status: invite.type === 'mensalista' ? 'active' : 'pending',
        createdAt: new Date().toISOString(),
        inviteId: invite.id
      };

      // Salvar usuário
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Fazer login automático
      localStorage.setItem('offline_user', JSON.stringify(newUser));

      setMessage(`Cadastro realizado com sucesso! Você é um ${invite.type === 'mensalista' ? 'Mensalista' : 'Diarista'}.`);
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className='p-4 sm:p-6'>
        <Card>
          <CardContent className='p-6 text-center space-y-4'>
            <XCircle className='w-12 h-12 mx-auto text-red-500' />
            <h2 className='text-lg font-semibold'>Convite Inválido</h2>
            <p className='text-sm text-zinc-500'>Token de convite não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className='p-4 sm:p-6'>
        <Card>
          <CardContent className='p-6 text-center space-y-4'>
            <Clock className='w-12 h-12 mx-auto text-blue-500' />
            <h2 className='text-lg font-semibold'>Carregando...</h2>
            <p className='text-sm text-zinc-500'>Verificando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validation = validateInvite(invite);

  if (!validation.valid) {
    return (
      <div className='p-4 sm:p-6'>
        <Card>
          <CardContent className='p-6 text-center space-y-4'>
            <XCircle className='w-12 h-12 mx-auto text-red-500' />
            <h2 className='text-lg font-semibold'>Convite Inválido</h2>
            <p className='text-sm text-zinc-500'>{validation.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-6 pb-20'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <UserPlus className='w-6 h-6 text-blue-600' />
          Aceitar Convite
        </h1>
        <p className='text-sm text-zinc-500'>Complete seu cadastro para entrar no grupo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='w-5 h-5' />
            Convite Recebido
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <div className='flex items-center gap-3'>
              {invite.type === 'mensalista' ? 
                <Star className='w-6 h-6 text-purple-600' /> : 
                <Zap className='w-6 h-6 text-orange-600' />
              }
              <div>
                <p className='font-semibold'>
                  Convite para {invite.type === 'mensalista' ? 'Mensalista' : 'Diarista'}
                </p>
                <p className='text-sm text-zinc-600'>
                  Enviado por {invite.createdBy}
                </p>
                <p className='text-sm text-zinc-500'>
                  Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="seu@email.com"
                disabled
              />
              <p className='text-xs text-zinc-500'>Email definido pelo convite</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Shield className='w-4 h-4 text-yellow-600' />
              <span className='text-sm text-yellow-800'>Importante:</span>
            </div>
            <ul className='text-xs text-yellow-700 mt-1 space-y-1'>
              <li>• Mensalistas: acesso completo ao app</li>
              <li>• Diaristas: aguardam aprovação para acessar</li>
              <li>• Diaristas aprovados: acesso limitado (Jogos, Financeiro, Perfil)</li>
            </ul>
          </div>

          <Button 
            onClick={acceptInvite} 
            disabled={loading}
            className='w-full'
          >
            {loading ? 'Processando...' : 'Aceitar Convite'}
          </Button>

          {message && (
            <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-600' />
                <span className='text-sm text-green-800'>{message}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
