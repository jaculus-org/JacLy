import type { JacDevice } from '@jaculus/device';
import logger from './logger';
import { enqueueSnackbar } from 'notistack';
import { dirname } from 'path';

async function withLLockedDevice<T>(
  device: JacDevice,
  fn: (device: JacDevice) => Promise<T>
): Promise<T> {
  await device.controller.lock().catch((err: unknown) => {
    logger.verbose('Error locking device: ' + err);
    throw 1;
  });

  try {
    return await fn(device);
  } finally {
    await device.controller.unlock().catch((err: unknown) => {
      logger.verbose('Error unlocking device: ' + err);
    });
  }
}

export async function stop(device: JacDevice) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.stop();
    });
  } catch (err) {
    enqueueSnackbar('Failed to stop program', { variant: 'error' });
    logger.verbose('Error stopping device: ' + err);
    throw err;
  }
}

export async function start(device: JacDevice, entryFile: string) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.start(entryFile);
    });
  } catch (err) {
    enqueueSnackbar('Failed to start program', { variant: 'error' });
    logger.verbose('Error starting device: ' + err);
    throw err;
  }
}

export async function restart(device: JacDevice) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.stop();
      await dev.controller.start('index.js');
    });
  } catch (err) {
    enqueueSnackbar('Failed to restart program', { variant: 'error' });
    logger.verbose('Error restarting device: ' + err);
    throw err;
  }
}

export async function version(device: JacDevice): Promise<string[]> {
  try {
    return await withLLockedDevice(device, async dev => {
      return await dev.controller.version();
    });
  } catch (err) {
    enqueueSnackbar('Failed to get device version', { variant: 'error' });
    logger.verbose('Error getting device version: ' + err);
    throw err;
  }
}

export async function uploadCode(
  files: Record<string, Uint8Array>,
  device: JacDevice
) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.stop().catch((err: unknown) => {
        logger.verbose('Error stopping device: ' + err);
      });

      try {
        logger.info('Getting current data hashes');
        const dataHashes = await dev.uploader
          .getDirHashes('code')
          .catch((err: unknown) => {
            logger.verbose('Error getting data hashes: ' + err);
            throw err;
          });

        await dev.uploader.uploadIfDifferent(dataHashes, files, 'code');
      } catch {
        logger.info('Deleting old code');
        await dev.uploader.deleteDirectory('code').catch((err: unknown) => {
          logger.verbose('Error deleting directory: ' + err);
        });

        for (const [filePath, content] of Object.entries(files)) {
          const fullPath = `code/${filePath}`;
          const dirPath = dirname(fullPath);
          if (dirPath) {
            await dev.uploader
              .createDirectory(dirPath)
              .catch((err: unknown) => {
                logger.verbose('Error creating directory: ' + err);
              });
          }
          await dev.uploader
            .writeFile(fullPath, content)
            .catch((err: unknown) => {
              logger.verbose('Error writing file: ' + err);
            });
        }
      }

      await dev.controller.start('index.js').catch((err: unknown) => {
        logger.verbose('Error starting program: ' + err);
        throw 1;
      });
    });
  } catch (error) {
    enqueueSnackbar('Failed to upload code', { variant: 'error' });
    logger.verbose('Error uploading code: ' + error);
    throw error;
  }
}
