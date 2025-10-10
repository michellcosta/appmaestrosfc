/**
 * Account Settings Component
 * Sistema completo de configurações de conta
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Database, 
  Download, 
  Trash2, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Lock,
  Unlock,
  Activity,
  Clock,
  ShieldCheck,
  UserCheck,
  MailCheck,
  PhoneCheck
} from 'lucide-react';

export interface AccountSettings {
  // Informações pessoais
  personal: {
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    location?: string;
    website?: string;
    birthday?: Date;
  };
  
  // Configurações de segurança
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    twoFactor: boolean;
    backupCodes: string[];
    securityQuestions: SecurityQuestion[];
    sessionTimeout: number;
    loginAlerts: boolean;
    deviceManagement: boolean;
  };
  
  // Preferências de notificação
  notifications: {
    email: {
      enabled: boolean;
      frequency: 'immediate' | 'daily' | 'weekly';
      types: {
        security: boolean;
        activity: boolean;
        marketing: boolean;
        system: boolean;
      };
    };
    push: {
      enabled: boolean;
      types: {
        security: boolean;
        activity: boolean;
        marketing: boolean;
        system: boolean;
      };
    };
    sms: {
      enabled: boolean;
      types: {
        security: boolean;
        activity: boolean;
      };
    };
  };
  
  // Configurações de privacidade
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showActivity: boolean;
    allowSearch: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
  
  // Configurações de aparência
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
    animations: boolean;
    reducedMotion: boolean;
  };
  
  // Configurações de dados
  data: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    dataRetention: number; // em dias
    exportFormat: 'json' | 'csv' | 'pdf';
    deleteAfterExport: boolean;
  };
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
}

export interface AccountActivity {
  lastLogin: Date;
  lastPasswordChange: Date;
  lastEmailChange: Date;
  totalLogins: number;
  failedLogins: number;
  devices: Device[];
  sessions: Session[];
}

export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  lastUsed: Date;
  isCurrent: boolean;
  location: string;
}

export interface Session {
  id: string;
  device: string;
  ip: string;
  location: string;
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

interface AccountSettingsProps {
  settings: AccountSettings;
  activity: AccountActivity;
  onUpdateSettings: (settings: AccountSettings) => Promise<boolean>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  onEnableTwoFactor: () => Promise<boolean>;
  onDisableTwoFactor: () => Promise<boolean>;
  onExportData: (format: string) => Promise<void>;
  onDeleteAccount: () => Promise<boolean>;
  onRevokeSession: (sessionId: string) => Promise<boolean>;
  onRevokeAllSessions: () => Promise<boolean>;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
  settings,
  activity,
  onUpdateSettings,
  onChangePassword,
  onEnableTwoFactor,
  onDisableTwoFactor,
  onExportData,
  onDeleteAccount,
  onRevokeSession,
  onRevokeAllSessions
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'notifications' | 'privacy' | 'appearance' | 'data' | 'activity'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Form state
  const [formData, setFormData] = useState<AccountSettings>(settings);

  // Atualizar form data quando settings muda
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await onUpdateSettings(formData);
      if (success) {
        setSuccess('Configurações salvas com sucesso');
      } else {
        setError('Erro ao salvar configurações');
      }
    } catch (err) {
      setError('Erro ao processar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.security.currentPassword || !formData.security.newPassword) {
      setError('Preencha todos os campos de senha');
      return;
    }

    if (formData.security.newPassword !== formData.security.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.security.newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onChangePassword(
        formData.security.currentPassword,
        formData.security.newPassword
      );
      if (success) {
        setSuccess('Senha alterada com sucesso');
        setFormData({
          ...formData,
          security: {
            ...formData.security,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        });
      } else {
        setError('Erro ao alterar senha');
      }
    } catch (err) {
      setError('Erro ao processar alteração de senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = formData.security.twoFactor 
        ? await onDisableTwoFactor()
        : await onEnableTwoFactor();
      
      if (success) {
        setFormData({
          ...formData,
          security: {
            ...formData.security,
            twoFactor: !formData.security.twoFactor
          }
        });
        setSuccess(`Autenticação de dois fatores ${formData.security.twoFactor ? 'desabilitada' : 'habilitada'}`);
      } else {
        setError('Erro ao alterar autenticação de dois fatores');
      }
    } catch (err) {
      setError('Erro ao processar alteração');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async (format: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await onExportData(format);
      setSuccess('Dados exportados com sucesso');
    } catch (err) {
      setError('Erro ao exportar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onDeleteAccount();
      if (success) {
        setSuccess('Conta deletada com sucesso');
        setIsOpen(false);
      } else {
        setError('Erro ao deletar conta');
      }
    } catch (err) {
      setError('Erro ao processar exclusão da conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await onRevokeSession(sessionId);
      if (success) {
        setSuccess('Sessão revogada com sucesso');
      } else {
        setError('Erro ao revogar sessão');
      }
    } catch (err) {
      setError('Erro ao processar revogação da sessão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Tem certeza que deseja revogar todas as sessões? Você será desconectado de todos os dispositivos.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onRevokeAllSessions();
      if (success) {
        setSuccess('Todas as sessões foram revogadas');
      } else {
        setError('Erro ao revogar sessões');
      }
    } catch (err) {
      setError('Erro ao processar revogação das sessões');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botão de configurações */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Configurações</span>
      </Button>

      {/* Modal de configurações */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <CardTitle>Configurações da Conta</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="personal">Pessoal</TabsTrigger>
                  <TabsTrigger value="security">Segurança</TabsTrigger>
                  <TabsTrigger value="notifications">Notificações</TabsTrigger>
                  <TabsTrigger value="privacy">Privacidade</TabsTrigger>
                  <TabsTrigger value="appearance">Aparência</TabsTrigger>
                  <TabsTrigger value="data">Dados</TabsTrigger>
                  <TabsTrigger value="activity">Atividade</TabsTrigger>
                </TabsList>

                {/* Aba: Pessoal */}
                <TabsContent value="personal" className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={formData.personal.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            personal: { ...formData.personal, name: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.personal.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            personal: { ...formData.personal, email: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={formData.personal.phone || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            personal: { ...formData.personal, phone: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Localização</Label>
                        <Input
                          id="location"
                          value={formData.personal.location || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            personal: { ...formData.personal, location: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.personal.website || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            personal: { ...formData.personal, website: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthday">Data de Nascimento</Label>
                        <Input
                          id="birthday"
                          type="date"
                          value={formData.personal.birthday ? formData.personal.birthday.toISOString().split('T')[0] : ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            personal: { ...formData.personal, birthday: e.target.value ? new Date(e.target.value) : undefined }
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={formData.personal.bio || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          personal: { ...formData.personal, bio: e.target.value }
                        })}
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleSaveSettings}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Informações'}
                    </Button>
                  </div>
                </TabsContent>

                {/* Aba: Segurança */}
                <TabsContent value="security" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configurações de Segurança</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                          <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                        </div>
                        <Switch
                          checked={formData.security.twoFactor}
                          onCheckedChange={handleToggleTwoFactor}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Alertas de Login</h4>
                          <p className="text-sm text-gray-500">Receba notificações de novos logins</p>
                        </div>
                        <Switch
                          checked={formData.security.loginAlerts}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            security: { ...formData.security, loginAlerts: checked }
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Alterar Senha</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Senha Atual</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPasswords.current ? 'text' : 'password'}
                              value={formData.security.currentPassword}
                              onChange={(e) => setFormData({
                                ...formData,
                                security: { ...formData.security, currentPassword: e.target.value }
                              })}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            >
                              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nova Senha</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showPasswords.new ? 'text' : 'password'}
                              value={formData.security.newPassword}
                              onChange={(e) => setFormData({
                                ...formData,
                                security: { ...formData.security, newPassword: e.target.value }
                              })}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={formData.security.confirmPassword}
                              onChange={(e) => setFormData({
                                ...formData,
                                security: { ...formData.security, confirmPassword: e.target.value }
                              })}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <Button
                          onClick={handleChangePassword}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? 'Alterando...' : 'Alterar Senha'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={formData.security.sessionTimeout}
                        onChange={(e) => setFormData({
                          ...formData,
                          security: { ...formData.security, sessionTimeout: parseInt(e.target.value) }
                        })}
                        min="5"
                        max="480"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Aba: Notificações */}
                <TabsContent value="notifications" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configurações de Notificação</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notificações por Email</h4>
                          <p className="text-sm text-gray-500">Receba notificações por email</p>
                        </div>
                        <Switch
                          checked={formData.notifications.email.enabled}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            notifications: {
                              ...formData.notifications,
                              email: { ...formData.notifications.email, enabled: checked }
                            }
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notificações Push</h4>
                          <p className="text-sm text-gray-500">Receba notificações push no navegador</p>
                        </div>
                        <Switch
                          checked={formData.notifications.push.enabled}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            notifications: {
                              ...formData.notifications,
                              push: { ...formData.notifications.push, enabled: checked }
                            }
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notificações por SMS</h4>
                          <p className="text-sm text-gray-500">Receba notificações por SMS</p>
                        </div>
                        <Switch
                          checked={formData.notifications.sms.enabled}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            notifications: {
                              ...formData.notifications,
                              sms: { ...formData.notifications.sms, enabled: checked }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba: Privacidade */}
                <TabsContent value="privacy" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configurações de Privacidade</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="profileVisibility">Visibilidade do Perfil</Label>
                        <Select
                          value={formData.privacy.profileVisibility}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            privacy: { ...formData.privacy, profileVisibility: value as any }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Público</SelectItem>
                            <SelectItem value="friends">Apenas Amigos</SelectItem>
                            <SelectItem value="private">Privado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Mostrar Email</h4>
                            <p className="text-sm text-gray-500">Permitir que outros vejam seu email</p>
                          </div>
                          <Switch
                            checked={formData.privacy.showEmail}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              privacy: { ...formData.privacy, showEmail: checked }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Mostrar Telefone</h4>
                            <p className="text-sm text-gray-500">Permitir que outros vejam seu telefone</p>
                          </div>
                          <Switch
                            checked={formData.privacy.showPhone}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              privacy: { ...formData.privacy, showPhone: checked }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Mostrar Localização</h4>
                            <p className="text-sm text-gray-500">Permitir que outros vejam sua localização</p>
                          </div>
                          <Switch
                            checked={formData.privacy.showLocation}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              privacy: { ...formData.privacy, showLocation: checked }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba: Aparência */}
                <TabsContent value="appearance" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configurações de Aparência</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Tema</Label>
                        <Select
                          value={formData.appearance.theme}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            appearance: { ...formData.appearance, theme: value as any }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                            <SelectItem value="auto">Automático</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select
                          value={formData.appearance.language}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            appearance: { ...formData.appearance, language: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Fuso Horário</Label>
                        <Select
                          value={formData.appearance.timezone}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            appearance: { ...formData.appearance, timezone: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                            <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timeFormat">Formato de Hora</Label>
                        <Select
                          value={formData.appearance.timeFormat}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            appearance: { ...formData.appearance, timeFormat: value as any }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                            <SelectItem value="24h">24 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba: Dados */}
                <TabsContent value="data" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Gerenciamento de Dados</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Backup Automático</h4>
                          <p className="text-sm text-gray-500">Fazer backup automático dos seus dados</p>
                        </div>
                        <Switch
                          checked={formData.data.autoBackup}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            data: { ...formData.data, autoBackup: checked }
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backupFrequency">Frequência do Backup</Label>
                        <Select
                          value={formData.data.backupFrequency}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            data: { ...formData.data, backupFrequency: value as any }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Exportar Dados</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleExportData('json')}
                          disabled={isLoading}
                        >
                          JSON
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleExportData('csv')}
                          disabled={isLoading}
                        >
                          CSV
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleExportData('pdf')}
                          disabled={isLoading}
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-red-600">Zona de Perigo</h4>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? 'Deletando...' : 'Deletar Conta'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba: Atividade */}
                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Atividade da Conta</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Total de Logins</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{activity.totalLogins}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">Último Login</span>
                          </div>
                          <p className="text-sm mt-2">{activity.lastLogin.toLocaleString()}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium">Logins Falhados</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{activity.failedLogins}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Sessões Ativas</h4>
                      <div className="space-y-2">
                        {activity.sessions.map(session => (
                          <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                <Globe className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium">{session.device}</p>
                                <p className="text-sm text-gray-500">{session.ip} • {session.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-500">
                                {session.startedAt.toLocaleDateString()}
                              </p>
                              {session.isActive && (
                                <Badge variant="default" className="text-xs">Ativa</Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={isLoading}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={handleRevokeAllSessions}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? 'Revogando...' : 'Revogar Todas as Sessões'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AccountSettings;



