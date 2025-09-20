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
    this.apiKey = import.meta.env.REACT_APP_OPENWEATHER_API_KEY || '';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  // Função para extrair coordenadas de um endereço (simplificada)
  private extractLocationFromAddress(address: string): { lat: number; lon: number } {
    // Para uma implementação real, você usaria um serviço de geocoding
    // Aqui estamos usando coordenadas do Rio de Janeiro como padrão
    const rioCoords = { lat: -22.9068, lon: -43.1729 };
    
    // Você pode expandir isso para detectar diferentes cidades baseado no endereço
    if (address.toLowerCase().includes('tijuca')) {
      return { lat: -22.9249, lon: -43.2386 };
    }
    if (address.toLowerCase().includes('centro')) {
      return { lat: -22.9035, lon: -43.2096 };
    }
    
    return rioCoords;
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

  // Função principal para obter previsão do tempo
  async getWeatherForecast(date: string, location: string): Promise<WeatherData> {
    // Se não tiver API key, usar dados simulados
    if (!this.apiKey) {
      return this.getSimulatedWeather(date, location);
    }

    try {
      const coords = this.extractLocationFromAddress(location);
      const targetDate = new Date(date);
      const today = new Date();
      
      // Se a data for hoje ou amanhã, usar current weather
      // Para datas futuras, usar forecast (requer endpoint diferente)
      const daysDiff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let url: string;
      if (daysDiff <= 1) {
        // Current weather
        url = `${this.baseUrl}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric&lang=pt_br`;
      } else if (daysDiff <= 5) {
        // 5-day forecast
        url = `${this.baseUrl}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric&lang=pt_br`;
      } else {
        // Para datas muito futuras, usar dados simulados
        return this.getSimulatedWeather(date, location);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherApiResponse = await response.json();
      
      // Se for forecast, pegar o item mais próximo da data desejada
      let weatherData: WeatherApiResponse;
      if (daysDiff > 1 && (data as any).list) {
        const forecastList = (data as any).list;
        // Simplificado: pegar o primeiro item do forecast
        weatherData = forecastList[0];
      } else {
        weatherData = data;
      }

      return {
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // converter m/s para km/h
        visibility: weatherData.visibility / 1000, // converter metros para km
        condition: this.mapWeatherCondition(weatherData.weather[0].main, weatherData.weather[0].icon),
        precipitation: weatherData.rain?.['1h'] ? Math.round(weatherData.rain['1h'] * 10) : 0
      };

    } catch (error) {
      console.warn('Erro ao buscar dados meteorológicos da API, usando dados simulados:', error);
      return this.getSimulatedWeather(date, location);
    }
  }

  // Função de fallback com dados simulados
  private getSimulatedWeather(date: string, location: string): WeatherData {
    const dateObj = new Date(date);
    const dayOfYear = Math.floor((dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Gerar dados pseudo-aleatórios baseados na data e localização
    const seed = dayOfYear + location.length;
    const temp = 18 + (seed % 15); // Temperatura entre 18-32°C
    const humidity = 40 + (seed % 40); // Umidade entre 40-80%
    const windSpeed = 5 + (seed % 20); // Vento entre 5-25 km/h
    const precipitation = seed % 30; // Precipitação 0-30%
    
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'windy'];
    const condition = conditions[seed % conditions.length];
    
    const descriptions = {
      sunny: 'Ensolarado',
      cloudy: 'Parcialmente nublado',
      rainy: 'Possibilidade de chuva',
      snowy: 'Neve',
      windy: 'Ventoso'
    };

    return {
      temperature: temp,
      description: descriptions[condition],
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