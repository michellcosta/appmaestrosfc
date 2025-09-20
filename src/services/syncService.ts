import { GameMatch } from '@/store/gamesStore';

const SYNC_ENDPOINT = '/api/sync/data';

export interface SyncData {
  matches: GameMatch[];
  lastUpdated: number;
  updatedBy?: string;
}

export class SyncService {
  // Salvar dados no servidor
  static async saveToServer(matches: GameMatch[], userId?: string): Promise<boolean> {
    try {
      const response = await fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matches,
          userId
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erro ao salvar dados no servidor:', error);
      return false;
    }
  }

  // Recuperar dados do servidor
  static async loadFromServer(): Promise<SyncData | null> {
    try {
      const response = await fetch(SYNC_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar dados do servidor:', error);
      return null;
    }
  }

  // Sincronizar dados locais com servidor
  static async syncWithServer(localMatches: GameMatch[], userId?: string): Promise<GameMatch[] | null> {
    try {
      // 1. Primeiro, verificar se há dados no servidor
      const serverData = await this.loadFromServer();
      
      if (serverData && serverData.matches && serverData.matches.length > 0) {
        // Se há dados no servidor, fazer merge inteligente
        console.log('Fazendo merge dos dados locais com servidor');
        
        // Criar um mapa dos dados do servidor por ID
        const serverMatchesMap = new Map();
        serverData.matches.forEach(match => {
          serverMatchesMap.set(match.id, match);
        });
        
        // Fazer merge: usar dados mais recentes baseado em createdAt
        const mergedMatches: GameMatch[] = [];
        const processedIds = new Set();
        
        // Processar dados locais
        localMatches.forEach(localMatch => {
          const serverMatch = serverMatchesMap.get(localMatch.id);
          if (serverMatch) {
            // Se existe no servidor, usar o mais recente
            if (localMatch.createdAt > serverMatch.createdAt) {
              mergedMatches.push(localMatch);
            } else {
              mergedMatches.push(serverMatch);
            }
          } else {
            // Se não existe no servidor, adicionar dados locais
            mergedMatches.push(localMatch);
          }
          processedIds.add(localMatch.id);
        });
        
        // Adicionar dados do servidor que não estão nos dados locais
        serverData.matches.forEach(serverMatch => {
          if (!processedIds.has(serverMatch.id)) {
            mergedMatches.push(serverMatch);
          }
        });
        
        // Salvar dados merged no servidor
        const saveSuccess = await this.saveToServer(mergedMatches, userId);
        
        if (saveSuccess) {
          console.log('Dados sincronizados e merged com sucesso');
          return mergedMatches;
        } else {
          console.warn('Falha ao salvar dados merged no servidor');
          return serverData.matches;
        }
      } else {
        // Se não há dados no servidor, salvar dados locais
        console.log('Salvando dados locais no servidor (primeiro sync)');
        const saveSuccess = await this.saveToServer(localMatches, userId);
        
        if (saveSuccess) {
          return localMatches;
        } else {
          console.warn('Falha ao salvar dados locais no servidor');
          return null;
        }
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return null;
    }
  }

  // Verificar se há dados mais recentes no servidor
  static async hasNewerData(localTimestamp: number): Promise<boolean> {
    try {
      const serverData = await this.loadFromServer();
      
      if (serverData && serverData.lastUpdated) {
        return serverData.lastUpdated > localTimestamp;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar dados mais recentes:', error);
      return false;
    }
  }

  // Limpar dados do servidor
  static async clearServerData(): Promise<boolean> {
    try {
      const response = await fetch(SYNC_ENDPOINT, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erro ao limpar dados do servidor:', error);
      return false;
    }
  }
}