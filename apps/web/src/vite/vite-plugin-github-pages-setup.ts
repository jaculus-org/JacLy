import path from 'path';
import fs from 'fs';
import type { Plugin } from 'vite';

export function githubPagesSetup(): Plugin {
  return {
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
      const distDir = path.resolve(__dirname, 'dist');
      const nojekyllFile = path.resolve(distDir, '.nojekyll');

      // Ensure dist directory exists
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      fs.writeFileSync(nojekyllFile, '');
    },
  };
}
