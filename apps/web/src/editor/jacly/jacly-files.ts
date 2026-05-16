import type * as fs from 'node:fs';
import { dirname } from 'node:path';

export type ProjectFs = typeof fs;
export type ProjectFsPromises = typeof fs.promises;

export async function ensureParentDir(fsp: ProjectFsPromises, filePath: string): Promise<void> {
  try {
    await fsp.mkdir(dirname(filePath), { recursive: true });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code !== 'EEXIST') throw error;
  }
}

export async function readOrCreateJsonFile(
  fs: ProjectFs,
  fsp: ProjectFsPromises,
  filePath: string,
): Promise<object> {
  await ensureParentDir(fsp, filePath);

  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  await fsp.writeFile(filePath, '{}', 'utf-8');
  return {};
}