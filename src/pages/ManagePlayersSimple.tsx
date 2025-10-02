import { useAuth } from '@/auth/OfflineAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useState, useEffect } from 'react';
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
}

export default function ManagePlayersSimple() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Estados para dados
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para UI
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

    // Carregar dados do localStorage
    useEffect(() => {
        const loadPlayers = () => {
            try {
                const savedPlayers = localStorage.getItem('players_simple');
                if (savedPlayers) {
                    setPlayers(JSON.parse(savedPlayers));
                }
            } catch (error) {
                console.error('Erro ao carregar jogadores:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPlayers();
    }, []);

    // Salvar dados no localStorage
    const savePlayers = (updatedPlayers: Player[]) => {
        try {
            localStorage.setItem('players_simple', JSON.stringify(updatedPlayers));
            setPlayers(updatedPlayers);
        } catch (error) {
            console.error('Erro ao salvar jogadores:', error);
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
                alert('Por favor, preencha nome e email.');
                return;
            }

            // Verificar se email já existe
            const emailExists = players.some(p => p.email === createForm.email);
            if (emailExists) {
                alert('❌ Email já está cadastrado. Use outro email.');
                return;
            }

            const newPlayer: Player = {
                _id: 'player_' + Date.now(),
                name: createForm.name,
                email: createForm.email,
                role: createForm.role,
                membership: createForm.membership,
                position: createForm.position,
                stars: createForm.stars,
                approved: createForm.approved,
                notifications_enabled: createForm.notifications_enabled,
                created_at: Date.now(),
                updated_at: Date.now(),
                active: true
            };

            const updatedPlayers = [...players, newPlayer];
            savePlayers(updatedPlayers);
            closeCreateModal();
            alert('✅ Jogador criado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao criar jogador:', error);
            alert('❌ Erro ao criar jogador. Tente novamente.');
        }
    };

    // Funções para edição de jogadores
    const openEditModal = (player: Player) => {
        setSelectedPlayer(player);
        setEditForm({
            name: player.name,
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

            if (!editForm.name || !editForm.email) {
                alert('Por favor, preencha nome e email.');
                return;
            }

            // Verificar se email já existe (exceto o próprio jogador)
            const emailExists = players.some(p => p.email === editForm.email && p._id !== selectedPlayer._id);
            if (emailExists) {
                alert('❌ Email já está cadastrado. Use outro email.');
                return;
            }

            const updatedPlayers = players.map(player => 
                player._id === selectedPlayer._id 
                    ? {
                        ...player,
                        name: editForm.name,
                        email: editForm.email,
                        role: editForm.role,
                        membership: editForm.membership,
                        position: editForm.position,
                        stars: editForm.stars,
                        approved: editForm.approved,
                        notifications_enabled: editForm.notifications_enabled,
                        updated_at: Date.now()
                    }
                    : player
            );

            savePlayers(updatedPlayers);
            closeEditModal();
            alert('✅ Jogador atualizado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao atualizar jogador:', error);
            alert('❌ Erro ao atualizar jogador. Tente novamente.');
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
    const toggleApproval = async (player: Player) => {
        try {
            const updatedPlayers = players.map(p => 
                p._id === player._id 
                    ? { ...p, approved: !p.approved, updated_at: Date.now() }
                    : p
            );

            savePlayers(updatedPlayers);
            alert(`✅ Jogador ${!player.approved ? 'aprovado' : 'desaprovado'} com sucesso!`);
        } catch (error: any) {
            console.error('Erro ao alterar aprovação:', error);
            alert('❌ Erro ao alterar aprovação. Tente novamente.');
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

            const updatedPlayers = players.filter(p => p._id !== selectedPlayer._id);
            savePlayers(updatedPlayers);
            closeDeleteModal();
            alert('✅ Jogador excluído com sucesso!');
        } catch (error: any) {
            console.error('Erro ao excluir jogador:', error);
            alert('❌ Erro ao excluir jogador. Tente novamente.');
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
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPositionColor = (position: string) => {
        switch (position) {
            case 'Goleiro': return 'bg-yellow-100 text-yellow-800';
            case 'Zagueiro': return 'bg-red-100 text-red-800';
            case 'Meia': return 'bg-blue-100 text-blue-800';
            case 'Atacante': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderStars = (stars?: number) => {
        const starCount = stars || 0;
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-3 w-3 ${star <= starCount
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Carregando jogadores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="ghost"
                                size="sm"
                                className="p-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="h-6 w-6 text-blue-600" />
                                    Gerenciar Jogadores
                                </h1>
                                <p className="text-sm text-gray-500">{players.length} jogadores cadastrados</p>
                            </div>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Novo
                        </Button>
                    </div>

                    {/* Busca */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Buscar por nome ou email..."
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

                    {/* Status LocalStorage */}
                    <div className="bg-blue-50 p-3 rounded-lg mt-4">
                        <p className="text-sm text-blue-800">
                            💾 <strong>Modo Local:</strong> Dados salvos no navegador (localStorage)
                        </p>
                    </div>
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
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum jogador encontrado</h3>
                                    <p className="text-gray-500 mb-4">
                                        {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro jogador.'}
                                    </p>
                                    {!searchTerm && (
                                        <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Criar Primeiro Jogador
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {filteredPlayers.map((player) => (
                                    <Card key={player._id} className="bg-white shadow-sm">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium text-sm">{player.name}</span>
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

                    {/* Outras tabs com conteúdo filtrado */}
                    <TabsContent value="players" className="space-y-3">
                        <div className="space-y-3">
                            {filteredPlayers.filter(p => p.role === 'player').map((player) => (
                                <Card key={player._id} className="bg-white shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium text-sm">{player.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {renderStars(player.stars)}
                                            <span className="text-xs text-gray-500">{player.stars || 0}/5</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="staff" className="space-y-3">
                        <div className="space-y-3">
                            {filteredPlayers.filter(p => ['owner', 'admin', 'aux'].includes(p.role)).map((player) => (
                                <Card key={player._id} className="bg-white shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium text-sm">{player.name}</span>
                                        </div>
                                        <Badge className={`text-xs ${getRoleColor(player.role)}`}>
                                            {player.role}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modais - Criação, Edição, Visualização, Exclusão */}
            {/* (Todos os modais são idênticos aos da versão Convex, mas sem as verificações de Convex) */}
            
            {/* Modal de Criação */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-md">
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
                            <Plus className="h-4 w-4 mr-1" />
                            Criar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bottom Spacing */}
            <div className="h-20"></div>
        </div>
    );
}