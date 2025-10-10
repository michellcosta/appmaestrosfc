import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface AdvancedInvite {
  id: string;
  code: string;
  type: 'mensalista' | 'diarista' | 'admin' | 'aux';
  email?: string;
  phone?: string;
  whatsapp_message?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'accepted' | 'expired' | 'cancelled';
  created_by: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  accepted_by?: string;
  metadata: Record<string, any>;
  analytics: {
    total_events: number;
    last_opened?: string;
    last_clicked?: string;
    updated_at?: string;
  };
}

export interface InviteTemplate {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'sms';
  subject?: string;
  content: string;
  variables: Record<string, any>;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InviteCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'mensalista' | 'diarista' | 'admin' | 'aux';
  template_id?: string;
  target_count: number;
  sent_count: number;
  accepted_count: number;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InviteStats {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  opened: number;
  accepted: number;
  expired: number;
  cancelled: number;
  conversion_rate: number;
}

export interface BulkInviteData {
  contacts: Array<{
    email?: string;
    phone?: string;
    name?: string;
  }>;
  type: 'mensalista' | 'diarista' | 'admin' | 'aux';
  template_id?: string;
  expires_in_hours: number;
}

/**
 * Hook avançado para sistema de convites com banco de dados
 */
export function useAdvancedInvites() {
  const [invites, setInvites] = useState<AdvancedInvite[]>([]);
  const [templates, setTemplates] = useState<InviteTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<InviteCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InviteStats | null>(null);

  // Carregar convites
  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('invites')
        .select(`
          *,
          creator:auth.users!invites_created_by_fkey(full_name, avatar_url),
          accepter:auth.users!invites_accepted_by_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvites(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar convites:', err);
      setError('Erro ao carregar convites');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar templates
  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('invite_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar templates:', err);
    }
  }, []);

  // Carregar campanhas
  const fetchCampaigns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('invite_campaigns')
        .select(`
          *,
          template:invite_templates(name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('❌ Erro ao carregar campanhas:', err);
    }
  }, []);

  // Carregar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('status');

      if (error) throw error;

      const stats = data?.reduce((acc, invite) => {
        acc[invite.status] = (acc[invite.status] || 0) + 1;
        acc.total = (acc.total || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const conversion_rate = stats.total > 0
        ? Number(((stats.accepted || 0) / stats.total * 100).toFixed(2))
        : 0;

      setStats({
        total: stats.total || 0,
        pending: stats.pending || 0,
        sent: stats.sent || 0,
        delivered: stats.delivered || 0,
        opened: stats.opened || 0,
        accepted: stats.accepted || 0,
        expired: stats.expired || 0,
        cancelled: stats.cancelled || 0,
        conversion_rate
      });
    } catch (err) {
      console.error('❌ Erro ao carregar estatísticas:', err);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    fetchInvites();
    fetchTemplates();
    fetchCampaigns();
    fetchStats();
  }, [fetchInvites, fetchTemplates, fetchCampaigns, fetchStats]);

  // Criar convite individual
  const createInvite = useCallback(async (inviteData: {
    type: 'mensalista' | 'diarista' | 'admin' | 'aux';
    email?: string;
    phone?: string;
    expires_in_hours?: number;
    template_id?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (inviteData.expires_in_hours || 24));

      const { data, error } = await supabase
        .from('invites')
        .insert({
          code: await generateInviteCode(),
          type: inviteData.type,
          email: inviteData.email,
          phone: inviteData.phone,
          expires_at: expiresAt.toISOString(),
          metadata: inviteData.metadata || {},
          analytics: {}
        })
        .select()
        .single();

      if (error) throw error;

      // Buscar template se especificado
      let template: InviteTemplate | undefined;
      if (inviteData.template_id) {
        const { data: templateData } = await supabase
          .from('invite_templates')
          .select('*')
          .eq('id', inviteData.template_id)
          .single();
        template = templateData;
      }

      // Gerar mensagem WhatsApp se template disponível
      if (template && template.type === 'whatsapp') {
        const message = generateWhatsAppMessage(template, data);
        await supabase
          .from('invites')
          .update({ whatsapp_message: message })
          .eq('id', data.id);
      }

      await fetchInvites();
      await fetchStats();

      toast.success(`Convite ${inviteData.type} criado com sucesso!`);
      return data;
    } catch (err) {
      console.error('❌ Erro ao criar convite:', err);
      setError('Erro ao criar convite');
      toast.error('Erro ao criar convite');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchInvites, fetchStats]);

  // Criar convites em massa
  const createBulkInvites = useCallback(async (bulkData: BulkInviteData) => {
    try {
      setLoading(true);
      setError(null);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + bulkData.expires_in_hours);

      const invitesToCreate = bulkData.contacts.map(contact => ({
        code: generateInviteCodeSync(),
        type: bulkData.type,
        email: contact.email,
        phone: contact.phone,
        expires_at: expiresAt.toISOString(),
        metadata: { name: contact.name },
        analytics: {}
      }));

      const { data, error } = await supabase
        .from('invites')
        .insert(invitesToCreate)
        .select();

      if (error) throw error;

      await fetchInvites();
      await fetchStats();

      toast.success(`${bulkData.contacts.length} convites criados com sucesso!`);
      return data;
    } catch (err) {
      console.error('❌ Erro ao criar convites em massa:', err);
      setError('Erro ao criar convites em massa');
      toast.error('Erro ao criar convites em massa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchInvites, fetchStats]);

  // Enviar convite via WhatsApp
  const sendWhatsAppInvite = useCallback(async (inviteId: string) => {
    try {
      const invite = invites.find(i => i.id === inviteId);
      if (!invite) throw new Error('Convite não encontrado');

      const { data, error } = await supabase
        .from('invites')
        .update({ status: 'sent' })
        .eq('id', inviteId)
        .select()
        .single();

      if (error) throw error;

      // Criar evento de envio
      await supabase
        .from('invite_events')
        .insert({
          invite_id: inviteId,
          event_type: 'sent',
          event_data: { method: 'whatsapp' }
        });

      // Gerar link WhatsApp
      const whatsappLink = generateWhatsAppLink(invite);

      await fetchInvites();
      toast.success('Convite enviado via WhatsApp!');
      return { invite: data, whatsappLink };
    } catch (err) {
      console.error('❌ Erro ao enviar convite WhatsApp:', err);
      toast.error('Erro ao enviar convite WhatsApp');
      throw err;
    }
  }, [invites, fetchInvites]);

  // Aceitar convite
  const acceptInvite = useCallback(async (code: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('*')
        .eq('code', code)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invite) {
        throw new Error('Convite não encontrado ou já utilizado');
      }

      // Verificar se não expirou
      if (new Date() > new Date(invite.expires_at)) {
        throw new Error('Convite expirado');
      }

      // Atualizar convite
      const { data, error } = await supabase
        .from('invites')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: userId
        })
        .eq('id', invite.id)
        .select()
        .single();

      if (error) throw error;

      // Criar evento de aceitação
      await supabase
        .from('invite_events')
        .insert({
          invite_id: invite.id,
          event_type: 'accepted',
          event_data: { accepted_by: userId }
        });

      await fetchInvites();
      await fetchStats();

      toast.success('Convite aceito com sucesso!');
      return data;
    } catch (err) {
      console.error('❌ Erro ao aceitar convite:', err);
      setError(err instanceof Error ? err.message : 'Erro ao aceitar convite');
      toast.error(err instanceof Error ? err.message : 'Erro ao aceitar convite');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchInvites, fetchStats]);

  // Cancelar convite
  const cancelInvite = useCallback(async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('invites')
        .update({ status: 'cancelled' })
        .eq('id', inviteId);

      if (error) throw error;

      await fetchInvites();
      await fetchStats();

      toast.success('Convite cancelado com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao cancelar convite:', err);
      toast.error('Erro ao cancelar convite');
      throw err;
    }
  }, [fetchInvites, fetchStats]);

  // Gerar código de convite único
  const generateInviteCode = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_invite_code');
    if (error) throw error;
    return data;
  }, []);

  const generateInviteCodeSync = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Gerar mensagem WhatsApp
  const generateWhatsAppMessage = useCallback((template: InviteTemplate, invite: AdvancedInvite): string => {
    let message = template.content;

    // Substituir variáveis
    const variables = {
      invite_link: `${window.location.origin}/accept-invite?code=${invite.code}`,
      expires_at: new Date(invite.expires_at).toLocaleString('pt-BR'),
      type: invite.type,
      ...invite.metadata
    };

    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });

    return message;
  }, []);

  // Gerar link WhatsApp
  const generateWhatsAppLink = useCallback((invite: AdvancedInvite): string => {
    const phone = invite.phone?.replace(/\D/g, '') || '';
    const message = invite.whatsapp_message || `Convite para o Maestros FC!\n\nLink: ${window.location.origin}/accept-invite?code=${invite.code}`;

    return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  }, []);

  // Filtrar convites por status
  const getInvitesByStatus = useCallback((status: AdvancedInvite['status']) => {
    return invites.filter(invite => invite.status === status);
  }, [invites]);

  // Buscar convite por código
  const getInviteByCode = useCallback((code: string) => {
    return invites.find(invite => invite.code === code);
  }, [invites]);

  return {
    // Estado
    invites,
    templates,
    campaigns,
    stats,
    loading,
    error,

    // Ações
    createInvite,
    createBulkInvites,
    sendWhatsAppInvite,
    acceptInvite,
    cancelInvite,

    // Utilitários
    getInvitesByStatus,
    getInviteByCode,
    generateWhatsAppLink,
    generateWhatsAppMessage,

    // Refresh
    fetchInvites,
    fetchTemplates,
    fetchCampaigns,
    fetchStats
  };
}
