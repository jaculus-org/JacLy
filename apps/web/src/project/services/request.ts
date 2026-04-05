import type { ProjectBundle } from '@jaculus/project';
import type { FSPromisesInterface } from '@jaculus/project/fs';
import { Archive } from '@obsidize/tar-browserify';
import pako from 'pako';

// Loads a package from a URI in the web app. For the node-only version,
// see @jaculus/tools. `fsp` is only needed for file:// URIs.
export async function loadPackageUri(
  pkgUri: string,
  fsp?: FSPromisesInterface
): Promise<ProjectBundle> {
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

  const dirs = new Set<string>();
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
      dirs.add(fileName);
    } else if (entry.isFile()) {
      files[fileName] = entry.content!;
    }
  }

  return { dirs, files };
}
