import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { componentTagger } from 'lovable-tagger'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  logLevel: 'error', // Suppress warnings, only show errors
  server: {
    port: 8080,
    host: "::"
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
