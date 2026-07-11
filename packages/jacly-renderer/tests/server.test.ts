import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import type { ArtifactRenderer } from '../src/server/browser-renderer.js';
import { createRendererServer } from '../src/server/server.js';
import type { BrowserRenderPayload, RenderArtifact, RenderFormat } from '../src/shared/types.js';

class FakeRenderer implements ArtifactRenderer {
  calls = 0;

  async render(_payload: BrowserRenderPayload, format: RenderFormat): Promise<RenderArtifact> {
    this.calls += 1;
    return {
      content:
        format === 'svg'
          ? Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"/>')
          : Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      contentType: format === 'svg' ? 'image/svg+xml' : 'image/png',
      width: 20,
      height: 10,
    };
  }

  async close(): Promise<void> {}
}

const openServers: Array<ReturnType<typeof createRendererServer>> = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => server.close()));
});

async function startFakeServer() {
  const cacheDirectory = await mkdtemp(path.join(tmpdir(), 'jacly-renderer-test-'));
  const renderer = new FakeRenderer();
  const server = createRendererServer({ cacheDirectory, renderer });
  openServers.push(server);
  const address = await server.listen();
  return { baseUrl: `http://127.0.0.1:${address.port}`, cacheDirectory, renderer };
}

test('POST returns an immutable URL and repeating equivalent JSON hits disk cache', async () => {
  const { baseUrl, cacheDirectory, renderer } = await startFakeServer();
  const workspace = {
    blocks: {
      languageVersion: 0,
      blocks: [{ y: 20, type: 'math_number', x: 10 }],
    },
  };

  const first = await fetch(`${baseUrl}/api/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(workspace),
  });
  assert.equal(first.status, 201);
  const firstBody = (await first.json()) as {
    hash: string;
    url: string;
    markdown: string;
    cached: boolean;
  };
  assert.match(firstBody.hash, /^[a-f0-9]{64}$/);
  assert.equal(firstBody.cached, false);
  assert.equal(firstBody.url, `${baseUrl}/api/render/${firstBody.hash}.svg`);
  assert.equal(firstBody.markdown, `![JacLy program](${firstBody.url})`);

  const second = await fetch(`${baseUrl}/api/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ blocks: { blocks: workspace.blocks.blocks, languageVersion: 0 } }),
  });
  assert.equal(second.status, 200);
  const secondBody = (await second.json()) as typeof firstBody;
  assert.equal(secondBody.hash, firstBody.hash);
  assert.equal(secondBody.cached, true);
  assert.equal(renderer.calls, 1);

  const image = await fetch(firstBody.url);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/svg+xml');
  assert.equal(image.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  assert.equal(image.headers.get('etag'), `"${firstBody.hash}"`);
  assert.match(await image.text(), /^<svg/);

  const cachedFile = await readFile(path.join(cacheDirectory, `${firstBody.hash}.svg`), 'utf8');
  assert.match(cachedFile, /^<svg/);
});

test('API validates requests and returns 404 for unknown hashes', async () => {
  const { baseUrl } = await startFakeServer();
  const invalid = await fetch(`${baseUrl}/api/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ blocks: [] }),
  });
  assert.equal(invalid.status, 400);
  assert.deepEqual(await invalid.json(), {
    error: 'workspace must contain blocks.blocks as an array',
  });

  const missing = await fetch(`${baseUrl}/api/render/${'0'.repeat(64)}.png`);
  assert.equal(missing.status, 404);
});
