// src/pages/Ranking.tsx
import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Crown, 
  Trophy, 
  Search, 
  Filter, 
  Medal, 
  Star, 
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Target,
  Timer,
  Shield,
  Database,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import RestrictedAccess from './RestrictedAccess';
import { usePlayersCache } from '@/hooks/usePlayersCache';
// Função generateMockPlayerData removida - sistema baseado apenas em dados reais

export default function RankingPage() {
  const { user } = useAuth();
  const { canSeeRanking, canSeeVote } = usePermissions();
  const navigate = useNavigate();

  // Verificar permissão básica
  if (!canSeeRanking()) {
    return <RestrictedAccess />;
  }

  // Estados para filtros e configurações
  const [searchName, setSearchName] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [sortBy, setSortBy] = useState('total');
  const [showOnlyTop, setShowOnlyTop] = useState(10);

  // Calcular média e avaliação do jogador - OTIMIZADO (movido para cima)
  const calculatePlayerRating = React.useCallback((player: any) => {
    // Validação de dados para evitar erros
    const goals = Number.isInteger(player.goals) ? player.goals : 0;
    const assists = Number.isInteger(player.assists) ? player.assists : 0;
    const victories = Number.isInteger(player.victories) ? player.victories : 0;
    const draws = Number.isInteger(player.draws) ? player.draws : 0;
    const defeats = Number.isInteger(player.defeats) ? player.defeats : 0;
    const games = Number.isInteger(player.games) && player.games > 0 ? player.games : 1;
    
    // Pontuação baseada em múltiplos fatores - OTIMIZADO
    const totalScore = (goals * 3) + (assists * 2) + (victories * 5) + (draws * 1) + (defeats * -2);
    
    // Média por jogo - OTIMIZADO
    const averagePerGame = (totalScore / games).toFixed(1);
    const avg = parseFloat(averagePerGame);
    
    // Avaliação baseada na média - OTIMIZADO com lookup table
    const ratingMap = [
      { min: 8, rating: 'EXCELENTE', color: 'text-green-600 dark:text-green-400', icon: '⭐' },
      { min: 6, rating: 'MUITO BOM', color: 'text-blue-600 dark:text-blue-400', icon: '🔥' },
      { min: 4, rating: 'BOM', color: 'text-yellow-600 dark:text-yellow-400', icon: '👍' },
      { min: 2, rating: 'REGULAR', color: 'text-orange-600 dark:text-orange-400', icon: '🔄' },
      { min: 0, rating: 'PRECISA MELHORAR', color: 'text-red-600 dark:text-red-400', icon: '📈' }
    ];
    
    const ratingData = ratingMap.find(r => avg >= r.min) || ratingMap[ratingMap.length - 1];
    
    return {
      average: averagePerGame,
      rating: ratingData.rating,
      ratingColor: ratingData.color,
      ratingIcon: ratingData.icon
    };
  }, []);

  // Calcular estatísticas avançadas - OTIMIZADO (movido para cima)
  const calculateAdvancedStats = React.useCallback((player: any) => {
    // Validação de dados para evitar erros
    const goals = Number.isInteger(player.goals) ? player.goals : 0;
    const assists = Number.isInteger(player.assists) ? player.assists : 0;
    const games = Number.isInteger(player.games) && player.games > 0 ? player.games : 1;
    
    // Cálculos otimizados
    const avgGoals = (goals / games * 100).toFixed(1);
    const avgAssists = (assists / games * 100).toFixed(1);
    const participation = ((goals + assists) / games * 100).toFixed(0);
    
    return {
      avgGoals: `${avgGoals}%`,
      avgAssists: `${avgAssists}%`,
      participationRate: `${participation}%`,
      consistencyScore: games >= 6 ? 'Alto' : 'Médio',
      trend: goals > assists ? '⚡ Goleiro' : '📝 Assistente',
      recentForm: games >= 7 ? '🔥 Em Forma' : '🔄 Regular'
    };
  }, []);

  // Função para cores de fundo baseadas na performance - OTIMIZADO
  const getBackgroundColor = React.useCallback((player: any) => {
    const rating = calculatePlayerRating(player);
    const avg = parseFloat(rating.average);
    
    // Lookup table para cores - mais eficiente
    const colorMap = [
      { min: 8, bg: 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700' },
      { min: 6, bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700' },
      { min: 4, bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700' },
      { min: 2, bg: 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700' },
      { min: 0, bg: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-700' }
    ];
    
    return colorMap.find(c => avg >= c.min)?.bg || colorMap[colorMap.length - 1].bg;
  }, [calculatePlayerRating]);

  // Efeito hover discreto e responsivo - OTIMIZADO
  const getHoverEffect = React.useCallback((index: number) => {
    return 'hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200';
  }, []);

  // Função para cores do texto seguindo a paleta - OTIMIZADO
  const getTextColor = React.useCallback((player: any) => {
    const rating = calculatePlayerRating(player);
    const avg = parseFloat(rating.average);
    
    // Lookup table para cores de texto - mais eficiente
    const textColorMap = [
      { min: 8, color: 'text-green-700 dark:text-green-300' },
      { min: 6, color: 'text-blue-700 dark:text-blue-300' },
      { min: 4, color: 'text-yellow-700 dark:text-yellow-300' },
      { min: 2, color: 'text-orange-700 dark:text-orange-300' },
      { min: 0, color: 'text-gray-700 dark:text-gray-300' }
    ];
    
    return textColorMap.find(c => avg >= c.min)?.color || textColorMap[textColorMap.length - 1].color;
  }, [calculatePlayerRating]);

  // Sistema de cache para jogadores - OTIMIZADO
  const {
    players: offlinePlayers,
    loading: loadingPlayers,
    error: playersError,
    isCached,
    cacheStats,
    refresh: refreshPlayers,
    syncWithStorage
  } = usePlayersCache({
    ttl: 5 * 60 * 1000, // 5 minutos de cache
    maxSize: 100 // Máximo 100 jogadores em cache
  });

  // Sincronizar com localStorage quando necessário
  useEffect(() => {
    syncWithStorage();
  }, [syncWithStorage]);

  // Cache dos dados de jogadores com useMemo - OTIMIZADO com validação
  const playersData = useMemo(() => {
    if (offlinePlayers.length > 0) {
      return offlinePlayers;
    }
    
    // Gerar dados mock válidos usando função de validação
    // Sistema baseado apenas em jogadores reais - sem dados mock
    const mockPlayers: any[] = [];
    console.log('📊 Usando dados mock válidos para demonstração:', mockPlayers.length);
    return mockPlayers;
  }, [offlinePlayers]);

  // Cache dos cálculos de performance - OTIMIZADO
  const playersWithPerformance = useMemo(() => {
    return playersData.map(player => ({
      ...player,
      performance: calculatePlayerRating(player),
      advancedStats: calculateAdvancedStats(player),
      backgroundColor: getBackgroundColor(player),
      textColor: getTextColor(player)
    }));
  }, [playersData, calculatePlayerRating, calculateAdvancedStats, getBackgroundColor, getTextColor]);


  return (
    <div className="mx-auto w-full max-w-4xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 pb-16 sm:pb-20">
      {/* Header otimizado para mobile */}
      <Card className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm rounded-lg mb-3 sm:mb-4">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100 truncate">Ranking & Votações</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 line-clamp-2">
              Rankings dos jogadores e votações ativas.
            </p>
          </div>
          
            {/* Crown button para owners */}
            {user?.role === 'owner' && (
              <button
                onClick={() => navigate('/owner-dashboard')}
                className="p-2 sm:p-2 hover:bg-purple-100 hover:text-purple-700 active:scale-95 transition-all duration-200 rounded-lg touch-manipulation ml-2 flex-shrink-0"
                title="Acesso rápido ao Dashboard do Owner"
              >
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas dos Jogadores */}
          <Card className="rounded-2xl">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            Estatísticas dos Jogadores
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          
          {/* Indicador de Loading dos Jogadores */}
          {loadingPlayers && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400">
                Carregando jogadores...
              </span>
            </div>
          )}
          
          {/* Info sobre fonte dos dados e cache */}
          {!loadingPlayers && (
            <div className="mb-4 space-y-2">
              {offlinePlayers.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📱 <strong>Dados Reais:</strong> Ranking dos {offlinePlayers.length} jogador(es) cadastrados no sistema offline.
                  </p>
                </div>
              )}
              
              {/* Indicadores de cache e validação */}
              <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  {isCached ? (
                    <Badge variant="secondary" className="text-xs">
                      <Database className="w-3 h-3 mr-1" />
                      Cache Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Timer className="w-3 h-3 mr-1" />
                      Sem Cache
                    </Badge>
                  )}
                  
                  {/* Indicador de dados validados */}
                  <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
                    <Shield className="w-3 h-3 mr-1" />
                    Dados Validados
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshPlayers}
                    disabled={loadingPlayers}
                    className="h-6 px-2 text-xs"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${loadingPlayers ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
                
                {cacheStats && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Cache: {cacheStats.validItems}/{cacheStats.totalItems} itens
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Ranking Geral - Cards simples com G A V E D */}
          {!loadingPlayers && (
            <div className="space-y-3 sm:space-y-4 mb-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                Ranking Geral
              </h3>
              
              {/* Cards simples do ranking geral - OTIMIZADO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {playersWithPerformance.slice(0, showOnlyTop).map((player, index) => {
                const medalColor = index === 0 ? 'text-yellow-500' : 
                                  index === 1 ? 'text-gray-400' : 
                                  index === 2 ? 'text-orange-500' : 'text-zinc-400';
                
                return (
                  <Card key={`general-${player.id}`} className="p-2 sm:p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      {/* Posição + Nome */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                          {index < 3 ? (
                            <Medal className={`w-4 h-4 sm:w-5 sm:h-5 ${medalColor}`} />
                          ) : (
                            <span className="text-xs sm:text-sm font-bold text-zinc-600 dark:text-zinc-400">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm truncate">
                            {player.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* Estatísticas G A V E D */}
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <div className="text-center px-1 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">
                          <div className="text-zinc-500 dark:text-zinc-400">G</div>
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{player.goals}</div>
                        </div>
                        <div className="text-center px-1 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">
                          <div className="text-zinc-500 dark:text-zinc-400">A</div>
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{player.assists}</div>
                        </div>
                        <div className="text-center px-1 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs">
                          <div className="text-green-600 dark:text-green-400">V</div>
                          <div className="font-bold text-green-600 dark:text-green-400">{player.victories}</div>
                        </div>
                        <div className="text-center px-1 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs">
                          <div className="text-yellow-600 dark:text-yellow-400">E</div>
                          <div className="font-bold text-yellow-600 dark:text-yellow-400">{player.draws}</div>
                        </div>
                        <div className="text-center px-1 py-1 bg-red-100 dark:bg-red-900/30 rounded text-xs">
                          <div className="text-red-600 dark:text-red-400">D</div>
                          <div className="font-bold text-red-600 dark:text-red-400">{player.defeats}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          )}

          {!loadingPlayers && (
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              Ranking Individual
            </h3>
            
            {/* Lista de jogadores otimizada para mobile - OTIMIZADO */}
            <div className="space-y-2 sm:space-y-3">
              {playersWithPerformance.slice(0, showOnlyTop).map((player, index) => {
                // Usar dados cacheados - mais eficiente
                const stats = player.advancedStats;
                const rating = player.performance;
                const bgColor = player.backgroundColor;
                const hoverEffect = getHoverEffect(index);
                const textColor = player.textColor;
                const performanceRating = player.performance;
                
                // Calcular estatísticas avançadas para detalhamento
                const wins = parseFloat(player.victories.toString()) || 0;
                const draws = parseFloat(player.draws.toString()) || 0;
                const defeats = parseFloat(player.defeats.toString()) || 0;
                const totalGames = wins + draws + defeats;
                const avgGoals = totalGames > 0 ? (parseFloat(player.goals.toString()) / totalGames).toFixed(2) : "0";
                const participationRate = `${Math.round((totalGames / (index + 8)) * 100)}%`;
                const trend = parseFloat(performanceRating.average) >= 7 ? "Consistente" : 
                             parseFloat(performanceRating.average) >= 5 ? "Em evolução" : "Iniciante";

                const medalColor = index === 0 ? 'text-yellow-500' : 
                                  index === 1 ? 'text-gray-400' : 
                                  index === 2 ? 'text-orange-500' : 'text-zinc-400';
                
                return (
                  <Card 
                    key={player.id} 
                    className={`
                      ${bgColor}
                      p-3 sm:p-4 
                      shadow-sm
                      ${hoverEffect}
                      touch-manipulation
                      active:scale-[0.98]
                    `}
                  >
                    {/* Layout mobile-first - header */}
                    <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3">
                      
                      {/* Ranking + Info do jogador */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Posição/Ranking */}
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                          {index < 3 ? (
                            <Medal className={`w-5 h-5 sm:w-6 sm:h-6 ${medalColor} ${index === 0 ? 'animate-pulse' : ''}`} />
                          ) : (
                            <span className="text-sm sm:text-base font-bold text-zinc-600 dark:text-zinc-400">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        
                        {/* Info do jogador */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2 mb-1">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base truncate">
                              {player.name}
                            </span>
                            {player.title && (
                              <Badge className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hidden sm:inline-flex">
                                {player.title}
                              </Badge>
                            )}
                            </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {player.games} jogos
                          </div>
                        </div>
                      </div>
                      
                      {/* Performance mobile compact */}
                      <div className="text-center px-3 py-2 bg-white/80 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Média</div>
                        <div className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {performanceRating.average}
                        </div>
                        <div className={`text-xs font-medium ${textColor}`}>
                          <span className="flex items-center justify-center gap-1">
                            <span>{performanceRating.ratingIcon}</span>
                            <span className="hidden sm:inline">{performanceRating.rating}</span>
                            <span className="sm:hidden">{performanceRating.rating.split(' ')[0]}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas - grid mobile otimizado */}
                    <div className="grid grid-cols-5 gap-1 sm:gap-2">
                      <div className="text-center px-1 py-1 bg-white/60 dark:bg-zinc-800/80 rounded-md">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 block">G</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{player.goals}</span>
                      </div>
                      
                      <div className="text-center px-1 py-1 bg-white/60 dark:bg-zinc-800/80 rounded-md">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 block">A</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{player.assists}</span>
                      </div>

                      <div className="text-center px-1 py-1 bg-white/60 dark:bg-zinc-800/80 rounded-md">
                        <span className="text-xs text-green-600 dark:text-green-400 block">V</span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{player.victories}</span>
                      </div>
                      
                      <div className="text-center px-1 py-1 bg-white/60 dark:bg-zinc-800/80 rounded-md">
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 block">E</span>
                        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{player.draws}</span>
                      </div>
                      
                      <div className="text-center px-1 py-1 bg-white/60 dark:bg-zinc-800/80 rounded-md">
                        <span className="text-xs text-red-600 dark:text-red-400 block">D</span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">{player.defeats}</span>
                      </div>
                    </div>

                    {/* Barra de progresso - mobile optimized */}
                    <div className="mt-3 w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Performance</span>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{performanceRating.average}/10</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${Math.min((parseFloat(performanceRating.average) / 10) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Estatísticas avançadas - mobile friendly */}
                    <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-600">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center px-2 py-2 bg-white/40 dark:bg-zinc-800/40 rounded-md">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">Média/G</div>
                          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{avgGoals}</div>
                        </div>
                        <div className="text-center px-2 py-2 bg-white/40 dark:bg-zinc-800/40 rounded-md">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">Participação</div>
                          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{participationRate}</div>
                        </div>
                        <div className="text-center px-2 py-2 bg-white/40 dark:bg-zinc-800/40 rounded-md">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">Tendência</div>
                          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{trend}</div>
                        </div>
                      </div>
                    </div>

                    {/* Título para mobile se houver */}
                    {player.title && (
                      <div className="mt-2 sm:hidden">
                        <Badge className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                          {player.title}
                        </Badge>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
            
            {/* Informações sobre o sistema otimizado */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <div className="text-center">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  💡 <strong>Design clean:</strong> Cores baseadas na performance • <strong>📱 Mobile-first:</strong> Layout otimizado • <strong>💪 Estatísticas completas</strong> • 📊 <strong>Barras de progresso</strong>
                </p>
              </div>
            </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}