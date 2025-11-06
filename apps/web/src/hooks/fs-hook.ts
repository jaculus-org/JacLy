import { configure, umount, fs, mounts } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Zip } from '@zenfs/archives';
import type { FSPromisesInterface, FSInterface } from '@jaculus/project/fs';
import { getProjectDbName } from '@/lib/projects/project-manager';

export function useWebFs(projectId: string) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [inProgress, setInProgress] = useState<boolean>(false);
  console.log('useWebFs started for projectId:', projectId);

  useEffect(() => {
    async function fsMount() {
      if (mounts.has(`/${projectId}`)) {
        return;
      }
      if (inProgress) {
        return;
      }

      try {
        setInProgress(true);
        const res = await fetch('/tsLibs.zip');
        await configure({
          mounts: {
            [`/${projectId}`]: {
              backend: IndexedDB,
              storeName: getProjectDbName(projectId),
            },
            '/tsLibs': { backend: Zip, data: await res.arrayBuffer() },
          },
        });

        // read dirs in root /
        const rootDirs = await fs.promises.readdir('/' + projectId);
        console.log('Root directories:', rootDirs);

        window.fs = fs as unknown as FSInterface; // for debugging
        window.fsp = fs.promises as unknown as FSPromisesInterface; // for debugging

        setMounted(true);
        console.log('Filesystem mounted for project:', projectId);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Mount point is already in use')
        ) {
          console.warn('Filesystem already mounted for project:', projectId);
          setMounted(true);
        } else {
          console.error('Failed to mount filesystem:', error);
          enqueueSnackbar(
            `Failed to mount filesystem: ${(error as Error).message}`,
            {
              variant: 'error',
            }
          );
        }
      } finally {
        setInProgress(false);
      }
    }

    // Mount filesystem when hook is used
    fsMount();
    console.log('fsMount mounted called for projectId:', projectId);

    // Cleanup function to unmount when component unmounts
    return () => {
      try {
        // Check if mount exists before trying to unmount
        if (mounts.has(`/${projectId}`)) {
          umount(`/${projectId}`);
          console.log('Filesystem unmounted for project:', projectId);
        }
      } catch (error) {
        console.error('Failed to unmount filesystem:', error);
      } finally {
        setMounted(false);
      }
      console.log('useWebFs cleanup called for projectId:', projectId);
    };
  }, [projectId]);

  return { mounted };
}

declare global {
  interface Window {
    fs?: FSInterface;
    fsp?: FSPromisesInterface;
  }
}
