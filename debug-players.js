// Script para debug dos jogadores no localStorage
console.log('=== DEBUG JOGADORES ===');

// Verificar todas as chaves do localStorage
const allKeys = Object.keys(localStorage);
console.log('Todas as chaves do localStorage:', allKeys);

// Verificar chaves relacionadas a jogadores
const playerKeys = allKeys.filter(key => 
  key.includes('player') || 
  key.includes('convex') || 
  key.includes('offline') ||
  key.includes('local')
);

console.log('Chaves relacionadas a jogadores:', playerKeys);

// Verificar conteúdo de cada chave
playerKeys.forEach(key => {
  try {
    const data = localStorage.getItem(key);
    const parsed = JSON.parse(data);
    console.log(`\n--- ${key} ---`);
    console.log('Tipo:', typeof parsed);
    console.log('É array?', Array.isArray(parsed));
    console.log('Conteúdo:', parsed);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log('Primeiro item:', parsed[0]);
      console.log('Quantidade de jogadores:', parsed.length);
    }
  } catch (e) {
    console.log(`Erro ao parsear ${key}:`, e.message);
  }
});

console.log('=== FIM DEBUG ===');
