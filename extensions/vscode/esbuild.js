const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

// Resolve the *real* (non-symlink) directory for the single React copy
// that every import should use. This avoids the "Invalid hook call"
// error caused by pnpm linking separate copies for different peers.
const reactDir = fs.realpathSync(path.resolve(__dirname, 'node_modules/react'));
const reactDomDir = fs.realpathSync(
  path.resolve(__dirname, 'node_modules/react-dom')
);

/**
 * esbuild plugin that forces every `react` / `react-dom` import to resolve
 * to the single copy living in *this* extension's node_modules, regardless
 * of where the importing file lives in the pnpm store.
 * @type {import('esbuild').Plugin}
 */
const reactDedupePlugin = {
  name: 'react-dedupe',
  setup(build) {
    // Match bare `react`, `react/…`, `react-dom`, `react-dom/…`
    build.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, args => {
      // Let the first resolution from our own code go through normally
      // so that the alias picks the correct copy. For everything else
      // (i.e. transitive deps living deep in the pnpm store) we
      // re-resolve relative to *this* extension's node_modules.
      const importPath = args.path;
      if (importPath === 'react' || importPath.startsWith('react/')) {
        return {
          path: require.resolve(importPath, {
            paths: [path.dirname(reactDir)],
          }),
        };
      }
      if (importPath === 'react-dom' || importPath.startsWith('react-dom/')) {
        return {
          path: require.resolve(importPath, {
            paths: [path.dirname(reactDomDir)],
          }),
        };
      }
    });
  },
};

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd(result => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(
          `    ${location.file}:${location.line}:${location.column}:`
        );
      });
      console.log('[watch] build finished');
    });
  },
};

async function buildExtension() {
  return esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: [esbuildProblemMatcherPlugin],
  });
}

async function buildWebview() {
  return esbuild.context({
    entryPoints: ['src/webview/main.tsx'],
    bundle: true,
    format: 'esm',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'browser',
    outfile: 'dist/webview.js',
    loader: { '.css': 'css' },
    logLevel: 'silent',
    plugins: [reactDedupePlugin, esbuildProblemMatcherPlugin],
  });
}

async function main() {
  const extensionCtx = await buildExtension();
  const webviewCtx = await buildWebview();

  if (watch) {
    await Promise.all([extensionCtx.watch(), webviewCtx.watch()]);
  } else {
    await Promise.all([extensionCtx.rebuild(), webviewCtx.rebuild()]);
    await Promise.all([extensionCtx.dispose(), webviewCtx.dispose()]);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
