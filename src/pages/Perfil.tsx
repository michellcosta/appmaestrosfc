import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { useGamesStore } from '@/store/gamesStore';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Upload,
  UserPlus
} from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import ImageCropper from '@/components/ImageCropper';
import { SimpleInviteModal } from '@/components/SimpleInviteModal';
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Arquivo selecionado:', file.name, file.size);

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
      console.log('🎨 Imagem convertida:', base64.substring(0, 50) + '...');
      setSelectedImage(base64);
      setShowCropper(true);
      setShowAvatarDialog(false);
    };
    reader.onerror = () => {
      console.error('❌ Erro ao ler arquivo');
      alert('Erro ao ler arquivo. Tente novamente.');
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
      console.log('📸 Iniciando upload do avatar...');
      await updateAvatar(croppedImage);
      console.log('✅ Avatar atualizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar avatar:', error);
      alert('Erro ao atualizar avatar');
    } finally {
      setUploadingAvatar(false);
      setSelectedImage('');
      setShowAvatarDialog(false);
    }
  };

  const handleSignOut = async () => {
    if (user?.id && isMainOwner(user.id)) {
      alert(PROTECTION_MESSAGES.CANNOT_LOGOUT_MAIN_OWNER);
      return;
    }

    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4 pb-20">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Acesso Restrito</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você precisa estar logado para acessar seu perfil.
            </p>
            <Button onClick={() => navigate('/simple-auth')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 space-y-4 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm rounded-lg mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Perfil</h1>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              Informações do seu perfil e configurações
            </p>
          </div>
          
          {/* Crown button for owners */}
          {user.role === 'owner' && (
            <button
              onClick={() => navigate('/owner-dashboard')}
              className="p-2 hover:bg-purple-100 hover:text-purple-700 transition-colors rounded-lg"
              title="Acesso rápido ao Dashboard do Owner"
            >
              <Crown className="w-4 h-4 text-purple-600" />
            </button>
          )}
        </div>
      </header>

      {/* User Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {user?.custom_avatar || user?.avatar ? (
                  <img 
                    src={user.custom_avatar || user.avatar} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-zinc-500" />
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowAvatarDialog(true)}
                className="w-fit px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-3 h-3 mr-1" />
                Alterar Foto
              </button>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className='text-xl font-semibold dark:text-zinc-100'>{user.name || 'Usuário'}</h2>
              <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1'>{user.email || 'E-mail não disponível'}</p>
              {user.role && (
                <Badge 
                  variant="secondary" 
                  className={
                    user.role === 'owner'
                      ? 'mt-3 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      : user.role === 'admin'
                      ? 'mt-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : 'mt-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
                  }
                >
                  <Shield className='w-3 h-3 mr-1' />
                  {user.role === 'owner' ? '👑 Dono' : 
                   user.role === 'admin' ? '🛡️ Admin' : 
                   user.role === 'aux' ? '⚡ Auxiliar' :
                   user.role === 'mensalista' ? '⭐ Mensalista' : 
                   user.role === 'diarista' ? '🔹 Diarista' : '👤 Usuário'}
                </Badge>
              )}
              
              {/* Acessar Dashboard Completo button - moved from header */}
              {user.role === 'owner' && (
                <Button
                  onClick={() => navigate('/owner-dashboard')}
                  variant="ghost"
                  className="mt-4 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Acessar Dashboard Completo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-zinc-500">Vitórias</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-zinc-500">Gols</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-zinc-500">Assistências</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Matches Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Partidas Recentes
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-zinc-500">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma partida registrada ainda</p>
          </div>
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ThemeSelector />
        </CardContent>
      </Card>

      {/* Admin/Aux tools moved to be above logout button */}
      {(user.role === 'admin' || user.role === 'aux') && (
        <Card>
          <CardHeader>
            <CardTitle>Ferramentas de Administração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowInviteModal(true)}
                className="w-full justify-start"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Convites
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logout Section */}
      <div>
        <Button
          variant="destructive"
          onClick={handleSignOut}
          disabled={user?.id ? isMainOwner(user.id) : false}
          className={
            user?.id && isMainOwner(user.id)
              ? 'w-full flex items-center justify-center opacity-50 cursor-not-allowed'
              : 'w-full flex items-center justify-center'
          }
          title={user?.id && isMainOwner(user.id) ? PROTECTION_MESSAGES.CANNOT_LOGOUT_MAIN_OWNER : 'Sair da conta'}
        >
          <LogOut className='w-4 h-4 mr-2' />
          Sair da Conta
        </Button>
      </div>

      {/* Avatar Upload Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Foto de Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">
              Selecione uma imagem para ser sua foto de perfil.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="w-full"
              hidden
            />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Selecionar Imagem
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Cropper */}
      {showCropper && (
        <Dialog open={showCropper} onOpenChange={setShowCropper}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Recortar Imagem</DialogTitle>
            </DialogHeader>
            <ImageCropper
              imageSrc={selectedImage}
              onCropComplete={handleCropComplete}
              onCancel={() => setShowCropper(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Simple Invite Modal for Admin/Aux */}
      {showInviteModal && (
        <SimpleInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}