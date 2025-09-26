import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { useGamesStore } from '@/store/gamesStore';
import { useDonationStore } from '@/store/donationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Crown, 
  Users, 
  Calendar, 
  DollarSign, 
  Trophy, 
  Settings, 
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Shield,
  UserCheck,
  UserX,
  CreditCard,
  FileText,
  Bell,
  LogOut,
  Save,
  X,
  MapPin,
  Info,
  Repeat,
  Heart,
  Coffee,
  Play,
  Mail,
  Star
} from 'lucide-react';
import { isMainOwner, PROTECTION_MESSAGES } from '@/utils/ownerProtection';
import { CompleteInviteModal } from '@/components/CompleteInviteModal';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';

export default function OwnerDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Store global de jogos
  const { matches, addMatch, updateMatch, deleteMatch, getUpcomingMatches } = useGamesStore();
  
  // Store de configurações de doação
  const { config, toggleHomeDisplay, toggleDashboardDisplay, toggleHelpArtistCard, toggleCoffeeForDevCard, resetToDefaults } = useDonationStore();
  
  // Estados para modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    location: '',
    maxPlayers: 22
  });

  // Estados para modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);

  // Estados para modal de criação
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    date: '',
    time: '',
    location: '',
    maxPlayers: 22
  });

  // Estados para modal de visualização de detalhes
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingMatch, setViewingMatch] = useState(null);

  // Estados para modal de doações
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState(2);
  const [customAmount, setCustomAmount] = useState('');

  // Estados para modal de convites
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Estados para configurações PIX
  const [pixPayment, setPixPayment] = useState({
    key: '',
    accountName: '',
    description: ''
  });
  const [pixDonation, setPixDonation] = useState({
    key: '',
    accountName: '',
    description: ''
  });

  // ============ GERENCIAMENTO DE JOGADORES OFFLINE ============
  
  // Estados principais dos jogadores
  const [offlinePlayers, setOfflinePlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // Estados de filtros
  const [showPlayerFilters, setShowPlayerFilters] = useState(false);
  const [playerRoleFilter, setPlayerRoleFilter] = useState('');
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [playerStatusFilter, setPlayerStatusFilter] = useState('');

  // Estados dos modais de jogadores
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [showDeletePlayerModal, setShowDeletePlayerModal] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  const [playerToDelete, setPlayerToDelete] = useState(null);

  // Formulários
  const [playerForm, setPlayerForm] = useState({
    name: '',
    email: '',
    role: 'diarista',
    position: 'Meio',
    shirt_size: 'G',
    stars: 5
  });

  // Estado para notificação de sincronização
  const [showOfflineSyncNotice, setShowOfflineSyncNotice] = useState(false);

  // Dados mockados - depois integrar com Supabase
  const [dashboardData] = useState({
    financialStatus: {
      totalThisMonth: 2400,
      paid: 1800,
      pending: 600,
      playersCount: 24
    },
    players: [
      { id: 1, name: 'João Silva', role: 'admin', status: 'active', lastPayment: '2024-01-15' },
      { id: 2, name: 'Maria Santos', role: 'mensalista', status: 'active', lastPayment: '2024-01-10' },
      { id: 3, name: 'Pedro Costa', role: 'diarista', status: 'pending', lastPayment: null },
      { id: 4, name: 'Ana Oliveira', role: 'aux', status: 'active', lastPayment: '2024-01-12' }
    ],
    recentPayments: [
      { id: 1, player: 'João Silva', amount: 100, status: 'paid', date: '2024-01-15' },
      { id: 2, player: 'Maria Santos', amount: 100, status: 'paid', date: '2024-01-10' },
      { id: 3, player: 'Pedro Costa', amount: 50, status: 'pending', date: '2024-01-18' }
    ]
  });

  // Funções para edição de jogos
  const openEditModal = (match) => {
    setEditingMatch(match);
    setEditForm({
      date: match.date,
      time: match.time,
      location: match.location,
      maxPlayers: match.maxPlayers
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingMatch(null);
    setEditForm({
      date: '',
      time: '',
      location: '',
      maxPlayers: 22
    });
  };

  // Funções para visualização de detalhes
  const openViewModal = (match) => {
    setViewingMatch(match);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewingMatch(null);
  };

  const saveMatchChanges = () => {
    if (!editingMatch) return;
    
    // Atualizar o jogo no store global
    updateMatch(editingMatch.id, editForm);
    
    closeEditModal();
    alert('Jogo atualizado com sucesso!');
  };

  // Funções para exclusão de jogos
  const openDeleteModal = (match) => {
    setMatchToDelete(match);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setMatchToDelete(null);
  };

  const confirmDeleteMatch = () => {
    if (!matchToDelete) return;
    
    // Remover o jogo do store global
    deleteMatch(matchToDelete.id);
    
    closeDeleteModal();
    alert('Partida excluída com sucesso!');
  };

  // Funções para modal de criação
  const openCreateModal = () => {
    // Definir data padrão para hoje
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const currentTime = today.toTimeString().slice(0, 5); // Formato HH:MM
    
    setCreateForm({
      date: todayDate,
      time: currentTime,
      location: '',
      maxPlayers: 22
    });
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateForm({
      date: '',
      time: '',
      location: '',
      maxPlayers: 22
    });
  };

  const handleCreateMatch = () => {
    if (!createForm.date || !createForm.time || !createForm.location) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Adicionar nova partida ao store global
    addMatch({
      date: createForm.date,
      time: createForm.time,
      location: createForm.location,
      maxPlayers: createForm.maxPlayers
    });

    closeCreateModal();
    alert('Partida criada com sucesso!');
  };

  // ============ FUNÇÕES DE GERENCIAMENTO DE JOGADORES ============

  // Carregar jogadores offline do localStorage
  const loadOfflinePlayers = () => {
    setLoadingPlayers(true);
    try {
      // Buscar jogadores salvos no localStorage mas excluindo o usuário atual
      const playersData = [];
      
      // Lista para buscar JSON de jogadores em vários possíveis nomes de chave
      const possibleStorageKeys = [
        'offline_players',
        'local_players', 
        'players-store',
        'nexus-play-players',
        'app_players'
      ];
      
      for (const key of possibleStorageKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              playersData.push(...parsed);
            } else if (parsed.players && Array.isArray(parsed.players)) {
              playersData.push(...parsed.players);
            } else if (parsed.state && Array.isArray(parsed.state.players)) {
              playersData.push(...parsed.state.players);
            }
          } catch (e) {
            console.warn(`Erro ao parse dados da chave ${key}:`, e);
          }
        }
      }
      
      // Filtrar o usuário atual e normalizar dados
      const filteredPlayers = playersData
        .filter(player => player && player.id && player.id !== user?.id)
        .map(player => ({
          id: player.id,
          name: player.name || 'Jogador sem nome',
          email: player.email || '',
          role: player.role || 'diarista',
          position: player.position || 'Meio',
          shirt_size: player.shirt_size || 'G',
          avatar_url: player.avatar_url || '',
          custom_avatar: player.custom_avatar || '',
          created_at: player.created_at || new Date(),
          status: 'active' // Assumindo todos como ativos
        }));

      setOfflinePlayers(filteredPlayers);
      setShowOfflineSyncNotice(filteredPlayers.length > 0);
    } catch (error) {
      console.error('Erro ao carregar jogadores offline:', error);
    } finally {
      setLoadingPlayers(false);
    }
  };

  // Aplicar filtros aos jogadores
  const filteredOfflinePlayers = React.useMemo(() => {
    return offlinePlayers.filter(player => {
      // Filtro por role
      if (playerRoleFilter && player.role !== playerRoleFilter) {
        return false;
      }
      
      // Filtro por texto de busca
      if (playerSearchTerm) {
        const searchLower = playerSearchTerm.toLowerCase();
        const matchesName = player.name.toLowerCase().includes(searchLower);
        const matchesEmail = player.email.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesEmail) {
          return false;
        }
      }
      
      // Filtro por status
      if (playerStatusFilter && player.status !== playerStatusFilter) {
        return false;
      }
      
      return true;
    });
  }, [offlinePlayers, playerRoleFilter, playerSearchTerm, playerStatusFilter]);

  // Limpar filtros
  const clearPlayerFilters = () => {
    setPlayerRoleFilter('');
    setPlayerSearchTerm('');
    setPlayerStatusFilter('');
  };

  // Função para adicionar um novo jogador
  const handleAddPlayer = () => {
    if (!playerForm.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    
    if (!playerForm.email.trim()) {
      alert('Email é obrigatório');
      return;
    }

    const newPlayer = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: playerForm.name.trim(),
      email: playerForm.email.toLowerCase().trim(),
      role: playerForm.role,
      position: playerForm.position,
      shirt_size: playerForm.shirt_size,
      stars: playerForm.stars,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const updatedPlayers = [...offlinePlayers, newPlayer];
    setOfflinePlayers(updatedPlayers);

    // Salvar no localStorage
    localStorage.setItem('offline_players', JSON.stringify(updatedPlayers));
    
    // Reset form and close modal
    setPlayerForm({
      name: '',
      email: '',
      role: 'diarista',
      position: 'Meio',
      shirt_size: 'G'
    });
    
    setShowAddPlayerModal(false);
    alert(`Jogador ${newPlayer.name} adicionado com sucesso!`);
    loadOfflinePlayers();
  };

  // Função para abrir modal de edição de jogador
  const openEditPlayerModal = (player) => {
    setPlayerToEdit(player);
    setPlayerForm({
      name: player.name,
      email: player.email,
      role: player.role,
      position: player.position || 'Meio',
      shirt_size: player.shirt_size || 'G',
      stars: player.stars || 5
    });
    setShowEditPlayerModal(true);
  };

  // Função para salvar edição de jogador
  const handleEditPlayer = () => {
    if (!playerToEdit || !playerForm.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }
    
    if (!playerForm.email.trim()) {
      alert('Email é obrigatório');
      return;
    }

    const updatedPlayers = offlinePlayers.map(player => {
      if (player.id === playerToEdit.id) {
        return {
          ...player,
          name: playerForm.name.trim(),
          email: playerForm.email.toLowerCase().trim(),
          role: playerForm.role,
          position: playerForm.position,
          shirt_size: playerForm.shirt_size,
          stars: playerForm.stars
        };
      }
      return player;
    });

    setOfflinePlayers(updatedPlayers);
    
    // Salvar no localStorage
    localStorage.setItem('offline_players', JSON.stringify(updatedPlayers));
    
    setShowEditPlayerModal(false);
    setPlayerToEdit(null);
    setPlayerForm({
      name: '',
      email: '',
      role: 'diarista',
      position: 'Meio',
      shirt_size: 'G'
    });
    
    alert(`Jogador ${playerForm.name} atualizado com sucesso!`);
    loadOfflinePlayers();
  };

  // Função para abrir modal de exclusão
  const openDeletePlayerModal = (player) => {
    setPlayerToDelete(player);
    setShowDeletePlayerModal(true);
  };

  // Função para confirmar exclusão
  const handleDeletePlayer = () => {
    if (!playerToDelete) return;

    const updatedPlayers = offlinePlayers.filter(player => player.id !== playerToDelete.id);
    setOfflinePlayers(updatedPlayers);
    
    // Salvar no localStorage
    localStorage.setItem('offline_players', JSON.stringify(updatedPlayers));
    
    setShowDeletePlayerModal(false);
    setPlayerToDelete(null);
    
    alert(`Jogador ${playerToDelete.name} excluído com sucesso!`);
    loadOfflinePlayers();
  };

  // useEffect para carregar jogadores ao iniciar
  React.useEffect(() => {
    loadOfflinePlayers();
  }, []);

  // useEffect para recarregar quando necessário  
  React.useEffect(() => {
    // Verificar se temos jogadores para mostrar
    if (offlinePlayers.length > 0) {
      setShowOfflineSyncNotice(true);
    }
  }, [offlinePlayers.length]);

  // Função para formatar data no formato dd-mm-aaaa
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Se a data está no formato YYYY-MM-DD (ISO), converter para dd-mm-yyyy
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    }
    
    // Se a data está no formato dd/mm/yyyy, converter para dd-mm-yyyy
    if (dateString.includes('/')) {
      return dateString.replace(/\//g, '-');
    }
    
    // Se já está no formato correto, retornar como está
    return dateString;
  };

  const handleRepeatMatch = () => {
    // Encontrar a partida mais recente
    const sortedMatches = [...matches].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    if (sortedMatches.length === 0) {
      alert('Não há partidas anteriores para repetir.');
      return;
    }

    const lastMatch = sortedMatches[0];
    
    // Converter data da partida anterior para Date object (garantindo UTC para evitar problemas de timezone)
    const lastMatchDate = new Date(lastMatch.date + 'T00:00:00.000Z');
    
    // Adicionar exatos 7 dias (7 * 24 * 60 * 60 * 1000 milliseconds)
    const newDate = new Date(lastMatchDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    // Formatar nova data para YYYY-MM-DD (formato do store)
    const newYear = newDate.getUTCFullYear();
    const newMonth = String(newDate.getUTCMonth() + 1).padStart(2, '0');
    const newDay = String(newDate.getUTCDate()).padStart(2, '0');
    const formattedNewDate = `${newYear}-${newMonth}-${newDay}`;

    // Criar nova partida com os mesmos dados, mas 7 dias depois
    addMatch({
      date: formattedNewDate,
      time: lastMatch.time,
      location: lastMatch.location,
      maxPlayers: lastMatch.maxPlayers
    });

    // Formatar data para exibição
    const displayDate = formatDate(formattedNewDate);
    alert(`Partida repetida com sucesso! Nova data: ${displayDate} às ${lastMatch.time}`);
  };

  // Funções para modal de doações
  const openDonationModal = () => {
    setDonationModalOpen(true);
  };

  const closeDonationModal = () => {
    setDonationModalOpen(false);
    setSelectedDonationAmount(2);
    setCustomAmount('');
  };

  const handleDonationAmountSelect = (amount) => {
    setSelectedDonationAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setSelectedDonationAmount(0);
  };

  const processDonation = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedDonationAmount;
    
    if (!amount || amount <= 0) {
      alert('Por favor, selecione um valor válido para a doação.');
      return;
    }

    // Simular processamento de pagamento PIX
    // Em produção, aqui seria integrado com gateway de pagamento
    const pixKey = 'maestros.fc@gmail.com';
    const pixMessage = `Apoio ao Maestros FC - R$ ${amount.toFixed(2)}`;
    
    // Gerar link PIX (simulado)
    const pixData = `00020126580014br.gov.bcb.pix0136${pixKey}0208${pixMessage}5204000053039865802BR5913Maestros FC6009SAO PAULO62070503***6304`;
    
    alert(`Obrigado pelo apoio! 🙏\n\nValor: R$ ${amount.toFixed(2)}\nChave PIX: ${pixKey}\n\nEm breve você receberá o QR Code para pagamento.`);
    
    closeDonationModal();
  };

  // Funções para gerenciar configurações PIX
  const savePixPaymentConfig = () => {
    if (!pixPayment.key.trim()) {
      alert('Por favor, preencha a chave PIX para pagamentos.');
      return;
    }
    
    // Aqui salvaria no localStorage ou banco de dados
    localStorage.setItem('pix_payment_config', JSON.stringify(pixPayment));
    alert('✅ Configuração PIX Pagamentos salva com sucesso!');
  };

  const savePixDonationConfig = () => {
    if (!pixDonation.key.trim()) {
      alert('Por favor, preencha a chave PIX para doações.');
      return;
    }
    
    // Aqui salvaria no localStorage ou banco de dados
    localStorage.setItem('pix_donation_config', JSON.stringify(pixDonation));
    alert('✅ Configuração PIX Doações salva com sucesso!');
  };

  // Load dados das configurações PIX ao carregar página
  useEffect(() => {
    const savedPayment = localStorage.getItem('pix_payment_config');
    const savedDonation = localStorage.getItem('pix_donation_config');
    
    if (savedPayment) {
      setPixPayment(JSON.parse(savedPayment));
    }
    if (savedDonation) {
      setPixDonation(JSON.parse(savedDonation));
    }
  }, []);

  if (!user || user.role !== 'owner') {
    return (
      <div className='p-4 sm:p-6'>
        <Card className="dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className='p-6 text-center space-y-4'>
            <Shield className='w-12 h-12 mx-auto text-red-500' />
            <h2 className='text-lg font-semibold dark:text-zinc-100'>Acesso Restrito</h2>
            <p className='text-sm text-zinc-500 dark:text-zinc-400'>Apenas o dono do grupo tem acesso a esta área.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm rounded-lg mb-4">
        <div className="p-4">
          <div className='flex items-center justify-between'>
            <div className="flex items-center space-x-3">
              <Crown className='w-4 h-4 text-role-owner dark:text-purple-400' />
              <div>
                <h1 className='text-lg font-bold text-gray-900 dark:text-zinc-100'>Dashboard do Dono</h1>
                <p className='text-sm text-gray-600 dark:text-zinc-400'>Painel administrativo completo</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
          <Badge variant="secondary" className='bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'>
            <Crown className='w-3 h-3 mr-1' />
            Owner
          </Badge>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={async () => {
              // Verificar se é o owner principal
              if (user?.id && isMainOwner(user.id)) {
                alert(PROTECTION_MESSAGES.CANNOT_LOGOUT_MAIN_OWNER);
                return;
              }
              
              try {
                await signOut();
                alert('Logout realizado com sucesso!');
                window.location.href = '/';
              } catch (error) {
                console.error('Erro ao fazer logout:', error);
                alert('Erro ao fazer logout');
              }
            }}
            disabled={user?.id ? isMainOwner(user.id) : false}
            className={`${user?.id && isMainOwner(user.id) ? 'opacity-50 cursor-not-allowed' : ''} dark:bg-red-600 dark:hover:bg-red-700`}
            title={user?.id && isMainOwner(user.id) ? PROTECTION_MESSAGES.CANNOT_LOGOUT_MAIN_OWNER : 'Sair da conta'}
          >
            <LogOut className='w-4 h-4 mr-2' />
            Sair
          </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Cards de Resumo */}
      <div className='grid grid-cols-2 gap-4'>
        <Card className="dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-600 dark:text-zinc-400'>Próximos Jogos</p>
                <p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{matches.length}</p>
              </div>
              <Calendar className='w-8 h-8 text-blue-500 dark:text-blue-400' />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-600 dark:text-zinc-400'>Jogadores Ativos</p>
                <p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{dashboardData.players.filter(p => p.status === 'active').length}</p>
              </div>
              <Users className='w-8 h-8 text-green-500 dark:text-green-400' />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-600 dark:text-zinc-400'>Receita do Mês</p>
                <p className='text-2xl font-bold text-green-600 dark:text-green-400'>R$ {dashboardData.financialStatus.paid}</p>
              </div>
              <DollarSign className='w-8 h-8 text-green-500 dark:text-green-400' />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-800 dark:border-zinc-700">
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-600 dark:text-zinc-400'>Pendentes</p>
                <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>R$ {dashboardData.financialStatus.pending}</p>
              </div>
              <Clock className='w-8 h-8 text-orange-500 dark:text-orange-400' />
            </div>
          </CardContent>
        </Card>

        {/* Card de Apoio ao Artista - Condicional */}
        {config.showInDashboard && config.enabledCards.helpArtist && (
          <Card className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 border-pink-200 dark:border-pink-800 hover:shadow-md transition-shadow cursor-pointer" onClick={openDonationModal}>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-pink-600 dark:text-pink-400 font-medium'>Ajude o Artista</p>
                  <p className='text-lg font-bold text-pink-800 dark:text-pink-300'>Apoie o projeto</p>
                </div>
                <Heart className='w-8 h-8 text-pink-500 dark:text-pink-400' />
              </div>
              <div className='mt-2'>
                <p className='text-xs text-pink-600 dark:text-pink-400'>Clique para contribuir</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de Café para o Dev - Condicional */}
        {config.showInDashboard && config.enabledCards.coffeeForDev && (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow cursor-pointer" onClick={openDonationModal}>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-amber-600 dark:text-amber-400 font-medium'>Café pro Dev</p>
                  <p className='text-lg font-bold text-amber-800 dark:text-amber-300'>Energize o código</p>
                </div>
                <Coffee className='w-8 h-8 text-amber-500 dark:text-amber-400' />
              </div>
              <div className='mt-2'>
                <p className='text-xs text-amber-600 dark:text-amber-400'>Combustível para inovar</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full dark:bg-zinc-800 dark:border-zinc-700 flex items-center justify-center">
          <TabsTrigger value="overview" className="flex-1 flex items-center gap-1 sm:gap-2 dark:data-[state=active]:bg-zinc-700 dark:text-zinc-300 dark:data-[state=active]:text-zinc-100">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex-1 flex items-center gap-1 sm:gap-2 dark:data-[state=active]:bg-zinc-700 dark:text-zinc-300 dark:data-[state=active]:text-zinc-100">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Partidas</span>
          </TabsTrigger>
          <TabsTrigger value="players" className="flex-1 flex items-center gap-1 sm:gap-2 dark:data-[state=active]:bg-zinc-700 dark:text-zinc-300 dark:data-[state=active]:text-zinc-100">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Jogadores</span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex-1 flex items-center gap-1 sm:gap-2 dark:data-[state=active]:bg-zinc-700 dark:text-zinc-300 dark:data-[state=active]:text-zinc-100">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 flex items-center gap-1 sm:gap-2 dark:data-[state=active]:bg-zinc-700 dark:text-zinc-300 dark:data-[state=active]:text-zinc-100">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="pix" className="flex-1 flex items-center gap-1 sm:gap-2 dark:data-[state=active]:bg-zinc-700 dark:text-zinc-300 dark:data-[state=active]:text-zinc-100">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">PIX</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 flex items-center gap-1 sm:gap-2 dark:data-[state=active]:bg-zinc-700 dark:text-zinc-300 dark:data-[state=active]:text-zinc-100">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">

          {/* Situação Financeira */}
          <Card className="dark:bg-zinc-800 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className='flex items-center gap-2 dark:text-zinc-100'>
                <DollarSign className='w-5 h-5' />
                Situação Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-600 dark:text-zinc-400'>Total do Mês:</span>
                  <span className='font-semibold text-zinc-900 dark:text-zinc-100'>R$ {dashboardData.financialStatus.totalThisMonth}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-600 dark:text-zinc-400'>Pagos:</span>
                  <span className='font-semibold text-green-600 dark:text-green-400'>R$ {dashboardData.financialStatus.paid}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-600 dark:text-zinc-400'>Pendentes:</span>
                  <span className='font-semibold text-orange-600 dark:text-orange-400'>R$ {dashboardData.financialStatus.pending}</span>
                </div>
                <div className='w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2'>
                  <div 
                    className='bg-green-500 h-2 rounded-full' 
                    style={{ 
                      width: `${(dashboardData.financialStatus.paid / dashboardData.financialStatus.totalThisMonth) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagamentos Recentes */}
          <Card className="dark:bg-zinc-800 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className='flex items-center gap-2 dark:text-zinc-100'>
                <CreditCard className='w-5 h-5' />
                Pagamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {dashboardData.recentPayments.map((payment) => (
                  <div key={payment.id} className='flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700'>
                    <div>
                      <p className='font-medium text-zinc-900 dark:text-zinc-100'>{payment.player}</p>
                      <p className='text-sm text-zinc-600 dark:text-zinc-400'>{payment.date}</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold dark:text-zinc-100'>R$ {payment.amount}</p>
                      <Badge 
                        variant={payment.status === 'paid' ? 'default' : 'secondary'}
                        className={payment.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'}
                      >
                        {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Funcionalidades de Dono */}
          <Card className="dark:bg-zinc-800 dark:border-zinc-700">
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold mb-4 flex items-center dark:text-zinc-100'>
                <Shield className='w-5 h-5 mr-2 text-purple-600 dark:text-purple-400' />
                Funcionalidades de Dono
              </h3>
              <div className='space-y-3'>
                <div className='p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
                  <p className='font-medium text-purple-900 dark:text-purple-300'>👑 Acesso Total</p>
                  <p className='text-sm text-purple-700 dark:text-purple-400'>Você tem acesso completo a todas as funcionalidades do sistema</p>
                </div>
                <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                  <p className='font-medium text-blue-900 dark:text-blue-300'>🛡️ Gerenciamento</p>
                  <p className='text-sm text-blue-700 dark:text-blue-400'>Pode gerenciar usuários, convites e configurações</p>
                </div>
                <div className='p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                  <p className='font-medium text-green-900 dark:text-green-300'>📊 Relatórios</p>
                  <p className='text-sm text-green-700 dark:text-green-400'>Acesso a relatórios e estatísticas completas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestão de Partidas */}
        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span className='flex items-center gap-2'>
                  <Calendar className='w-5 h-5' />
                  Gestão de Partidas
                </span>
                <Button onClick={openCreateModal}>
                  <Plus className='w-4 h-4 mr-2' />
                  Nova Partida
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {matches.map((match) => (
                  <div key={match.id} className='p-4 border rounded-lg space-y-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold truncate'>{match.location}</h3>
                        <p className='text-sm text-zinc-500'>{formatDate(match.date)} às {match.time}</p>
                      </div>
                    </div>
                    
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-zinc-500'>Vagas</p>
                        <p className='font-semibold'>{match.confirmedPlayers}/{match.maxPlayers}</p>
                      </div>
                      <div>
                        <p className='text-sm text-zinc-500'>Status</p>
                        <Badge variant={match.status === 'open' ? 'default' : 'secondary'}>
                          {match.status === 'open' ? 'Aberto' : 'Fechado'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className='flex items-center justify-end gap-1'>
                      <Button size="sm" variant="outline" className='h-8 w-8 p-0' onClick={() => openEditModal(match)}>
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button size="sm" variant="outline" className='h-8 w-8 p-0' onClick={() => openDeleteModal(match)}>
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>

                    <div className='flex gap-2'>
                      <Button size="sm" variant="outline" className='flex-1'>
                        <UserCheck className='w-4 h-4 mr-2' />
                        Check-in
                      </Button>
                      <Button size="sm" variant="outline" className='flex-1'>
                        <Settings className='w-4 h-4 mr-2' />
                        Configurar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Controle de Jogadores */}
        <TabsContent value="players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <span className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  Controle de Jogadores
                </span>
                <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                  <Button onClick={() => setShowAddPlayerModal(true)} className="w-full sm:w-auto">
                    <Plus className='w-4 h-4 mr-2' />
                    Adicionar Jogador
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPlayerFilters(!showPlayerFilters)}
                    className="w-full sm:w-auto"
                  >
                    <Settings className='w-4 h-4 mr-2' />
                    Filtros
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filtros de Jogadores */}
              {showPlayerFilters && (
                <div className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role-filter">Filtrar por Role</Label>
                      <select
                        id="role-filter"
                        value={playerRoleFilter}
                        onChange={(e) => setPlayerRoleFilter(e.target.value)}
                        className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="">Todos</option>
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="aux">Auxiliar</option>
                        <option value="mensalista">Mensalista</option>
                        <option value="diarista">Diarista</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="search-player">Buscar Jogador</Label>
                      <Input
                        id="search-player"
                        placeholder="Digite o nome..."
                        value={playerSearchTerm}
                        onChange={(e) => setPlayerSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status-filter">Status</Label>
                      <select
                        id="status-filter"
                        value={playerStatusFilter}
                        onChange={(e) => setPlayerStatusFilter(e.target.value)}
                        className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="">Todos</option>
                        <option value="active">Ativo</option>
                        <option value="pending">Pendente</option>
                        <option value="inactive">Inativo</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => clearPlayerFilters()}
                        className="w-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Jogadores */}
              <div className='space-y-3'>
                {filteredOfflinePlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                      {offlinePlayers.length === 0 ? 'Nenhum jogador cadastrado' : 'Nenhum jogador encontrado'}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                      {offlinePlayers.length === 0 
                        ? 'Adicione o primeiro jogador para começar.' 
                        : 'Tente ajustar os filtros de busca.'}
                    </p>
                    {offlinePlayers.length === 0 && (
                      <Button onClick={() => setShowAddPlayerModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Jogador
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredOfflinePlayers.map((player) => (
                    <div key={player.id} className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 gap-3'>
                      <div className='flex items-center gap-3 flex-1 min-w-0'>
                        <div className='w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0'>
                          {player.avatar_url || player.custom_avatar ? (
                            <img 
                              src={player.avatar_url || player.custom_avatar} 
                              alt={player.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className='w-5 h-5 text-zinc-600 dark:text-zinc-400' />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className='font-medium text-zinc-900 dark:text-zinc-100 truncate'>{player.name}</p>
                          <p className='text-sm text-zinc-600 dark:text-zinc-400 truncate'>{player.email}</p>
                          {player.position && (
                            <p className='text-xs text-zinc-500 dark:text-zinc-500'>{player.position}</p>
                          )}
                          {/* Exibir estrelas na lista - otimizado para mobile */}
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: Math.min(5, player.stars || 5) }, (_, index) => (
                              <span
                                key={index}
                                className={`text-xs ${index < (player.stars || 5) ? 'text-yellow-500' : 'text-zinc-300 dark:text-zinc-600'}`}
                              >
                                ⭐
                              </span>
                            ))}
                            {/* Indicador compacto do nível */}
                            <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {player.stars || 5}/10
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge 
                          variant="outline"
                          className={
                            player.role === 'owner' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                            player.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            player.role === 'aux' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            player.role === 'mensalista' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }
                        >
                          {player.role === 'owner' ? '👑 Owner' :
                         player.role === 'admin' ? '🛡️ Admin' :
                         player.role === 'aux' ? '⚡ Auxiliar' :
                         player.role === 'mensalista' ? '⭐ Mensalista' : 
                         '🔹 Diarista'}
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openEditPlayerModal(player)}
                            className="h-8 px-2"
                          >
                            <Edit className='w-4 h-4' />
                          </Button>
                          {player.id !== user?.id && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => openDeletePlayerModal(player)}
                              className="h-8 px-2"
                            >
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Info sobre jogadores offline */}
              {offlinePlayers.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📱 <strong>Modo Offline:</strong> {offlinePlayers.length} jogador(es) armazenados localmente. 
                    {showOfflineSyncNotice && (
                      <span className="block mt-1">
                        Para sincronizar com cloud, conecte-se à internet.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="finance" className="space-y-4">
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='w-5 h-5' />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-zinc-600 dark:text-zinc-400'>Receita Total:</span>
                    <span className='font-semibold text-green-600 dark:text-green-400'>R$ {dashboardData.financialStatus.totalThisMonth}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-zinc-600 dark:text-zinc-400'>Confirmados:</span>
                    <span className='font-semibold text-green-600 dark:text-green-400'>R$ {dashboardData.financialStatus.paid}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-zinc-600 dark:text-zinc-400'>Pendentes:</span>
                    <span className='font-semibold text-orange-600 dark:text-orange-400'>R$ {dashboardData.financialStatus.pending}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='w-5 h-5' />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button className='w-full' variant="outline">
                  <Settings className='w-4 h-4 mr-2' />
                  Valores Mensalidade
                </Button>
                <Button className='w-full' variant="outline">
                  <Settings className='w-4 h-4 mr-2' />
                  Valores Diária
                </Button>
                <Button className='w-full' variant="outline">
                  <FileText className='w-4 h-4 mr-2' />
                  Extrato Completo
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='w-5 h-5' />
                Pagamentos em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {dashboardData.recentPayments.map((payment) => (
                  <div key={payment.id} className='flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-3 h-3 rounded-full ${
                        payment.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'
                      }`}></div>
                      <div>
                        <p className='font-medium text-zinc-900 dark:text-zinc-100'>{payment.player}</p>
                        <p className='text-sm text-zinc-600 dark:text-zinc-400'>{payment.date}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>R$ {payment.amount}</p>
                      <Badge 
                        variant={payment.status === 'paid' ? 'default' : 'secondary'}
                        className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {payment.status === 'paid' ? 'Confirmado' : 'Aguardando'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Dashboard */}
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard />
        </TabsContent>

        {/* Configurações PIX */}
        <TabsContent value="pix" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PIX Pagamentos */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <DollarSign className="w-5 h-5" />
                  PIX Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-pix-key">Chave PIX</Label>
                    <Input
                      id="payment-pix-key"
                      value={pixPayment.key}
                      onChange={(e) => setPixPayment({...pixPayment, key: e.target.value})}
                      placeholder="exemplo@email.com ou 11999999999"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-account-name">Nome da Conta</Label>
                    <Input
                      id="payment-account-name"
                      value={pixPayment.accountName}
                      onChange={(e) => setPixPayment({...pixPayment, accountName: e.target.value})}
                      placeholder="Conta João - Pagamentos"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-description">Descrição</Label>
                    <Input
                      id="payment-description"
                      value={pixPayment.description}
                      onChange={(e) => setPixPayment({...pixPayment, description: e.target.value})}
                      placeholder="Para receber mensalidades e diárias"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={savePixPaymentConfig}
                  >
                    Salvar Configuração
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    ✅ Esta conta receberá <strong>mensalidades</strong> e <strong>diárias</strong> dos membros.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* PIX Doações */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50 dark:bg-green-900/20">
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                  <Heart className="w-5 h-5" />
                  PIX Doações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="donation-pix-key">Chave PIX</Label>
                    <Input
                      id="donation-pix-key"
                      value={pixDonation.key}
                      onChange={(e) => setPixDonation({...pixDonation, key: e.target.value})}
                      placeholder="exemplo@email.com ou 11999999999"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donation-account-name">Nome da Conta</Label>
                    <Input
                      id="donation-account-name"
                      value={pixDonation.accountName}
                      onChange={(e) => setPixDonation({...pixDonation, accountName: e.target.value})}
                      placeholder="Conta Maria - Doações"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donation-description">Descrição</Label>
                    <Input
                      id="donation-description"
                      value={pixDonation.description}
                      onChange={(e) => setPixDonation({...pixDonation, description: e.target.value})}
                      placeholder="Para receber doações dos apoiadores"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={savePixDonationConfig}
                  >
                    Salvar Configuração
                  </Button>
                </div>
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ❤️ Esta conta receberá <strong>doações</strong> dos apoiadores.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status das Contas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Status das Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-blue-800">PIX Pagamentos</h4>
                    <p className="text-sm text-blue-600">
                      {pixPayment.key ? `Configurado: ***${pixPayment.key.slice(-4)}` : 'Não configurado'}
                    </p>
                  </div>
                  <Badge variant="secondary" className={pixPayment.key ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {pixPayment.key ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-800">PIX Doações</h4>
                    <p className="text-sm text-green-600">
                      {pixDonation.key ? `Configurado: ***${pixDonation.key.slice(-4)}` : 'Não configurado'}
                    </p>
                  </div>
                  <Badge variant="secondary" className={pixDonation.key ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {pixDonation.key ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Avançadas */}
        <TabsContent value="settings" className="space-y-4">
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='w-5 h-5' />
                  Permissões do Grupo
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                     <Button 
                       className='w-full' 
                       variant="outline"
                       onClick={() => setInviteModalOpen(true)}
                     >
                       <Mail className='w-4 h-4 mr-2' />
                       Criar Convites/Gerenciar
                     </Button>
                     <Button 
                       className='w-full' 
                       variant="outline"
                       onClick={() => window.location.href = '/manage-admins'}
                     >
                       <Users className='w-4 h-4 mr-2' />
                       Gerenciar Admins
                     </Button>
                     <Button 
                       className='w-full' 
                       variant="outline"
                       onClick={() => window.location.href = '/configure-access'}
                     >
                       <Shield className='w-4 h-4 mr-2' />
                       Configurar Acessos
                     </Button>
                     <Button 
                       className='w-full'
                       variant="outline"
                       onClick={() => window.location.href = '/approve-participants'}
                     >
                       <UserCheck className='w-4 h-4 mr-2' />
                       Aprovar Participantes
                     </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Bell className='w-5 h-5' />
                  Integrações
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button className='w-full' variant="outline">
                  <Bell className='w-4 h-4 mr-2' />
                  Notificações Push
                </Button>
                <Button className='w-full' variant="outline">
                  <Settings className='w-4 h-4 mr-2' />
                  Updates Automáticos
                </Button>
                <Button className='w-full' variant="outline">
                  <FileText className='w-4 h-4 mr-2' />
                  Logs do Sistema
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Heart className='w-5 h-5' />
                Configurações de Doação
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor="show-home" className='text-sm font-medium'>
                    Exibir na Página Inicial
                  </Label>
                  <Switch
                    id="show-home"
                    checked={config.showInHome}
                    onCheckedChange={toggleHomeDisplay}
                  />
                </div>
                
                <div className='flex items-center justify-between'>
                  <Label htmlFor="show-dashboard" className='text-sm font-medium'>
                    Exibir no Dashboard
                  </Label>
                  <Switch
                    id="show-dashboard"
                    checked={config.showInDashboard}
                    onCheckedChange={toggleDashboardDisplay}
                  />
                </div>
                
                <div className='border-t pt-3 space-y-3'>
                  <h4 className='text-sm font-medium text-muted-foreground'>Cards Disponíveis</h4>
                  
                  <div className='flex items-center justify-between'>
                    <Label htmlFor="help-artist" className='text-sm font-medium flex items-center gap-2'>
                      <Heart className='w-4 h-4' />
                      Ajude o Artista
                    </Label>
                    <Switch
                      id="help-artist"
                      checked={config.enabledCards.helpArtist}
                      onCheckedChange={toggleHelpArtistCard}
                    />
                  </div>
                  
                  <div className='flex items-center justify-between'>
                    <Label htmlFor="coffee-dev" className='text-sm font-medium flex items-center gap-2'>
                      <Coffee className='w-4 h-4' />
                      Café pro Dev
                    </Label>
                    <Switch
                      id="coffee-dev"
                      checked={config.enabledCards.coffeeForDev}
                      onCheckedChange={toggleCoffeeForDevCard}
                    />
                  </div>
                </div>
                
                <div className='border-t pt-3'>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetToDefaults}
                    className='w-full'
                  >
                    <Repeat className='w-4 h-4 mr-2' />
                    Restaurar Padrões
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Trophy className='w-5 h-5' />
                Ranking & Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Button className='w-full' variant="outline">
                <Trophy className='w-4 h-4 mr-2' />
                Ranking de Jogadores
              </Button>
              <Button className='w-full' variant="outline">
                <BarChart3 className='w-4 h-4 mr-2' />
                Histórico de Partidas
              </Button>
              <Button className='w-full' variant="outline">
                <TrendingUp className='w-4 h-4 mr-2' />
                Relatórios Avançados
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição de Jogo */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-zinc-800 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-zinc-100">
              <Edit className="w-5 h-5" />
              Editar Jogo
            </DialogTitle>
            <DialogDescription className="dark:text-zinc-400">
              Faça as alterações necessárias nos dados do jogo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right dark:text-zinc-300">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                className="col-span-3 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right dark:text-zinc-300">
                Horário
              </Label>
              <Input
                id="time"
                type="time"
                value={editForm.time}
                onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                className="col-span-3 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right dark:text-zinc-300">
                Local
              </Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Campo do Flamengo"
                className="col-span-3 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder-zinc-400"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxPlayers" className="text-right dark:text-zinc-300">
                Vagas
              </Label>
              <Input
                id="maxPlayers"
                type="number"
                min="10"
                max="30"
                value={editForm.maxPlayers}
                onChange={(e) => setEditForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 22 }))}
                className="col-span-3 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal} className="dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={saveMatchChanges} className="dark:bg-blue-600 dark:hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-zinc-800 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-zinc-100">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="dark:text-zinc-400">
              Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {matchToDelete && (
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-300">{matchToDelete.location}</h3>
                <p className="text-sm text-red-700 dark:text-red-400">{matchToDelete.date} às {matchToDelete.time}</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {matchToDelete.confirmedPlayers} jogadores confirmados
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal} className="dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMatch} className="dark:bg-red-600 dark:hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Partida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação de Partida */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md dark:bg-zinc-800 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-zinc-100">
              <Plus className="w-5 h-5" />
              Nova Partida
            </DialogTitle>
            <DialogDescription className="dark:text-zinc-400">
              Preencha os dados para criar uma nova partida.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-date" className="dark:text-zinc-300">Data</Label>
                <Input
                  id="create-date"
                  type="date"
                  value={createForm.date}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, date: e.target.value }))}
                  className="dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
                />
              </div>
              <div>
                <Label htmlFor="create-time" className="dark:text-zinc-300">Horário</Label>
                <Input
                  id="create-time"
                  type="time"
                  value={createForm.time}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, time: e.target.value }))}
                  className="dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="create-location" className="dark:text-zinc-300">Local (Endereço)</Label>
              <Input
                id="create-location"
                placeholder="Ex: Rua das Flores, 123 - Bairro, Cidade - Estado"
                value={createForm.location}
                onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                className="dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder-zinc-400"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                💡 Cole aqui o endereço completo do Google Maps para facilitar a navegação
              </p>
            </div>
            
            <div>
              <Label htmlFor="create-maxPlayers" className="dark:text-zinc-300">Número de Vagas</Label>
              <Input
                id="create-maxPlayers"
                type="number"
                min="10"
                max="30"
                value={createForm.maxPlayers}
                onChange={(e) => setCreateForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 22 }))}
                className="dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeCreateModal} className="dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleCreateMatch}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Partida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Detalhes */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalhes da Partida
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre a partida selecionada.
            </DialogDescription>
          </DialogHeader>
          
          {viewingMatch && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Data e Horário</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {formatDate(viewingMatch.date)} às {viewingMatch.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Local</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {viewingMatch.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">Participantes</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {viewingMatch.confirmedPlayers} de {viewingMatch.maxPlayers} confirmados
                    </p>
                  </div>
                </div>
              </div>

              {/* Status da Partida */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Status:</span>
                  <Badge variant={viewingMatch.status === 'open' ? 'default' : 'secondary'}>
                    {viewingMatch.status === 'open' ? 'Aberto para Inscrições' : 'Fechado'}
                  </Badge>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Vagas Preenchidas</span>
                  <span className="font-medium">
                    {Math.round((viewingMatch.confirmedPlayers / viewingMatch.maxPlayers) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${(viewingMatch.confirmedPlayers / viewingMatch.maxPlayers) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Informações Importantes
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      • Chegue 15 minutos antes do horário marcado<br/>
                      • Traga água e equipamentos necessários<br/>
                      • Em caso de chuva, verifique o grupo para atualizações
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeViewModal}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Doações */}
      <Dialog open={donationModalOpen} onOpenChange={setDonationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Ajude o Artista
            </DialogTitle>
            <DialogDescription>
              Seu apoio ajuda a manter e melhorar o Maestros FC. Escolha um valor que considera justo para contribuir com o projeto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Valores Sugeridos */}
             <div>
               <Label className="text-sm font-medium text-zinc-700">Valores Sugeridos</Label>
               <div className="grid grid-cols-3 gap-2 mt-2">
                 {[2, 5, 10].map((amount) => (
                   <Button
                     key={amount}
                     variant={selectedDonationAmount === amount ? "default" : "outline"}
                     className={`h-12 ${selectedDonationAmount === amount ? 'bg-pink-500 hover:bg-pink-600' : 'hover:bg-pink-50'}`}
                     onClick={() => handleDonationAmountSelect(amount)}
                   >
                     R$ {amount}
                   </Button>
                 ))}
               </div>
               <div className="grid grid-cols-3 gap-2 mt-2">
                 {[15, 20, 30].map((amount) => (
                   <Button
                     key={amount}
                     variant={selectedDonationAmount === amount ? "default" : "outline"}
                     className={`h-12 ${selectedDonationAmount === amount ? 'bg-pink-500 hover:bg-pink-600' : 'hover:bg-pink-50'}`}
                     onClick={() => handleDonationAmountSelect(amount)}
                   >
                     R$ {amount}
                   </Button>
                 ))}
               </div>
             </div>

            {/* Valor Personalizado */}
            <div>
              <Label htmlFor="customAmount" className="text-sm font-medium text-zinc-700">
                Ou digite um valor personalizado
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500">R$</span>
                <Input
                  id="customAmount"
                  type="number"
                  placeholder="0,00"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="pl-10"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Transparência */}
            <div className="bg-zinc-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Coffee className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">Como usamos sua contribuição:</p>
                  <ul className="text-xs text-zinc-600 mt-1 space-y-1">
                    <li>• Hospedagem e infraestrutura do app</li>
                    <li>• Desenvolvimento de novas funcionalidades</li>
                    <li>• Manutenção e suporte técnico</li>
                    <li>• Café para o desenvolvedor 😄</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Valor Total */}
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-pink-800">Total a contribuir:</span>
                <span className="text-xl font-bold text-pink-600">
                  R$ {(customAmount ? parseFloat(customAmount) || 0 : selectedDonationAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDonationModal}>
              Cancelar
            </Button>
            <Button 
              onClick={processDonation}
              className="bg-pink-500 hover:bg-pink-600"
              disabled={!selectedDonationAmount && !customAmount}
            >
              <Heart className="w-4 h-4 mr-2" />
              Contribuir via PIX
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Completo de Convites */}
      <CompleteInviteModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen} 
      />

      {/* ============ MODAIS DE GERENCIAMENTO DE JOGADORES ============ */}

      {/* Modal Adicionar Jogador */}
      <Dialog open={showAddPlayerModal} onOpenChange={setShowAddPlayerModal}>
        <DialogContent className="sm:max-w-[500px] dark:bg-zinc-800 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-zinc-100">
              <Users className="w-5 h-5" />
              Adicionar Novo Jogador
            </DialogTitle>
            <DialogDescription className="dark:text-zinc-400">
              Preencha as informações do jogador para adicioná-lo ao sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="player-name" className="text-sm sm:text-right font-medium">
                Nome *
              </Label>
              <Input
                id="player-name"
                value={playerForm.name}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="player-email" className="text-sm sm:text-right font-medium">
                Email *
              </Label>
              <Input
                id="player-email"
                type="email"
                value={playerForm.email}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="jogador@email.com"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="player-role" className="text-sm sm:text-right font-medium">
                Função
              </Label>
              <select
                id="player-role"
                value={playerForm.role}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, role: e.target.value }))}
                className="col-span-3 p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              >
                <option value="diarista">Diarista</option>
                <option value="mensalista">Mensalista</option>
                <option value="aux">Auxiliar</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="player-position" className="text-sm sm:text-right font-medium">
                Posição
              </Label>
              <select
                id="player-position"
                value={playerForm.position}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, position: e.target.value }))}
                className="col-span-3 p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              >
                <option value="Goleiro">Goleiro</option>
                <option value="Zagueiro">Zagueiro</option>
                <option value="Meio">Meio</option>
                <option value="Atacante">Atacante</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="player-size" className="text-sm sm:text-right font-medium">
                Tamanho
              </Label>
              <select
                id="player-size"
                value={playerForm.shirt_size}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, shirt_size: e.target.value }))}
                className="col-span-3 p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              >
                <option value="G">G</option>
                <option value="GG">GG</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
              <Label htmlFor="player-stars" className="text-sm sm:text-right font-medium mt-1">
                Estrelas (Habilidades)
              </Label>
              <div className="col-span-3 space-y-2">
                {/* Container das estrelas otimizado para mobile */}
                <div className="flex items-center gap-1 flex-wrap">
                  {Array.from({ length: 10 }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPlayerForm(prev => ({ ...prev, stars: index + 1 }))}
                      className={`p-1 transition-colors touch-manipulation ${index < playerForm.stars ? 'text-yellow-500' : 'text-zinc-300 dark:text-zinc-600 hover:text-yellow-400'}`}
                    >
                      <Star 
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${index < playerForm.stars ? 'fill-current' : ''}`} 
                      />
                    </button>
                  ))}
                </div>
                {/* Contador compacto */}
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    Avaliação: <span className="font-semibold text-yellow-600 dark:text-yellow-400">{playerForm.stars}/10</span>
                  </span>
                  {/* Indicador visual para a faixa de avaliação */}
                  <div className="flex items-center text-xs">
                    {(playerForm.stars <= 3) && <span className="text-red-500">🟢 Iniciante</span>}
                    {(playerForm.stars >= 4 && playerForm.stars <= 6) && <span className="text-yellow-500">🟡 Intermediário</span>}
                    {(playerForm.stars >= 7 && playerForm.stars <= 8) && <span className="text-blue-500">🔵 Avançado</span>}
                    {(playerForm.stars >= 9) && <span className="text-purple-500">🟣 Elitte</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPlayerModal(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleAddPlayer}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Jogador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Jogador - Otimizado para Mobile */}
      <Dialog open={showEditPlayerModal} onOpenChange={setShowEditPlayerModal}>
        <DialogContent className="w-[95%] mx-auto max-w-[500px] max-h-[90vh] overflow-y-auto dark:bg-zinc-800 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-zinc-100 text-lg sm:text-xl">
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              Editar Jogador
            </DialogTitle>
            <DialogDescription className="dark:text-zinc-400 text-sm">
              Atualize as informações do jogador selecionado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Nome - Layout Mobile Optimizado */}
            <div className="space-y-2">
              <Label htmlFor="edit-player-name" className="text-sm font-medium block">
                Nome *
              </Label>
              <Input
                id="edit-player-name"
                value={playerForm.name}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
                className="w-full"
              />
            </div>

            {/* Email - Layout Mobile Optimizado */}
            <div className="space-y-2">
              <Label htmlFor="edit-player-email" className="text-sm font-medium block">
                Email *
              </Label>
              <Input
                id="edit-player-email"
                type="email"
                value={playerForm.email}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="jogador@email.com"
                className="w-full"
              />
            </div>

            {/* Função e Posição - Grid 2 colunas em mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-player-role" className="text-sm font-medium block">
                  Função
                </Label>
                <select
                  id="edit-player-role"
                  value={playerForm.role}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                >
                  <option value="diarista">Diarista</option>
                  <option value="mensalista">Mensalista</option>
                  <option value="aux">Auxiliar</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-player-position" className="text-sm font-medium block">
                  Posição
                </Label>
                <select
                  id="edit-player-position"
                  value={playerForm.position}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm"
                >
                  <option value="Goleiro">Goleiro</option>
                  <option value="Zagueiro">Zagueiro</option>
                  <option value="Meio">Meio</option>
                  <option value="Atacante">Atacante</option>
                </select>
              </div>
            </div>

            {/* Tamanho da Camisa - Layout Mobile Optimizado */}
            <div className="space-y-2">
              <Label htmlFor="edit-player-size" className="text-sm font-medium block">
                Tamanho da Camisa
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlayerForm(prev => ({ ...prev, shirt_size: 'G' }))}
                  className={`p-3 border rounded-lg text-sm transition-colors ${
                    playerForm.shirt_size === 'G' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-600'
                  }`}
                >
                  G
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerForm(prev => ({ ...prev, shirt_size: 'GG' }))}
                  className={`p-3 border rounded-lg text-sm transition-colors ${
                    playerForm.shirt_size === 'GG' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-600'
                  }`}
                >
                  GG
                </button>
              </div>
            </div>

            {/* Estrelas - Layout Mobile Optimizado */}
            <div className="space-y-3">
              <Label htmlFor="edit-player-stars" className="text-sm font-medium block">
                Nível de Habilidade
              </Label>
              
              {/* Container das estrelas otimizado para mobile */}
              <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  {Array.from({ length: 10 }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPlayerForm(prev => ({ ...prev, stars: index + 1 }))}
                      className={`p-2 transition-colors touch-manipulation rounded-lg ${
                        index < playerForm.stars 
                          ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                          : 'text-zinc-300 dark:text-zinc-600 hover:text-yellow-400 hover:bg-zinc-100 dark:hover:bg-zinc-600'
                      }`}
                    >
                      <Star 
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${index < playerForm.stars ? 'fill-current' : ''}`} 
                      />
                    </button>
                  ))}
                </div>
                
                {/* Informações do nível */}
                <div className="space-y-2 text-center">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Avaliação: <span className="text-yellow-600 dark:text-yellow-400 font-bold">{playerForm.stars}/10</span>
                  </div>
                  
                  {/* Indicador visual para a faixa de avaliação */}
                  <div className="text-xs">
                    {(playerForm.stars <= 3) && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                        🟢 Iniciante
                      </div>
                    )}
                    {(playerForm.stars >= 4 && playerForm.stars <= 6) && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                        🟡 Intermediário
                      </div>
                    )}
                    {(playerForm.stars >= 7 && playerForm.stars <= 8) && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        🔵 Avançado
                      </div>
                    )}
                    {(playerForm.stars >= 9) && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        🟣 Elite
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer otimizado para mobile */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowEditPlayerModal(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleEditPlayer}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Exclusão de Jogador */}
      <Dialog open={showDeletePlayerModal} onOpenChange={setShowDeletePlayerModal}>
        <DialogContent className="sm:max-w-[425px] dark:bg-zinc-800 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-zinc-100">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Confirmar Exclusão de Jogador
            </DialogTitle>
            <DialogDescription className="dark:text-zinc-400">
              Tem certeza que deseja excluir este jogador? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {playerToDelete && (
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-300">{playerToDelete.name}</h3>
                <p className="text-sm text-red-700 dark:text-red-400">{playerToDelete.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      playerToDelete.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      playerToDelete.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                      playerToDelete.role === 'aux' ? 'bg-green-100 text-green-800' :
                      playerToDelete.role === 'mensalista' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {playerToDelete.role === 'owner' ? '👑 Owner' :
                     playerToDelete.role === 'admin' ? '🛡️ Admin' :
                     playerToDelete.role === 'aux' ? '⚡ Auxiliar' :
                     playerToDelete.role === 'mensalista' ? '⭐ Mensalista' : 
                     '🔹 Diarista'}
                  </Badge>
                  <span className="text-xs text-red-600 dark:text-red-400">{playerToDelete.position}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePlayerModal(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletePlayer}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Jogador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
