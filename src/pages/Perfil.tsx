import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { useGamesStore } from '@/store/gamesStore';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LogOut, 
  User, 
  Mail, 
  Shield, 
  Trophy, 
  Target, 
  Calendar, 
  Star, 
  BarChart3, 
  Award, 
  Settings,
  Crown,
  Users,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  UserCheck,
  CreditCard,
  FileText,
  CheckCircle,
  Bell,
  RefreshCw,
  Palette,
  Zap,
  Camera,
  Upload
} from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import ImageCropper from '@/components/ImageCropper';
import { isMainOwner, PROTECTION_MESSAGES } from '@/utils/ownerProtection';

export default function PerfilPage() {
  const { user, loading, signOut, signInWithGoogle, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const { matches, updateMatch, deleteMatch, addMatch } = useGamesStore();
  const permissions = usePermissions();
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 10MB.');
      return;
    }

    // Converter para base64 e abrir o recorte
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setShowCropper(true);
      setShowAvatarDialog(false);
    };
    reader.readAsDataURL(file);

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedImage: string) => {
    setUploadingAvatar(true);
    setShowCropper(false);

    try {
      await updateAvatar(croppedImage);
      setShowAvatarDialog(false);
      setUploadingAvatar(false);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      alert('Erro ao fazer upload da foto. Tente novamente.');
      setUploadingAvatar(false);
      setShowAvatarDialog(true);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImage('');
    setShowAvatarDialog(true);
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateAvatar('');
      setShowAvatarDialog(false);
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      alert('Erro ao remover foto. Tente novamente.');
    }
  };

  const getAvatarUrl = () => {
    if (user?.custom_avatar) {
      return user.custom_avatar;
    }
    if (user?.avatar_url) {
      return user.avatar_url;
    }
    return null;
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner': return <Crown className='w-4 h-4 text-role-owner' />;
      case 'admin': return <Shield className='w-4 h-4 text-role-admin' />;
      case 'aux': return <Zap className='w-4 h-4 text-role-aux' />;
      case 'mensalista': return <Star className='w-4 h-4 text-role-mensalista' />;
      case 'diarista': return <Zap className='w-4 h-4 text-role-diarista' />;
      default: return <User className='w-4 h-4 text-role-default' />;
    }
  };

  // Dados mockados para o dashboard do owner
  const [dashboardData] = useState({
    financialStatus: {
      totalThisMonth: 2400,
      paid: 1800,
      pending: 600,
      playersCount: 24
    },
    players: [
      { id: 1, name: 'João Silva', role: 'admin', status: 'active', lastPayment: '2024-01-15' },
      { id: 2, name: 'Maria Santos', role: 'mensalista', status: 'active', lastPayment: '2024-01-10' },
      { id: 3, name: 'Pedro Costa', role: 'diarista', status: 'pending', lastPayment: null },
      { id: 4, name: 'Ana Oliveira', role: 'aux', status: 'active', lastPayment: '2024-01-12' }
    ],
    recentPayments: [
      { id: 1, player: 'João Silva', amount: 100, status: 'paid', date: '2024-01-15' },
      { id: 2, player: 'Maria Santos', amount: 100, status: 'paid', date: '2024-01-10' },
      { id: 3, player: 'Pedro Costa', amount: 50, status: 'pending', date: '2024-01-18' }
    ]
  });

  // Estados para modais
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    location: '',
    date: '',
    time: '',
    maxPlayers: 22
  });
  const [createForm, setCreateForm] = useState({
    location: '',
    date: '',
    time: '',
    maxPlayers: 22
  });

  // Handlers para os botões
  const handleViewMatch = (match) => {
    setSelectedMatch(match);
    setViewModalOpen(true);
  };

  const handleEditMatch = (match) => {
    setSelectedMatch(match);
    // Pré-preencher com dados da partida editada
    setEditForm({
      location: match.location,
      date: match.date,
      time: match.time,
      maxPlayers: match.maxPlayers
    });
    setEditModalOpen(true);
  };

  const handleDeleteMatch = (match) => {
    setSelectedMatch(match);
    setDeleteModalOpen(true);
  };

  const handleCreateMatch = () => {
    // Nova Partida - usar data atual
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const currentTime = today.toTimeString().slice(0, 5); // Formato HH:MM
    
    setCreateForm({
      location: '',
      date: currentDate,
      time: currentTime,
      maxPlayers: 22
    });
    setCreateModalOpen(true);
  };

  const handleRepeatMatch = () => {
    // Repetir Partida - pegar última partida + 7 dias
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const lastMatchDate = new Date(lastMatch.date);
      lastMatchDate.setDate(lastMatchDate.getDate() + 7);
      
      const newDate = lastMatchDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      setCreateForm({
        location: lastMatch.location,
        date: newDate,
        time: lastMatch.time,
        maxPlayers: lastMatch.maxPlayers
      });
      setCreateModalOpen(true);
    } else {
      alert('Não há partidas anteriores para repetir.');
    }
  };

  const handleSaveCreate = () => {
    if (!createForm.date || !createForm.time || !createForm.location) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Adicionar nova partida ao store global
    addMatch({
      date: createForm.date,
      time: createForm.time,
      location: createForm.location,
      maxPlayers: createForm.maxPlayers
    });

    alert('Partida criada com sucesso!');
    setCreateModalOpen(false);
    setCreateForm({
      location: '',
      date: '',
      time: '',
      maxPlayers: 22
    });
  };

  const confirmDeleteMatch = () => {
    if (selectedMatch) {
      deleteMatch(selectedMatch.id);
      console.log('Excluindo partida:', selectedMatch.id);
      alert('Partida excluída com sucesso!');
      setDeleteModalOpen(false);
      setSelectedMatch(null);
    }
  };

  const handleSaveEdit = () => {
    if (selectedMatch) {
      updateMatch(selectedMatch.id, {
        location: editForm.location,
        date: editForm.date,
        time: editForm.time,
        maxPlayers: editForm.maxPlayers
      });
      console.log('Salvando edição:', editForm);
      alert('Partida editada com sucesso!');
      setEditModalOpen(false);
      setSelectedMatch(null);
    }
  };

  if (loading) {
    return (
      <div className='p-4 sm:p-6'>
        <h1 className='text-lg font-bold text-gray-900'>Perfil</h1>
        <p className='text-sm text-gray-600'>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='p-4 sm:p-6 space-y-4'>
        <h1 className='text-lg font-bold text-gray-900'>Perfil</h1>
        <Card>
          <CardContent className='p-6 text-center space-y-4'>
            <User className='w-12 h-12 mx-auto text-zinc-400' />
            <div>
              <h3 className='text-lg font-semibold'>Faça login para continuar</h3>
              <p className='text-sm text-zinc-500'>Entre com sua conta Google para acessar todas as funcionalidades</p>
            </div>
            <div className='space-y-2'>
              <Button 
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    console.error('Erro no login:', error);
                    alert('Erro ao fazer login. Verifique se o Google OAuth está configurado.');
                  }
                }} 
                className='w-full'
              >
                <Mail className='w-4 h-4 mr-2' />
                Entrar com Google
              </Button>
              
              <Button 
                onClick={() => navigate('/offline-auth')} 
                variant="outline"
                className='w-full'
              >
                <User className='w-4 h-4 mr-2' />
                Login de Teste (Owner)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-4 pb-20'>
      <header className="bg-white border-b border-gray-200 shadow-sm rounded-lg mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className='text-lg font-bold text-gray-900'>Perfil</h1>
            <p className='text-sm text-gray-600'>Dados do jogador, posição e estrelas</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {user?.role === 'owner' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/owner-dashboard')}
                className="p-2 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                title="Acesso rápido ao Dashboard do Owner"
              >
                <Crown className="w-4 h-4 text-purple-600" />
              </Button>
            )}
            {user?.role && user.role !== 'owner' && (
              <div className="flex items-center space-x-1 text-sm text-maestros-green">
                {getRoleIcon(user.role)}
                <span className="hidden sm:inline font-medium">
                  {user.role === 'admin' ? 'Admin' : 
                   user.role === 'aux' ? 'Auxiliar' : 
                   user.role === 'mensalista' ? 'Mensalista' : 
                   user.role === 'diarista' ? 'Diarista' : 
                   'Usuário'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Informações do Usuário */}
      <Card>
        <CardContent className='p-6 space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <div className='w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center overflow-hidden'>
                {getAvatarUrl() ? (
                  <img 
                    src={getAvatarUrl()!} 
                    alt="Foto de perfil" 
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User className='w-8 h-8 text-zinc-600' />
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0 bg-white border-2 border-white shadow-md hover:bg-zinc-50'
                onClick={() => setShowAvatarDialog(true)}
              >
                <Camera className='w-3 h-3' />
              </Button>
            </div>
            <div className='flex-1'>
              <h2 className='text-lg font-semibold'>{user.name || 'Usuário'}</h2>
              <p className='text-sm text-zinc-500'>{user.email || 'E-mail não disponível'}</p>
              {user.role && (
                <Badge 
                  variant="secondary" 
                  className={`mt-2 ${
                    user.role === 'owner' 
                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                      : user.role === 'admin'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-green-100 text-green-800 border-green-200'
                  }`}
                >
                  <Shield className='w-3 h-3 mr-1' />
                  {user.role === 'owner' ? '👑 Dono' : 
                   user.role === 'admin' ? '🛡️ Admin' : 
                   user.role === 'mensalista' ? '⭐ Mensalista' : 
                   user.role === 'diarista' ? '💫 Diarista' : 
                   user.role}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Navegação */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className={`grid w-full grid-cols-3 bg-black border-black h-12 p-1 rounded-xl`}>
          <TabsTrigger 
            value="stats" 
            className="flex items-center justify-center p-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-white hover:bg-zinc-800 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="achievements" 
            className="flex items-center justify-center p-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-white hover:bg-zinc-800 transition-colors"
          >
            <Award className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="flex items-center justify-center p-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-black text-white hover:bg-zinc-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>Estatísticas do Jogador</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-4 bg-emerald-50 rounded-lg'>
                  <Trophy className='w-6 h-6 text-emerald-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-emerald-600'>12</div>
                  <div className='text-sm text-zinc-500'>Gols</div>
                </div>
                <div className='text-center p-4 bg-blue-50 rounded-lg'>
                  <Target className='w-6 h-6 text-blue-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-blue-600'>8</div>
                  <div className='text-sm text-zinc-500'>Assistências</div>
                </div>
                <div className='text-center p-4 bg-purple-50 rounded-lg'>
                  <Calendar className='w-6 h-6 text-purple-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-purple-600'>24</div>
                  <div className='text-sm text-zinc-500'>Partidas</div>
                </div>
                <div className='text-center p-4 bg-orange-50 rounded-lg'>
                  <Star className='w-6 h-6 text-orange-600 mx-auto mb-2' />
                  <div className='text-2xl font-bold text-orange-600'>4.8</div>
                  <div className='text-sm text-zinc-500'>Avaliação</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>Conquistas</h3>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg'>
                  <Trophy className='w-5 h-5 text-yellow-600' />
                  <div>
                    <p className='font-medium'>Artilheiro do Mês</p>
                    <p className='text-sm text-zinc-500'>Setembro 2024</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-green-50 rounded-lg'>
                  <Star className='w-5 h-5 text-green-600' />
                  <div>
                    <p className='font-medium'>Jogador Mais Votado</p>
                    <p className='text-sm text-zinc-500'>Agosto 2024</p>
                  </div>
                </div>
                <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg'>
                  <Calendar className='w-5 h-5 text-blue-600' />
                  <div>
                    <p className='font-medium'>Presença Perfeita</p>
                    <p className='text-sm text-zinc-500'>Últimos 3 meses</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Dashboard do Owner */}

        
        <TabsContent value="settings" className="space-y-4">
           {/* Funcionalidades especiais para Owner */}
           {(user.role === 'owner' || !user.role) && (
             <>
               {/* Botão de Acesso ao Dashboard Completo */}
               <Button 
                 variant="default" 
                 className='w-full bg-purple-600 hover:bg-purple-700 text-white mb-4'
                 onClick={() => navigate('/owner-dashboard')}
               >
                 <Crown className='w-4 h-4 mr-2' />
                 Acessar Dashboard Completo
               </Button>
               


             </>
           )}

           {/* Configurações de Aparência */}
           <Card>
             <CardContent className='p-6'>
               <h3 className='text-lg font-semibold mb-4 flex items-center'>
                 <Palette className='w-5 h-5 mr-2 text-blue-600' />
                 Aparência
               </h3>
               <div className='space-y-4'>
                 <div className='flex justify-between items-center'>
                   <div>
                     <span className='text-sm font-medium'>Tema</span>
                     <p className='text-xs text-zinc-500'>Escolha entre claro, escuro ou automático</p>
                   </div>
                   <ThemeSelector />
                 </div>
               </div>
             </CardContent>
           </Card>

           {/* Configurações da Conta */}
           <Card>
             <CardContent className='p-6'>
               <h3 className='text-lg font-semibold mb-4'>Configurações da Conta</h3>
               <div className='space-y-3'>
                 <div className='flex justify-between items-center'>
                   <span className='text-sm text-zinc-500'>ID do Usuário:</span>
                   <span className='text-sm font-mono'>{user.id}</span>
                 </div>
                 <div className='flex justify-between items-center'>
                   <span className='text-sm text-zinc-500'>E-mail:</span>
                   <span className='text-sm'>{user.email || 'Não informado'}</span>
                 </div>
                 <div className='flex justify-between items-center'>
                   <span className='text-sm text-zinc-500'>Nome:</span>
                   <span className='text-sm'>{user.name || 'Não informado'}</span>
                 </div>
                 <div className='flex justify-between items-center'>
                   <span className='text-sm text-zinc-500'>Tipo de Acesso:</span>
                   <Badge variant="outline">{user.role || 'Não definido'}</Badge>
                 </div>
               </div>
             </CardContent>
           </Card>


         </TabsContent>
      </Tabs>

      <div className='pt-4'>
        <Button 
          onClick={async () => {
            // Verificar se é o owner principal
            if (user?.id && isMainOwner(user.id)) {
              alert(PROTECTION_MESSAGES.CANNOT_LOGOUT_MAIN_OWNER);
              return;
            }
            
            try {
              await signOut();
              alert('Logout realizado com sucesso!');
              navigate('/');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              alert('Erro ao fazer logout');
            }
          }} 
          disabled={user?.id ? isMainOwner(user.id) : false}
          variant="destructive" 
          className={`w-full ${user?.id && isMainOwner(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={user?.id && isMainOwner(user.id) ? PROTECTION_MESSAGES.CANNOT_LOGOUT_MAIN_OWNER : 'Sair da conta'}
        >
          <LogOut className='w-4 h-4 mr-2' />
          Sair da Conta
        </Button>
      </div>

      {/* Modal de Visualizar */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Jogo</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-zinc-600">Local</Label>
                <p className="text-sm">{selectedMatch.location}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-zinc-600">Data e Hora</Label>
                <p className="text-sm">{selectedMatch.date} às {selectedMatch.time}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-zinc-600">Status</Label>
                <Badge variant={selectedMatch.status === 'Aberto' ? 'default' : 'secondary'}>
                  {selectedMatch.status}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-zinc-600">Jogadores Confirmados</Label>
                <p className="text-sm">{selectedMatch.confirmedPlayers}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Jogo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-location">Local</Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Digite o local do jogo"
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-time">Hora</Label>
              <Input
                id="edit-time"
                type="time"
                value={editForm.time}
                onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-maxPlayers">Número de Vagas</Label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Excluir */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-600">
              Tem certeza que deseja excluir este jogo? Esta ação não pode ser desfeita.
            </p>
            {selectedMatch && (
              <div className="mt-4 p-3 bg-zinc-50 rounded-lg">
                <p className="text-sm font-medium">{selectedMatch.location}</p>
                <p className="text-xs text-zinc-500">{selectedMatch.date} às {selectedMatch.time}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMatch}>
              Excluir Jogo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Criar Partida */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Partida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-location">Local</Label>
              <Input
                id="create-location"
                value={createForm.location}
                onChange={(e) => setCreateForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Digite o local do jogo"
              />
            </div>
            <div>
              <Label htmlFor="create-date">Data</Label>
              <Input
                id="create-date"
                type="date"
                value={createForm.date}
                onChange={(e) => setCreateForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="create-time">Hora</Label>
              <Input
                id="create-time"
                type="time"
                value={createForm.time}
                onChange={(e) => setCreateForm(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="create-maxPlayers">Número de Vagas</Label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCreate}>
              Criar Partida
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Avatar */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Foto de Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className='w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center overflow-hidden'>
                {getAvatarUrl() ? (
                  <img 
                    src={getAvatarUrl()!} 
                    alt="Foto de perfil atual" 
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User className='w-12 h-12 text-zinc-600' />
                )}
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-zinc-600">
                  {user?.avatar_url && !user?.custom_avatar 
                    ? 'Foto atual do Google' 
                    : user?.custom_avatar 
                    ? 'Foto personalizada' 
                    : 'Nenhuma foto definida'
                  }
                </p>
                <p className="text-xs text-zinc-500">
                  Formatos aceitos: JPG, PNG, GIF (máx. 10MB)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingAvatar ? 'Enviando...' : 'Escolher Nova Foto'}
              </Button>
              
              {getAvatarUrl() && (
                <Button 
                  variant="outline" 
                  onClick={handleRemoveAvatar}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Foto
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvatarDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Recorte de Imagem */}
      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recortar Foto de Perfil</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <ImageCropper
              imageSrc={selectedImage}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
