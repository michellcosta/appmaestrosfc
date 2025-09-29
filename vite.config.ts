import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, readFileSync } from "fs";
import type { ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::", // IPv6 - permite acesso externo
    port: 5173,
    open: true, // Abre automaticamente o navegador
    strictPort: false, // Permite tentar outras portas se 5173 não estiver disponível
    hmr: {
      overlay: false // Desabilitar overlay de erro para evitar problemas
    }
  },
  build: {
    // Otimizações de build para produção
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : []
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks para melhor cache
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js', '@supabase/auth-helpers-react'],
          'vendor-pdf': ['jspdf', 'html2canvas']
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Otimizações de tamanho
    chunkSizeWarningLimit: 1000,
    sourcemap: mode !== 'production',
    // Otimizações de CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Middleware para simular API durante desenvolvimento
    {
      name: 'api-middleware',
      configureServer(server: ViteDevServer) {


        // Armazenamento em memória para dados
        let syncData: any = null;
        
        server.middlewares.use('/api/sync/data', (req: IncomingMessage, res: ServerResponse, next: () => void) => {
            console.log(`[SYNC API] ${req.method} ${req.url}`);
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            if (req.method === 'OPTIONS') {
              res.statusCode = 200;
              res.end();
              return;
            }
            
            if (req.method === 'GET') {
              console.log('[SYNC API] GET - Retornando dados:', syncData);
              res.statusCode = 200;
              res.end(JSON.stringify({ 
                success: true, 
                data: syncData ? {
                  matches: syncData.matches || [],
                  lastUpdated: syncData.lastUpdated || Date.now(),
                  updatedBy: syncData.updatedBy
                } : null
              }));
              return;
            }
            
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk: Buffer) => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const requestData = JSON.parse(body);
                  console.log('[SYNC API] POST - Recebendo dados:', requestData);
                  
                  let mergedMatches = requestData.matches || [];
                  
                  // Se já existem dados no servidor, fazer merge inteligente
                  if (syncData && syncData.matches && syncData.matches.length > 0) {
                    console.log('[SYNC API] POST - Fazendo merge com dados existentes');
                    
                    // Criar mapa dos dados do servidor por ID
                    const serverMatchesMap = new Map();
                    syncData.matches.forEach((match: any) => {
                      serverMatchesMap.set(match.id, match);
                    });
                    
                    // Fazer merge: usar dados mais recentes baseado em createdAt
                    const merged: any[] = [];
                    const processedIds = new Set();
                    
                    // Processar dados recebidos
                    (requestData.matches || []).forEach((newMatch: any) => {
                      const existingMatch = serverMatchesMap.get(newMatch.id);
                      if (existingMatch) {
                        // Se existe no servidor, usar o mais recente
                        if (newMatch.createdAt > existingMatch.createdAt) {
                          merged.push(newMatch);
                          console.log(`[SYNC API] Usando dados mais recentes para match ${newMatch.id}`);
                        } else {
                          merged.push(existingMatch);
                          console.log(`[SYNC API] Mantendo dados existentes para match ${existingMatch.id}`);
                        }
                      } else {
                        // Se não existe no servidor, adicionar novos dados
                        merged.push(newMatch);
                        console.log(`[SYNC API] Adicionando novo match ${newMatch.id}`);
                      }
                      processedIds.add(newMatch.id);
                    });
                    
                    // Adicionar dados do servidor que não estão nos dados recebidos
                    syncData.matches.forEach((serverMatch: any) => {
                      if (!processedIds.has(serverMatch.id)) {
                        merged.push(serverMatch);
                        console.log(`[SYNC API] Mantendo match existente ${serverMatch.id}`);
                      }
                    });
                    
                    mergedMatches = merged;
                  } else {
                    console.log('[SYNC API] POST - Primeiro sync, salvando dados diretamente');
                  }
                  
                  syncData = {
                    matches: mergedMatches,
                    lastUpdated: Date.now(),
                    updatedBy: requestData.userId
                  };
                  
                  console.log('[SYNC API] POST - Dados finais salvos:', syncData);
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true }));
                } catch (error) {
                  console.error('[SYNC API] POST - Erro:', error);
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
                }
              });
              return;
            }
            
            if (req.method === 'DELETE') {
              console.log('[SYNC API] DELETE - Limpando dados');
              syncData = null;
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
              return;
            }
            
            res.statusCode = 405;
            res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
          });
        }
      },

  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': 'import.meta.env',
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
