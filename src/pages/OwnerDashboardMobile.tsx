import { useAuth } from '@/auth/OfflineAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useGamesStore } from '@/store/gamesStore';
import {
    BarChart3,
    Calendar,
    Crown,
    DollarSign,
    Edit,
    Eye,
    LogOut,
    MapPin,
    Plus,
    Settings,
    Shield,
    Shuffle,
    Trash2,
    Trophy,
    UserCheck,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OwnerDashboardMobile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { matches, addMatch, updateMatch, deleteMatch, getUpcomingMatches } = useGamesStore();

    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Estados para modais de partidas
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);

    // Estados para formulários
    const [createForm, setCreateForm] = useState({
        date: '',
        time: '20:00',
        location: 'R. Renato Bazin, 705-751 - Laranjal, São Gonçalo - RJ',
        maxPlayers: 22
    });

    const [editForm, setEditForm] = useState({
        date: '',
        time: '',
        location: '',
        maxPlayers: 22
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
                .eq('role', 'player');

            if (error) throw error;
            setPlayers(data || []);
        } catch (error) {
            console.error('Erro ao carregar jogadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // Funções para criação de partidas
    const openCreateModal = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const defaultDate = `${year}-${month}-${day}`;

        setCreateForm({
            date: defaultDate,
            time: '20:00',
            location: 'R. Renato Bazin, 705-751 - Laranjal, São Gonçalo - RJ',
            maxPlayers: 22
        });
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setCreateForm({
            date: '',
            time: '20:00',
            location: 'R. Renato Bazin, 705-751 - Laranjal, São Gonçalo - RJ',
            maxPlayers: 22
        });
    };

    const handleCreateMatch = () => {
        try {
            if (!createForm.date || !createForm.time || !createForm.location) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Converter data de YYYY-MM-DD para DD/MM/YYYY
            const [year, month, day] = createForm.date.split('-');
            const formattedDate = `${day}/${month}/${year}`;

            addMatch({
                date: formattedDate,
                time: createForm.time,
                location: createForm.location,
                maxPlayers: createForm.maxPlayers
            });

            closeCreateModal();
            alert('✅ Partida criada com sucesso!');
        } catch (error) {
            console.error('Erro ao criar partida:', error);
            alert('❌ Erro ao criar partida. Tente novamente.');
        }
    };

    // Funções para edição de partidas
    const openEditModal = (match: any) => {
        setSelectedMatch(match);

        // Converter DD/MM/YYYY para YYYY-MM-DD para o input
        let inputDate = '';
        if (match.date.includes('/')) {
            const [day, month, year] = match.date.split('/');
            inputDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else if (match.date.includes('-')) {
            inputDate = match.date;
        }

        setEditForm({
            date: inputDate,
            time: match.time,
            location: match.location,
            maxPlayers: match.maxPlayers
        });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedMatch(null);
        setEditForm({
            date: '',
            time: '',
            location: '',
            maxPlayers: 22
        });
    };

    const handleEditMatch = () => {
        try {
            if (!editForm.date || !editForm.time || !editForm.location) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            // Converter data de YYYY-MM-DD para DD/MM/YYYY
            const [year, month, day] = editForm.date.split('-');
            const formattedDate = `${day}/${month}/${year}`;

            updateMatch(selectedMatch.id, {
                date: formattedDate,
                time: editForm.time,
                location: editForm.location,
                maxPlayers: editForm.maxPlayers
            });

            closeEditModal();
            alert('✅ Partida atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar partida:', error);
            alert('❌ Erro ao atualizar partida. Tente novamente.');
        }
    };

    // Funções para exclusão de partidas
    const openDeleteModal = (match: any) => {
        setSelectedMatch(match);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedMatch(null);
    };

    const handleDeleteMatch = () => {
        try {
            deleteMatch(selectedMatch.id);
            closeDeleteModal();
            alert('✅ Partida excluída com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir partida:', error);
            alert('❌ Erro ao excluir partida. Tente novamente.');
        }
    };

    // Função para visualização de partidas
    const openViewModal = (match: any) => {
        setSelectedMatch(match);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedMatch(null);
    };

    // Função para formatar data
    const formatDate = (dateString: string) => {
        let date: Date;

        if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`);
        } else if (dateString.includes('-')) {
            date = new Date(`${dateString}T00:00:00`);
        } else {
            return dateString;
        }

        const months = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];

        const dayNum = date.getDate();
        const monthName = months[date.getMonth()];

        return `${dayNum} ${monthName}`;
    };

    const upcomingMatches = getUpcomingMatches();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header Mobile */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            🏆 Maestros FC
                        </h1>
                        <p className="text-sm text-gray-600">
                            {user?.user_metadata?.full_name || 'Owner'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Crown className="h-3 w-3 mr-1" />
                            Owner
                        </Badge>
                        <Button
                            onClick={handleSignOut}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation Mobile */}
            <div className="px-4 pt-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="overview" className="text-xs">
                            📊 Geral
                        </TabsTrigger>
                        <TabsTrigger value="matches" className="text-xs">
                            ⚽ Partidas
                        </TabsTrigger>
                        <TabsTrigger value="players" className="text-xs">
                            👥 Jogadores
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="text-xs">
                            ⚙️ Config
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Visão Geral */}
                    <TabsContent value="overview" className="space-y-4">
                        {/* Métricas Rápidas */}
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="bg-white shadow-sm">
                                <CardContent className="p-4 text-center">
                                    <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">{players.length}</div>
                                    <p className="text-xs text-gray-600">Jogadores</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white shadow-sm">
                                <CardContent className="p-4 text-center">
                                    <Trophy className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">{upcomingMatches.length}</div>
                                    <p className="text-xs text-gray-600">Partidas</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white shadow-sm">
                                <CardContent className="p-4 text-center">
                                    <DollarSign className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">R$</div>
                                    <p className="text-xs text-gray-600">Financeiro</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white shadow-sm">
                                <CardContent className="p-4 text-center">
                                    <BarChart3 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">15</div>
                                    <p className="text-xs text-gray-600">Prêmios</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Ações Rápidas */}
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">⚡ Ações Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    onClick={openCreateModal}
                                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Nova Partida
                                </Button>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => navigate('/manage-players')}
                                        variant="outline"
                                        className="h-10"
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Jogadores
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/finance')}
                                        variant="outline"
                                        className="h-10"
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Financeiro
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Partidas Recentes */}
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">📋 Partidas Recentes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcomingMatches.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>Nenhuma partida agendada</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingMatches.slice(0, 3).map((match) => (
                                            <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium text-sm">{formatDate(match.date)}</span>
                                                        <span className="text-xs text-gray-500">{match.time}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 truncate">{match.location}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            {match.confirmedPlayers}/{match.maxPlayers} jogadores
                                                        </span>
                                                        <Badge
                                                            variant={match.status === 'open' ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {match.status === 'open' ? 'Ativa' : match.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => openViewModal(match)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Partidas */}
                    <TabsContent value="matches" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">⚽ Gerenciar Partidas</h2>
                            <Button
                                onClick={openCreateModal}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Nova
                            </Button>
                        </div>

                        {upcomingMatches.length === 0 ? (
                            <Card className="bg-white shadow-sm">
                                <CardContent className="text-center py-12">
                                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma partida</h3>
                                    <p className="text-gray-500 mb-4">Crie sua primeira partida para começar</p>
                                    <Button
                                        onClick={openCreateModal}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Criar Partida
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {upcomingMatches.map((match) => (
                                    <Card key={match.id} className="bg-white shadow-sm">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">{formatDate(match.date)}</span>
                                                        <span className="text-sm text-gray-500">{match.time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="h-4 w-4 text-gray-500" />
                                                        <span className="text-sm text-gray-600 truncate">{match.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm text-gray-500">
                                                            {match.confirmedPlayers}/{match.maxPlayers} jogadores
                                                        </span>
                                                        <Badge
                                                            variant={match.status === 'open' ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {match.status === 'open' ? 'Ativa' : match.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ações */}
                                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                                                <Button
                                                    onClick={() => openViewModal(match)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Ver
                                                </Button>
                                                <Button
                                                    onClick={() => openEditModal(match)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8"
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    onClick={() => openDeleteModal(match)}
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

                    {/* Tab: Jogadores */}
                    <TabsContent value="players" className="space-y-4">
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">👥 Gerenciar Jogadores</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="text-center py-4">
                                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                        <h3 className="font-medium text-gray-900 mb-2">
                                            {players.length} Jogadores Cadastrados
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Gerencie jogadores, convites e aprovações
                                        </p>
                                        <Button
                                            onClick={() => navigate('/manage-players')}
                                            className="w-full"
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Gerenciar Jogadores
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                // Pegar a primeira partida próxima para sorteio
                                                const nextMatch = upcomingMatches[0];
                                                if (nextMatch) {
                                                    navigate(`/team-draw/${nextMatch.id}`);
                                                } else {
                                                    alert('Nenhuma partida encontrada para sortear times');
                                                }
                                            }}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Shuffle className="h-4 w-4 mr-2" />
                                            Sortear Times
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">🎫 Convites e Aprovações</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => navigate('/invites')}
                                        variant="outline"
                                        className="w-full h-12"
                                    >
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Gerenciar Convites
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/approve-participants')}
                                        variant="outline"
                                        className="w-full h-12"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Aprovar Participantes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Configurações */}
                    <TabsContent value="settings" className="space-y-4">
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">⚙️ Configurações do Sistema</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    onClick={() => navigate('/finance')}
                                    variant="outline"
                                    className="w-full h-12 justify-start"
                                >
                                    <DollarSign className="h-4 w-4 mr-3" />
                                    <div className="text-left">
                                        <div className="font-medium">Financeiro</div>
                                        <div className="text-xs text-gray-500">Pagamentos e mensalidades</div>
                                    </div>
                                </Button>

                                <Button
                                    onClick={() => navigate('/configure-access')}
                                    variant="outline"
                                    className="w-full h-12 justify-start"
                                >
                                    <Shield className="h-4 w-4 mr-3" />
                                    <div className="text-left">
                                        <div className="font-medium">Permissões</div>
                                        <div className="text-xs text-gray-500">Configurar acesso por role</div>
                                    </div>
                                </Button>

                                <Button
                                    onClick={() => navigate('/manage-admins')}
                                    variant="outline"
                                    className="w-full h-12 justify-start"
                                >
                                    <Settings className="h-4 w-4 mr-3" />
                                    <div className="text-left">
                                        <div className="font-medium">Administradores</div>
                                        <div className="text-xs text-gray-500">Gerenciar administradores</div>
                                    </div>
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de Criação */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-md mx-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Nova Partida
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados da nova partida.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="create-date">Data *</Label>
                            <Input
                                id="create-date"
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={createForm.date}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, date: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="create-time">Horário *</Label>
                            <Input
                                id="create-time"
                                type="time"
                                value={createForm.time}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, time: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="create-location">Local *</Label>
                            <Input
                                id="create-location"
                                type="text"
                                placeholder="Endereço da partida"
                                value={createForm.location}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="create-maxPlayers">Máximo de Jogadores</Label>
                            <Input
                                id="create-maxPlayers"
                                type="number"
                                min="10"
                                max="30"
                                value={createForm.maxPlayers}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 22 }))}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeCreateModal} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateMatch} className="flex-1 bg-green-600 hover:bg-green-700">
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
                            Editar Partida
                        </DialogTitle>
                        <DialogDescription>
                            Edite os dados da partida.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-date">Data *</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-time">Horário *</Label>
                            <Input
                                id="edit-time"
                                type="time"
                                value={editForm.time}
                                onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-location">Local *</Label>
                            <Input
                                id="edit-location"
                                type="text"
                                placeholder="Endereço da partida"
                                value={editForm.location}
                                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-maxPlayers">Máximo de Jogadores</Label>
                            <Input
                                id="edit-maxPlayers"
                                type="number"
                                min="10"
                                max="30"
                                value={editForm.maxPlayers}
                                onChange={(e) => setEditForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 22 }))}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeEditModal} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleEditMatch} className="flex-1 bg-blue-600 hover:bg-blue-700">
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
                            Excluir Partida
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMatch && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{formatDate(selectedMatch.date)}</span>
                                <span className="text-sm text-gray-500">{selectedMatch.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{selectedMatch.location}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeDeleteModal} className="flex-1">
                            Cancelar
                        </Button>
                        <Button onClick={handleDeleteMatch} className="flex-1 bg-red-600 hover:bg-red-700">
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
                            Detalhes da Partida
                        </DialogTitle>
                    </DialogHeader>

                    {selectedMatch && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <div className="font-medium">{formatDate(selectedMatch.date)}</div>
                                        <div className="text-sm text-gray-500">{selectedMatch.time}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <div className="font-medium">Local</div>
                                        <div className="text-sm text-gray-500">{selectedMatch.location}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <div className="font-medium">Participantes</div>
                                        <div className="text-sm text-gray-500">
                                            {selectedMatch.confirmedPlayers}/{selectedMatch.maxPlayers} jogadores
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={selectedMatch.status === 'open' ? 'default' : 'secondary'}
                                        className="text-xs"
                                    >
                                        {selectedMatch.status === 'open' ? 'Ativa' : selectedMatch.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        closeViewModal();
                                        openEditModal(selectedMatch);
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                                <Button
                                    onClick={() => navigate('/match')}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    Ir para Partida
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
