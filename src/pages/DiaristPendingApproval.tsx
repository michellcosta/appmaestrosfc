import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DiaristRequestStatus } from '@/types';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  UserCheck
} from 'lucide-react';

export default function DiaristPendingApproval() {
  // Estado do diarista
  const diaristStatus: DiaristRequestStatus = 'pending'; // Simulando estado pendente
  
  // Dados mockados da próxima partida
  const nextMatch = {
    id: '1',
    date: '2024-01-20',
    time: '09:00',
    location: 'Campo do Maestros',
    confirmedPlayers: 18,
    maxPlayers: 22,
    status: 'open'
  };

  const renderStatusCard = () => {
    switch (diaristStatus) {
      case 'pending':
        return (
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-orange-800 dark:text-orange-300">Aguardando Aprovação</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-orange-700 dark:text-orange-300">
                Seu perfil está sendo analisado pelos administradores. 
                Você receberá uma notificação assim que for aprovado.
              </p>
              <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Enquanto isso, você pode:</h4>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <li className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Visualizar informações das partidas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Ver lista de jogadores confirmados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Consultar locais e horários</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );
      
      case ('approved' as DiaristRequestStatus):
        return (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-green-800 dark:text-green-300">Perfil Aprovado!</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-green-700 dark:text-green-300">
                Parabéns! Seu perfil foi aprovado. Agora você pode solicitar participação nas partidas.
              </p>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                <UserCheck className="w-3 h-3 mr-1" />
                Diarista Aprovado
              </Badge>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  const renderMatchCard = () => (
    <Card className="dark:bg-zinc-800 dark:border-zinc-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 dark:text-zinc-100">
            <Calendar className="w-5 h-5 dark:text-zinc-300" />
            <span>Próxima Partida</span>
          </CardTitle>
          <Badge variant={nextMatch.status === 'open' ? 'default' : 'secondary'}>
            {nextMatch.status === 'open' ? 'Aberta' : 'Fechada'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data e Hora */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium dark:text-zinc-100">Sábado, 20 de Janeiro</p>
            <p className="text-sm text-gray-600 dark:text-zinc-400">09:00</p>
          </div>
        </div>

        {/* Local */}
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium dark:text-zinc-100">{nextMatch.location}</p>
            <p className="text-sm text-gray-600 dark:text-zinc-400">Local da partida</p>
          </div>
        </div>

        {/* Jogadores */}
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium dark:text-zinc-100">{nextMatch.confirmedPlayers}/{nextMatch.maxPlayers} jogadores</p>
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              {nextMatch.maxPlayers - nextMatch.confirmedPlayers} vagas disponíveis
            </p>
          </div>
        </div>

        {/* Botão de Ação baseado no status */}
        <div className="pt-2">
          {diaristStatus === ('pending' as DiaristRequestStatus) && (
            <Button disabled className="w-full" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Aguardando Aprovação
            </Button>
          )}
          
          {diaristStatus === ('approved' as DiaristRequestStatus) && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <UserCheck className="w-4 h-4 mr-2" />
              Pedir para Participar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderInfoCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <span>Como Funciona</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
              <span className="text-xs font-bold text-blue-600 px-1">1</span>
            </div>
            <div>
              <p className="font-medium">Aprovação</p>
              <p className="text-sm text-gray-600">Aguarde a aprovação do seu perfil pelos administradores</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
              <span className="text-xs font-bold text-blue-600 px-1">2</span>
            </div>
            <div>
              <p className="font-medium">Solicitar Vaga</p>
              <p className="text-sm text-gray-600">Clique em "Pedir para Participar" na partida desejada</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
              <span className="text-xs font-bold text-blue-600 px-1">3</span>
            </div>
            <div>
              <p className="font-medium">Pagamento</p>
              <p className="text-sm text-gray-600">Após aprovação, realize o pagamento via PIX</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
              <span className="text-xs font-bold text-blue-600 px-1">4</span>
            </div>
            <div>
              <p className="font-medium">Confirmação</p>
              <p className="text-sm text-gray-600">Sua vaga será confirmada automaticamente após o pagamento</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Maestros FC</h1>
          <p className="text-gray-600 dark:text-zinc-400">Bem-vindo, Diarista!</p>
        </div>

        {/* Status Card */}
        {renderStatusCard()}

        {/* Match Card */}
        {renderMatchCard()}

        {/* Info Card */}
        {renderInfoCard()}
      </div>
    </div>
  );
}