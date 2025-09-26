import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SimpleAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage('Verifique seu email para confirmar a conta!');
      }
    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage('Login realizado com sucesso!');
        navigate('/');
      }
    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('Iniciando login com Google...');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) {
        setMessage(`Erro no Google: ${error.message}`);
      } else {
        setMessage('Redirecionando para Google...');
        console.log('🔄 Google OAuth iniciado:', data);
      }
    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-4 sm:p-6 space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>🔐 Login Simples</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
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
          
          <div className='flex gap-2'>
            <Button 
              onClick={handleSignIn} 
              disabled={loading}
              className='flex-1'
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <Button 
              onClick={handleSignUp} 
              disabled={loading}
              variant='outline'
              className='flex-1'
            >
              {loading ? 'Criando...' : 'Criar Conta'}
            </Button>
          </div>

          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300 dark:border-gray-600'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400'>
                ou
              </span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className='w-full bg-red-500 hover:bg-red-600 text-white border-red-500'
            variant='outline'
          >
            <Mail className='w-4 h-4 mr-2' />
            Entrar com Google
          </Button>
          
          {message && (
            <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800'>{message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
