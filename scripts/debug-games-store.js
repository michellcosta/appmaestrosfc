#!/usr/bin/env node

/**
 * Script para debug do gamesStore
 * Verifica e limpa dados corrompidos no localStorage
 */

console.log('🔍 DEBUG DO GAMES STORE');
console.log('========================');

// Simular localStorage do browser
const localStorage = {
    data: {},
    getItem: function (key) {
        return this.data[key] || null;
    },
    setItem: function (key, value) {
        this.data[key] = value;
    },
    removeItem: function (key) {
        delete this.data[key];
    },
    clear: function () {
        this.data = {};
    }
};

// Carregar dados do localStorage simulado
try {
    const gamesData = localStorage.getItem('maestrosfc_games');
    console.log('📦 Dados do localStorage:', gamesData ? 'Encontrados' : 'Não encontrados');

    if (gamesData) {
        const parsed = JSON.parse(gamesData);
        console.log('📊 Estrutura dos dados:', Object.keys(parsed));

        if (parsed.state && parsed.state.matches) {
            console.log('🎮 Partidas encontradas:', parsed.state.matches.length);

            parsed.state.matches.forEach((match, index) => {
                console.log(`\nPartida ${index}:`, {
                    id: match.id,
                    date: match.date,
                    dateType: typeof match.date,
                    time: match.time,
                    location: match.location,
                    status: match.status,
                    valid: match.date && typeof match.date === 'string' && match.date.includes('/')
                });

                // Identificar partidas com problemas
                if (!match.date || typeof match.date !== 'string' || !match.date.includes('/')) {
                    console.warn(`⚠️  Partida ${index} tem data inválida:`, match.date);
                }
            });

            // Filtrar partidas válidas
            const validMatches = parsed.state.matches.filter(match => {
                return match.date &&
                    typeof match.date === 'string' &&
                    match.date.includes('/') &&
                    match.date.split('/').length === 3;
            });

            console.log(`\n✅ Partidas válidas: ${validMatches.length}`);
            console.log(`❌ Partidas inválidas: ${parsed.state.matches.length - validMatches.length}`);

            if (validMatches.length !== parsed.state.matches.length) {
                console.log('\n🧹 Limpando dados corrompidos...');

                // Salvar apenas partidas válidas
                const cleanData = {
                    ...parsed,
                    state: {
                        ...parsed.state,
                        matches: validMatches
                    }
                };

                localStorage.setItem('maestrosfc_games', JSON.stringify(cleanData));
                console.log('✅ Dados limpos salvos!');
            }
        }
    }
} catch (error) {
    console.error('❌ Erro ao processar dados:', error.message);
}

console.log('\n📋 INSTRUÇÕES PARA O USUÁRIO:');
console.log('1. Abra o console do navegador (F12)');
console.log('2. Cole e execute este comando:');
console.log(`
// Limpar dados corrompidos do gamesStore
const gamesData = localStorage.getItem('maestrosfc_games');
if (gamesData) {
  const parsed = JSON.parse(gamesData);
  if (parsed.state && parsed.state.matches) {
    const validMatches = parsed.state.matches.filter(match => {
      return match.date && 
             typeof match.date === 'string' && 
             match.date.includes('/') &&
             match.date.split('/').length === 3;
    });
    
    const cleanData = {
      ...parsed,
      state: {
        ...parsed.state,
        matches: validMatches
      }
    };
    
    localStorage.setItem('maestrosfc_games', JSON.stringify(cleanData));
    console.log('✅ Dados limpos! Recarregue a página.');
  }
}
`);

console.log('\n🎯 PROBLEMA IDENTIFICADO:');
console.log('- Algumas partidas têm datas em formato inválido');
console.log('- O código agora valida datas antes de processar');
console.log('- Partidas inválidas são filtradas automaticamente');
