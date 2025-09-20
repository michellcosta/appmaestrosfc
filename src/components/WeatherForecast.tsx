import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Thermometer, Droplets, Eye } from 'lucide-react';
import { weatherService, type WeatherData } from '@/services/weatherService';

interface WeatherForecastProps {
  date: string;
  location: string;
  className?: string;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ date, location, className = '' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para obter ícone baseado na condição
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'snowy':
        return <CloudSnow className="w-6 h-6 text-blue-300" />;
      case 'windy':
        return <Wind className="w-6 h-6 text-gray-600" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  // Função para determinar a cor do badge baseada na temperatura
  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (temp >= 25) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    if (temp >= 20) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (temp >= 15) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  // Função para obter dados meteorológicos usando o serviço
  const fetchWeatherData = async (targetDate: string, targetLocation: string) => {
    try {
      setLoading(true);
      setError(null);

      // Usar o serviço de previsão do tempo
      const weatherData = await weatherService.getWeatherForecast(targetDate, targetLocation);
      setWeather(weatherData);
    } catch (err) {
      setError('Erro ao carregar previsão do tempo');
      console.error('Erro ao buscar dados meteorológicos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date && location) {
      fetchWeatherData(date, location);
    }
  }, [date, location]);

  if (loading) {
    return (
      <Card className={`rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Previsão do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className={`rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Previsão do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-zinc-500">{error || 'Dados não disponíveis'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          Previsão do Tempo
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Temperatura e condição principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{weather.temperature}°C</span>
                <Badge className={getTemperatureColor(weather.temperature)}>
                  {weather.temperature >= 25 ? 'Quente' : weather.temperature >= 15 ? 'Agradável' : 'Fresco'}
                </Badge>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{weather.description}</p>
            </div>
          </div>
        </div>

        {/* Detalhes meteorológicos */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-zinc-600 dark:text-zinc-400">Umidade: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-zinc-600 dark:text-zinc-400">Vento: {weather.windSpeed} km/h</span>
          </div>
          {weather.precipitation > 0 && (
            <div className="flex items-center gap-2 col-span-2">
              <CloudRain className="w-4 h-4 text-blue-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Chuva: {weather.precipitation}%</span>
            </div>
          )}
        </div>

        {/* Recomendação para o jogo */}
        <div className="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {weather.condition === 'rainy' && weather.precipitation > 50 
              ? '⚠️ Risco de chuva - considere levar guarda-chuva'
              : weather.temperature >= 30 
              ? '☀️ Dia quente - hidrate-se bem'
              : weather.temperature <= 15
              ? '🧥 Dia fresco - vista-se adequadamente'
              : '✅ Condições ideais para o jogo'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;