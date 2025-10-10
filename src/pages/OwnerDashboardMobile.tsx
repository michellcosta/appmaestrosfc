import { useAuth } from '@/auth/OfflineAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayersConvex } from '@/hooks/usePlayersConvex';
import { useGamesStore } from '@/store/gamesStore';
import {
    BarChart3,
    Calendar,
    Clock,
    Crown,
    Edit,
    Eye,
    LogOut,
    MapPin,
    Plus,
    Settings,
    Shield,
    Trash2,
    Trophy,
    UserCheck,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OwnerDashboardMobile() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { matches, addMatch, updateMatch, deleteMatch, getUpcomingMatches } = useGamesStore();

    // USAR CONVEX EM VEZ DO SUPABASE
    const { players, stats, isLoading: playersLoading } = usePlayersConvex();


    // REMOVER: const [players, setPlayers] = useState<any[]>([]);
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

    // REMOVER useEffect e loadPlayers que usavam Supabase
    // useEffect(() => {
    //     loadPlayers();
    // }, []);

    // const loadPlayers = async () => {
    //     try {
    //         setLoading(true);
    //         const { data, error } = await supabase
    //             .from('profiles')
    //             .select('*')
    //             .eq('role', 'player');
    //         if (error) throw error;
    //         setPlayers(data || []);
    //     } catch (error) {
    //         console.error('Erro ao carregar jogadores:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

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

    const handleCreateMatch = async () => {
        try {
            const matchData = {
                date: createForm.date,
                time: createForm.time,
                location: createForm.location,
                maxPlayers: createForm.maxPlayers,
                status: 'pending'
            };

            await addMatch(matchData);
            setShowCreateModal(false);
            setCreateForm({
                date: '',
                time: '20:00',
                location: 'R. Renato Bazin, 705-751 - Laranjal, São Gonçalo - RJ',
                maxPlayers: 22
            });
        } catch (error) {
            console.error('Erro ao criar partida:', error);
        }
    };

    // Funções para edição de partidas
    const openEditModal = (match: any) => {
        setSelectedMatch(match);
        setEditForm({
            date: match.date,
            time: match.time,
            location: match.location,
            maxPlayers: match.maxPlayers
        });
        setShowEditModal(true);
    };

    const handleEditMatch = async () => {
        try {
            if (!selectedMatch) return;

            const updatedMatch = {
                ...selectedMatch,
                date: editForm.date,
                time: editForm.time,
                location: editForm.location,
                maxPlayers: editForm.maxPlayers
            };

            await updateMatch(selectedMatch.id, updatedMatch);
            setShowEditModal(false);
            setSelectedMatch(null);
        } catch (error) {
            console.error('Erro ao editar partida:', error);
        }
    };

    // Funções para exclusão de partidas
    const openDeleteModal = (match: any) => {
        setSelectedMatch(match);
        setShowDeleteModal(true);
    };

    const handleDeleteMatch = async () => {
        try {
            if (!selectedMatch) return;

            await deleteMatch(selectedMatch.id);
            setShowDeleteModal(false);
            setSelectedMatch(null);
        } catch (error) {
            console.error('Erro ao deletar partida:', error);
        }
    };

    // Função para visualizar partida
    const openViewModal = (match: any) => {
        setSelectedMatch(match);
        setShowViewModal(true);
    };

    // Obter partidas próximas
    const upcomingMatches = getUpcomingMatches();

    return (
        <div className="min-h-[100dvh] bg-background text-foreground pb-20">
            {/* Header */}
            <div className="bg-card shadow-sm border-b">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <Crown className="h-6 w-6 text-yellow-500" />
                                <div>
                                    <h1 className="text-lg font-bold">Maestros FC</h1>
                                    <p className="text-sm text-muted-foreground">Owner</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/owner-dashboard')}
                                className="flex items-center space-x-1"
                            >
                                <Crown className="h-4 w-4" />
                                <span>Owner</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                                className="flex items-center space-x-1"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Geral</span>
                        </TabsTrigger>
                        <TabsTrigger value="matches" className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Partidas</span>
                        </TabsTrigger>
                        <TabsTrigger value="players" className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Jogadores</span>
                        </TabsTrigger>
                        <TabsTrigger value="config" className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Config</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Visão Geral */}
                    <TabsContent value="overview" className="space-y-4">
                        {/* Métricas Rápidas */}
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="shadow-sm">
                                <CardContent className="p-4 text-center">
                                    <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{stats.total}</div>
                                    <p className="text-xs text-muted-foreground">Jogadores</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardContent className="p-4 text-center">
                                    <Trophy className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{upcomingMatches.length}</div>
                                    <p className="text-xs text-muted-foreground">Partidas</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Ações Rápidas */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={() => navigate('/manage-players')}
                                className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 text-blue-700"
                            >
                                <Users className="h-6 w-6" />
                                <span className="text-sm font-medium">Gerenciar Jogadores</span>
                            </Button>

                            <Button
                                onClick={openCreateModal}
                                className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 text-green-700"
                            >
                                <Plus className="h-6 w-6" />
                                <span className="text-sm font-medium">Nova Partida</span>
                            </Button>
                        </div>

                        {/* Partidas Próximas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5" />
                                    <span>Próximas Partidas</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcomingMatches.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                        <h3 className="font-medium mb-2">Nenhuma partida agendada</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Crie uma nova partida para começar
                                        </p>
                                        <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Nova Partida
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingMatches.slice(0, 3).map((match) => (
                                            <div key={match.id} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{match.date}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">{match.time}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openViewModal(match)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(match)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(match)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Partidas */}
                    <TabsContent value="matches" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Gerenciar Partidas</h2>
                            <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Partida
                            </Button>
                        </div>

                        {matches.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                    <h3 className="font-medium mb-2">Nenhuma partida cadastrada</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Crie sua primeira partida para começar
                                    </p>
                                    <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nova Partida
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {matches.map((match) => (
                                    <Card key={match.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{match.date}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">{match.time}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground truncate max-w-32">{match.location}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openViewModal(match)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditModal(match)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(match)}
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
                        )}
                    </TabsContent>

                    {/* Tab: Jogadores */}
                    <TabsContent value="players" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center space-x-2">
                                    <Users className="h-6 w-6 text-blue-600" />
                                    Gerenciar Jogadores
                                </h2>
                                <p className="text-sm text-muted-foreground">{stats.total} jogadores cadastrados</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate('/manage-players')}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Gerenciar Jogadores
                        </Button>

                        {players.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-8">
                                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                    <h3 className="font-medium mb-2">
                                        {stats.total} Jogadores Cadastrados
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Gerencie jogadores, convites e aprovações
                                    </p>
                                    <Button onClick={() => navigate('/manage-players')} className="bg-blue-600 hover:bg-blue-700">
                                        <Users className="h-4 w-4 mr-2" />
                                        Gerenciar Jogadores
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {players.slice(0, 5).map((player) => (
                                    <Card key={player._id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <UserCheck className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{player.name}</p>
                                                        <p className="text-sm text-muted-foreground">{player.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {player.role}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate('/manage-players')}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {players.length > 5 && (
                                    <Button
                                        onClick={() => navigate('/manage-players')}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Ver todos os {stats.total} jogadores
                                    </Button>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Tab: Configurações */}
                    <TabsContent value="config" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Configurações do Sistema</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => navigate('/manage-admins')}
                                        className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-50 hover:bg-purple-100 text-purple-700"
                                    >
                                        <Shield className="h-6 w-6" />
                                        <span className="text-sm font-medium">Gerenciar Admins</span>
                                    </Button>

                                    <Button
                                        onClick={() => navigate('/configure-access')}
                                        className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 text-orange-700"
                                    >
                                        <Settings className="h-6 w-6" />
                                        <span className="text-sm font-medium">Configurar Acesso</span>
                                    </Button>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="font-medium mb-3">Ações do Sistema</h3>
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sair do Sistema
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modais */}
            {/* Modal de Criação */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Partida</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="date">Data</Label>
                            <Input
                                id="date"
                                type="date"
                                value={createForm.date}
                                onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="time">Horário</Label>
                            <Input
                                id="time"
                                type="time"
                                value={createForm.time}
                                onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="location">Local</Label>
                            <Input
                                id="location"
                                value={createForm.location}
                                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="maxPlayers">Máximo de Jogadores</Label>
                            <Input
                                id="maxPlayers"
                                type="number"
                                value={createForm.maxPlayers}
                                onChange={(e) => setCreateForm({ ...createForm, maxPlayers: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateMatch} className="bg-green-600 hover:bg-green-700">
                            Criar Partida
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Edição */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Partida</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-date">Data</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-time">Horário</Label>
                            <Input
                                id="edit-time"
                                type="time"
                                value={editForm.time}
                                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-location">Local</Label>
                            <Input
                                id="edit-location"
                                value={editForm.location}
                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-maxPlayers">Máximo de Jogadores</Label>
                            <Input
                                id="edit-maxPlayers"
                                type="number"
                                value={editForm.maxPlayers}
                                onChange={(e) => setEditForm({ ...editForm, maxPlayers: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleEditMatch} className="bg-blue-600 hover:bg-blue-700">
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Exclusão */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleDeleteMatch} className="bg-red-600 hover:bg-red-700">
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Visualização */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes da Partida</DialogTitle>
                    </DialogHeader>
                    {selectedMatch && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Data</Label>
                                    <p className="text-sm text-muted-foreground">{selectedMatch.date}</p>
                                </div>
                                <div>
                                    <Label>Horário</Label>
                                    <p className="text-sm text-muted-foreground">{selectedMatch.time}</p>
                                </div>
                            </div>
                            <div>
                                <Label>Local</Label>
                                <p className="text-sm text-muted-foreground">{selectedMatch.location}</p>
                            </div>
                            <div>
                                <Label>Máximo de Jogadores</Label>
                                <p className="text-sm text-muted-foreground">{selectedMatch.maxPlayers}</p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewModal(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}