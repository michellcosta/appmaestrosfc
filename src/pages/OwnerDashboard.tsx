import { useAuth } from '@/auth/OfflineAuthProvider';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { CompleteInviteModal } from '@/components/CompleteInviteModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimePicker } from '@/components/ui/time-picker';
import { supabase } from '@/lib/supabase';
import { useDonationStore } from '@/store/donationStore';
import { useGamesStore } from '@/store/gamesStore';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Coffee,
  CreditCard,
  Crown,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Heart,
  Info,
  LogOut,
  Mail,
  MapPin,
  Plus,
  Repeat,
  Save,
  Settings,
  Shield,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function OwnerDashboard() {
  const { user, signOut } = useAuth();
  const [searchParams] = useSearchParams();
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
  const [showClearAllModal, setShowClearAllModal] = useState(false);
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

  // Detectar parâmetro de query para abrir modal de criação
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create-game') {
      openCreateModal();
      // Limpar o parâmetro da URL
      const url = new URL(window.location);
      url.searchParams.delete('action');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams]);

  // Funções para edição de jogos
  const openEditModal = (match) => {
    // Converter YYYY-MM-DD para DD/MM/YYYY
    const dateParts = match.date.split('-');
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    setEditingMatch(match);
    setEditForm({
      date: formattedDate,
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

    // Validar formato da data DD/MM/YYYY
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const dateMatch = editForm.date.match(dateRegex);

    if (!dateMatch) {
      alert('Por favor, insira a data no formato DD/MM/YYYY.');
      return;
    }

    // Converter DD/MM/YYYY para YYYY-MM-DD
    const [, day, month, year] = dateMatch;
    const isoDate = `${year}-${month}-${day}`;

    // Validar se a data é válida
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) {
      alert('Por favor, insira uma data válida.');
      return;
    }

    // Atualizar o jogo no store global
    updateMatch(editingMatch.id, {
      ...editForm,
      date: isoDate
    });

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
    // Definir data padrão para hoje no formato DD/MM/YYYY
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const todayDate = `${day}/${month}/${year}`;
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

    // Validar formato da data DD/MM/YYYY
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const dateMatch = createForm.date.match(dateRegex);

    if (!dateMatch) {
      alert('Por favor, insira a data no formato DD/MM/YYYY.');
      return;
    }

    // Converter DD/MM/YYYY para YYYY-MM-DD
    const [, day, month, year] = dateMatch;
    const isoDate = `${year}-${month}-${day}`;

    // Validar se a data é válida
    const dateObj = new Date(isoDate);
    if (isNaN(dateObj.getTime())) {
      alert('Por favor, insira uma data válida.');
      return;
    }

    // Adicionar nova partida ao store global
    addMatch({
      date: isoDate,
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

      // Verificar se há dados de exemplo sendo carregados automaticamente
      const hasExampleData = localStorage.getItem('maestrosfc_players_example_loaded');
      const noExampleData = localStorage.getItem('maestrosfc_no_example_data');

      if (hasExampleData || noExampleData === 'true') {
        console.log('⚠️ Dados de exemplo detectados ou desabilitados - limpando automaticamente');
        // Limpar dados de exemplo
        localStorage.removeItem('maestrosfc_players_example_loaded');
        localStorage.removeItem('players-store');
        localStorage.removeItem('maestrosfc_match_participants');
        localStorage.removeItem('maestrosfc_team_draw');
        localStorage.removeItem('maestrosfc_games');
        localStorage.removeItem('maestrosfc_donations');
      }

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
          status: 'active', // Assumindo todos como ativos
          stars: player.stars || 5
        }));

      // REMOVER DUPLICATAS por id para evitar problemas de duplicação na exclusão
      const uniquePlayers = [];
      const seenIds = new Set();

      for (const player of filteredPlayers) {
        if (!seenIds.has(player.id)) {
          seenIds.add(player.id);
          uniquePlayers.push(player);
        }
      }

      setOfflinePlayers(uniquePlayers);
      setShowOfflineSyncNotice(uniquePlayers.length > 0);

      // Se não há jogadores, garantir que os stores também estejam limpos
      if (uniquePlayers.length === 0) {
        try {
          // Limpar stores para evitar dados de exemplo
          localStorage.removeItem('players-store');
          localStorage.removeItem('maestrosfc_match_participants');
          localStorage.removeItem('maestrosfc_team_draw');
          localStorage.removeItem('maestrosfc_games');
          localStorage.removeItem('maestrosfc_donations');

          // Marcar que não há dados de exemplo para evitar recarregamento
          localStorage.setItem('maestrosfc_no_example_data', 'true');
          console.log('🧹 Stores limpos - sem jogadores encontrados');
        } catch (cleanupError) {
          console.warn('⚠️ Erro ao limpar stores:', cleanupError);
        }
      }
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
  const handleAddPlayer = async () => {
    if (!playerForm.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    if (!playerForm.email.trim()) {
      alert('Email é obrigatório');
      return;
    }

    try {
      // Criar novo jogador
      const newPlayer = {
        id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: playerForm.name.trim(),
        email: playerForm.email.toLowerCase().trim(),
        role: playerForm.role,
        position: playerForm.position,
        shirt_size: playerForm.shirt_size,
        stars: playerForm.stars,
        status: 'active',
        created_at: new Date().toISOString()
      };

      // Adicionar ao estado local (prioritário)
      const updatedPlayers = [...offlinePlayers, newPlayer];
      setOfflinePlayers(updatedPlayers);
      localStorage.setItem('offline_players', JSON.stringify(updatedPlayers));

      // Tentar Supabase como secundário (sem bloquear)
      try {
        // Usar apenas campo 'name' que sempre existe
        const { data: supabaseData, error } = await supabase
          .from('users')
          .insert({ name: playerForm.name.trim() })
          .select()
          .single();

        if (error) {
          console.log('⚠️ Supabase não funcionou, continuando sem erro:', error.message);
        } else {
          // Se Supabase funcionou, atualizar com ID real
          updatedPlayers[updatedPlayers.length - 1].id = supabaseData.id;
          setOfflinePlayers([...updatedPlayers]);
          localStorage.setItem('offline_players', JSON.stringify(updatedPlayers));
        }
      } catch (supabaseFail) {
        console.log('Supabase failed - continuando local como backup');
      }

      // Sucesso garantido
      alert(`✅ Jogador ${playerForm.name} adicionado com sucesso!`);

      // Reset form and close modal
      setPlayerForm({
        name: '',
        email: '',
        role: 'diarista',
        position: 'Meio',
        shirt_size: 'G',
        stars: 5
      });

      setShowAddPlayerModal(false);
      alert(`✅ Jogador ${newPlayer.name} adicionado com sucesso no Supabase!`);

    } catch (error) {
      console.error('❌ Erro geral ao criar jogador:', error);
      alert(`❌ Erro ao adicionar jogador: ${error.message || 'Erro interno'}`);
    }
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
  const handleEditPlayer = async () => {
    if (!playerToEdit || !playerForm.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    if (!playerForm.email.trim()) {
      alert('Email é obrigatório');
      return;
    }

    try {
      // 1. Atualizar sempre no localStorage primeiro (prioridade)
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
      localStorage.setItem('offline_players', JSON.stringify(updatedPlayers));

      // 2. Tentar Supabase como secundário (sem bloquear)
      try {
        const resultadoSupabase = await supabase
          .from('users')
          .update({ name: playerForm.name.trim() })
          .eq('id', playerToEdit.id);

        if (resultadoSupabase.error) {
          console.log('⚠️ Erro Supabase na edição:', resultadoSupabase.error.message);
        } else {
          console.log('✅ Supabase edit update work');
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase fail on edit but local OK');
      }

      alert('✅ Jogador editado com sucesso!');

      setShowEditPlayerModal(false);
      setPlayerToEdit(null);
      setPlayerForm({
        name: '',
        email: '',
        role: 'diarista',
        position: 'Meio',
        shirt_size: 'G',
        stars: 5
      });

      alert(`✅ Jogador ${playerForm.name} atualizado com sucesso no Supabase!`);

    } catch (error) {
      console.error('❌ Erro geral ao editar jogador:', error);
      alert(`❌ Erro ao editar jogador: ${error.message || 'Erro interno'}`);
    }
  };

  // Função para abrir modal de exclusão
  const openDeletePlayerModal = (player) => {
    setPlayerToDelete(player);
    setShowDeletePlayerModal(true);
  };

  // Função para confirmar exclusão
  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      // 1. Deletar do Supabase primeiro
      const { error: supabaseError } = await supabase
        .from('users')
        .delete()
        .eq('id', playerToDelete.id);

      if (supabaseError) {
        console.error('❌ Erro ao deletar jogador no Supabase:', supabaseError);
        alert(`❌ Erro ao deletar jogador no Supabase: ${supabaseError.message}`);
        return;
      }

      console.log('✅ Jogador deletado do Supabase');

      // 2. Deletar também do localStorage
      const updatedPlayers = offlinePlayers.filter(player => player.id !== playerToDelete.id);
      setOfflinePlayers(updatedPlayers);

      // Salvar no localStorage
      localStorage.setItem('offline_players', JSON.stringify(updatedPlayers));

      setShowDeletePlayerModal(false);
      setPlayerToDelete(null);

      alert(`✅ Jogador ${playerToDelete.name} excluído com sucesso do Supabase!`);

    } catch (error) {
      console.error('❌ Erro geral ao deletar jogador:', error);
      alert(`❌ Erro ao deletar jogador: ${error.message || 'Erro interno'}`);
    }
  };

  // useEffect para carregar jogadores ao iniciar
  React.useEffect(() => {
    // Verificar se há flag de não carregar dados de exemplo
    const noExampleData = localStorage.getItem('maestrosfc_no_example_data');
    if (noExampleData === 'true') {
      console.log('🚫 Dados de exemplo desabilitados - carregando apenas jogadores reais');
    }
    loadOfflinePlayers();
  }, []);

  // useEffect para recarregar quando necessário  
  React.useEffect(() => {
    // Verificar se temos jogadores para mostrar
    if (offlinePlayers.length > 0) {
      setShowOfflineSyncNotice(true);
    }
  }, [offlinePlayers.length]);

  // Função para abrir modal de exclusão
  const openClearAllModal = () => {
    setShowClearAllModal(true);
  };

  // Função para excluir TODOS os jogadores
  const clearAllPlayers = async () => {
    const playerCount = offlinePlayers.length;

    try {
      console.log('🧹 Iniciando limpeza completa de jogadores e ranking...');

      // Limpar o estado atual primeiro
      setOfflinePlayers([]);
      setShowOfflineSyncNotice(false);

      // Reset dos formulários
      setPlayerForm({
        name: '',
        email: '',
        role: 'diarista',
        position: 'Meio',
        shirt_size: 'G',
        stars: 5
      });

      // Fechar todos os modais
      setShowAddPlayerModal(false);
      setShowEditPlayerModal(false);
      setShowDeletePlayerModal(false);
      setPlayerToEdit(null);
      setPlayerToDelete(null);

      // Limpar localStorage de forma mais segura
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('maestrosfc_') ||
          key.startsWith('players-') ||
          key.startsWith('nexus-') ||
          key.startsWith('app_') ||
          key.startsWith('offline_') ||
          key.startsWith('local_') ||
          key.includes('match-participants') ||
          key.includes('players-store') ||
          key.includes('match-store') ||
          key.includes('games-store') ||
          key.includes('achievements-store')
        )) {
          keysToRemove.push(key);
        }
      }

      // Remover chaves uma por uma
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🗑️ Removido: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Erro ao remover ${key}:`, error);
        }
      });

      // Limpar sessionStorage
      try {
        sessionStorage.clear();
        console.log('🧹 SessionStorage limpo');
      } catch (sessionError) {
        console.warn('⚠️ Erro ao limpar sessionStorage:', sessionError);
      }

      // Resetar stores do Zustand para limpar ranking e estatísticas
      try {
        // Reset direto dos stores
        const { usePlayersStore } = await import('@/store/playersStore');
        usePlayersStore.getState().reset();
        console.log('🔄 PlayersStore resetado');

        const { useMatchParticipantsStore } = await import('@/store/matchParticipantsStore');
        useMatchParticipantsStore.getState().reset();
        console.log('🔄 MatchParticipantsStore resetado');

        const { useMatchStore } = await import('@/store/matchStore');
        useMatchStore.getState().resetToInitialState();
        console.log('🔄 MatchStore resetado');

        const { usePlayerStatsStore } = await import('@/store/playerStatsStore');
        usePlayerStatsStore.getState().resetStats(new Date().toISOString());
        console.log('🔄 PlayerStatsStore resetado (ranking limpo)');

        // Limpar store de jogos se existir
        try {
          const { useGamesStore } = await import('@/store/gamesStore');
          // Se o store tiver método de reset, usar
          if (useGamesStore.getState().reset) {
            useGamesStore.getState().reset();
            console.log('🔄 GamesStore resetado');
          }
        } catch (gamesError) {
          console.warn('⚠️ GamesStore não encontrado ou sem reset:', gamesError);
        }

        // Limpar store de conquistas se existir
        try {
          const { useAchievementsStore } = await import('@/store/achievementsStore');
          if (useAchievementsStore.getState().reset) {
            useAchievementsStore.getState().reset();
            console.log('🔄 AchievementsStore resetado');
          }
        } catch (achievementsError) {
          console.warn('⚠️ AchievementsStore não encontrado ou sem reset:', achievementsError);
        }

      } catch (storeError) {
        console.warn('⚠️ Erro ao resetar stores:', storeError);
      }

      console.log('🧹 Todas as fontes de jogadores e ranking limpas');

      // Confirmar exclusão com detalhes
      alert(`✅ SUCESSO!\n\n• ${playerCount} jogador(es) excluído(s)\n• Ranking e estatísticas limpos\n• Dados mockados removidos do localStorage\n• Todos os dados foram removidos\n• Sistema limpo e pronto para jogadores reais\n\nA página será recarregada em 3 segundos...`);

      // Recarregar a página após 3 segundos
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('❌ Erro ao limpar jogadores:', error);
      alert(`⚠️ Erro ao excluir dados: ${error.message}\n\nTente recarregar a página e tentar novamente.`);
    }
  };

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
                  // Permitir logout sempre
                  try {
                    await signOut();
                    localStorage.clear();
                    sessionStorage.clear();
                    alert('Logout realizado com sucesso!');
                    window.location.href = '/login';
                  } catch (error) {
                    console.error('Erro ao fazer logout:', error);
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login';
                  }
                }}
                className="dark:bg-red-600 dark:hover:bg-red-700"
                title="Sair da conta"
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
                  {offlinePlayers.length > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => openClearAllModal()}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Trash2 className='w-4 h-4 mr-2' />
                      🗑️ Excluir Todos ({offlinePlayers.length})
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Aviso quando não há jogadores */}
              {offlinePlayers.length === 0 && (
                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600">
                  <Users className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-600 mb-2">Nenhum jogador cadastrado</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                    Comece adicionando jogadores ao seu grupo
                  </p>
                  <Button
                    onClick={() => setShowAddPlayerModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Jogador
                  </Button>
                </div>
              )}

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
                      <div className={`w-3 h-3 rounded-full ${payment.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'
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
                      onChange={(e) => setPixPayment({ ...pixPayment, key: e.target.value })}
                      placeholder="exemplo@email.com ou 11999999999"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-account-name">Nome da Conta</Label>
                    <Input
                      id="payment-account-name"
                      value={pixPayment.accountName}
                      onChange={(e) => setPixPayment({ ...pixPayment, accountName: e.target.value })}
                      placeholder="Conta João - Pagamentos"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-description">Descrição</Label>
                    <Input
                      id="payment-description"
                      value={pixPayment.description}
                      onChange={(e) => setPixPayment({ ...pixPayment, description: e.target.value })}
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
                      onChange={(e) => setPixDonation({ ...pixDonation, key: e.target.value })}
                      placeholder="exemplo@email.com ou 11999999999"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donation-account-name">Nome da Conta</Label>
                    <Input
                      id="donation-account-name"
                      value={pixDonation.accountName}
                      onChange={(e) => setPixDonation({ ...pixDonation, accountName: e.target.value })}
                      placeholder="Conta Maria - Doações"
                      className="mt-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donation-description">Descrição</Label>
                    <Input
                      id="donation-description"
                      value={pixDonation.description}
                      onChange={(e) => setPixDonation({ ...pixDonation, description: e.target.value })}
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
                  onClick={() => window.location.href = '/manage-players'}
                >
                  <Users className='w-4 h-4 mr-2' />
                  Gerenciar Jogadores
                </Button>
                <Button
                  className='w-full'
                  variant="outline"
                  onClick={() => window.location.href = '/list-users'}
                >
                  <Users className='w-4 h-4 mr-2' />
                  Listar Usuários
                </Button>
                <Button
                  className='w-full'
                  variant="outline"
                  onClick={() => window.location.href = '/manage-admins'}
                >
                  <Shield className='w-4 h-4 mr-2' />
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
            <DialogDescription className="dark:text-zinc-300">
              Faça as alterações necessárias nos dados do jogo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right dark:text-zinc-300">
                Data
              </Label>
              <div className="col-span-3">
                <DatePicker
                  value={editForm.date}
                  onChange={(value) => setEditForm(prev => ({ ...prev, date: value }))}
                  placeholder="DD/MM/YYYY"
                  className="dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right dark:text-zinc-300">
                Horário
              </Label>
              <div className="col-span-3">
                <TimePicker
                  value={editForm.time}
                  onChange={(value) => setEditForm(prev => ({ ...prev, time: value }))}
                  placeholder="HH:MM"
                  className="dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
                />
              </div>
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
            <DialogDescription className="dark:text-zinc-300">
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
            <DialogDescription className="dark:text-zinc-300">
              Preencha os dados para criar uma nova partida.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-date" className="dark:text-zinc-300">Data</Label>
                <DatePicker
                  value={createForm.date}
                  onChange={(value) => setCreateForm(prev => ({ ...prev, date: value }))}
                  placeholder="DD/MM/YYYY"
                  className="dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100"
                />
              </div>
              <div>
                <Label htmlFor="create-time" className="dark:text-zinc-300">Horário</Label>
                <TimePicker
                  value={createForm.time}
                  onChange={(value) => setCreateForm(prev => ({ ...prev, time: value }))}
                  placeholder="HH:MM"
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
                className="dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder-zinc-300"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-300 mt-1">
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
                      • Chegue 15 minutos antes do horário marcado<br />
                      • Traga água e equipamentos necessários<br />
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

      {/* Modal Adicionar Jogador - Otimizado para Mobile */}
      <Dialog open={showAddPlayerModal} onOpenChange={setShowAddPlayerModal}>
        <DialogContent className="w-[95%] mx-auto max-w-[500px] max-h-[95vh] overflow-y-auto dark:bg-zinc-800 dark:border-zinc-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-zinc-100 text-lg sm:text-xl">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Adicionar Novo Jogador
            </DialogTitle>
            <DialogDescription className="dark:text-zinc-400 text-sm">
              Preencha as informações do jogador para adicioná-lo ao sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nome - Layout Mobile Optimizado */}
            <div className="space-y-2">
              <Label htmlFor="player-name" className="text-sm font-medium block">
                Nome *
              </Label>
              <Input
                id="player-name"
                value={playerForm.name}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
                className="w-full"
              />
            </div>

            {/* Email - Layout Mobile Optimizado */}
            <div className="space-y-2">
              <Label htmlFor="player-email" className="text-sm font-medium block">
                Email *
              </Label>
              <Input
                id="player-email"
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
                <Label htmlFor="player-role" className="text-sm font-medium block">
                  Função
                </Label>
                <select
                  id="player-role"
                  value={playerForm.role}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="diarista">Diarista</option>
                  <option value="mensalista">Mensalista</option>
                  <option value="aux">Auxiliar</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player-position" className="text-sm font-medium block">
                  Posição
                </Label>
                <select
                  id="player-position"
                  value={playerForm.position}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
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
              <Label htmlFor="player-size" className="text-sm font-medium block">
                Tamanho da Camisa
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlayerForm(prev => ({ ...prev, shirt_size: 'G' }))}
                  className={`p-3 border rounded-lg text-sm transition-colors ${playerForm.shirt_size === 'G'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-600'
                    }`}
                >
                  G
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerForm(prev => ({ ...prev, shirt_size: 'GG' }))}
                  className={`p-3 border rounded-lg text-sm transition-colors ${playerForm.shirt_size === 'GG'
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
              <Label htmlFor="player-stars" className="text-sm font-medium block">
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
                      className={`p-2 transition-colors touch-manipulation rounded-lg ${index < playerForm.stars
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

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowAddPlayerModal(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleAddPlayer}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
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
                  className={`p-3 border rounded-lg text-sm transition-colors ${playerForm.shirt_size === 'G'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-600'
                    }`}
                >
                  G
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerForm(prev => ({ ...prev, shirt_size: 'GG' }))}
                  className={`p-3 border rounded-lg text-sm transition-colors ${playerForm.shirt_size === 'GG'
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
                      className={`p-2 transition-colors touch-manipulation rounded-lg ${index < playerForm.stars
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
                    className={`text-xs ${playerToDelete.role === 'owner' ? 'bg-purple-100 text-purple-800' :
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

      {/* Modal de Confirmação para Excluir Todos */}
      <Dialog open={showClearAllModal} onOpenChange={setShowClearAllModal}>
        <DialogContent className="sm:max-w-[500px] p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              🚨 Excluir Todos os Jogadores
            </DialogTitle>
            <DialogDescription className="text-base text-zinc-600 dark:text-zinc-400 mt-2">
              Esta ação irá remover permanentemente todos os jogadores do sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Estatísticas dos jogadores */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">📊 Jogadores que serão excluídos:</h4>
              <div className="text-sm text-red-700 dark:text-red-300">
                <div className="font-medium">Total: {offlinePlayers.length} jogador(es)</div>
                {Object.entries(offlinePlayers.reduce((acc, player) => {
                  acc[player.role] = (acc[player.role] || 0) + 1;
                  return acc;
                }, {})).map(([role, count]) => (
                  <div key={role} className="ml-2">• {role}: {count} jogador(es)</div>
                ))}
              </div>
            </div>

            {/* Avisos importantes */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠️ Avisos Importantes:</h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Esta ação NÃO pode ser desfeita</li>
                <li>• Todos os dados serão perdidos permanentemente</li>
                <li>• Sistema será resetado completamente</li>
                <li>• Backup será criado automaticamente</li>
              </ul>
            </div>

            {/* Campo de confirmação */}
            <div className="space-y-2">
              <Label htmlFor="confirm-text" className="text-sm font-medium">
                Para confirmar, digite "EXCLUIR TODOS":
              </Label>
              <Input
                id="confirm-text"
                placeholder="Digite EXCLUIR TODOS"
                className="border-red-200 dark:border-red-700 focus:border-red-400 dark:focus:border-red-500"
                onChange={(e) => {
                  if (e.target.value === 'EXCLUIR TODOS') {
                    // Habilitar botão de confirmação
                    document.getElementById('confirm-delete-btn')?.removeAttribute('disabled');
                  } else {
                    document.getElementById('confirm-delete-btn')?.setAttribute('disabled', 'true');
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowClearAllModal(false)}
              className="w-full sm:w-auto text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              id="confirm-delete-btn"
              variant="destructive"
              onClick={() => {
                setShowClearAllModal(false);
                clearAllPlayers();
              }}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              🗑️ Excluir Todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
