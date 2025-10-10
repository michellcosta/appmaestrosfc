import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Crown, UserPlus } from 'lucide-react';

export default function RecreateOwner() {
    const handleRecreateOwner = () => {
        // Limpar usuário existente
        localStorage.removeItem('offline_user');

        // Criar novo owner com seu email
        const newOwner = {
            id: crypto.randomUUID(),
            email: 'michellcosta1269@gmail.com',
            name: 'Michell Costa - Owner',
            role: 'owner',
            group_id: `group_${Date.now()}`,
            avatar: null,
            created_at: new Date().toISOString()
        };

        localStorage.setItem('offline_user', JSON.stringify(newOwner));

        // Recarregar página
        window.location.reload();
    };

    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Recriar Conta Michell Costa
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-yellow-800">Acesso Owner Perdido</p>
                        <p className="text-yellow-700">
                            Michell Costa, se você perdeu acesso como owner, use este botão para recriar sua conta.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleRecreateOwner}
                    className="w-full"
                    variant="default"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Recriar Conta Michell Costa
                </Button>

                <p className="text-xs text-gray-500 text-center">
                    Isso irá limpar qualquer usuário existente e criar a conta owner de Michell Costa
                </p>
            </CardContent>
        </Card>
    );
}
