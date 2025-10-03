// Script para debugar integração entre dashboard e sorteio de times
console.log("=== DEBUG: Integração Dashboard → Sorteio de Times ===");

// Verificar se há jogadores salvos pelo ManagePlayersConvex
console.log("\n1. Verificando jogadores do dashboard (convex_players):");
const convexPlayers = localStorage.getItem('convex_players');
if (convexPlayers) {
  try {
    const players = JSON.parse(convexPlayers);
    console.log(`✅ Encontrados ${players.length} jogadores no dashboard`);
    console.log("Jogadores:", players);
    
    // Verificar estrutura dos jogadores
    if (players.length > 0) {
      const firstPlayer = players[0];
      console.log("\n📋 Estrutura do primeiro jogador:");
      console.log("- ID:", firstPlayer._id || firstPlayer.id);
      console.log("- Nome:", firstPlayer.name);
      console.log("- Email:", firstPlayer.email);
      console.log("- Role:", firstPlayer.role);
      console.log("- Aprovado:", firstPlayer.approved);
      console.log("- Campos disponíveis:", Object.keys(firstPlayer));
    }
  } catch (e) {
    console.error("❌ Erro ao parsear convex_players:", e);
  }
} else {
  console.log("❌ Nenhum jogador encontrado em convex_players");
}

// Verificar outras chaves que podem conter jogadores
console.log("\n2. Verificando outras chaves de jogadores:");
const possibleKeys = [
  'convex_players',
  'offline_players', 
  'local_players',
  'players-store',
  'nexus-play-players',
  'app_players'
];

possibleKeys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      let count = 0;
      if (Array.isArray(parsed)) {
        count = parsed.length;
      } else if (parsed.players && Array.isArray(parsed.players)) {
        count = parsed.players.length;
      } else if (parsed.state && parsed.state.players && Array.isArray(parsed.state.players)) {
        count = parsed.state.players.length;
      }
      console.log(`📁 ${key}: ${count} jogadores`);
    } catch (e) {
      console.log(`❌ ${key}: Erro ao parsear`);
    }
  } else {
    console.log(`📁 ${key}: vazio`);
  }
});

// Simular o que o playersStore faria
console.log("\n3. Simulando busca do playersStore:");
const offlinePlayers = [];
for (const key of possibleKeys) {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        offlinePlayers.push(...parsed);
        console.log(`✅ Adicionados ${parsed.length} jogadores de ${key}`);
      } else if (parsed.players && Array.isArray(parsed.players)) {
        offlinePlayers.push(...parsed.players);
        console.log(`✅ Adicionados ${parsed.players.length} jogadores de ${key}.players`);
      } else if (parsed.state && Array.isArray(parsed.state.players)) {
        offlinePlayers.push(...parsed.state.players);
        console.log(`✅ Adicionados ${parsed.state.players.length} jogadores de ${key}.state.players`);
      }
    } catch (e) {
      console.warn(`❌ Erro ao processar ${key}:`, e);
    }
  }
}

console.log(`\n📊 Total de jogadores que seriam usados no sorteio: ${offlinePlayers.length}`);

if (offlinePlayers.length > 0) {
  console.log("\n🎯 Jogadores válidos para sorteio:");
  offlinePlayers.forEach((player, index) => {
    console.log(`${index + 1}. ${player.name || 'Sem nome'} (${player.email || 'Sem email'})`);
  });
} else {
  console.log("\n❌ NENHUM JOGADOR ENCONTRADO para o sorteio!");
  console.log("💡 Solução: Cadastre jogadores no dashboard primeiro");
}

console.log("\n=== FIM DO DEBUG ===");
