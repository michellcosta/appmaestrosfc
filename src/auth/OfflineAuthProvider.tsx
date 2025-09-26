import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeOwnerProtection } from '@/utils/ownerProtection';

type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: 'owner'|'admin'|'aux'|'mensalista'|'diarista';
  avatar_url?: string | null;
  custom_avatar?: string | null;
  group_id?: string | null;
};

type AuthCtx = {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInOffline: (email: string, password: string) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  signInOffline: async () => {},
  updateAvatar: async () => {},
});

export const useAuth = () => useContext(Ctx);

export function OfflineAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Verificar se há usuário salvo no localStorage
        const offlineUser = localStorage.getItem('offline_user');
        if (offlineUser && mounted) {
          try {
            const userData = JSON.parse(offlineUser);
            
            // Adicionar group_id se não existir (para usuários antigos)
            if (!userData.group_id) {
              userData.group_id = `group_${userData.id.slice(-8)}`;
              localStorage.setItem('offline_user', JSON.stringify(userData));
              console.log('🔧 Adicionado group_id ao usuário existente:', userData.group_id);
            }
            
            setUser(userData);
            
            // Inicializar proteções do owner principal
            initializeOwnerProtection(userData);
          } catch (error) {
            console.error('❌ Erro ao carregar usuário offline:', error);
          }
        } else if (mounted) {
          // Criar usuário padrão para teste se não houver nenhum
          const defaultUser: AppUser = {
            id: 'test-user-owner',
            email: 'owner@maestros.com',
            name: 'Owner Teste',
            role: 'owner',
            group_id: 'group_test123'
          };
          
          localStorage.setItem('offline_user', JSON.stringify(defaultUser));
          setUser(defaultUser);
          console.log('✅ Usuário padrão criado para teste:', defaultUser);
        }

        // Verificar sessão do Supabase para Google OAuth
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const googleUser: AppUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            role: 'owner',
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            custom_avatar: null,
            group_id: `group_${session.user.id.slice(-8)}`
          };
          
          localStorage.setItem('offline_user', JSON.stringify(googleUser));
          setUser(googleUser);
          
          // Inicializar proteções do owner principal
          initializeOwnerProtection(googleUser);
          
          console.log('✅ Usuário Google carregado:', googleUser);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de autenticação do Google
    const setupAuthListener = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            if (event === 'SIGNED_IN' && session?.user) {
              const googleUser: AppUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                role: 'owner',
                avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                custom_avatar: null
              };
              
              localStorage.setItem('offline_user', JSON.stringify(googleUser));
              setUser(googleUser);
              
              // Inicializar proteções do owner principal
              initializeOwnerProtection(googleUser);
              
              console.log('✅ Login Google realizado:', googleUser);
            } else if (event === 'SIGNED_OUT') {
              localStorage.removeItem('offline_user');
              setUser(null);
              console.log('✅ Logout Google realizado');
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ Erro ao configurar listener:', error);
      }
    };

    const cleanupListener = setupAuthListener();

    return () => {
      mounted = false;
      cleanupListener?.then(cleanup => cleanup?.());
    };
  }, []);

  const signInOffline = async (email: string, password: string) => {
    try {
      console.log('🔍 Fazendo login offline...');
      
      const userId = 'offline-' + Date.now();
      const userData = {
        id: userId,
        email: email,
        name: email.split('@')[0],
        role: 'owner' as const,
        group_id: `group_${userId.slice(-8)}`
      };

      // Salvar no localStorage
      localStorage.setItem('offline_user', JSON.stringify(userData));
      
      // Definir usuário
      setUser(userData);
      
      console.log('✅ Login offline realizado:', userData);
    } catch (error) {
      console.error('❌ Erro no login offline:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔍 Iniciando Google OAuth...');
      
      // Importar supabase dinamicamente
      const { supabase } = await import('@/lib/supabase');
      
      // Detectar se estamos em desenvolvimento ou produção
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Usar a porta atual da aplicação (Vite porta 8080 no config ou 5173 default)
      const currentPort = window.location.port || (isLocalhost ? '8080' : null);
      const redirectUrl = isLocalhost 
        ? `http://localhost:${currentPort || '8080'}/`
        : `${window.location.origin}/`;
      
      
      console.log('🌐 Redirect URL será:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        console.error('❌ Erro no Google OAuth:', error);
        throw error;
      }

      console.log('✅ Google OAuth iniciado:', data);
    } catch (error) {
      console.error('❌ Erro no Google OAuth:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🔍 Realizando logout...');
      
      // Importar supabase dinamicamente para realizar logout completo
      try {
        const { supabase } = await import('@/lib/supabase');
        await supabase.auth.signOut();
        console.log('✅ Supabase auth logout realizado');
      } catch (supabaseError) {
        console.log('⚠️ Supabase logout falhou (continuando com logout local)');
      }
      
      // Limpar dados locais
      localStorage.removeItem('offline_user');
      setUser(null);
      
      console.log('✅ Logout completo realizado');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const offlineUser = localStorage.getItem('offline_user');
      if (offlineUser) {
        const userData = JSON.parse(offlineUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    try {
      if (user) {
        const updatedUser = { ...user, custom_avatar: avatarUrl };
        localStorage.setItem('offline_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        console.log('✅ Avatar atualizado:', avatarUrl);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar avatar:', error);
      throw error;
    }
  };

  return (
    <Ctx.Provider value={{ user, loading, signInWithGoogle, signOut, refreshProfile, signInOffline, updateAvatar }}>
      {children}
    </Ctx.Provider>
  );
}
