import type { JacProject } from '@/components/projects/projects-list';
import { compile } from '@jaculus/project/compiler';
import { enqueueSnackbar } from 'notistack';
import { fs } from '@zenfs/core';
import type { FSInterface } from '@jaculus/project/fs';
import { getProjectFsRoot } from '@/lib/projects/project-manager';
import {
  createCompilerOutStream,
  createCompilerErrStream,
} from '@/lib/streams';
import type { TerminalStreamType } from '@/hooks/terminal-store';

export async function jacCompile(
  project: JacProject,
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  const outStream = createCompilerOutStream(addToTerminal);
  const errStream = createCompilerErrStream(addToTerminal);

  if (
    await compile(
      fs as unknown as FSInterface,
      getProjectFsRoot(project.id),
      'build',
      outStream,
      errStream,
      '/tsLibs'
    )
  ) {
    enqueueSnackbar('Compilation successful', { variant: 'success' });
  } else {
    enqueueSnackbar('Compilation failed', { variant: 'error' });
  }
}
