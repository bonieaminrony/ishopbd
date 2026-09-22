import { build } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

async function analyze() {
  await build({
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'chunk-reporter',
        generateBundle(options, bundle) {
          console.log('\n--- CHUNK ANALYSIS ---');
          for (const [fileName, chunkInfo] of Object.entries(bundle)) {
            if (chunkInfo.type === 'chunk') {
              const modules = Object.keys(chunkInfo.modules);
              console.log(`\n📦 Chunk: ${fileName} (${(chunkInfo.code.length / 1024).toFixed(2)} KB raw, ${modules.length} modules)`);
              if (fileName.includes('index-') || fileName.includes('ShopList')) {
                console.log('  Top modules in this chunk:');
                const sorted = modules.map(m => ({ id: m, size: chunkInfo.modules[m].renderedLength }))
                  .sort((a, b) => b.size - a.size);
                sorted.slice(0, 15).forEach(m => {
                  console.log(`    - ${m.id} : ${(m.size / 1024).toFixed(2)} KB`);
                });
              }
            }
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
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
    }
  });
}

analyze().catch(console.error);
