import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/appmaestrosfc/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
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
