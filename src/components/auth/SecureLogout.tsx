/**
 * Secure Logout Component
 * Sistema completo de logout seguro com limpeza de dados
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LogOut, 
  Shield, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Lock,
  Unlock,
  Activity,
  Database,
  Smartphone,
  Monitor,
  Globe,
  Key,
  Bell,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Award,
  Activity as ActivityIcon,
  ShieldCheck,
  UserCheck,
  MailCheck,
  PhoneCheck,
  MapPinCheck,
  CalendarCheck,
  StarCheck,
  AwardCheck,
  ActivityCheck
} from 'lucide-react';

export interface LogoutConfig {
  clearLocalStorage: boolean;
  clearSessionStorage: boolean;
  clearCookies: boolean;
  clearCache: boolean;
  revokeTokens: boolean;
  endSessions: boolean;
  notifyOtherDevices: boolean;
  backupData: boolean;
  confirmLogout: boolean;
  timeoutSeconds: number;
}

export interface LogoutSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  startedAt: Date;
  lastActivity: Date;
  isCurrent: boolean;
}

export interface LogoutData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLogin: Date;
  };
  sessions: LogoutSession[];
  data: {
    totalSize: number;
    items: number;
    lastBackup: Date;
  };
  security: {
    twoFactor: boolean;
    backupCodes: number;
    securityQuestions: number;
  };
}

interface SecureLogoutProps {
  config: LogoutConfig;
  onConfigChange: (config: LogoutConfig) => void;
  onLogout: (options: LogoutOptions) => Promise<boolean>;
  onGetLogoutData: () => Promise<LogoutData>;
  onRevokeSession: (sessionId: string) => Promise<boolean>;
  onRevokeAllSessions: () => Promise<boolean>;
  onBackupData: () => Promise<boolean>;
}

export interface LogoutOptions {
  clearLocalStorage: boolean;
  clearSessionStorage: boolean;
  clearCookies: boolean;
  clearCache: boolean;
  revokeTokens: boolean;
  endSessions: boolean;
  notifyOtherDevices: boolean;
  backupData: boolean;
}

const SecureLogout: React.FC<SecureLogoutProps> = ({
  config,
  onConfigChange,
  onLogout,
  onGetLogoutData,
  onRevokeSession,
  onRevokeAllSessions,
  onBackupData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [logoutData, setLogoutData] = useState<LogoutData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Carregar dados de logout
  useEffect(() => {
    if (isOpen) {
      loadLogoutData();
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loadLogoutData = async () => {
    try {
      const data = await onGetLogoutData();
      setLogoutData(data);
    } catch (error) {
      console.error('Erro ao carregar dados de logout:', error);
    }
  };

  const handleLogout = async () => {
    if (config.confirmLogout && !confirm('Tem certeza que deseja fazer logout? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsLoggingOut(true);
    setError(null);
    setSuccess(null);

    try {
      const options: LogoutOptions = {
        clearLocalStorage: config.clearLocalStorage,
        clearSessionStorage: config.clearSessionStorage,
        clearCookies: config.clearCookies,
        clearCache: config.clearCache,
        revokeTokens: config.revokeTokens,
        endSessions: config.endSessions,
        notifyOtherDevices: config.notifyOtherDevices,
        backupData: config.backupData
      };

      const success = await onLogout(options);
      if (success) {
        setSuccess('Logout realizado com sucesso');
        setCountdown(config.timeoutSeconds);
        
        // Redirecionar após timeout
        setTimeout(() => {
          window.location.href = '/login';
        }, config.timeoutSeconds * 1000);
      } else {
        setError('Erro ao realizar logout');
      }
    } catch (err) {
      setError('Erro ao processar logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const success = await onRevokeSession(sessionId);
      if (success) {
        setSuccess('Sessão revogada com sucesso');
        loadLogoutData();
      } else {
        setError('Erro ao revogar sessão');
      }
    } catch (err) {
      setError('Erro ao processar revogação da sessão');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Tem certeza que deseja revogar todas as sessões? Você será desconectado de todos os dispositivos.')) {
      return;
    }

    try {
      const success = await onRevokeAllSessions();
      if (success) {
        setSuccess('Todas as sessões foram revogadas');
        loadLogoutData();
      } else {
        setError('Erro ao revogar sessões');
      }
    } catch (err) {
      setError('Erro ao processar revogação das sessões');
    }
  };

  const handleBackupData = async () => {
    try {
      const success = await onBackupData();
      if (success) {
        setSuccess('Dados salvos com sucesso');
        loadLogoutData();
      } else {
        setError('Erro ao salvar dados');
      }
    } catch (err) {
      setError('Erro ao processar backup dos dados');
    }
  };

  const getSessionIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
      return <Smartphone className="w-4 h-4" />;
    } else if (device.toLowerCase().includes('tablet')) {
      return <Monitor className="w-4 h-4" />;
    } else {
      return <Globe className="w-4 h-4" />;
    }
  };

  const getSessionColor = (isCurrent: boolean) => {
    return isCurrent ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800';
  };

  return (
    <>
      {/* Botão de logout */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>

      {/* Modal de logout seguro */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  <CardTitle>Logout Seguro</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </Button>
              </div>
              <CardDescription>
                Configure as opções de logout e limpeza de dados
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Erro/Sucesso */}
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

              {/* Informações do usuário */}
              {logoutData && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações da Conta</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Usuário</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {logoutData.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {logoutData.user.email}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Segurança</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            2FA: {logoutData.security.twoFactor ? 'Ativo' : 'Inativo'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Códigos de backup: {logoutData.security.backupCodes}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Sessões ativas */}
              {logoutData && logoutData.sessions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Sessões Ativas</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRevokeAllSessions}
                      className="text-red-600 hover:text-red-700"
                    >
                      Revogar Todas
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {logoutData.sessions.map(session => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${getSessionColor(session.isCurrent)}`}
                      >
                        <div className="flex items-center space-x-3">
                          {getSessionIcon(session.device)}
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-gray-500">
                              {session.ip} • {session.location}
                            </p>
                            <p className="text-xs text-gray-400">
                              Iniciada em {session.startedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.isCurrent && (
                            <Badge variant="default" className="text-xs">Atual</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Configurações de logout */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Configurações de Logout</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? 'Ocultar' : 'Mostrar'} Avançado
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Limpar Dados Locais</h4>
                      <p className="text-sm text-gray-500">Remove dados armazenados localmente</p>
                    </div>
                    <Switch
                      checked={config.clearLocalStorage}
                      onCheckedChange={(checked) => onConfigChange({ ...config, clearLocalStorage: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Limpar Sessão</h4>
                      <p className="text-sm text-gray-500">Remove dados da sessão atual</p>
                    </div>
                    <Switch
                      checked={config.clearSessionStorage}
                      onCheckedChange={(checked) => onConfigChange({ ...config, clearSessionStorage: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Limpar Cookies</h4>
                      <p className="text-sm text-gray-500">Remove cookies de autenticação</p>
                    </div>
                    <Switch
                      checked={config.clearCookies}
                      onCheckedChange={(checked) => onConfigChange({ ...config, clearCookies: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Limpar Cache</h4>
                      <p className="text-sm text-gray-500">Remove dados em cache</p>
                    </div>
                    <Switch
                      checked={config.clearCache}
                      onCheckedChange={(checked) => onConfigChange({ ...config, clearCache: checked })}
                    />
                  </div>
                </div>

                {showAdvanced && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Revogar Tokens</h4>
                        <p className="text-sm text-gray-500">Invalida tokens de autenticação</p>
                      </div>
                      <Switch
                        checked={config.revokeTokens}
                        onCheckedChange={(checked) => onConfigChange({ ...config, revokeTokens: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Encerrar Sessões</h4>
                        <p className="text-sm text-gray-500">Encerra todas as sessões ativas</p>
                      </div>
                      <Switch
                        checked={config.endSessions}
                        onCheckedChange={(checked) => onConfigChange({ ...config, endSessions: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notificar Outros Dispositivos</h4>
                        <p className="text-sm text-gray-500">Envia notificação para outros dispositivos</p>
                      </div>
                      <Switch
                        checked={config.notifyOtherDevices}
                        onCheckedChange={(checked) => onConfigChange({ ...config, notifyOtherDevices: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Backup de Dados</h4>
                        <p className="text-sm text-gray-500">Faz backup antes do logout</p>
                      </div>
                      <Switch
                        checked={config.backupData}
                        onCheckedChange={(checked) => onConfigChange({ ...config, backupData: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Confirmar Logout</h4>
                        <p className="text-sm text-gray-500">Solicita confirmação antes do logout</p>
                      </div>
                      <Switch
                        checked={config.confirmLogout}
                        onCheckedChange={(checked) => onConfigChange({ ...config, confirmLogout: checked })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeout">Timeout (segundos)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={config.timeoutSeconds}
                        onChange={(e) => onConfigChange({ ...config, timeoutSeconds: parseInt(e.target.value) })}
                        min="0"
                        max="60"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleBackupData}
                    className="flex items-center space-x-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>Backup de Dados</span>
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>
                      {isLoggingOut ? 'Fazendo Logout...' : 'Fazer Logout'}
                    </span>
                  </Button>
                </div>
                
                {countdown > 0 && (
                  <Alert>
                    <Clock className="w-4 h-4" />
                    <AlertDescription>
                      Redirecionando em {countdown} segundos...
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SecureLogout;



