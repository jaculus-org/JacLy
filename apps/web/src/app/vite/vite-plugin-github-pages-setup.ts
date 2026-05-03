import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

export function githubPagesSetup(): Plugin {
  let config: ResolvedConfig;

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

      const distDir = path.resolve(root, 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      const buildInfoPath = path.resolve(distDir, 'build-info.json');
      const buildInfoRaw = fs.existsSync(buildInfoPath)
        ? fs.readFileSync(buildInfoPath, 'utf8')
        : JSON.stringify({ buildTime: 'unknown', commitHash: 'unknown' });

      rewriteHtmlShell(path.resolve(distDir, 'index.html'), config.base, buildInfoRaw);
      rewriteHtmlShell(path.resolve(distDir, 'popout.html'), config.base, buildInfoRaw);

      // Create 404.html for GitHub Pages SPA routing after index.html is rewritten.
      const indexHtml = path.resolve(distDir, 'index.html');
      const notFoundHtml = path.resolve(distDir, '404.html');
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFoundHtml);
      }

      // Create .nojekyll file to prevent Jekyll processing
      const nojekyllFile = path.resolve(distDir, '.nojekyll');
      fs.writeFileSync(nojekyllFile, '');
    },
  };
}

function rewriteHtmlShell(htmlPath: string, base: string, buildInfoRaw: string): void {
  if (!fs.existsSync(htmlPath)) return;

  const html = fs.readFileSync(htmlPath, 'utf8');
  const stylesheetHrefs = Array.from(
    html.matchAll(/<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g),
    (match) => match[1],
  );
  const moduleScriptSrcs = Array.from(
    html.matchAll(/<script\s+type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g),
    (match) => match[1],
  );

  if (stylesheetHrefs.length === 0 && moduleScriptSrcs.length === 0) return;

  const strippedHtml = html
    .replace(/\s*<link\s+rel="stylesheet"[^>]*href="[^"]+"[^>]*>\s*/g, '\n')
    .replace(/\s*<script\s+type="module"[^>]*src="[^"]+"[^>]*><\/script>\s*/g, '\n');

  const bootstrapScript = createBootstrapScript({
    base,
    buildInfoRaw,
    moduleScriptSrcs,
    stylesheetHrefs,
  });

  const rewrittenHtml = strippedHtml.replace('</head>', `${bootstrapScript}\n  </head>`);
  fs.writeFileSync(htmlPath, rewrittenHtml);
}

function createBootstrapScript({
  base,
  buildInfoRaw,
  moduleScriptSrcs,
  stylesheetHrefs,
}: {
  base: string;
  buildInfoRaw: string;
  moduleScriptSrcs: string[];
  stylesheetHrefs: string[];
}): string {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  return `    <script>
      (() => {
        const currentBuild = ${buildInfoRaw};
        const appBase = ${JSON.stringify(normalizedBase)};
        const stylesheets = ${JSON.stringify(stylesheetHrefs)};
        const moduleScripts = ${JSON.stringify(moduleScriptSrcs)};

        const appendStylesheet = (href) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.crossOrigin = '';
          link.href = href;
          document.head.appendChild(link);
        };

        const appendModuleScript = (src) => {
          const script = document.createElement('script');
          script.type = 'module';
          script.crossOrigin = '';
          script.src = src;
          document.head.appendChild(script);
        };

        const loadAssets = () => {
          for (const href of stylesheets) appendStylesheet(href);
          for (const src of moduleScripts) appendModuleScript(src);
        };

        const refreshToLatestShell = (latestBuild) => {
          const url = new URL(window.location.href);
          url.searchParams.set('__jacly_build', latestBuild.commitHash || latestBuild.buildTime || Date.now().toString());
          window.location.replace(url.toString());
        };

        fetch(\`\${appBase}build-info.json?ts=\${Date.now()}\`, { cache: 'no-store' })
          .then((response) => response.ok ? response.json() : Promise.reject(new Error(\`HTTP \${response.status}\`)))
          .then((latestBuild) => {
            const isCurrent =
              latestBuild.commitHash === currentBuild.commitHash &&
              latestBuild.buildTime === currentBuild.buildTime;

            if (isCurrent) {
              loadAssets();
              return;
            }

            refreshToLatestShell(latestBuild);
          })
          .catch((error) => {
            console.warn('Failed to verify latest app shell before boot:', error);
            loadAssets();
          });
      })();
    </script>`;
}
