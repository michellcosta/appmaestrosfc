import { useAuth } from '@/auth/OfflineAuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToastHelpers } from '@/components/ui/toast';
import {
    Crown,
    Database,
    Globe,
    Mail,
    RefreshCw,
    Search,
    Shield,
    Star,
    User,
    Users,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    membership?: string;
    position?: string;
    stars?: number;
    created_at?: string;
    loginDate?: string;
    lastSeen?: string;
    source: 'local' | 'supabase';
}

export default function ListUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const { success, error } = useToastHelpers();

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <Crown className="w-4 h-4 text-yellow-600" />;
            case 'admin': return <Shield className="w-4 h-4 text-blue-600" />;
            case 'aux': return <Zap className="w-4 h-4 text-purple-600" />;
            case 'mensalista': return <Star className="w-4 h-4 text-green-600" />;
            case 'diarista': return <Zap className="w-4 h-4 text-orange-600" />;
            default: return <User className="w-4 h-4 text-gray-600" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'owner': return 'bg-yellow-100 text-yellow-800';
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'aux': return 'bg-purple-100 text-purple-800';
            case 'mensalista': return 'bg-green-100 text-green-800';
            case 'diarista': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const allUsers: User[] = [];

            // 1. Buscar usuário offline atual (localStorage)
            const offlineUser = localStorage.getItem('offline_user');
            if (offlineUser) {
                try {
                    const localUser = JSON.parse(offlineUser);
                    allUsers.push({
                        id: localUser.id,
                        email: localUser.email || 'Sem email',
                        name: localUser.name || 'Sem nome',
                        role: localUser.role || 'N/A',
                        source: 'local'
                    });
                } catch (e) {
                    console.error('Erro ao parsear usuário offline:', e);
                }
            }

            // 2. Buscar histórico de todos os usuários (localStorage)
            const allUsersHistory = localStorage.getItem('all_users');
            if (allUsersHistory) {
                try {
                    const usersHistory = JSON.parse(allUsersHistory);
                    usersHistory.forEach((historyUser: any) => {
                        // Evitar duplicatas (usuário atual já foi adicionado)
                        const alreadyExists = allUsers.some(u => u.id === historyUser.id);
                        if (!alreadyExists) {
                            allUsers.push({
                                id: historyUser.id,
                                email: historyUser.email || 'Sem email',
                                name: historyUser.name || 'Sem nome',
                                role: historyUser.role || 'N/A',
                                source: 'local',
                                loginDate: historyUser.loginDate,
                                lastSeen: historyUser.lastSeen
                            });
                        }
                    });
                } catch (e) {
                    console.error('Erro ao parsear histórico de usuários:', e);
                }
            }

            // 3. Buscar usuários do Supabase - tabela profiles
            try {
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('updated_at', { ascending: false });

                if (!profilesError && profiles) {
                    profiles.forEach(profile => {
                        allUsers.push({
                            id: profile.id,
                            email: profile.email || 'Sem email',
                            name: profile.email?.split('@')[0] || 'Sem nome',
                            role: profile.role || 'N/A',
                            membership: profile.membership,
                            position: profile.position,
                            stars: profile.stars,
                            created_at: profile.updated_at,
                            source: 'supabase'
                        });
                    });
                }
            } catch (e) {
                console.error('Erro ao buscar profiles:', e);
            }

            // 4. Buscar usuários do Supabase - tabela users
            try {
                const { data: users, error: usersError } = await supabase
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!usersError && users) {
                    users.forEach(user => {
                        allUsers.push({
                            id: user.id,
                            email: user.email || 'Sem email',
                            name: user.name || 'Sem nome',
                            role: user.role || 'N/A',
                            created_at: user.created_at,
                            source: 'supabase'
                        });
                    });
                }
            } catch (e) {
                console.error('Erro ao buscar users:', e);
            }

            setUsers(allUsers);
            success('Usuários carregados', `${allUsers.length} usuários encontrados`);

        } catch (err) {
            error('Erro ao carregar usuários', 'Tente novamente');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const userStats = {
        total: users.length,
        owners: users.filter(u => u.role === 'owner').length,
        admins: users.filter(u => u.role === 'admin').length,
        mensalistas: users.filter(u => u.role === 'mensalista').length,
        diaristas: users.filter(u => u.role === 'diarista').length,
        local: users.filter(u => u.source === 'local').length,
        supabase: users.filter(u => u.source === 'supabase').length
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Usuários do Sistema</h1>
                        <p className="text-gray-600 mt-1">Lista completa de usuários cadastrados</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={loadUsers} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (confirm('Tem certeza que deseja limpar o histórico de usuários?')) {
                                    localStorage.removeItem('all_users');
                                    loadUsers();
                                }
                            }}
                        >
                            Limpar Histórico
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold">{userStats.total}</div>
                            <div className="text-sm text-gray-600">Total</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                            <div className="text-2xl font-bold">{userStats.owners}</div>
                            <div className="text-sm text-gray-600">Owners</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-bold">{userStats.admins}</div>
                            <div className="text-sm text-gray-600">Admins</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Star className="w-6 h-6 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-bold">{userStats.mensalistas}</div>
                            <div className="text-sm text-gray-600">Mensalistas</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Zap className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                            <div className="text-2xl font-bold">{userStats.diaristas}</div>
                            <div className="text-sm text-gray-600">Diaristas</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Database className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                            <div className="text-2xl font-bold">{userStats.local}</div>
                            <div className="text-sm text-gray-600">Local</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Globe className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                            <div className="text-2xl font-bold">{userStats.supabase}</div>
                            <div className="text-sm text-gray-600">Supabase</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Buscar por email, nome ou role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Usuários Encontrados ({filteredUsers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>Nenhum usuário encontrado</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredUsers.map((user, index) => (
                                    <div
                                        key={`${user.source}-${user.id}`}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                {getRoleIcon(user.role)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                                {user.position && (
                                                    <div className="text-sm text-gray-500">
                                                        Posição: {user.position}
                                                    </div>
                                                )}
                                                {user.lastSeen && (
                                                    <div className="text-xs text-gray-400">
                                                        Último acesso: {new Date(user.lastSeen).toLocaleString('pt-BR')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={getRoleBadgeColor(user.role)}>
                                                {user.role}
                                            </Badge>
                                            <Badge variant="outline">
                                                {user.source === 'local' ? 'Local' : 'Supabase'}
                                            </Badge>
                                            {user.stars && (
                                                <div className="flex items-center gap-1 text-yellow-600">
                                                    <Star className="w-3 h-3" />
                                                    {user.stars}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
