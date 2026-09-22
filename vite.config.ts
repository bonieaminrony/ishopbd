import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/browser-image-compression') || id.includes('node_modules/html-to-image')) {
              return 'heavy-tools';
            }
            if (id.includes('node_modules/firebase/storage')) {
              return 'firebase-storage';
            }
            if (id.includes('node_modules/firebase/')) {
              return 'firebase-vendor';
            }
            if (id.includes('node_modules/lucide-react/')) {
              return 'lucide-icons';
            }
            if (id.includes('node_modules/motion/') || id.includes('node_modules/react-hot-toast/')) {
              return 'ui-vendor';
            }
            if (id.includes('node_modules/axios') || id.includes('node_modules/react-helmet-async')) {
              return 'utils-vendor';
            }
          }
        }
      }
    },
    test: {

      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts'],
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/tests/',
          'dist/',
          'server.ts',
          'seed.mjs',
        ],
      },
    },
  };
});
