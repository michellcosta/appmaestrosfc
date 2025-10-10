import { useMutation } from 'convex/react';
import { useState } from 'react';
import { api } from '../../convex/_generated/api';
import { Button } from './ui/button';

export function ForceUpdateOwner() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const forceUpdate = useMutation(api.forceUpdateOwner.forceUpdateMichellToOwner);
    const deleteProfile = useMutation(api.forceUpdateOwner.deleteMichellProfile);

    const handleForceUpdate = async () => {
        setLoading(true);
        setMessage('🔄 Atualizando perfil...');

        try {
            const result = await forceUpdate();

            if (result.success) {
                setMessage('✅ SUCESSO! Você foi promovido para OWNER!');
                console.log('✅ Michell promovido para owner:', result);

                // ATUALIZAR LOCALSTORAGE DIRETAMENTE
                const currentUser = localStorage.getItem('offline_user');
                if (currentUser) {
                    const userData = JSON.parse(currentUser);
                    userData.role = 'owner';
                    localStorage.setItem('offline_user', JSON.stringify(userData));
                    console.log('✅ localStorage atualizado para owner');
                }

                // Recarregar a página após 1 segundo
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                setMessage(`❌ Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            setMessage('❌ Erro ao atualizar perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAndRecreate = async () => {
        setLoading(true);
        setMessage('🗑️ Deletando perfil atual...');

        try {
            const result = await deleteProfile();

            if (result.success) {
                setMessage('✅ PERFIL DELETADO! Faça logout e login novamente.');
                console.log('✅ Perfil deletado:', result);

                // LIMPAR LOCALSTORAGE COMPLETAMENTE
                localStorage.clear();
                console.log('✅ localStorage limpo');

                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setMessage(`❌ Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Erro ao deletar perfil:', error);
            setMessage('❌ Erro ao deletar perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                🔧 Ferramenta de Administração
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
                Você tem duas opções para resolver o problema do role:
            </p>

            <div className="space-y-3">
                <Button
                    onClick={handleForceUpdate}
                    disabled={loading}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white w-full"
                >
                    {loading ? '🔄 Atualizando...' : '🚀 Promover para Owner'}
                </Button>

                <Button
                    onClick={handleDeleteAndRecreate}
                    disabled={loading}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 w-full"
                >
                    {loading ? '🗑️ Deletando...' : '🗑️ Deletar e Recriar (Recomendado)'}
                </Button>
            </div>

            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                <strong>💡 Recomendação:</strong> Use "Deletar e Recriar" para uma solução limpa e definitiva.
            </div>

            {message && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-800">{message}</p>
                </div>
            )}
        </div>
    );
}