import { useState, useEffect } from 'react';
import { useToastHelpers } from '@/components/ui/toast';

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error } = useToastHelpers();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registration = navigator.serviceWorker.ready;
      
      registration.then((reg) => {
        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                success('Nova versão disponível!', 'Clique para atualizar o app');
              }
            });
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });
    }
  }, [success]);

  const updateApp = async () => {
    if (!('serviceWorker' in navigator)) {
      error('Erro', 'Service Worker não suportado');
      return;
    }

    setIsUpdating(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (registration.waiting) {
        // Tell the waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page
        window.location.reload();
      } else {
        // Force update check
        await registration.update();
        success('Verificando atualizações...', 'Aguarde um momento');
      }
    } catch (err) {
      error('Erro na atualização', 'Tente novamente');
      console.error('Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
  };

  return {
    updateAvailable,
    isUpdating,
    updateApp,
    dismissUpdate
  };
}
