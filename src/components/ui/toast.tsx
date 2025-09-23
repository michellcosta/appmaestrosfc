import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getToastStyles = (type: ToastType) => {
    const baseStyles = "pointer-events-auto relative flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300 animate-smooth-fade-in";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50/95 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50/95 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/95 border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50/95 border-blue-200 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50/95 border-gray-200 text-gray-800`;
    }
  };

  const getIcon = (type: ToastType) => {
    const iconProps = { className: "h-5 w-5 mt-0.5 flex-shrink-0", "aria-hidden": "true" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className={`${iconProps.className} text-green-600`} />;
      case 'error':
        return <AlertCircle {...iconProps} className={`${iconProps.className} text-red-600`} />;
      case 'warning':
        return <AlertTriangle {...iconProps} className={`${iconProps.className} text-yellow-600`} />;
      case 'info':
        return <Info {...iconProps} className={`${iconProps.className} text-blue-600`} />;
      default:
        return <Info {...iconProps} className={`${iconProps.className} text-gray-600`} />;
    }
  };

  // Announce to screen readers
  useEffect(() => {
    const message = `${toast.type}: ${toast.title}${toast.description ? '. ' + toast.description : ''}`;
    
    // Create a temporary element for screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Clean up after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, [toast]);

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={getToastStyles(toast.type)}
    >
      {getIcon(toast.type)}
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm mb-1">
          {toast.title}
        </h3>
        {toast.description && (
          <p className="text-sm opacity-90">
            {toast.description}
          </p>
        )}
        
        {toast.action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toast.action.onClick}
            className="mt-2 h-auto p-0 text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </Button>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 h-6 w-6 rounded-md hover:bg-black/10 focus:ring-2 focus:ring-offset-2 focus:ring-current"
        aria-label={`Fechar notificação: ${toast.title}`}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    success: (title: string, description?: string, action?: Toast['action']) => 
      addToast({ type: 'success', title, description, action }),
    
    error: (title: string, description?: string, action?: Toast['action']) => 
      addToast({ type: 'error', title, description, action }),
    
    warning: (title: string, description?: string, action?: Toast['action']) => 
      addToast({ type: 'warning', title, description, action }),
    
    info: (title: string, description?: string, action?: Toast['action']) => 
      addToast({ type: 'info', title, description, action }),
    
    custom: (toast: Omit<Toast, 'id'>) => addToast(toast)
  };
}