import { UniversalFS } from '../universal-fs';

export async function createWebFS(useOPFS = false): Promise<UniversalFS> {
  // ZenFS setup
  const { configure, fs } = await import('@zenfs/core');

  if (useOPFS) {
    // Try to use OPFS (Origin Private File System)
    try {
      // const { WebAccess } = await import("@zenfs/dom");

      // // Check if OPFS is supported
      // if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      // 	await configure({
      // 		mounts: {
      // 			"/data": Storage,
      // 		},
      // 	});
      // } else {
      throw new Error('OPFS not supported in this browser');
      // }
    } catch (_error) {
      // Fallback to IndexedDB if OPFS fails
      console.warn('OPFS failed, falling back to IndexedDB:', _error);
      const { IndexedDB } = await import('@zenfs/dom');
      await configure({
        mounts: {
          '/data': IndexedDB,
        },
      });
    }
  } else {
    // Use IndexedDB
    const { IndexedDB } = await import('@zenfs/dom');
    await configure({
      mounts: {
        '/data': IndexedDB,
      },
    });
  }

  const p = (fs as any).promises as typeof import('fs/promises');

  return {
    mkdir: (path, opts) =>
      p.mkdir(path, { recursive: opts?.recursive ?? true }),
    writeFile: (path, data) => p.writeFile(path, data as any),
    readFile: path => p.readFile(path),
    readdir: path => p.readdir(path),
    stat: path => p.stat(path),
  };
}
