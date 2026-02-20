import type { ProjectPackage } from '@jaculus/project';
import type { JaculusProjectType } from '@jaculus/project/package';
import type { FSPromisesInterface } from '@jaculus/project/fs';
import { Archive } from '@obsidize/tar-browserify';
import pako from 'pako';
import { unzipSync } from 'fflate';
import {
  detectProjectType,
  detectRootPrefix,
  stripRootPrefix,
} from './packageUtils';

export interface PackageLoadResult {
  projectType: JaculusProjectType;
  package: ProjectPackage;
  fileCount: number;
}

/**
 * Detect if archive contains a single root folder with all files inside it
 * Returns the prefix to strip if detected, empty string otherwise
 */
/**
 * Extract TAR or TAR.GZ archive
 */
async function extractTar(data: Uint8Array): Promise<ProjectPackage> {
  const dirs: string[] = [];
  const files: Record<string, Uint8Array> = {};

  // Determine if the data is gzipped based on magic bytes (0x1f 0x8b)
  const isGzipped = data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;
  const archiveData = isGzipped ? pako.ungzip(data) : data;

  // Extract the tar archive
  for await (const entry of Archive.read(archiveData)) {
    const fileName = entry.fileName;

    if (entry.isDirectory()) {
      dirs.push(fileName.endsWith('/') ? fileName.slice(0, -1) : fileName);
    } else if (entry.isFile()) {
      files[fileName] = entry.content!;
    }
  }

  // Detect and strip common prefix (e.g., "package/")
  const prefixToStrip = detectRootPrefix(files);
  return stripRootPrefix({ dirs, files }, prefixToStrip);
}

/**
 * Extract ZIP archive
 */
function extractZip(data: Uint8Array): ProjectPackage {
  const unzipped = unzipSync(data);
  const dirs: string[] = [];
  const files: Record<string, Uint8Array> = {};

  for (const [path, content] of Object.entries(unzipped)) {
    // fflate marks directories with empty content and trailing slash
    if (path.endsWith('/') || content.length === 0) {
      const dirPath = path.endsWith('/') ? path.slice(0, -1) : path;
      if (dirPath) {
        dirs.push(dirPath);
      }
    } else {
      files[path] = content;
    }
  }

  // Detect and strip common prefix
  const prefixToStrip = detectRootPrefix(files);
  return stripRootPrefix({ dirs, files }, prefixToStrip);
}

/**
 * Detect archive format and extract
 */
async function extractArchive(data: Uint8Array): Promise<ProjectPackage> {
  // Check for ZIP magic bytes (PK\x03\x04 or PK\x05\x06)
  const isZip =
    data.length >= 4 &&
    data[0] === 0x50 &&
    data[1] === 0x4b &&
    (data[2] === 0x03 || data[2] === 0x05);

  if (isZip) {
    return extractZip(data);
  }

  // Try TAR/TAR.GZ (check for gzip magic bytes or assume TAR)
  return await extractTar(data);
}

/**
 * Load package from a File object (ZIP or TAR.GZ)
 */
export async function loadPackageFromFile(
  file: File
): Promise<PackageLoadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const pkg = await extractArchive(data);
  const projectType = detectProjectType(pkg.files);

  return {
    projectType,
    package: pkg,
    fileCount: Object.keys(pkg.files).length,
  };
}

/**
 * Load package from a URI (http://, https://, file://, or absolute path)
 */
export async function loadPackageFromUri(
  pkgUri: string,
  fsp?: FSPromisesInterface
): Promise<PackageLoadResult> {
  let data: Uint8Array;

  if (
    pkgUri.startsWith('http://') ||
    pkgUri.startsWith('https://') ||
    pkgUri.startsWith('/')
  ) {
    // Fetch from URL
    const res = await fetch(pkgUri, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${pkgUri}`);
    data = new Uint8Array(await res.arrayBuffer());
  } else if (pkgUri.startsWith('file://') && fsp) {
    // Read from file system
    const filePath = pkgUri.slice(7);
    data = await fsp.readFile(filePath);
  } else {
    throw new Error(`Unsupported URI scheme or missing fs for ${pkgUri}`);
  }

  const pkg = await extractArchive(data);
  const projectType = detectProjectType(pkg.files);

  return {
    projectType,
    package: pkg,
    fileCount: Object.keys(pkg.files).length,
  };
}
