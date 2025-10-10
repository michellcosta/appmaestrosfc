import { useAuth } from '@/auth/OfflineAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlayersConvex } from '@/hooks/usePlayersConvex';
import { PROTECTION_MESSAGES, isMainOwner } from '@/utils/ownerProtection';
import {
    ArrowLeft,
    Crown,
    Edit,
    Eye,
    Plus,
    Search,
    Shield,
    Star,
    Trash2,
    User,
    UserCheck,
    UserMinus,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Player {
    _id: string;
    name: string;
    email: string;
    role: string;
    membership?: string;
    position?: string;
    stars?: number;
    approved: boolean;
    notifications_enabled: boolean;
    created_at: number;
    updated_at: number;
    active: boolean;
    // Campos enriquecidos do profile
    profile_position?: string;
    profile_shirt_size?: string;
    profile_avatar_url?: string;
}

export default function ManagePlayersConvex() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { players, stats, isLoading, createPlayer, updatePlayer, removePlayer, toggleApproval, updateProfileFields } = usePlayersConvex();

    // Estados para UI
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterApproved, setFilterApproved] = useState('all');

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
        notifications_enabled: true,
        shirt_size: 'G'
    });

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
    };

    const handleCreatePlayer = async () => {
        try {
            await createPlayer({
                name: createForm.name,
                email: createForm.email,
                role: createForm.role as any,
                membership: createForm.membership as any,
                position: createForm.position as any,
                stars: createForm.stars,
                approved: createForm.approved,
                notifications_enabled: createForm.notifications_enabled
            });

            closeCreateModal();
            alert('✅ Jogador criado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao criar jogador:', error);
            alert(error.message || '❌ Erro ao criar jogador. Tente novamente.');
        }
    };

    // Funções para edição
    const openEditModal = (player: Player) => {
        setSelectedPlayer(player);
        setEditForm({
            name: player.name,
            email: player.email,
            role: player.role,
            membership: player.membership || 'mensalista',
            position: player.position || player.profile_position || 'Meia',
            stars: player.stars || 5,
            approved: player.approved,
            notifications_enabled: player.notifications_enabled,
            shirt_size: player.profile_shirt_size || 'G'
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedPlayer(null);
    };

    const handleEditPlayer = async () => {
        try {
            if (!selectedPlayer) return;

            // Atualizar dados básicos do player
            await updatePlayer({
                id: selectedPlayer._id,
                name: editForm.name,
                email: editForm.email,
                role: editForm.role as any,
                membership: editForm.membership as any,
                position: editForm.position as any,
                stars: editForm.stars,
                approved: editForm.approved,
                notifications_enabled: editForm.notifications_enabled
            });

            // Atualizar campos do profile (posição e camisa)
            await updateProfileFields(
                editForm.email,
                editForm.position,
                editForm.shirt_size || undefined,
                undefined // sem telefone
            );

            closeEditModal();
            alert('✅ Jogador atualizado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao atualizar jogador:', error);
            alert(error.message || '❌ Erro ao atualizar jogador. Tente novamente.');
        }
    };

    // Funções para visualização
    const openViewModal = (player: Player) => {
        setSelectedPlayer(player);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedPlayer(null);
    };

    // Função para alternar aprovação
    const handleToggleApproval = async (player: Player) => {
        try {
            await toggleApproval({ id: player._id });
            alert(`✅ Jogador ${!player.approved ? 'aprovado' : 'desaprovado'} com sucesso!`);
        } catch (error: any) {
            console.error('Erro ao alterar aprovação:', error);
            alert(error.message || '❌ Erro ao alterar aprovação. Tente novamente.');
        }
    };

    // Funções para exclusão
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

            await removePlayer({ id: selectedPlayer._id });
            closeDeleteModal();
            alert('✅ Jogador excluído com sucesso!');
        } catch (error: any) {
            console.error('Erro ao excluir jogador:', error);
            alert(error.message || '❌ Erro ao excluir jogador. Tente novamente.');
        }
    };

    // Filtros
    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.name.toLowerCase().includes(searchTerm.toLowerCase());
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

    const getMembershipColor = (membership: string) => {
        switch (membership) {
            case 'mensalista': return 'bg-green-100 text-green-800';
            case 'diarista': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPositionColor = (position: string) => {
        switch (position) {
            case 'Goleiro': return 'bg-red-100 text-red-800';
            case 'Zagueiro': return 'bg-blue-100 text-blue-800';
            case 'Meia': return 'bg-green-100 text-green-800';
            case 'Atacante': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('pt-BR');
    };

    const renderStars = (stars: number) => {
        return Array.from({ length: 10 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    // Verificar se o jogador é protegido
    // Função para proteger apenas o cargo (role) do owner principal
    const isRoleProtected = (player: Player) => {
        return isMainOwner(player.email, player.name);
    };

    // Função para proteger ações críticas (excluir, desativar)
    const isPlayerProtected = (player: Player) => {
        return isMainOwner(player.email, player.name);
    };

    if (isLoading) {
        return (
            <div className="min-h-[100dvh] bg-background text-foreground px-4 pb-20">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-32 bg-muted rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-background text-foreground px-4 pb-20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/home')}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Voltar</span>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Gerenciar Jogadores</h1>
                            <p className="text-muted-foreground">Gerencie jogadores e suas informações</p>
                        </div>
                    </div>
                    <Button onClick={openCreateModal} className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Jogador</span>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <UserCheck className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Aprovados</p>
                                    <p className="text-2xl font-bold">{stats.approved}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <UserMinus className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Pendentes</p>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Crown className="h-5 w-5 text-purple-600" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Owners</p>
                                    <p className="text-2xl font-bold">{stats.owners}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por nome ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={filterRole} onValueChange={setFilterRole}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filtrar por cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os cargos</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="aux">Auxiliar</SelectItem>
                                    <SelectItem value="player">Jogador</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterApproved} onValueChange={setFilterApproved}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os status</SelectItem>
                                    <SelectItem value="approved">Aprovados</SelectItem>
                                    <SelectItem value="pending">Pendentes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Players List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPlayers.map((player) => (
                        <Card key={player._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{player.name}</h3>
                                            <p className="text-sm text-muted-foreground">{player.email}</p>
                                        </div>
                                    </div>
                                    {isPlayerProtected(player) && (
                                        <div className="flex items-center space-x-1 text-purple-600" title={PROTECTION_MESSAGES.OWNER_PROTECTION}>
                                            <Shield className="h-4 w-4" />
                                            <Crown className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Cargo:</span>
                                        <Badge className={getRoleColor(player.role)}>
                                            {player.role}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Mensalidade:</span>
                                        <Badge className={getMembershipColor(player.membership || 'mensalista')}>
                                            {player.membership || 'mensalista'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Posição:</span>
                                        <Badge className={getPositionColor(player.position || player.profile_position || 'Meia')}>
                                            {player.position || player.profile_position || 'Meia'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Camisa:</span>
                                        <Badge variant="outline" className="dark:bg-slate-800">
                                            {player.profile_shirt_size || 'Não definido'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Avaliação:</span>
                                        <div className="flex items-center space-x-1">
                                            {renderStars(player.stars || 10)}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Status:</span>
                                        <Badge className={player.approved ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'}>
                                            {player.approved ? 'Aprovado' : 'Pendente'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Criado em:</span>
                                        <span className="text-sm">{formatDate(player.created_at)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openViewModal(player)}
                                            title="Visualizar"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditModal(player)}
                                            // ✅ Liberado para edição pelo owner principal
                                            title="Editar dados pessoais"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleApproval(player)}
                                            disabled={isPlayerProtected(player)}
                                            title={isPlayerProtected(player) ? PROTECTION_MESSAGES.CANNOT_CHANGE_OWNER_ROLE : "Alterar aprovação"}
                                        >
                                            <UserCheck className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDeleteModal(player)}
                                            disabled={isPlayerProtected(player)}
                                            title={isPlayerProtected(player) ? PROTECTION_MESSAGES.CANNOT_REMOVE_OWNER : "Excluir"}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredPlayers.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhum jogador encontrado</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || filterRole !== 'all' || filterApproved !== 'all'
                                    ? 'Tente ajustar os filtros de busca.'
                                    : 'Comece adicionando jogadores ao sistema.'}
                            </p>
                            <Button onClick={openCreateModal}>
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Primeiro Jogador
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Create Modal */}
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Adicionar Jogador</DialogTitle>
                            <DialogDescription>
                                Preencha as informações do novo jogador.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="create-name">Nome</Label>
                                <Input
                                    id="create-name"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div>
                                <Label htmlFor="create-email">Email</Label>
                                <Input
                                    id="create-email"
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="create-role">Cargo</Label>
                                <Select value={createForm.role} onValueChange={(value) => setCreateForm({ ...createForm, role: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="player">Jogador</SelectItem>
                                        <SelectItem value="aux">Auxiliar</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="create-membership">Mensalidade</Label>
                                <Select value={createForm.membership} onValueChange={(value) => setCreateForm({ ...createForm, membership: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mensalista">Mensalista</SelectItem>
                                        <SelectItem value="diarista">Diarista</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="create-position">Posição</Label>
                                <Select value={createForm.position} onValueChange={(value) => setCreateForm({ ...createForm, position: value })}>
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
                                <Label htmlFor="create-stars">Avaliação</Label>
                                <Select value={createForm.stars.toString()} onValueChange={(value) => setCreateForm({ ...createForm, stars: parseInt(value) })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Estrela</SelectItem>
                                        <SelectItem value="2">2 Estrelas</SelectItem>
                                        <SelectItem value="3">3 Estrelas</SelectItem>
                                        <SelectItem value="4">4 Estrelas</SelectItem>
                                        <SelectItem value="5">5 Estrelas</SelectItem>
                                        <SelectItem value="6">6 Estrelas</SelectItem>
                                        <SelectItem value="7">7 Estrelas</SelectItem>
                                        <SelectItem value="8">8 Estrelas</SelectItem>
                                        <SelectItem value="9">9 Estrelas</SelectItem>
                                        <SelectItem value="10">10 Estrelas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={closeCreateModal}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreatePlayer}>
                                Adicionar Jogador
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Editar Jogador</DialogTitle>
                            <DialogDescription>
                                Atualize as informações do jogador.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-name">Nome</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    placeholder="email@exemplo.com"
                                // ✅ Liberado para edição pelo owner principal
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-role">Cargo</Label>
                                <Select
                                    value={editForm.role}
                                    onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                                    disabled={selectedPlayer && isRoleProtected(selectedPlayer)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="player">Jogador</SelectItem>
                                        <SelectItem value="aux">Auxiliar</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                                {selectedPlayer && isPlayerProtected(selectedPlayer) && (
                                    <p className="text-sm text-purple-600 mt-1 flex items-center">
                                        <Shield className="h-3 w-3 mr-1" />
                                        {PROTECTION_MESSAGES.CANNOT_CHANGE_OWNER_ROLE}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="edit-membership">Mensalidade</Label>
                                <Select value={editForm.membership} onValueChange={(value) => setEditForm({ ...editForm, membership: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mensalista">Mensalista</SelectItem>
                                        <SelectItem value="diarista">Diarista</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-position">Posição</Label>
                                <Select value={editForm.position} onValueChange={(value) => setEditForm({ ...editForm, position: value })}>
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
                                <Label htmlFor="edit-shirt-size">Tamanho de Camisa</Label>
                                <Select value={editForm.shirt_size} onValueChange={(value) => setEditForm({ ...editForm, shirt_size: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="G">G</SelectItem>
                                        <SelectItem value="GG">GG</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-stars">Avaliação</Label>
                                <Select value={editForm.stars.toString()} onValueChange={(value) => setEditForm({ ...editForm, stars: parseInt(value) })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Estrela</SelectItem>
                                        <SelectItem value="2">2 Estrelas</SelectItem>
                                        <SelectItem value="3">3 Estrelas</SelectItem>
                                        <SelectItem value="4">4 Estrelas</SelectItem>
                                        <SelectItem value="5">5 Estrelas</SelectItem>
                                        <SelectItem value="6">6 Estrelas</SelectItem>
                                        <SelectItem value="7">7 Estrelas</SelectItem>
                                        <SelectItem value="8">8 Estrelas</SelectItem>
                                        <SelectItem value="9">9 Estrelas</SelectItem>
                                        <SelectItem value="10">10 Estrelas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={closeEditModal}>
                                Cancelar
                            </Button>
                            <Button onClick={handleEditPlayer}>
                                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* View Modal */}
                <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Detalhes do Jogador</DialogTitle>
                            <DialogDescription>
                                Informações completas do jogador.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedPlayer && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedPlayer.name}</h3>
                                        <p className="text-muted-foreground">{selectedPlayer.email}</p>
                                    </div>
                                    {isPlayerProtected(selectedPlayer) && (
                                        <div className="flex items-center space-x-1 text-purple-600" title={PROTECTION_MESSAGES.OWNER_PROTECTION}>
                                            <Shield className="h-5 w-5" />
                                            <Crown className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cargo</p>
                                        <Badge className={getRoleColor(selectedPlayer.role)}>
                                            {selectedPlayer.role}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Mensalidade</p>
                                        <Badge className={getMembershipColor(selectedPlayer.membership || 'mensalista')}>
                                            {selectedPlayer.membership || 'mensalista'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Posição</p>
                                        <Badge className={getPositionColor(selectedPlayer.position || 'Meia')}>
                                            {selectedPlayer.position || 'Meia'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Avaliação</p>
                                        <div className="flex items-center space-x-1">
                                            {renderStars(selectedPlayer.stars || 10)}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <Badge className={selectedPlayer.approved ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'}>
                                            {selectedPlayer.approved ? 'Aprovado' : 'Pendente'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Notificações</p>
                                        <Badge className={selectedPlayer.notifications_enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'}>
                                            {selectedPlayer.notifications_enabled ? 'Ativadas' : 'Desativadas'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Criado em</p>
                                    <p className="text-sm">{formatDate(selectedPlayer.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Última atualização</p>
                                    <p className="text-sm">{formatDate(selectedPlayer.updated_at)}</p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={closeViewModal}>
                                Fechar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Modal */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Confirmar Exclusão</DialogTitle>
                            <DialogDescription>
                                Tem certeza que deseja excluir este jogador? Esta ação não pode ser desfeita.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedPlayer && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{selectedPlayer.name}</h3>
                                        <p className="text-sm text-gray-600">{selectedPlayer.email}</p>
                                    </div>
                                </div>
                                {isPlayerProtected(selectedPlayer) && (
                                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <div className="flex items-center space-x-2 text-purple-800">
                                            <Shield className="h-4 w-4" />
                                            <span className="text-sm font-medium">{PROTECTION_MESSAGES.CANNOT_REMOVE_OWNER}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={closeDeleteModal}>
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeletePlayer}
                                disabled={selectedPlayer && isPlayerProtected(selectedPlayer)}
                            >
                                Excluir Jogador
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}