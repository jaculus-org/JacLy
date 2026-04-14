import path from 'node:path';
import { defineConfig } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    libInjectCss(),
    dts({
      tsconfigPath: path.resolve(__dirname, './tsconfig.json'),
      outDir: 'dist',
      entryRoot: 'src',
    }),
  ],
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
        'schema/index': path.resolve(__dirname, './src/schema/index.ts'),
        'blocks/index': path.resolve(__dirname, './src/blocks/index.ts'),
        'toolbox/index': path.resolve(__dirname, './src/toolbox/index.ts'),
        'codegen/index': path.resolve(__dirname, './src/codegen/index.ts'),
        'workspace/index': path.resolve(__dirname, './src/workspace/index.ts'),
        'engine/index': path.resolve(__dirname, './src/engine/index.ts'),
        'utils/index': path.resolve(__dirname, './src/utils/index.ts'),
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
