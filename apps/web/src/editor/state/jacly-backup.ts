import { basename, extname, join } from 'node:path';
import type { ProjectFsPromises } from './jacly-files';

export const AUTOSAVE_INTERVAL_MS = 5 * 60 * 1000;

const BACKUP_DIR = 'backup';
const MAX_AUTOSAVE_BACKUPS = 10;

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `-${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
  );
}

async function writeBackupFile(
  fsp: ProjectFsPromises,
  projectPath: string,
  jaclyPath: string,
  content: string,
  prefix: 'S' | 'A',
): Promise<void> {
  const name = basename(jaclyPath, extname(jaclyPath));
  const ext = extname(jaclyPath);
  const backupDir = join(projectPath, BACKUP_DIR);

  await fsp.mkdir(backupDir, { recursive: true });

  const fileName = `${name}-${prefix}-${formatTimestamp(new Date())}${ext}`;
  await fsp.writeFile(join(backupDir, fileName), content, 'utf-8');
}

async function pruneAutosaveBackups(
  fsp: ProjectFsPromises,
  projectPath: string,
  jaclyPath: string,
): Promise<void> {
  const name = basename(jaclyPath, extname(jaclyPath));
  const ext = extname(jaclyPath);
  const backupDir = join(projectPath, BACKUP_DIR);

  try {
    const files = (await fsp.readdir(backupDir)) as string[];
    const autosaves = files.filter((f) => f.startsWith(`${name}-A`) && f.endsWith(ext)).sort();

    const excess = autosaves.length - MAX_AUTOSAVE_BACKUPS;
    if (excess > 0) {
      await Promise.all(autosaves.slice(0, excess).map((f) => fsp.unlink(join(backupDir, f))));
    }
  } catch {
    // non-critical — ignore errors during pruning
  }
}

export async function writeStartupBackup(
  fsp: ProjectFsPromises,
  projectPath: string,
  jaclyPath: string,
  content: string,
): Promise<void> {
  await writeBackupFile(fsp, projectPath, jaclyPath, content, 'S');
}

export async function writeAutosaveBackup(
  fsp: ProjectFsPromises,
  projectPath: string,
  jaclyPath: string,
  content: string,
): Promise<void> {
  await writeBackupFile(fsp, projectPath, jaclyPath, content, 'A');
  await pruneAutosaveBackups(fsp, projectPath, jaclyPath);
}
