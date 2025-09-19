import React, { useState } from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, CheckCircle } from 'lucide-react';

export default function OfflineAuth() {
  const { user, signInOffline, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      if (email && password) {
        await signInOffline(email, password);
        setMessage('Login realizado com sucesso!');
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setMessage('Preencha email e senha!');
      }
    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (role: 'owner'|'admin'|'aux'|'mensalista'|'diarista') => {
    setLoading(true);
    setMessage('');
    
    try {
      const testEmail = `teste-${role}@exemplo.com`;
      const testPassword = '123456';
      
      // Criar usuário de teste com role específico
      const testUser = {
        id: `test-${role}-${Date.now()}`,
        email: testEmail,
        name: `Teste ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: role
      };
      
      // Salvar no localStorage
      localStorage.setItem('offline_user', JSON.stringify(testUser));
      
      setMessage(`Login de teste como ${role} realizado com sucesso!`);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setMessage('Logout realizado!');
    } catch (error) {
      setMessage(`Erro: ${error}`);
    }
  };

  if (user) {
    return (
      <div className='p-4 sm:p-6 space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='w-5 h-5 text-green-500' />
              Login Offline Realizado
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                <User className='w-6 h-6 text-green-600' />
              </div>
              <div>
                <p className='font-semibold'>{user.email}</p>
                <Badge variant="secondary" className='bg-purple-100 text-purple-800'>
                  <Shield className='w-3 h-3 mr-1' />
                  {user.role === 'owner' ? 'Owner' : user.role}
                </Badge>
              </div>
            </div>
            
            <div className='space-y-2'>
              <p className='text-sm text-zinc-500'>
                ✅ Login offline funcionando
              </p>
              <p className='text-sm text-zinc-500'>
                ✅ Acesso como Owner
              </p>
              <p className='text-sm text-zinc-500'>
                ✅ Dashboard disponível
              </p>
            </div>
            
            <div className='flex gap-2'>
              <Button onClick={() => window.location.href = '/'} className='flex-1'>
                Ir para Dashboard
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='w-5 h-5' />
            Login Offline
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-sm text-blue-800'>
              <strong>Modo Offline:</strong> Login sem Supabase. Use qualquer email e senha.
            </p>
          </div>
          
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='seu@email.com'
            />
          </div>
          
          <div className='space-y-2'>
            <Label htmlFor='password'>Senha</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Sua senha'
            />
          </div>
          
          <Button 
            onClick={handleLogin} 
            disabled={loading}
            className='w-full'
          >
            {loading ? 'Entrando...' : 'Entrar Offline'}
          </Button>

          <div className='pt-4 border-t'>
            <h3 className='text-sm font-semibold text-zinc-700 mb-3'>Logins de Teste:</h3>
            <div className='grid grid-cols-2 gap-2'>
              <Button 
                onClick={() => handleTestLogin('owner')} 
                disabled={loading}
                variant="outline"
                size="sm"
                className='text-xs'
              >
                👑 Owner
              </Button>
              <Button 
                onClick={() => handleTestLogin('admin')} 
                disabled={loading}
                variant="outline"
                size="sm"
                className='text-xs'
              >
                🛡️ Admin
              </Button>
              <Button 
                onClick={() => handleTestLogin('aux')} 
                disabled={loading}
                variant="outline"
                size="sm"
                className='text-xs'
              >
                ⚡ Auxiliar
              </Button>
              <Button 
                onClick={() => handleTestLogin('mensalista')} 
                disabled={loading}
                variant="outline"
                size="sm"
                className='text-xs'
              >
                ⭐ Mensalista
              </Button>
              <Button 
                onClick={() => handleTestLogin('diarista')} 
                disabled={loading}
                variant="outline"
                size="sm"
                className='text-xs'
              >
                💫 Diarista
              </Button>
            </div>
          </div>
          
          {message && (
            <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
              <p className='text-sm text-green-800'>{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
