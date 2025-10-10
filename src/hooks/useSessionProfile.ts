import { useEffect, useState } from 'react';

export type Profile = {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'aux' | 'player';
  membership: 'mensalista' | 'diarista' | null;
  notifications_enabled?: boolean;
  approved?: boolean;
};

export function useSessionProfile() {
  const [loading, setLoading] = useState(false); // Sempre false para dados offline
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carregar dados do usuário offline
    const offlineUser = localStorage.getItem('offline_user');
    if (offlineUser) {
      try {
        const userData = JSON.parse(offlineUser);
        setProfile({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          membership: userData.membership || null,
          notifications_enabled: userData.notifications_enabled || true,
          approved: userData.approved || true
        });
        setSession({ user: userData });
      } catch (error) {
        console.error('Erro ao carregar usuário offline:', error);
        setError('Erro ao carregar perfil');
      }
    } else {
      setProfile(null);
      setSession(null);
    }
  }, []);

  return { loading, session, profile, error };
}
