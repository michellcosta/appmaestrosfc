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
          } catch (error) {
            console.error('❌ Erro ao carregar usuário offline:', error);
          }
        } else if (mounted) {
          // Não criar usuário padrão automaticamente - apenas quando fizer login explícito
          // Se não há usuário offline, redirecionar para página de login
          setUser(null);
        }

        // Google OAuth removido - usando apenas autenticação offline
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
        // Auth listener removido - usando apenas autenticação offline
      } catch (error) {
        console.error('❌ Erro ao configurar listener:', error);
      }
    };

    setupAuthListener();

    return () => {
      mounted = false;
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
    // Google OAuth removido - usar apenas autenticação offline
    alert('Google OAuth foi removido. Use a autenticação offline.');
  };

  const signOut = async () => {
    try {
      // Logout offline - remover dados do localStorage

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
