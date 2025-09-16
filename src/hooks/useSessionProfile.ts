import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type Profile = {
  id: string;
  email: string;
  role: 'owner'|'admin'|'aux'|'player';
  membership: 'mensalista'|'diarista'|null;
  notifications_enabled?: boolean;
};

export function useSessionProfile() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        setSession(session);

        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id,email,role,membership,notifications_enabled')
            .eq('id', session.user.id)
            .single();
          if (error) setError(error.message);
          setProfile((data as any) ?? null);
        } else {
          setProfile(null);
        }
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || 'Erro ao carregar sessão');
        setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // recarrega perfil quando logar/deslogar
      if (!s?.user) setProfile(null);
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  return { loading, session, profile, error };
}
