import { useCallback } from 'react';
import { useDataCache } from './useDataCache';
import { validateStorageData, sanitizePlayerData, PlayerData, ValidationResult } from '@/utils/validation';

interface Player {
  id: number;
  name: string;
  team: string;
  goals: number;
  assists: number;
  games: number;
  victories: number;
  draws: number;
  defeats: number;
  medals?: string;
  title?: string;
}

interface PlayersCacheOptions {
  ttl?: number;
  maxSize?: number;
}

export function usePlayersCache(options: PlayersCacheOptions = {}) {
  const { ttl = 10 * 60 * 1000, maxSize = 50 } = options; // Default 10 minutes TTL

  // Função para carregar jogadores do localStorage com validação
  const loadPlayersFromStorage = useCallback((): Player[] => {
    try {
      // Tentar diferentes chaves possíveis no localStorage
      const possibleKeys = [
        'offline_players', // Chave principal usada pelo OwnerDashboard
        'offlinePlayers',
        'players',
        'registeredPlayers',
        'nexus-players',
        'nexus_players'
      ];

      let validPlayers: Player[] = [];
      let validationErrors: string[] = [];

      for (const key of possibleKeys) {
        const validationResult = validateStorageData(key);
        
        if (validationResult.isValid && validationResult.sanitizedData) {
          console.log(`✅ Jogadores válidos carregados do localStorage (chave: ${key}):`, validationResult.sanitizedData.length);
          
          // Converter para formato Player
          validPlayers = validationResult.sanitizedData.map(player => ({
            id: typeof player.id === 'string' ? parseInt(player.id) || Date.now() : player.id,
            name: player.name,
            team: player.team || '',
            goals: player.goals,
            assists: player.assists,
            games: player.games,
            victories: player.victories,
            draws: player.draws,
            defeats: player.defeats,
            medals: player.medals || '',
            title: player.title || ''
          }));
          
          // Log de warnings se houver
          if (validationResult.warnings.length > 0) {
            console.warn(`⚠️ Warnings para ${key}:`, validationResult.warnings);
          }
          
          break; // Usar primeiro conjunto válido encontrado
        } else if (validationResult.errors.length > 0) {
          validationErrors.push(`${key}: ${validationResult.errors.join(', ')}`);
        }
      }

      if (validPlayers.length === 0) {
        if (validationErrors.length > 0) {
          console.warn('⚠️ Erros de validação encontrados:', validationErrors);
        }
        console.log('⚠️ Nenhum jogador válido encontrado no localStorage');
        return [];
      }

      return validPlayers;
    } catch (error) {
      console.error('❌ Erro ao carregar jogadores do localStorage:', error);
      return [];
    }
  }, []);

  // Usar o hook de cache para gerenciar os dados dos jogadores
  const {
    data: players,
    loading,
    error,
    refresh,
    invalidateCache,
    clearCache,
    isCached,
    cacheStats
  } = useDataCache<Player[]>(
    'players-cache',
    loadPlayersFromStorage,
    { ttl, maxSize }
  );

  // Função para adicionar um novo jogador ao cache com validação
  const addPlayer = useCallback((newPlayerData: any) => {
    if (!players) return;
    
    // Validar e sanitizar dados do novo jogador
    const sanitizedPlayer = sanitizePlayerData(newPlayerData);
    
    // Verificar se jogador já existe
    const existingPlayer = players.find(p => p.id === sanitizedPlayer.id);
    if (existingPlayer) {
      console.warn('⚠️ Jogador com ID já existe:', sanitizedPlayer.id);
      return;
    }
    
    const updatedPlayers = [...players, {
      id: typeof sanitizedPlayer.id === 'string' ? parseInt(sanitizedPlayer.id) || Date.now() : sanitizedPlayer.id,
      name: sanitizedPlayer.name,
      team: sanitizedPlayer.team,
      goals: sanitizedPlayer.goals,
      assists: sanitizedPlayer.assists,
      games: sanitizedPlayer.games,
      victories: sanitizedPlayer.victories,
      draws: sanitizedPlayer.draws,
      defeats: sanitizedPlayer.defeats,
      medals: sanitizedPlayer.medals,
      title: sanitizedPlayer.title
    }];
    
    // Atualizar localStorage
    try {
      localStorage.setItem('offlinePlayers', JSON.stringify(updatedPlayers));
      console.log('✅ Jogador adicionado ao localStorage:', sanitizedPlayer.name);
    } catch (error) {
      console.error('❌ Erro ao salvar jogador no localStorage:', error);
    }
    
    // Invalidar cache para forçar reload
    invalidateCache();
  }, [players, invalidateCache]);

  // Função para atualizar um jogador no cache com validação
  const updatePlayer = useCallback((playerId: number, updates: Partial<Player>) => {
    if (!players) return;
    
    // Encontrar jogador existente
    const existingPlayer = players.find(p => p.id === playerId);
    if (!existingPlayer) {
      console.warn('⚠️ Jogador não encontrado para atualização:', playerId);
      return;
    }
    
    // Sanitizar dados de atualização
    const sanitizedUpdates = sanitizePlayerData({ ...existingPlayer, ...updates });
    
    const updatedPlayers = players.map(player => 
      player.id === playerId ? {
        id: typeof sanitizedUpdates.id === 'string' ? parseInt(sanitizedUpdates.id) || playerId : sanitizedUpdates.id,
        name: sanitizedUpdates.name,
        team: sanitizedUpdates.team,
        goals: sanitizedUpdates.goals,
        assists: sanitizedUpdates.assists,
        games: sanitizedUpdates.games,
        victories: sanitizedUpdates.victories,
        draws: sanitizedUpdates.draws,
        defeats: sanitizedUpdates.defeats,
        medals: sanitizedUpdates.medals,
        title: sanitizedUpdates.title
      } : player
    );
    
    // Atualizar localStorage
    try {
      localStorage.setItem('offlinePlayers', JSON.stringify(updatedPlayers));
      console.log('✅ Jogador atualizado no localStorage:', sanitizedUpdates.name);
    } catch (error) {
      console.error('❌ Erro ao atualizar jogador no localStorage:', error);
    }
    
    // Invalidar cache para forçar reload
    invalidateCache();
  }, [players, invalidateCache]);

  // Função para remover um jogador do cache
  const removePlayer = useCallback((playerId: number) => {
    if (!players) return;
    
    const updatedPlayers = players.filter(player => player.id !== playerId);
    
    // Atualizar localStorage
    try {
      localStorage.setItem('offlinePlayers', JSON.stringify(updatedPlayers));
      console.log('✅ Jogador removido do localStorage');
    } catch (error) {
      console.error('❌ Erro ao remover jogador do localStorage:', error);
    }
    
    // Invalidar cache para forçar reload
    invalidateCache();
  }, [players, invalidateCache]);

  // Função para limpar todos os jogadores
  const clearAllPlayers = useCallback(() => {
    // Limpar localStorage
    try {
      localStorage.removeItem('offlinePlayers');
      localStorage.removeItem('players');
      localStorage.removeItem('registeredPlayers');
      localStorage.removeItem('nexus-players');
      localStorage.removeItem('nexus_players');
      console.log('✅ Todos os jogadores removidos do localStorage');
    } catch (error) {
      console.error('❌ Erro ao limpar jogadores do localStorage:', error);
    }
    
    // Limpar cache
    clearCache();
  }, [clearCache]);

  // Função para sincronizar com localStorage
  const syncWithStorage = useCallback(() => {
    const storagePlayers = loadPlayersFromStorage();
    if (storagePlayers.length > 0) {
      invalidateCache();
    }
  }, [loadPlayersFromStorage, invalidateCache]);

  return {
    players: players || [],
    loading,
    error,
    isCached,
    cacheStats,
    refresh,
    addPlayer,
    updatePlayer,
    removePlayer,
    clearAllPlayers,
    syncWithStorage,
    invalidateCache
  };
}
