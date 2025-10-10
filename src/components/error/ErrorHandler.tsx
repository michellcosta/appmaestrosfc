/**
 * Error Handler Component
 * Sistema avançado de tratamento de erros com recuperação automática
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Info, 
  Bug, 
  Wifi, 
  WifiOff,
  Server,
  Database,
  Shield,
  Clock,
  CheckCircle,
  ExclamationTriangle
} from 'lucide-react';

export interface ErrorInfo {
  id: string;
  type: 'network' | 'validation' | 'authentication' | 'authorization' | 'server' | 'client' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  description: string;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
  recoverable: boolean;
  retryable: boolean;
  userAction?: string;
  technicalDetails?: string;
}

export interface ErrorRecovery {
  action: 'retry' | 'refresh' | 'reload' | 'fallback' | 'manual';
  description: string;
  automatic: boolean;
  timeout?: number;
}

export interface ErrorConfig {
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  showTechnicalDetails: boolean;
  enableRecovery: boolean;
  logErrors: boolean;
  reportErrors: boolean;
}

interface ErrorHandlerProps {
  error: ErrorInfo | null;
  onRetry: () => void;
  onDismiss: () => void;
  onReport: (error: ErrorInfo) => void;
  config?: Partial<ErrorConfig>;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss,
  onReport,
  config = {}
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const defaultConfig: ErrorConfig = {
    autoRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    showTechnicalDetails: false,
    enableRecovery: true,
    logErrors: true,
    reportErrors: true,
    ...config
  };

  // Auto-retry logic
  useEffect(() => {
    if (error && error.retryable && defaultConfig.autoRetry && retryCount < defaultConfig.maxRetries) {
      const timeout = setTimeout(() => {
        handleRetry();
      }, defaultConfig.retryDelay * (retryCount + 1));

      retryTimeoutRef.current = timeout;
      return () => clearTimeout(timeout);
    }
  }, [error, retryCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await onRetry();
      setIsRetrying(false);
    } catch (err) {
      setIsRetrying(false);
      if (retryCount >= defaultConfig.maxRetries) {
        setRecoveryAttempts(prev => prev + 1);
      }
    }
  };

  const handleReport = () => {
    if (error) {
      onReport(error);
    }
  };

  const handleDismiss = () => {
    setRetryCount(0);
    setRecoveryAttempts(0);
    onDismiss();
  };

  // Obter ícone baseado no tipo de erro
  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'server':
        return <Server className="w-5 h-5 text-red-500" />;
      case 'database':
        return <Database className="w-5 h-5 text-red-500" />;
      case 'authentication':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'authorization':
        return <Shield className="w-5 h-5 text-orange-500" />;
      case 'validation':
        return <ExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bug className="w-5 h-5 text-red-500" />;
    }
  };

  // Obter cor baseada na severidade
  const getSeverityColor = (severity: ErrorInfo['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Obter ações de recuperação
  const getRecoveryActions = (error: ErrorInfo): ErrorRecovery[] => {
    const actions: ErrorRecovery[] = [];

    if (error.retryable) {
      actions.push({
        action: 'retry',
        description: 'Tentar novamente',
        automatic: true,
        timeout: defaultConfig.retryDelay
      });
    }

    if (error.type === 'network') {
      actions.push({
        action: 'refresh',
        description: 'Verificar conexão e recarregar',
        automatic: false
      });
    }

    if (error.type === 'server' || error.type === 'database') {
      actions.push({
        action: 'fallback',
        description: 'Usar dados em cache',
        automatic: false
      });
    }

    if (error.severity === 'critical') {
      actions.push({
        action: 'reload',
        description: 'Recarregar página',
        automatic: false
      });
    }

    return actions;
  };

  if (!error) return null;

  const recoveryActions = getRecoveryActions(error);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-lg ${getSeverityColor(error.severity)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getErrorIcon(error.type)}
              <CardTitle className="text-lg">Erro {error.severity}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {error.type}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>{error.message}</strong>
              <br />
              {error.description}
            </AlertDescription>
          </Alert>

          {error.userAction && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    O que você pode fazer:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {error.userAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {recoveryActions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Ações de Recuperação:</h4>
              <div className="grid grid-cols-1 gap-2">
                {recoveryActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (action.action === 'retry') {
                        handleRetry();
                      } else if (action.action === 'refresh') {
                        window.location.reload();
                      } else if (action.action === 'reload') {
                        window.location.reload();
                      }
                    }}
                    disabled={isRetrying}
                    className="justify-start"
                  >
                    {action.action === 'retry' && <RefreshCw className="w-3 h-3 mr-2" />}
                    {action.action === 'refresh' && <RefreshCw className="w-3 h-3 mr-2" />}
                    {action.action === 'reload' && <RefreshCw className="w-3 h-3 mr-2" />}
                    {action.description}
                    {action.automatic && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Automático
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {defaultConfig.showTechnicalDetails && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs"
              >
                {showDetails ? 'Ocultar' : 'Mostrar'} detalhes técnicos
              </Button>
              
              {showDetails && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Timestamp:</strong> {error.timestamp.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>ID:</strong> {error.id}
                  </div>
                  {error.stack && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Stack:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {error.context && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Contexto:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(error.context, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Tentativas: {retryCount}/{defaultConfig.maxRetries}</span>
              {recoveryAttempts > 0 && (
                <span>• Recuperações: {recoveryAttempts}</span>
              )}
            </div>
            
            <div className="flex space-x-2">
              {defaultConfig.reportErrors && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReport}
                  className="text-xs"
                >
                  Reportar
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorHandler;



