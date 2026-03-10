import { compileProjectPath } from '@jaculus/project/compiler';
import logger from './logger';

export async function compileProject(
  projectPath: string,
  fs: typeof import('fs')
): Promise<boolean> {
  return compileProjectPath(fs, projectPath, logger, false, '/tsLibs');
}
