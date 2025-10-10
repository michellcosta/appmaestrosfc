import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlayersConvex } from '@/hooks/usePlayersConvex';
import { CheckCircle, Database, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';

export default function MigratePlayersToConvex() {
    const { createPlayer, players: convexPlayers } = usePlayersConvex();
    const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [localPlayers, setLocalPlayers] = useState<any[]>([]);
    const [migratedCount, setMigratedCount] = useState(0);

    // Função para carregar jogadores do localStorage
    const loadLocalPlayers = () => {
        try {
            // Tentar diferentes chaves do localStorage
            const keys = ['players', 'player_data', 'offline_players', 'managed_players'];
            let found: any[] = [];

            for (const key of keys) {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            found = [...found, ...parsed];
                            console.log(`✅ Encontrados ${parsed.length} jogadores em ${key}`);
                        }
                    } catch (e) {
                        console.error(`❌ Erro ao parsear ${key}:`, e);
                    }
                }
            }

            // Remover duplicados por email
            const uniquePlayers = Array.from(
                new Map(found.map(p => [p.email || p.name, p])).values()
            );

            setLocalPlayers(uniquePlayers);
            setMessage(`✅ Encontrados ${uniquePlayers.length} jogadores no localStorage`);
            return uniquePlayers;
        } catch (error) {
            console.error('❌ Erro ao carregar jogadores:', error);
            setMessage(`❌ Erro: ${error}`);
            return [];
        }
    };

    // Função para migrar jogadores
    const migrateToConvex = async () => {
        setStatus('migrating');
        setMigratedCount(0);
        setMessage('🔄 Iniciando migração...');

        const playersToMigrate = localPlayers.length > 0 ? localPlayers : loadLocalPlayers();

        if (playersToMigrate.length === 0) {
            setStatus('error');
            setMessage('❌ Nenhum jogador encontrado no localStorage');
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const player of playersToMigrate) {
            try {
                // Verificar se já existe no Convex
                const exists = convexPlayers?.some(p =>
                    p.email === player.email ||
                    (p.name === player.name && !player.email)
                );

                if (exists) {
                    console.log(`⏭️ Jogador ${player.name} já existe no Convex, pulando...`);
                    successCount++;
                    setMigratedCount(successCount);
                    continue;
                }

                // Migrar para Convex
                await createPlayer({
                    name: player.name || 'Sem nome',
                    email: player.email || `${player.name?.toLowerCase().replace(/\s+/g, '.')}@maestros.com`,
                    phone: player.phone || player.telefone || '',
                    role: player.role || 'player',
                    position: player.position || player.posicao || '',
                    active: player.active !== undefined ? player.active : true,
                    approved: player.approved !== undefined ? player.approved : true,
                    avatar_url: player.avatar_url || player.avatar || ''
                });

                successCount++;
                setMigratedCount(successCount);
                console.log(`✅ Migrado: ${player.name}`);
                setMessage(`🔄 Migrando... ${successCount}/${playersToMigrate.length}`);

                // Aguardar um pouco entre requisições
                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error: any) {
                errorCount++;
                const errorMsg = `${player.name}: ${error.message}`;
                errors.push(errorMsg);
                console.error(`❌ Erro ao migrar ${player.name}:`, error);
            }
        }

        if (errorCount === 0) {
            setStatus('success');
            setMessage(`✅ Migração completa! ${successCount} jogadores migrados com sucesso.`);
        } else {
            setStatus('error');
            setMessage(`⚠️ Migração concluída com erros:\n${successCount} sucesso, ${errorCount} erros\n\nErros:\n${errors.join('\n')}`);
        }
    };

    // Carregar jogadores ao montar o componente
    useState(() => {
        loadLocalPlayers();
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-6 h-6" />
                            Migrar Jogadores para Convex
                        </CardTitle>
                        <CardDescription>
                            Transferir jogadores do localStorage para o banco de dados Convex
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Status */}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <Database className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                    Jogadores no localStorage: <strong>{localPlayers.length}</strong>
                                </p>
                                <p className="text-sm font-medium text-blue-900">
                                    Jogadores no Convex: <strong>{convexPlayers?.length || 0}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Lista de jogadores locais */}
                        {localPlayers.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm text-gray-700">Jogadores encontrados:</h3>
                                <div className="max-h-60 overflow-y-auto space-y-1 border rounded-lg p-3 bg-white">
                                    {localPlayers.map((player, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span>{player.name}</span>
                                            {player.email && (
                                                <span className="text-gray-500 text-xs">({player.email})</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                        {status === 'migrating' && (
                            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                                <p className="text-sm font-medium text-yellow-900">
                                    Migrando... {migratedCount}/{localPlayers.length}
                                </p>
                            </div>
                        )}

                        {/* Botões */}
                        <div className="flex gap-3">
                            <Button
                                onClick={loadLocalPlayers}
                                variant="outline"
                                disabled={status === 'migrating'}
                                className="flex-1"
                            >
                                <Database className="w-4 h-4 mr-2" />
                                Recarregar Jogadores
                            </Button>

                            <Button
                                onClick={migrateToConvex}
                                disabled={status === 'migrating' || localPlayers.length === 0}
                                className="flex-1"
                            >
                                {status === 'migrating' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Migrando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Migrar para Convex
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Instruções */}
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                            <p className="font-semibold mb-2">📋 Instruções:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Clique em "Recarregar Jogadores" para buscar no localStorage</li>
                                <li>Revise a lista de jogadores encontrados</li>
                                <li>Clique em "Migrar para Convex" para transferir</li>
                                <li>Após a migração, os jogadores estarão salvos na nuvem ☁️</li>
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

