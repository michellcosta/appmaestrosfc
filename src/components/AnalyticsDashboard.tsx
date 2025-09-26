import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Trophy, 
  Target,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const {
    analytics,
    loading,
    getRevenueChartData,
    getParticipationChartData,
    getMatchesChartData,
    getTopPerformersData,
    getPerformanceInsights,
    refreshAnalytics
  } = useAnalytics();

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Carregando analytics...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Dados não disponíveis</h3>
            <p className="text-gray-500">Não foi possível carregar os dados de analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const insights = getPerformanceInsights();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">Analytics Dashboard</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshAnalytics}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Insights/Alertas */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <Card key={index} className={`${
              insight.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' :
              insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
              'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {insight.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : insight.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Partidas</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalMatches}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {analytics.upcomingMatches} agendadas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Jogadores Ativos</p>
                <p className="text-2xl font-bold text-green-600">{analytics.activePlayers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {analytics.participationRate}% engajamento
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receita Mensal</p>
                <p className="text-2xl font-bold text-purple-600">R$ {analytics.monthlyRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                R$ {analytics.averagePaymentPerPlayer}/jogador
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gols/Partida</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.averageGoalsPerMatch}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {analytics.mostActiveDay} mais ativo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Dados Detalhados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRevenueChartData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">R$ {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Participação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Participação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getParticipationChartData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Partidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getMatchesChartData().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.map((player, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{player.name}</div>
                      <div className="text-xs text-gray-500">
                        {player.goals}G {player.assists}A • {player.matches} partidas
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{player.performance.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-blue-600">{analytics.averagePlayersPerMatch}</div>
            <div className="text-sm text-gray-600">Jogadores/Partida</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold text-green-600">{analytics.newPlayersThisMonth}</div>
            <div className="text-sm text-gray-600">Novos este mês</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-orange-600">{analytics.peakHour}</div>
            <div className="text-sm text-gray-600">Horário de pico</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
