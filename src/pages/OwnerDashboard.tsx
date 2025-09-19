import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/MobileAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Bell
} from 'lucide-react';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Dados mockados - depois integrar com Supabase
  const [dashboardData, setDashboardData] = useState({
    upcomingMatches: [
      {
        id: 1,
        date: '2024-01-20',
        time: '19:00',
        location: 'Campo do Flamengo',
        maxPlayers: 22,
        confirmedPlayers: 18,
        status: 'open'
      },
      {
        id: 2,
        date: '2024-01-22',
        time: '20:00',
        location: 'Campo do Botafogo',
        maxPlayers: 22,
        confirmedPlayers: 15,
        status: 'open'
      }
    ],
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
          <p className='text-sm text-zinc-500'>Painel administrativo completo</p>
        </div>
        <Badge variant="secondary" className='bg-purple-100 text-purple-800'>
          <Crown className='w-3 h-3 mr-1' />
          Owner
        </Badge>
      </div>

      {/* Cards de Resumo */}
      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-500'>Próximos Jogos</p>
                <p className='text-2xl font-bold'>{dashboardData.upcomingMatches.length}</p>
              </div>
              <Calendar className='w-8 h-8 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-500'>Jogadores Ativos</p>
                <p className='text-2xl font-bold'>{dashboardData.players.filter(p => p.status === 'active').length}</p>
              </div>
              <Users className='w-8 h-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-500'>Receita do Mês</p>
                <p className='text-2xl font-bold text-green-600'>R$ {dashboardData.financialStatus.paid}</p>
              </div>
              <DollarSign className='w-8 h-8 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-zinc-500'>Pendentes</p>
                <p className='text-2xl font-bold text-orange-600'>R$ {dashboardData.financialStatus.pending}</p>
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
              {dashboardData.upcomingMatches.map((match) => (
                <div key={match.id} className='flex items-center justify-between p-3 bg-zinc-50 rounded-lg'>
                  <div>
                    <p className='font-medium'>{match.location}</p>
                    <p className='text-sm text-zinc-500'>{match.date} às {match.time}</p>
                    <p className='text-sm text-zinc-500'>
                      {match.confirmedPlayers}/{match.maxPlayers} confirmados
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant={match.status === 'open' ? 'default' : 'secondary'}>
                      {match.status === 'open' ? 'Aberto' : 'Fechado'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Eye className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              ))}
              <Button className='w-full' variant="outline">
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
                  <span className='text-sm text-zinc-500'>Total do Mês:</span>
                  <span className='font-semibold'>R$ {dashboardData.financialStatus.totalThisMonth}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-500'>Pagos:</span>
                  <span className='font-semibold text-green-600'>R$ {dashboardData.financialStatus.paid}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-zinc-500'>Pendentes:</span>
                  <span className='font-semibold text-orange-600'>R$ {dashboardData.financialStatus.pending}</span>
                </div>
                <div className='w-full bg-zinc-200 rounded-full h-2'>
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
                  <div key={payment.id} className='flex items-center justify-between p-3 bg-zinc-50 rounded-lg'>
                    <div>
                      <p className='font-medium'>{payment.player}</p>
                      <p className='text-sm text-zinc-500'>{payment.date}</p>
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
                <Button>
                  <Plus className='w-4 h-4 mr-2' />
                  Nova Partida
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {dashboardData.upcomingMatches.map((match) => (
                  <div key={match.id} className='p-4 border rounded-lg space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-semibold'>{match.location}</h3>
                        <p className='text-sm text-zinc-500'>{match.date} às {match.time}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button size="sm" variant="outline">
                          <Edit className='w-4 h-4' />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className='w-4 h-4' />
                        </Button>
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
                  <div key={player.id} className='flex items-center justify-between p-3 bg-zinc-50 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center'>
                        <Users className='w-5 h-5 text-zinc-500' />
                      </div>
                      <div>
                        <p className='font-medium'>{player.name}</p>
                        <p className='text-sm text-zinc-500'>
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
                    <span className='text-sm text-zinc-500'>Receita Total:</span>
                    <span className='font-semibold text-green-600'>R$ {dashboardData.financialStatus.totalThisMonth}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-zinc-500'>Confirmados:</span>
                    <span className='font-semibold text-green-600'>R$ {dashboardData.financialStatus.paid}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-sm text-zinc-500'>Pendentes:</span>
                    <span className='font-semibold text-orange-600'>R$ {dashboardData.financialStatus.pending}</span>
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
                  <div key={payment.id} className='flex items-center justify-between p-3 bg-zinc-50 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-3 h-3 rounded-full ${
                        payment.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'
                      }`}></div>
                      <div>
                        <p className='font-medium'>{payment.player}</p>
                        <p className='text-sm text-zinc-500'>{payment.date}</p>
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
                <Button className='w-full' variant="outline">
                  <Users className='w-4 h-4 mr-2' />
                  Gerenciar Admins
                </Button>
                <Button className='w-full' variant="outline">
                  <Shield className='w-4 h-4 mr-2' />
                  Configurar Acessos
                </Button>
                <Button className='w-full' variant="outline">
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
    </div>
  );
}
