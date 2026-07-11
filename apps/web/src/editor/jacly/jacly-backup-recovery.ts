import { basename, extname, join } from 'node:path';
import type { ProjectFsPromises } from './jacly-files';

const BACKUP_DIR = 'backup';

export interface JaclyBackupCandidate {
  path: string;
  name: string;
  content: string;
  json: object;
}

export async function findNewestValidBackup(
  fsp: ProjectFsPromises,
  projectPath: string,
  jaclyPath: string,
): Promise<JaclyBackupCandidate | null> {
  const name = basename(jaclyPath, extname(jaclyPath));
  const ext = extname(jaclyPath);
  const backupDir = join(projectPath, BACKUP_DIR);

  try {
    const files = (await fsp.readdir(backupDir)) as string[];
    const candidates = await Promise.all(
      files
        .filter(
          (file) =>
            (file.startsWith(`${name}-A-`) || file.startsWith(`${name}-S-`)) && file.endsWith(ext),
        )
        .map(async (file) => ({
          file,
          mtimeMs: (await fsp.stat(join(backupDir, file))).mtimeMs,
        })),
    );
    candidates.sort((left, right) => right.mtimeMs - left.mtimeMs);

    for (const { file } of candidates) {
      const path = join(backupDir, file);
      try {
        const content = await fsp.readFile(path, 'utf-8');
        const json: unknown = JSON.parse(content);
        if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
          return { path, name: file, content, json };
        }
      } catch {
        // Continue to older backups when a backup is incomplete or invalid.
      }
    }
  } catch {
    return null;
  }

  return null;
}
