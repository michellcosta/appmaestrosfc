/*
 * SISTEMA DE RECOMPENSAS - OCULTO
 * 
 * Para reativar o sistema de recompensas futuramente:
 * 1. Mude {false && ( para {true && ( na linha ~946
 * 2. Descomente o useEffect de processamento de conquistas (linha ~177)
 * 3. Descomente as notificações e animações (linha ~1119)
 * 
 * O sistema está completo e funcional, apenas oculto da interface.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { useGamesStore } from '@/store/gamesStore';
import { usePermissions } from '@/hooks/usePermissions';
import { usePlayersStore } from '@/store/playersStore';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { useAchievementsStore } from '@/store/achievementsStore';
import { supabase } from '@/lib/supabase';
import { FigurinhasCatalog } from '@/components/ui/figurinhas-catalog';
import { generateAllFigurinhas, type PlayerStats } from '@/utils/figurinhas';
import { useAchievementTracker } from '@/hooks/useAchievementTracker';
import { AchievementNotificationList } from '@/components/ui/achievement-notification';
import { AchievementUnlockQueue } from '@/components/ui/achievement-unlock-animation';
import { calculateReward, applyRewards, calculateLevel, type PlayerRewards } from '@/utils/rewards';
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
import { validateUserData, validatePlayerInfo, validateImageFile, validateStatsData } from '@/utils/userValidation';
import { 
  ProfilePageSkeleton, 
  UserInfoSkeleton, 
  StatsSkeleton, 
  AchievementsSkeleton,
  ProgressLoading,
  UploadLoading 
} from '@/components/ui/skeleton-loading';

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

  // Estados para informações do jogador
  const [playerPosition, setPlayerPosition] = useState('Meia');
  const [shirtSize, setShirtSize] = useState('G');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  
  // Estados para validação e erros
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [showValidationFeedback, setShowValidationFeedback] = useState(false);
  
  // Estados para catálogo de figurinhas
  const [showCatalog, setShowCatalog] = useState(false);
  
  // Estados para sistema de conquistas - OCULTOS (podem ser reativados futuramente)
  const [playerRewards, setPlayerRewards] = useState<PlayerRewards>(() => {
    // Carregar recompensas do localStorage
    const saved = localStorage.getItem('playerRewards');
    return saved ? JSON.parse(saved) : {
      xp: 0,
      coins: 0,
      badges: [],
      titles: [],
      unlocked: []
    };
  });
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [unlockQueue, setUnlockQueue] = useState<Figurinha[]>([]);
  const [processedAchievements, setProcessedAchievements] = useState<Set<string>>(new Set());
  
  // Estados para loading
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);

  // Buscar estatísticas reais do usuário
  const { stats: playerStats, loading: statsLoading, error: statsError } = usePlayerStats(user?.id || '');
  
  // Sistema de rastreamento de conquistas
  const { 
    notifications, 
    newAchievements, 
    checkAchievements, 
    markAsRead, 
    clearAllNotifications 
  } = useAchievementTracker(user?.id || '', user?.role);

  // Otimizar estatísticas com useMemo - OTIMIZADO
  const optimizedStats = useMemo(() => ({
    victories: playerStats.victories || 0,
    totalGoals: playerStats.totalGoals || 0,
    totalAssists: playerStats.totalAssists || 0,
    totalMatches: playerStats.totalMatches || 0,
    totalPayments: playerStats.totalPayments || 0,
    consecutiveMatches: playerStats.consecutiveMatches || 0
  }), [playerStats]);

  // Criar PlayerStats para o catálogo de figurinhas
  const playerStatsForCatalog: PlayerStats = useMemo(() => ({
    totalGoals: optimizedStats.totalGoals,
    totalAssists: optimizedStats.totalAssists,
    totalMatches: optimizedStats.totalMatches,
    totalPayments: optimizedStats.totalPayments,
    consecutiveMatches: optimizedStats.consecutiveMatches,
    victories: optimizedStats.victories,
    // Adicionar estatísticas extras para figurinhas de performance
    fastestGoal: 45, // Exemplo: 45 segundos
    goalAccuracy: 85, // Exemplo: 85% de precisão
    cleanSheets: 3, // Exemplo: 3 partidas sem sofrer gol
    hatTricks: 1, // Exemplo: 1 hat-trick
    perfectAssists: 2, // Exemplo: 2 assistências perfeitas
    mvpCount: 5, // Exemplo: 5 vezes MVP
    monthlyGoals: 8, // Exemplo: 8 gols no mês
    monthlyMatches: 6, // Exemplo: 6 partidas no mês
    loginDays: 15 // Exemplo: 15 dias consecutivos logado
  }), [optimizedStats]);

  // Debug: Log das estatísticas carregadas para verificar tempo real
  useEffect(() => {
    console.log(`📊 Player Stats atualizadas:`, {
      vitórias: playerStats.victories,
      gols: playerStats.totalGoals, 
      assistências: playerStats.totalAssists,
      partidas: playerStats.totalMatches,
      loading: statsLoading
    });
  }, [playerStats, statsLoading]);

  // Salvar recompensas no localStorage quando mudarem - OTIMIZADO
  const prevRewardsRef = useRef<PlayerRewards>(playerRewards);
  useEffect(() => {
    // Só salvar se realmente mudou
    if (JSON.stringify(prevRewardsRef.current) !== JSON.stringify(playerRewards)) {
      localStorage.setItem('playerRewards', JSON.stringify(playerRewards));
      prevRewardsRef.current = playerRewards;
    }
  }, [playerRewards]);

  // Processar novas conquistas - DESABILITADO (pode ser reativado futuramente)
  // useEffect(() => {
  //   if (newAchievements.length > 0) {
  //     // Filtrar apenas conquistas não processadas
  //     const newUnprocessed = newAchievements.filter(achievement => 
  //       !processedAchievements.has(achievement.id)
  //     );

  //     if (newUnprocessed.length > 0) {
  //       // Adicionar à fila de animações
  //       setUnlockQueue(prev => [...prev, ...newUnprocessed]);
  //       setShowUnlockAnimation(true);

  //       // Calcular e aplicar recompensas apenas uma vez
  //       const totalRewards = newUnprocessed.reduce((acc, figurinha) => {
  //         const rewards = calculateReward(figurinha, acc);
  //         return applyRewards(acc, rewards);
  //       }, playerRewards);

  //       setPlayerRewards(totalRewards);

  //       // Marcar como processadas
  //       setProcessedAchievements(prev => {
  //         const newSet = new Set(prev);
  //         newUnprocessed.forEach(achievement => newSet.add(achievement.id));
  //         return newSet;
  //       });
  //     }
  //   }
  // }, [newAchievements, processedAchievements, playerRewards]);

  // Calcular nível do jogador
  const playerLevel = useMemo(() => calculateLevel(playerRewards.xp), [playerRewards.xp]);

  // Validar estatísticas quando carregadas - OTIMIZADO
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (playerStats && !statsLoading) {
      const validation = validateStatsData(playerStats);
      
      if (!validation.isValid) {
        console.warn('⚠️ Estatísticas com dados inválidos:', validation.errors);
        setValidationWarnings(validation.warnings);
        setShowValidationFeedback(true);
        
        // Limpar timeout anterior se existir
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
        }
        
        // Auto-hide warnings após 3 segundos
        validationTimeoutRef.current = setTimeout(() => {
          setShowValidationFeedback(false);
          setValidationWarnings([]);
        }, 3000);
      }
    }
    
    // Cleanup timeout ao desmontar
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [playerStats, statsLoading]);

  // Debug: Log do avatar do usuário para verificar captura do Google
  useEffect(() => {
    if (user) {
      console.log(`📸 Avatar do usuário carregado:`, {
        custom_avatar: user.custom_avatar,
        avatar_url: user.avatar_url,
        avatar: user.avatar,
        google_image_detected: !!(user.avatar_url || user.avatar)
      });
    }
  }, [user]);
  
  // Sistema em tempo real para achievements
  const { subscribePlayerUpdates, unsubscribePlayerUpdates, isRealtime } = useAchievementsStore();

  // Subscribe/unsubscribe ao user no real-time quando entrar/sair - OTIMIZADO
  useEffect(() => {
    if (user?.id) {
      subscribePlayerUpdates(user.id);
      console.log(`✅ Realtime subscription ATIVADA para user: ${user.name}`);
    }

    // Cleanup quando sair do componente
    return () => {
      if (user?.id) {
        unsubscribePlayerUpdates(user.id);
        console.log(`❌ Realtime subscription DESATIVADA para user: ${user.name}`);
      }
    };
  }, [user?.id]); // Removidas as dependências que podem causar loop

  // Sistema de conquistas baseado em dados reais - OTIMIZADO
  const achievements = useMemo(() => [
    {
      id: 'first-goal',
      name: 'Primeiro Gol',
      emoji: '⚽',
      description: '1º gol da vida',
      requirement: 1,
      current: optimizedStats.totalGoals,
      unlocked: optimizedStats.totalGoals >= 1,
      color: 'from-green-400 to-emerald-500',
      borderColor: 'border-green-300 dark:border-green-600'
    },
    {
      id: 'first-assist',
      name: 'Primeira Assist',
      emoji: '🎯',
      description: '1ª assistência',
      requirement: 1,
      current: optimizedStats.totalAssists,
      unlocked: optimizedStats.totalAssists >= 1,
      color: 'from-blue-400 to-cyan-500',
      borderColor: 'border-blue-300 dark:border-blue-600'
    },
    {
      id: 'debutante',
      name: 'Debutante',
      emoji: '⭐',
      description: '1ª partida',
      requirement: 1,
      current: optimizedStats.totalMatches,
      unlocked: optimizedStats.totalMatches >= 1,
      color: 'from-purple-400 to-indigo-500',
      borderColor: 'border-purple-300 dark:border-purple-600'
    },
    {
      id: 'first-payment',
      name: 'Primeiro Pago',
      emoji: '💰',
      description: '1º pagamento',
      requirement: 1,
      current: optimizedStats.totalPayments,
      unlocked: optimizedStats.totalPayments >= 1,
      color: 'from-yellow-400 to-amber-500',
      borderColor: 'border-yellow-300 dark:border-yellow-600'
    },
    {
      id: 'consecutive',
      name: 'Não Falto Uma',
      emoji: '🔗',
      description: '5 partidas seguidas',
      requirement: 5,
      current: optimizedStats.consecutiveMatches,
      unlocked: optimizedStats.consecutiveMatches >= 5,
      color: 'from-red-400 to-pink-500',
      borderColor: 'border-red-300 dark:border-red-600'
    },
    {
      id: 'presente',
      name: 'Presente',
      emoji: '🔥',
      description: '5 partidas total',
      requirement: 5,
      current: optimizedStats.totalMatches,
      unlocked: optimizedStats.totalMatches >= 5,
      color: 'from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-300 dark:border-emerald-600'
    },
    {
      id: 'artilheiro',
      name: 'Artilheiro',
      emoji: '🥊',
      description: '15+ gols total',
      requirement: 15,
      current: optimizedStats.totalGoals,
      unlocked: optimizedStats.totalGoals >= 15,
      color: 'from-orange-400 to-red-500',
      borderColor: 'border-orange-300 dark:border-orange-600'
    },
    {
      id: 'criador',
      name: 'Criador',
      emoji: '⚡',
      description: '10+ assistências',
      requirement: 10,
      current: optimizedStats.totalAssists,
      unlocked: optimizedStats.totalAssists >= 10,
      color: 'from-violet-400 to-purple-500',
      borderColor: 'border-violet-300 dark:border-violet-600'
    }
  ], [optimizedStats]);

  const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Arquivo selecionado:', file.name, file.size);

    // Validar arquivo com sistema de validação
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);
      setShowValidationFeedback(true);
      
      // Auto-hide feedback após 5 segundos
      setTimeout(() => {
        setShowValidationFeedback(false);
        setValidationErrors([]);
        setValidationWarnings([]);
      }, 5000);
      
      return;
    }

    // Mostrar warnings se houver
    if (validation.warnings.length > 0) {
      setValidationWarnings(validation.warnings);
      setShowValidationFeedback(true);
      
      // Auto-hide warnings após 3 segundos
      setTimeout(() => {
        setShowValidationFeedback(false);
        setValidationWarnings([]);
      }, 3000);
    }

    // Configurar estados de loading
    setUploadFileName(file.name);
    setIsProcessingAvatar(true);
    setUploadProgress(0);

    // Simular progresso de leitura
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Converter para base64 e abrir o recorte
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      console.log('🎨 Imagem convertida:', base64.substring(0, 50) + '...');
      
      // Completar progresso
      setUploadProgress(100);
      setTimeout(() => {
        setSelectedImage(base64);
        setShowCropper(true);
        setShowAvatarDialog(false);
        setIsProcessingAvatar(false);
        setUploadProgress(0);
        setUploadFileName('');
      }, 500);
    };
    reader.onerror = () => {
      console.error('❌ Erro ao ler arquivo');
      alert('Erro ao ler arquivo. Tente novamente.');
      setIsProcessingAvatar(false);
      setUploadProgress(0);
      setUploadFileName('');
      clearInterval(progressInterval);
    };
    reader.readAsDataURL(file);

    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleCropComplete = useCallback(async (croppedImage: string) => {
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
  }, [updateAvatar]);

  const handleSignOut = useCallback(async () => {
    // Permitir logout sempre (remover proteção bloqueante para sair da conta)
    try {
      console.log('🔍 Iniciando logout do usuário...');
      
      // Realizar logout completo
      await signOut();
      
      // Redirecionar para página de login
      navigate('/login');
      
      console.log('✅ Logout e redirecionamento completos');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      // Force logout se errooccurrer - usar redirect completo
      localStorage.removeItem('offline_user');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  }, [signOut, navigate]);

  // Loading state otimizado com skeleton completo
  if (loading) {
    return <ProfilePageSkeleton />;
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
      {loading ? (
        <UserInfoSkeleton />
      ) : (
        <Card>
          <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {user?.custom_avatar || user?.avatar_url || user?.avatar ? (
                  <img 
                    src={user.custom_avatar || user.avatar_url || user.avatar} 
                    alt="Avatar" 
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 sm:w-14 sm:h-14 text-zinc-500" />
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowAvatarDialog(true)}
                className="w-fit px-4 py-2 text-sm bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
              >
                <Camera className="w-4 h-4 mr-2" />
                Alterar Foto
              </button>
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h2 className='text-2xl font-bold dark:text-zinc-100'>{user.name || 'Usuário'}</h2>
                <p className='text-sm text-zinc-500 dark:text-zinc-400 mt-1'>{user.email || 'E-mail não disponível'}</p>
              </div>

              {/* Informações do jogador */}
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mt-4 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Informações do Jogador
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Posição do jogador */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Posição</p>
                    {isEditingInfo ? (
                      <select 
                        value={playerPosition}
                        onChange={(e) => setPlayerPosition(e.target.value)}
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 w-full"
                      >
                        <option value="Goleiro">Goleiro</option>
                        <option value="Zagueiro">Zagueiro</option>
                        <option value="Meia">Meia</option>
                        <option value="Atacante">Atacante</option>
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{playerPosition}</p>
                    )}
                  </div>
                </div>

                {/* Tamanho da camisa */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Tamanho</p>
                    {isEditingInfo ? (
                      <select 
                        value={shirtSize}
                        onChange={(e) => setShirtSize(e.target.value)}
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-2 w-full"
                      >
                        <option value="G">G</option>
                        <option value="GG">GG</option>
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{shirtSize}</p>
                    )}
                  </div>
                </div>
                </div>
              </div>

              {/* Botão editar info do jogador */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    if (isEditingInfo) {
                      // Validar dados antes de salvar
                      const validation = validatePlayerInfo({
                        position: playerPosition,
                        shirtSize: shirtSize
                      });
                      
                      if (!validation.isValid) {
                        setValidationErrors(validation.errors);
                        setValidationWarnings(validation.warnings);
                        setShowValidationFeedback(true);
                        
                        // Auto-hide feedback após 5 segundos
                        setTimeout(() => {
                          setShowValidationFeedback(false);
                          setValidationErrors([]);
                          setValidationWarnings([]);
                        }, 5000);
                        return;
                      }
                      
                      // Dados válidos, salvar
                      console.log('✅ Informações do jogador validadas e salvas:', validation.sanitizedData);
                    }
                    
                    setIsEditingInfo(!isEditingInfo);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isEditingInfo 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {isEditingInfo ? 'Salvar' : 'Editar'}
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
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
      )}

      {/* Statistics Section - Conectado aos dados reais */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {optimizedStats.victories}
              </div>
              <div className="text-sm text-zinc-500">Vitórias</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {optimizedStats.totalGoals}
              </div>
              <div className="text-sm text-zinc-500">Gols</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {optimizedStats.totalAssists}
              </div>
              <div className="text-sm text-zinc-500">Assistências</div>
            </CardContent>
          </Card>
        </div>
      )}

             {/* Debug info - só em desenvolvimento */}
             {process.env.NODE_ENV === 'development' && (statsError || user?.avatar_url) && (
               <Card className="border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20">
                 <CardContent className="p-3">
                   {statsError && (
                     <p className="text-sm text-red-600 dark:text-red-400">
                       ⚠️ Erro ao carregar estatísticas: {statsError}
                     </p>
                   )}
                   {user?.avatar_url && (
                     <p className="text-sm text-green-600 dark:text-green-400">
                       📸 Avatar Google capturado: {user.avatar_url}
                     </p>
                   )}
                 </CardContent>
               </Card>
             )}

      {/* Status de atualização em tempo real */}
      {isRealtime && !statsLoading && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Dados em tempo real ativo
          </div>
        </div>
      )}

      {/* Loading de upload de avatar */}
      {isProcessingAvatar && (
        <UploadLoading 
          fileName={uploadFileName} 
          progress={uploadProgress} 
        />
      )}

      {/* Feedback de validação */}
      {showValidationFeedback && (
        <div className="space-y-2">
          {validationErrors.length > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Erros de Validação
                </h4>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validationWarnings.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">⚠</span>
                </div>
                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  Avisos
                </h4>
              </div>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Achievements Section - Figurinhas/Conquistas */}
      {statsLoading ? (
        <AchievementsSkeleton />
      ) : (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
              <Trophy className="w-6 h-6" />
              Minhas Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {/* Figurinha Única de Owner */}
            {user?.role === 'owner' && (
              <div className="relative group">
                <div className="text-center p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg border-4 border-yellow-300 dark:border-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-4xl mb-1 drop-shadow-lg">{'👑'}</div>
                  <div className="text-xs font-bold text-white drop-shadow-md leading-tight">
                    O GRANDE LÍDER
                  </div>
                  <div className="text-xs text-yellow-100 drop-shadow-md mt-1">
                    Soberano Supremo
                </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full flex items-center justify-center">
                    <span className="text-xs">💎</span>
                  </div>
                </div>
                
                {/* Tooltip especial */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                  <div className="text-yellow-300 font-bold">FIGURINHA LENDÁRIA</div>
                  <div>Owner do Projeto</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                </div>
              </div>
            )}

            {/* Placeholder para futuras conquistas */}
            {user?.role !== 'owner' && (
              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                <div className="text-2xl text-gray-400 mb-1">🔒</div>
                <div className="text-xs text-gray-500">Bloqueada</div>
              </div>
            )}

            {/* Figurinhas Dinâmicas - Sistema de Conquistas */}
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`relative text-center p-3 rounded-lg border-2 shadow-md transition-all duration-300 ${
                  achievement.unlocked 
                    ? `bg-gradient-to-br ${achievement.color} ${achievement.borderColor} hover:scale-105` 
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="text-3xl mb-1 opacity-100">{achievement.emoji}</div>
                <div className={`text-xs font-bold drop-shadow-md ${
                  achievement.unlocked ? 'text-white' : 'text-gray-500'
                }`}>
                  {achievement.name}
                </div>
                <div className={`text-xs ${
                  achievement.unlocked 
                    ? 'text-gray-100' 
                    : 'text-gray-500'
                }`}>
                  {achievement.description}
                </div>
                
                {/* Barra de progresso para conquistas não desbloqueadas */}
                {!achievement.unlocked && achievement.current > 0 && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, (achievement.current / achievement.requirement) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {achievement.current}/{achievement.requirement}
                    </div>
                  </div>
                )}
                
                {/* Ícone de desbloqueado */}
                {achievement.unlocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progresso das Conquistas */}
          <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Progresso das Conquistas
              </h3>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {achievements.filter(a => a.unlocked).length}/{achievements.length}
              </div>
            </div>
            
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-zinc-600 dark:text-zinc-400">
              <div>✅ Desbloqueadas: {achievements.filter(a => a.unlocked).length}</div>
              <div>🔒 Em progresso: {achievements.filter(a => !a.unlocked && a.current > 0).length}</div>
            </div>
          </div>

          {/* Legenda explicativa para Owners */}
          {user?.role === 'owner' && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                <span className="font-bold">🎉 Parabéns! Você possui a figurinha lendária de Owner!</span><br/>
                <span className="text-xs">Esta conquista excepcional destaca sua posição como fundador e líder do projeto.</span>
              </p>
            </div>
          )}

          {/* Sistema de Recompensas - OCULTO (pode ser reativado futuramente) */}
          {false && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:bg-gradient-to-r dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  🎁 Sistema de Recompensas
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Ganhe XP e moedas desbloqueando figurinhas! Use as moedas para personalizar seu perfil.
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    Nível {playerLevel.level}
                  </div>
                  <div className="text-sm text-muted-foreground">XP: {playerRewards.xp}</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${playerLevel.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Próximo: {playerLevel.xpToNext} XP
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {playerRewards.coins}
                  </div>
                  <div className="text-sm text-muted-foreground">🪙 Moedas</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Para personalização
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {playerRewards.badges.length}
                  </div>
                  <div className="text-sm text-muted-foreground">🏆 Badges</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Por categoria
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {playerRewards.titles.length}
                  </div>
                  <div className="text-sm text-muted-foreground">👑 Títulos</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Especiais
                  </div>
                </div>
              </div>

              {/* Explicação das recompensas */}
              <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-semibold mb-2">💡 Como funciona:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>XP:</strong> Ganhe experiência desbloqueando figurinhas</li>
                    <li>• <strong>Moedas:</strong> Use para personalizar avatar e perfil</li>
                    <li>• <strong>Badges:</strong> Conquiste um badge por categoria completada</li>
                    <li>• <strong>Títulos:</strong> Títulos especiais por conquistas especiais</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Botão do Catálogo de Figurinhas */}
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => setShowCatalog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Catálogo de Figurinhas
            </Button>
          </div>
        </CardContent>
        </Card>
      )}

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
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
              <Users className="w-5 h-5" />
              Ferramentas de Administração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <Button 
                onClick={() => {
                  console.log('🎯 Abrindo modal de convites...');
                  setShowInviteModal(true);
                }}
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                variant="default"
              >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Convites WhatsApp
                </Button>
                <div className="mt-3 text-xs text-green-600 dark:text-green-400 space-y-1">
                  <p className="flex items-center gap-1">
                    📱 <strong>Mensalistas:</strong> Link de convite válido por 1 dia
                  </p>
                  <p className="flex items-center gap-1">
                    📱 <strong>Diaristas:</strong> Link de convite válido por 1 dia
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Mensagem personalizada + URLs únicos para compartilhar
                  </p>
                 </div>
                 </div>
               </div>
             </CardContent>
           </Card>
      )}

      {/* Logout Section */}
      <div>
        <Button 
          variant="destructive"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center"
          title="Sair da conta"
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
      {(user.role === 'admin' || user.role === 'aux') && (
        <SimpleInviteModal
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
        />
      )}

      {/* Catálogo de Figurinhas Modal */}
      <Dialog open={showCatalog} onOpenChange={setShowCatalog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Catálogo de Figurinhas
            </DialogTitle>
          </DialogHeader>
          <FigurinhasCatalog 
            playerStats={playerStatsForCatalog}
            userRole={user?.role}
            onClose={() => setShowCatalog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Notificações de Conquistas - Desabilitadas temporariamente */}
      {/* <AchievementNotificationList
        notifications={notifications}
        onClose={markAsRead}
        maxVisible={3}
      /> */}

      {/* Animações de Desbloqueio - Desabilitadas temporariamente */}
      {/* {showUnlockAnimation && (
        <AchievementUnlockQueue
          queue={unlockQueue}
          onComplete={() => {
            setShowUnlockAnimation(false);
            setUnlockQueue([]);
          }}
        />
      )} */}
    </div>
  );
}