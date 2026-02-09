export interface FileEntry {
  path: string;
  content: string;
}

export async function loadProjectFiles(
  projectPath: string,
  fsp: typeof import('fs').promises
): Promise<FileEntry[]> {
  const fileEntries: FileEntry[] = [];

  async function traverseDirectory(currentPath: string) {
    const entries = await fsp.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = `${currentPath}/${entry.name}`;

      if (entry.isDirectory()) {
        // No fully implemented intelli sesne for modules
        if (entry.name === 'node_modules' || entry.name === 'build') {
          continue;
        }
        await traverseDirectory(fullPath);
      } else if (entry.isFile()) {
        const content = await fsp.readFile(fullPath, 'utf-8');
        // remove leading slash from relative path
        const relativePath = fullPath
          .replace(projectPath, '')
          .replace(/^\//, '');
        fileEntries.push({ path: relativePath, content });
      }
    }
  }

  await traverseDirectory(projectPath);
  return fileEntries;
}
