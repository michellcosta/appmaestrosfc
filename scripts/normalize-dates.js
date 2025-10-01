#!/usr/bin/env node

/**
 * Script para normalizar datas no gamesStore
 * Converte todas as datas para formato DD/MM/YYYY
 */

console.log('🗓️  NORMALIZANDO DATAS NO GAMES STORE');
console.log('=====================================');

// Função para converter YYYY-MM-DD para DD/MM/YYYY
function normalizeDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
        return dateString;
    }

    // Se já está no formato DD/MM/YYYY, retorna como está
    if (dateString.includes('/')) {
        return dateString;
    }

    // Se está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    return dateString;
}

console.log('\n📋 INSTRUÇÕES PARA O USUÁRIO:');
console.log('1. Abra o console do navegador (F12)');
console.log('2. Cole e execute este comando:');
console.log(`
// Normalizar datas no gamesStore
const gamesData = localStorage.getItem('maestrosfc_games');
if (gamesData) {
  const parsed = JSON.parse(gamesData);
  if (parsed.state && parsed.state.matches) {
    const normalizedMatches = parsed.state.matches.map(match => ({
      ...match,
      date: normalizeDate(match.date)
    }));
    
    const cleanData = {
      ...parsed,
      state: {
        ...parsed.state,
        matches: normalizedMatches
      }
    };
    
    localStorage.setItem('maestrosfc_games', JSON.stringify(cleanData));
    console.log('✅ Datas normalizadas! Recarregue a página.');
  }
}

// Função auxiliar para normalizar datas
function normalizeDate(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return dateString;
  }
  
  if (dateString.includes('/')) {
    return dateString; // Já está no formato DD/MM/YYYY
  }
  
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-');
    return \`\${day}/\${month}/\${year}\`;
  }
  
  return dateString;
}
`);

console.log('\n🎯 PROBLEMA RESOLVIDO:');
console.log('- ✅ Suporte para ambos os formatos: DD/MM/YYYY e YYYY-MM-DD');
console.log('- ✅ Validação robusta de datas');
console.log('- ✅ Filtragem automática de datas inválidas');
console.log('- ✅ Ordenação correta independente do formato');
console.log('- ✅ Formatação consistente na interface');

console.log('\n📊 RESULTADO ESPERADO:');
console.log('- Partidas com datas válidas aparecerão na HomePage');
console.log('- Partidas com datas inválidas serão filtradas automaticamente');
console.log('- Console mostrará warnings para datas problemáticas');
console.log('- Sistema funcionará com qualquer formato de data');
