import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Users } from 'lucide-react';

export default function ForceSaveUser() {
    const forceSaveCurrentUser = () => {
        const currentUser = localStorage.getItem('offline_user');
        if (currentUser) {
            try {
                const user = JSON.parse(currentUser);
                const existingUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
                const userExists = existingUsers.some((u: any) => u.id === user.id);

                if (!userExists) {
                    const userWithDates = {
                        ...user,
                        loginDate: new Date().toISOString(),
                        lastSeen: new Date().toISOString()
                    };
                    existingUsers.push(userWithDates);
                    localStorage.setItem('all_users', JSON.stringify(existingUsers));
                    alert(`✅ Usuário ${user.email} adicionado ao histórico!`);
                } else {
                    alert(`ℹ️ Usuário ${user.email} já existe no histórico`);
                }
            } catch (e) {
                alert('❌ Erro ao salvar usuário: ' + e.message);
            }
        } else {
            alert('❌ Nenhum usuário logado');
        }
    };

    const showCurrentUsers = () => {
        const allUsers = localStorage.getItem('all_users');
        if (allUsers) {
            const users = JSON.parse(allUsers);
            console.log('👥 Histórico de usuários:', users);
            alert(`📋 ${users.length} usuário(s) no histórico. Verifique o console para detalhes.`);
        } else {
            alert('📭 Nenhum usuário no histórico');
        }
    };

    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Save className="h-5 w-5 text-blue-500" />
                    Debug: Salvar Usuário
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                    Use estes botões para debugar o sistema de usuários.
                </p>

                <Button
                    onClick={forceSaveCurrentUser}
                    className="w-full"
                    variant="default"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Forçar Salvamento do Usuário Atual
                </Button>

                <Button
                    onClick={showCurrentUsers}
                    className="w-full"
                    variant="outline"
                >
                    <Users className="h-4 w-4 mr-2" />
                    Ver Usuários no Histórico
                </Button>

                <p className="text-xs text-gray-500 text-center">
                    Depois de salvar, vá para "Listar Usuários" para ver o resultado
                </p>
            </CardContent>
        </Card>
    );
}

