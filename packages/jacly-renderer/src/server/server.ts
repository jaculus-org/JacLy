import { readFile, stat } from 'node:fs/promises';
import {
  createServer as createNodeServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RenderFormat, RenderResponse } from '../shared/types.js';
import {
  type ArtifactRenderer,
  PlaywrightArtifactRenderer,
  WorkspaceRenderError,
} from './browser-renderer.js';
import { DiskRenderCache } from './cache.js';
import { errorMessage, HttpError } from './errors.js';
import { collectWorkspacePackages, loadLibraryBlockData } from './library-loader.js';
import { RenderService } from './render-service.js';
import { parseRenderRequest } from './validation.js';

const DEFAULT_BODY_LIMIT = 5 * 1024 * 1024;
const HASH_ROUTE = /^\/api\/render\/([a-f0-9]{64})\.(svg|png)$/;

export interface RendererServerOptions {
  cacheDirectory: string;
  defaultBlockData?: Record<string, unknown>;
  publicBaseUrl?: string;
  clientDirectory?: string;
  bodyLimit?: number;
  renderer?: ArtifactRenderer;
  libraryDirectory?: string;
}

function contentType(filePath: string): string {
  switch (path.extname(filePath)) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.map':
      return 'application/json; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  response.end(body);
}

async function readJson(request: IncomingMessage, limit: number): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > limit) throw new HttpError(413, `request body exceeds ${limit} bytes`);
    chunks.push(buffer);
  }
  if (chunks.length === 0) throw new HttpError(400, 'request body is empty');
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'request body is not valid JSON');
  }
}

function requestBaseUrl(request: IncomingMessage, configuredBaseUrl?: string): string {
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/$/, '');
  return `http://${request.headers.host ?? 'localhost'}`;
}

export function createRendererServer(options: RendererServerOptions) {
  const clientDirectory =
    options.clientDirectory ?? fileURLToPath(new URL('../../client', import.meta.url));
  const cache = new DiskRenderCache(options.cacheDirectory);
  let rendererPageUrl = '';
  const renderer =
    options.renderer ??
    new PlaywrightArtifactRenderer({
      rendererUrl: () => rendererPageUrl,
    });
  const service = new RenderService(cache, renderer);

  const server = createNodeServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://localhost');

      if (request.method === 'GET' && url.pathname === '/health') {
        sendJson(response, 200, { status: 'ok' });
        return;
      }

      if (request.method === 'GET' && url.pathname.startsWith('/_renderer/')) {
        const relativePath = url.pathname.slice('/_renderer/'.length) || 'index.html';
        const filePath = path.resolve(clientDirectory, relativePath);
        const directoryPrefix = `${path.resolve(clientDirectory)}${path.sep}`;
        if (!filePath.startsWith(directoryPrefix)) throw new HttpError(404, 'not found');
        try {
          const fileStat = await stat(filePath);
          if (!fileStat.isFile()) throw new HttpError(404, 'not found');
          const body = await readFile(filePath);
          response.writeHead(200, {
            'content-type': contentType(filePath),
            'content-length': body.byteLength,
            'cache-control': 'public, max-age=3600',
          });
          response.end(body);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            throw new HttpError(404, 'not found');
          }
          throw error;
        }
        return;
      }

      const imageMatch = HASH_ROUTE.exec(url.pathname);
      if (request.method === 'GET' && imageMatch) {
        const hash = imageMatch[1];
        const format = imageMatch[2] as RenderFormat;
        const image = await cache.getImage(hash, format);
        if (!image) throw new HttpError(404, 'render not found');
        response.writeHead(200, {
          'content-type': format === 'svg' ? 'image/svg+xml' : 'image/png',
          'content-length': image.byteLength,
          'cache-control': 'public, max-age=31536000, immutable',
          etag: `"${hash}"`,
        });
        response.end(image);
        return;
      }

      if (request.method === 'POST' && url.pathname === '/api/render') {
        const body = await readJson(request, options.bodyLimit ?? DEFAULT_BODY_LIMIT);
        const spec = parseRenderRequest(
          body,
          url.searchParams.get('format'),
          options.defaultBlockData ?? { blockFiles: {} },
        );
        const hasRequestBlockData =
          typeof body === 'object' && body !== null && 'workspace' in body && 'blockData' in body;
        if (options.libraryDirectory && !hasRequestBlockData) {
          spec.blockData = await loadLibraryBlockData({
            libraryDirectory: options.libraryDirectory,
            packageNames: collectWorkspacePackages(spec.workspace),
            locale: spec.options.locale,
          });
        }
        let result;
        try {
          result = await service.render(spec);
        } catch (error) {
          if (error instanceof WorkspaceRenderError) {
            throw new HttpError(422, errorMessage(error));
          }
          throw error;
        }
        const baseUrl = requestBaseUrl(request, options.publicBaseUrl);
        const imageUrl = `${baseUrl}/api/render/${result.response.hash}.${spec.format}`;
        const payload: RenderResponse = {
          ...result.response,
          url: imageUrl,
          markdown: `![JacLy program](${imageUrl})`,
        };
        sendJson(response, result.response.cached ? 200 : 201, payload);
        return;
      }

      throw new HttpError(404, 'not found');
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const message = status === 500 ? 'internal server error' : errorMessage(error);
      if (!response.headersSent) sendJson(response, status, { error: message });
      else response.end();
    }
  });

  return {
    rawServer: server,
    async listen(port = 0, host = '127.0.0.1'): Promise<AddressInfo> {
      await new Promise<void>((resolve, reject) => {
        const onError = (error: Error) => reject(error);
        server.once('error', onError);
        server.listen(port, host, () => {
          server.off('error', onError);
          resolve();
        });
      });
      const address = server.address() as AddressInfo;
      rendererPageUrl = `http://127.0.0.1:${address.port}/_renderer/index.html`;
      return address;
    },
    async close(): Promise<void> {
      await Promise.all([
        service.close(),
        new Promise<void>((resolve, reject) => {
          if (!server.listening) {
            resolve();
            return;
          }
          server.close((error) => (error ? reject(error) : resolve()));
        }),
      ]);
    },
  };
}
