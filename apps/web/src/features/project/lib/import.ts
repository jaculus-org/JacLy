import { Project } from '@jaculus/project';
import type { FSInterface } from '@jaculus/project/fs';
import { Writable } from 'node:stream';
import { unzipSync } from 'fflate';

export interface ImportPackage {
  dirs: string[];
  files: Record<string, Uint8Array>;
}

export interface ImportResult {
  projectType: 'jacly' | 'code';
  package: ImportPackage;
  fileCount: number;
}

/**
 * Detect if the zip contains a single folder with all files inside it
 * Returns the prefix to strip if detected, empty string otherwise
 */
export function detectZipStructure(files: Record<string, Uint8Array>): string {
  const paths = Object.keys(files);
  if (paths.length === 0) return '';

  const topLevel = new Set<string>();
  for (const path of paths) {
    const firstPart = path.split('/')[0];
    topLevel.add(firstPart);
  }

  if (topLevel.size === 1) {
    const folder = Array.from(topLevel)[0];
    const allInFolder = paths.every(
      p => p.startsWith(folder + '/') || p === folder
    );
    if (allInFolder && paths.some(p => p.startsWith(folder + '/'))) {
      return folder + '/';
    }
  }

  return '';
}

export function createWritableErr(): Writable {
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      console.log('ERR:', chunk.toString());
      callback();
    },
  });
  return stream;
}

export function createWritableOut(): Writable {
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      console.log('OUT:', chunk.toString());
      callback();
    },
  });
  return stream;
}

/**
 * Parse a zip file and extract its contents
 */
export function parseZipFile(zipData: Uint8Array): ImportResult {
  const unzipped = unzipSync(zipData);

  const prefixToStrip = detectZipStructure(unzipped);
  const dirs: string[] = [];
  const files: Record<string, Uint8Array> = {};

  for (const [path, content] of Object.entries(unzipped)) {
    let normalizedPath = path;

    if (prefixToStrip && path.startsWith(prefixToStrip)) {
      normalizedPath = path.slice(prefixToStrip.length);
    }
    if (!normalizedPath || normalizedPath === prefixToStrip.slice(0, -1)) {
      continue;
    }

    // fflate marks directories with empty content and trailing slash
    if (path.endsWith('/') || content.length === 0) {
      if (!normalizedPath.endsWith('/')) {
        dirs.push(normalizedPath);
      } else {
        dirs.push(normalizedPath.slice(0, -1));
      }
    } else {
      files[normalizedPath] = content;
    }
  }

  // Detect project type
  let projectType: 'jacly' | 'code' = 'code';
  const packageJsonContent = files['package.json'];
  if (packageJsonContent) {
    try {
      const packageJson = JSON.parse(
        new TextDecoder().decode(packageJsonContent)
      );
      if (packageJson.jacly?.type === 'jacly') {
        projectType = 'jacly';
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  const hasJaclyFiles = Object.keys(files).some(f => f.endsWith('.jacly'));
  if (hasJaclyFiles) {
    projectType = 'jacly';
  }

  return {
    projectType,
    package: { dirs, files },
    fileCount: Object.keys(files).length,
  };
}

/**
 * Create a project from an import package
 */
export async function createProjectFromPackage(
  fs: FSInterface,
  projectPath: string,
  pkg: ImportPackage
): Promise<void> {
  const project = new Project(
    fs,
    projectPath,
    createWritableOut(),
    createWritableErr()
  );
  await project.createFromPackage(pkg, false, false);
}
