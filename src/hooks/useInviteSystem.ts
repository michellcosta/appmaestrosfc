import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';

export interface Invite {
  id: string;
  email: string;
  role: 'admin' | 'aux' | 'mensalista' | 'diarista';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  acceptedAt?: string;
  inviteCode: string;
}

export interface InviteStats {
  total: number;
  pending: number;
  accepted: number;
  expired: number;
}

export function useInviteSystem() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar convites do localStorage
  useEffect(() => {
    const loadInvites = () => {
      try {
        const storedInvites = localStorage.getItem('maestrosfc_invites');
        if (storedInvites) {
          setInvites(JSON.parse(storedInvites));
        }
      } catch (error) {
        console.error('Erro ao carregar convites:', error);
        setError('Erro ao carregar convites');
      }
    };

    loadInvites();
  }, []);

  // Salvar convites no localStorage
  const saveInvites = (newInvites: Invite[]) => {
    try {
      localStorage.setItem('maestrosfc_invites', JSON.stringify(newInvites));
      setInvites(newInvites);
    } catch (error) {
      console.error('Erro ao salvar convites:', error);
      setError('Erro ao salvar convites');
    }
  };

  // Gerar código de convite único
  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Enviar convite
  const sendInvite = async (email: string, role: Invite['role']): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar se já existe convite para este email
      const existingInvite = invites.find(invite => 
        invite.email.toLowerCase() === email.toLowerCase() && 
        invite.status === 'pending'
      );

      if (existingInvite) {
        setError('Já existe um convite pendente para este email');
        setLoading(false);
        return false;
      }

      // Criar novo convite
      const newInvite: Invite = {
        id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        role,
        status: 'pending',
        invitedBy: user.id,
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        inviteCode: generateInviteCode()
      };

      const updatedInvites = [...invites, newInvite];
      saveInvites(updatedInvites);

      // Simular envio de email (em produção seria integrado com serviço de email)
      console.log(`📧 Convite enviado para ${email} com código ${newInvite.inviteCode}`);
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      setError('Erro ao enviar convite');
      setLoading(false);
      return false;
    }
  };

  // Cancelar convite
  const cancelInvite = (inviteId: string): boolean => {
    try {
      const updatedInvites = invites.map(invite =>
        invite.id === inviteId
          ? { ...invite, status: 'cancelled' as const }
          : invite
      );
      saveInvites(updatedInvites);
      return true;
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      setError('Erro ao cancelar convite');
      return false;
    }
  };

  // Aceitar convite (simulado)
  const acceptInvite = (inviteCode: string): boolean => {
    try {
      const invite = invites.find(inv => 
        inv.inviteCode === inviteCode && 
        inv.status === 'pending' &&
        new Date(inv.expiresAt) > new Date()
      );

      if (!invite) {
        setError('Convite inválido ou expirado');
        return false;
      }

      const updatedInvites = invites.map(inv =>
        inv.id === invite.id
          ? { 
              ...inv, 
              status: 'accepted' as const,
              acceptedAt: new Date().toISOString()
            }
          : inv
      );
      saveInvites(updatedInvites);
      return true;
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      setError('Erro ao aceitar convite');
      return false;
    }
  };

  // Limpar convites expirados
  const cleanExpiredInvites = (): void => {
    const now = new Date();
    const updatedInvites = invites.map(invite => {
      if (invite.status === 'pending' && new Date(invite.expiresAt) < now) {
        return { ...invite, status: 'expired' as const };
      }
      return invite;
    });
    saveInvites(updatedInvites);
  };

  // Gerar link de convite
  const generateInviteLink = (inviteCode: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/accept-invite?code=${inviteCode}`;
  };

  // Estatísticas dos convites
  const getInviteStats = (): InviteStats => {
    return {
      total: invites.length,
      pending: invites.filter(inv => inv.status === 'pending').length,
      accepted: invites.filter(inv => inv.status === 'accepted').length,
      expired: invites.filter(inv => inv.status === 'expired').length
    };
  };

  // Filtrar convites por status
  const getInvitesByStatus = (status: Invite['status']): Invite[] => {
    return invites.filter(invite => invite.status === status);
  };

  // Limpar todos os convites
  const clearAllInvites = (): void => {
    saveInvites([]);
  };

  return {
    invites,
    loading,
    error,
    sendInvite,
    cancelInvite,
    acceptInvite,
    generateInviteLink,
    getInviteStats,
    getInvitesByStatus,
    cleanExpiredInvites,
    clearAllInvites
  };
}
