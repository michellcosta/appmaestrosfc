import { useAuth } from '@/auth/OfflineAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import {
    ArrowLeft,
    Edit,
    Eye,
    Plus,
    Search,
    Star,
    Trash2,
    User,
    UserCheck,
    UserMinus,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Player {
    id: string;
    email: string;
    name?: string;
    role: string;
    membership?: string;
    position?: string;
    stars?: number;
    approved: boolean;
    notifications_enabled: boolean;
    updated_at: string;
}

export default function ManagePlayersMobile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterApproved, setFilterApproved] = useState('all');
    const [activeTab, setActiveTab] = useState('all');

    // Estados para modais
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    // Estados para formulários
    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        role: 'player',
        membership: 'mensalista',
        position: 'Meia',
        stars: 5,
        approved: true,
        notifications_enabled: true
    });

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: 'player',
        membership: 'mensalista',
        position: 'Meia',
        stars: 5,
        approved: true,
        notifications_enabled: true
    });

    useEffect(() => {
        loadPlayers();
    }, []);

    const loadPlayers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setPlayers(data || []);
        } catch (error) {
            console.error('Erro ao carregar jogadores:', error);
        } finally {
            setLoading(false);
        }
    };

    // Funções para criação de jogadores
    const openCreateModal = () => {
        setCreateForm({
            name: '',
            email: '',
            role: 'player',
            membership: 'mensalista',
            position: 'Meia',
            stars: 5,
            approved: true,
            notifications_enabled: true
        });
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setCreateForm({
            name: '',
            email: '',
            role: 'player',
            membership: 'mensalista',
            position: 'Meia',
            stars: 5,
            approved: true,
            notifications_enabled: true
        });
    };

    const handleCreatePlayer = async () => {
        try {
            if (!createForm.name || !createForm.email) {
                alert('Por favor, preencha o nome e email.');
                return;
            }

            // Criar o perfil completo do jogador
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: crypto.randomUUID(), // Gerar UUID único
                    email: createForm.email,
                    role: createForm.role,
                    membership: createForm.membership,
                    position: createForm.position,
                    stars: createForm.stars,
                    approved: createForm.approved,
                    notifications_enabled: createForm.notifications_enabled
                });

            if (profileError) throw profileError;

            await loadPlayers();
            closeCreateModal();
            alert('✅ Jogador criado com sucesso!');
        } catch (error) {
            console.error('Erro ao criar jogador:', error);
            alert('❌ Erro ao criar jogador. Verifique se o email já não está cadastrado.');
        }
    };

    // Funções para edição de jogadores
    const openEditModal = (player: Player) => {
        setSelectedPlayer(player);
        setEditForm({
            name: player.email.split('@')[0] || '', // Usar parte do email como nome por enquanto
            email: player.email,
            role: player.role,
            membership: player.membership || 'mensalista',
            position: player.position || 'Meia',
            stars: player.stars || 5,
            approved: player.approved,
            notifications_enabled: player.notifications_enabled
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedPlayer(null);
        setEditForm({
            name: '',
            email: '',
            role: 'player',
            membership: 'mensalista',
            position: 'Meia',
            stars: 5,
            approved: true,
            notifications_enabled: true
        });
    };

    const handleEditPlayer = async () => {
        try {
            if (!selectedPlayer) return;

            const { error } = await supabase
                .from('profiles')
                .update({
                    email: editForm.email,
                    role: editForm.role,
                    membership: editForm.membership,
                    position: editForm.position,
                    stars: editForm.stars,
                    approved: editForm.approved,
                    notifications_enabled: editForm.notifications_enabled
                })
                .eq('id', selectedPlayer.id);

            if (error) throw error;

            await loadPlayers();
            closeEditModal();
            alert('✅ Jogador atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar jogador:', error);
            alert('❌ Erro ao atualizar jogador. Tente novamente.');
        }
    };

    // Funções para exclusão de jogadores
    const openDeleteModal = (player: Player) => {
        setSelectedPlayer(player);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedPlayer(null);
    };

    const handleDeletePlayer = async () => {
        try {
            if (!selectedPlayer) return;

            // Deletar apenas o perfil (sem Auth por enquanto)
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', selectedPlayer.id);

            if (profileError) throw profileError;

            await loadPlayers();
            closeDeleteModal();
            alert('✅ Jogador excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir jogador:', error);
            alert('❌ Erro ao excluir jogador. Tente novamente.');
        }
    };

    // Função para visualização de jogadores
    const openViewModal = (player: Player) => {
        setSelectedPlayer(player);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedPlayer(null);
    };

    // Função para alternar aprovação
    const toggleApproval = async (player: Player) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ approved: !player.approved })
                .eq('id', player.id);

            if (error) throw error;

            await loadPlayers();
            alert(`✅ Jogador ${!player.approved ? 'aprovado' : 'desaprovado'} com sucesso!`);
        } catch (error) {
            console.error('Erro ao alterar aprovação:', error);
            alert('❌ Erro ao alterar aprovação. Tente novamente.');
        }
    };

    // Filtros
    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || player.role === filterRole;
        const matchesApproved = filterApproved === 'all' ||
            (filterApproved === 'approved' && player.approved) ||
            (filterApproved === 'pending' && !player.approved);

        return matchesSearch && matchesRole && matchesApproved;
    });

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'aux': return 'bg-green-100 text-green-800';
            case 'player': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPositionColor = (position?: string) => {
        switch (position) {
            case 'Goleiro': return 'bg-yellow-100 text-yellow-800';
            case 'Zagueiro': return 'bg-blue-100 text-blue-800';
            case 'Meia': return 'bg-green-100 text-green-800';
            case 'Atacante': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderStars = (stars?: number) => {
        const starCount = stars || 0;
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-3 w-3 ${i < starCount ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando jogadores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header Mobile */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => navigate('/owner-dashboard')}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                👥 Gerenciar Jogadores
                            </h1>
                            <p className="text-sm text-gray-600">
                                {players.length} jogadores cadastrados
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo
                    </Button>
                </div>
            </div>

            {/* Filtros */}
            <div className="p-4 space-y-3">
                {/* Busca */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-2 gap-3">
                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os roles</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="aux">Auxiliar</SelectItem>
                            <SelectItem value="player">Jogador</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterApproved} onValueChange={setFilterApproved}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="approved">Aprovados</SelectItem>
                            <SelectItem value="pending">Pendentes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="all" className="text-xs">
                            Todos ({filteredPlayers.length})
                        </TabsTrigger>
                        <TabsTrigger value="players" className="text-xs">
                            Jogadores ({filteredPlayers.filter(p => p.role === 'player').length})
                        </TabsTrigger>
                        <TabsTrigger value="staff" className="text-xs">
                            Staff ({filteredPlayers.filter(p => ['owner', 'admin', 'aux'].includes(p.role)).length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-3">
                        {filteredPlayers.length === 0 ? (
                            <Card className="bg-white shadow-sm">
                                <CardContent className="text-center py-12">
                                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum jogador encontrado</h3>
                                    <p className="text-gray-500 mb-4">Ajuste os filtros ou crie um novo jogador</p>
                                    <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Criar Jogador
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {filteredPlayers.map((player) => (
                                    <Card key={player.id} className="bg-white shadow-sm">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium text-sm">{player.name || player.email}</span>
                                                        {!player.approved && (
                                                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                                                Pendente
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge className={`text-xs ${getRoleColor(player.role)}`}>
                                                            {player.role}
                                                        </Badge>
                                                        {player.position && (
                                                            <Badge className={`text-xs ${getPositionColor(player.position)}`}>
                                                                {player.position}
                                                            </Badge>
                                                        )}
                                                        {player.membership && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {player.membership}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {renderStars(player.stars)}
                                                        <span className="text-xs text-gray-500">
                                                            {player.stars || 0}/5 estrelas
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ações */}
                                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                                                <Button
                                                    onClick={() => openViewModal(player)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Ver
                                                </Button>
                                                <Button
                                                    onClick={() => openEditModal(player)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8"
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    onClick={() => toggleApproval(player)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8"
                                                >
                                                    {player.approved ? (
                                                        <>
                                                            <UserMinus className="h-3 w-3 mr-1" />
                                                            Desaprovar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck className="h-3 w-3 mr-1" />
                                                            Aprovar
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => openDeleteModal(player)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Excluir
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </div>

            {/* Modal de Criação */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Novo Jogador
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados do novo jogador.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="create-name">Nome *</Label>
                            <Input
                                id="create-name"
                                type="text"
                                placeholder="Nome do jogador"
                                value={createForm.name}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="create-email">Email *</Label>
                            <Input
                                id="create-email"
                                type="email"
                                placeholder="jogador@exemplo.com"
                                value={createForm.email}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="create-role">Role</Label>
                                <Select value={createForm.role} onValueChange={(value) => setCreateForm(prev => ({ ...prev, role: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="player">Jogador</SelectItem>
                                        <SelectItem value="aux">Auxiliar</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="create-membership">Mensalidade</Label>
                                <Select value={createForm.membership} onValueChange={(value) => setCreateForm(prev => ({ ...prev, membership: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mensalista">Mensalista</SelectItem>
                                        <SelectItem value="diarista">Diarista</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="create-position">Posição</Label>
                                <Select value={createForm.position} onValueChange={(value) => setCreateForm(prev => ({ ...prev, position: value }))}>
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

                            <div>
                                <Label htmlFor="create-stars">Estrelas</Label>
                                <Select value={createForm.stars.toString()} onValueChange={(value) => setCreateForm(prev => ({ ...prev, stars: parseInt(value) }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <SelectItem key={num} value={num.toString()}>{num} estrelas</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={createForm.approved}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, approved: e.target.checked }))}
                                    className="rounded"
                                />
                                <span className="text-sm">Aprovado</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={createForm.notifications_enabled}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, notifications_enabled: e.target.checked }))}
                                    className="rounded"
                                />
                                <span className="text-sm">Notificações</span>
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeCreateModal} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleCreatePlayer} className="flex-1 bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Criar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Edição */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="w-5 h-5" />
                            Editar Jogador
                        </DialogTitle>
                        <DialogDescription>
                            Edite os dados do jogador.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Nome *</Label>
                            <Input
                                id="edit-name"
                                type="text"
                                placeholder="Nome do jogador"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-email">Email *</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit-role">Role</Label>
                                <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="player">Jogador</SelectItem>
                                        <SelectItem value="aux">Auxiliar</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit-membership">Mensalidade</Label>
                                <Select value={editForm.membership} onValueChange={(value) => setEditForm(prev => ({ ...prev, membership: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mensalista">Mensalista</SelectItem>
                                        <SelectItem value="diarista">Diarista</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit-position">Posição</Label>
                                <Select value={editForm.position} onValueChange={(value) => setEditForm(prev => ({ ...prev, position: value }))}>
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

                            <div>
                                <Label htmlFor="edit-stars">Estrelas</Label>
                                <Select value={editForm.stars.toString()} onValueChange={(value) => setEditForm(prev => ({ ...prev, stars: parseInt(value) }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <SelectItem key={num} value={num.toString()}>{num} estrelas</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editForm.approved}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, approved: e.target.checked }))}
                                    className="rounded"
                                />
                                <span className="text-sm">Aprovado</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editForm.notifications_enabled}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, notifications_enabled: e.target.checked }))}
                                    className="rounded"
                                />
                                <span className="text-sm">Notificações</span>
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeEditModal} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleEditPlayer} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            <Edit className="w-4 h-4 mr-2" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Exclusão */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Excluir Jogador
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir este jogador? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPlayer && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{selectedPlayer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${getRoleColor(selectedPlayer.role)}`}>
                                    {selectedPlayer.role}
                                </Badge>
                                {selectedPlayer.position && (
                                    <Badge className={`text-xs ${getPositionColor(selectedPlayer.position)}`}>
                                        {selectedPlayer.position}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeDeleteModal} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleDeletePlayer} className="flex-1 bg-red-600 hover:bg-red-700">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Visualização */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Detalhes do Jogador
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPlayer && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <div className="font-medium">{selectedPlayer.email}</div>
                                        <div className="text-sm text-gray-500">Email</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge className={`${getRoleColor(selectedPlayer.role)}`}>
                                        {selectedPlayer.role}
                                    </Badge>
                                    <div>
                                        <div className="font-medium">Role</div>
                                    </div>
                                </div>

                                {selectedPlayer.position && (
                                    <div className="flex items-center gap-2">
                                        <Badge className={`${getPositionColor(selectedPlayer.position)}`}>
                                            {selectedPlayer.position}
                                        </Badge>
                                        <div>
                                            <div className="font-medium">Posição</div>
                                        </div>
                                    </div>
                                )}

                                {selectedPlayer.membership && (
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {selectedPlayer.membership}
                                        </Badge>
                                        <div>
                                            <div className="font-medium">Mensalidade</div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    {renderStars(selectedPlayer.stars)}
                                    <div>
                                        <div className="font-medium">Avaliação</div>
                                        <div className="text-sm text-gray-500">{selectedPlayer.stars || 0}/5 estrelas</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div>
                                        <div className="font-medium">Status</div>
                                        <div className="text-sm text-gray-500">
                                            {selectedPlayer.approved ? 'Aprovado' : 'Pendente'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div>
                                        <div className="font-medium">Notificações</div>
                                        <div className="text-sm text-gray-500">
                                            {selectedPlayer.notifications_enabled ? 'Habilitadas' : 'Desabilitadas'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        closeViewModal();
                                        openEditModal(selectedPlayer);
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                                <Button
                                    onClick={() => toggleApproval(selectedPlayer)}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {selectedPlayer.approved ? (
                                        <>
                                            <UserMinus className="w-4 h-4 mr-2" />
                                            Desaprovar
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Aprovar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={closeViewModal} className="w-full">
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bottom Spacing */}
            <div className="h-20"></div>
        </div>
    );
}
