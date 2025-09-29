import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Timeout de segurança para mobile
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setLoading(false);
          }
        }, 5000);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro na sessão:', error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        if (session?.user && isMounted) {
          // Buscar perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();

          if (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
            // Se não tem perfil, criar um automaticamente como DIARISTA
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                auth_id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
                role: 'diarista'
              })
              .select()
              .single();

            if (!createError && newUser && isMounted) {
              setUser({
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
              });
            }
          } else if (profile && isMounted) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role
            });
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    // Aguardar um pouco para garantir que o DOM está pronto no mobile
    const initTimeout = setTimeout(() => {
      initializeAuth();
    }, 100);

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('auth_id', session.user.id)
              .single();

            if (profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                name: profile.name,
                role: profile.role
              });
            } else {
              // Criar perfil se não existir
              const { data: newUser } = await supabase
                .from('users')
                .insert({
                  auth_id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
                  role: 'owner'
                })
                .select()
                .single();

              if (newUser) {
                setUser({
                  id: newUser.id,
                  email: newUser.email,
                  name: newUser.name,
                  role: newUser.role
                });
              }
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        } catch (error) {
          console.error('Erro no auth state change:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('🔍 Iniciando login com Google...');
      console.log('📍 URL atual:', window.location.origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('❌ Erro no OAuth:', error);
        throw error;
      }
      
      console.log('✅ Redirecionamento iniciado:', data);
    } catch (error) {
      console.error('❌ Erro no login Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  return (
    <Ctx.Provider value={{ user, loading, signInWithGoogle, signOut, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}
