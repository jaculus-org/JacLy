import { compileProjectPath } from '@jaculus/project/compiler';
import { logger } from '@/core/services/logger-service';

export async function compileProject(
  projectPath: string,
  fs: typeof import('fs'),
): Promise<boolean> {
  return compileProjectPath(fs, projectPath, logger, false, true, '/tsLibs');
}
