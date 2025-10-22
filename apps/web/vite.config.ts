import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { intlayer } from 'vite-intlayer';
import fs from 'fs';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    intlayer(),
    tailwindcss(),
    {
      name: 'github-pages-setup',
      apply: 'build',
      closeBundle() {
        const src = path.resolve(__dirname, 'src/assets');
        const dest = path.resolve(__dirname, 'dist/assets');

        // Copy src assets to dist/assets
        if (fs.existsSync(src)) {
          fs.mkdirSync(dest, { recursive: true });
          for (const file of fs.readdirSync(src)) {
            fs.copyFileSync(path.join(src, file), path.join(dest, file));
          }
        }

        // Create 404.html for GitHub Pages SPA routing
        const indexHtml = path.resolve(__dirname, 'dist/index.html');
        const notFoundHtml = path.resolve(__dirname, 'dist/404.html');

        if (fs.existsSync(indexHtml)) {
          fs.copyFileSync(indexHtml, notFoundHtml);
        }

        // Create .nojekyll file to prevent Jekyll processing
        const nojekyllFile = path.resolve(__dirname, 'dist/.nojekyll');
        fs.writeFileSync(nojekyllFile, '');
      },
    },
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
