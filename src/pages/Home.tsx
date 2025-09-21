import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Users, CheckCircle, Navigation, RefreshCw, Heart, Coffee } from 'lucide-react';
import { LoadingCard, LoadingStats } from '@/components/ui/loading-card';
import { EmptyGames } from '@/components/ui/empty-state';
import { useToastHelpers } from '@/components/ui/toast';
import { useGamesStore } from '@/store/gamesStore';
import { useDonationStore } from '@/store/donationStore';
import { SyncService } from '@/services/syncService';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { RouteButton } from '@/components/RouteButton';
import PageLayout from '@/components/layout/PageLayout';
import WeatherForecast from '@/components/WeatherForecast';

export default function HomePage() {
  const navigate = useNavigate();
  const { matches, getUpcomingMatches } = useGamesStore();
  const { config } = useDonationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { success, error } = useToastHelpers();
  const { user } = useAuth();

  // Estados para o modal de doações
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState(2);
  const [customDonationAmount, setCustomDonationAmount] = useState('');

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

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PageLayout title="Início" subtitle="Próximo jogo e Temperatura local">
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
      <PageLayout title="Início" subtitle="Próximo jogo e Temperatura local">
        <div className="space-y-4 pb-20">
          <EmptyGames />
        </div>
      </PageLayout>
    );
  }

  const currentMatch = upcomingMatches[0];

  return (
    <PageLayout title="Início" subtitle="Próximo jogo e Temperatura local">
      <div className="space-y-4 pb-20">
        <Card className="rounded-2xl">
          <CardContent className="p-6 space-y-4">
            {/* Data e Hora */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-zinc-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatDate(currentMatch.date)}</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatTime(currentMatch.time)}</span>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Users className="w-3 h-3 mr-1" />
                {currentMatch.confirmedPlayers}/{currentMatch.maxPlayers} jogadores
              </Badge>
            </div>

            {/* Localização */}
            <div className="flex items-center space-x-2 text-zinc-600">
              <MapPin className="w-4 h-4" />
              <div>
                <p className="font-medium">{currentMatch.location}</p>
                <p className="text-sm text-zinc-500">Local da partida</p>
              </div>
            </div>

            {/* Status do Check-in */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">Check-in realizado</span>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Button className="flex-1 btn-primary">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmado
                </Button>
                <RouteButton 
                  address={currentMatch.location} 
                  className="flex-1 border-maestros-green text-maestros-green hover:bg-maestros-green/10"
                />
              </div>
              <Button className="w-full btn-secondary">
                <Users className="w-4 h-4 mr-2" />
                Sortear Times
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previsão do Tempo */}
        <WeatherForecast 
          date={currentMatch.date} 
          location={currentMatch.location}
          time={currentMatch.time}
        />

        {/* Próximos Jogos */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Próximas Partidas</h2>
          {upcomingMatches.slice(1).map((match) => (
            <Card key={match.id} className="rounded-2xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{formatDate(match.date)}</p>
                    <p className="text-sm text-zinc-500">{formatTime(match.time)} - {match.location}</p>
                  </div>
                  <Badge variant="outline">{match.confirmedPlayers}/{match.maxPlayers} jogadores</Badge>
                </div>
                <WeatherForecast 
                  date={match.date} 
                  location={match.location}
                  time={match.time}
                  className="border-0 shadow-none bg-zinc-50 dark:bg-zinc-800"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Card de Doação - Condicional */}
        {config.showInHome && config.enabledCards.helpArtist && (
          <Card className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-red-200 cursor-pointer hover:shadow-lg transition-all duration-300" onClick={openDonationModal}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-red-800">Ajude o Artista</h3>
                    <p className="text-sm text-red-600">Contribua para manter o app funcionando</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-500 mb-1">A partir de</p>
                  <p className="text-2xl font-bold text-red-700">R$ 2</p>
                </div>
              </div>
              <div className="mt-4 bg-white/50 rounded-lg p-3">
                <p className="text-sm text-red-700">
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
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/test-page')}
                >
                  Teste Simples
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/offline-auth')}
                >
                  Login Offline
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/test-auth')}
                >
                  Teste Auth
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/debug-auth')}
                >
                  Debug Auth
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/create-owner-google')}
                  className="col-span-2 text-purple-600 border-purple-200 hover:bg-purple-50"
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
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem('maestrosfc_games');
                    window.location.reload();
                  }}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
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
      </div>

      {/* Modal de Doação */}
      <Dialog open={isDonationModalOpen} onOpenChange={setIsDonationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Heart className="w-5 h-5" />
              Ajude o Artista
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Valores Sugeridos */}
            <div>
              <p className="text-sm font-medium mb-3">Valores sugeridos:</p>
              <div className="grid grid-cols-3 gap-2">
                {[2, 5, 10].map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedDonationAmount === amount ? "default" : "outline"}
                    className={selectedDonationAmount === amount ? "bg-red-600 hover:bg-red-700" : "border-red-200 text-red-600 hover:bg-red-50"}
                    onClick={() => handleDonationAmountSelect(amount)}
                  >
                    R$ {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Valores Maiores */}
            <div>
              <p className="text-sm font-medium mb-3">Ou escolha outro valor:</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[15, 20, 30].map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedDonationAmount === amount ? "default" : "outline"}
                    className={selectedDonationAmount === amount ? "bg-red-600 hover:bg-red-700" : "border-red-200 text-red-600 hover:bg-red-50"}
                    onClick={() => handleDonationAmountSelect(amount)}
                  >
                    R$ {amount}
                  </Button>
                ))}
              </div>
              
              {/* Valor Personalizado */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor personalizado:</label>
                <Input
                  type="number"
                  placeholder="Digite o valor"
                  value={customDonationAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="border-red-200 focus:border-red-400"
                />
              </div>
            </div>

            {/* Transparência */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">💡 Como sua contribuição é usada:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Manutenção do servidor e hospedagem</li>
                <li>• Desenvolvimento de novas funcionalidades</li>
                <li>• Melhorias na experiência do usuário</li>
                <li>• Suporte técnico e atualizações</li>
              </ul>
            </div>

            {/* Valor Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-xl font-bold text-red-600">
                  R$ {(customDonationAmount ? parseFloat(customDonationAmount) || 0 : selectedDonationAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={closeDonationModal} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleDonationSubmit} 
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={!selectedDonationAmount && !customDonationAmount}
              >
                Contribuir via PIX
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

