/**
 * Notification System Component
 * Sistema completo de notificações push e in-app
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff, 
  Settings, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'custom';
  title: string;
  message: string;
  icon?: React.ReactNode;
  actions?: NotificationAction[];
  duration?: number; // em ms, 0 = não expira
  persistent?: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'user' | 'security' | 'performance' | 'update';
  timestamp: Date;
  read: boolean;
  data?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface NotificationSettings {
  pushEnabled: boolean;
  inAppEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  categories: {
    system: boolean;
    user: boolean;
    security: boolean;
    performance: boolean;
    update: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
  frequency: 'all' | 'important' | 'urgent';
}

interface NotificationSystemProps {
  notifications: Notification[];
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  onNotificationRead: (id: string) => void;
  onNotificationDismiss: (id: string) => void;
  onNotificationAction: (notificationId: string, actionId: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  settings,
  onSettingsChange,
  onNotificationRead,
  onNotificationDismiss,
  onNotificationAction
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Verificar permissões de notificação
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onNotificationDismiss(notification.id);
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onNotificationDismiss]);

  // Reproduzir som de notificação
  const playNotificationSound = () => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.warn);
    }
  };

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Notificações não suportadas neste navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  };

  // Enviar notificação push
  const sendPushNotification = (notification: Notification) => {
    if (!settings.pushEnabled || permissionStatus !== 'granted') return;

    const pushNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: notification.id,
      requireInteraction: notification.persistent,
      silent: !settings.soundEnabled,
      vibrate: settings.vibrationEnabled ? [200, 100, 200] : undefined,
      data: notification.data
    });

    pushNotification.onclick = () => {
      window.focus();
      onNotificationRead(notification.id);
      pushNotification.close();
    };
  };

  // Obter ícone baseado no tipo
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Obter cor baseada na prioridade
  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low':
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'border-gray-300 bg-white dark:bg-gray-800';
    }
  };

  // Filtrar notificações baseado nas configurações
  const filteredNotifications = notifications.filter(notification => {
    if (!settings.categories[notification.category]) return false;
    
    if (settings.frequency === 'urgent' && notification.priority !== 'urgent') return false;
    if (settings.frequency === 'important' && !['high', 'urgent'].includes(notification.priority)) return false;
    
    return true;
  });

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  return (
    <>
      {/* Botão de notificações */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Dropdown de notificações */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <CardTitle className="text-sm">Notificações</CardTitle>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {unreadCount} não lidas
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        notification.read 
                          ? 'opacity-60' 
                          : getPriorityColor(notification.priority)
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {notification.icon || getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {notification.priority}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onNotificationDismiss(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                            
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex space-x-1">
                                {notification.actions.map(action => (
                                  <Button
                                    key={action.id}
                                    variant={action.variant || 'outline'}
                                    size="sm"
                                    onClick={() => onNotificationAction(notification.id, action.id)}
                                    className="text-xs h-6 px-2"
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Configurações de notificação */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Notificações Push</span>
          </div>
          <Switch
            checked={settings.pushEnabled}
            onCheckedChange={(checked) => 
              onSettingsChange({ ...settings, pushEnabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm font-medium">Som</span>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => 
              onSettingsChange({ ...settings, soundEnabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">Vibração</span>
          </div>
          <Switch
            checked={settings.vibrationEnabled}
            onCheckedChange={(checked) => 
              onSettingsChange({ ...settings, vibrationEnabled: checked })
            }
          />
        </div>
      </div>

      {/* Áudio para notificações */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
        <source src="/notification-sound.ogg" type="audio/ogg" />
      </audio>
    </>
  );
};

export default NotificationSystem;



