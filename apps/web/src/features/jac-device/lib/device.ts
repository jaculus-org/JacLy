import type { JacDevice } from '@jaculus/device';
import logger from './logger';
import { enqueueSnackbar } from 'notistack';
import { dirname } from 'path';
import { m } from '@/paraglide/messages';

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

export async function testConnection(device: JacDevice): Promise<boolean> {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection test timed out')), 1500)
    );

    await Promise.race([withLLockedDevice(device, async () => {}), timeout]);

    return true;
  } catch {
    return false;
  }
}

export async function stop(device: JacDevice) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.stop();
    });
  } catch (err) {
    enqueueSnackbar(m.device_stop_failed(), { variant: 'error' });
    logger.verbose('Error stopping device: ' + err);
    throw err;
  }
}

export async function start(device: JacDevice, entryFile: string = 'index.js') {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.start(entryFile);
    });
  } catch (err) {
    enqueueSnackbar(m.device_start_failed(), { variant: 'error' });
    logger.verbose('Error starting device: ' + err);
    throw err;
  }
}

export async function restart(
  device: JacDevice,
  entryFile: string = 'index.js'
) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.stop();
      await dev.controller.start(entryFile);
    });
  } catch (err) {
    enqueueSnackbar(m.device_restart_failed(), { variant: 'error' });
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
    enqueueSnackbar(m.device_version_failed(), { variant: 'error' });
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
    enqueueSnackbar(m.device_upload_code_failed(), { variant: 'error' });
    logger.verbose('Error uploading code: ' + error);
    throw error;
  }
}

export async function status(device: JacDevice) {
  try {
    return await withLLockedDevice(device, async dev => {
      return await dev.controller.status();
    });
  } catch (err) {
    enqueueSnackbar(m.device_start_failed(), { variant: 'error' });
    logger.verbose('Error starting device: ' + err);
    throw err;
  }
}

// WiFi Configuration Functions
export async function addWifiNetwork(
  device: JacDevice,
  ssid: string,
  password: string
) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.addWifiNetwork(ssid, password);
    });
    enqueueSnackbar(m.device_wifi_network_added(), { variant: 'success' });
  } catch (err) {
    enqueueSnackbar(m.device_wifi_network_add_failed(), { variant: 'error' });
    logger.verbose('Error adding WiFi network: ' + err);
    throw err;
  }
}

export async function removeWifiNetwork(device: JacDevice, ssid: string) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.removeWifiNetwork(ssid);
    });
    enqueueSnackbar(m.device_wifi_network_removed(), { variant: 'success' });
  } catch (err) {
    enqueueSnackbar(m.device_wifi_network_remove_failed(), {
      variant: 'error',
    });
    logger.verbose('Error removing WiFi network: ' + err);
    throw err;
  }
}

export async function getWifiMode(device: JacDevice) {
  try {
    return await withLLockedDevice(device, async dev => {
      return await dev.controller.getWifiMode();
    });
  } catch (err) {
    logger.verbose('Error getting WiFi mode: ' + err);
    throw err;
  }
}

export async function setWifiMode(device: JacDevice, mode: number) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.setWifiMode(mode);
    });
    enqueueSnackbar(m.device_wifi_mode_updated(), { variant: 'success' });
  } catch (err) {
    enqueueSnackbar(m.device_wifi_mode_failed(), { variant: 'error' });
    logger.verbose('Error setting WiFi mode: ' + err);
    throw err;
  }
}

export async function getWifiApSsid(device: JacDevice) {
  try {
    return await withLLockedDevice(device, async dev => {
      return await dev.controller.getWifiApSsid();
    });
  } catch (err) {
    logger.verbose('Error getting WiFi AP SSID: ' + err);
    throw err;
  }
}

export async function setWifiApSsid(device: JacDevice, ssid: string) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.setWifiApSsid(ssid);
    });
    enqueueSnackbar(m.device_wifi_ap_ssid_updated(), { variant: 'success' });
  } catch (err) {
    enqueueSnackbar(m.device_wifi_ap_ssid_failed(), { variant: 'error' });
    logger.verbose('Error setting WiFi AP SSID: ' + err);
    throw err;
  }
}

export async function getWifiApPassword(device: JacDevice) {
  try {
    return await withLLockedDevice(device, async dev => {
      return await dev.controller.getWifiApPassword();
    });
  } catch (err) {
    logger.verbose('Error getting WiFi AP password: ' + err);
    throw err;
  }
}

export async function setWifiApPassword(device: JacDevice, password: string) {
  try {
    await withLLockedDevice(device, async dev => {
      await dev.controller.setWifiApPassword(password);
    });
    enqueueSnackbar(m.device_wifi_ap_password_updated(), {
      variant: 'success',
    });
  } catch (err) {
    enqueueSnackbar(m.device_wifi_ap_password_failed(), { variant: 'error' });
    logger.verbose('Error setting WiFi AP password: ' + err);
    throw err;
  }
}

export async function getCurrentWifiIp(device: JacDevice) {
  try {
    return await withLLockedDevice(device, async dev => {
      return await dev.controller.getCurrentWifiIp();
    });
  } catch (err) {
    logger.verbose('Error getting WiFi IP: ' + err);
    throw err;
  }
}
