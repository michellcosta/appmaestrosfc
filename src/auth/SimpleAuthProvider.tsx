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
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Inicializando autenticação...');
        
        // Timeout de segurança para evitar carregamento infinito
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('⏰ Timeout - finalizando loading');
            setLoading(false);
          }
        }, 3000);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro na sessão:', error);
          if (mounted) {
            clearTimeout(timeoutId);
            setLoading(false);
          }
          return;
        }
        
        console.log('📊 Sessão encontrada:', session?.user?.id);
        
        if (session?.user && mounted) {
          console.log('🔍 Buscando perfil do usuário...');
          
          // Buscar perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();

          if (profileError) {
            console.log('⚠️ Perfil não encontrado, criando...');
            console.log('Erro:', profileError);
            
            // Se não tem perfil, criar um automaticamente
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                auth_id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
                role: 'owner'
              })
              .select()
              .single();

            if (!createError && newUser && mounted) {
              console.log('✅ Perfil criado:', newUser);
              setUser({
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role
              });
            } else if (createError) {
              console.error('❌ Erro ao criar perfil:', createError);
              // Se não conseguir criar, usar dados da sessão
              if (mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
                  role: 'owner'
                });
              }
            }
          } else if (profile && mounted) {
            console.log('✅ Perfil encontrado:', profile);
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role
            });
          }
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar auth:', error);
      } finally {
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    // Aguardar um pouco para garantir que o DOM está pronto
    const initTimeout = setTimeout(() => {
      initializeAuth();
    }, 100);

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event);
        
        if (!mounted) return;

        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ Usuário logado:', session.user.email);
            
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
            console.log('🚪 Usuário deslogado');
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Erro no auth state change:', error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
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