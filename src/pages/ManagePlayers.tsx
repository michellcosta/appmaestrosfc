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
import { Plus, Edit, Trash2, Users, Star, Shirt } from 'lucide-react';

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

export default function ManagePlayers() {
  const { user } = useAuth();
  const { success, error } = useToastHelpers();
  const { canManagePlayers } = usePermissions();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'diarista',
    position: 'Meio',
    stars: 5,
    shirt_size: 'G',
    approved: true
  });

  // Carregar jogadores
  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (err: any) {
      error('Erro ao carregar jogadores', err.message);
    } finally {
      setLoading(false);
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
        // Editar jogador existente
        const { error } = await supabase
          .from('users')
          .update({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            position: formData.position,
            stars: formData.stars,
            shirt_size: formData.shirt_size,
            approved: formData.approved
          })
          .eq('id', editingPlayer.id);

        if (error) throw error;
        success('Jogador atualizado', `${formData.name} foi atualizado com sucesso`);
      } else {
        // Criar novo jogador
        const { error } = await supabase
          .from('users')
          .insert({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            position: formData.position,
            stars: formData.stars,
            shirt_size: formData.shirt_size,
            approved: formData.approved
          });

        if (error) throw error;
        success('Jogador criado', `${formData.name} foi adicionado ao sistema`);
      }

      // Limpar formulário e recarregar
      resetForm();
      loadPlayers();
      setIsDialogOpen(false);
    } catch (err: any) {
      error('Erro ao salvar', err.message);
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      email: player.email,
      role: player.role,
      position: player.position,
      stars: player.stars,
      shirt_size: player.shirt_size,
      approved: player.approved
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (playerId: string, playerName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${playerName}?`)) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
      success('Jogador removido', `${playerName} foi removido do sistema`);
      loadPlayers();
    } catch (err: any) {
      error('Erro ao remover', err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'diarista',
      position: 'Meio',
      stars: 5,
      shirt_size: 'G',
      approved: true
    });
    setEditingPlayer(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'aux': return 'bg-green-100 text-green-800';
      case 'mensalista': return 'bg-yellow-100 text-yellow-800';
      case 'diarista': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'Gol': return '🥅';
      case 'Zaga': return '🛡️';
      case 'Meio': return '⚽';
      case 'Atacante': return '🎯';
      default: return '👤';
    }
  };

  // Verificar permissão
  if (!canManagePlayers()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para gerenciar jogadores.</p>
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
            <p className="text-gray-600">Cadastre e gerencie os jogadores do grupo</p>
          </div>
          
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
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diarista">Diarista</SelectItem>
                        <SelectItem value="mensalista">Mensalista</SelectItem>
                        <SelectItem value="aux">Auxiliar</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="position">Posição</Label>
                    <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gol">Goleiro</SelectItem>
                        <SelectItem value="Zaga">Zagueiro</SelectItem>
                        <SelectItem value="Meio">Meio-campo</SelectItem>
                        <SelectItem value="Atacante">Atacante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stars">Estrelas (1-10)</Label>
                    <Input
                      id="stars"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.stars}
                      onChange={(e) => setFormData(prev => ({ ...prev, stars: parseInt(e.target.value) || 5 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="shirt_size">Tamanho da Camisa</Label>
                    <Select value={formData.shirt_size} onValueChange={(value) => setFormData(prev => ({ ...prev, shirt_size: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="GG">GG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="approved"
                    checked={formData.approved}
                    onChange={(e) => setFormData(prev => ({ ...prev, approved: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="approved">Jogador aprovado</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingPlayer ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de jogadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Jogadores Cadastrados ({players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nenhum jogador cadastrado ainda</p>
                <p className="text-sm text-gray-400">Clique em "Novo Jogador" para começar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <Card key={player.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{player.name}</h3>
                          <p className="text-sm text-gray-600">{player.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: player.stars }, (_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(player.role)}>
                            {player.role}
                          </Badge>
                          {player.approved && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Aprovado
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{getPositionIcon(player.position)} {player.position}</span>
                          <span>•</span>
                          <Shirt className="w-3 h-3" />
                          <span>{player.shirt_size}</span>
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
}
