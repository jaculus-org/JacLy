// import { configure } from '@zenfs/core/config.js';
import { configure, umount } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { Zip } from '@zenfs/archives';
import { enqueueSnackbar } from 'notistack';

export type FSPromisesInterface = typeof import('fs').promises;
export type FSInterface = typeof import('fs');

export async function getFs(projectId: string): Promise<FSInterface> {
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
  } catch {
    // enqueueSnackbar('Failed to configure filesystem', { variant: 'error' });
    // throw error;
  }

  try {
    const { fs } = await import('@zenfs/core');

    window.fs = fs as unknown as FSInterface; // for debugging
    window.fsp = fs.promises as unknown as FSPromisesInterface; // for debugging

    return fs as unknown as FSInterface;
  } catch (error) {
    enqueueSnackbar('Failed to load filesystem', { variant: 'error' });
    throw error;
  }
}

export function unmountFs(projectId: string): void {
  try {
    umount(`/${projectId}/`);
  } catch (error) {
    enqueueSnackbar('Failed to unmount filesystem', { variant: 'error' });
    throw error;
  }
}

declare global {
  interface Window {
    fs?: FSInterface;
    fsp?: FSPromisesInterface;
  }
}
