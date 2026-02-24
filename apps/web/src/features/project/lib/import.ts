import type { FSInterface } from '@jaculus/project/fs';
import { Writable } from 'node:stream';
import { unzipSync } from 'fflate';
import { Project } from '@jaculus/project';
import {
  detectProjectType,
  detectRootPrefix,
  stripRootPrefix,
} from './packageUtils';

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
 * Parse a zip file and extract its contents
 */
export function parseZipFile(zipData: Uint8Array): ImportResult {
  const unzipped = unzipSync(zipData);
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

  const prefixToStrip = detectRootPrefix(files);
  const pkg = stripRootPrefix({ dirs, files }, prefixToStrip);
  const projectType = detectProjectType(pkg.files);

  return {
    projectType,
    package: pkg,
    fileCount: Object.keys(pkg.files).length,
  };
}

/**
 * Create a project from an import package
 */
export async function createProjectFromPackage(
  fs: FSInterface,
  projectPath: string,
  pkg: ImportPackage,
  outStream: Writable,
  errStream: Writable
): Promise<void> {
  const project = new Project(fs, projectPath, outStream, errStream);
  await project.createFromPackage(pkg, false, false);
}
