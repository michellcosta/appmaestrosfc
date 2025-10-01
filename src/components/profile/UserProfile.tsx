/**
 * User Profile Component
 * Sistema completo de perfil de usuário com configurações avançadas
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Settings, 
  Camera, 
  Edit, 
  Save, 
  X, 
  Check,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Lock,
  Key,
  Activity,
  Award,
  Star
} from 'lucide-react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthday?: Date;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  preferences: UserPreferences;
  security: SecuritySettings;
  activity: ActivityStats;
  achievements: Achievement[];
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    showActivity: boolean;
  };
  display: {
    fontSize: 'small' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
    animations: boolean;
  };
}

export interface SecuritySettings {
  twoFactor: boolean;
  backupCodes: string[];
  loginAlerts: boolean;
  sessionTimeout: number; // em minutos
  passwordLastChanged: Date;
  securityQuestions: SecurityQuestion[];
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
}

export interface ActivityStats {
  totalLogins: number;
  lastLoginIP: string;
  lastLoginLocation: string;
  devices: Device[];
  sessions: Session[];
}

export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  lastUsed: Date;
  isCurrent: boolean;
}

export interface Session {
  id: string;
  device: string;
  ip: string;
  location: string;
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'security' | 'activity' | 'social' | 'system';
}

interface UserProfileProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  onUpdatePreferences: (preferences: UserPreferences) => Promise<boolean>;
  onUpdateSecurity: (security: SecuritySettings) => Promise<boolean>;
  onUploadAvatar: (file: File) => Promise<string>;
  onDeleteAccount: () => Promise<boolean>;
  onExportData: () => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({
  profile,
  onUpdateProfile,
  onUpdatePreferences,
  onUpdateSecurity,
  onUploadAvatar,
  onDeleteAccount,
  onExportData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'activity' | 'achievements'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    birthday: profile.birthday ? profile.birthday.toISOString().split('T')[0] : ''
  });

  const [preferences, setPreferences] = useState<UserPreferences>(profile.preferences);
  const [security, setSecurity] = useState<SecuritySettings>(profile.security);

  // Atualizar form data quando profile muda
  useEffect(() => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      birthday: profile.birthday ? profile.birthday.toISOString().split('T')[0] : ''
    });
    setPreferences(profile.preferences);
    setSecurity(profile.security);
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const updates = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        birthday: formData.birthday ? new Date(formData.birthday) : undefined
      };

      const success = await onUpdateProfile(updates);
      if (success) {
        setIsEditing(false);
        setSuccess('Perfil atualizado com sucesso');
      } else {
        setError('Erro ao atualizar perfil');
      }
    } catch (err) {
      setError('Erro ao processar atualização');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await onUpdatePreferences(preferences);
      if (success) {
        setSuccess('Preferências atualizadas com sucesso');
      } else {
        setError('Erro ao atualizar preferências');
      }
    } catch (err) {
      setError('Erro ao processar atualização');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await onUpdateSecurity(security);
      if (success) {
        setSuccess('Configurações de segurança atualizadas');
      } else {
        setError('Erro ao atualizar configurações de segurança');
      }
    } catch (err) {
      setError('Erro ao processar atualização');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Apenas arquivos de imagem são permitidos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const avatarUrl = await onUploadAvatar(file);
      await onUpdateProfile({ avatar: avatarUrl });
      setSuccess('Avatar atualizado com sucesso');
    } catch (err) {
      setError('Erro ao atualizar avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: UserProfile['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'auxiliar':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <>
      {/* Botão de perfil */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Avatar className="w-6 h-6">
          <AvatarImage src={profile.avatar} />
          <AvatarFallback>
            {profile.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline">{profile.name}</span>
      </Button>

      {/* Modal de perfil */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback>
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      {profile.name}
                      <Badge className={getStatusColor(profile.status)}>
                        {profile.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {profile.email} • {profile.role}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="preferences">Preferências</TabsTrigger>
                  <TabsTrigger value="security">Segurança</TabsTrigger>
                  <TabsTrigger value="activity">Atividade</TabsTrigger>
                  <TabsTrigger value="achievements">Conquistas</TabsTrigger>
                </TabsList>

                {/* Aba: Perfil */}
                <TabsContent value="profile" className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="text-2xl">
                          {profile.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600">
                        <Camera className="w-3 h-3" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{profile.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{profile.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRoleColor(profile.role)}>
                          {profile.role}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Membro desde {profile.createdAt.toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Localização</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthday">Data de Nascimento</Label>
                          <Input
                            id="birthday"
                            type="date"
                            value={formData.birthday}
                            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografia</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <p className="text-sm">{profile.name}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <p className="text-sm">{profile.email}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <p className="text-sm">{profile.phone || 'Não informado'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Localização</Label>
                          <p className="text-sm">{profile.location || 'Não informado'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Website</Label>
                          <p className="text-sm">{profile.website || 'Não informado'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Data de Nascimento</Label>
                          <p className="text-sm">{profile.birthday?.toLocaleDateString() || 'Não informado'}</p>
                        </div>
                      </div>
                      {profile.bio && (
                        <div className="space-y-2">
                          <Label>Biografia</Label>
                          <p className="text-sm">{profile.bio}</p>
                        </div>
                      )}
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar Perfil</span>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Aba: Preferências */}
                <TabsContent value="preferences" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Preferências Gerais</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Tema</Label>
                        <Select
                          value={preferences.theme}
                          onValueChange={(value) => setPreferences({ ...preferences, theme: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                            <SelectItem value="auto">Automático</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select
                          value={preferences.language}
                          onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Notificações</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">Email</span>
                          </div>
                          <Switch
                            checked={preferences.notifications.email}
                            onCheckedChange={(checked) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, email: checked }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4" />
                            <span className="text-sm">Push</span>
                          </div>
                          <Switch
                            checked={preferences.notifications.push}
                            onCheckedChange={(checked) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, push: checked }
                            })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">SMS</span>
                          </div>
                          <Switch
                            checked={preferences.notifications.sms}
                            onCheckedChange={(checked) => setPreferences({
                              ...preferences,
                              notifications: { ...preferences.notifications, sms: checked }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSavePreferences}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Preferências'}
                    </Button>
                  </div>
                </TabsContent>

                {/* Aba: Segurança */}
                <TabsContent value="security" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configurações de Segurança</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                          <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                        </div>
                        <Switch
                          checked={security.twoFactor}
                          onCheckedChange={(checked) => setSecurity({ ...security, twoFactor: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Alertas de Login</h4>
                          <p className="text-sm text-gray-500">Receba notificações de novos logins</p>
                        </div>
                        <Switch
                          checked={security.loginAlerts}
                          onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={security.sessionTimeout}
                        onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) })}
                        min="5"
                        max="480"
                      />
                    </div>

                    <Button
                      onClick={handleSaveSecurity}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Configurações de Segurança'}
                    </Button>
                  </div>
                </TabsContent>

                {/* Aba: Atividade */}
                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Atividade da Conta</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Total de Logins</span>
                          </div>
                          <p className="text-2xl font-bold mt-2">{profile.activity.totalLogins}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium">Último Login</span>
                          </div>
                          <p className="text-sm mt-2">{profile.lastLoginAt?.toLocaleString() || 'Nunca'}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">Localização</span>
                          </div>
                          <p className="text-sm mt-2">{profile.activity.lastLoginLocation || 'Desconhecida'}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Dispositivos Conectados</h4>
                      <div className="space-y-2">
                        {profile.activity.devices.map(device => (
                          <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                {device.type === 'desktop' ? <Globe className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-medium">{device.name}</p>
                                <p className="text-sm text-gray-500">{device.os} • {device.browser}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {device.lastUsed.toLocaleDateString()}
                              </p>
                              {device.isCurrent && (
                                <Badge variant="default" className="text-xs">Atual</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba: Conquistas */}
                <TabsContent value="achievements" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Conquistas</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profile.achievements.map(achievement => (
                        <Card key={achievement.id} className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                              <Award className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                              <h4 className="font-medium">{achievement.name}</h4>
                              <p className="text-sm text-gray-500">{achievement.description}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Desbloqueado em {achievement.unlockedAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default UserProfile;



