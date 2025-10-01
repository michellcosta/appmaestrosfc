import { useAuth } from '@/auth/OfflineAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToastHelpers } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase';
import { Edit, RefreshCw, Shirt, Star, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Player {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
  stars: number;
  shirt_size: string;
  approved: boolean;
  created_at: string;
}

const ManagePlayersSimple: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'diarista',
    position: 'Meia',
    shirt_size: 'G'
  });

  const { user } = useAuth();
  const { canManagePlayers } = usePermissions();
  const { success, error } = useToastHelpers();

  const loadPlayers = async (forceReload = false) => {
    try {
      // Evitar múltiplas chamadas simultâneas
      if (loading && !forceReload) {
        return;
      }

      setLoading(true);
      console.log('🔄 Carregando jogadores REAIS do Supabase - Modo:', forceReload ? '(FORÇA)' : '(NORMAL)');

      // USAR APENAS SUPABASE - DADOS REAIS
      // Buscar diretamente da tabela profiles (estrutura correta)
      console.log('🔄 Buscando jogadores diretamente da tabela profiles...');

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Erro ao carregar profiles:', profilesError);
        throw profilesError;
      }

      if (!profilesData || profilesData.length === 0) {
        console.log('⚠️ Nenhum jogador encontrado no Supabase');
        setPlayers([]);
        setLoading(false);
        return;
      }

      // Converter dados da tabela profiles para o formato esperado
      const players = profilesData.map((profile: any) => ({
        id: profile.id,
        name: profile.email.split('@')[0] || 'Jogador',
        email: profile.email,
        role: profile.role || 'player',
        position: profile.position || 'Meio',
        stars: profile.stars || 5,
        shirt_size: 'G', // Campo não existe na tabela profiles
        approved: true, // Sempre true já que não temos o campo
        created_at: profile.updated_at
      }));

      console.log('✅ Jogadores REAIS carregados do Supabase:', players.length, players);

      setPlayers(players);

    } catch (err: unknown) {
      console.error('❌ Erro ao carregar jogadores:', err);
      error('Erro ao carregar jogadores', err.message);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 useEffect executado - carregando jogadores...');
    loadPlayers();
  }, []);

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      email: player.email,
      role: player.role,
      position: player.position,
      shirt_size: player.shirt_size
    });
    setIsDialogOpen(true);
  };

  const handleUpdatePlayer = async () => {
    console.log('🎯 handleUpdatePlayer chamado!', { formData, editingPlayer });

    if (!formData.name || !formData.email) {
      console.log('❌ Validação falhou:', { name: formData.name, email: formData.email });
      error('Campos obrigatórios', 'Nome e email são obrigatórios');
      return;
    }

    console.log('✅ Validação passou, iniciando operação...');
    try {
      if (editingPlayer) {
        // EDITAR JOGADOR EXISTENTE - APENAS SUPABASE
        console.log('🔄 Editando jogador REAL no Supabase:', formData.name);

        // Verificar se é o owner principal (michellcosta1269@gmail.com)
        if (editingPlayer.email === 'michellcosta1269@gmail.com') {
          formData.role = 'owner';
        }

        // Atualizar diretamente na tabela profiles (apenas campos que existem)
        const updateFields: any = {
          email: formData.email
        };

        // Adicionar campos opcionais apenas se existirem
        if (formData.role) updateFields.role = formData.role;
        if (formData.position) updateFields.position = formData.position;

        console.log('📝 Campos para atualização:', updateFields);

        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update(updateFields)
          .eq('id', editingPlayer.id)
          .select('*');

        if (updateError) {
          console.error('❌ Erro ao atualizar profile:', updateError);
          throw new Error(`Erro ao atualizar profile: ${updateError.message}`);
        }

        console.log('✅ Jogador atualizado com sucesso no Supabase:', formData.name);
        success('Jogador atualizado', `${formData.name} foi atualizado com sucesso no Supabase`);

        // Recarregar a lista para mostrar os dados reais
        await loadPlayers(true);
      } else {
        // ADICIONAR NOVO JOGADOR - SUPABASE COM RPC
        console.log('🔄 Adicionando jogador REAL no Supabase:', formData.name);

        try {
          console.log('📝 Dados do formulário:', formData);

          const email = formData.email.trim() || `${formData.name.trim()}@exemplo.com`;

          // PRIMEIRO: Verificar autenticação do usuário (offline ou Supabase)
          console.log('🔍 Verificando autenticação do usuário...');

          // Verificar se há usuário offline primeiro
          const offlineUser = localStorage.getItem('offline_user');
          let authUser = null;

          if (offlineUser) {
            try {
              authUser = JSON.parse(offlineUser);
              console.log('🔍 Usuário offline encontrado:', authUser);
            } catch (error) {
              console.error('❌ Erro ao parsear usuário offline:', error);
            }
          }

          // Se não há usuário offline, tentar Supabase
          if (!authUser) {
            try {
              const { data: { user }, error: authError } = await supabase.auth.getUser();
              if (user && !authError) {
                authUser = {
                  id: user.id,
                  email: user.email,
                  role: 'owner' // Default para usuários do Supabase
                };
                console.log('🔍 Usuário Supabase encontrado:', authUser);
              }
            } catch (error) {
              console.log('⚠️ Erro ao verificar usuário Supabase (normal para modo offline):', error);
            }
          }

          if (!authUser) {
            console.error('❌ Nenhum usuário autenticado encontrado');
            throw new Error('Usuário não está autenticado. Faça login primeiro.');
          }

          console.log('✅ Usuário autenticado:', authUser);

          // SEGUNDO: Tentar inserir diretamente na tabela profiles
          console.log('🔄 Tentando inserir diretamente na tabela profiles...');

          const insertData = {
            id: crypto.randomUUID(),
            email: email,
            role: formData.role || 'diarista',
            membership: formData.role === 'mensalista' ? 'mensalista' : 'diarista',
            position: formData.position || 'Meio',
            stars: 5,
            notifications_enabled: true
          };

          console.log('📤 Dados para inserção:', insertData);

          const { data: insertResult, error: insertError } = await supabase
            .from('profiles')
            .insert(insertData)
            .select('*');

          if (insertError) {
            console.error('❌ Erro ao inserir na tabela profiles:', insertError);
            console.log('🔄 Tentando usar função RPC como fallback...');

            // Tentar usar função RPC como fallback
            try {
              const { data: rpcResult, error: rpcError } = await supabase
                .rpc('create_user_profile', {
                  user_id: authUser.id,
                  user_email: email,
                  user_name: formData.name,
                  user_role: formData.role || 'diarista'
                });

              if (rpcError) {
                console.error('❌ Erro na função RPC:', rpcError);
                throw new Error(`Erro ao criar perfil: ${rpcError.message}`);
              }

              console.log('✅ Perfil criado via RPC:', rpcResult);
            } catch (rpcError) {
              console.log('⚠️ RPC também falhou, criando jogador local temporário...');

              // Fallback final: criar jogador local temporário
              const tempPlayer = {
                id: crypto.randomUUID(),
                name: formData.name,
                email: email,
                role: formData.role || 'diarista',
                position: formData.position || 'Meio',
                stars: 5,
                shirt_size: formData.shirt_size || 'G',
                approved: true,
                created_at: new Date().toISOString(),
                isTemporary: true
              };

              console.log('✅ Jogador temporário criado:', tempPlayer);
              setPlayers(prev => [tempPlayer, ...prev]);

              success('Jogador adicionado (temporário)', `${formData.name} foi adicionado localmente. Aplique as políticas RLS no Supabase para persistência real.`);
              return; // Sair da função aqui
            }
          } else {
            console.log('✅ Jogador inserido diretamente:', insertResult);
          }

          console.log('✅ Jogador adicionado com sucesso:', formData.name);
          success('Jogador adicionado', `${formData.name} foi adicionado com sucesso ao banco de dados`);

          // Recarregar a lista para mostrar os dados reais
          await loadPlayers(true);

        } catch (addError) {
          console.error('❌ Erro geral ao adicionar jogador:', addError);
          error('Erro ao adicionar jogador', addError.message);
          throw addError;
        }
      }

      setIsDialogOpen(false);
      setEditingPlayer(null);
    } catch (err: unknown) {
      console.error('❌ Erro ao salvar:', err);
      error('Erro ao salvar', err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Verificar se é o owner principal
    const player = players.find(p => p.id === id);
    if (player?.email === 'michellcosta1269@gmail.com') {
      error('Ação não permitida', 'O owner principal não pode ser removido');
      return;
    }

    if (!confirm(`Tem certeza que deseja remover ${name}?`)) return;

    try {
      console.log('🔄 Removendo jogador REAL do Supabase:', name);

      // REMOVER APENAS DO SUPABASE - DADOS REAIS
      // Deletar diretamente da tabela profiles (não temos campo approved)
      const { data: deleteData, error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)
        .select('*');

      if (deleteError) {
        console.error('❌ Erro ao deletar jogador:', deleteError);
        throw new Error(`Erro ao remover jogador: ${deleteError.message}`);
      }

      console.log('✅ Jogador removido do Supabase:', name);

      success('Jogador removido', `${name} foi removido com sucesso do Supabase`);

      // Recarregar a lista para mostrar os dados reais
      await loadPlayers(true);

    } catch (err: unknown) {
      console.error('❌ Erro ao remover jogador:', err);
      error('Erro ao remover jogador', err.message);
    }
  };

  console.log('Permissão para gerenciar jogadores:', canManagePlayers());

  if (!canManagePlayers() && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para gerenciar jogadores.</p>
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-700">Debug Info:</p>
            <p className="text-xs text-gray-600">User: {JSON.stringify(user)}</p>
            <p className="text-xs text-gray-600">Can Manage: {canManagePlayers() ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Jogadores</h1>
            <p className="text-gray-600 mt-1">Sistema Híbrido - Funciona offline e online</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  role: 'diarista',
                  position: 'Meia',
                  shirt_size: 'G'
                });
                setEditingPlayer(null);
                setIsDialogOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Adicionar Jogador
            </Button>
            <Button onClick={() => loadPlayers(true)} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Recarregar
            </Button>
            <Button
              onClick={() => {
                setPlayers([]);
                setTimeout(() => loadPlayers(true), 500);
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              🔄 Forçar Atualização
            </Button>
            <Button
              onClick={async () => {
                try {
                  const { data, error } = await supabase
                    .from('memberships')
                    .select('count')
                    .limit(1);

                  if (error) {
                    console.error('❌ Erro de conectividade:', error);
                    error('Erro de conexão', error.message);
                  } else {
                    success('Conectividade OK', 'Conexão com Supabase funcionando');
                  }
                } catch (err: unknown) {
                  console.error('❌ Erro de rede:', err);
                  error('Erro de rede', err.message);
                }
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              🔍 Testar Conexão
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Jogadores ({players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum jogador encontrado</h3>
                <p className="text-gray-600">Adicione jogadores para começar a gerenciar seu time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <Card key={player.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{player.name}</h3>
                          <p className="text-sm text-gray-600">{player.email}</p>
                        </div>
                        <Badge variant="secondary">{player.role}</Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span>{player.stars} estrelas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shirt className="w-4 h-4" />
                          <span>Camisa {player.shirt_size}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(player.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(player)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        {player.email === 'michellcosta1269@gmail.com' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="flex-1"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Protegido
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(player.id, player.name)}
                            className="flex-1"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPlayer ? 'Editar Jogador' : 'Adicionar Jogador'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do jogador"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Função</Label>
                  {editingPlayer?.email === 'michellcosta1269@gmail.com' ? (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <span className="text-blue-700 font-medium">Owner (Protegido)</span>
                      <span className="text-xs text-blue-600">Não pode ser alterado</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="auxiliar">Auxiliar</SelectItem>
                        <SelectItem value="mensalista">Mensalista</SelectItem>
                        <SelectItem value="diarista">Diarista</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <Label htmlFor="position">Posição</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Goleiro">Goleiro</SelectItem>
                      <SelectItem value="Zagueiro">Zagueiro</SelectItem>
                      <SelectItem value="Meia">Meia</SelectItem>
                      <SelectItem value="Atacante">Atacante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="shirt_size">Tamanho da Camisa</Label>
                <Select
                  value={formData.shirt_size}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, shirt_size: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="GG">GG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    console.log('🔘 Botão Adicionar/Atualizar clicado!');
                    handleUpdatePlayer();
                  }}
                  className="flex-1"
                >
                  {editingPlayer ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManagePlayersSimple;