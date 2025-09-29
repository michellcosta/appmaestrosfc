// ============================================
// Nexus Play - LIMPAR CACHE DO NAVEGADOR
// Execute este código no console do navegador
// ============================================

console.log('🧹 Limpando cache do navegador...');

// 1. Limpar localStorage
localStorage.clear();
console.log('✅ localStorage limpo');

// 2. Limpar sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage limpo');

// 3. Limpar cache do service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✅ Service Worker removido');
    }
  });
}

// 4. Recarregar a página
console.log('🔄 Recarregando página...');
window.location.reload(true);

// ============================================
// FIM - Cache limpo
// ============================================
