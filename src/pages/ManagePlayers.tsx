import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { supabase } from '@/lib/supabase';
import { useToastHelpers } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { Plus, Edit, Trash2, Users, Star, Shirt, RefreshCw } from 'lucide-react';

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

const ManagePlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'diarista',
    position: 'Meio',
    shirt_size: 'G'
  });

  const { user } = useAuth();
  const { canManagePlayers } = usePermissions();
  const { success, error } = useToastHelpers();

  const loadPlayers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando jogadores...');
      
      // Tentar usar RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_memberships');
      
      if (!rpcError && rpcData) {
        console.log('✅ RPC funcionando, carregando jogadores:', rpcData.length);
        console.log('🔍 Dados do RPC:', rpcData);
        setPlayers(rpcData);
        return;
      }
      
      console.log('RPC não disponível, tentando consulta direta...', rpcError);
      
      // Fallback para consulta direta
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('memberships')
        .select(`user_id, role, created_at, status`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (membershipsError) {
        console.error('Erro ao carregar memberships:', membershipsError);
        throw membershipsError;
      }

      if (!membershipsData || membershipsData.length === 0) {
        console.log('Nenhum membership encontrado');
        setPlayers([]);
        return;
      }

      const userIds = membershipsData.map(m => m.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('auth.users')
        .select('id, email, created_at')
        .in('id', userIds);

      if (usersError) {
        console.error('Erro ao carregar usuários:', usersError);
      }

      const players = membershipsData.map((membership: any) => {
        const user = usersData?.find(u => u.id === membership.user_id);
        return {
          id: membership.user_id,
          name: user?.email?.split('@')[0] || `Usuário ${membership.user_id.slice(0, 8)}`,
          email: user?.email || 'email@exemplo.com',
          role: membership.role,
          position: 'Meio',
          stars: 5,
          shirt_size: 'G',
          approved: true,
          created_at: membership.created_at
        };
      });

      setPlayers(players);
    } catch (err: any) {
      console.error('Erro ao carregar jogadores:', err);
      error('Erro ao carregar jogadores', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'diarista',
      position: 'Meio',
      shirt_size: 'G'
    });
    setEditingPlayer(null);
  };

  const handleEdit = (player: Player) => {
    console.log('🔍 Iniciando edição do jogador:', player);
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover ${name}?`)) return;
    
    try {
      const { error } = await supabase
        .from('memberships')
        .update({ status: 'inactive' })
        .eq('user_id', id);

      if (error) throw error;

      success('Jogador removido', `${name} foi removido com sucesso`);
      await loadPlayers();
    } catch (err: any) {
      console.error('Erro ao remover jogador:', err);
      error('Erro ao remover jogador', err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      error('Campos obrigatórios', 'Nome e email são obrigatórios');
      return;
    }

    try {
      if (editingPlayer) {
        console.log('🔍 Editando jogador:', editingPlayer.id, 'Novo role:', formData.role);
        console.log('🔍 Dados do jogador sendo editado:', editingPlayer);
        
        // Editar role do jogador existente
        console.log('🔍 Tentando atualizar membership para user_id:', editingPlayer.id);
        
        const { data, error } = await supabase
          .from('memberships')
          .update({
            role: formData.role
          })
          .eq('user_id', editingPlayer.id)
          .select('*');

        console.log('🔍 Resultado da atualização:', { data, error });

        if (error) {
          console.error('❌ Erro na atualização:', error);
          throw error;
        }

        console.log('✅ Jogador atualizado com sucesso');
        success('Jogador atualizado', `${formData.name} foi atualizado com sucesso`);
        
        // Atualizar a lista local imediatamente
        console.log('🔄 Atualizando lista local...');
        setPlayers(prev => {
          const updated = prev.map(player => 
            player.id === editingPlayer.id 
              ? { ...player, role: formData.role }
              : player
          );
          console.log('🔍 Lista atualizada:', updated);
          return updated;
        });
        
        // Recarregar do banco para confirmar
        console.log('🔄 Recarregando do banco...');
        await loadPlayers();
      } else {
        console.log('🔍 Adicionando novo jogador:', formData);
        
        // Usar a função add_player do banco de dados
        const { data, error } = await supabase.rpc('add_player', {
          p_name: formData.name,
          p_email: formData.email,
          p_role: formData.role,
          p_position: formData.position,
          p_shirt_size: formData.shirt_size
        });

        console.log('🔍 Resultado do add_player:', { data, error });

        if (error) {
          console.error('❌ Erro ao adicionar jogador:', error);
          throw error;
        }

        console.log('✅ Jogador adicionado com sucesso:', data);
        success('Jogador adicionado', `${formData.name} foi adicionado com sucesso`);
        
        // Recarregar a lista de jogadores
        await loadPlayers();
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error('❌ Erro ao salvar:', err);
      error('Erro ao salvar', err.message);
    }
  };

  // Verificar permissão com debug
  console.log('🔍 Debug - Usuário:', user);
  console.log('🔍 Debug - canManagePlayers():', canManagePlayers());
  
  // TEMPORÁRIO: Permitir acesso para teste
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
          <div className="mt-4">
            <Button onClick={() => window.location.href = '/create-owner-google'}>
              Fazer Login com Google
            </Button>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Jogadores</h1>
            <p className="text-gray-600 mt-1">Gerencie os jogadores do seu time</p>
          </div>
          
          <div className="flex gap-3">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Jogador
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do jogador"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Função</Label>
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
                          <SelectItem value="Lateral">Lateral</SelectItem>
                          <SelectItem value="Meio">Meio</SelectItem>
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
                        <SelectItem value="P">P</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="GG">GG</SelectItem>
                        <SelectItem value="XG">XG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingPlayer ? 'Atualizar' : 'Adicionar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={loadPlayers} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar
            </Button>
            
            <Button 
              onClick={() => {
                console.log('🧪 Testando edição manual...');
                if (players.length > 0) {
                  const firstPlayer = players[0];
                  console.log('🔍 Editando primeiro jogador:', firstPlayer);
                  handleEdit(firstPlayer);
                }
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Teste Edição
            </Button>
          </div>
        </div>

        {/* Lista de jogadores */}
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
                        <Badge variant={player.role === 'owner' ? 'default' : 'secondary'}>
                          {player.role}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
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

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(player)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(player.id, player.name)}
                          className="flex-1"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagePlayers;
