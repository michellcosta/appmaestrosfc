import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionProfile } from '@/hooks/useSessionProfile';

interface DiaristRedirectProps {
  children: React.ReactNode;
}

export default function DiaristRedirect({ children }: DiaristRedirectProps) {
  const { profile, loading } = useSessionProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Se não há perfil, deixa o fluxo normal
    if (!profile) return;

    // Se é diarista, verifica aprovação
    if (profile.membership === 'diarista') {
      if (profile.approved === false) {
        // Diarista não aprovado - redireciona para tela de aguardo
        navigate('/diarist-pending', { replace: true });
        return;
      } else if (profile.approved === true) {
        // Diarista aprovado - verifica se está na home padrão e redireciona para home do diarista
        if (window.location.pathname === '/') {
          navigate('/diarist-home', { replace: true });
          return;
        }
      }
    }
  }, [profile, loading, navigate]);

  // Enquanto carrega, mostra o conteúdo normal
  if (loading) {
    return <>{children}</>;
  }

  // Se é diarista não aprovado, não renderiza o conteúdo (será redirecionado)
  if (profile?.membership === 'diarista' && profile.approved === false) {
    return null;
  }

  // Para todos os outros casos, renderiza o conteúdo normal
  return <>{children}</>;
}