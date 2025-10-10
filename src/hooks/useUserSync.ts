import { useAuth } from '@/auth/OfflineAuthProvider';
import { useEffect } from 'react';
import { usePlayersConvex } from './usePlayersConvex';

/**
 * Hook para sincronizar automaticamente o usuário logado com a tabela de jogadores
 * Isso garante que quando um usuário faz login, ele aparece na lista de "Gerenciar Jogadores"
 */
export function useUserSync() {
    const { user } = useAuth();
    const { syncProfileToPlayer } = usePlayersConvex();

    useEffect(() => {
        const syncUser = async () => {
            if (user && user.email && user.name) {
                try {
                    console.log('🔄 Sincronizando usuário com tabela de jogadores:', user.email);

                    // Determinar o role correto
                    const role = user.role as 'owner' | 'admin' | 'aux' | 'player' | undefined;

                    await syncProfileToPlayer(user.email, user.name, role);

                    console.log('✅ Usuário sincronizado com sucesso');
                } catch (error) {
                    console.error('❌ Erro ao sincronizar usuário:', error);
                    // Não lança erro para não quebrar a aplicação
                }
            }
        };

        // Executar sincronização após um pequeno delay para garantir que o Convex está pronto
        const timer = setTimeout(() => {
            syncUser();
        }, 1000);

        return () => clearTimeout(timer);
    }, [user, syncProfileToPlayer]);

    return null;
}

