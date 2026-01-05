import { configure, fs, mounts, umount } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';

export interface ProjectFsInterface {
  fs: typeof fs;
  projectPath: string;
}

export class ProjectFsService {
  private getMountPath(projectId: string): string {
    return `/${projectId}`;
  }

  private getStoreName(projectId: string): string {
    return `jacly-${projectId}`;
  }

  isMounted(projectId: string): boolean {
    const mountPath = this.getMountPath(projectId);
    // Check both with and without trailing slash as ZenFS may normalize paths differently
    return mounts.has(mountPath) || mounts.has(`${mountPath}/`);
  }

  async mount(projectId: string): Promise<ProjectFsInterface> {
    const mountPath = this.getMountPath(projectId);
    const storeName = this.getStoreName(projectId);

    // Check if already mounted - return existing fs
    if (this.isMounted(projectId)) {
      return {
        fs,
        projectPath: mountPath,
      };
    }

    try {
      await configure({
        mounts: {
          [mountPath]: {
            backend: IndexedDB,
            storeName,
          },
        },
      });
    } catch (error) {
      // If mount already exists (race condition), that's fine - use it
      if (error instanceof Error && error.message.includes('already in use')) {
        return {
          fs,
          projectPath: mountPath,
        };
      }
      throw error;
    }

    window.fs = fs;
    window.fsp = fs.promises;

    return {
      fs,
      projectPath: mountPath,
    };
  }

  unmount(projectId: string): void {
    const mountPath = this.getMountPath(projectId);

    try {
      if (this.isMounted(projectId)) {
        umount(mountPath);
      }
    } catch (error) {
      // Ignore unmount errors - mount may already be gone
      console.warn(`Failed to unmount ${mountPath}:`, error);
    }
  }

  /**
   * Temporarily mount a project fs, perform an action, then unmount.
   * Useful for project creation where we need to write initial files.
   */
  async withMount<T>(
    projectId: string,
    action: (fsInterface: ProjectFsInterface) => Promise<T>
  ): Promise<T> {
    const wasAlreadyMounted = this.isMounted(projectId);
    const fsInterface = await this.mount(projectId);

    try {
      return await action(fsInterface);
    } finally {
      // Only unmount if we mounted it ourselves
      if (!wasAlreadyMounted) {
        this.unmount(projectId);
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
