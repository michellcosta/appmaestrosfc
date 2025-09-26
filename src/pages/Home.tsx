import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Users, CheckCircle, Navigation, RefreshCw, Heart, Coffee, UserPlus, Clock as ClockIcon, Settings, Play } from 'lucide-react';
import { LoadingCard, LoadingStats } from '@/components/ui/loading-card';
import { EmptyGames } from '@/components/ui/empty-state';
import { useToastHelpers } from '@/components/ui/toast';
import { useGamesStore } from '@/store/gamesStore';
import { useMatchParticipantsStore } from '@/store/matchParticipantsStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useDonationStore } from '@/store/donationStore';
import { usePlayersStore } from '@/store/playersStore';
import { SyncService } from '@/services/syncService';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { useTeamDraw } from '@/hooks/useTeamDraw';
import { RouteButton } from '@/components/RouteButton';
import PageLayout from '@/components/layout/PageLayout';
import WeatherForecast from '@/components/WeatherForecast';

export default function HomePage() {
  const navigate = useNavigate();
  const { matches, getUpcomingMatches } = useGamesStore();
  const { config } = useDonationStore();
  
  // Store de jogadores
  const { 
    players, 
    loading: playersLoading,
    error: playersError,
    loadExampleData: loadPlayersExampleData
  } = usePlayersStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { success, error } = useToastHelpers();
  const { user } = useAuth();
  const { canRequestToPlay, canDrawTeams } = usePermissions();
  const { drawTeams: executeTeamDraw, hasTeamDraw, isTeamDrawComplete, getPlayersByTeam } = useTeamDraw();
  
  // Estado para controlar se o sorteio foi realizado
  const [teamDrawCompleted, setTeamDrawCompleted] = useState<{[matchId: string]: boolean}>({});
  
  // Estado para controlar o efeito de piscar do botão
  const [isBlinking, setIsBlinking] = useState<{[matchId: string]: boolean}>({});
  
  // Estado para controlar o modal de sorteio de times
  const [showTeamDrawModal, setShowTeamDrawModal] = useState(false);
  const [currentDrawMatchId, setCurrentDrawMatchId] = useState<string>('');
  const [playersPerTeam, setPlayersPerTeam] = useState<5 | 6>(5);
  
  // Store de participantes
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
    loadExampleData,
    loading: participantsLoading
  } = useMatchParticipantsStore();

  // Função para gerar o título personalizado
  const getWelcomeTitle = () => {
    if (user?.name) {
      return `Bem vindo ${user.name}!`;
    }
    return "Bem vindo!";
  };

  // Estados para o modal de doações
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState(2);
  const [customDonationAmount, setCustomDonationAmount] = useState('');

  // Carregar dados de exemplo para testes
  useEffect(() => {
    loadExampleData();
    loadPlayersExampleData();
  }, [loadExampleData, loadPlayersExampleData]);

  // Função para alternar role do usuário (apenas para testes)
  const changeUserRole = (newRole: 'owner' | 'admin' | 'aux' | 'mensalista' | 'diarista') => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('offline_user', JSON.stringify(updatedUser));
      window.location.reload();
    }
  };

  // Função para sincronizar dados entre dispositivos
  const handleSyncData = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      // Preservar dados de autenticação
      const offlineUser = localStorage.getItem('offline_user');
      
      // Sincronizar com servidor usando dados atuais
      const syncedMatches = await SyncService.syncWithServer(matches, user?.id);
      
      if (syncedMatches) {
        // Limpar localStorage preservando autenticação
        localStorage.clear();
        
        // Restaurar dados de autenticação
        if (offlineUser) {
          localStorage.setItem('offline_user', offlineUser);
        }
        
        // Salvar dados sincronizados no localStorage
        localStorage.setItem('maestrosfc_games', JSON.stringify({
          state: { matches: syncedMatches },
          version: 0
        }));
        
        success('Dados sincronizados entre dispositivos!');
        
        // Recarregar para aplicar mudanças
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        error('Erro ao sincronizar com servidor');
      }
    } catch (err) {
      console.error('Erro na sincronização:', err);
      error('Erro ao sincronizar dados');
    } finally {
      setIsSyncing(false);
    }
  };

  // Função para formatar data em português
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${day} de ${month}`;
  };

  // Função para formatar hora
  const formatTime = (timeString: string) => {
    return `${timeString}h`;
  };

  // Funções para o modal de doações
  const openDonationModal = () => {
    setIsDonationModalOpen(true);
  };

  const closeDonationModal = () => {
    setIsDonationModalOpen(false);
    setSelectedDonationAmount(2);
    setCustomDonationAmount('');
  };

  const handleDonationAmountSelect = (amount: number) => {
    setSelectedDonationAmount(amount);
    setCustomDonationAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomDonationAmount(value);
    if (value) {
      setSelectedDonationAmount(0);
    }
  };

  const handleDonationSubmit = () => {
    const finalAmount = customDonationAmount ? parseFloat(customDonationAmount) : selectedDonationAmount;
    success(`Obrigado pela contribuição de R$ ${finalAmount.toFixed(2)}! 💚`);
    closeDonationModal();
  };

  // Funções para participação em partidas
  const handleConfirmParticipation = async (matchId: string) => {
    if (!user) {
      error('Usuário não encontrado');
      return;
    }

    try {
      if (user.role === 'mensalista' || user.role === 'owner' || user.role === 'admin' || user.role === 'aux') {
        // Mensalistas, owners, admins e auxiliares sempre podem confirmar
        if (hasUserConfirmed(matchId, user.id)) {
          await cancelParticipation(matchId, user.id);
        } else {
          await confirmParticipation(matchId, user);
        }
      } else if (user.role === 'diarista') {
        // Diaristas fazem solicitação
        if (hasUserRequested(matchId, user.id)) {
          await cancelRequest(matchId, user.id);
        } else {
          await requestToPlay(matchId, user);
        }
      }
    } catch (err) {
      error('Erro ao processar solicitação');
    }
  };

  // Função para abrir modal de sorteio de times
  const handleTeamDraw = (matchId: string) => {
    if (!user) {
      error('Usuário não encontrado');
      return;
    }

    setCurrentDrawMatchId(matchId);
    setShowTeamDrawModal(true);
  };

  // Função para executar o sorteio dentro do modal
  const performTeamDraw = async () => {
    if (!currentDrawMatchId) return;

    // Inicia o efeito de piscar
    setIsBlinking(prev => ({ ...prev, [currentDrawMatchId]: true }));

    try {
      // Simular delay para melhor experiência visual
      await new Promise(resolve => setTimeout(resolve, 1500));
      await executeTeamDraw(currentDrawMatchId, playersPerTeam);
      setTeamDrawCompleted(prev => ({ ...prev, [currentDrawMatchId]: true }));
      
      // Para o efeito de piscar após completar
      setIsBlinking(prev => ({ ...prev, [currentDrawMatchId]: false }));
    } catch (err: any) {
      error(err.message || 'Erro ao sortear times');
      // Para o efeito de piscar em caso de erro
      setIsBlinking(prev => ({ ...prev, [currentDrawMatchId]: false }));
    }
  };

  // Função para obter o texto e estado do botão
  const getButtonState = (matchId: string) => {
    if (!user) {
      return { text: 'Entrar', variant: 'outline' as const, disabled: true };
    }

    const currentMatch = upcomingMatches.find(m => m.id.toString() === matchId);
    if (!currentMatch) {
      return { text: 'Partida não encontrada', variant: 'outline' as const, disabled: true };
    }

    const confirmedCount = getConfirmedParticipants(matchId).length;
    const isMatchFull = confirmedCount >= currentMatch.maxPlayers;
    const userConfirmed = hasUserConfirmed(matchId, user.id);
    const userRequested = hasUserRequested(matchId, user.id);

    if (user.role === 'mensalista' || user.role === 'owner' || user.role === 'admin' || user.role === 'aux') {
      if (userConfirmed) {
        return { text: 'Confirmado ✓', variant: 'success' as const, disabled: false };
      } else {
        return { text: 'Confirmar Presença', variant: 'outline' as const, disabled: false };
      }
    } else if (user.role === 'diarista') {
      if (userRequested) {
        return { text: 'Lista de Espera', variant: 'secondary' as const, disabled: false };
      } else if (isMatchFull) {
        return { text: 'Partida Cheia', variant: 'outline' as const, disabled: true };
      } else {
        return { text: 'Pedir para Jogar', variant: 'outline' as const, disabled: false };
      }
    }

    return { text: 'Não autorizado', variant: 'outline' as const, disabled: true };
  };

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PageLayout title={getWelcomeTitle()} subtitle="Próximas partidas • Previsão do tempo">
        <div className="space-y-4 pb-20">
          <LoadingStats />
          <LoadingCard />
        </div>
      </PageLayout>
    );
  }

  const upcomingMatches = getUpcomingMatches();

  if (upcomingMatches.length === 0) {
    return (
      <PageLayout title={getWelcomeTitle()} subtitle="Próximas partidas • Previsão do tempo">
        <div className="space-y-4 pb-20">
          <EmptyGames />
        </div>
      </PageLayout>
    );
  }

  const currentMatch = upcomingMatches[0];

  return (
    <PageLayout title={getWelcomeTitle()} subtitle="Próximas partidas • Previsão do tempo">
      <div className="space-y-4 pb-20">
        {/* Próximos Jogos */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Próximas Partidas</h2>
          {upcomingMatches.slice(1).map((match) => (
            <Card key={match.id} className="rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{formatDate(match.date)}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{formatTime(match.time)} - {match.location}</p>
                  </div>
                  <Badge variant="outline" className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300">{match.confirmedPlayers}/{match.maxPlayers} jogadores</Badge>
                </div>
                <WeatherForecast 
                  date={match.date} 
                  location={match.location}
                  time={match.time}
                  className="border-0 shadow-none bg-zinc-100 dark:bg-zinc-700"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-6 space-y-4">
            {/* Data e Hora */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatDate(currentMatch.date)}</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatTime(currentMatch.time)}</span>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <Users className="w-3 h-3 mr-1" />
                {getConfirmedParticipants(currentMatch.id.toString()).length}/{currentMatch.maxPlayers} jogadores
              </Badge>
            </div>

            {/* Localização */}
            <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-300">
              <MapPin className="w-4 h-4" />
              <div>
                <p className="font-medium dark:text-zinc-200">{currentMatch.location}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Local da partida</p>
              </div>
            </div>

            {/* Status do Check-in */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2 dark:bg-green-900/20 dark:border-green-800/30">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 font-medium dark:text-green-300">Check-in realizado</span>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                {(() => {
                  const matchId = currentMatch.id.toString();
                  const buttonState = getButtonState(matchId);
                  const userConfirmed = user ? hasUserConfirmed(matchId, user.id) : false;
                  
                  const IconComponent = buttonState.text.includes('Confirmado') ? CheckCircle : 
                                       buttonState.text.includes('Lista de Espera') ? ClockIcon : 
                                       buttonState.text.includes('Pedir para Jogar') ? UserPlus : CheckCircle;
                  
                  // Estados visuais dinâmicos baseados no estado real
                  const isConfirmed = userConfirmed || buttonState.text.includes('Confirmado');
                  const buttonClasses = isConfirmed 
                    ? "flex-1 bg-maestros-green text-white border-maestros-green hover:bg-maestros-green/90" 
                    : "flex-1 bg-white border-maestros-green text-maestros-green hover:bg-maestros-green hover:text-white";
                  
                  return (
                    <Button 
                      key={`${matchId}-${userConfirmed}-${buttonState.text}`}
                      variant="outline" 
                      className={buttonClasses}
                      disabled={buttonState.disabled}
                      onClick={() => handleConfirmParticipation(matchId)}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {buttonState.text}
                    </Button>
                  );
                })()}
                <RouteButton 
                  address={currentMatch.location} 
                  className="flex-1 border-maestros-green text-maestros-green hover:bg-maestros-green/10"
                />
              </div>
              {canDrawTeams() && (() => {
                const matchId = currentMatch.id.toString();
                const isButtonBlinking = isBlinking[matchId] || false;
                
                // Classes do botão com fundo verde e efeito de piscar
                let buttonClasses = "w-full !bg-maestros-green !text-white !border-maestros-green !hover:bg-maestros-green/90 transition-all duration-300";
                
                if (isButtonBlinking) {
                  buttonClasses += " animate-pulse";
                }
                
                const handleButtonClick = () => {
                  handleTeamDraw(matchId);
                };
                
                return (
                  <Button 
                    variant="outline" 
                    className={buttonClasses}
                    onClick={handleButtonClick}
                    disabled={isButtonBlinking}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isButtonBlinking ? 'Sorteando...' : 'Sortear Times'}
                  </Button>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Previsão do Tempo */}
        <WeatherForecast 
          date={currentMatch.date} 
          location={currentMatch.location}
          time={currentMatch.time}
        />

        {/* Card de Doação - Condicional */}
        {config.showInHome && config.enabledCards.helpArtist && (
          <Card className="rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 border-orange-200/50 dark:border-orange-800/30 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300" onClick={openDonationModal}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800/30 dark:to-amber-800/30 p-3 rounded-full shadow-inner">
                    <Heart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-orange-800 dark:text-orange-200">☕ Ajude o Artista</h3>
                    <p className="text-sm text-orange-600 dark:text-orange-300">Apoie o desenvolvimento do projeto</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-orange-500 dark:text-orange-400 mb-1">A partir de</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">R$ 2</p>
                </div>
              </div>
              <div className="mt-4 bg-white/70 dark:bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-orange-100 dark:border-orange-800/30">
                <p className="text-sm text-orange-700 dark:text-orange-200">
                  💡 Sua contribuição ajuda a manter o servidor, desenvolver novas funcionalidades e melhorar a experiência de todos os jogadores!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seção de Testes - Apenas para desenvolvimento */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">🧪 Páginas de Teste</h2>
          <Card className="rounded-2xl">
            <CardContent className="p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/test-page')}
                  className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                >
                  Teste Simples
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/offline-auth')}
                  className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                >
                  Login Offline
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/test-auth')}
                  className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                >
                  Teste Auth
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/debug-auth')}
                  className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                >
                  Debug Auth
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/create-owner-google')}
                  className="col-span-2 text-purple-600 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                >
                  👑 Criar Owner com Google
                </Button>
              </div>
              
              {/* Botão de Sincronização */}
              <div className="pt-2 border-t border-zinc-200 space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSyncData}
                  disabled={isSyncing}
                  className="w-full !bg-maestros-green !text-white !border-maestros-green hover:!bg-maestros-green/90 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem('maestrosfc_games');
                    window.location.reload();
                  }}
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Limpar Cache de Jogos
                </Button>
                <p className="text-xs text-zinc-500 mt-1 text-center">
                  Sincroniza dados entre mobile e desktop
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seletor de Role para Testes */}
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-4">
            <Settings className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Teste de Permissões</h3>
              <p className="text-sm text-yellow-600">Role atual: <strong>{user?.role}</strong></p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => changeUserRole('owner')} className="text-xs">
                Owner
              </Button>
              <Button size="sm" variant="outline" onClick={() => changeUserRole('admin')} className="text-xs">
                Admin
              </Button>
              <Button size="sm" variant="outline" onClick={() => changeUserRole('aux')} className="text-xs">
                Aux
              </Button>
              <Button size="sm" variant="outline" onClick={() => changeUserRole('mensalista')} className="text-xs">
                Mensalista
              </Button>
              <Button size="sm" variant="outline" onClick={() => changeUserRole('diarista')} className="text-xs">
                Diarista
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Doação */}
      <Dialog open={isDonationModalOpen} onOpenChange={setIsDonationModalOpen}>
        <DialogContent className="w-[95vw] max-w-sm mx-auto max-h-[85vh] overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 border-orange-200 dark:border-orange-800/50">
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200 text-base">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800/30 dark:to-amber-800/30 p-1.5 rounded-full">
                <Heart className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              ☕ Ajude o Artista
            </DialogTitle>
            <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
              Sua contribuição faz toda a diferença! 🚀
            </p>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] px-1 space-y-4">
            {/* Valores Sugeridos */}
            <div>
              <p className="text-sm font-medium mb-3 text-orange-700 dark:text-orange-300">☕ Valores sugeridos:</p>
              <div className="grid grid-cols-3 gap-3">
                {[2, 5, 10].map((amount) => (
                  <button
                    key={amount}
                    className={`h-10 rounded-lg transition-all duration-200 transform active:scale-95 ${
                      selectedDonationAmount === amount 
                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md scale-105 ring-1 ring-orange-300" 
                        : "bg-white/80 dark:bg-gray-800/50 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:border-orange-400 hover:scale-102"
                    }`}
                    onClick={() => handleDonationAmountSelect(amount)}
                  >
                    <div className="text-center">
                      <div className="font-bold text-sm">R$ {amount}</div>
                      <div className="text-xs opacity-80">
                        {amount === 2 ? "☕" : amount === 5 ? "🥪" : "🍽️"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Valores Maiores */}
            <div>
              <p className="text-sm font-medium mb-3 text-orange-700 dark:text-orange-300">🎯 Ou escolha outro valor:</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[15, 20, 30].map((amount) => (
                  <button
                    key={amount}
                    className={`h-10 rounded-lg transition-all duration-200 transform active:scale-95 ${
                      selectedDonationAmount === amount 
                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md scale-105 ring-1 ring-orange-300" 
                        : "bg-white/80 dark:bg-gray-800/50 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:border-orange-400 hover:scale-102"
                    }`}
                    onClick={() => handleDonationAmountSelect(amount)}
                  >
                    <div className="text-center">
                      <div className="font-bold text-sm">R$ {amount}</div>
                      <div className="text-xs opacity-80">
                        {amount === 15 ? "😊" : amount === 20 ? "🤩" : "🚀"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Valor Personalizado */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-700 dark:text-orange-300">💰 Valor personalizado:</label>
                <Input
                  type="number"
                  placeholder="Digite o valor que desejar"
                  value={customDonationAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="border-2 border-orange-200 dark:border-orange-700 focus:border-orange-400 focus:ring-orange-400/20 text-orange-900 dark:text-orange-100 placeholder:text-orange-400 bg-white/70 dark:bg-black/20"
                />
              </div>
            </div>

            {/* Transparência */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-lg border border-orange-200/50 dark:border-orange-800/30">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-1 text-sm">
                <span>💡</span> Como é usada:
              </h4>
              <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                <li className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Servidor e hospedagem
                </li>
                <li className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Novas funcionalidades
                </li>
                <li className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Melhorias UX
                </li>
                <li className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  Suporte técnico
                </li>
              </ul>
            </div>
          </div>
          
          {/* Valor Total - Fixo */}
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-800/30 dark:to-amber-800/30 p-3 border-t border-orange-200/50 dark:border-orange-800/30">
            <div className="flex justify-between items-center">
              <span className="font-bold text-orange-800 dark:text-orange-200 text-sm">🎯 Total:</span>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                R$ {(customDonationAmount ? parseFloat(customDonationAmount) || 0 : selectedDonationAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botões - Fixo */}
          <div className="flex gap-2 p-3 pt-0">
            <button 
              onClick={closeDonationModal} 
              className="flex-1 h-10 rounded-lg border border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40 bg-white/80 dark:bg-gray-800/50 transition-all duration-200 transform active:scale-95 hover:border-orange-400 font-medium text-sm"
            >
              Cancelar
            </button>
            <button 
              onClick={handleDonationSubmit} 
              disabled={!selectedDonationAmount && !customDonationAmount}
              className={`flex-1 h-10 rounded-lg text-white font-bold shadow-md hover:shadow-lg transform transition-all duration-200 flex items-center justify-center gap-1 text-sm ${
                !selectedDonationAmount && !customDonationAmount
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:scale-105 active:scale-95"
              }`}
            >
              <Heart className="w-3 h-3" />
              Contribuir via PIX
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Sorteio de Times - Otimizado para Mobile */}
       <Dialog open={showTeamDrawModal} onOpenChange={(open) => {
          if (!open) {
            // Resetar o estado do sorteio para permitir novo sorteio
            setTeamDrawCompleted(prev => ({ ...prev, [currentDrawMatchId]: false }));
            setShowTeamDrawModal(false);
            setCurrentDrawMatchId('');
            setIsBlinking(prev => ({ ...prev, [currentDrawMatchId]: false }));
          } else {
            setShowTeamDrawModal(true);
          }
        }}>
         <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-hidden">
           <DialogHeader className="pb-2">
             <DialogTitle className="text-center text-lg font-bold flex items-center justify-center gap-2">
               🎲 <span>Sorteio de Times</span>
             </DialogTitle>
           </DialogHeader>
           
           <div className="overflow-y-auto max-h-[70vh] px-1">
             {/* Estados do modal: loading, resultado ou configuração */}
             {isBlinking[currentDrawMatchId] ? (
               /* Tela de loading durante o sorteio */
               <div className="space-y-6 py-8 text-center animate-in zoom-in-50 duration-500">
                 <div className="flex justify-center">
                   <div className="relative">
                     <div className="w-16 h-16 border-4 border-maestros-green/20 rounded-full animate-spin">
                       <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-maestros-green rounded-full animate-spin"></div>
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center">
                       <Users className="w-6 h-6 text-maestros-green animate-pulse" />
                     </div>
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="text-lg font-bold text-gray-700 animate-pulse">
                     🎲 Sorteando Times...
                   </div>
                   <div className="text-sm text-gray-500">
                     Distribuindo {playersPerTeam} jogadores por time
                   </div>
                 </div>
                 
                 {/* Animação dos times sendo formados */}
                 <div className="grid grid-cols-2 gap-2">
                   {[
                     { name: 'PRETO', dot: 'bg-black' },
                     { name: 'VERDE', dot: 'bg-green-600' },
                     { name: 'CINZA', dot: 'bg-gray-500' },
                     { name: 'VERMELHO', dot: 'bg-red-600' }
                   ].map((team, index) => (
                     <div key={team.name} className="bg-zinc-800 rounded-lg border border-zinc-700 p-2 animate-pulse" style={{animationDelay: `${index * 200}ms`}}>
                       <div className="flex items-center justify-center gap-1">
                         <div className={`w-2 h-2 ${team.dot} rounded-full animate-bounce`} style={{animationDelay: `${index * 100}ms`}}></div>
                         <span className="text-xs font-medium text-white">{team.name}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ) : teamDrawCompleted[currentDrawMatchId] ? (
               /* Mostrar resultado do sorteio com animação */
               <div className="space-y-4 animate-in slide-in-from-right-5 duration-500">
                 <div className="text-center">
                   <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                     ✅ <span>Sorteio Realizado!</span>
                   </div>
                 </div>
                 
                 {/* Times em grid 2x2 para mobile */}
                 <div className="grid grid-cols-1 gap-3">
                   {/* Time Preto */}
                   <div className="bg-gray-900 rounded-xl border border-gray-700 p-3 transform transition-all duration-300 hover:scale-[1.02]">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-4 h-4 bg-black rounded-full border-2 border-white animate-pulse"></div>
                       <span className="font-bold text-sm text-white">TIME PRETO</span>
                       <span className="text-xs text-gray-300">({getPlayersByTeam('Preto').length})</span>
                     </div>
                     <div className="grid grid-cols-2 gap-1">
                       {getPlayersByTeam('Preto').map((player, index) => (
                         <div key={player.id} className="text-xs font-medium text-white bg-black/30 rounded px-2 py-1 animate-in fade-in duration-300" style={{animationDelay: `${index * 100}ms`}}>
                           {player.name}
                         </div>
                       ))}
                       {getPlayersByTeam('Preto').length === 0 && (
                         <div className="col-span-2 text-xs text-gray-400 italic text-center py-2">Nenhum jogador</div>
                       )}
                     </div>
                   </div>
                   
                   {/* Time Verde */}
                   <div className="bg-green-50 rounded-xl border border-green-200 p-3 transform transition-all duration-300 hover:scale-[1.02]">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-4 h-4 bg-green-600 rounded-full animate-pulse"></div>
                       <span className="font-bold text-sm text-green-800">TIME VERDE</span>
                       <span className="text-xs text-green-600">({getPlayersByTeam('Verde').length})</span>
                     </div>
                     <div className="grid grid-cols-2 gap-1">
                       {getPlayersByTeam('Verde').map((player, index) => (
                         <div key={player.id} className="text-xs font-medium text-green-800 bg-white/50 rounded px-2 py-1 animate-in fade-in duration-300" style={{animationDelay: `${index * 100}ms`}}>
                           {player.name}
                         </div>
                       ))}
                       {getPlayersByTeam('Verde').length === 0 && (
                         <div className="col-span-2 text-xs text-green-400 italic text-center py-2">Nenhum jogador</div>
                       )}
                     </div>
                   </div>
                   
                   {/* Time Cinza */}
                   <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 transform transition-all duration-300 hover:scale-[1.02]">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-4 h-4 bg-gray-500 rounded-full animate-pulse"></div>
                       <span className="font-bold text-sm text-gray-700">TIME CINZA</span>
                       <span className="text-xs text-gray-500">({getPlayersByTeam('Cinza').length})</span>
                     </div>
                     <div className="grid grid-cols-2 gap-1">
                       {getPlayersByTeam('Cinza').map((player, index) => (
                         <div key={player.id} className="text-xs font-medium text-gray-700 bg-white/50 rounded px-2 py-1 animate-in fade-in duration-300" style={{animationDelay: `${index * 100}ms`}}>
                           {player.name}
                         </div>
                       ))}
                       {getPlayersByTeam('Cinza').length === 0 && (
                         <div className="col-span-2 text-xs text-gray-400 italic text-center py-2">Nenhum jogador</div>
                       )}
                     </div>
                   </div>
                   
                   {/* Time Vermelho */}
                   <div className="bg-red-50 rounded-xl border border-red-200 p-3 transform transition-all duration-300 hover:scale-[1.02]">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                       <span className="font-bold text-sm text-red-800">TIME VERMELHO</span>
                       <span className="text-xs text-red-600">({getPlayersByTeam('Vermelho').length})</span>
                     </div>
                     <div className="grid grid-cols-2 gap-1">
                       {getPlayersByTeam('Vermelho').map((player, index) => (
                         <div key={player.id} className="text-xs font-medium text-red-800 bg-white/50 rounded px-2 py-1 animate-in fade-in duration-300" style={{animationDelay: `${index * 100}ms`}}>
                           {player.name}
                         </div>
                       ))}
                       {getPlayersByTeam('Vermelho').length === 0 && (
                         <div className="col-span-2 text-xs text-red-400 italic text-center py-2">Nenhum jogador</div>
                       )}
                     </div>
                   </div>
                 </div>
                 
                 {/* Botões de ação */}
                 <div className="pt-3 sticky bottom-0 bg-white space-y-2">
                   <Button 
                     onClick={() => {
                       // Resetar o estado do sorteio para permitir novo sorteio
                       setTeamDrawCompleted(prev => ({ ...prev, [currentDrawMatchId]: false }));
                     }}
                     className="w-full bg-maestros-green hover:bg-maestros-green/90 text-white font-bold py-3 rounded-xl shadow-lg transform transition-all duration-200 active:scale-95"
                   >
                     <RefreshCw className="w-4 h-4 mr-2" />
                     Sortear Novamente
                   </Button>
                   <Button 
                     onClick={() => navigate('/match')}
                     className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transform transition-all duration-200 active:scale-95"
                   >
                     <Play className="w-4 h-4 mr-2" />
                     Ir para a Partida
                   </Button>
                 </div>
               </div>
             ) : (
               /* Tela inicial do sorteio com animação */
               <div className="space-y-5 animate-in slide-in-from-left-5 duration-500">
                 <div className="text-center">
                   <div className="text-base font-medium text-gray-700">
                     ⚙️ Configurar Sorteio
                   </div>
                 </div>
                 
                 {/* Seleção de quantidade de jogadores - Mobile Optimized */}
                 <div className="space-y-3">
                   <div className="text-center">
                     <div className="text-sm font-medium text-gray-600">Jogadores por time</div>
                     <div className="text-xs text-gray-500 mt-1">
                       Escolha quantos jogadores cada time terá
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <Button
                       variant="outline"
                       onClick={() => setPlayersPerTeam(5)}
                       className={`h-16 ${playersPerTeam === 5 ? "bg-maestros-green hover:bg-maestros-green/90 text-white border-maestros-green ring-2 ring-maestros-green/30" : "bg-white hover:bg-maestros-green/10 text-gray-700 border-gray-300 hover:border-maestros-green"} transition-all duration-200 transform active:scale-95 rounded-xl`}
                     >
                       <div className="text-center">
                         <div className="text-xl font-bold">5</div>
                         <div className="text-xs opacity-80">20 total</div>
                         <div className="text-xs opacity-60">Mais rápido</div>
                       </div>
                     </Button>
                     <Button
                       variant="outline"
                       onClick={() => setPlayersPerTeam(6)}
                       className={`h-16 ${playersPerTeam === 6 ? "bg-maestros-green hover:bg-maestros-green/90 text-white border-maestros-green ring-2 ring-maestros-green/30" : "bg-white hover:bg-maestros-green/10 text-gray-700 border-gray-300 hover:border-maestros-green"} transition-all duration-200 transform active:scale-95 rounded-xl`}
                     >
                       <div className="text-center">
                         <div className="text-xl font-bold">6</div>
                         <div className="text-xs opacity-80">24 total</div>
                         <div className="text-xs opacity-60">Padrão</div>
                       </div>
                     </Button>
                   </div>
                 </div>
                 
                 {/* Preview dos times - Mobile Grid */}
                 <div className="space-y-3">
                   <div className="text-center">
                     <div className="text-sm font-medium text-gray-600">Times que serão formados</div>
                     <div className="text-xs text-gray-500 mt-1">
                       {playersPerTeam} jogadores cada
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <div className="flex items-center justify-center gap-2 p-3 bg-gray-900 rounded-lg border border-gray-700 transform transition-all duration-300 hover:scale-105">
                       <div className="w-4 h-4 bg-black rounded-full border-2 border-white"></div>
                       <span className="font-bold text-xs text-white">PRETO</span>
                     </div>
                     
                     <div className="flex items-center justify-center gap-2 p-3 bg-green-800 rounded-lg border border-green-600 transform transition-all duration-300 hover:scale-105">
                       <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                       <span className="font-bold text-xs text-white">VERDE</span>
                     </div>
                     
                     <div className="flex items-center justify-center gap-2 p-3 bg-gray-600 rounded-lg border border-gray-400 transform transition-all duration-300 hover:scale-105">
                       <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
                       <span className="font-bold text-xs text-white">CINZA</span>
                     </div>
                     
                     <div className="flex items-center justify-center gap-2 p-3 bg-red-800 rounded-lg border border-red-600 transform transition-all duration-300 hover:scale-105">
                       <div className="w-4 h-4 bg-red-400 rounded-full border-2 border-white"></div>
                       <span className="font-bold text-xs text-white">VERMELHO</span>
                     </div>
                   </div>
                 </div>
                 
                 {/* Botão do modal - Mobile Optimized */}
                 <div className="pt-4 space-y-2">
                   <div className="bg-maestros-green/10 border border-maestros-green/20 rounded-lg p-3 text-center">
                     <div className="text-xs text-maestros-green font-medium">
                       🎯 Pronto para sortear {playersPerTeam * 4} jogadores
                     </div>
                     <div className="text-xs text-maestros-green/70 mt-1">
                       {playersPerTeam} jogadores × 4 times
                     </div>
                   </div>
                   <Button 
                     onClick={performTeamDraw}
                     className="w-full bg-maestros-green hover:bg-maestros-green/90 text-white border-none font-bold py-4 rounded-xl shadow-lg transform transition-all duration-200 active:scale-95"
                     disabled={isBlinking[currentDrawMatchId]}
                   >
                     {isBlinking[currentDrawMatchId] ? (
                       <div className="flex items-center justify-center gap-2">
                         <RefreshCw className="w-5 h-5 animate-spin" />
                         <span>Sorteando...</span>
                       </div>
                     ) : (
                       <div className="flex items-center justify-center gap-3">
                         <div className="bg-white/20 p-1 rounded-full">
                           <Users className="w-4 h-4" />
                         </div>
                         <span>🎲 Iniciar Sorteio</span>
                       </div>
                     )}
                   </Button>
                 </div>
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>
    </PageLayout>
  );
}

