import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';

export default function CreateOwner() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const createOwner = async () => {
    if (!email || !name || !password) {
      setResult('❌ Preencha todos os campos');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      // MOCK TEMPORÁRIO - Supabase removido durante migração para Convex
      console.log('��� CreateOwner: Supabase temporariamente desabilitado');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock temporário
      const authData = { user: { id: 'mock-user-' + Date.now() } };
      const authError = null;
      const profileError = null;

      if (authError) {
        setResult(`❌ Erro no auth: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (authData.user) {
        setResult('✅ Usuário Owner criado com sucesso! (Mock)');
      }

    } catch (error: any) {
      setResult(`❌ Erro: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Criar Usuário Owner</h1>
      <p className="text-sm text-zinc-500">
        Esta página cria um usuário Owner (temporariamente desabilitado durante migração)
      </p>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
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

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
            />
          </div>

          <Button
            onClick={createOwner}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Criando...' : 'Criar Usuário Owner'}
          </Button>

          {result && (
            <div className={`p-3 rounded-lg ${result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
              {result}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Instruções:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Preencha seus dados acima</li>
            <li>Clique em "Criar Usuário Owner"</li>
            <li>Verifique seu email para confirmar a conta</li>
            <li>Faça login na página de Perfil</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
