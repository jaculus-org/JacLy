import type { JacDevice, UploaderProgressCallback } from '@jaculus/device';
import type { ProjectBundle } from '@jaculus/project';
import { logger } from '@/core/services/logger-service';
import { enqueueSnackbar } from 'notistack';
import { m } from '@/core/paraglide/messages';

async function withLockedDevice<T>(
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

export async function testConnection(
  device: JacDevice,
  timeoutMs: number
): Promise<null | { esp32: string; dcore: string }> {
  try {
    return await Promise.race<null | { esp32: string; dcore: string }>([
      version(device),
      new Promise(resolve => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
}

export async function stop(device: JacDevice) {
  try {
    await withLockedDevice(device, async dev => {
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
    await withLockedDevice(device, async dev => {
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
    await withLockedDevice(device, async dev => {
      await dev.controller.stop();
      await dev.controller.start(entryFile);
    });
  } catch (err) {
    enqueueSnackbar(m.device_restart_failed(), { variant: 'error' });
    logger.verbose('Error restarting device: ' + err);
    throw err;
  }
}

export async function version(
  device: JacDevice
): Promise<{ esp32: string; dcore: string } | null> {
  try {
    return await withLockedDevice(device, async dev => {
      const versionStringArr = await dev.controller.version();
      if (versionStringArr.length < 2) {
        return null;
      }
      const dcoreVersion = versionStringArr[0].split('@')[1].trim();
      const esp32Version = versionStringArr[1].split('@')[1].trim();
      return { dcore: dcoreVersion, esp32: esp32Version };
    });
  } catch (err) {
    enqueueSnackbar(m.device_version_failed(), { variant: 'error' });
    logger.verbose('Error getting device version: ' + err);
    throw err;
  }
}

export async function uploadCode(
  bundle: ProjectBundle,
  device: JacDevice,
  onProgress?: UploaderProgressCallback
) {
  try {
    await withLockedDevice(device, async dev => {
      await dev.controller.stop().catch((err: unknown) => {
        logger.verbose('Error stopping device: ' + err);
      });

      await dev.uploader.uploadFiles(bundle, 'code', onProgress);

      await dev.controller.start().catch((err: unknown) => {
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
    return await withLockedDevice(device, async dev => {
      return await dev.controller.status();
    });
  } catch (err) {
    enqueueSnackbar(m.device_status_failed(), { variant: 'error' });
    logger.verbose('Error getting device status: ' + err);
    throw err;
  }
}

export async function addWifiNetwork(
  device: JacDevice,
  ssid: string,
  password: string
) {
  try {
    await withLockedDevice(device, async dev => {
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
    await withLockedDevice(device, async dev => {
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
    return await withLockedDevice(device, async dev => {
      return await dev.controller.getWifiMode();
    });
  } catch (err) {
    logger.verbose('Error getting WiFi mode: ' + err);
    throw err;
  }
}

export async function setWifiMode(device: JacDevice, mode: number) {
  try {
    await withLockedDevice(device, async dev => {
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
    return await withLockedDevice(device, async dev => {
      return await dev.controller.getWifiApSsid();
    });
  } catch (err) {
    logger.verbose('Error getting WiFi AP SSID: ' + err);
    throw err;
  }
}

export async function setWifiApSsid(device: JacDevice, ssid: string) {
  try {
    await withLockedDevice(device, async dev => {
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
    return await withLockedDevice(device, async dev => {
      return await dev.controller.getWifiApPassword();
    });
  } catch (err) {
    logger.verbose('Error getting WiFi AP password: ' + err);
    throw err;
  }
}

export async function setWifiApPassword(device: JacDevice, password: string) {
  try {
    await withLockedDevice(device, async dev => {
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
    return await withLockedDevice(device, async dev => {
      return await dev.controller.getCurrentWifiIp();
    });
  } catch (err) {
    logger.verbose('Error getting WiFi IP: ' + err);
    throw err;
  }
}
