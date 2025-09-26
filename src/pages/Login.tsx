import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Globe } from 'lucide-react';
import { useAuth } from '@/auth/OfflineAuthProvider';

// Componente simplificado sem dependências externas
export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  console.log('Login page rendered'); // Debug log

  // Se já está logado, redireciona para home
  useEffect(() => {
    if (user) {
      console.log('Usuário já logado, redirecionando para home');
      navigate('/home');
    }
  }, [user, navigate]);

  // Verificar se há dados duplicados no localStorage e limpar
  useEffect(() => {
    // Limpar dados de teste automáticos se houver
    const offlineUser = localStorage.getItem('offline_user');
    if (offlineUser) {
      try {
        const userData = JSON.parse(offlineUser);
        if (userData.email === 'owner@maestros.com' && userData.name === 'Owner Teste') {
          console.log('🧹 Limpando usuário de teste automático');
          localStorage.removeItem('offline_user');
          localStorage.removeItem('user_data');
          localStorage.removeItem('player_data');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar dados de user:', error);
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('🔄 Conectando com o Google...');
    
    try {
      // Importar supabase de forma dinâmica
      const { supabase } = await import('@/lib/supabase');
      
      console.log('🔍 Supabase URL:', window.location.origin);
      console.log('🔍 Redirect target:', `${window.location.origin}/home`);
      console.log('🔍 Supabase client loaded:', !!supabase);

      // OAuth redirect URL
      const redirectUrl = `${window.location.origin}/home`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      console.log('🔍 OAuth Response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase OAuth Error:', error);
        
        // Detect specific error types 
        const errorMsg = error?.message || '';
        const status = error?.status;
        
        console.log(`OAuth Error - Status: ${status}, Message: ${errorMsg}`);
        
        if (status === 403 || errorMsg.includes('403') || errorMsg.toLowerCase().includes('forbidden')) {
          setMessage(`❌ **ERRO 403 - Google OAuth não configurado**\n\n🔧 **PASSO A PASSO PARA CONFIGURAR:**\n\n1️⃣ **Google Cloud Console:**\n   • https://console.cloud.google.com → Credentials\n   • Create OAuth 2.0 Client ID → Web Application\n   • Authorized domains: ${window.location.origin}\n   • Redirect URIs: https://autxxmhtadimwvprfsov.supabase.co/auth/v1/callback\n\n2️⃣ **Supabase Dashboard:**\n   • Authentication → Providers → Google\n   • Enable ✓ | Insert Google Client ID & Secret\n\nError: [${status}] ${errorMsg}`);
        } else if (errorMsg.toLowerCase().includes('invalid_client') || errorMsg.toLowerCase().includes('client_id')) {
          setMessage(`❌ **Client inválido**\n\n🔄 **Configurar Google OAuth:**\n1. Google Console → Criar OAuth credentials\n2. Copiar dados para Supabase\n3. Verificar URLs no Supabase\n\nDetalhes: ${errorMsg}`);
        } else {
          setMessage(`❌ **Google Login falhou**\n\nStatus: ${status || 'desconhecido'}\nMensagem: ${errorMsg}\n\nConfigurar: (A) Google OAuth (B) Supabase Auth (C) URLs corretos`);
        }
      } else if (data) {
        console.log('✅ Google OAuth success:', data);
        setMessage('🔄 Aguarde... Redirecionando para Google...');
        // Keep loading while redirecting
        return; // Don't set loading false
      }
    } catch (catchErr: any) {
      console.error('❌ HttpClient/Catch Error:', catchErr);
      const errorStr = catchErr?.message || catchErr?.toString() || 'Unknown error';
      
      setMessage(`❌ **Erro de Conexão**\n\nDetalhes: ${errorStr}\n\n**Diagnóstico:** 1. Chamada OAuth failed 2. Supabase/URL issues. Setup check: (A) Supabase keys OK, (B) Google OAuth configured, (C) Network ok`);
    }
    
    // Only stop loading on error or timeout
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  // Debug - timeout seguro para evitar crash
  React.useEffect(() => {
    console.log('🔍 Login component mounted');
    return () => console.log('🔍 Login component unmounted');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 flex items-center justify-center p-4">
      {/* Background Pattern - Simplificado para evitar problemas de parsing */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-green-100/20 to-blue-100/20 dark:from-green-900/10 dark:to-blue-900/10"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-3 h-3 bg-green-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-32 right-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-1000 opacity-60"></div>
      <div className="absolute bottom-20 left-1/4 w-4 h-4 bg-emerald-400 rounded-full animate-pulse delay-2000 opacity-60"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Branding Header */}
        <div className="text-center mb-8">
          {/* App Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 shadow-lg">
            <Globe className="w-10 h-10 text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Maestros FC
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Entre na sua conta para jogar
          </p>
        </div>

        {/* Login Card */}
        <div className="shadow-2xl border-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-zinc-800/50">
          <div className="text-center pb-6 pt-8 px-8">
            <div className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              Bem-vindo de volta!
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Faça login com sua conta Google para continuar
            </p>
          </div>
          
          <div className="space-y-6 px-8 pb-8">
            {/* Google Login Button */}
            <button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              className="w-full h-14 bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-zinc-200 hover:border-zinc-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-4 rounded-xl font-medium text-base disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Conectando...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center bg-white rounded-lg p-1">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span className="font-semibold">Continuar com Google</span>
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </>
              )}
            </button>

            {/* Trust signals */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Login protegido e seguro</span>
              </div>
              
              <div className="text-xs text-zinc-500 dark:text-zinc-500">
                Ao continuar, você concorda com nossos termos de uso
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-xl ${
                message.includes('❌') 
                  ? 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                  : 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
              }`}>
                <p className={`text-sm font-medium text-center whitespace-pre-line ${
                  message.includes('❌') 
                    ? 'text-red-800 dark:text-red-300' 
                    : 'text-green-800 dark:text-green-300'
                }`}>{message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Não tem conta Google? {' '}
            <a 
              href="https://accounts.google.com/signup" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 font-medium underline decoration-1 underline-offset-2"
            >
              Criar uma grátis
            </a>
          </p>
          
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Suporte técnico disponível 24/7
          </p>
        </div>
      </div>

      {/* Floating Soccer Ball */}
      <div className="fixed bottom-4 right-4 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg animate-bounce opacity-80">
        <div className="flex items-center justify-center w-full h-full">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
