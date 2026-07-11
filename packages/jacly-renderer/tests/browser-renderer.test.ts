import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRendererServer } from '../src/server/server.js';

const packageDirectory = fileURLToPath(new URL('..', import.meta.url));
const defaultLibrariesDirectory = '/Users/kuba/Documents/git/jaculus/Jaculus-libraries';

const blockData = {
  blockFiles: {
    'docs.jacly.json': {
      category: 'docs',
      name: 'Documentation',
      colour: '#4c97ff',
      contents: [
        {
          kind: 'block',
          type: 'docs_start',
          message0: 'say hello',
          code: 'console.log("hello");',
          previousStatement: null,
          nextStatement: null,
        },
      ],
    },
  },
};

const workspace = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'docs_start',
        id: 'documentation-block',
        x: 40,
        y: 30,
      },
    ],
  },
};

test('real Chromium renderer produces self-contained SVG and PNG and caches both', async () => {
  const cacheDirectory = await mkdtemp(path.join(tmpdir(), 'jacly-renderer-browser-'));
  const server = createRendererServer({
    cacheDirectory,
    clientDirectory: path.join(packageDirectory, 'dist/client'),
  });
  const address = await server.listen();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const render = async (format: 'svg' | 'png') => {
      const response = await fetch(`${baseUrl}/api/render`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workspace, blockData, format }),
      });
      const body = (await response.json()) as {
        error?: string;
        hash: string;
        url: string;
        cached: boolean;
        width: number;
        height: number;
      };
      assert.ok(response.ok, body.error);
      return body;
    };

    const svgResult = await render('svg');
    assert.equal(svgResult.cached, false);
    assert.ok(svgResult.width > 40);
    assert.ok(svgResult.height > 20);
    const svgResponse = await fetch(svgResult.url);
    const svg = await svgResponse.text();
    assert.match(svg, /^<svg/);
    assert.match(svg, /say(?: | )hello/);
    assert.match(svg, /<style/);

    const cachedSvg = await render('svg');
    assert.equal(cachedSvg.cached, true);
    assert.equal(cachedSvg.hash, svgResult.hash);

    const pngResult = await render('png');
    assert.equal(pngResult.cached, false);
    assert.notEqual(pngResult.hash, svgResult.hash);
    const png = new Uint8Array(await (await fetch(pngResult.url)).arrayBuffer());
    assert.deepEqual(Array.from(png.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  } finally {
    await server.close();
  }
});

const librariesDirectory = process.env.JACULUS_LIBRARIES ?? defaultLibrariesDirectory;

test('renders the Saturn/game-loop workspace using definitions from Jaculus-libraries', {
  skip: !existsSync(librariesDirectory),
}, async () => {
  const cacheDirectory = await mkdtemp(path.join(tmpdir(), 'jacly-renderer-libraries-'));
  const workspace = JSON.parse(
    await readFile(
      path.join(packageDirectory, 'tests/fixtures/saturn-game-loop.jacly.json'),
      'utf8',
    ),
  ) as Record<string, unknown>;
  const server = createRendererServer({
    cacheDirectory,
    clientDirectory: path.join(packageDirectory, 'dist/client'),
    libraryDirectory: librariesDirectory,
  });
  const address = await server.listen();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const response = await fetch(`${baseUrl}/api/render`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(workspace),
    });
    const body = (await response.json()) as {
      error?: string;
      url: string;
      width: number;
      height: number;
    };
    assert.ok(response.ok, body.error);
    assert.ok(body.width > 300);
    assert.ok(body.height > 400);

    const svgResponse = await fetch(body.url);
    const svg = await svgResponse.text();
    assert.match(svg, /basic_onStart blocklyBlock/);
    assert.match(svg, /saturn_constructor blocklyBlock/);
    assert.match(svg, /game_loop_on_tick blocklyBlock/);
    assert.match(svg, /renderer_shape_rotate blocklyBlock/);

    const pngRenderResponse = await fetch(`${baseUrl}/api/render?format=png`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(workspace),
    });
    const pngRender = (await pngRenderResponse.json()) as { error?: string; url: string };
    assert.ok(pngRenderResponse.ok, pngRender.error);
    const png = new Uint8Array(await (await fetch(pngRender.url)).arrayBuffer());
    assert.deepEqual(Array.from(png.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  } finally {
    await server.close();
  }
});
