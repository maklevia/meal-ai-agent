import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

/**
 * Resolves 'src/...' imports to the src directory.
 * A custom plugin (not resolve.alias) because rolldown's CSS resolution
 * bypasses resolve.alias, while plugin resolveId handles all file types.
 */
function srcAlias(): Plugin {
  return {
    name: 'resolve-src-alias',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('src/')) {
        return `${srcDir}/${source.slice('src/'.length)}`;
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [srcAlias(), react()],
  server: {
    port: 5173,
    // Proxy API calls to the independent backend during development.
    // Frontend code just fetches `/api/...` — no cross-origin issues in dev.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
