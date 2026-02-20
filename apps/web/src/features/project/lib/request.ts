import type { ProjectPackage } from '@jaculus/project';
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
  if (
    pkgUri.startsWith('http://') ||
    pkgUri.startsWith('https://') ||
    pkgUri.startsWith('/')
  ) {
    // not cached fetch
    const res = await fetch(pkgUri, { cache: 'no-store' });
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

  // Determine if the data is gzipped based on magic bytes (0x1f 0x8b)
  const isGzipped = gz.length >= 2 && gz[0] === 0x1f && gz[1] === 0x8b;
  const archiveData = isGzipped ? pako.ungzip(gz) : gz;

  // Extract the tar archive, remove prefix /package from all entries
  for await (const entry of Archive.read(archiveData)) {
    let fileName = entry.fileName;
    if (fileName.startsWith('package/')) {
      fileName = fileName.slice('package/'.length);
    }

    if (entry.isDirectory()) {
      dirs.push(fileName);
    } else if (entry.isFile()) {
      files[fileName] = entry.content!;
    }
  }

  return { dirs, files };
}
