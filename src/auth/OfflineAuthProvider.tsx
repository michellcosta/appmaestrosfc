import { initializeOwnerProtection } from '@/utils/ownerProtection';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: 'owner' | 'admin' | 'aux' | 'mensalista' | 'diarista';
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
  signInWithGoogle: async () => { },
  signOut: async () => { },
  refreshProfile: async () => { },
  signInOffline: async () => { },
  updateAvatar: async () => { },
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
            }

            setUser(userData);

            // Inicializar proteções do owner principal
            initializeOwnerProtection(userData);
          } catch (error) {
            console.error('❌ Erro ao carregar usuário offline:', error);
          }
        } else if (mounted) {
          // Não criar usuário padrão automaticamente - apenas quando fizer login explícito
          // Se não há usuário offline, redirecionar para página de login
          setUser(null);
        }

        // Verificar sessão do Supabase para Google OAuth
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          console.log('🔍 Sessão Google encontrada:', {
            email: session.user.email,
            userId: session.user.id
          });
          // Extrair foto do perfil do Google com múltiplas tentativas
          let googleAvatarUrl = null;
          const userMetadata = session.user.user_metadata;

          // Tentar múltiplas fontes para a foto do Google com debug detalhado
          const possibleAvatarSources = [
            userMetadata?.avatar_url,
            userMetadata?.picture,
            userMetadata?.photoURL,
            session.user.identities?.find(id => id.provider === 'google')?.user_metadata?.avatar_url,
            session.user.identities?.find(id => id.provider === 'google')?.user_metadata?.picture
          ];

          for (const [index, avatarSource] of possibleAvatarSources.entries()) {
            if (avatarSource) {
              googleAvatarUrl = avatarSource;
              break;
            }
          }

          if (!googleAvatarUrl) {
          }

          // Verificar se é o owner principal na inicialização
          const isMainOwner = session.user.email === 'michellcosta1269@gmail.com';

          const googleUser: AppUser = {
            id: session.user.id,
            email: session.user.email,
            name: userMetadata?.full_name || userMetadata?.name || session.user.email?.split('@')[0],
            role: isMainOwner ? 'owner' : 'diarista',
            avatar_url: googleAvatarUrl,
            custom_avatar: null,
            group_id: `group_${session.user.id.slice(-8)}`
          };

          console.log('🔍 Google User inicializado:', {
            email: googleUser.email,
            role: googleUser.role,
            isMainOwner: isMainOwner
          });

          localStorage.setItem('offline_user', JSON.stringify(googleUser));

          // Salvar no histórico de usuários (para a lista de usuários)
          console.log('💾 Salvando usuário no histórico:', googleUser.email);
          const existingUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
          console.log('📋 Usuários existentes no histórico:', existingUsers.length);

          const userExists = existingUsers.some((u: any) => u.id === googleUser.id);
          console.log('🔍 Usuário já existe no histórico?', userExists);

          if (!userExists) {
            existingUsers.push({
              ...googleUser,
              loginDate: new Date().toISOString(),
              lastSeen: new Date().toISOString()
            });
          } else {
            // Atualizar último acesso
            const userIndex = existingUsers.findIndex((u: any) => u.id === googleUser.id);
            if (userIndex !== -1) {
              existingUsers[userIndex].lastSeen = new Date().toISOString();
              existingUsers[userIndex].role = googleUser.role; // Atualizar role se mudou
            }
          }

          localStorage.setItem('all_users', JSON.stringify(existingUsers));
          setUser(googleUser);

          // Inicializar proteções do owner principal
          initializeOwnerProtection(googleUser);

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
              // Extrair foto do perfil do Google com múltiplas tentativas (versão do listener)
              let googleAvatarUrl = null;
              const userMetadata = session.user.user_metadata;

              // Tentar múltiplas fontes para a foto do Google (listener version)
              console.log('User metadata debug:', {
                userMetadata: userMetadata,
                available_fields: Object.keys(userMetadata || {}),
                user_identities: session.user.identities
              });

              const possibleAvatarSources = [
                userMetadata?.avatar_url,
                userMetadata?.picture,
                userMetadata?.photoURL,
                session.user.identities?.find(id => id.provider === 'google')?.user_metadata?.avatar_url,
                session.user.identities?.find(id => id.provider === 'google')?.user_metadata?.picture
              ];

              for (const [index, avatarSource] of possibleAvatarSources.entries()) {
                if (avatarSource) {
                  googleAvatarUrl = avatarSource;
                  console.log(`Avatar encontrado na fonte ${index + 1}:`, avatarSource);
                  break;
                }
              }

              if (!googleAvatarUrl) {
                console.log('Nenhuma foto de avatar encontrada do Google');
              }

              // Verificar se é o owner principal
              const isMainOwner = session.user.email === 'michellcosta1269@gmail.com';

              const googleUser: AppUser = {
                id: session.user.id,
                email: session.user.email,
                name: userMetadata?.full_name || userMetadata?.name || session.user.email?.split('@')[0],
                role: isMainOwner ? 'owner' : 'diarista',
                avatar_url: googleAvatarUrl,
                custom_avatar: null,
                group_id: `group_${session.user.id.slice(-8)}`
              };

              console.log('🔍 Google User criado:', {
                email: googleUser.email,
                role: googleUser.role,
                isMainOwner: isMainOwner
              });

              localStorage.setItem('offline_user', JSON.stringify(googleUser));

              // Salvar no histórico de usuários (para a lista de usuários)
              const existingUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
              const userExists = existingUsers.some((u: any) => u.id === googleUser.id);

              if (!userExists) {
                existingUsers.push({
                  ...googleUser,
                  loginDate: new Date().toISOString(),
                  lastSeen: new Date().toISOString()
                });
              } else {
                // Atualizar último acesso
                const userIndex = existingUsers.findIndex((u: any) => u.id === googleUser.id);
                if (userIndex !== -1) {
                  existingUsers[userIndex].lastSeen = new Date().toISOString();
                  existingUsers[userIndex].role = googleUser.role; // Atualizar role se mudou
                }
              }

              localStorage.setItem('all_users', JSON.stringify(existingUsers));
              setUser(googleUser);

              // Inicializar proteções do owner principal
              initializeOwnerProtection(googleUser);

            } else if (event === 'SIGNED_OUT') {
              localStorage.removeItem('offline_user');
              setUser(null);
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

    } catch (error) {
      console.error('❌ Erro no login offline:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Importar supabase dinamicamente
      const { supabase } = await import('@/lib/supabase');

      // Detectar se estamos em desenvolvimento ou produção
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // Usar a porta atual da aplicação (Vite porta 8080 no config ou 5173 default)
      const currentPort = window.location.port || (isLocalhost ? '8080' : null);
      const redirectUrl = isLocalhost
        ? `http://localhost:${currentPort || '8080'}/`
        : `${window.location.origin}/`;


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

    } catch (error) {
      console.error('❌ Erro no Google OAuth:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Importar supabase dinamicamente para realizar logout completo
      try {
        const { supabase } = await import('@/lib/supabase');
        await supabase.auth.signOut();
      } catch (supabaseError) {
        console.error('Erro ao fazer logout do Supabase:', supabaseError);
      }

      // Limpar dados locais - mais fileira gatilo
      localStorage.removeItem('offline_user');
      localStorage.removeItem('user_data');
      localStorage.removeItem('player_data');
      // Limpar qualquer session data
      sessionStorage.clear();
      setUser(null);

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
