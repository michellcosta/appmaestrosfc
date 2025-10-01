/**
 * Password Recovery Component
 * Sistema completo de recuperação de senha com múltiplas opções
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Shield, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Eye,
  EyeOff,
  Smartphone,
  MessageSquare,
  Lock,
  Unlock
} from 'lucide-react';

export interface RecoveryMethod {
  id: string;
  type: 'email' | 'sms' | 'security_question' | 'backup_code';
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  cooldown?: number; // em segundos
}

export interface RecoveryRequest {
  id: string;
  email: string;
  method: string;
  status: 'pending' | 'sent' | 'verified' | 'expired' | 'used';
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

export interface RecoveryConfig {
  enabled: boolean;
  methods: RecoveryMethod[];
  expirationMinutes: number;
  maxAttempts: number;
  cooldownMinutes: number;
  requireVerification: boolean;
  allowMultipleRequests: boolean;
  securityQuestions: string[];
}

interface PasswordRecoveryProps {
  config: RecoveryConfig;
  onConfigChange: (config: RecoveryConfig) => void;
  onSendRecovery: (email: string, method: string) => Promise<boolean>;
  onVerifyCode: (code: string, requestId: string) => Promise<boolean>;
  onResetPassword: (newPassword: string, requestId: string) => Promise<boolean>;
  onGetRecoveryRequests: () => Promise<RecoveryRequest[]>;
}

const PasswordRecovery: React.FC<PasswordRecoveryProps> = ({
  config,
  onConfigChange,
  onSendRecovery,
  onVerifyCode,
  onResetPassword,
  onGetRecoveryRequests
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'email' | 'method' | 'verify' | 'reset' | 'complete'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    method: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
    securityAnswer: ''
  });
  
  const [currentRequest, setCurrentRequest] = useState<RecoveryRequest | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Métodos de recuperação disponíveis
  const availableMethods: RecoveryMethod[] = [
    {
      id: 'email',
      type: 'email',
      name: 'Email',
      description: 'Enviar código de recuperação por email',
      icon: <Mail className="w-4 h-4" />,
      available: true
    },
    {
      id: 'sms',
      type: 'sms',
      name: 'SMS',
      description: 'Enviar código por SMS (se cadastrado)',
      icon: <Smartphone className="w-4 h-4" />,
      available: false // Simular que SMS não está disponível
    },
    {
      id: 'security_question',
      type: 'security_question',
      name: 'Pergunta de Segurança',
      description: 'Responder pergunta de segurança',
      icon: <Shield className="w-4 h-4" />,
      available: true
    },
    {
      id: 'backup_code',
      type: 'backup_code',
      name: 'Código de Backup',
      description: 'Usar código de backup (se disponível)',
      icon: <Key className="w-4 h-4" />,
      available: false // Simular que backup code não está disponível
    }
  ];

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const handleEmailSubmit = async () => {
    if (!formData.email) {
      setError('Email é obrigatório');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onSendRecovery(formData.email, 'email');
      if (success) {
        setStep('method');
        setCooldownTime(config.cooldownMinutes * 60);
      } else {
        setError('Erro ao enviar solicitação de recuperação');
      }
    } catch (err) {
      setError('Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelect = (methodId: string) => {
    setFormData({ ...formData, method: methodId });
    setStep('verify');
  };

  const handleVerifyCode = async () => {
    if (!formData.code) {
      setError('Código é obrigatório');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onVerifyCode(formData.code, currentRequest?.id || '');
      if (success) {
        setStep('reset');
        setSuccess('Código verificado com sucesso');
      } else {
        setError('Código inválido ou expirado');
      }
    } catch (err) {
      setError('Erro ao verificar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword) {
      setError('Nova senha é obrigatória');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onResetPassword(formData.newPassword, currentRequest?.id || '');
      if (success) {
        setStep('complete');
        setSuccess('Senha alterada com sucesso');
      } else {
        setError('Erro ao alterar senha');
      }
    } catch (err) {
      setError('Erro ao processar alteração de senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldownTime > 0) {
      setError(`Aguarde ${cooldownTime} segundos antes de reenviar`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onSendRecovery(formData.email, formData.method);
      if (success) {
        setSuccess('Código reenviado com sucesso');
        setCooldownTime(config.cooldownMinutes * 60);
      } else {
        setError('Erro ao reenviar código');
      }
    } catch (err) {
      setError('Erro ao processar reenvio');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      method: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
      securityAnswer: ''
    });
    setStep('email');
    setError(null);
    setSuccess(null);
    setCurrentRequest(null);
    setCooldownTime(0);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Recuperar Senha';
      case 'method':
        return 'Escolher Método';
      case 'verify':
        return 'Verificar Código';
      case 'reset':
        return 'Nova Senha';
      case 'complete':
        return 'Senha Alterada';
      default:
        return 'Recuperar Senha';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return 'Digite seu email para iniciar a recuperação de senha';
      case 'method':
        return 'Escolha como deseja receber o código de recuperação';
      case 'verify':
        return 'Digite o código que enviamos para você';
      case 'reset':
        return 'Crie uma nova senha segura';
      case 'complete':
        return 'Sua senha foi alterada com sucesso';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Botão de recuperação de senha */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Lock className="w-4 h-4" />
        <span>Esqueci minha senha</span>
      </Button>

      {/* Modal de recuperação */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <CardTitle>{getStepTitle()}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  ×
                </Button>
              </div>
              <CardDescription>{getStepDescription()}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Erro */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Sucesso */}
              {success && (
                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Step: Email */}
              {step === 'email' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <Button
                    onClick={handleEmailSubmit}
                    disabled={!formData.email || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Enviando...' : 'Continuar'}
                  </Button>
                </div>
              )}

              {/* Step: Método */}
              {step === 'method' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {availableMethods.filter(method => method.available).map(method => (
                      <Button
                        key={method.id}
                        variant="outline"
                        onClick={() => handleMethodSelect(method.id)}
                        className="w-full justify-start"
                      >
                        {method.icon}
                        <div className="ml-2 text-left">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-xs text-gray-500">{method.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Verificar Código */}
              {step === 'verify' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código de Verificação</Label>
                    <Input
                      id="code"
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Digite o código"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleVerifyCode}
                      disabled={!formData.code || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Verificando...' : 'Verificar'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResendCode}
                      disabled={cooldownTime > 0 || isLoading}
                    >
                      {cooldownTime > 0 ? `${cooldownTime}s` : 'Reenviar'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step: Nova Senha */}
              {step === 'reset' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="Digite sua nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirme sua nova senha"
                    />
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>A senha deve ter pelo menos 8 caracteres e incluir:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Letras maiúsculas e minúsculas</li>
                      <li>Números</li>
                      <li>Caracteres especiais</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleResetPassword}
                    disabled={!formData.newPassword || !formData.confirmPassword || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              )}

              {/* Step: Completo */}
              {step === 'complete' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Senha Alterada!</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Sua senha foi alterada com sucesso. Você pode fazer login com sua nova senha.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                    className="w-full"
                  >
                    Fechar
                  </Button>
                </div>
              )}

              {/* Informações de segurança */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• O código expira em {config.expirationMinutes} minutos</p>
                <p>• Máximo de {config.maxAttempts} tentativas</p>
                <p>• Aguarde {config.cooldownMinutes} minutos entre reenvios</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default PasswordRecovery;



