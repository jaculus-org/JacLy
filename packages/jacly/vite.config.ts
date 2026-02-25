import path from 'node:path';
import { defineConfig } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [libInjectCss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: {
        'editor/index': path.resolve(__dirname, './src/editor/index.tsx'),
        'project/index': path.resolve(__dirname, './src/project/index.ts'),
        'blocks/index': path.resolve(__dirname, './src/blocks/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        /^fs($|\/)/,
        /^path($|\/)/,
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@jaculus\/device($|\/)/,
        /^@jaculus\/project($|\/)/,
        /^@kuband\/react-blockly($|\/)/,
        /^blockly($|\/)/,
        /^@blockly\//,
        /^lucide-react($|\/)/,
        /^lucide-static($|\/)/,
        /^zod($|\/)/,
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: assetInfo => {
          if (assetInfo.names?.some(name => name.endsWith('.css'))) {
            return 'editor/styles/toolbox[extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
