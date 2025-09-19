import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
