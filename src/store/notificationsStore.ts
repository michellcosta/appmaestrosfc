import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

export interface Notification {
  id: string;
  type: 'diarist_request' | 'match_update' | 'general';
  title: string;
  message: string;
  matchId: string;
  requesterId: string;
  requesterName: string;
  createdAt: Date;
  read: boolean;
  targetRoles: string[]; // roles que devem receber a notificação
}

interface NotificationsStore {
  notifications: Notification[];
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  
  // Getters
  getUnreadCount: () => number;
  getNotificationsForUser: (userRole: string) => Notification[];
  getUnreadNotificationsForUser: (userRole: string) => Notification[];
  
  // Specific notification creators
  createDiaristRequestNotification: (matchId: string, requester: User, matchDate: string) => void;
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [notification, ...state.notifications],
        }));
      },

      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        }));
      },

      removeNotification: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== notificationId
          ),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },

      getUnreadCount: () => {
        return get().notifications.filter((notification) => !notification.read).length;
      },

      getNotificationsForUser: (userRole) => {
        return get().notifications.filter((notification) =>
          notification.targetRoles.includes(userRole)
        );
      },

      getUnreadNotificationsForUser: (userRole) => {
        return get().notifications.filter(
          (notification) =>
            notification.targetRoles.includes(userRole) && !notification.read
        );
      },

      createDiaristRequestNotification: (matchId, requester, matchDate) => {
        const { addNotification } = get();
        
        addNotification({
          type: 'diarist_request',
          title: 'Nova Solicitação de Diarista',
          message: `${requester.name} solicitou participação na partida de ${matchDate}`,
          matchId,
          requesterId: requester.id,
          requesterName: requester.name,
          targetRoles: ['owner', 'admin', 'aux'], // Apenas admins recebem
        });
      },
    }),
    {
      name: 'notifications-storage',
      version: 1,
    }
  )
);