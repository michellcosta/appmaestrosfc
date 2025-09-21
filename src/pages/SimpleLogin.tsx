import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { CheckCircle, AlertCircle, User, Mail, Crown } from 'lucide-react';
import { isMainOwner, PROTECTION_MESSAGES } from '@/utils/ownerProtection';

export default function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const { user, signInOffline, signOut } = useAuth();

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      const success = await signInOffline('teste@maestros.com', 'Usuário Teste');
      if (success) {
        showMessage('Login de teste realizado com sucesso!', 'success');
      } else {
        showMessage('Erro no login de teste', 'error');
      }
    } catch (error) {
      showMessage('Erro no login de teste', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // Validações
    if (!email.trim()) {
      showMessage('Por favor, digite seu email', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMessage('Por favor, digite um email válido', 'error');
      return;
    }

    if (!name.trim()) {
      showMessage('Por favor, digite seu nome', 'error');
      return;
    }

    if (name.trim().length < 2) {
      showMessage('Nome deve ter pelo menos 2 caracteres', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Usar o método signInOffline do provider
      await signInOffline(email.trim(), 'temp-password');
      
      // Atualizar o usuário com o nome correto
      const userData = {
        id: 'owner-' + Date.now(),
        email: email.trim(),
        name: name.trim(),
        role: 'owner' as const
      };

      // Salvar no localStorage com o nome correto
      localStorage.setItem('offline_user', JSON.stringify(userData));
      
      showMessage(`Bem-vindo, ${name.trim()}! Login realizado com sucesso.`, 'success');
      
      // Recarregar a página após 2 segundos para aplicar o login
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Erro no login:', error);
      showMessage('Erro ao fazer login. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Verificar se é o owner principal
    if (user?.id && isMainOwner(user.id)) {
      showMessage(PROTECTION_MESSAGES.CANNOT_LOGOUT_MAIN_OWNER, 'error');
      return;
    }
    
    try {
      await signOut();
      showMessage('Logout realizado com sucesso!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Erro no logout:', error);
      showMessage('Erro ao fazer logout', 'error');
    }
  };

  if (user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
        }}
      >
        <div className="w-full max-w-sm space-y-8">
          {/* Header minimalista */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Conectado</h1>
            <p className="text-gray-300">Acesso autorizado</p>
          </div>

          {/* Card de informações clean */}
          <div className="bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-2xl">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-white">{user.name}</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-2xl">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-300">{user.email}</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-2xl">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-green-300">Owner</span>
              </div>
            </div>

            <Button 
              onClick={handleLogout}
              disabled={user?.id ? isMainOwner(user.id) : false}
              className={`w-full h-14 rounded-2xl border-2 font-medium text-base transition-all duration-200 active:scale-95 ${
                user?.id && isMainOwner(user.id) 
                  ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-gray-700 hover:bg-red-600 border-gray-600 hover:border-red-500 text-white hover:text-white'
              }`}
              title={user?.id && isMainOwner(user.id) ? PROTECTION_MESSAGES.CANNOT_LOGOUT_MAIN_OWNER : 'Sair da conta'}
            >
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
      }}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Header com tema Maestros */}
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse delay-150"></div>
          </div>
          <h1 className="text-3xl font-bold text-white">Maestros FC</h1>
          <p className="text-gray-300">Login Rápido</p>
        </div>

        {/* Card principal com tema escuro */}
        <div className="bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-700 space-y-6">
          {/* Campo Nome */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-2xl border-2 border-transparent focus-within:border-maestros-green focus-within:bg-gray-700 transition-all">
              <div className="w-8 h-8 bg-maestros-green rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <Input
                id="name"
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="border-0 bg-transparent p-0 h-auto text-base text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Campo Email */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-2xl border-2 border-transparent focus-within:border-green-500 focus-within:bg-gray-700 transition-all">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="border-0 bg-transparent p-0 h-auto text-base text-white placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${
              messageType === 'success' 
                ? 'bg-green-900/50 border border-green-500/30 text-green-300' 
                : 'bg-red-900/50 border border-red-500/30 text-red-300'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                messageType === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Botão de login */}
          <Button 
            onClick={handleLogin}
            disabled={!name.trim() || !email.trim() || loading}
            className="w-full h-14 rounded-2xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base transition-all duration-200 active:scale-95 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Entrando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>Entrar como Owner</span>
              </div>
            )}
          </Button>

          {/* Botão de teste */}
          <Button 
            onClick={handleTestLogin}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-all duration-200 active:scale-95 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Testando...</span>
              </div>
            ) : (
              <span>🧪 Login de Teste</span>
            )}
          </Button>
        </div>

        {/* Badge de segurança com tema escuro */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full shadow-md border border-gray-600">
            <div className="w-2 h-2 bg-maestros-green rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300 font-medium">Seguro & Rápido</span>
          </div>
        </div>
      </div>
    </div>
  );
}
