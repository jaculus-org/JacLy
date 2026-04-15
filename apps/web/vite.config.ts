import path from 'node:path';
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { buildInfoPlugin } from './src/app/vite/vite-plugin-build-info';
import { githubPagesSetup } from './src/app/vite/vite-plugin-github-pages-setup';

const routePrefix = process.env.VITE_ROUTE_PREFIX || '';
// const lightBackgroundColor = 'oklch(0.97 0.01 250)';
// const darkBackgroundColor = 'oklch(0.15 0.05 260)';

export default defineConfig({
  base: routePrefix ? `/${routePrefix}/` : '/',
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    include: ['vscode-textmate', 'vscode-oniguruma'],
    esbuildOptions: {
      plugins: [importMetaUrlPlugin],
    },
  },
  plugins: [
    {
      name: 'vscode-css-inline',
      enforce: 'pre' as const,
      async resolveId(source: string, importer: string | undefined, options: object) {
        const resolved = await this.resolve(source, importer, {
          ...(options as object),
          skipSelf: true,
        });
        if (resolved?.id.match(/node_modules\/@codingame\/monaco-vscode.*\.css$/)) {
          return { ...resolved, id: `${resolved.id}?inline` };
        }
      },
    },
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
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifestFilename: 'favicon/site.webmanifest',
    //   includeAssets: [
    //     'favicon/favicon.ico',
    //     'favicon/favicon.svg',
    //     'favicon/favicon-96x96.png',
    //     'favicon/apple-touch-icon.png',
    //   ],
    //   manifest: {
    //     id: '/',
    //     name: 'JacLy App',
    //     short_name: 'JacLy',
    //     description: 'Blockly interface for Jaculus',
    //     start_url: '/',
    //     scope: '/',
    //     display: 'standalone',
    //     background_color: lightBackgroundColor,
    //     theme_color: darkBackgroundColor,
    //     icons: [
    //       {
    //         src: '/favicon/web-app-manifest-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'any maskable',
    //       },
    //       {
    //         src: '/favicon/web-app-manifest-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable',
    //       },
    //     ],
    //   },
    //   workbox: {
    //     maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
    //   },
    // }),
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
