import { useAuth } from '@/auth/OfflineAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    BarChart3,
    Crown,
    DollarSign,
    Settings,
    Shield,
    Trophy,
    UserCheck,
    Users,
    Plus,
    LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function OwnerDashboardSimple() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('player');

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

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const handleCreateInvite = async () => {
        try {
            // Lógica para criar convite
            console.log('Criando convite para:', inviteEmail, 'com role:', inviteRole);
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteRole('player');
        } catch (error) {
            console.error('Erro ao criar convite:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Bem-vindo, {user?.user_metadata?.full_name || 'Owner'}!
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Dashboard do proprietário - Maestros FC
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Crown className="h-6 w-6 text-yellow-500" />
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    Owner
                                </Badge>
                            </div>
                            <Button
                                onClick={() => setShowInviteModal(true)}
                                variant="default"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Convidar
                            </Button>
                            <Button
                                onClick={handleSignOut}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Sair
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white shadow-sm border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Jogadores</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{players.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Total de jogadores
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Partidas</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Partidas realizadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Finanças</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R$ 0,00</div>
                            <p className="text-xs text-muted-foreground">
                                Saldo atual
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ranking</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Pontos totais
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Gerenciar Jogadores */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gerenciar Jogadores</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">
                                Adicionar, editar e gerenciar jogadores do time
                            </p>
                            <Button
                                onClick={() => handleNavigation('/manage-players')}
                                className="w-full"
                            >
                                Acessar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Sistema de Jogo */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sistema de Jogo</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">
                                Nexus Play - Em desenvolvimento
                            </p>
                            <Button
                                disabled
                                className="w-full"
                            >
                                Em breve
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Finanças */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Finanças</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">
                                Gerenciar receitas e despesas do time
                            </p>
                            <Button
                                onClick={() => handleNavigation('/finance')}
                                className="w-full"
                            >
                                Acessar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Convites */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Convites</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">
                                Gerenciar convites e aprovações
                            </p>
                            <Button
                                onClick={() => handleNavigation('/invites')}
                                className="w-full"
                            >
                                Acessar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Configurações */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Configurações</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">
                                Configurar sistema e permissões
                            </p>
                            <Button
                                onClick={() => handleNavigation('/settings')}
                                className="w-full"
                            >
                                Acessar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Administradores */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">
                                Gerenciar administradores do sistema
                            </p>
                            <Button
                                onClick={() => handleNavigation('/manage-admins')}
                                className="w-full"
                            >
                                Acessar
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Invite Modal */}
                <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Convidar Novo Membro</DialogTitle>
                            <DialogDescription>
                                Envie um convite para um novo membro do time.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">Função</Label>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="role"
                                        checked={inviteRole === 'admin'}
                                        onCheckedChange={(checked) => setInviteRole(checked ? 'admin' : 'player')}
                                    />
                                    <Label htmlFor="role">
                                        {inviteRole === 'admin' ? 'Administrador' : 'Jogador'}
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreateInvite}>
                                Enviar Convite
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Status */}
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-800">
                            Sistema funcionando corretamente - Versão Melhorada
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}