// import { useMutation, useQuery } from 'convex/react';
// import { api } from '../../convex/_generated/api';

export interface Notification {
    _id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: number;
    read_at?: number;
}

export function useNotificationsConvex() {
    // Mock temporário - será substituído por Convex quando configurado
    const notifications: Notification[] = [];
    const unreadCount = 0;
    const markAsRead = async (notificationId: string) => {
        console.log('📖 Marcando como lida (mock):', notificationId);
        return { success: true };
    };
    const markAllAsRead = async () => {
        console.log('📖 Marcando todas como lidas (mock)');
        return { success: true, count: 0 };
    };
    const deleteNotification = async (notificationId: string) => {
        console.log('🗑️ Deletando notificação (mock):', notificationId);
        return { success: true };
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isLoading: false,
    };
}

export function useCreateNotification() {
    // Mock temporário
    return async (data: { user_id: string; type: string; title: string; message: string }) => {
        console.log('📢 Criando notificação (mock):', data);
        return `notification_${Date.now()}`;
    };
}
