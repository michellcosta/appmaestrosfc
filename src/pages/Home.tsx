import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, CheckCircle, Navigation } from 'lucide-react';
import { LoadingCard, LoadingStats } from '@/components/ui/loading-card';
import { EmptyGames } from '@/components/ui/empty-state';
import { useToastHelpers } from '@/components/ui/toast';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const { success, error } = useToastHelpers();

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
      // Simular dados vazios para mostrar empty state
      setGames([]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className='p-4 sm:p-6 space-y-4 pb-20'>
        <div className="animate-fade-in-up">
          <h1 className='text-xl font-semibold'>Jogos</h1>
          <p className='text-sm text-zinc-500'>Próximos jogos do grupo</p>
        </div>
        <LoadingStats />
        <LoadingCard />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className='p-4 sm:p-6 space-y-4 pb-20'>
        <div className="animate-fade-in-up">
          <h1 className='text-xl font-semibold'>Jogos</h1>
          <p className='text-sm text-zinc-500'>Próximos jogos do grupo</p>
        </div>
        <EmptyGames />
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-4 pb-20'>
      <div className="animate-fade-in-up">
        <h1 className='text-xl font-semibold'>Jogos</h1>
        <p className='text-sm text-zinc-500'>Próximos jogos do grupo</p>
      </div>

      <Card className='rounded-2xl'>
        <CardContent className='p-6 space-y-4'>
          {/* Data e Hora */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2 text-zinc-600'>
                <Calendar className='w-4 h-4' />
                <span className='text-sm font-medium'>domingo, 14 de setembro</span>
              </div>
              <div className='flex items-center space-x-2 text-zinc-600'>
                <Clock className='w-4 h-4' />
                <span className='text-sm font-medium'>19:00</span>
              </div>
            </div>
            <Badge variant="secondary" className='bg-green-100 text-green-800'>
              <Users className='w-3 h-3 mr-1' />
              18/22 jogadores
            </Badge>
          </div>

          {/* Localização */}
          <div className='flex items-center space-x-2 text-zinc-600'>
            <MapPin className='w-4 h-4' />
            <div>
              <p className='font-medium'>Campo do Maestros</p>
              <p className='text-sm text-zinc-500'>Rua das Flores, 123</p>
            </div>
          </div>

          {/* Status do Check-in */}
          <div className='bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2'>
            <CheckCircle className='w-4 h-4 text-green-600' />
            <span className='text-sm text-green-800 font-medium'>Check-in realizado</span>
          </div>

          {/* Botões de Ação */}
          <div className='space-y-3'>
            <div className='flex space-x-2'>
              <Button className='flex-1 bg-green-600 hover:bg-green-700'>
                <CheckCircle className='w-4 h-4 mr-2' />
                Confirmado
              </Button>
              <Button variant="outline" className='flex-1'>
                <Navigation className='w-4 h-4 mr-2' />
                Abrir Rota
              </Button>
            </div>
            <Button className='w-full bg-orange-500 hover:bg-orange-600 text-white'>
              <Users className='w-4 h-4 mr-2' />
              Sortear Times
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Jogos */}
      <div className='space-y-3'>
        <h2 className='text-lg font-semibold'>Próximos Jogos</h2>
        <Card className='rounded-2xl'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>Sábado, 21 de setembro</p>
                <p className='text-sm text-zinc-500'>19:00 - Campo do Maestros</p>
              </div>
              <Badge variant="outline">12/22 jogadores</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Testes - Apenas para desenvolvimento */}
      <div className='space-y-3'>
        <h2 className='text-lg font-semibold'>🧪 Páginas de Teste</h2>
        <Card className='rounded-2xl'>
          <CardContent className='p-4 space-y-2'>
            <div className='grid grid-cols-2 gap-2'>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/test-page')}
              >
                Teste Simples
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/offline-auth')}
              >
                Login Offline
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/test-auth')}
              >
                Teste Auth
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/debug-auth')}
              >
                Debug Auth
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
