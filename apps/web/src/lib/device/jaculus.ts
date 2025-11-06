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
import type { JacDevice } from '@jaculus/device';

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

export async function jacFlash(
  project: JacProject,
  device: JacDevice,
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  const outStream = createCompilerOutStream(addToTerminal);
  const errStream = createCompilerErrStream(addToTerminal);

  const buildIndexPath = `${getProjectFsRoot(project.id)}/build/index.js`;
  const path: string = 'code/index.js';

  try {
    const codeBuff = await fs.promises.readFile(buildIndexPath);

    await device.controller.lock().catch(err => {
      errStream.write(`Error locking device: ${err}\n`);
      throw 1;
    });

    await device.controller.stop().catch(err => {
      errStream.write(`Error stopping device: ${err}\n`);
    });

    const cmd = await device.uploader.writeFile(path, codeBuff).catch(err => {
      errStream.write(`Error: ${err}\n`);
      throw 1;
    });
    outStream.write(cmd.toString() + '\n');

    await device.controller.start('index.js').catch(err => {
      errStream.write(`Error starting program: ${err}\n`);
      throw 1;
    });

    await device.controller.unlock().catch(err => {
      errStream.write(`Error unlocking device: ${err}\n`);
      throw 1;
    });
    enqueueSnackbar('Flashing successful', { variant: 'success' });
  } catch (error) {
    errStream.write(`Error flashing device: ${error}\n`);
    enqueueSnackbar('Flashing failed', { variant: 'error' });
  }
}

export async function jacBuildFlash(
  project: JacProject,
  device: JacDevice,
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  await jacCompile(project, addToTerminal);
  await jacFlash(project, device, addToTerminal);
}
