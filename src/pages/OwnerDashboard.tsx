import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { useGamesStore } from '@/store/gamesStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  X
} from 'lucide-react';

export default function OwnerDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Store global de jogos
  const { matches, addMatch, updateMatch, deleteMatch, getUpcomingMatches } = useGamesStore();
  
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
    setCreateForm({
      date: '',
      time: '',
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

  if (!user || user.role !== 'owner') {
    return (
      <div className='p-4 sm:p-6'>
        <Card>
          <CardContent className='p-6 text-center space-y-4'>
            <Shield className='w-12 h-12 mx-auto text-red-500' />
            <h2 className='text-lg font-semibold'>Acesso Restrito</h2>
            <p className='text-sm text-zinc-500'>Apenas o dono do grupo tem acesso a esta área.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <Crown className='w-6 h-6 text-purple-600' />
            Dashboard do Dono
          </h1>
          <p className='text-sm text-zinc-600 dark:text-zinc-400'>Painel administrativo completo</p>
        </div>
        <div className='flex items-center gap-3'>
          <Badge variant="secondary" className='bg-purple-100 text-purple-800'>
            <Crown className='w-3 h-3 mr-1' />
            Owner
          </Badge>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={async () => {
              try {
                await signOut();
                alert('Logout realizado com sucesso!');
                window.location.href = '/';
              } catch (error) {
                console.error('Erro ao fazer logout:', error);
                alert('Erro ao fazer logout');
              }
            }}
          >
            <LogOut className='w-4 h-4 mr-2' />
            Sair
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-600 dark:text-zinc-400'>Próximos Jogos</p>
                <p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{matches.length}</p>
              </div>
              <Calendar className='w-8 h-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-600 dark:text-zinc-400'>Jogadores Ativos</p>
                <p className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>{dashboardData.players.filter(p => p.status === 'active').length}</p>
              </div>
              <Users className='w-8 h-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-600 dark:text-zinc-400'>Receita do Mês</p>
                <p className='text-2xl font-bold text-green-600 dark:text-green-400'>R$ {dashboardData.financialStatus.paid}</p>
              </div>
              <DollarSign className='w-8 h-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-600 dark:text-zinc-400'>Pendentes</p>
                <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>R$ {dashboardData.financialStatus.pending}</p>
              </div>
              <Clock className='w-8 h-8 text-orange-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="players">Jogadores</TabsTrigger>
          <TabsTrigger value="finance">Financeiro</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
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
                      <p className='text-sm text-zinc-600 dark:text-zinc-400'>{match.date} às {match.time}</p>
                      <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                        {match.confirmedPlayers}/{match.maxPlayers} confirmados
                      </p>
                    </div>
                    <div className='flex items-center gap-1 ml-2 flex-shrink-0'>
                      <Button size="sm" variant="outline" className='h-8 w-8 p-0'>
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
              <Button className='w-full' variant="outline" onClick={openCreateModal}>
                <Plus className='w-4 h-4 mr-2' />
                Nova Partida
              </Button>
            </CardContent>
          </Card>

          {/* Situação Financeira */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
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
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
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
                      <p className='font-semibold'>R$ {payment.amount}</p>
                      <Badge 
                        variant={payment.status === 'paid' ? 'default' : 'secondary'}
                        className={payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))}
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
                        <p className='text-sm text-zinc-500'>{match.date} às {match.time}</p>
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
                       onClick={() => window.location.href = '/create-invite'}
                     >
                       <UserCheck className='w-4 h-4 mr-2' />
                       Criar Convites
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Jogo
            </DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias nos dados do jogo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Horário
              </Label>
              <Input
                id="time"
                type="time"
                value={editForm.time}
                onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Local
              </Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Campo do Flamengo"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxPlayers" className="text-right">
                Vagas
              </Label>
              <Input
                id="maxPlayers"
                type="number"
                min="10"
                max="30"
                value={editForm.maxPlayers}
                onChange={(e) => setEditForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 22 }))}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={saveMatchChanges}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {matchToDelete && (
            <div className="py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900">{matchToDelete.location}</h3>
                <p className="text-sm text-red-700">{matchToDelete.date} às {matchToDelete.time}</p>
                <p className="text-sm text-red-600 mt-1">
                  {matchToDelete.confirmedPlayers} jogadores confirmados
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMatch}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Partida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criação de Partida */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nova Partida
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova partida.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-date">Data</Label>
                <Input
                  id="create-date"
                  type="date"
                  value={createForm.date}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="create-time">Horário</Label>
                <Input
                  id="create-time"
                  type="time"
                  value={createForm.time}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="create-location">Local (Endereço)</Label>
              <Input
                id="create-location"
                placeholder="Ex: Rua das Flores, 123 - Bairro, Cidade - Estado"
                value={createForm.location}
                onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
              />
              <p className="text-xs text-zinc-500 mt-1">
                💡 Cole aqui o endereço completo do Google Maps para facilitar a navegação
              </p>
            </div>
            
            <div>
              <Label htmlFor="create-maxPlayers">Número de Vagas</Label>
              <Input
                id="create-maxPlayers"
                type="number"
                min="10"
                max="30"
                value={createForm.maxPlayers}
                onChange={(e) => setCreateForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 22 }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeCreateModal}>
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
    </div>
  );
}
