import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Smartphone, Wifi } from 'lucide-react';
import React from 'react';

interface NetworkAccessNoticeProps {
    onUseLocalhost: () => void;
}

export function NetworkAccessNotice({ onUseLocalhost }: NetworkAccessNoticeProps) {
    const isLocalNetwork = window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.startsWith('172.');

    if (!isLocalNetwork) {
        return null;
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <span>Acesso via Rede Local</span>
                </CardTitle>
                <CardDescription>
                    Você está acessando via IP da rede local
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Google OAuth Limitado</AlertTitle>
                    <AlertDescription>
                        O Google OAuth não funciona com IPs privados por segurança.
                        Para usar o login com Google, acesse via localhost no PC.
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        <strong>Opções disponíveis:</strong>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Use o login offline (funciona perfeitamente)</li>
                        <li>• Acesse via localhost no PC para Google OAuth</li>
                        <li>• Todas as outras funcionalidades funcionam normalmente</li>
                    </ul>
                </div>

                <div className="flex space-x-2">
                    <Button
                        onClick={onUseLocalhost}
                        variant="outline"
                        className="flex-1"
                    >
                        <Wifi className="h-4 w-4 mr-2" />
                        Usar Localhost
                    </Button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                    <p>IP atual: <code>{window.location.hostname}</code></p>
                    <p>Para Google OAuth: <code>localhost:5173</code></p>
                </div>
            </CardContent>
        </Card>
    );
}
