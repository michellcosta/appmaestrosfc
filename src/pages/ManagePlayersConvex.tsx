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
import { useEffect, useState } from 'react';
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

// Hook personalizado para Convex com fallback para localStorage
function useConvexSafe() {
    const [convexReady, setConvexReady] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    // Carregar dados do localStorage
    useEffect(() => {
        const loadLocalData = () => {
            try {
                const savedPlayers = localStorage.getItem('convex_players');
                if (savedPlayers) {
                    setPlayers(JSON.parse(savedPlayers));
                }
            } catch (error) {
                console.warn('Erro ao carregar dados locais:', error);
            }
            setLoading(false);
        };

        loadLocalData();
    }, []);

    // Tentar conectar com Convex
    useEffect(() => {
        const loadConvex = async () => {
            try {
                // Aguardar um pouco para o Convex inicializar
                await new Promise(resolve => setTimeout(resolve, 2000));

                const { useQuery, useMutation } = await import('convex/react');
                const { api } = await import('../../convex/_generated/api');

                // Verificar se a API está disponível
                if (api && api.managedPlayers) {
                    console.log('✅ Convex conectado com sucesso!');
                    setConvexReady(true);
                } else {
                    throw new Error('API do Convex não disponível');
                }
            } catch (error) {
                console.warn('⚠️ Convex não disponível, usando localStorage:', error);
                setConvexReady(false);
            }
        };

        loadConvex();
    }, []);

    // Salvar no localStorage sempre que players mudarem
    useEffect(() => {
        if (players.length > 0) {
            localStorage.setItem('convex_players', JSON.stringify(players));
        }
    }, [players]);

    // Mutations para localStorage
    const createPlayer = async (playerData: any) => {
        const newPlayer: Player = {
            _id: `player_${Date.now()}`,
            name: playerData.name,
            email: playerData.email,
            role: playerData.role,
            membership: playerData.membership,
            position: playerData.position,
            stars: playerData.stars,
            approved: playerData.approved,
            notifications_enabled: playerData.notifications_enabled,
            created_at: Date.now(),
            updated_at: Date.now(),
            active: true
        };

        // Verificar email duplicado
        if (players.some(p => p.email === playerData.email)) {
            throw new Error('Email já está cadastrado. Use outro email.');
        }

        setPlayers(prev => [...prev, newPlayer]);
        return newPlayer._id;
    };

    const updatePlayer = async (updateData: any) => {
        const { id, ...data } = updateData;

        // Verificar email duplicado (exceto o próprio jogador)
        if (data.email && players.some(p => p.email === data.email && p._id !== id)) {
            throw new Error('Email já está cadastrado. Use outro email.');
        }

        setPlayers(prev => prev.map(player =>
            player._id === id
                ? { ...player, ...data, updated_at: Date.now() }
                : player
        ));
    };

    const removePlayer = async ({ id }: { id: string }) => {
        setPlayers(prev => prev.filter(player => player._id !== id));
    };

    const togglePlayerApproval = async ({ id }: { id: string }) => {
        setPlayers(prev => prev.map(player =>
            player._id === id
                ? { ...player, approved: !player.approved, updated_at: Date.now() }
                : player
        ));
    };

    return {
        convexReady,
        players,
        loading,
        createPlayer,
        updatePlayer,
        removePlayer,
        togglePlayerApproval
    };
}

export default function ManagePlayersConvex() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Hook personalizado para Convex com fallback
    const { convexReady, players, loading, createPlayer, updatePlayer, removePlayer, togglePlayerApproval } = useConvexSafe();

    // Debug: Log do estado atual
    console.log('📊 Estado atual:', {
        playersCount: players.length,
        loading,
        convexReady,
        players: players.slice(0, 2) // Mostrar apenas os 2 primeiros para debug
    });

    // Debug: Log quando a lista de jogadores muda
    useEffect(() => {
        console.log('🎯 Lista de jogadores atualizada:', players.length, 'jogadores');
        if (players.length > 0) {
            console.log('👥 Primeiro jogador:', players[0]);
        }
    }, [players]);

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
            if (!createForm.email) {
                alert('Por favor, preencha o email.');
                return;
            }


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

            closeEditModal();
            alert('✅ Jogador atualizado com sucesso!');
        } catch (error: any) {
            console.error('Erro ao atualizar jogador:', error);
            alert(error.message || '❌ Erro ao atualizar jogador. Tente novamente.');
        }
    };

    // Funções para visualização
    const openViewModal = (player: Player) => {
        console.log('🔍 Abrindo modal de visualização para:', player);
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
            console.log('🔄 Alternando aprovação para:', player);
            await togglePlayerApproval({ id: player._id });
            alert(`✅ Jogador ${!player.approved ? 'aprovado' : 'desaprovado'} com sucesso!`);
        } catch (error: any) {
            console.error('Erro ao alterar aprovação:', error);
            alert(error.message || '❌ Erro ao alterar aprovação. Tente novamente.');
        }
    };

    // Funções para exclusão
    const openDeleteModal = (player: Player) => {
        console.log('🗑️ Abrindo modal de exclusão para:', player);
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* BOTÃO DE TESTE GLOBAL */}
            <div className="bg-red-500 text-white p-4 text-center">
                <button
                    onClick={() => {
                        console.log('🚨 BOTÃO DE TESTE GLOBAL CLICADO!');
                        alert('BOTÃO GLOBAL FUNCIONANDO!');
                    }}
                    className="bg-yellow-500 text-black px-4 py-2 rounded font-bold"
                >
                    🚨 TESTE GLOBAL - CLIQUE AQUI
                </button>
                <div className="mt-2 text-sm">
                    <p>Se você não vê este botão vermelho no topo, há um problema de cache!</p>
                    <p>Pressione Ctrl+F5 para recarregar completamente!</p>
                </div>
            </div>

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

                    {/* Status Convex */}
                    <div className={`p-3 rounded-lg mt-4 ${convexReady ? 'bg-green-50' : 'bg-blue-50'}`}>
                        <p className={`text-sm ${convexReady ? 'text-green-800' : 'text-blue-800'}`}>
                            {convexReady ? (
                                <>🚀 <strong>Convex Ativo:</strong> Dados salvos na nuvem com sincronização em tempo real!</>
                            ) : (
                                <>💾 <strong>Modo Local:</strong> Dados salvos no dispositivo. Funciona offline!</>
                            )}
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
                                        <div className="space-y-2">
                                            <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700 w-full">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Criar Primeiro Jogador
                                            </Button>
                                            
                                            {/* Botão de teste */}
                                            <Button 
                                                onClick={() => {
                                                    console.log('🧪 BOTÃO DE TESTE CLICADO!');
                                                    alert('Botão de teste funcionando!');
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 w-full"
                                            >
                                                🧪 Teste de Clique
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {/* Botão de teste quando há jogadores */}
                                <Button 
                                    onClick={() => {
                                        console.log('🧪 BOTÃO DE TESTE (COM JOGADORES) CLICADO!');
                                        alert('Botão de teste funcionando!');
                                    }}
                                    className="bg-purple-600 hover:bg-purple-700 w-full mb-4"
                                >
                                    🧪 Teste de Clique (Com Jogadores)
                                </Button>
                                
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

                                            {/* TESTE ULTRA SIMPLES */}
                                            <div className="pt-3 border-t border-gray-100 space-y-2">
                                                <button
                                                    onClick={() => {
                                                        console.log('🔥 BOTÃO DO CARD CLICADO!', player.name);
                                                        alert(`Botão do jogador ${player.name} clicado!`);
                                                    }}
                                                    className="w-full h-10 bg-purple-600 text-white rounded font-bold hover:bg-purple-700"
                                                >
                                                    🔥 TESTE - {player.name.toUpperCase()}
                                                </button>
                                                
                                                {/* Botões separados para teste */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => {
                                                            console.log('👁️ BOTÃO VER SIMPLES!');
                                                            alert('Botão Ver funcionando!');
                                                        }}
                                                        className="h-8 bg-blue-500 text-white rounded text-sm"
                                                    >
                                                        👁️ Ver
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            console.log('✏️ BOTÃO EDITAR SIMPLES!');
                                                            alert('Botão Editar funcionando!');
                                                        }}
                                                        className="h-8 bg-green-500 text-white rounded text-sm"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            console.log('🗑️ BOTÃO EXCLUIR SIMPLES!');
                                                            alert('Botão Excluir funcionando!');
                                                        }}
                                                        className="h-8 bg-red-500 text-white rounded text-sm"
                                                    >
                                                        🗑️ Excluir
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            console.log('✅ BOTÃO APROVAR SIMPLES!');
                                                            alert('Botão Aprovar funcionando!');
                                                        }}
                                                        className="h-8 bg-yellow-500 text-white rounded text-sm"
                                                    >
                                                        ✅ Aprovar
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Outras tabs teriam o mesmo conteúdo filtrado */}
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

            {/* Modal de Edição */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-md">
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
                            <Edit className="h-4 w-4 mr-1" />
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Visualização */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Detalhes do Jogador
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPlayer && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-lg">{selectedPlayer.name}</h3>
                                <p className="text-gray-500 text-sm">{selectedPlayer.email}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Role:</span>
                                    <Badge className={`text-xs ${getRoleColor(selectedPlayer.role)}`}>
                                        {selectedPlayer.role}
                                    </Badge>
                                </div>

                                {selectedPlayer.position && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Posição:</span>
                                        <Badge className={`text-xs ${getPositionColor(selectedPlayer.position)}`}>
                                            {selectedPlayer.position}
                                        </Badge>
                                    </div>
                                )}

                                {selectedPlayer.membership && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Mensalidade:</span>
                                        <Badge variant="outline" className="text-xs">
                                            {selectedPlayer.membership}
                                        </Badge>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Estrelas:</span>
                                    <div className="flex items-center gap-2">
                                        {renderStars(selectedPlayer.stars)}
                                        <span className="text-xs text-gray-500">
                                            {selectedPlayer.stars || 0}/5
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <Badge variant={selectedPlayer.approved ? "default" : "secondary"} className="text-xs">
                                        {selectedPlayer.approved ? 'Aprovado' : 'Pendente'}
                                    </Badge>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Notificações:</span>
                                    <Badge variant={selectedPlayer.notifications_enabled ? "default" : "secondary"} className="text-xs">
                                        {selectedPlayer.notifications_enabled ? 'Ativadas' : 'Desativadas'}
                                    </Badge>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Criado em:</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(selectedPlayer.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={closeViewModal} className="w-full">
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Exclusão */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Excluir Jogador
                        </DialogTitle>
                        <DialogDescription>
                            Esta ação não pode ser desfeita. O jogador será removido permanentemente.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPlayer && (
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <User className="h-8 w-8 text-red-600" />
                                <div>
                                    <p className="font-medium text-red-900">
                                        {selectedPlayer.name}
                                    </p>
                                    <p className="text-sm text-red-700">{selectedPlayer.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeDeleteModal} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleDeletePlayer} variant="destructive" className="flex-1">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
