import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

export interface AttendanceRequest {
    _id: Id<"attendance_requests">;
    user_id: string;
    match_id: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: number;
    reviewed_by?: string;
    reviewed_at?: number;
    user_name?: string;
    user_email?: string;
    reviewer_name?: string;
}

export interface AttendanceStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export function useAttendanceConvex() {
    // Queries
    const attendanceRequests = useQuery(api.attendance.listAttendanceRequests);
    const attendanceStats = useQuery(api.attendance.getAttendanceStats);

    // Mutations
    const createRequestMutation = useMutation(api.attendance.createAttendanceRequest);
    const approveRequestMutation = useMutation(api.attendance.approveAttendanceRequest);
    const rejectRequestMutation = useMutation(api.attendance.rejectAttendanceRequest);

    // Helper functions
    const createAttendanceRequest = async (userId: string, matchId: string): Promise<Id<"attendance_requests">> => {
        try {
            const requestId = await createRequestMutation({ userId, matchId });
            return requestId;
        } catch (error) {
            console.error('Erro ao criar solicitação de presença:', error);
            throw error;
        }
    };

    const approveAttendanceRequest = async (requestId: Id<"attendance_requests">, reviewedBy: string): Promise<void> => {
        try {
            await approveRequestMutation({ requestId, reviewedBy });
        } catch (error) {
            console.error('Erro ao aprovar solicitação:', error);
            throw error;
        }
    };

    const rejectAttendanceRequest = async (requestId: Id<"attendance_requests">, reviewedBy: string): Promise<void> => {
        try {
            await rejectRequestMutation({ requestId, reviewedBy });
        } catch (error) {
            console.error('Erro ao rejeitar solicitação:', error);
            throw error;
        }
    };

    // Filtered data
    const pendingRequests = attendanceRequests?.filter(request => request.status === 'pending') || [];
    const approvedRequests = attendanceRequests?.filter(request => request.status === 'approved') || [];
    const rejectedRequests = attendanceRequests?.filter(request => request.status === 'rejected') || [];

    return {
        // Data
        attendanceRequests: attendanceRequests || [],
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        attendanceStats: attendanceStats || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        },

        // Actions
        createAttendanceRequest,
        approveAttendanceRequest,
        rejectAttendanceRequest,

        // Loading states
        isLoading: attendanceRequests === undefined,
        isStatsLoading: attendanceStats === undefined
    };
}

// Hook para solicitações de uma partida específica
export function useMatchAttendanceRequests(matchId: string) {
    const requests = useQuery(api.attendance.listAttendanceRequests, { matchId });
    const stats = useQuery(api.attendance.getAttendanceStats, { matchId });

    return {
        requests: requests || [],
        stats: stats || {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        },
        loading: requests === undefined,
        error: null
    };
}

// Hook para solicitações de um usuário específico
export function useUserAttendanceRequests(userId: string) {
    const requests = useQuery(api.attendance.listAttendanceRequests, { userId });

    return {
        requests: requests || [],
        loading: requests === undefined,
        error: null
    };
}
