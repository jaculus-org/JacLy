import type { JaculusProjectType } from '@jaculus/project/package';

export type PackageLike = {
  dirs: string[];
  files: Record<string, Uint8Array>;
};

/**
 * Detect if archive contains a single root folder with all files inside it
 * Returns the prefix to strip if detected, empty string otherwise
 */
export function detectRootPrefix(files: Record<string, Uint8Array>): string {
  const paths = Object.keys(files);
  if (paths.length === 0) return '';

  const topLevel = new Set<string>();
  for (const path of paths) {
    const firstPart = path.split('/')[0];
    topLevel.add(firstPart);
  }

  // Check for single root folder
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

/**
 * Detect project type from package files
 */
export function detectProjectType(
  files: Record<string, Uint8Array>
): JaculusProjectType {
  // Check for .jacly files
  const hasJaclyFiles = Object.keys(files).some(f => f.endsWith('.jacly'));
  if (hasJaclyFiles) {
    return 'jacly';
  }

  // Check package.json for jacly type
  const packageJsonContent = files['package.json'];
  if (packageJsonContent) {
    try {
      const packageJson = JSON.parse(
        new TextDecoder().decode(packageJsonContent)
      );
      if (packageJson.jacly?.type === 'jacly') {
        return 'jacly';
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  return 'code';
}

function stripPrefix(path: string, prefix: string): string {
  if (prefix && path.startsWith(prefix)) {
    return path.slice(prefix.length);
  }
  return path;
}

/**
 * Strip common prefixes from file and dir paths (e.g., "package/" from archives)
 */
export function stripRootPrefix(
  pkg: PackageLike,
  prefixToStrip: string
): PackageLike {
  if (!prefixToStrip) return pkg;

  const strippedFiles: Record<string, Uint8Array> = {};
  const strippedDirs: string[] = [];

  for (const [path, content] of Object.entries(pkg.files)) {
    const strippedPath = stripPrefix(path, prefixToStrip);
    if (strippedPath) {
      strippedFiles[strippedPath] = content;
    }
  }

  for (const dir of pkg.dirs) {
    const strippedPath = stripPrefix(dir, prefixToStrip.slice(0, -1));
    if (strippedPath && strippedPath !== '/') {
      strippedDirs.push(strippedPath);
    }
  }

  return { dirs: strippedDirs, files: strippedFiles };
}
