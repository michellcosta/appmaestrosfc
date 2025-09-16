import { useMemo } from 'react';
import { Profile } from './useSessionProfile';

type MenuItem = { label: string; href: string; };

export function useMenuByRole(profile: Profile | null) {
  return useMemo<MenuItem[]>(() => {
    if (!profile) return [{ label: 'Perfil', href: '/perfil' }];

    const baseMensalista: MenuItem[] = [
      { label: 'Jogos', href: '/' },
      { label: 'Partida', href: '/match' },
      { label: 'Financeiro', href: '/finance' },
      { label: 'Ranking', href: '/ranking' },
      { label: 'Perfil', href: '/perfil' },
    ];

    const diaristaPendente: MenuItem[] = [
      { label: 'Jogos', href: '/' },
      { label: 'Perfil', href: '/perfil' },
    ];

    // Aqui você pode checar aprovação do diarista (ex.: profile.approved == true)
    const diaristaAprovado: MenuItem[] = [
      { label: 'Jogos', href: '/' },
      { label: 'Financeiro', href: '/finance' },
      { label: 'Perfil', href: '/perfil' },
    ];

    let userMenu: MenuItem[] = [];
    if (profile.membership === 'mensalista') userMenu = baseMensalista;
    else if (profile.membership === 'diarista') userMenu = diaristaPendente; // troque para diaristaAprovado quando tiver flag de aprovação

    if (profile.role === 'admin' || profile.role === 'aux') {
      userMenu = [
        ...userMenu,
        { label: 'Convites & Aprovações', href: '/admin/invites' },
      ];
    }
    if (profile.role === 'owner') {
      userMenu = [
        ...userMenu,
        { label: 'Convites & Aprovações', href: '/admin/invites' },
        { label: 'Dashboard', href: '/admin' },
      ];
    }

    // fallback se membership nula
    if (userMenu.length === 0) userMenu = [{ label: 'Jogos', href: '/' }, { label: 'Perfil', href: '/perfil' }];

    return userMenu;
  }, [profile]);
}
