import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export interface Invite {
    _id: Id<"invites">;
    email: string;
    role: string;
    membership?: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    token: string;
    created_by: string;
    created_at: number;
    expires_at: number;
    consumed_at?: number;
    used_count: number;
    creator_name?: string;
}

export interface CreateInviteData {
    email: string;
    role: string;
    membership?: string;
    expiresInDays?: number;
}

export function useInviteSystemConvex() {
    // Queries
    const invites = useQuery(api.inviteSystem.listInvites);
    const inviteStats = useQuery(api.inviteSystem.getInviteStats);

    // Mutations
    const createInviteMutation = useMutation(api.inviteSystem.createInvite);
    const acceptInviteMutation = useMutation(api.inviteSystem.acceptInvite);
    const revokeInviteMutation = useMutation(api.inviteSystem.revokeInvite);

    // Helper functions
    const createInvite = async (data: CreateInviteData, createdBy: string): Promise<Id<"invites">> => {
        try {
            const inviteId = await createInviteMutation({
                email: data.email,
                role: data.role,
                membership: data.membership,
                createdBy,
                expiresInDays: data.expiresInDays
            });
            return inviteId;
        } catch (error) {
            console.error('Erro ao criar convite:', error);
            throw error;
        }
    };

    const acceptInvite = async (token: string, userId: string): Promise<Id<"players">> => {
        try {
            const playerId = await acceptInviteMutation({ token, userId });
            return playerId;
        } catch (error) {
            console.error('Erro ao aceitar convite:', error);
            throw error;
        }
    };

    const revokeInvite = async (inviteId: Id<"invites">): Promise<void> => {
        try {
            await revokeInviteMutation({ inviteId });
        } catch (error) {
            console.error('Erro ao revogar convite:', error);
            throw error;
        }
    };

    // Filtered data
    const pendingInvites = invites?.filter(invite => invite.status === 'pending') || [];
    const acceptedInvites = invites?.filter(invite => invite.status === 'accepted') || [];
    const declinedInvites = invites?.filter(invite => invite.status === 'declined') || [];
    const expiredInvites = invites?.filter(invite =>
        invite.status === 'pending' && Date.now() > invite.expires_at
    ) || [];

    return {
        // Data
        invites: invites || [],
        pendingInvites,
        acceptedInvites,
        declinedInvites,
        expiredInvites,
        inviteStats: inviteStats || {
            total: 0,
            pending: 0,
            accepted: 0,
            declined: 0,
            expired: 0
        },

        // Actions
        createInvite,
        acceptInvite,
        revokeInvite,

        // Loading states
        isLoading: invites === undefined,
        isStatsLoading: inviteStats === undefined
    };
}

// Hook para validar token de convite
export function useValidateInviteToken(token: string) {
    const validation = useQuery(api.inviteSystem.validateInviteToken, { token });

    return {
        isValid: validation?.valid || false,
        invite: validation?.invite || null,
        error: validation?.error || null,
        loading: validation === undefined
    };
}
