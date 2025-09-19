import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/auth/FixedAuthProvider';

export default function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();

  const handleLogin = async () => {
    if (!email || !name) {
      alert('Preencha todos os campos');
      return;
    }

    setLoading(true);
    
    // Simula login como owner
    const mockUser = {
      id: 'owner-' + Date.now(),
      email: email,
      name: name,
      role: 'owner' as const
    };

    // Simula o setUser do AuthProvider
    if (setUser) {
      setUser(mockUser);
    }
    
    setLoading(false);
    alert('Login realizado com sucesso! Você é o Owner do sistema.');
  };

  if (user) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-semibold">Já logado!</h1>
        <Card>
          <CardContent className="p-4">
            <p>Bem-vindo, {user.name}!</p>
            <p>Role: {user.role}</p>
            <p>Email: {user.email}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Login Temporário</h1>
      <p className="text-sm text-zinc-500">
        Use este login temporário enquanto configuramos o Google OAuth
      </p>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          
          <Button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Entrando...' : 'Entrar como Owner'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
