import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { useTeamDraw } from '@/hooks/useTeamDraw';
import { useGamesStore } from '@/store/gamesStore';
import { useMatchParticipantsStore } from '@/store/matchParticipantsStore';
import { usePlayersStore } from '@/store/playersStore';
import { useDonationStore } from '@/store/donationStore';

export function useOptimizedHome() {
  const { user } = useAuth();
  const { canRequestToPlay, canDrawTeams } = usePermissions();
  const { drawTeams: executeTeamDraw, hasTeamDraw, isTeamDrawComplete, getPlayersByTeam } = useTeamDraw();
  
  // Stores
  const { matches, getUpcomingMatches } = useGamesStore();
  const { config } = useDonationStore();
  const { players, loading: playersLoading } = usePlayersStore();
  
  const {
    confirmParticipation,
    cancelParticipation,
    requestToPlay,
    cancelRequest,
    hasUserConfirmed,
    hasUserRequested,
    canUserConfirm,
    getUserParticipation,
    getUserRequest,
    getConfirmedParticipants,
    loading: participantsLoading
  } = useMatchParticipantsStore();

  // Estados otimizados
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [teamDrawCompleted, setTeamDrawCompleted] = useState<{[matchId: string]: boolean}>({});
  const [isBlinking, setIsBlinking] = useState<{[matchId: string]: boolean}>({});
  const [showTeamDrawModal, setShowTeamDrawModal] = useState(false);
  const [currentDrawMatchId, setCurrentDrawMatchId] = useState<string>('');
  const [playersPerTeam, setPlayersPerTeam] = useState<5 | 6>(5);

  // Estados para modais
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState(2);
  const [customDonationAmount, setCustomDonationAmount] = useState('');
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [generatedPix, setGeneratedPix] = useState('');
  const [pixStatus, setPixStatus] = useState<'pending' | 'generated' | 'copied'>('pending');
  const [pixAmount, setPixAmount] = useState(0);

  // Callbacks otimizados
  const handleConfirmParticipation = useCallback((matchId: string) => {
    confirmParticipation(matchId);
  }, [confirmParticipation]);

  const handleCancelParticipation = useCallback((matchId: string) => {
    cancelParticipation(matchId);
  }, [cancelParticipation]);

  const handleRequestToPlay = useCallback((matchId: string) => {
    requestToPlay(matchId);
  }, [requestToPlay]);

  const handleCancelRequest = useCallback((matchId: string) => {
    cancelRequest(matchId);
  }, [cancelRequest]);

  const handleDrawTeams = useCallback((matchId: string) => {
    setCurrentDrawMatchId(matchId);
    setShowTeamDrawModal(true);
  }, []);

  // Valores memoizados
  const welcomeTitle = useMemo(() => {
    return user?.name ? `Bem vindo ${user.name}!` : "Bem vindo!";
  }, [user?.name]);

  const upcomingMatches = useMemo(() => {
    return getUpcomingMatches();
  }, [getUpcomingMatches, matches]);

  const statsData = useMemo(() => {
    return {
      totalMatches: matches.length,
      totalPlayers: players.length,
      totalRevenue: matches.reduce((sum, match) => sum + (match.price * match.participants), 0),
      participationRate: matches.length > 0 ? (matches.reduce((sum, match) => sum + match.participants, 0) / (matches.length * 22)) * 100 : 0
    };
  }, [matches, players]);

  // Efeitos - REMOVIDO carregamento automático de dados de exemplo
  // useEffect(() => {
  //   loadExampleData();
  //   loadPlayersExampleData();
  // }, [loadExampleData, loadPlayersExampleData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return {
    // Estados
    user,
    isLoading,
    isSyncing,
    teamDrawCompleted,
    isBlinking,
    showTeamDrawModal,
    currentDrawMatchId,
    playersPerTeam,
    isDonationModalOpen,
    selectedDonationAmount,
    customDonationAmount,
    showPixModal,
    pixKey,
    generatedPix,
    pixStatus,
    pixAmount,
    
    // Dados
    welcomeTitle,
    upcomingMatches,
    statsData,
    players,
    playersLoading,
    participantsLoading,
    config,
    
    // Permissões
    canRequestToPlay,
    canDrawTeams,
    
    // Funções
    handleConfirmParticipation,
    handleCancelParticipation,
    handleRequestToPlay,
    handleCancelRequest,
    handleDrawTeams,
    hasUserConfirmed,
    hasUserRequested,
    canUserConfirm,
    getConfirmedParticipants,
    getPlayersByTeam,
    executeTeamDraw,
    hasTeamDraw,
    isTeamDrawComplete,
    
    // Setters
    setTeamDrawCompleted,
    setIsBlinking,
    setShowTeamDrawModal,
    setCurrentDrawMatchId,
    setPlayersPerTeam,
    setIsDonationModalOpen,
    setSelectedDonationAmount,
    setCustomDonationAmount,
    setShowPixModal,
    setPixKey,
    setGeneratedPix,
    setPixStatus,
    setPixAmount,
    setIsSyncing
  };
}
