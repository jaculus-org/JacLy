import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { githubPagesSetup } from './src/vite/vite-plugin-github-pages-setup';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    githubPagesSetup(),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vite-plugin-node-polyfills/shims/buffer': 'buffer',
    },
  },
  build: {
    rollupOptions: {
      external: ['vite-plugin-node-polyfills/shims/buffer'],
    },
  },
});
