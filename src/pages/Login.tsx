import { useAuth } from '@/auth/OfflineAuthProvider';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { NetworkAccessNotice } from '@/components/NetworkAccessNotice';
import { Card, CardContent } from '@/components/ui/card';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Globe, Loader2, Shield, Sparkles, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleGoogleSignIn, createOrUpdateProfile } = useGoogleAuth();
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
      console.log('🔄 Iniciando Google OAuth...');

      // Usar o hook do Google OAuth
      await handleGoogleSignIn();

      setMessage('✅ Redirecionando para Google...');

      // O redirecionamento será feito automaticamente pelo Convex Auth
      // Não precisamos fazer nada aqui, o usuário será redirecionado

    } catch (error: any) {
      console.error('❌ Erro no Google Login:', error);

      const errorMsg = error?.message || 'Erro desconhecido';

      if (errorMsg.includes('AUTH_GOOGLE_ID') || errorMsg.includes('AUTH_GOOGLE_SECRET')) {
        setMessage(`❌ **Google OAuth não configurado**\n\n🔧 **PASSO A PASSO:**\n\n1️⃣ **Google Cloud Console:**\n   • https://console.cloud.google.com → Credentials\n   • Create OAuth 2.0 Client ID → Web Application\n   • Authorized domains: ${window.location.origin}\n   • Redirect URIs: https://expert-eagle-519.convex.site/api/auth/callback/google\n\n2️⃣ **Convex Environment:**\n   • npx convex env set AUTH_GOOGLE_ID seu_client_id\n   • npx convex env set AUTH_GOOGLE_SECRET seu_client_secret\n   • npx convex deploy\n\nError: ${errorMsg}`);
      } else {
        setMessage(`❌ **Google Login falhou**\n\nMensagem: ${errorMsg}\n\nVerifique a configuração do Google OAuth.`);
      }

      setLoading(false);
    }
  };

  // Função para login offline como usuário de teste
  const handleOfflineLogin = (role: 'owner' | 'admin') => {
    setLoading(true);
    setMessage(`🔄 Entrando como ${role} teste...`);

    try {
      // Limpar dados de teste antigos primeiro
      localStorage.removeItem('offline_user');
      localStorage.removeItem('user_data');

      // Criar usuário de teste baseado no role
      const testUser = {
        id: role === 'owner' ? 'owner-test-' + Date.now() : 'admin-test-' + Date.now(),
        email: role === 'owner' ? 'owner@maestros.com' : 'admin@maestros.com',
        name: role === 'owner' ? 'Owner Teste' : 'Admin Teste',
        role: role,
        group_id: `group_${Date.now()}`
      };

      // Salvar no localStorage para auth system
      localStorage.setItem('offline_user', JSON.stringify(testUser));

      console.log(`✅ Usuário de teste ${role} criado:`, testUser);
      setMessage(`✅ Conectado como ${testUser.name}!`);

      // Redirecionar depois de um pequeno delay para mostrar feedback
      setTimeout(() => {
        setMessage('');
        navigate('/home');
      }, 1000);

    } catch (error) {
      console.error('❌ Erro no login offline:', error);
      setMessage(`❌ Erro ao fazer login offline: ${error}`);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  // Função para redirecionar para localhost
  const handleUseLocalhost = () => {
    window.location.href = 'http://localhost:5173';
  };

  // Debug - timeout seguro para evitar crash
  React.useEffect(() => {
    console.log('🔍 Login component mounted');
    return () => console.log('🔍 Login component unmounted');
  }, []);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden flex items-center justify-center p-4">
      {/* Fundo animado */}
      <AnimatedBackground />

      {/* Container principal - Responsivo */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">

        {/* Coluna Esquerda: Login Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full"
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-white/20 dark:border-slate-700/50 shadow-2xl">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Logo e título com gradiente */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center space-y-3"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg transform hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold text-white">M</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400">
                  Maestros FC
                </h1>
                <p className="text-muted-foreground flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Sistema de Gerenciamento Profissional
                </p>
              </motion.div>

              {/* Notificação de acesso via rede local */}
              <NetworkAccessNotice onUseLocalhost={handleUseLocalhost} />

              {/* Mensagem de status */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border rounded-lg p-4"
                >
                  <pre className="text-sm whitespace-pre-wrap">{message}</pre>
                </motion.div>
              )}

              {/* Botões de login */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-y-3"
              >
                {/* Google Login - Destaque */}
                <motion.button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full group relative flex items-center justify-center space-x-3 bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl px-6 py-4 text-gray-900 dark:text-slate-100 hover:border-emerald-500 dark:hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-emerald-500/10 group-hover:via-blue-500/10 group-hover:to-purple-500/10 rounded-xl transition-all duration-300" />
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                  <span className="font-semibold">{loading ? 'Conectando...' : 'Entrar com Google'}</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Divisor */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-card text-muted-foreground">
                      ou modo offline
                    </span>
                  </div>
                </div>

                {/* Login Offline - Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => handleOfflineLogin('owner')}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white rounded-lg px-4 py-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Owner</span>
                  </motion.button>

                  <motion.button
                    onClick={() => handleOfflineLogin('admin')}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-lg px-4 py-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Informações adicionais com ícones */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4"
              >
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>Seguro</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Multi-device</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Tempo real</span>
                </div>
              </motion.div>

              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  <p>Debug: {window.location.hostname}:{window.location.port}</p>
                  <p>User: {user ? `${user.name} (${user.role})` : 'Não logado'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Coluna Direita: Testimonials/Stats (Desktop only) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          className="hidden lg:block space-y-6"
        >
          {/* Hero Text */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 dark:from-emerald-300 dark:to-blue-400">
              Gerencie seu time como um profissional
            </h2>
            <p className="text-lg text-muted-foreground">
              Organização completa de jogadores, partidas, finanças e ranking em um só lugar.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="space-y-3">
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-white/20 dark:border-slate-700/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">120+</p>
                    <p className="text-sm text-muted-foreground">Jogadores ativos</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-white/20 dark:border-slate-700/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">50+</p>
                    <p className="text-sm text-muted-foreground">Partidas organizadas</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-blue-500 ml-auto" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-white/20 dark:border-slate-700/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-sm text-muted-foreground">Sincronização em tempo real</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-purple-500 ml-auto" />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Depoimento */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-white/20 dark:border-slate-700/50">
              <CardContent className="p-6">
                <p className="text-sm italic text-muted-foreground mb-3">
                  "O Maestros FC transformou a forma como organizamos nosso time. Simples, rápido e profissional!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    MC
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Michell Costa</p>
                    <p className="text-xs text-muted-foreground">Owner · Maestros FC</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}