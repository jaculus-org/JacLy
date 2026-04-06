import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { githubPagesSetup } from './src/app/vite/vite-plugin-github-pages-setup';
import { buildInfoPlugin } from './src/app/vite/vite-plugin-build-info';

const lightBackgroundColor = 'oklch(0.97 0.01 250)';
const darkBackgroundColor = 'oklch(0.15 0.05 260)';

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
      outdir: './src/core/paraglide',
      strategy: ['cookie', 'localStorage', 'preferredLanguage', 'baseLocale'],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'favicon/site.webmanifest',
      includeAssets: [
        'favicon/favicon.ico',
        'favicon/favicon.svg',
        'favicon/favicon-96x96.png',
        'favicon/apple-touch-icon.png',
      ],
      manifest: {
        id: '/',
        name: 'JacLy App',
        short_name: 'JacLy',
        description: 'Blockly interface for Jaculus',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: lightBackgroundColor,
        theme_color: darkBackgroundColor,
        icons: [
          {
            src: '/favicon/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/favicon/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
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
