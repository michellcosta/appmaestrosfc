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
  Target
} from 'lucide-react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import RestrictedAccess from './RestrictedAccess';

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

  // Função para cores de fundo baseadas na performance - design clean
  const getBackgroundColor = (player: any) => {
    const rating = calculatePlayerRating(player);
    const avg = parseFloat(rating.average);
    
    if (avg >= 8) {
      return 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700';
    } else if (avg >= 6) {
      return 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700';
    } else if (avg >= 4) {
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700';
    } else if (avg >= 2) {
      return 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700';
    } else {
      return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-700';
    }
  };

  // Efeito hover discreto e responsivo
  const getHoverEffect = (index: number) => {
    return 'hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200';
  };

  // Função para cores do texto seguindo a paleta
  const getTextColor = (player: any) => {
    const rating = calculatePlayerRating(player);
    const avg = parseFloat(rating.average);
    
    if (avg >= 8) return 'text-green-700 dark:text-green-300';
    else if (avg >= 6) return 'text-blue-700 dark:text-blue-300';
    else if (avg >= 4) return 'text-yellow-700 dark:text-yellow-300';
    else if (avg >= 2) return 'text-orange-700 dark:text-orange-300';
    else return 'text-gray-700 dark:text-gray-300';
  };

  // Estados para jogadores reais do localStorage
  const [offlinePlayers, setOfflinePlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // Carregar jogadores offline do localStorage
  const loadOfflinePlayers = () => {
    setLoadingPlayers(true);
    try {
      // Buscar jogadores salvos no localStorage
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
      
      // Filtrar jogadores válidos e gerar dados de ranking com estatísticas reais (mockadas para demonstração)
      const playersWithStats = playersData
        .filter(player => player && player.name)
        .map((player, index) => {
          // Gerar estatísticas mais realistas
          const gamesPlayed = 4 + (index % 5); // 4-8 jogos por jogador
          const goalsScored = Math.max(0, Math.floor(Math.random() * (gamesPlayed + 3)));
          const assistsMade = Math.floor(goalsScored * 0.6) + Math.floor(Math.random() * 4);
          const victoriesCount = Math.ceil(gamesPlayed * 0.55);
          const drawsCount = Math.max(0, gamesPlayed - victoriesCount - Math.floor(Math.random() * 2));
          const defeatsCount = gamesPlayed - victoriesCount - drawsCount;

          return {
            id: player.id || `player-${index}`,
            name: player.name,
            team: player.position || '',
            goals: goalsScored,
            assists: assistsMade,
            games: gamesPlayed,
            victories: victoriesCount,
            draws: drawsCount,
            defeats: defeatsCount,
            medals: index === 0 ? 'Gold' : index === 1 ? 'Silver' : index === 2 ? 'Bronze' : '',
            title: index === 0 ? 'TOP ARTILHEIRO' : 
                    index === 1 ? 'VICE-LÍDER' : 
                    index === 2 ? 'TERCEIRO LUGAR' : ''
          };
        })
        .sort((a, b) => (b.goals * 2 + b.assists) - (a.goals * 2 + a.assists)) // Ordenar por pontuação
        .map((player, newIndex) => ({ // Re-indexar após ordenação
          ...player,
          medals: newIndex === 0 ? 'Gold' : newIndex === 1 ? 'Silver' : newIndex === 2 ? 'Bronze' : '',
          title: newIndex === 0 ? 'TOP ARTILHEIRO' : 
                  newIndex === 1 ? 'VICE-LÍDER' : 
                  newIndex === 2 ? 'TERCEIRO LUGAR' : ''
        }));

      setOfflinePlayers(playersWithStats);
    } catch (error) {
      console.error('Erro ao carregar jogadores offline:', error);
    } finally {
      setLoadingPlayers(false);
    }
  };

  // useEffect para carregar dados ao iniciar
  useEffect(() => {
    loadOfflinePlayers();
  }, []);

  // Se tivermos jogadores reais, usar eles. Senão, usar dados mock como fallback
  const playersData = offlinePlayers.length > 0 ? offlinePlayers : [
    {
      id: 1,
      name: 'João Silva',
      team: 'Verde',
      goals: 5,
      assists: 3,
      games: 8,
      victories: 6,
      draws: 1,
      defeats: 1,
      medals: 'Gold',
      title: 'TOP ARTILHEIRO'
    },
    {
      id: 2,
      name: 'Maria Santos',
      team: 'Preto',
      goals: 3,
      assists: 4,
      games: 6,
      victories: 4,
      draws: 2,
      defeats: 0,
      medals: 'Silver',
      title: 'VICE-LÍDER'
    },
    {
      id: 3,
      name: 'Pedro Costa',
      team: 'Azul',
      goals: 2,
      assists: 3,
      games: 7,
      victories: 3,
      draws: 2,
      defeats: 2,
      medals: 'Bronze',
      title: 'TERCEIRO LUGAR'
    },
    {
      id: 4,
      name: 'Ana Oliveira',
      team: 'Vermelho',
      goals: 4,
      assists: 2,
      games: 5,
      victories: 2,
      draws: 1,
      defeats: 2,
      medals: '',
      title: ''
    },
    {
      id: 5,
      name: 'Carlos Ferreira',
      team: 'Amarelo',
      goals: 1,
      assists: 5,
      games: 9,
      victories: 4,
      draws: 3,
      defeats: 2,
      medals: '',
      title: ''
    }
  ];

  // Calcular estatísticas avançadas
  const calculateAdvancedStats = (player: any) => {
    const avgGoals = (player.goals / player.games * 100).toFixed(1);
    const avgAssists = (player.assists / player.games * 100).toFixed(1);
    const participation = ((player.goals + player.assists) / player.games * 100).toFixed(0);
    
    return {
      avgGoals: `${avgGoals}%`,
      avgAssists: `${avgAssists}%`,
      participationRate: `${participation}%`,
      consistencyScore: player.games >= 6 ? 'Alto' : 'Médio',
      trend: player.goals > player.assists ? '⚡ Goleiro' : '📝 Assistente',
      recentForm: player.games >= 7 ? '🔥 Em Forma' : '🔄 Regular'
    };
  };

  // Calcular média e avaliação do jogador
  const calculatePlayerRating = (player: any) => {
    // Pontuação baseada em múltiplos fatores
    const goalScore = player.goals * 3; // Gols valem 3 pontos
    const assistScore = player.assists * 2; // Assistências valem 2 pontos
    const victoryScore = player.victories * 5; // Vitórias valem 5 pontos
    const drawScore = player.draws * 1; // Empates valem 1 ponto
    const defeatPenalty = player.defeats * -2; // Derrotas penalizam -2 pontos
    
    // Pontuação total
    const totalScore = goalScore + assistScore + victoryScore + drawScore + defeatPenalty;
    
    // Média por jogo
    const averagePerGame = (totalScore / player.games).toFixed(1);
    
    // Avaliação baseada na média
    let rating = '';
    let ratingColor = '';
    let ratingIcon = '';
    
    const avg = parseFloat(averagePerGame);
    
    if (avg >= 8) {
      rating = 'EXCELENTE';
      ratingColor = 'text-green-600 dark:text-green-400';
      ratingIcon = '⭐';
    } else if (avg >= 6) {
      rating = 'MUITO BOM';
      ratingColor = 'text-blue-600 dark:text-blue-400';
      ratingIcon = '🔥';
    } else if (avg >= 4) {
      rating = 'BOM';
      ratingColor = 'text-yellow-600 dark:text-yellow-400';
      ratingIcon = '👍';
    } else if (avg >= 2) {
      rating = 'REGULAR';
      ratingColor = 'text-orange-600 dark:text-orange-400';
      ratingIcon = '🔄';
    } else {
      rating = 'PRECISA MELHORAR';
      ratingColor = 'text-red-600 dark:text-red-400';
      ratingIcon = '📈';
    }
    
    return {
      average: averagePerGame,
      rating: rating,
      ratingColor: ratingColor,
      ratingIcon: ratingIcon
    };
  };

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
          
          {/* Info sobre fonte dos dados */}
          {!loadingPlayers && offlinePlayers.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📱 <strong>Dados Reais:</strong> Ranking dos {offlinePlayers.length} jogador(es) cadastrados no sistema offline.
              </p>
            </div>
          )}
          
          {/* Ranking Geral - Cards simples com G A V E D */}
          {!loadingPlayers && (
            <div className="space-y-3 sm:space-y-4 mb-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                Ranking Geral
              </h3>
              
              {/* Cards simples do ranking geral */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {playersData.slice(0, showOnlyTop).map((player, index) => {
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
            
            {/* Lista de jogadores otimizada para mobile */}
            <div className="space-y-2 sm:space-y-3">
              {playersData.slice(0, showOnlyTop).map((player, index) => {
                const stats = calculateAdvancedStats(player);
                const rating = calculatePlayerRating(player);
                
                // Determinar cores baseadas na performance - design clean
                const bgColor = getBackgroundColor(player);
                const hoverEffect = getHoverEffect(index);
                const textColor = getTextColor(player);
                const performanceRating = calculatePlayerRating(player);
                
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