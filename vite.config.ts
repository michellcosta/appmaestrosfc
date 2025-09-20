import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync } from "fs";
import type { ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "http";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
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
    // Plugin para copiar sw.js
    {
      name: 'copy-sw',
      writeBundle() {
        try {
          copyFileSync('public/sw.js', 'dist/sw.js');
          console.log('✅ Service Worker copiado para dist/');
        } catch (error) {
          console.error('❌ Erro ao copiar Service Worker:', error);
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
