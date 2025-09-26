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
  Mail
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
          <TabsTrigger value="settings" className="flex-1 flex items-center gap-1 sm:gap-2 dark:data-[state=active]:bg-zinc-700 dark:text-zinc-300 dark:data-[state=active]:text-zinc-100">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          {/* Próximos Jogos */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='w-5 h-5' />
                Próximos Jogos
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {matches.map((match) => (
                <div key={match.id} className='p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-zinc-900 dark:text-zinc-100 truncate'>{match.location}</p>
                      <p className='text-sm text-zinc-600 dark:text-zinc-400'>{formatDate(match.date)} às {match.time}</p>
                      <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                        {match.confirmedPlayers}/{match.maxPlayers} confirmados
                      </p>
                    </div>
                    <div className='flex items-center gap-1 ml-2 flex-shrink-0'>
                      <Button size="sm" variant="outline" className='h-8 w-8 p-0' onClick={() => openViewModal(match)}>
                        <Eye className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <Badge variant={match.status === 'open' ? 'default' : 'secondary'}>
                      {match.status === 'open' ? 'Aberto' : 'Fechado'}
                    </Badge>
                    <div className='flex items-center gap-1'>
                      <Button size="sm" variant="outline" className='h-8 w-8 p-0' onClick={() => openEditModal(match)}>
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button size="sm" variant="outline" className='h-8 w-8 p-0' onClick={() => openDeleteModal(match)}>
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="space-y-2">
                <Button 
                  className='w-full bg-maestros-green hover:bg-maestros-green/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200' 
                  onClick={handleRepeatMatch}
                >
                  <Repeat className='w-4 h-4 mr-2' />
                  Repetir Partida
                </Button>
                <Button 
                  className='w-full bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200' 
                  onClick={() => window.location.href = '/match'}
                >
                  <Play className='w-4 h-4 mr-2' />
                  Ir para a Partida
                </Button>
                <Button className='w-full' variant="outline" onClick={openCreateModal}>
                  <Plus className='w-4 h-4 mr-2' />
                  Nova Partida
                </Button>
              </div>
            </CardContent>
          </Card>

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
              <CardTitle className='flex items-center justify-between'>
                <span className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  Controle de Jogadores
                </span>
                <Button>
                  <Plus className='w-4 h-4 mr-2' />
                  Adicionar Jogador
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {dashboardData.players.map((player) => (
                  <div key={player.id} className='flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center'>
                        <Users className='w-5 h-5 text-zinc-600 dark:text-zinc-400' />
                      </div>
                      <div>
                        <p className='font-medium text-zinc-900 dark:text-zinc-100'>{player.name}</p>
                        <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                          {player.lastPayment ? `Último pagamento: ${player.lastPayment}` : 'Sem pagamentos'}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge 
                        variant="outline"
                        className={
                          player.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          player.role === 'aux' ? 'bg-green-100 text-green-800' :
                          player.role === 'mensalista' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }
                      >
                        {player.role === 'admin' ? 'Admin' :
                         player.role === 'aux' ? 'Auxiliar' :
                         player.role === 'mensalista' ? 'Mensalista' : 'Diarista'}
                      </Badge>
                      <Badge 
                        variant={player.status === 'active' ? 'default' : 'secondary'}
                        className={player.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {player.status === 'active' ? 'Ativo' : 'Pendente'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
