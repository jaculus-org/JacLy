import { Writable } from 'node:stream';
import { compileProject as compile } from '@jaculus/project/compiler';

export async function compileProject(
  projectPath: string,
  fs: typeof import('fs'),
  outStream: Writable,
  errStream: Writable
): Promise<boolean> {
  return compile(fs, projectPath, outStream, errStream, '/tsLibs');
}
