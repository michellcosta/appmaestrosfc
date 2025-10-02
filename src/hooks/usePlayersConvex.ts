import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export interface Player {
    _id: Id<"players">;
    name: string;
    email: string;
    role: string;
    membership?: string;
    position?: string;
    stars?: number;
    approved: boolean;
    notifications_enabled: boolean;
    created_at: number;
    updated_at: number;
    active: boolean;
}

export interface CreatePlayerData {
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'aux' | 'player';
    membership?: 'mensalista' | 'diarista';
    position?: 'Goleiro' | 'Zagueiro' | 'Meia' | 'Atacante';
    stars?: number;
    approved?: boolean;
    notifications_enabled?: boolean;
}

export interface UpdatePlayerData {
    id: Id<"players">;
    name?: string;
    email?: string;
    role?: 'owner' | 'admin' | 'aux' | 'player';
    membership?: 'mensalista' | 'diarista';
    position?: 'Goleiro' | 'Zagueiro' | 'Meia' | 'Atacante';
    stars?: number;
    approved?: boolean;
    notifications_enabled?: boolean;
}

export function usePlayersConvex() {
    // Queries
    const players = useQuery(api.managedPlayers.list) || [];

    // Mutations
    const createPlayerMutation = useMutation(api.managedPlayers.create);
    const updatePlayerMutation = useMutation(api.managedPlayers.update);
    const removePlayerMutation = useMutation(api.managedPlayers.remove);
    const toggleApprovalMutation = useMutation(api.managedPlayers.toggleApproval);

    // Helper functions
    const createPlayer = async (data: CreatePlayerData): Promise<Id<"players">> => {
        try {
            const playerId = await createPlayerMutation({
                name: data.name,
                email: data.email,
                role: data.role,
                membership: data.membership,
                position: data.position,
                stars: data.stars,
                approved: data.approved,
                notifications_enabled: data.notifications_enabled
            });
            return playerId;
        } catch (error) {
            console.error('Erro ao criar jogador:', error);
            throw error;
        }
    };

    const updatePlayer = async (data: UpdatePlayerData): Promise<void> => {
        try {
            await updatePlayerMutation(data);
        } catch (error) {
            console.error('Erro ao atualizar jogador:', error);
            throw error;
        }
    };

    const removePlayer = async (id: Id<"players">): Promise<void> => {
        try {
            await removePlayerMutation({ id });
        } catch (error) {
            console.error('Erro ao remover jogador:', error);
            throw error;
        }
    };

    const toggleApproval = async (id: Id<"players">): Promise<void> => {
        try {
            await toggleApprovalMutation({ id });
        } catch (error) {
            console.error('Erro ao alterar aprovação:', error);
            throw error;
        }
    };

    // Filtered data
    const approvedPlayers = players.filter(player => player.approved);
    const pendingPlayers = players.filter(player => !player.approved);
    const playersByRole = (role: string) => players.filter(player => player.role === role);
    const activePlayers = players.filter(player => player.active);

    // Statistics
    const stats = {
        total: players.length,
        approved: approvedPlayers.length,
        pending: pendingPlayers.length,
        owners: playersByRole('owner').length,
        admins: playersByRole('admin').length,
        auxiliares: playersByRole('aux').length,
        jogadores: playersByRole('player').length,
        mensalistas: players.filter(p => p.membership === 'mensalista').length,
        diaristas: players.filter(p => p.membership === 'diarista').length
    };

    return {
        // Data
        players,
        approvedPlayers,
        pendingPlayers,
        activePlayers,
        stats,

        // Actions
        createPlayer,
        updatePlayer,
        removePlayer,
        toggleApproval,

        // Helpers
        playersByRole,

        // Loading states (Convex handles this automatically)
        isLoading: players === undefined
    };
}

