import { useAuth } from '@/auth/OfflineAuthProvider';

export function usePermissions() {
  const { user } = useAuth();

  const canAccess = (page: string) => {
    if (!user) return false;

    const role = user.role;

    // Owner, Admin, Aux - acesso completo
    if (['owner', 'admin', 'aux'].includes(role || '')) {
      return true;
    }

    // Mensalista - acesso completo
    if (role === 'mensalista') {
      return true;
    }

    // Diarista - acesso limitado
    if (role === 'diarista') {
      const allowedPages = ['/', '/finance', '/perfil'];
      return allowedPages.includes(page);
    }

    return false;
  };

  const canSeeRanking = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner', 'admin', 'aux', 'mensalista'].includes(role || '');
  };

  const canSeeVote = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner', 'admin', 'aux', 'mensalista'].includes(role || '');
  };

  const canSeeDashboard = () => {
    if (!user) return false;
    const role = user.role;
    return role === 'owner';
  };

  const canCreateInvites = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner', 'admin', 'aux'].includes(role || '');
  };

  const canApproveUsers = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner', 'admin', 'aux'].includes(role || '');
  };

  const canRequestToPlay = () => {
    if (!user) return false;
    const role = user.role;
    return role === 'diarista';
  };

  const canPayDaily = () => {
    if (!user) return false;
    const role = user.role;
    return role === 'diarista';
  };

  const canCountGoals = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner', 'admin', 'aux', 'mensalista', 'diarista'].includes(role || '');
  };

  const canSeeMedals = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner', 'admin', 'aux', 'mensalista'].includes(role || '');
  };

  const canCreateGames = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner'].includes(role || '');
  };

  const canControlMatch = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner', 'admin', 'aux'].includes(role || '');
  };

  const canDrawTeams = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner', 'admin', 'aux'].includes(role || '');
  };

  const canSeeGames = () => {
    if (!user) return false;
    const role = user.role;
    return ['owner', 'admin', 'aux', 'mensalista', 'diarista'].includes(role || '');
  };

  return {
    canAccess,
    canSeeRanking,
    canSeeVote,
    canSeeDashboard,
    canCreateInvites,
    canApproveUsers,
    canRequestToPlay,
    canPayDaily,
    canCountGoals,
    canSeeMedals,
    canCreateGames,
    canControlMatch,
    canDrawTeams,
    canSeeGames,
    userRole: user?.role
  };
}
