import { useAuth } from '@/auth/OfflineAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlayersConvex } from '@/hooks/usePlayersConvex';
import { CheckCircle, Database, Loader2, RefreshCw, User } from 'lucide-react';
import { useState } from 'react';

export default function ForceUserSync() {
    const { user } = useAuth();
    const { syncProfileToPlayer, players } = usePlayersConvex();
    const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const forceSync = async () => {
        if (!user || !user.email || !user.name) {
            setStatus('error');
            setMessage('❌ Usuário não está logado ou dados incompletos');
            return;
        }

        setStatus('syncing');
        setMessage('🔄 Forçando sincronização...');

        try {
            const role = user.role as 'owner' | 'admin' | 'aux' | 'player' | undefined;

            console.log('🔄 Sincronizando usuário:', {
                email: user.email,
                name: user.name,
                role: role
            });

            await syncProfileToPlayer(user.email, user.name, role);

            setStatus('success');
            setMessage(`✅ Sincronização realizada com sucesso!\n\nUsuário: ${user.name}\nEmail: ${user.email}\nRole: ${role || 'player'}`);

            // Aguardar um pouco e recarregar a página para ver os dados atualizados
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error: any) {
            setStatus('error');
            setMessage(`❌ Erro na sincronização: ${error.message}`);
            console.error('❌ Erro ao forçar sincronização:', error);
        }
    };

    const checkIfUserExists = () => {
        if (!user || !user.email) return false;

        return players?.some(p =>
            p.email === user.email ||
            (p.name === user.name && !user.email)
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-6 h-6" />
                            Forçar Sincronização do Usuário
                        </CardTitle>
                        <CardDescription>
                            Sincronizar manualmente o usuário logado com a tabela de jogadores
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Status do usuário */}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                                {user ? (
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">
                                            <strong>Usuário logado:</strong> {user.name}
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            <strong>Email:</strong> {user.email}
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            <strong>Role:</strong> {user.role || 'player'}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-blue-900">Nenhum usuário logado</p>
                                )}
                            </div>
                        </div>

                        {/* Status da sincronização */}
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <Database className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">
                                    Status na tabela de jogadores:
                                </p>
                                <p className="text-sm text-green-700">
                                    {checkIfUserExists() ? (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" />
                                            ✅ Usuário já existe na tabela
                                        </span>
                                    ) : (
                                        <span>❌ Usuário não encontrado na tabela</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Mensagem de status */}
                        {message && (
                            <div className={`p-4 rounded-lg border ${status === 'success' ? 'bg-green-50 border-green-200' :
                                    status === 'error' ? 'bg-red-50 border-red-200' :
                                        'bg-blue-50 border-blue-200'
                                }`}>
                                <pre className="text-sm whitespace-pre-wrap">{message}</pre>
                            </div>
                        )}

                        {/* Progresso */}
                        {status === 'syncing' && (
                            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                                <p className="text-sm font-medium text-yellow-900">
                                    Sincronizando usuário...
                                </p>
                            </div>
                        )}

                        {/* Botões */}
                        <div className="flex gap-3">
                            <Button
                                onClick={forceSync}
                                disabled={status === 'syncing' || !user}
                                className="flex-1"
                            >
                                {status === 'syncing' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sincronizando...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Forçar Sincronização
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={() => window.location.href = '/manage-players'}
                                variant="outline"
                                className="flex-1"
                            >
                                <Database className="w-4 h-4 mr-2" />
                                Ver Jogadores
                            </Button>
                        </div>

                        {/* Instruções */}
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                            <p className="font-semibold mb-2">📋 Instruções:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Certifique-se de estar logado com sua conta Google</li>
                                <li>Clique em "Forçar Sincronização" para criar seu perfil</li>
                                <li>Após a sincronização, você aparecerá em "Gerenciar Jogadores"</li>
                                <li>Como owner, você terá acesso total ao sistema</li>
                            </ol>
                        </div>

                        {status === 'success' && (
                            <Button
                                onClick={() => window.location.href = '/manage-players'}
                                className="w-full"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Ir para Gerenciar Jogadores
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
