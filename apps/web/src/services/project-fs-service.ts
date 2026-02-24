import {
  configure,
  fs,
  mount,
  mounts,
  resolveMountConfig,
  umount,
} from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { Zip } from '@zenfs/archives';
import { enqueueSnackbar } from 'notistack';
import { copyFolder, type FSInterface } from '@jaculus/project/fs';

export interface ProjectFsInterface {
  fs: FSInterface;
  projectPath: string;
}

// Base filesystem initialization (singleton pattern)
let initPromise: Promise<void> | null = null;

async function ensureBaseFs(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const res = await fetch('/tsLibs.zip');
      await configure({
        mounts: {
          '/tsLibs': { backend: Zip, data: await res.arrayBuffer() },
        },
      });
    })();
  }
  return initPromise;
}

// Helper functions
const getMountPath = (projectId: string) => `/${projectId}`;
const getStoreName = (projectId: string) => `jacly-${projectId}`;

export function isMounted(projectId: string): boolean {
  const path = getMountPath(projectId);
  return mounts.has(path) || mounts.has(`${path}/`);
}

export async function mountProject(
  projectId: string
): Promise<ProjectFsInterface> {
  await ensureBaseFs();

  const mountPath = getMountPath(projectId);

  if (isMounted(projectId)) {
    return { fs: fs as unknown as FSInterface, projectPath: mountPath };
  }

  try {
    const backend = await resolveMountConfig({
      backend: IndexedDB,
      storeName: getStoreName(projectId),
    });
    mount(mountPath, backend);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already in use')) {
      return { fs: fs as unknown as FSInterface, projectPath: mountPath };
    }
    throw error;
  }

  // test to ensure IndexedDB is ready
  await fs.promises.readdir(mountPath);

  // Expose globally for debugging
  window.fs = fs;
  window.fsp = fs.promises;

  return { fs: fs as unknown as FSInterface, projectPath: mountPath };
}

export function unmountProject(projectId: string): void {
  const mountPath = getMountPath(projectId);
  if (isMounted(projectId)) {
    try {
      umount(mountPath);
    } catch {
      // Mount may already be gone
    }
  }
}

/**
 * Delete the IndexedDB store backing a project.
 * The project must be unmounted first.
 */
function deleteProjectStore(projectId: string): Promise<void> {
  const storeName = getStoreName(projectId);
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(storeName);
    req.onsuccess = () => resolve();
    req.onerror = event => reject(event);
    req.onblocked = () => {
      const message = `Deletion of IndexedDB store "${storeName}" is blocked. Reloading page in 3 seconds...`;
      console.warn(message);
      enqueueSnackbar(message, { variant: 'warning' });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };
  });
}

/**
 * Rename a project by copying its filesystem to a new IndexedDB store
 * and deleting the old one.
 *
 * 1. Mount both old and new projects
 * 2. Copy all files using copyFolder
 * 3. Unmount both
 * 4. Delete the old IndexedDB store
 */
export async function renameProject(
  oldProjectId: string,
  newProjectId: string
): Promise<void> {
  const oldFs = await mountProject(oldProjectId);
  const newFs = await mountProject(newProjectId);

  try {
    await copyFolder(oldFs.fs, oldFs.projectPath, newFs.fs, newFs.projectPath);
  } finally {
    unmountProject(newProjectId);
    unmountProject(oldProjectId);
  }

  await deleteProjectStore(oldProjectId);
}

/**
 * Service class for dependency injection in React context.
 * Wraps the module functions for easier testing and provider usage.
 */
export class ProjectFsService {
  isMounted = isMounted;
  mount = mountProject;
  unmount = unmountProject;
  rename = renameProject;

  async withMount<T>(
    projectId: string,
    action: (fsInterface: ProjectFsInterface) => Promise<T>
  ): Promise<T> {
    const wasMounted = isMounted(projectId);
    const fsInterface = await mountProject(projectId);
    try {
      return await action(fsInterface);
    } finally {
      if (!wasMounted) {
        unmountProject(projectId);
      }
    }
  }
}

declare global {
  interface Window {
    fs?: typeof fs;
    fsp?: typeof fs.promises;
  }
}
