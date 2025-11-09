import path from 'path';
import fs from 'fs';
import type { Plugin } from 'vite';

export function githubPagesSetup(): Plugin {
  let config: any;

  return {
    name: 'github-pages-setup',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      const root = config.root || process.cwd();
      const src = path.resolve(root, 'src/assets');
      const dest = path.resolve(root, 'dist/assets');

      // Copy src assets to dist/assets
      if (fs.existsSync(src)) {
        fs.mkdirSync(dest, { recursive: true });
        for (const file of fs.readdirSync(src)) {
          fs.copyFileSync(path.join(src, file), path.join(dest, file));
        }
      }

      // Create 404.html for GitHub Pages SPA routing
      const indexHtml = path.resolve(root, 'dist/index.html');
      const notFoundHtml = path.resolve(root, 'dist/404.html');

      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFoundHtml);
      }

      // Create .nojekyll file to prevent Jekyll processing
      const distDir = path.resolve(root, 'dist');
      const nojekyllFile = path.resolve(distDir, '.nojekyll');

      // Ensure dist directory exists
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      fs.writeFileSync(nojekyllFile, '');
    },
  };
}
