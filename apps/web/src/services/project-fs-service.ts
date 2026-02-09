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

export interface ProjectFsInterface {
  fs: typeof fs;
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
    return { fs, projectPath: mountPath };
  }

  try {
    const backend = await resolveMountConfig({
      backend: IndexedDB,
      storeName: getStoreName(projectId),
    });
    mount(mountPath, backend);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already in use')) {
      return { fs, projectPath: mountPath };
    }
    throw error;
  }

  // test to ensure IndexedDB is ready
  await fs.promises.readdir(mountPath);

  // Expose globally for debugging
  window.fs = fs;
  window.fsp = fs.promises;

  return { fs, projectPath: mountPath };
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
 * Service class for dependency injection in React context.
 * Wraps the module functions for easier testing and provider usage.
 */
export class ProjectFsService {
  isMounted = isMounted;
  mount = mountProject;
  unmount = unmountProject;

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
