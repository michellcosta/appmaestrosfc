import React, { useState, useEffect } from 'react';
import { useAuth } from '@/auth/OfflineAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Key, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CheckinResult {
  success: boolean;
  method: string;
  checked_in_at: string;
  error?: string;
  accuracy?: number;
  distance?: number;
  max_distance?: number;
}

export default function CheckinPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [pin, setPin] = useState('');
  const [method, setMethod] = useState<'geo' | 'pin'>('geo');
  const [result, setResult] = useState<CheckinResult | null>(null);

  // Mock de dados da partida (em produção, viria de uma API)
  const matchData = {
    id: 'match-123',
    venue: {
      name: 'Campo do Maestros',
      address: 'Rua das Flores, 123',
      lat: -23.5505,
      lng: -46.6333,
      radius_m: 30
    }
  };

  useEffect(() => {
    // Solicitar permissão de localização
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Erro de localização',
            description: 'Não foi possível obter sua localização. Use o PIN como alternativa.',
            variant: 'destructive'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const handleGeolocationCheckin = async () => {
    if (!location || !user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/checkin_guard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        },
        body: JSON.stringify({
          match_id: matchData.id,
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          accuracy: location.coords.accuracy,
          device_id: navigator.userAgent
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast({
          title: 'Check-in realizado!',
          description: 'Você foi registrado na partida com sucesso.',
        });
      } else {
        toast({
          title: 'Check-in falhou',
          description: data.error || 'Não foi possível realizar o check-in.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao processar check-in. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinCheckin = async () => {
    if (!pin || !user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/checkin_guard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        },
        body: JSON.stringify({
          match_id: matchData.id,
          pin: pin,
          device_id: navigator.userAgent
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast({
          title: 'Check-in realizado!',
          description: 'PIN válido. Você foi registrado na partida.',
        });
      } else {
        toast({
          title: 'PIN inválido',
          description: 'O PIN fornecido não é válido ou expirou.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error checking in with PIN:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao processar check-in. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocationStatus = () => {
    if (!location) return { status: 'loading', text: 'Obtendo localização...' };
    
    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      matchData.venue.lat,
      matchData.venue.lng
    );

    if (distance <= matchData.venue.radius_m) {
      return { status: 'success', text: `Dentro do raio (${Math.round(distance)}m)` };
    } else {
      return { status: 'error', text: `Fora do raio (${Math.round(distance)}m)` };
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const locationStatus = getLocationStatus();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Check-in da Partida</h1>
          <p className="text-gray-600">{matchData.venue.name}</p>
          <p className="text-sm text-gray-500">{matchData.venue.address}</p>
        </div>

        {/* Método de check-in */}
        <Card>
          <CardHeader>
            <CardTitle>Escolha o método</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={method === 'geo' ? 'default' : 'outline'}
                onClick={() => setMethod('geo')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <MapPin className="w-6 h-6 mb-2" />
                <span className="text-sm">GPS</span>
              </Button>
              
              <Button
                variant={method === 'pin' ? 'default' : 'outline'}
                onClick={() => setMethod('pin')}
                className="h-16 flex flex-col items-center justify-center"
              >
                <Key className="w-6 h-6 mb-2" />
                <span className="text-sm">PIN</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Check-in por GPS */}
        {method === 'geo' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Check-in por GPS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {location ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm">Status da localização:</span>
                    <Badge 
                      variant={locationStatus.status === 'success' ? 'default' : 'destructive'}
                    >
                      {locationStatus.text}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Precisão: {Math.round(location.coords.accuracy)}m</p>
                    <p>Raio permitido: {matchData.venue.radius_m}m</p>
                  </div>
                  
                  <Button
                    onClick={handleGeolocationCheckin}
                    disabled={loading || locationStatus.status !== 'success'}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Confirmar Check-in'
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                  <p>Obtendo sua localização...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Check-in por PIN */}
        {method === 'pin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Check-in por PIN
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pin">Código PIN</Label>
                <Input
                  id="pin"
                  type="text"
                  placeholder="Digite o PIN da partida"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O PIN é fornecido pelo organizador da partida
                </p>
              </div>
              
              <Button
                onClick={handlePinCheckin}
                disabled={loading || !pin}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Confirmar Check-in'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Resultado */}
        {result && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                {result.success ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div className="text-center">
                      <p className="font-medium text-green-600">Check-in realizado!</p>
                      <p className="text-sm text-gray-600">
                        Método: {result.method === 'geo' ? 'GPS' : 'PIN'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(result.checked_in_at).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div className="text-center">
                      <p className="font-medium text-red-600">Check-in falhou</p>
                      <p className="text-sm text-gray-600">{result.error}</p>
                      {result.distance && (
                        <p className="text-xs text-gray-500">
                          Distância: {Math.round(result.distance)}m (máx: {result.max_distance}m)
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
