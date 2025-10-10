import { useMatchStore } from '@/store/matchStore';
import { usePlayerStatsStore } from '@/store/playerStatsStore';
import { useMutation } from 'convex/react';
import { useEffect, useState } from 'react';
import { api } from '../../convex/_generated/api';

export function useAutoSync() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastSync, setLastSync] = useState<number>(Date.now());
    const [isSyncing, setIsSyncing] = useState(false);
    const { stats: offlineStats, resetStats } = usePlayerStatsStore();
    const { events: matchEvents, clearEvents } = useMatchStore();

    // Mutations do Convex para sincronização
    const updatePlayerStats = useMutation(api.playerStats.update);

    useEffect(() => {
        const handleOnline = () => {
            console.log('🌐 Conexão restaurada - Iniciando sincronização...');
            setIsOnline(true);
            setLastSync(Date.now());

            // Aqui você pode adicionar lógica para sincronizar dados offline com Convex
            // Por exemplo:
            // - Enviar estatísticas offline para o Convex
            // - Enviar eventos de partida para o Convex
            // - Atualizar dados locais com dados do servidor

            syncOfflineData();
        };

        const handleOffline = () => {
            console.log('📴 Conexão perdida - Modo offline ativado');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const syncOfflineData = async () => {
        if (isSyncing) return;

        try {
            setIsSyncing(true);
            console.log('🔄 Sincronizando dados offline...');

            // Dados para sincronizar
            const statsToSync = offlineStats;
            const eventsToSync = matchEvents;

            console.log(`📊 Estatísticas para sincronizar: ${statsToSync.length}`);
            console.log(`⚽ Eventos para sincronizar: ${eventsToSync.length}`);

            // Sincronizar estatísticas dos jogadores
            for (const stat of statsToSync) {
                try {
                    // Aqui você pode implementar a lógica real de sincronização
                    // Por exemplo, buscar o player_id real do Convex baseado no nome
                    // e depois atualizar as estatísticas

                    console.log(`📈 Sincronizando estatísticas de: ${stat.name}`);

                    // Simular delay de rede
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (error) {
                    console.error(`❌ Erro ao sincronizar ${stat.name}:`, error);
                }
            }

            // Sincronizar eventos de partida
            for (const event of eventsToSync) {
                try {
                    console.log(`⚽ Sincronizando evento: ${event.id}`);

                    // Aqui você pode implementar a lógica real de sincronização de eventos
                    // Por exemplo, criar match events no Convex

                    // Simular delay de rede
                    await new Promise(resolve => setTimeout(resolve, 50));

                } catch (error) {
                    console.error(`❌ Erro ao sincronizar evento ${event.id}:`, error);
                }
            }

            console.log('✅ Sincronização concluída!');
            setLastSync(Date.now());

            // Opcional: Limpar dados offline após sincronização bem-sucedida
            // Descomente as linhas abaixo se quiser limpar os dados offline após sincronizar
            // resetStats();
            // clearEvents();

        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const forceSync = () => {
        if (isOnline) {
            syncOfflineData();
        } else {
            console.log('📴 Sem conexão - Sincronização não disponível');
        }
    };

    return {
        isOnline,
        lastSync,
        isSyncing,
        offlineStatsCount: offlineStats.length,
        matchEventsCount: matchEvents.length,
        forceSync
    };
}
