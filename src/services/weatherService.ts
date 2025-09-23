// Serviço para integração com API de previsão do tempo
// Para usar uma API real, você precisará de uma chave da OpenWeatherMap ou similar

interface WeatherApiResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility: number;
  rain?: {
    '1h': number;
  };
}

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  precipitation: number;
}

class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Para usar uma API real, adicione sua chave aqui ou nas variáveis de ambiente
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  // Função para obter coordenadas geográficas usando geocoding
  private async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lon: number }> {
    try {
      // Usar Open-Meteo Geocoding API (gratuita)
      const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(address)}&count=1&language=pt&format=json`;
      
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.latitude,
          lon: result.longitude
        };
      }
      
      // Fallback para coordenadas do Rio de Janeiro se não encontrar
      return { lat: -22.9068, lon: -43.1729 };
    } catch (error) {
      console.error('Erro ao obter coordenadas:', error);
      // Fallback para coordenadas do Rio de Janeiro
      return { lat: -22.9068, lon: -43.1729 };
    }
  }

  // Mapear condições da API para nossos tipos
  private mapWeatherCondition(weatherMain: string, icon: string): WeatherData['condition'] {
    const mainCondition = weatherMain.toLowerCase();
    
    if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) {
      return 'rainy';
    }
    if (mainCondition.includes('snow')) {
      return 'snowy';
    }
    if (mainCondition.includes('cloud')) {
      return 'cloudy';
    }
    if (mainCondition.includes('clear')) {
      return 'sunny';
    }
    if (mainCondition.includes('wind') || icon.includes('50')) {
      return 'windy';
    }
    
    return 'sunny';
  }

  // Mapear códigos de tempo da Open-Meteo
  private mapOpenMeteoWeatherCode(code: number, time?: string): { condition: WeatherData['condition']; description: string } {
    const isNight = this.isNightTime(time);
    
    const codeMap: { [key: number]: { condition: WeatherData['condition']; description: string; nightCondition?: WeatherData['condition']; nightDescription?: string } } = {
      0: { condition: 'sunny', description: 'Céu limpo', nightCondition: 'sunny', nightDescription: 'Noite clara' },
      1: { condition: 'cloudy', description: 'Principalmente limpo', nightCondition: 'cloudy', nightDescription: 'Parcialmente nublado' },
      2: { condition: 'cloudy', description: 'Parcialmente nublado', nightCondition: 'cloudy', nightDescription: 'Parcialmente nublado' },
      3: { condition: 'cloudy', description: 'Nublado' },
      45: { condition: 'cloudy', description: 'Neblina' },
      48: { condition: 'cloudy', description: 'Neblina com geada' },
      51: { condition: 'rainy', description: 'Garoa leve' },
      53: { condition: 'rainy', description: 'Garoa moderada' },
      55: { condition: 'rainy', description: 'Garoa intensa' },
      56: { condition: 'rainy', description: 'Garoa gelada leve' },
      57: { condition: 'rainy', description: 'Garoa gelada intensa' },
      61: { condition: 'rainy', description: 'Chuva leve' },
      63: { condition: 'rainy', description: 'Chuva moderada' },
      65: { condition: 'rainy', description: 'Chuva intensa' },
      66: { condition: 'rainy', description: 'Chuva gelada leve' },
      67: { condition: 'rainy', description: 'Chuva gelada intensa' },
      71: { condition: 'snowy', description: 'Neve leve' },
      73: { condition: 'snowy', description: 'Neve moderada' },
      75: { condition: 'snowy', description: 'Neve intensa' },
      77: { condition: 'snowy', description: 'Granizo' },
      80: { condition: 'rainy', description: 'Pancadas de chuva leves' },
      81: { condition: 'rainy', description: 'Pancadas de chuva moderadas' },
      82: { condition: 'rainy', description: 'Pancadas de chuva intensas' },
      85: { condition: 'snowy', description: 'Pancadas de neve leves' },
      86: { condition: 'snowy', description: 'Pancadas de neve intensas' },
      95: { condition: 'rainy', description: 'Tempestade' },
      96: { condition: 'rainy', description: 'Tempestade com granizo leve' },
      99: { condition: 'rainy', description: 'Tempestade com granizo intenso' }
    };

    const weather = codeMap[code] || { condition: 'cloudy' as WeatherData['condition'], description: 'Nublado' };
    
    if (isNight && weather.nightCondition) {
      return {
        condition: weather.nightCondition,
        description: weather.nightDescription || weather.description
      };
    }
    
    return {
      condition: weather.condition,
      description: weather.description
    };
  }

  // Verificar se é período noturno
  private isNightTime(time?: string): boolean {
    if (!time) return false;
    
    const [hours] = time.split(':').map(Number);
    return hours >= 18 || hours < 6;
  }

  // Função principal para obter previsão do tempo
  async getWeatherForecast(date: string, location: string, time?: string): Promise<WeatherData> {
    try {
      // Obter coordenadas do endereço
      const coords = await this.getCoordinatesFromAddress(location);
      
      // Usar Open-Meteo API (gratuita, sem necessidade de API key)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America/Sao_Paulo&forecast_days=7`;
      
      const response = await fetch(weatherUrl);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Determinar se usar dados atuais ou de previsão baseado na data
      const targetDate = new Date(date);
      const today = new Date();
      const isToday = targetDate.toDateString() === today.toDateString();
      
      let weatherData;
      if (isToday && data.current) {
        // Usar dados atuais se for hoje
        weatherData = {
          temperature: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          weatherCode: data.current.weather_code
        };
      } else {
        // Usar previsão para data futura
        const dayIndex = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < data.daily.temperature_2m_max.length) {
          weatherData = {
            temperature: Math.round((data.daily.temperature_2m_max[dayIndex] + data.daily.temperature_2m_min[dayIndex]) / 2),
            humidity: 60, // Valor médio quando não disponível
            windSpeed: Math.round(data.hourly.wind_speed_10m[dayIndex * 24] || 10),
            weatherCode: data.daily.weather_code[dayIndex]
          };
        } else {
          // Fallback para dados simulados se data estiver fora do range
          return this.getSimulatedWeather(date, location, time);
        }
      }
      
      // Mapear código do tempo para nossa interface
      const { condition, description } = this.mapOpenMeteoWeatherCode(weatherData.weatherCode, time);
      
      return {
        temperature: weatherData.temperature,
        description: description,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        visibility: 10, // Valor padrão
        condition: condition,
        precipitation: weatherData.weatherCode >= 61 ? 20 : 0 // Estimativa baseada no código
      };
    } catch (error) {
      console.error('Erro ao buscar dados meteorológicos:', error);
      // Fallback para dados simulados em caso de erro
      return this.getSimulatedWeather(date, location, time);
    }
  }

  // Função de fallback com dados simulados
  private getSimulatedWeather(date: string, location: string, time?: string): WeatherData {
    const dateObj = new Date(date);
    const dayOfYear = Math.floor((dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / 86400000);
    const locationSeed = location.length;
    
    // Determinar se é dia ou noite baseado no horário
    let isNight = false;
    if (time) {
      const [hours] = time.split(':').map(Number);
      // Considerar noite entre 18:00 e 06:00
      isNight = hours >= 18 || hours < 6;
    }
     
     // Gerar dados pseudo-aleatórios baseados na data e localização
     const seed = dayOfYear + locationSeed;
     const temp = 18 + (seed % 15); // Temperatura entre 18-32°C
    const humidity = 40 + (seed % 40); // Umidade entre 40-80%
    const windSpeed = 5 + (seed % 20); // Vento entre 5-25 km/h
    const precipitation = seed % 30; // Precipitação 0-30%
    
    // Determinar condição baseada nos valores gerados e período do dia
     let condition: WeatherData['condition'];
     let description: string;
     
     if (precipitation > 20) {
       condition = 'rainy';
       description = 'Chuvoso';
     } else if (precipitation > 10) {
       condition = 'cloudy';
       description = isNight ? 'Nublado' : 'Nublado';
     } else if (humidity > 70) {
       condition = 'cloudy';
       description = isNight ? 'Parcialmente nublado' : 'Parcialmente nublado';
     } else {
       condition = isNight ? 'cloudy' : 'sunny';
       description = isNight ? 'Céu limpo' : 'Ensolarado';
     }
     
    return {
      temperature: temp,
      description: description,
      humidity,
      windSpeed,
      visibility: 10,
      condition,
      precipitation
    };
  }
}

export const weatherService = new WeatherService();
export type { WeatherData };