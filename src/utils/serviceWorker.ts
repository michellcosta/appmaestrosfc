/**
 * Service Worker Manager
 * Gerenciamento de service worker para cache offline
 */

export interface ServiceWorkerConfig {
  cacheName: string;
  version: string;
  offlinePage: string;
  cacheStrategy: 'cacheFirst' | 'networkFirst' | 'staleWhileRevalidate';
  maxCacheSize: number;
  maxCacheAge: number;
}

export interface CacheEntry {
  url: string;
  response: Response;
  timestamp: number;
  size: number;
}

class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private isRegistered = false;

  constructor(config: ServiceWorkerConfig) {
    this.config = config;
  }

  // Registrar service worker
  async register(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker não suportado neste navegador');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.isRegistered = true;
      console.log('✅ Service Worker registrado:', registration);

      // Escutar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
      return false;
    }
  }

  // Desregistrar service worker
  async unregister(): Promise<boolean> {
    if (!this.isRegistered) return true;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      
      this.isRegistered = false;
      console.log('✅ Service Worker desregistrado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao desregistrar Service Worker:', error);
      return false;
    }
  }

  // Verificar se está registrado
  isServiceWorkerRegistered(): boolean {
    return this.isRegistered;
  }

  // Obter status do service worker
  async getStatus(): Promise<{
    registered: boolean;
    controller: ServiceWorker | null;
    state: string | null;
    scope: string | null;
  }> {
    if (!('serviceWorker' in navigator)) {
      return {
        registered: false,
        controller: null,
        state: null,
        scope: null
      };
    }

    const controller = navigator.serviceWorker.controller;
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    return {
      registered: registrations.length > 0,
      controller,
      state: controller?.state || null,
      scope: registrations[0]?.scope || null
    };
  }

  // Mostrar notificação de atualização
  private showUpdateNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nova versão disponível!', {
        body: 'Clique para atualizar a aplicação',
        icon: '/icon-192.png',
        tag: 'app-update'
      });
    } else {
      // Fallback para navegadores sem notificação
      const updateBanner = document.createElement('div');
      updateBanner.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #4CAF50;
          color: white;
          padding: 10px;
          text-align: center;
          z-index: 10000;
          cursor: pointer;
        ">
          🚀 Nova versão disponível! Clique para atualizar
        </div>
      `;
      
      updateBanner.addEventListener('click', () => {
        window.location.reload();
      });
      
      document.body.appendChild(updateBanner);
      
      // Remover após 10 segundos
      setTimeout(() => {
        if (updateBanner.parentNode) {
          updateBanner.parentNode.removeChild(updateBanner);
        }
      }, 10000);
    }
  }

  // Solicitar permissão para notificações
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notificações não suportadas neste navegador');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Permissão para notificações negada');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  }

  // Verificar conectividade
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Escutar mudanças de conectividade
  onConnectivityChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Retornar função para remover listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // Obter informações do cache
  async getCacheInfo(): Promise<{
    name: string;
    size: number;
    entries: number;
  }> {
    if (!('caches' in window)) {
      return { name: '', size: 0, entries: 0 };
    }

    try {
      const cache = await caches.open(this.config.cacheName);
      const keys = await cache.keys();
      
      let totalSize = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }

      return {
        name: this.config.cacheName,
        size: totalSize,
        entries: keys.length
      };
    } catch (error) {
      console.error('Erro ao obter informações do cache:', error);
      return { name: '', size: 0, entries: 0 };
    }
  }

  // Limpar cache
  async clearCache(): Promise<boolean> {
    if (!('caches' in window)) {
      return false;
    }

    try {
      await caches.delete(this.config.cacheName);
      console.log('✅ Cache limpo');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return false;
    }
  }

  // Obter configuração
  getConfig(): ServiceWorkerConfig {
    return { ...this.config };
  }

  // Atualizar configuração
  updateConfig(newConfig: Partial<ServiceWorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Configuração padrão
export const defaultServiceWorkerConfig: ServiceWorkerConfig = {
  cacheName: 'nexus-play-v1',
  version: '1.0.0',
  offlinePage: '/offline.html',
  cacheStrategy: 'staleWhileRevalidate',
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  maxCacheAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
};

// Instância global do service worker manager
export const serviceWorkerManager = new ServiceWorkerManager(defaultServiceWorkerConfig);

// Funções de conveniência
export async function registerServiceWorker(): Promise<boolean> {
  return serviceWorkerManager.register();
}

export async function unregisterServiceWorker(): Promise<boolean> {
  return serviceWorkerManager.unregister();
}

export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

export async function getServiceWorkerStatus() {
  return serviceWorkerManager.getStatus();
}

export async function requestNotificationPermission(): Promise<boolean> {
  return serviceWorkerManager.requestNotificationPermission();
}

export function onConnectivityChange(callback: (isOnline: boolean) => void): () => void {
  return serviceWorkerManager.onConnectivityChange(callback);
}

export async function getCacheInfo() {
  return serviceWorkerManager.getCacheInfo();
}

export async function clearServiceWorkerCache(): Promise<boolean> {
  return serviceWorkerManager.clearCache();
}



