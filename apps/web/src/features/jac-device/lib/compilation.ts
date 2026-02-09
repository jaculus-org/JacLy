import { createWritableStream } from '@/features/terminal/lib/stream';
import { type AddToTerminal } from '@/features/terminal/provider/terminal-provider';
import { compile } from '@jaculus/project/compiler';

export async function compileProject(
  projectPath: string,
  fs: typeof import('fs'),
  addEntry: AddToTerminal
): Promise<boolean> {
  const outStream = createWritableStream('compiler-stdout', addEntry);
  const errStream = createWritableStream('compiler-stderr', addEntry);

  return compile(fs, projectPath, 'build', outStream, errStream, '/tsLibs');
}
