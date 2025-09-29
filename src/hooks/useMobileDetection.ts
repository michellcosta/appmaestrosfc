import { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export function useMobileDetection(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'landscape',
    touchDevice: false,
    deviceType: 'desktop'
  });

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detectar orientação
      const orientation = height > width ? 'portrait' : 'landscape';
      
      // Detectar tipo de dispositivo
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Detectar touch device
      const touchDevice = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 ||
                          // @ts-ignore
                          navigator.msMaxTouchPoints > 0;
      
      // Determinar tipo de dispositivo
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        touchDevice,
        deviceType
      });
    };

    // Detecção inicial
    updateDetection();

    // Listener para mudanças de tamanho
    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);

    return () => {
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
}

// Hook para detectar se deve usar componentes mobile
export function useMobileComponents() {
  const { isMobile, isTablet, touchDevice } = useMobileDetection();
  
  return {
    useMobile: isMobile || (isTablet && touchDevice),
    isMobile,
    isTablet,
    touchDevice
  };
}

// Hook para detectar gestos touch
export function useTouchGestures() {
  const [gesture, setGesture] = useState<{
    direction: 'up' | 'down' | 'left' | 'right' | null;
    distance: number;
    velocity: number;
  }>({
    direction: null,
    distance: 0,
    velocity: 0
  });

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      setGesture({ direction, distance, velocity });
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return gesture;
}



