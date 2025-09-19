import React, { createContext, useContext, useEffect, useState } from 'react';

type AppUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: 'owner'|'admin'|'aux'|'mensalista'|'diarista';
};

type AuthCtx = {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInOffline: (email: string, password: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  signInOffline: async () => {},
});

export const useAuth = () => useContext(Ctx);

export function OfflineAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário offline salvo
    const checkOfflineUser = () => {
      try {
        const offlineUser = localStorage.getItem('offline_user');
        if (offlineUser) {
          const userData = JSON.parse(offlineUser);
          console.log('✅ Usuário offline encontrado:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar usuário offline:', error);
      } finally {
        setLoading(false);
      }
    };

    // Aguardar um pouco para garantir que o DOM está pronto
    const timeout = setTimeout(() => {
      checkOfflineUser();
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const signInOffline = async (email: string, password: string) => {
    try {
      console.log('🔍 Fazendo login offline...');
      
      const userData = {
        id: 'offline-' + Date.now(),
        email: email,
        name: email.split('@')[0],
        role: 'owner' as const
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
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
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
      localStorage.removeItem('offline_user');
      setUser(null);
      console.log('✅ Logout realizado');
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

  return (
    <Ctx.Provider value={{ user, loading, signInWithGoogle, signOut, refreshProfile, signInOffline }}>
      {children}
    </Ctx.Provider>
  );
}
