#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRendererServer } from './server.js';

interface CliOptions {
  host: string;
  port: number;
  cacheDirectory: string;
  blockDataFile?: string;
  publicBaseUrl?: string;
  libraryDirectory?: string;
}

function argumentValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseOptions(): CliOptions {
  const portText = argumentValue('--port') ?? process.env.PORT ?? '8787';
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid port: ${portText}`);
  }
  return {
    host: argumentValue('--host') ?? process.env.HOST ?? '127.0.0.1',
    port,
    cacheDirectory:
      argumentValue('--cache-dir') ??
      process.env.JACLY_RENDER_CACHE ??
      path.resolve('.jacly-render-cache'),
    blockDataFile: argumentValue('--blocks') ?? process.env.JACLY_BLOCKS_FILE,
    publicBaseUrl: argumentValue('--public-url') ?? process.env.JACLY_RENDER_PUBLIC_URL,
    libraryDirectory: argumentValue('--libraries') ?? process.env.JACULUS_LIBRARIES,
  };
}

async function main(): Promise<void> {
  const options = parseOptions();
  const defaultBlockData = options.blockDataFile
    ? (JSON.parse(await readFile(options.blockDataFile, 'utf8')) as Record<string, unknown>)
    : { blockFiles: {} };
  const server = createRendererServer({
    cacheDirectory: options.cacheDirectory,
    defaultBlockData,
    publicBaseUrl: options.publicBaseUrl,
    libraryDirectory: options.libraryDirectory,
  });
  const address = await server.listen(options.port, options.host);
  console.log(`JacLy renderer listening on http://${options.host}:${address.port}`);

  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
