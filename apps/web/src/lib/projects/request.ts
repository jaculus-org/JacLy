import { type ProjectPackage } from '@jaculus/project';
import type { FSPromisesInterface } from '@jaculus/project/fs';
import { Archive } from '@obsidize/tar-browserify';
import pako from 'pako';

/**
 * Load a package from a URI - Web/Node implementation
 * For node-only implementation, see @jaculus/tools
 * @param pkgUri URI of the package to load (http://, https://, file://)
 * @param fsp File system promises interface, required for file:// URIs
 * @returns Async iterable of archive entries
 */
export async function loadPackageUri(
  pkgUri: string,
  fsp?: FSPromisesInterface
): Promise<ProjectPackage> {
  let gz: Uint8Array;
  if (pkgUri.startsWith('http://') || pkgUri.startsWith('https://')) {
    const res = await fetch(pkgUri);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${pkgUri}`);
    gz = new Uint8Array(await res.arrayBuffer());
  } else if (pkgUri.startsWith('file://') && fsp) {
    const filePath = pkgUri.slice(7);
    gz = await fsp.readFile(filePath);
  } else {
    throw new Error(`Unsupported URI scheme or missing fs for ${pkgUri}`);
  }

  const dirs: string[] = [];
  const files: Record<string, Uint8Array> = {};

  for await (const entry of Archive.read(pako.ungzip(gz))) {
    if (entry.isDirectory()) {
      dirs.push(entry.fileName);
    } else if (entry.isFile()) {
      files[entry.fileName] = entry.content!;
    }
  }

  return { dirs, files };
}
