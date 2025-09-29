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

export default function ManagePlayersSimple() {
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
      
      // Usar RPC function para evitar problemas de RLS
      const { data, error } = await supabase.rpc('get_all_memberships');
      
      if (error) {
        console.error('Erro RPC:', error);
        // Fallback: tentar consulta direta
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('memberships')
          .select('*');
        
        if (fallbackError) throw fallbackError;
        
        const players = (fallbackData || []).map((membership: any) => ({
          id: membership.user_id,
          name: `Usuário ${membership.user_id.slice(0, 8)}`,
          email: 'email@exemplo.com',
          role: membership.role,
          position: 'Meio',
          stars: 5,
          shirt_size: 'G',
          approved: true,
          created_at: membership.created_at
        }));
        
        setPlayers(players);
        return;
      }
      
      setPlayers(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar jogadores:', err);
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
        // Editar role do jogador existente
        const { error } = await supabase
          .from('memberships')
          .update({
            role: formData.role
          })
          .eq('user_id', editingPlayer.id);

        if (error) throw error;
        success('Jogador atualizado', `${formData.name} foi atualizado com sucesso`);
      } else {
        error('Funcionalidade limitada', 'Novos usuários devem fazer login com Google primeiro');
        return;
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
      // Remover membership (não deletar o usuário do auth.users)
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('user_id', playerId);

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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Jogadores (Versão Simples)</h1>
            <p className="text-gray-600">Cadastre e gerencie os jogadores do grupo</p>
          </div>
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
                <p className="text-sm text-gray-400">Execute o script SQL primeiro</p>
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
