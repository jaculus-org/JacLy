const esbuild = require('esbuild');
const glob = require('glob');
const path = require('path');
const polyfill = require('@esbuild-plugins/node-globals-polyfill');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');
const web = process.argv.includes('--web');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        if (location) {
          console.error(
            `    ${location.file}:${location.line}:${location.column}:`
          );
        }
      });
      console.log('[watch] build finished');
    });
  },
};

/**
 * For web extension, all tests, including the test runner, need to be bundled into
 * a single module that has a exported `run` function .
 * This plugin bundles implements a virtual file extensionTests.ts that bundles all these together.
 * @type {import('esbuild').Plugin}
 */
const testBundlePlugin = {
  name: 'testBundlePlugin',
  setup(build) {
    build.onResolve({ filter: /[\/\\]extensionTests\.ts$/ }, (args) => {
      if (args.kind === 'entry-point') {
        return { path: path.resolve(args.path) };
      }
    });
    build.onLoad({ filter: /[\/\\]extensionTests\.ts$/ }, async (args) => {
      const testsRoot = path.join(__dirname, 'src/web/test/suite');
      const files = await glob.glob('*.test.{ts,tsx}', {
        cwd: testsRoot,
        posix: true,
      });
      return {
        contents:
          `export { run } from './mochaTestRunner.ts';` +
          files.map((f) => `import('./${f}');`).join(''),
        watchDirs: files.map((f) =>
          path.dirname(path.resolve(testsRoot, f))
        ),
        watchFiles: files.map((f) => path.resolve(testsRoot, f)),
      };
    });
  },
};

async function main() {
  if (web) {
    // Build for web extension
    const webExtCtx = await esbuild.context({
      entryPoints: [
        'src/web/extension.ts',
        'src/web/test/suite/extensionTests.ts',
      ],
      bundle: true,
      format: 'cjs',
      minify: production,
      sourcemap: !production,
      sourcesContent: false,
      platform: 'browser',
      outdir: 'dist/web',
      external: ['vscode'],
      logLevel: 'silent',
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      plugins: [
        polyfill.NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        testBundlePlugin,
        esbuildProblemMatcherPlugin /* add to the end of plugins array */,
      ],
    });

    // Build the webview (React) bundle
    const webviewCtx = await esbuild.context({
      entryPoints: ['src/webview/index.tsx'],
      bundle: true,
      format: 'esm',
      minify: production,
      sourcemap: !production,
      sourcesContent: false,
      platform: 'browser',
      outdir: 'dist/webview',
      logLevel: 'silent',
      define: {
        global: 'globalThis',
      },
      plugins: [esbuildProblemMatcherPlugin],
    });
    if (watch) {
      await Promise.all([webExtCtx.watch(), webviewCtx.watch()]);
    } else {
      await webExtCtx.rebuild();
      await webviewCtx.rebuild();
      await webExtCtx.dispose();
      await webviewCtx.dispose();
    }
  } else {
    // Build for desktop extension
    const desktopCtx = await esbuild.context({
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
      plugins: [
        /* add to the end of plugins array */
        esbuildProblemMatcherPlugin,
      ],
    });
    // Build the webview (React) bundle used by the desktop extension's WebviewPanel
    const webviewCtx = await esbuild.context({
      entryPoints: ['src/webview/index.tsx'],
      bundle: true,
      format: 'esm',
      minify: production,
      sourcemap: !production,
      sourcesContent: false,
      platform: 'browser',
      outdir: 'dist/webview',
      logLevel: 'silent',
      define: {
        global: 'globalThis',
      },
      plugins: [esbuildProblemMatcherPlugin],
    });
    if (watch) {
      await Promise.all([desktopCtx.watch(), webviewCtx.watch()]);
    } else {
      await desktopCtx.rebuild();
      await webviewCtx.rebuild();
      await desktopCtx.dispose();
      await webviewCtx.dispose();
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
