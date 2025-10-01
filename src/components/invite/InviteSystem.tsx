/**
 * Invite System Component
 * Sistema completo de convites por email com templates personalizáveis
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Mail, 
  Send, 
  Users, 
  UserPlus, 
  Copy, 
  Check, 
  X, 
  Clock, 
  Shield,
  Eye,
  EyeOff,
  Settings,
  Template,
  History
} from 'lucide-react';

export interface InviteTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isDefault: boolean;
  variables: string[];
}

export interface Invite {
  id: string;
  email: string;
  role: string;
  message?: string;
  template: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'accepted' | 'expired' | 'failed';
  sentAt?: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  token: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  };
}

export interface InviteConfig {
  defaultRole: string;
  expirationDays: number;
  maxInvitesPerDay: number;
  requireApproval: boolean;
  allowCustomMessage: boolean;
  enableTemplates: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
}

interface InviteSystemProps {
  config: InviteConfig;
  onConfigChange: (config: InviteConfig) => void;
  onSendInvite: (invite: Omit<Invite, 'id' | 'token' | 'status' | 'sentAt'>) => Promise<boolean>;
  onGetInvites: () => Promise<Invite[]>;
  onGetTemplates: () => Promise<InviteTemplate[]>;
  onDeleteInvite: (id: string) => Promise<boolean>;
  onResendInvite: (id: string) => Promise<boolean>;
}

const InviteSystem: React.FC<InviteSystemProps> = ({
  config,
  onConfigChange,
  onSendInvite,
  onGetInvites,
  onGetTemplates,
  onDeleteInvite,
  onResendInvite
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates' | 'settings'>('send');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [templates, setTemplates] = useState<InviteTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: config.defaultRole,
    message: '',
    template: 'default'
  });

  // Templates padrão
  const defaultTemplates: InviteTemplate[] = [
    {
      id: 'default',
      name: 'Convite Padrão',
      subject: 'Convite para participar do Nexus Play',
      content: `
        Olá!
        
        Você foi convidado para participar do Nexus Play, nossa plataforma de gerenciamento de times de futebol.
        
        Clique no link abaixo para aceitar o convite:
        {{inviteLink}}
        
        Este convite expira em {{expirationDays}} dias.
        
        Se você não solicitou este convite, pode ignorar este email.
        
        Atenciosamente,
        Equipe Nexus Play
      `,
      isDefault: true,
      variables: ['inviteLink', 'expirationDays']
    },
    {
      id: 'player',
      name: 'Convite para Jogador',
      subject: 'Você foi convidado para ser jogador no Nexus Play',
      content: `
        Olá!
        
        Você foi convidado para ser um jogador no nosso time através do Nexus Play.
        
        Para aceitar o convite, clique aqui: {{inviteLink}}
        
        Este convite expira em {{expirationDays}} dias.
        
        Esperamos você no time!
        
        Atenciosamente,
        Equipe Nexus Play
      `,
      isDefault: true,
      variables: ['inviteLink', 'expirationDays']
    },
    {
      id: 'admin',
      name: 'Convite para Administrador',
      subject: 'Convite para ser administrador no Nexus Play',
      content: `
        Olá!
        
        Você foi convidado para ser um administrador no Nexus Play.
        
        Como administrador, você terá acesso a:
        - Gerenciar jogadores
        - Configurar times
        - Acessar relatórios
        
        Aceite o convite: {{inviteLink}}
        
        Este convite expira em {{expirationDays}} dias.
        
        Atenciosamente,
        Equipe Nexus Play
      `,
      isDefault: true,
      variables: ['inviteLink', 'expirationDays']
    }
  ];

  // Carregar dados
  useEffect(() => {
    loadInvites();
    loadTemplates();
  }, []);

  const loadInvites = async () => {
    try {
      const data = await onGetInvites();
      setInvites(data);
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await onGetTemplates();
      setTemplates([...defaultTemplates, ...data]);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      setTemplates(defaultTemplates);
    }
  };

  const handleSendInvite = async () => {
    if (!formData.email) return;

    setIsLoading(true);
    try {
      const success = await onSendInvite({
        email: formData.email,
        role: formData.role,
        message: formData.message,
        template: formData.template,
        expiresAt: new Date(Date.now() + config.expirationDays * 24 * 60 * 60 * 1000),
        metadata: {
          ipAddress: 'unknown',
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      });

      if (success) {
        setFormData({ email: '', role: config.defaultRole, message: '', template: 'default' });
        loadInvites();
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvite = async (id: string) => {
    try {
      const success = await onDeleteInvite(id);
      if (success) {
        loadInvites();
      }
    } catch (error) {
      console.error('Erro ao deletar convite:', error);
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      const success = await onResendInvite(id);
      if (success) {
        loadInvites();
      }
    } catch (error) {
      console.error('Erro ao reenviar convite:', error);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getStatusColor = (status: Invite['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'opened':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: Invite['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'sent':
        return <Send className="w-3 h-3" />;
      case 'delivered':
        return <Mail className="w-3 h-3" />;
      case 'opened':
        return <Eye className="w-3 h-3" />;
      case 'accepted':
        return <Check className="w-3 h-3" />;
      case 'expired':
        return <X className="w-3 h-3" />;
      case 'failed':
        return <X className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <>
      {/* Botão de convites */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Convidar</span>
      </Button>

      {/* Modal de convites */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <CardTitle>Sistema de Convites</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-4 gap-2 mb-6">
                <Button
                  variant={activeTab === 'send' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('send')}
                  className="flex items-center space-x-2"
                >
                  <Send className="w-3 h-3" />
                  <span>Enviar</span>
                </Button>
                <Button
                  variant={activeTab === 'history' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('history')}
                  className="flex items-center space-x-2"
                >
                  <History className="w-3 h-3" />
                  <span>Histórico</span>
                </Button>
                <Button
                  variant={activeTab === 'templates' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('templates')}
                  className="flex items-center space-x-2"
                >
                  <Template className="w-3 h-3" />
                  <span>Templates</span>
                </Button>
                <Button
                  variant={activeTab === 'settings' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-3 h-3" />
                  <span>Configurações</span>
                </Button>
              </div>

              {/* Aba: Enviar Convite */}
              {activeTab === 'send' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="usuario@exemplo.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Função</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diarista">Diarista</SelectItem>
                          <SelectItem value="mensalista">Mensalista</SelectItem>
                          <SelectItem value="auxiliar">Auxiliar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {config.enableTemplates && (
                    <div className="space-y-2">
                      <Label htmlFor="template">Template</Label>
                      <Select
                        value={formData.template}
                        onValueChange={(value) => setFormData({ ...formData, template: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {config.allowCustomMessage && (
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem Personalizada (Opcional)</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Adicione uma mensagem personalizada..."
                        rows={3}
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleSendInvite}
                    disabled={!formData.email || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </div>
              )}

              {/* Aba: Histórico */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Convites Enviados</h3>
                    <Badge variant="outline">
                      {invites.length} total
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {invites.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhum convite enviado</p>
                      </div>
                    ) : (
                      invites.map(invite => (
                        <Card key={invite.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{invite.email}</span>
                                <Badge className={getStatusColor(invite.status)}>
                                  {getStatusIcon(invite.status)}
                                  <span className="ml-1">{invite.status}</span>
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Função: {invite.role} • Enviado: {invite.sentAt?.toLocaleString()}
                              </div>
                              {invite.expiresAt && (
                                <div className="text-xs text-gray-400">
                                  Expira: {invite.expiresAt.toLocaleString()}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyInviteLink(invite.token)}
                              >
                                {copiedToken === invite.token ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                              {invite.status === 'failed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResendInvite(invite.id)}
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInvite(invite.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Aba: Templates */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Templates de Convite</h3>
                    <Button size="sm">
                      <Template className="w-3 h-3 mr-2" />
                      Novo Template
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(template => (
                      <Card key={template.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          {template.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Padrão
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {template.subject}
                        </p>
                        <div className="text-xs text-gray-500">
                          Variáveis: {template.variables.join(', ')}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Aba: Configurações */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configurações de Convites</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultRole">Função Padrão</Label>
                      <Select
                        value={config.defaultRole}
                        onValueChange={(value) => onConfigChange({ ...config, defaultRole: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diarista">Diarista</SelectItem>
                          <SelectItem value="mensalista">Mensalista</SelectItem>
                          <SelectItem value="auxiliar">Auxiliar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expirationDays">Dias para Expirar</Label>
                      <Input
                        id="expirationDays"
                        type="number"
                        value={config.expirationDays}
                        onChange={(e) => onConfigChange({ ...config, expirationDays: parseInt(e.target.value) })}
                        min="1"
                        max="30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxInvitesPerDay">Máximo de Convites por Dia</Label>
                      <Input
                        id="maxInvitesPerDay"
                        type="number"
                        value={config.maxInvitesPerDay}
                        onChange={(e) => onConfigChange({ ...config, maxInvitesPerDay: parseInt(e.target.value) })}
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requireApproval">Requer Aprovação</Label>
                        <p className="text-sm text-gray-500">Convites precisam ser aprovados antes do envio</p>
                      </div>
                      <Switch
                        id="requireApproval"
                        checked={config.requireApproval}
                        onCheckedChange={(checked) => onConfigChange({ ...config, requireApproval: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allowCustomMessage">Permitir Mensagem Personalizada</Label>
                        <p className="text-sm text-gray-500">Permitir adicionar mensagem personalizada aos convites</p>
                      </div>
                      <Switch
                        id="allowCustomMessage"
                        checked={config.allowCustomMessage}
                        onCheckedChange={(checked) => onConfigChange({ ...config, allowCustomMessage: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableTemplates">Habilitar Templates</Label>
                        <p className="text-sm text-gray-500">Usar templates personalizáveis para convites</p>
                      </div>
                      <Switch
                        id="enableTemplates"
                        checked={config.enableTemplates}
                        onCheckedChange={(checked) => onConfigChange({ ...config, enableTemplates: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="trackOpens">Rastrear Aberturas</Label>
                        <p className="text-sm text-gray-500">Rastrear quando convites são abertos</p>
                      </div>
                      <Switch
                        id="trackOpens"
                        checked={config.trackOpens}
                        onCheckedChange={(checked) => onConfigChange({ ...config, trackOpens: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="trackClicks">Rastrear Cliques</Label>
                        <p className="text-sm text-gray-500">Rastrear cliques nos links dos convites</p>
                      </div>
                      <Switch
                        id="trackClicks"
                        checked={config.trackClicks}
                        onCheckedChange={(checked) => onConfigChange({ ...config, trackClicks: checked })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default InviteSystem;



