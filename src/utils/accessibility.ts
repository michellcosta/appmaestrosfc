// Utilitários de Acessibilidade
export const a11y = {
  // Gerar IDs únicos para elementos
  generateId: (prefix: string = 'element') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Anunciar mudanças para leitores de tela
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove após 1 segundo
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Verificar se o usuário prefere movimento reduzido
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Verificar se o usuário prefere alto contraste
  prefersHighContrast: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Verificar se o usuário prefere tema escuro
  prefersDarkTheme: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  // Gerenciar foco para modais e overlays
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Verificar se o dispositivo suporta hover
  supportsHover: () => {
    return window.matchMedia('(hover: hover)').matches;
  },

  // Verificar se é um dispositivo touch
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Adicionar atributos ARIA para loading states
  setLoadingState: (element: HTMLElement, isLoading: boolean, label?: string) => {
    if (isLoading) {
      element.setAttribute('aria-busy', 'true');
      if (label) {
        element.setAttribute('aria-label', label);
      }
    } else {
      element.removeAttribute('aria-busy');
      if (label) {
        element.removeAttribute('aria-label');
      }
    }
  },

  // Verificar se o elemento está visível na tela
  isElementVisible: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Scroll suave para elemento com foco
  scrollToElement: (element: HTMLElement, behavior: ScrollBehavior = 'smooth') => {
    element.scrollIntoView({ 
      behavior, 
      block: 'center',
      inline: 'nearest'
    });
  },

  // Verificar se o usuário está usando navegação por teclado
  isKeyboardUser: (() => {
    let isKeyboard = false;
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        isKeyboard = true;
      }
    });
    
    document.addEventListener('mousedown', () => {
      isKeyboard = false;
    });
    
    return () => isKeyboard;
  })(),

  // Adicionar skip links para navegação rápida
  addSkipLink: (targetId: string, label: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    return skipLink;
  },

  // Validar contraste de cores
  checkColorContrast: (foreground: string, background: string) => {
    // Implementação simplificada - em produção usar biblioteca específica
    const getLuminance = (color: string) => {
      // Converter hex para RGB e calcular luminância
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };
    
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio,
      passAA: ratio >= 4.5,
      passAAA: ratio >= 7
    };
  }
};

// Hook para usar utilitários de acessibilidade
export const useAccessibility = () => {
  return a11y;
};

// Constantes para ARIA labels comuns
export const ARIA_LABELS = {
  LOADING: 'Carregando...',
  CLOSE: 'Fechar',
  MENU: 'Menu',
  SEARCH: 'Pesquisar',
  NEXT: 'Próximo',
  PREVIOUS: 'Anterior',
  SAVE: 'Salvar',
  CANCEL: 'Cancelar',
  DELETE: 'Excluir',
  EDIT: 'Editar',
  VIEW: 'Visualizar',
  EXPAND: 'Expandir',
  COLLAPSE: 'Recolher',
  SORT_ASC: 'Ordenar crescente',
  SORT_DESC: 'Ordenar decrescente',
  REQUIRED_FIELD: 'Campo obrigatório',
  OPTIONAL_FIELD: 'Campo opcional',
  ERROR: 'Erro',
  SUCCESS: 'Sucesso',
  WARNING: 'Aviso',
  INFO: 'Informação'
} as const;

// Tipos para TypeScript
export type AriaLabel = typeof ARIA_LABELS[keyof typeof ARIA_LABELS];
export type FocusTrapCleanup = () => void;