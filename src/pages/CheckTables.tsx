import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function CheckTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const checkTables = async () => {
    setLoading(true);
    setResult('');

    try {
      // Verificar tabelas existentes
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (error) {
        setResult(`❌ Erro ao verificar tabelas: ${error.message}`);
        return;
      }

      setTables(data || []);
      setResult(`✅ Encontradas ${data?.length || 0} tabelas`);

    } catch (error: any) {
      setResult(`❌ Erro: ${error.message}`);
    }

    setLoading(false);
  };

  const createTables = async () => {
    setLoading(true);
    setResult('');

    try {
      // SQL para criar as tabelas necessárias
      const createUsersSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id uuid primary key default gen_random_uuid(),
          auth_id uuid,
          name text not null,
          email text,
          role text check (role in ('owner','admin','aux','mensalista','diarista')) not null default 'diarista',
          aprovado boolean default false,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );
      `;

      const createProfilesSQL = `
        CREATE TABLE IF NOT EXISTS profiles (
          id uuid primary key,
          email text not null unique,
          role text not null default 'player' check (role in ('owner','admin','aux','player')),
          membership text check (membership in ('mensalista','diarista')),
          position text check (position in ('Goleiro','Zagueiro','Meia','Atacante')),
          stars int2 check (stars between 0 and 10),
          notifications_enabled boolean not null default true,
          updated_at timestamptz default now()
        );
      `;

      // Executar SQL via RPC (se disponível) ou mostrar para execução manual
      setResult(`
        📋 Execute este SQL no Supabase Dashboard → SQL Editor:

        ${createUsersSQL}

        ${createProfilesSQL}

        Depois teste novamente a criação do usuário.
      `);

    } catch (error: any) {
      setResult(`❌ Erro: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Verificar Tabelas do Supabase</h1>
      <p className="text-sm text-zinc-500">
        Esta página verifica quais tabelas existem no seu banco de dados
      </p>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex space-x-2">
            <Button onClick={checkTables} disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar Tabelas'}
            </Button>
            <Button onClick={createTables} disabled={loading} variant="outline">
              {loading ? 'Criando...' : 'Mostrar SQL para Criar Tabelas'}
            </Button>
          </div>

          {tables.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tabelas Encontradas:</h3>
              <ul className="text-sm space-y-1">
                {tables.map((table, index) => (
                  <li key={index} className="bg-zinc-50 p-2 rounded">
                    {table.table_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result && (
            <div className={`p-3 rounded-lg ${
              result.includes('✅') ? 'bg-green-50 text-green-800' : 
              result.includes('❌') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
            }`}>
              <pre className="whitespace-pre-wrap text-xs">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
