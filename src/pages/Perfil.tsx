import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { useGamesStore } from '@/store/gamesStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LogOut, 
  User, 
  Mail, 
  Shield, 
  Trophy, 
  Target, 
  Calendar, 
  Star, 
  BarChart3, 
  Award, 
  Settings,
  Crown,
  Users,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  UserCheck,
  CreditCard,
  FileText,
  CheckCircle,
  Bell,
  RefreshCw,
  Palette,
  Zap
} from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

export default function PerfilPage() {
  const { user, loading, signOut, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { matches, updateMatch, deleteMatch } = useGamesStore();

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className='w-4 h-4 text-role-owner' />;
      case 'admin': return <Shield className='w-4 h-4 text-role-admin' />;
      case 'aux': return <Zap className='w-4 h-4 text-role-aux' />;
      case 'mensalista': return <Star className='w-4 h-4 text-role-mensalista' />;
      case 'diarista': return <Zap className='w-4 h-4 text-role-diarista' />;
      default: return <User className='w-4 h-4 text-role-default' />;
    }
  };

  // Dados mockados para o dashboard do owner
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

  // Estados para modais
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    location: '',
    date: '',
    time: '',
    maxPlayers: 22
  });
  const [createForm, setCreateForm] = useState({
    location: '',
    date: '',
    time: '',
    maxPlayers: 22
  });

  // Handlers para os botões
  const handleViewMatch = (match) => {
    setSelectedMatch(match);
    setViewModalOpen(true);
  };

  const handleEditMatch = (match) => {
    setSelectedMatch(match);
    // Pré-preencher com dados da partida editada
    setEditForm({
      location: match.location,
      date: match.date,
      time: match.time,
      maxPlayers: match.maxPlayers
    });
    setEditModalOpen(true);
  };

  const handleDeleteMatch = (match) => {
    setSelectedMatch(match);
    setDeleteModalOpen(true);
  };

  const handleCreateMatch = () => {
    // Nova Partida - usar data atual
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const currentTime = today.toTimeString().slice(0, 5); // Formato HH:MM
    
    setCreateForm({
      location: '',
      date: currentDate,
      time: currentTime,
      maxPlayers: 22
    });
    setCreateModalOpen(true);
  };

  const handleRepeatMatch = () => {
    // Repetir Partida - pegar última partida + 7 dias
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const lastMatchDate = new Date(lastMatch.date);
      lastMatchDate.setDate(lastMatchDate.getDate() + 7);
      
      const newDate = lastMatchDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      setCreateForm({
        location: lastMatch.location,
        date: newDate,
        time: lastMatch.time,
        maxPlayers: lastMatch.maxPlayers
      });
      setCreateModalOpen(true);
    } else {
      alert('Não há partidas anteriores para repetir.');
    }
  };

  const handleSaveCreate = () => {
    // Aqui você adicionaria a lógica para salvar a nova partida
    console.log('Criando nova partida:', createForm);
    alert('Partida criada com sucesso!');
    setCreateModalOpen(false);
    setCreateForm({
      location: '',
      date: '',
      time: '',
      maxPlayers: 22
    });
  };

  const confirmDeleteMatch = () => {
    if (selectedMatch) {
      deleteMatch(selectedMatch.id);
      console.log('Excluindo partida:', selectedMatch.id);
      alert('Partida excluída com sucesso!');
      setDeleteModalOpen(false);
      setSelectedMatch(null);
    }
  };

  const handleSaveEdit = () => {
    if (selectedMatch) {
      updateMatch(selectedMatch.id, {
        location: editForm.location,
        date: editForm.date,
        time: editForm.time,
        maxPlayers: editForm.maxPlayers
      });
      console.log('Salvando edição:', editForm);
      alert('Partida editada com sucesso!');
      setEditModalOpen(false);
      setSelectedMatch(null);
    }
  };

  if (loading) {
    return (
      <div className='p-4 sm:p-6'>
        <h1 className='text-lg font-bold text-gray-900'>Perfil</h1>
        <p className='text-sm text-gray-600'>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='p-4 sm:p-6 space-y-4'>
        <h1 className='text-lg font-bold text-gray-900'>Perfil</h1>
        <Card>
          <CardContent className='p-6 text-center space-y-4'>
            <User className='w-12 h-12 mx-auto text-zinc-400' />
            <div>
              <h3 className='text-lg font-semibold'>Faça login para continuar</h3>
              <p className='text-sm text-zinc-500'>Entre com sua conta Google para acessar todas as funcionalidades</p>
            </div>
            <div className='space-y-2'>
              <Button 
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    console.error('Erro no login:', error);
                    alert('Erro ao fazer login. Verifique se o Google OAuth está configurado.');
                  }
                }} 
                className='w-full'
              >
                <Mail className='w-4 h-4 mr-2' />
                Entrar com Google
              </Button>
              
              <Button 
                onClick={() => navigate('/offline-auth')} 
                variant="outline"
                className='w-full'
              >
                <User className='w-4 h-4 mr-2' />
                Login de Teste (Owner)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-4 pb-20'>
      <header className="bg-white border-b border-gray-200 shadow-sm rounded-lg mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className='text-lg font-bold text-gray-900'>Perfil</h1>
            <p className='text-sm text-gray-600'>Dados do jogador, posição e estrelas</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {user?.role && (
              <div className="flex items-center space-x-1 text-sm text-maestros-green">
                {getRoleIcon(user.role)}
                <span className="hidden sm:inline font-medium">
                  {user.role === 'owner' ? 'Dono' : 
                   user.role === 'admin' ? 'Admin' : 
                   user.role === 'aux' ? 'Auxiliar' : 
                   user.role === 'mensalista' ? 'Mensalista' : 
                   user.role === 'diarista' ? 'Diarista' : 
                   'Usuário'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Informações do Usuário */}
      <Card>
        <CardContent className='p-6 space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center'>
              <User className='w-8 h-8 text-zinc-600' />
            </div>
            <div className='flex-1'>
              <h2 className='text-lg font-semibold'>{user.name || 'Usuário'}</h2>
              <p className='text-sm text-zinc-500'>{user.email || 'E-mail não disponível'}</p>
              {user.role && (
                <Badge 
                  variant="secondary" 
                  className={`mt-2 ${
                    user.role === 'owner' 
                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                      : user.role === 'admin'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-green-100 text-green-800 border-green-200'
                  }`}
                >
                  <Shield className='w-3 h-3 mr-1' />
                  {user.role === 'owner' ? '👑 Dono' : 
                   user.role === 'admin' ? '🛡️ Admin' : 
                   user.role === 'mensalista' ? '⭐ Mensalista' : 
                   user.role === 'diarista' ? '💫 Diarista' : 
                   user.role}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Navegação */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className={`grid w-full ${user?.role === 'owner' ? 'grid-cols-4' : 'grid-cols-3'} bg-black border-black h-12 p-1 rounded-xl`}>
          <TabsTrigger 
            value="stats" 
            className="flex items-center justify-center p-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-white hover:bg-zinc-800 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="achievements" 
            className="flex items-center justify-center p-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-white hover:bg-zinc-800 transition-colors"
          >
            <Award className="w-5 h-5" />
          </TabsTrigger>
          {user?.role === 'owner' && (
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center justify-center p-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-white hover:bg-zinc-800 transition-colors"
            >
              <Crown className="w-5 h-5" />
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="settings" 
            className="flex items-center justify-center p-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-white hover:bg-zinc-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>Estatísticas do Jogador</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-4 bg-emerald-50 rounded-lg'>
                  <Trophy className='w-6 h-6 text-emerald-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-emerald-600'>12</div>
                  <div className='text-sm text-zinc-500'>Gols</div>
                </div>
                <div className='text-center p-4 bg-blue-50 rounded-lg'>
                  <Target className='w-6 h-6 text-blue-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-blue-600'>8</div>
                  <div className='text-sm text-zinc-500'>Assistências</div>
                </div>
                <div className='text-center p-4 bg-purple-50 rounded-lg'>
                  <Calendar className='w-6 h-6 text-purple-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-purple-600'>24</div>
                  <div className='text-sm text-zinc-500'>Partidas</div>
                </div>
                <div className='text-center p-4 bg-orange-50 rounded-lg'>
                  <Star className='w-6 h-6 text-orange-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-orange-600'>4.8</div>
                  <div className='text-sm text-zinc-500'>Avaliação</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>Conquistas</h3>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg'>
                  <Trophy className='w-5 h-5 text-yellow-600' />
                  <div>
                    <p className='font-medium'>Artilheiro do Mês</p>
                    <p className='text-sm text-zinc-500'>Setembro 2024</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-green-50 rounded-lg'>
                  <Star className='w-5 h-5 text-green-600' />
                  <div>
                    <p className='font-medium'>Jogador Mais Votado</p>
                    <p className='text-sm text-zinc-500'>Agosto 2024</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg'>
                  <Calendar className='w-5 h-5 text-blue-600' />
                  <div>
                    <p className='font-medium'>Presença Perfeita</p>
                    <p className='text-sm text-zinc-500'>Últimos 3 meses</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Dashboard do Owner */}
        {user?.role === 'owner' && (
          <TabsContent value="dashboard" className="space-y-4">
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

            {/* Próximos Jogos */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='w-5 h-5' />
                  Próximos Jogos
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {matches.slice(0, 3).map((match) => (
                  <div key={match.id} className='p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-zinc-900 dark:text-zinc-100 truncate'>{match.location}</p>
                        <p className='text-sm text-zinc-600 dark:text-zinc-400'>{match.date} às {match.time}</p>
                        <p className='text-sm text-zinc-600 dark:text-zinc-400'>
                          {match.confirmedPlayers}/{match.maxPlayers} confirmados
                        </p>
                      </div>
                      <Badge variant={match.status === 'open' ? 'default' : 'secondary'} className='ml-2 flex-shrink-0'>
                        {match.status === 'open' ? 'Aberto' : 'Fechado'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-end gap-1'>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className='h-8 w-8 p-0' 
                        title="Visualizar"
                        onClick={() => handleViewMatch(match)}
                      >
                        <Eye className='w-4 h-4' />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className='h-8 w-8 p-0' 
                        title="Editar"
                        onClick={() => handleEditMatch(match)}
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50' 
                        title="Excluir"
                        onClick={() => handleDeleteMatch(match)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  className='w-full mb-2' 
                  variant="outline"
                  onClick={handleRepeatMatch}
                >
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Repetir Partida
                </Button>
                <Button 
                  className='w-full' 
                  variant="outline"
                  onClick={handleCreateMatch}
                >
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

            {/* Controle de Jogadores */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  Controle de Jogadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {dashboardData.players.slice(0, 4).map((player) => (
                    <div key={player.id} className='flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center'>
                          <User className='w-5 h-5 text-zinc-600 dark:text-zinc-400' />
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
                      </div>
                    </div>
                  ))}
                  <Button className='w-full' variant="outline">
                    <Plus className='w-4 h-4 mr-2' />
                    Ver Todos os Jogadores
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="settings" className="space-y-4">
           {/* Funcionalidades especiais para Owner */}
           {user.role === 'owner' && (
             <>
               {/* Permissões do Grupo */}
               <Card>
                 <CardHeader>
                   <CardTitle className='flex items-center gap-2'>
                     <Shield className='w-5 h-5 text-purple-600' />
                     Permissões do Grupo
                   </CardTitle>
                 </CardHeader>
                 <CardContent className='space-y-3'>
                   <Button 
                     variant="outline" 
                     className='w-full justify-start'
                     onClick={() => navigate('/admin/manage-admins')}
                   >
                     <Users className='w-4 h-4 mr-2' />
                     Gerenciar Admins
                   </Button>
                   
                   <Button 
                     variant="outline" 
                     className='w-full justify-start'
                     onClick={() => navigate('/admin/configure-access')}
                   >
                     <Shield className='w-4 h-4 mr-2' />
                     Configurar Acessos
                   </Button>
                   
                   <Button 
                     variant="outline" 
                     className='w-full justify-start'
                     onClick={() => navigate('/admin/create-invites')}
                   >
                     <UserCheck className='w-4 h-4 mr-2' />
                     Criar Convites
                   </Button>
                   
                   <Button 
                     variant="outline" 
                     className='w-full justify-start'
                     onClick={() => navigate('/admin/approve-participants')}
                   >
                     <CheckCircle className='w-4 h-4 mr-2' />
                     Aprovar Participantes
                   </Button>
                 </CardContent>
               </Card>

               {/* Integrações */}
               <Card>
                 <CardHeader>
                   <CardTitle className='flex items-center gap-2'>
                     <Bell className='w-5 h-5 text-blue-600' />
                     Integrações
                   </CardTitle>
                 </CardHeader>
                 <CardContent className='space-y-3'>
                   <Button 
                     variant="outline" 
                     className='w-full justify-start'
                     onClick={() => navigate('/admin/push-notifications')}
                   >
                     <Bell className='w-4 h-4 mr-2' />
                     Notificações Push
                   </Button>
                   
                   <Button 
                     variant="outline" 
                     className='w-full justify-start'
                     onClick={() => navigate('/admin/auto-updates')}
                   >
                     <RefreshCw className='w-4 h-4 mr-2' />
                     Updates Automáticos
                   </Button>
                   
                   <Button 
                     variant="outline" 
                     className='w-full justify-start'
                     onClick={() => navigate('/admin/system-logs')}
                   >
                     <FileText className='w-4 h-4 mr-2' />
                     Logs do Sistema
                   </Button>
                 </CardContent>
               </Card>

               {/* Funcionalidades de Dono */}
               <Card>
                 <CardContent className='p-6'>
                   <h3 className='text-lg font-semibold mb-4 flex items-center'>
                     <Shield className='w-5 h-5 mr-2 text-purple-600' />
                     Funcionalidades de Dono
                   </h3>
                   <div className='space-y-3'>
                     <div className='p-3 bg-purple-50 rounded-lg'>
                       <p className='font-medium text-purple-900'>👑 Acesso Total</p>
                       <p className='text-sm text-purple-700'>Você tem acesso completo a todas as funcionalidades do sistema</p>
                     </div>
                     <div className='p-3 bg-blue-50 rounded-lg'>
                       <p className='font-medium text-blue-900'>🛡️ Gerenciamento</p>
                       <p className='text-sm text-blue-700'>Pode gerenciar usuários, convites e configurações</p>
                     </div>
                     <div className='p-3 bg-green-50 rounded-lg'>
                       <p className='font-medium text-green-900'>📊 Relatórios</p>
                       <p className='text-sm text-green-700'>Acesso a relatórios e estatísticas completas</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </>
           )}

           {/* Configurações de Aparência */}
           <Card>
             <CardContent className='p-6'>
               <h3 className='text-lg font-semibold mb-4 flex items-center'>
                 <Palette className='w-5 h-5 mr-2 text-blue-600' />
                 Aparência
               </h3>
               <div className='space-y-4'>
                 <div className='flex justify-between items-center'>
                   <div>
                     <span className='text-sm font-medium'>Tema</span>
                     <p className='text-xs text-zinc-500'>Escolha entre claro, escuro ou automático</p>
                   </div>
                   <ThemeSelector />
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* Configurações da Conta */}
           <Card>
             <CardContent className='p-6'>
               <h3 className='text-lg font-semibold mb-4'>Configurações da Conta</h3>
               <div className='space-y-3'>
                 <div className='flex justify-between items-center'>
                   <span className='text-sm text-zinc-500'>ID do Usuário:</span>
                   <span className='text-sm font-mono'>{user.id}</span>
                 </div>
                 <div className='flex justify-between items-center'>
                   <span className='text-sm text-zinc-500'>E-mail:</span>
                   <span className='text-sm'>{user.email || 'Não informado'}</span>
                 </div>
                 <div className='flex justify-between items-center'>
                   <span className='text-sm text-zinc-500'>Nome:</span>
                   <span className='text-sm'>{user.name || 'Não informado'}</span>
                 </div>
                 <div className='flex justify-between items-center'>
                   <span className='text-sm text-zinc-500'>Tipo de Acesso:</span>
                   <Badge variant="outline">{user.role || 'Não definido'}</Badge>
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
      </Tabs>

      <div className='pt-4'>
        <Button 
          onClick={async () => {
            try {
              await signOut();
              alert('Logout realizado com sucesso!');
              navigate('/');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              alert('Erro ao fazer logout');
            }
          }} 
          variant="destructive" 
          className='w-full'
        >
          <LogOut className='w-4 h-4 mr-2' />
          Sair da Conta
        </Button>
      </div>

      {/* Modal de Visualizar */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Jogo</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-zinc-600">Local</Label>
                <p className="text-sm">{selectedMatch.location}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-zinc-600">Data e Hora</Label>
                <p className="text-sm">{selectedMatch.date} às {selectedMatch.time}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-zinc-600">Status</Label>
                <Badge variant={selectedMatch.status === 'Aberto' ? 'default' : 'secondary'}>
                  {selectedMatch.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-zinc-600">Jogadores Confirmados</Label>
                <p className="text-sm">{selectedMatch.confirmedPlayers}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Jogo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-location">Local</Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Digite o local do jogo"
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-time">Hora</Label>
              <Input
                id="edit-time"
                type="time"
                value={editForm.time}
                onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-maxPlayers">Número de Vagas</Label>
              <Input
                id="edit-maxPlayers"
                type="number"
                min="10"
                max="30"
                value={editForm.maxPlayers}
                onChange={(e) => setEditForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 22 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Excluir */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-600">
              Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.
            </p>
            {selectedMatch && (
              <div className="mt-4 p-3 bg-zinc-50 rounded-lg">
                <p className="text-sm font-medium">{selectedMatch.location}</p>
                <p className="text-xs text-zinc-500">{selectedMatch.date} às {selectedMatch.time}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMatch}>
              Excluir Jogo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criar Partida */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Partida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-location">Local</Label>
              <Input
                id="create-location"
                value={createForm.location}
                onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Digite o local do jogo"
              />
            </div>
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
              <Label htmlFor="create-time">Hora</Label>
              <Input
                id="create-time"
                type="time"
                value={createForm.time}
                onChange={(e) => setCreateForm(prev => ({ ...prev, time: e.target.value }))}
              />
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
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCreate}>
              Criar Partida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
