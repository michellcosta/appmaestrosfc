import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface Player {
    id: string;
    email: string;
    role: string;
    membership?: string;
    position?: string;
    stars?: number;
    notifications_enabled: boolean;
    approved: boolean;
    updated_at: string;
}

interface UsePlayersReturn {
    players: Player[];
    loading: boolean;
    error: string | null;
    loadPlayers: () => Promise<void>;
    createPlayer: (playerData: Omit<Player, 'id' | 'updated_at'>) => Promise<void>;
    updatePlayer: (id: string, updates: Partial<Player>) => Promise<void>;
    deletePlayer: (id: string) => Promise<void>;
    toggleApproval: (id: string) => Promise<void>;
    getApprovedPlayers: () => Player[];
    getPlayersByPosition: (position: string) => Player[];
}

export function usePlayers(): UsePlayersReturn {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPlayers = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (fetchError) throw fetchError;

            setPlayers(data || []);
        } catch (err) {
            console.error('Erro ao carregar jogadores:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    const createPlayer = async (playerData: Omit<Player, 'id' | 'updated_at'>) => {
        try {
            setError(null);

            // Criar usuário no Supabase Auth primeiro
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: playerData.email,
                password: 'temp123456', // Senha temporária
                email_confirm: true
            });

            if (authError) throw authError;

            // Criar perfil do jogador
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    ...playerData
                });

            if (profileError) throw profileError;

            // Recarregar lista de jogadores
            await loadPlayers();
        } catch (err) {
            console.error('Erro ao criar jogador:', err);
            setError(err instanceof Error ? err.message : 'Erro ao criar jogador');
            throw err;
        }
    };

    const updatePlayer = async (id: string, updates: Partial<Player>) => {
        try {
            setError(null);

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            // Recarregar lista de jogadores
            await loadPlayers();
        } catch (err) {
            console.error('Erro ao atualizar jogador:', err);
            setError(err instanceof Error ? err.message : 'Erro ao atualizar jogador');
            throw err;
        }
    };

    const deletePlayer = async (id: string) => {
        try {
            setError(null);

            // Deletar do Supabase Auth
            const { error: authError } = await supabase.auth.admin.deleteUser(id);

            // Deletar perfil (cascade deve deletar automaticamente)
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (authError) console.error('Erro ao deletar do Auth:', authError);
            if (profileError) throw profileError;

            // Recarregar lista de jogadores
            await loadPlayers();
        } catch (err) {
            console.error('Erro ao excluir jogador:', err);
            setError(err instanceof Error ? err.message : 'Erro ao excluir jogador');
            throw err;
        }
    };

    const toggleApproval = async (id: string) => {
        try {
            setError(null);

            const player = players.find(p => p.id === id);
            if (!player) throw new Error('Jogador não encontrado');

            const { error } = await supabase
                .from('profiles')
                .update({ approved: !player.approved })
                .eq('id', id);

            if (error) throw error;

            // Recarregar lista de jogadores
            await loadPlayers();
        } catch (err) {
            console.error('Erro ao alterar aprovação:', err);
            setError(err instanceof Error ? err.message : 'Erro ao alterar aprovação');
            throw err;
        }
    };

    const getApprovedPlayers = (): Player[] => {
        return players.filter(player => player.approved && player.role === 'player');
    };

    const getPlayersByPosition = (position: string): Player[] => {
        return players.filter(player =>
            player.approved &&
            player.role === 'player' &&
            player.position === position
        );
    };

    useEffect(() => {
        loadPlayers();
    }, []);

    return {
        players,
        loading,
        error,
        loadPlayers,
        createPlayer,
        updatePlayer,
        deletePlayer,
        toggleApproval,
        getApprovedPlayers,
        getPlayersByPosition
    };
}
