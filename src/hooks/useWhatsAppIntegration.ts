import { useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface WhatsAppConfig {
  api_key: string;
  api_url: string;
  phone_number_id: string;
  business_account_id: string;
  webhook_token: string;
}

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: 'body' | 'header' | 'footer';
      parameters?: Array<{
        type: 'text';
        text: string;
      }>;
    }>;
  };
  interactive?: {
    type: 'button' | 'list';
    header?: {
      type: 'text';
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      buttons?: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }>;
      sections?: Array<{
        title: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
    };
  };
}

export interface WhatsAppTemplate {
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
  language: string;
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    text?: string;
    buttons?: Array<{
      type: 'URL' | 'PHONE_NUMBER' | 'QUICK_REPLY';
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
}

/**
 * Hook para integração com WhatsApp Business API
 */
export function useWhatsAppIntegration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);

  // Carregar configuração do WhatsApp
  const loadConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('config')
        .eq('provider', 'whatsapp')
        .eq('name', 'business_api')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.config) {
        setConfig(data.config as WhatsAppConfig);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar configuração WhatsApp:', err);
    }
  }, []);

  // Salvar configuração do WhatsApp
  const saveConfig = useCallback(async (newConfig: WhatsAppConfig) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          provider: 'whatsapp',
          name: 'business_api',
          config: newConfig,
          is_active: true
        });

      if (error) throw error;

      setConfig(newConfig);
      toast.success('Configuração WhatsApp salva com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao salvar configuração WhatsApp:', err);
      setError('Erro ao salvar configuração');
      toast.error('Erro ao salvar configuração WhatsApp');
    } finally {
      setLoading(false);
    }
  }, []);

  // Enviar mensagem de texto
  const sendTextMessage = useCallback(async (to: string, message: string) => {
    if (!config) {
      toast.error('WhatsApp não configurado');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.api_url}/v17.0/${config.phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''), // Remove caracteres não numéricos
          type: 'text',
          text: {
            body: message
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao enviar mensagem');
      }

      const result = await response.json();
      toast.success('Mensagem enviada com sucesso!');
      return result;
    } catch (err) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
      toast.error('Erro ao enviar mensagem WhatsApp');
      return false;
    } finally {
      setLoading(false);
    }
  }, [config]);

  // Enviar mensagem com template
  const sendTemplateMessage = useCallback(async (to: string, templateName: string, parameters: string[] = []) => {
    if (!config) {
      toast.error('WhatsApp não configurado');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const messageData: WhatsAppMessage = {
        to: to.replace(/\D/g, ''),
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'pt_BR'
          }
        }
      };

      // Adicionar parâmetros se existirem
      if (parameters.length > 0) {
        messageData.template!.components = [{
          type: 'body',
          parameters: parameters.map(param => ({
            type: 'text' as const,
            text: param
          }))
        }];
      }

      const response = await fetch(`${config.api_url}/v17.0/${config.phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          ...messageData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao enviar template');
      }

      const result = await response.json();
      toast.success('Template enviado com sucesso!');
      return result;
    } catch (err) {
      console.error('❌ Erro ao enviar template WhatsApp:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar template');
      toast.error('Erro ao enviar template WhatsApp');
      return false;
    } finally {
      setLoading(false);
    }
  }, [config]);

  // Enviar mensagem interativa
  const sendInteractiveMessage = useCallback(async (to: string, message: string, buttons: Array<{ id: string, title: string }>) => {
    if (!config) {
      toast.error('WhatsApp não configurado');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const messageData: WhatsAppMessage = {
        to: to.replace(/\D/g, ''),
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: message
          },
          action: {
            buttons: buttons.map(button => ({
              type: 'reply' as const,
              reply: {
                id: button.id,
                title: button.title
              }
            }))
          }
        }
      };

      const response = await fetch(`${config.api_url}/v17.0/${config.phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          ...messageData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao enviar mensagem interativa');
      }

      const result = await response.json();
      toast.success('Mensagem interativa enviada com sucesso!');
      return result;
    } catch (err) {
      console.error('❌ Erro ao enviar mensagem interativa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem interativa');
      toast.error('Erro ao enviar mensagem interativa');
      return false;
    } finally {
      setLoading(false);
    }
  }, [config]);

  // Buscar templates do WhatsApp
  const fetchTemplates = useCallback(async () => {
    if (!config) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.api_url}/v17.0/${config.business_account_id}/message_templates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.api_key}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao buscar templates');
      }

      const result = await response.json();
      setTemplates(result.data || []);
    } catch (err) {
      console.error('❌ Erro ao buscar templates WhatsApp:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar templates');
    } finally {
      setLoading(false);
    }
  }, [config]);

  // Gerar link WhatsApp direto
  const generateWhatsAppLink = useCallback((phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
  }, []);

  // Validar número de telefone
  const validatePhoneNumber = useCallback((phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    // Validação básica para números brasileiros
    return cleanPhone.length >= 10 && cleanPhone.length <= 13;
  }, []);

  // Enviar convite personalizado
  const sendInviteMessage = useCallback(async (phone: string, inviteData: {
    type: string;
    code: string;
    expiresAt: string;
    name?: string;
  }) => {
    const message = `🏆 *Convite Especial para o Maestros FC!* 🏆

${inviteData.name ? `Olá ${inviteData.name}! ` : 'Olá! '}Você foi convidado para se juntar ao nosso grupo exclusivo de futebol!

🎯 *Tipo:* ${inviteData.type === 'mensalista' ? 'Mensalista (R$ 50/mês)' : 'Diarista (R$ 15 por pelada)'}
🏟️ *Local:* Campo Renato Bazin, São Gonçalo
👥 *Grupo:* Apenas 25 jogadores por pelada

🔗 *Link para se juntar:*
${window.location.origin}/accept-invite?code=${inviteData.code}

⏰ *Este convite expira em: ${new Date(inviteData.expiresAt).toLocaleString('pt-BR')}*

_Seja bem-vindo ao time dos Maestros!_ ⚽`;

    return await sendTextMessage(phone, message);
  }, [sendTextMessage]);

  // Enviar convite com botões interativos
  const sendInteractiveInvite = useCallback(async (phone: string, inviteData: {
    type: string;
    code: string;
    expiresAt: string;
    name?: string;
  }) => {
    const message = `🏆 *Convite Especial para o Maestros FC!* 🏆

${inviteData.name ? `Olá ${inviteData.name}! ` : 'Olá! '}Você foi convidado para se juntar ao nosso grupo exclusivo de futebol!

🎯 *Tipo:* ${inviteData.type === 'mensalista' ? 'Mensalista (R$ 50/mês)' : 'Diarista (R$ 15 por pelada)'}
🏟️ *Local:* Campo Renato Bazin, São Gonçalo
👥 *Grupo:* Apenas 25 jogadores por pelada

⏰ *Este convite expira em: ${new Date(inviteData.expiresAt).toLocaleString('pt-BR')}*`;

    const buttons = [
      { id: 'accept_invite', title: 'Aceitar Convite' },
      { id: 'more_info', title: 'Mais Informações' }
    ];

    return await sendInteractiveMessage(phone, message, buttons);
  }, [sendInteractiveMessage]);

  return {
    // Estado
    config,
    templates,
    loading,
    error,

    // Configuração
    loadConfig,
    saveConfig,

    // Mensagens
    sendTextMessage,
    sendTemplateMessage,
    sendInteractiveMessage,

    // Convites
    sendInviteMessage,
    sendInteractiveInvite,

    // Utilitários
    generateWhatsAppLink,
    validatePhoneNumber,
    fetchTemplates
  };
}
