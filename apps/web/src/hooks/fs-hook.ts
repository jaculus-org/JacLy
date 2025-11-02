import { configure, umount, fs, mounts } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { enqueueSnackbar } from 'notistack';
import { useEffect } from 'react';
import type { FSPromisesInterface, FSInterface } from '@jaculus/project/fs';

const mountedProjects = new Set<string>();
const mountingInProgress = new Set<string>();

export function useWebFs(projectId: string) {
  console.log('useWebFs started for projectId:', projectId);

  useEffect(() => {
    async function fsMount() {
      if (mounts.has(`/${projectId}`)) {
        return;
      }
      if (mountingInProgress.has(projectId)) {
        return;
      }

      try {
        mountingInProgress.add(projectId);
        await configure({
          mounts: {
            [`/${projectId}`]: {
              backend: IndexedDB,
              storeName: `jaculus-${projectId}`,
            },
          },
        });

        // read dirs in root /
        const rootDirs = await fs.promises.readdir('/' + projectId);
        console.log('Root directories:', rootDirs);

        window.fs = fs as unknown as FSInterface; // for debugging
        window.fsp = fs.promises as unknown as FSPromisesInterface; // for debugging

        mountedProjects.add(projectId);
        console.log('Filesystem mounted for project:', projectId);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Mount point is already in use')
        ) {
          mountedProjects.add(projectId);
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
        mountingInProgress.delete(projectId);
      }
    }

    // Mount filesystem when hook is used
    fsMount();
    console.log('fsMount mounted called for projectId:', projectId);

    // Cleanup function to unmount when component unmounts
    return () => {
      try {
        // Check if mount exists before trying to unmount
        if (mountedProjects.has(projectId)) {
          umount(`/${projectId}`);
          console.log('Filesystem unmounted for project:', projectId);
        }
      } catch (error) {
        console.error('Failed to unmount filesystem:', error);
      } finally {
        mountedProjects.delete(projectId);
      }
      console.log('useWebFs cleanup called for projectId:', projectId);
    };
  }, [projectId]);
}

declare global {
  interface Window {
    fs?: FSInterface;
    fsp?: FSPromisesInterface;
  }
}
