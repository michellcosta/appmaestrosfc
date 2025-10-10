import { useAuth } from '@/auth/OfflineAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToastHelpers } from '@/components/ui/toast';
import { PROTECTION_MESSAGES, canRemoveUser, isMainOwner } from '@/utils/ownerProtection';
import {
  Crown,
  Shield,
  UserMinus,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useState } from 'react';

export default function ManageAdmins() {
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToastHelpers();
  const { user } = useAuth();

  // Mock data - em produção viria do Supabase
  const [admins, setAdmins] = useState([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      role: 'admin',
      status: 'active',
      addedDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
      role: 'aux',
      status: 'active',
      addedDate: '2024-01-20'
    }
  ]);

  const handleAddAdmin = async () => {
    if (!searchEmail) {
      error('Email obrigatório', 'Digite um email válido');
      return;
    }

    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newAdmin = {
        id: Date.now().toString(),
        name: searchEmail.split('@')[0],
        email: searchEmail,
        role: 'admin',
        status: 'pending',
        addedDate: new Date().toISOString().split('T')[0]
      };

      setAdmins(prev => [...prev, newAdmin]);
      setSearchEmail('');
      success('Admin adicionado', 'Convite enviado para ' + searchEmail);
    } catch (err) {
      error('Erro ao adicionar', 'Tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    // Encontrar o admin pelo ID
    const admin = admins.find(a => a.id === adminId);
    if (!admin) {
      error('Admin não encontrado', 'O administrador não foi encontrado');
      return;
    }

    // Verificar se pode excluir o usuário
    if (!canRemoveUser(admin.email)) {
      error('Acesso negado', PROTECTION_MESSAGES.CANNOT_REMOVE_OWNER);
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));
      success('Admin removido', 'Permissões revogadas com sucesso');
    } catch (err) {
      error('Erro ao remover', 'Tente novamente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold flex items-center gap-2 dark:text-zinc-100">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Gerenciar Administradores
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie as permissões dos administradores do grupo</p>
      </div>

      {/* Adicionar Admin */}
      <Card className="animate-fade-in-up dark:bg-zinc-800 dark:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-zinc-100">
            <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
            Adicionar Administrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Digite o email do novo admin"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-100 dark:placeholder-zinc-400"
            />
            <Button
              onClick={handleAddAdmin}
              disabled={loading || !searchEmail}
              className="bg-gradient-primary hover:opacity-90 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            O usuário receberá um convite por email para se tornar administrador
          </p>
        </CardContent>
      </Card>

      {/* Lista de Admins */}
      <Card className="animate-fade-in-up dark:bg-zinc-800 dark:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-zinc-100">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Administradores Ativos ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((admin, index) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 border dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary dark:bg-blue-600 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-zinc-100">{admin.name}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{admin.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={admin.role === 'admin' ? 'default' : 'secondary'}
                        className="text-xs dark:border-zinc-600"
                      >
                        {admin.role === 'admin' ? '🛡️ Admin' : '⚡ Auxiliar'}
                      </Badge>
                      <Badge
                        variant={admin.status === 'active' ? 'default' : 'outline'}
                        className="text-xs dark:border-zinc-600"
                      >
                        {admin.status === 'active' ? '✅ Ativo' : '⏳ Pendente'}
                      </Badge>
                      {isMainOwner(admin.id) && (
                        <Badge
                          variant="destructive"
                          className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white dark:from-purple-700 dark:to-blue-700"
                        >
                          👑 Owner Principal
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Adicionado em {new Date(admin.addedDate).toLocaleDateString('pt-BR')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveAdmin(admin.id)}
                    disabled={loading || !canRemoveUser(admin.email)}
                    className={
                      !canRemoveUser(admin.email)
                        ? "text-gray-400 cursor-not-allowed dark:text-zinc-600 dark:border-zinc-700"
                        : "text-red-600 hover:bg-red-50 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:border-red-800 dark:border-zinc-600"
                    }
                    title={
                      !canRemoveUser(admin.email)
                        ? "O owner principal não pode ser removido"
                        : "Remover administrador"
                    }
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
