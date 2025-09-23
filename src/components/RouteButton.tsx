import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';

interface RouteButtonProps {
  address: string;
  className?: string;
  mode?: 'floating' | 'horizontal' | 'mobile' | 'tooltip' | 'morphing';
}

export const RouteButton: React.FC<RouteButtonProps> = ({ address, className = '', mode = 'floating' }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Estados para morphing animation
  const [morphState, setMorphState] = useState<'idle' | 'hover' | 'loading' | 'success'>('idle');
  const [morphTimeout, setMorphTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Ref para detectar cliques fora do componente
  const componentRef = useRef<HTMLDivElement>(null);

  // Detecta se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detecta cliques fora do componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node) && isExpanded) {
        setIsExpanded(false);
        setShowTooltip(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleButtonClick = () => {
    setIsClicked(true);
    setIsExpanded(!isExpanded);
    
    // Reset do estado visual após um tempo
    setTimeout(() => {
      setIsClicked(false);
    }, 200);
  };

  const openGoogleMaps = () => {
    setIsExpanded(false);
    setShowTooltip(false);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const url = isMobile 
      ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const openWaze = () => {
    setIsExpanded(false);
    setShowTooltip(false);
    const url = `https://waze.com/ul?q=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const toggleFloating = () => {
    setIsClicked(true);
    setIsExpanded(!isExpanded);
    
    // Reset do estado visual após um tempo
    setTimeout(() => {
      setIsClicked(false);
    }, 200);
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const openBottomSheet = () => {
    setIsExpanded(true);
  };

  // Funções do Tooltip
  const handleMouseEnter = (event: React.MouseEvent) => {
    if (isMobile || isExpanded) return; // Não mostra tooltip em mobile ou quando expandido
    
    // Limpa timeout anterior se existir
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipX = rect.left + rect.width / 2;
    const tooltipY = rect.top - 10; // 10px acima do botão
    
    setTooltipPosition({ x: tooltipX, y: tooltipY });
    
    // Delay para evitar tooltips acidentais
    const timeout = setTimeout(() => {
      if (!isExpanded) { // Verifica novamente se não está expandido
        setShowTooltip(true);
      }
    }, 800);
    
    setTooltipTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    setShowTooltip(false);
  };

  // Funções para controle do morphing
  const handleMorphMouseEnter = () => {
    if (morphState === 'idle' && !isExpanded && !isMobile) {
      setMorphState('hover');
    }
  };

  const handleMorphMouseLeave = () => {
    if (morphState === 'hover' && !isExpanded) {
      setMorphState('idle');
    }
  };

  const handleMorphClick = () => {
    if (morphState === 'hover' || morphState === 'idle') {
      setMorphState('loading');
      
      // Simula processo de carregamento
      const timeout = setTimeout(() => {
        setMorphState('success');
        
        // Abre o Waze automaticamente após mostrar sucesso
        const successTimeout = setTimeout(() => {
          openWaze();
          setMorphState('idle');
        }, 1200);
        
        setMorphTimeout(successTimeout);
      }, 1500);
      
      setMorphTimeout(timeout);
    }
  };

  // Função para obter estilos do morphing baseado no estado
  const getMorphingStyles = () => {
    switch (morphState) {
      case 'idle':
        return `
          bg-gradient-to-r from-blue-500 to-purple-600
          hover:from-blue-600 hover:to-purple-700
          transform scale-100
          transition-all duration-500 ease-in-out
          shadow-lg hover:shadow-xl
        `;
      case 'hover':
        return `
          bg-gradient-to-r from-purple-500 to-pink-600
          morph-hover
          shadow-2xl shadow-purple-500/50
          border-purple-400
        `;
      case 'loading':
        return `
          bg-gradient-to-r from-orange-500 to-red-600
          morph-loading
          shadow-2xl shadow-orange-500/50
          border-orange-400
        `;
      case 'success':
        return `
          bg-gradient-to-r from-green-500 to-emerald-600
          morph-success
          shadow-2xl shadow-green-500/50
          border-green-400
        `;
      default:
        return `
          bg-gradient-to-r from-blue-500 to-purple-600
          transition-all duration-300 ease-in-out
          shadow-lg
        `;
    }
  };

  // Função para obter ícone do morphing baseado no estado
  const getMorphingIcon = () => {
    switch (morphState) {
      case 'idle':
        return <Navigation className="w-4 h-4" />;
      case 'hover':
        return <MapPin className="w-4 h-4 animate-bounce" />;
      case 'loading':
        return (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        );
      case 'success':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return <Navigation className="w-4 h-4" />;
    }
  };

  // Função para obter texto do morphing baseado no estado
  const getMorphingText = () => {
    switch (morphState) {
      case 'idle':
        return 'Abrir Rota';
      case 'hover':
        return 'Navegar Agora';
      case 'loading':
        return 'Carregando...';
      case 'success':
        return 'Rota Aberta!';
      default:
        return 'Abrir Rota';
    }
  };

  // Limpa tooltip quando expande
  useEffect(() => {
    if (isExpanded) {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        setTooltipTimeout(null);
      }
      setShowTooltip(false);
    }
  }, [isExpanded, tooltipTimeout]);

  // Limpa morphing quando expande ou muda de modo
  useEffect(() => {
    if (isExpanded || mode !== 'morphing') {
      if (morphTimeout) {
        clearTimeout(morphTimeout);
        setMorphTimeout(null);
      }
      setMorphState('idle');
    }
  }, [isExpanded, mode, morphTimeout]);

  return (
    <div ref={componentRef} className="relative">
      {/* Estilos CSS para animações customizadas */}
      <style jsx>{`
        @keyframes slideUpFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideDownToBottom {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        
        @keyframes expandWidth {
          from {
            width: auto;
            opacity: 0.8;
          }
          to {
            width: 100%;
            opacity: 1;
          }
        }
        
        @keyframes slideInFromSides {
          from {
            transform: scaleX(0);
            opacity: 0;
          }
          to {
            transform: scaleX(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeInBackdrop {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1) translateY(0);
          }
        }
        
        @keyframes tooltipFadeOut {
          from {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.95) translateY(10px);
          }
        }

        @keyframes morphPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes morphRotate360 {
          from {
            transform: rotate(0deg) scale(1);
          }
          to {
            transform: rotate(360deg) scale(1.1);
          }
        }

        @keyframes morphSuccess {
          0% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(1.1) rotate(360deg);
          }
        }

        @keyframes morphGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
          }
        }

        .morph-loading {
          animation: morphRotate360 1.5s linear infinite;
        }

        .morph-success {
          animation: morphSuccess 0.8s ease-out forwards;
        }

        .morph-hover {
          animation: morphPulse 0.6s ease-in-out, morphGlow 2s ease-in-out infinite;
        }
      `}</style>
      
      {/* Overlay para fechar ao clicar fora */}
      {isExpanded && (
        <div 
          className={`fixed inset-0 z-40 ${
            isMobile 
              ? 'bg-black bg-opacity-50 animate-in fade-in-0 duration-300' 
              : 'bg-transparent'
          }`}
          onClick={() => setIsExpanded(false)}
          style={{
            animation: isMobile && isExpanded 
              ? 'fadeInBackdrop 0.3s ease-out both' 
              : undefined
          }}
        />
      )}

      {/* Botão Principal */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={mode === 'floating' ? toggleFloating : 
                 mode === 'horizontal' ? toggleExpansion : 
                 mode === 'mobile' ? (isMobile ? openBottomSheet : openWaze) :
                 mode === 'tooltip' ? openWaze :
                 mode === 'morphing' ? handleMorphClick : handleButtonClick}
        onMouseEnter={mode === 'tooltip' && !isMobile ? handleMouseEnter : 
                      mode === 'morphing' && !isMobile ? handleMorphMouseEnter : handleMouseEnter}
        onMouseLeave={mode === 'tooltip' && !isMobile ? handleMouseLeave :
                      mode === 'morphing' && !isMobile ? handleMorphMouseLeave : handleMouseLeave}
        className={`
          flex items-center gap-2 transition-all duration-200 relative z-50
          ${mode === 'morphing' ? getMorphingStyles() : `
            ${isClicked 
              ? 'bg-maestros-green text-white border-maestros-green' 
              : 'bg-white text-maestros-green border-maestros-green hover:bg-maestros-green hover:text-white'
            }
          `} 
          ${className}
        `}
      >
        {mode === 'morphing' ? getMorphingIcon() : <Navigation className="w-4 h-4" />}
        {mode === 'morphing' ? getMorphingText() : 'Abrir Rota'}
      </Button>

      {/* Tooltip Interativo */}
      {showTooltip && !isMobile && (
        <div 
          className="fixed z-[100] pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)',
            animation: 'tooltipFadeIn 0.3s ease-out both'
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-80 pointer-events-auto">
            {/* Header do Tooltip */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-maestros-green/10 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-maestros-green" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Navegação</h3>
                <p className="text-sm text-gray-500">Escolha seu app preferido</p>
              </div>
            </div>

            {/* Preview do Endereço */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Destino:</p>
                  <p className="text-sm text-gray-600 break-words">{address}</p>
                </div>
              </div>
            </div>

            {/* Opções de Navegação */}
            <div className="space-y-2">
              <button
                onClick={openGoogleMaps}
                className="w-full p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 group-hover:text-blue-700">Google Maps</p>
                    <p className="text-xs text-gray-500">Navegação com trânsito em tempo real</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>

              <button
                onClick={openWaze}
                className="w-full p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Navigation className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 group-hover:text-purple-700">Waze</p>
                    <p className="text-xs text-gray-500">Rotas inteligentes e alertas da comunidade</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-purple-600" />
                </div>
              </button>
            </div>

            {/* Seta do Tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45 -mt-1.5"></div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: Container Expansível Horizontal */}
      {!isMobile && isExpanded && (
        <div className="absolute top-0 left-0 z-50 flex items-center gap-0 rounded-lg border-2 border-maestros-green bg-white overflow-hidden shadow-lg">
          
          {/* Botão Principal (repetido para layout) */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleButtonClick}
            className="flex items-center gap-2 transition-all duration-300 border-0 rounded-r-none bg-white text-maestros-green hover:bg-maestros-green hover:text-white border-r border-maestros-green/20"
          >
            <Navigation className="w-4 h-4" />
            Abrir Rota
          </Button>

          {/* Opções Desktop */}
          <div className="flex items-center">
            <button
              onClick={openGoogleMaps}
              className="flex items-center gap-2 px-3 py-2 transition-all duration-300 group hover:bg-blue-50 border-r border-maestros-green/20"
              style={{
                animation: 'slideInFromSides 0.3s ease-out 0.1s both'
              }}
            >
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <MapPin className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 whitespace-nowrap">
                Google Maps
              </span>
            </button>

            <button
              onClick={openWaze}
              className="flex items-center gap-2 px-3 py-2 transition-all duration-300 group hover:bg-purple-50 rounded-r-md"
              style={{
                animation: 'slideInFromSides 0.3s ease-out 0.2s both'
              }}
            >
              <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Navigation className="w-3 h-3 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 whitespace-nowrap">
                Waze
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile: Bottom Sheet */}
      {isMobile && isExpanded && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200"
          style={{
            animation: 'slideUpFromBottom 0.4s ease-out both'
          }}
        >
          {/* Handle do Bottom Sheet */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-maestros-green/10 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-maestros-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Abrir Rota</h3>
                <p className="text-sm text-gray-500">Escolha seu app de navegação</p>
              </div>
            </div>
          </div>

          {/* Opções Mobile */}
          <div className="px-6 pb-8 space-y-3">
            {/* Google Maps */}
            <button
              onClick={openGoogleMaps}
              className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
              style={{
                animation: 'slideUpFromBottom 0.4s ease-out 0.1s both'
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">Google Maps</h4>
                  <p className="text-sm text-gray-500">Navegação com trânsito em tempo real</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>

            {/* Waze */}
            <button
              onClick={openWaze}
              className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200 group"
              style={{
                animation: 'slideUpFromBottom 0.4s ease-out 0.2s both'
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Navigation className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-700">Waze</h4>
                  <p className="text-sm text-gray-500">Rotas inteligentes e alertas da comunidade</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
              </div>
            </button>
          </div>

          {/* Safe Area para dispositivos com notch */}
          <div className="h-safe-area-inset-bottom"></div>
        </div>
      )}
    </div>
  );
};