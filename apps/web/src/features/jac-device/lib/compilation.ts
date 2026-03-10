import { logger } from '@/services/logger-service';
import { compileProjectPath } from '@jaculus/project/compiler';

export async function compileProject(
  projectPath: string,
  fs: typeof import('fs')
): Promise<boolean> {
  return compileProjectPath(fs, projectPath, logger, false, '/tsLibs');
}
