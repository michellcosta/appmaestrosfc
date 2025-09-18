import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AppUser|null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    // Tenta ler perfil na tabela users (pode ajustar conforme seu schema)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('auth_id', uid)
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      setUser({
        id: data.id,
        email: (data as any).email ?? null,
        name: (data as any).name ?? null,
        role: (data as any).role,
      });
    } else {
      // perfil ainda não criado; exponha só o auth user id
      setUser({ id: uid, email: null, name: null, role: undefined });
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (session?.user?.id) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      if (session?.user?.id) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });
    return () => { sub.subscription.unsubscribe(); isMounted = false; };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) await fetchProfile(session.user.id);
  };

  const value = useMemo(() => ({ user, loading, signInWithGoogle, signOut, refreshProfile }), [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
