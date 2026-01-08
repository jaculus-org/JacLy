import type { JacDevice } from '@jaculus/device';
import { enqueueSnackbar } from 'notistack';
import logger from './logger';
import { dirname } from 'path';

export async function flashProject(
  files: Record<string, Uint8Array>,
  device: JacDevice
) {
  try {
    await device.controller.lock().catch((err: unknown) => {
      logger.verbose('Error locking device: ' + err);
      throw 1;
    });

    await device.controller.stop().catch((err: unknown) => {
      logger.verbose('Error stopping device: ' + err);
    });

    try {
      logger.info('Getting current data hashes');
      const dataHashes = await device.uploader
        .getDirHashes('code')
        .catch((err: unknown) => {
          logger.verbose('Error getting data hashes: ' + err);
          throw err;
        });

      await device.uploader.uploadIfDifferent(dataHashes, files, 'code');
    } catch {
      logger.info('Deleting old code');
      await device.uploader.deleteDirectory('code').catch((err: unknown) => {
        logger.verbose('Error deleting directory: ' + err);
      });

      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = `code/${filePath}`;
        const dirPath = dirname(fullPath);
        if (dirPath) {
          await device.uploader
            .createDirectory(dirPath)
            .catch((err: unknown) => {
              logger.verbose('Error creating directory: ' + err);
            });
        }
        await device.uploader
          .writeFile(fullPath, content)
          .catch((err: unknown) => {
            logger.verbose('Error writing file: ' + err);
          });
      }
    }

    await device.controller.start('index.js').catch((err: unknown) => {
      logger.verbose('Error starting program: ' + err);
      throw 1;
    });

    await device.controller.unlock().catch((err: unknown) => {
      logger.verbose('Error unlocking device: ' + err);
      throw 1;
    });
  } catch (error) {
    logger.error(`Error flashing device: ${error}`);
    enqueueSnackbar('Flashing failed', { variant: 'error' });
  }
}
