import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { githubPagesSetup } from './src/vite/vite-plugin-github-pages-setup';
import { buildInfoPlugin } from './src/vite/vite-plugin-build-info';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      // Use cookie/localStorage for locale - URL stays the same regardless of language
      strategy: ['cookie', 'localStorage', 'preferredLanguage', 'baseLocale'],
    }),
    githubPagesSetup(),
    buildInfoPlugin(),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5445,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    port: 5445,
    strictPort: true,
  },
});
