import { useState } from 'react';

export interface SimpleInvite {
  id: string;
  type: 'mensalista' | 'diarista';
  code: string;
  link: string;
  message: string;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
}

export function useSimpleInvites() {
  const [invites, setInvites] = useState<SimpleInvite[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar convites do localStorage
  const loadInvites = () => {
    try {
      console.log('Carregando convites do localStorage...');
      const storedInvites = localStorage.getItem('maestrosfc_simple_invites');
      if (storedInvites) {
        const parsedInvites = JSON.parse(storedInvites);
        console.log('Convites carregados:', parsedInvites);
        setInvites(parsedInvites);
      } else {
        console.log('Nenhum convite encontrado no localStorage');
        setInvites([]);
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      setInvites([]);
    }
  };

  // Salvar convites no localStorage
  const saveInvites = (newInvites: SimpleInvite[]) => {
    try {
      console.log('Salvando convites:', newInvites);
      localStorage.setItem('maestrosfc_simple_invites', JSON.stringify(newInvites));
      setInvites(newInvites);
      console.log('Convites salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar convites:', error);
    }
  };

  // Gerar código único
  const generateCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('Código gerado:', result);
    return result;
  };

  // Gerar template de mensagem WhatsApp
  const generateMessage = (type: 'mensalista' | 'diarista', link: string): string => {
    const typeText = type === 'mensalista' ? 'Mensalista' : 'Diarista';
    const typeEmoji = type === 'mensalista' ? '⭐' : '⚡';
    
    const message = `🏆 MAESTROS FC - CONVITE ${typeText.toUpperCase()}! ${typeEmoji}

Olá! Você foi convidado para participar do nosso grupo de futebol como ${typeText.toLowerCase()}!

⚽ Partidas regulares
👥 Grupo ativo e organizado  
🏆 Sistema de ranking
💰 ${type === 'mensalista' ? 'Mensalidade acessível' : 'Pagamento por partida'}

🔗 Entre agora: ${link}

#MaestrosFC #Futebol #Pelada`;
    
    console.log('Mensagem gerada:', message);
    return message;
  };

  // Criar novo convite
  const createInvite = async (type: 'mensalista' | 'diarista', createdBy: string): Promise<SimpleInvite | null> => {
    console.log('Iniciando criação de convite:', { type, createdBy });
    setLoading(true);
    
    try {
      const code = generateCode();
      // Ensure we're generating proper community URLs regardless of environment  
      const isLocalDev = window.location.host.includes('localhost') || 
                         window.location.host.includes('192.168') ||
                         window.location.port.includes('808');
      
      const baseUrl = isLocalDev 
        ? 'https://maestrosfc.com.br'  // Use produção URL for proper invite links
        : window.location.origin;
      const link = `${baseUrl}/join?code=${code}&type=${type}`;
      const message = generateMessage(type, link);
      
      console.log('Dados do convite:', { code, link, message });
      
      const newInvite: SimpleInvite = {
        id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        code,
        link,
        message,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 dia
        createdBy
      };

      console.log('Novo convite criado:', newInvite);
      const updatedInvites = [...invites, newInvite];
      saveInvites(updatedInvites);
      
      setLoading(false);
      return newInvite;
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      setLoading(false);
      return null;
    }
  };

  // Copiar para área de transferência
  const copyToClipboard = async (text: string): Promise<boolean> => {
    console.log('🔄 Tentando copiar:', text.substring(0, 50) + '...');
    
    // Método 1: Tentar API moderna do clipboard
    if (navigator.clipboard) {
      try {
        console.log('📋 Tentando API moderna do clipboard...');
        await navigator.clipboard.writeText(text);
        console.log('✅ Cópia bem-sucedida com API moderna');
        return true;
      } catch (error) {
        console.warn('⚠️ API moderna falhou:', error);
      }
    }
    
    // Método 2: Fallback com execCommand
    try {
      console.log('📝 Tentando fallback com execCommand...');
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Estilos para garantir que funcione em todos os navegadores
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.setAttribute('readonly', '');
      
      document.body.appendChild(textArea);
      
      // Selecionar o texto
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);
      
      // Tentar copiar
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('✅ Cópia bem-sucedida com execCommand');
        return true;
      } else {
        console.error('❌ execCommand retornou false');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no fallback:', error);
      return false;
    }
  };

  // Limpar convites expirados
  const cleanExpiredInvites = (): void => {
    console.log('Limpando convites expirados...');
    const now = new Date();
    const validInvites = invites.filter(invite => new Date(invite.expiresAt) > now);
    console.log('Convites válidos:', validInvites.length);
    saveInvites(validInvites);
  };

  // Obter convites por tipo
  const getInvitesByType = (type: 'mensalista' | 'diarista'): SimpleInvite[] => {
    const filtered = invites.filter(invite => invite.type === type);
    console.log(`Convites do tipo ${type}:`, filtered);
    return filtered;
  };

  // Obter convites recentes (últimos 10)
  const getRecentInvites = (limit: number = 10): SimpleInvite[] => {
    const recent = invites
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    console.log('Convites recentes:', recent);
    return recent;
  };

  // Verificar se convite é válido
  const isInviteValid = (code: string): boolean => {
    const invite = invites.find(inv => inv.code === code);
    if (!invite) {
      console.log('Convite não encontrado:', code);
      return false;
    }
    
    const now = new Date();
    const isValid = new Date(invite.expiresAt) > now;
    console.log('Convite válido:', isValid, 'Expira em:', invite.expiresAt);
    return isValid;
  };

  // Obter convite por código
  const getInviteByCode = (code: string): SimpleInvite | null => {
    const invite = invites.find(inv => inv.code === code) || null;
    console.log('Convite encontrado por código:', invite);
    return invite;
  };

  return {
    invites,
    loading,
    createInvite,
    copyToClipboard,
    cleanExpiredInvites,
    getInvitesByType,
    getRecentInvites,
    isInviteValid,
    getInviteByCode,
    loadInvites
  };
}
