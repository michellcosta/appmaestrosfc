import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const LoadingSpinner: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <Loader2 
    className={cn('animate-spin', size, className)}
    aria-hidden="true"
  />
);

const LoadingDots: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div className={cn('flex space-x-1', className)} aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'rounded-full bg-current animate-bounce',
          size === 'h-4 w-4' ? 'h-2 w-2' : 
          size === 'h-6 w-6' ? 'h-3 w-3' :
          size === 'h-8 w-8' ? 'h-4 w-4' : 'h-6 w-6'
        )}
        style={{
          animationDelay: `${i * 0.1}s`,
          animationDuration: '0.6s'
        }}
      />
    ))}
  </div>
);

const LoadingPulse: React.FC<{ size: string; className?: string }> = ({ size, className }) => (
  <div
    className={cn(
      'rounded-full bg-current animate-pulse',
      size,
      className
    )}
    aria-hidden="true"
  />
);

const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3', className)} aria-hidden="true">
    <div className="h-4 bg-gray-200 rounded animate-pulse" />
    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
  </div>
);

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  fullScreen = false,
  overlay = false
}) => {
  const sizeClass = sizeClasses[size];

  const renderLoadingElement = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots size={sizeClass} className="text-blue-600" />;
      case 'pulse':
        return <LoadingPulse size={sizeClass} className="text-blue-600" />;
      case 'skeleton':
        return <LoadingSkeleton className="w-full max-w-sm" />;
      default:
        return <LoadingSpinner size={sizeClass} className="text-blue-600" />;
    }
  };

  const content = (
    <div 
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen && 'min-h-screen',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={text || 'Carregando'}
    >
      {renderLoadingElement()}
      {text && (
        <p className="text-sm text-gray-600 font-medium">
          {text}
        </p>
      )}
      <span className="sr-only">
        {text || 'Carregando, por favor aguarde...'}
      </span>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Componente específico para carregamento de página
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Carregando página...' }) => (
  <Loading
    size="lg"
    variant="spinner"
    text={text}
    fullScreen
    className="bg-gradient-to-br from-blue-50 to-purple-50"
  />
);

// Componente para carregamento inline
export const InlineLoading: React.FC<{ text?: string; size?: LoadingProps['size'] }> = ({ 
  text, 
  size = 'sm' 
}) => (
  <Loading
    size={size}
    variant="spinner"
    text={text}
    className="py-2"
  />
);

// Componente para overlay de carregamento
export const LoadingOverlay: React.FC<{ text?: string; show: boolean }> = ({ 
  text = 'Processando...', 
  show 
}) => {
  if (!show) return null;
  
  return (
    <Loading
      size="lg"
      variant="spinner"
      text={text}
      overlay
    />
  );
};

// Hook para gerenciar estados de loading
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  };
};