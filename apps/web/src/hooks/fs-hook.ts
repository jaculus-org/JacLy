import { configure, umount } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { Zip } from '@zenfs/archives';
import { enqueueSnackbar } from 'notistack';
import { useEffect } from 'react';
import type { FSPromisesInterface, FSInterface } from '@jaculus/project/fs';

export function useWebFs(projectId: string) {
  useEffect(() => {
    async function setupFs() {
      try {
        const res = await fetch('/tsLibs.zip');
        await configure({
          mounts: {
            [`/${projectId}/`]: {
              backend: IndexedDB,
              storeName: `jaculus-${projectId}`,
            },
            '/tsLibs/': { backend: Zip, data: await res.arrayBuffer() },
          },
        });
      } catch (e) {
        enqueueSnackbar(`Failed to load project filesystem: ${e}`, {
          variant: 'error',
        });
        return;
      }

      try {
        // Expose fs and fsp to window for easier debugging
        const { fs } = await import('@zenfs/core');
        window.fs = fs as unknown as FSInterface;
        window.fsp = fs.promises as unknown as FSPromisesInterface;
      } catch (error) {
        enqueueSnackbar(`Failed to initialize filesystem: ${error}`, {
          variant: 'error',
        });
      }
    }
    setupFs();

    return () => {
      try {
        umount(`/${projectId}/`);
        umount('/tsLibs/');
      } catch (error) {
        enqueueSnackbar(`Failed to unmount filesystem: ${error}`, {
          variant: 'error',
        });
      }
    };
  }, [projectId]);
}

declare global {
  interface Window {
    fs?: FSInterface;
    fsp?: FSPromisesInterface;
  }
}
