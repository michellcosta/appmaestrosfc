import React, { useState } from 'react';
import { User, Mail, Shield, Shirt, MapPin, Settings, Moon, Sun, Monitor, Bell, BellOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { pt } from '@/i18n/pt';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'auto';

export const Profile: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('auto');
  const [muteAll, setMuteAll] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data
  const user = {
    id: 'user1',
    name: 'João Silva',
    email: 'joao.silva@gmail.com',
    role: 'mensalista' as const,
    position: 'Atacante',
    shirtSize: 'G' as const,
    photoUrl: null,
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    // TODO: Aplicar tema ao documento
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Auto - usar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-purple-500',
      admin: 'bg-blue-500',
      aux: 'bg-green-500',
      mensalista: 'bg-primary',
      diarista: 'bg-warning',
    };
    
    return (
      <Badge className={cn(colors[role], 'text-white')}>
        {pt.roles[role]}
      </Badge>
    );
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-4 h-4" />;
    if (theme === 'dark') return <Moon className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="p-4 space-y-4">
      <header className="mb-6">
        <h1 className="text-2xl font-outfit font-bold text-foreground">
          {pt.navigation.profile}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações
        </p>
      </header>

      {/* Informações do Usuário */}
      <Card className="p-6 shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-outfit font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </p>
            </div>
          </div>
          {getRoleBadge(user.role)}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                {pt.profile.position}
              </Label>
              <Select
                defaultValue={user.position}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gol">{pt.positions.gol}</SelectItem>
                  <SelectItem value="Zaga">{pt.positions.zaga}</SelectItem>
                  <SelectItem value="Lateral">{pt.positions.lateral}</SelectItem>
                  <SelectItem value="Meio">{pt.positions.meio}</SelectItem>
                  <SelectItem value="Atacante">{pt.positions.atacante}</SelectItem>
                  <SelectItem value="Coringa">{pt.positions.coringa}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                {pt.profile.shirtSize}
              </Label>
              <Select
                defaultValue={user.shirtSize}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="GG">GG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant={isEditing ? 'success' : 'outline'}
            className="w-full"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? pt.actions.save : pt.profile.editProfile}
          </Button>
        </div>
      </Card>

      {/* Configurações */}
      <Card className="p-6 shadow-lg">
        <h3 className="font-outfit font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Configurações
        </h3>

        <div className="space-y-4">
          {/* Tema */}
          <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              {getThemeIcon()}
              <div>
                <p className="font-medium">{pt.profile.theme}</p>
                <p className="text-xs text-muted-foreground">
                  {theme === 'light' && pt.profile.themeLight}
                  {theme === 'dark' && pt.profile.themeDark}
                  {theme === 'auto' && pt.profile.themeAuto}
                </p>
              </div>
            </div>
            <Select value={theme} onValueChange={(value: Theme) => handleThemeChange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    {pt.profile.themeLight}
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    {pt.profile.themeDark}
                  </div>
                </SelectItem>
                <SelectItem value="auto">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    {pt.profile.themeAuto}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notificações */}
          <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div className="flex items-center gap-3">
              {muteAll ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              <div>
                <p className="font-medium">{pt.profile.notifications}</p>
                <p className="text-xs text-muted-foreground">
                  {muteAll ? 'Todas silenciadas' : 'Ativas'}
                </p>
              </div>
            </div>
            <Switch
              checked={!muteAll}
              onCheckedChange={(checked) => setMuteAll(!checked)}
            />
          </div>
        </div>
      </Card>

      {/* Sair */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => console.log('Sign out')}
      >
        <LogOut className="w-4 h-4" />
        {pt.auth.signOut}
      </Button>
    </div>
  );
};