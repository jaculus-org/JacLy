export type FileRole = 'source' | 'typedef' | 'skip';

/**
 * Classify a project file by its relative path (relative to projectPath).
 * Returns 'source' for editor models, 'typedef' for Monaco extraLibs, 'skip' to ignore.
 */
export function classifyProjectFile(relativePath: string): FileRole {
  if (relativePath.startsWith('build/')) return 'skip';

  if (relativePath.startsWith('node_modules/')) {
    return relativePath.endsWith('.d.ts') ? 'typedef' : 'skip';
  }

  if (relativePath.endsWith('.d.ts')) return 'typedef';

  return 'source';
}
