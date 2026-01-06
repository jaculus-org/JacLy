import type { JacDevice } from '@jaculus/device';
import { Writable } from 'node:stream';
import { enqueueSnackbar } from 'notistack';

export async function flashProject(
  projectPath: string,
  device: JacDevice,
  fs: typeof import('fs')
) {
  const outStream = new Writable({
    write(chunk) {
      console.log('Compiler output:', chunk.toString());
    },
  });

  const errStream = new Writable({
    write(chunk) {
      console.error('Compiler error:', chunk.toString());
    },
  });

  const buildIndexPath = `${projectPath}/build/index.js`;
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
  } catch (error) {
    errStream.write(`Error flashing device: ${error}\n`);
    enqueueSnackbar('Flashing failed', { variant: 'error' });
  }
}
