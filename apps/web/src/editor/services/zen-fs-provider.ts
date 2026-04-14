import { Emitter } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import type { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import type {
  IFileChange,
  IFileDeleteOptions,
  IFileOverwriteOptions,
  IFileSystemProviderWithFileReadWriteCapability,
  IFileWriteOptions,
  IStat,
} from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files';
import {
  createFileSystemProviderError,
  FileChangeType,
  FileSystemProviderCapabilities,
  FileSystemProviderErrorCode,
  FileType,
} from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files';
import { fs } from '@zenfs/core';

function toStat(raw: {
  isFile(): boolean;
  isDirectory(): boolean;
  size: number;
  mtimeMs: number;
  ctimeMs: number;
}): IStat {
  let type = FileType.Unknown;
  if (raw.isFile()) type = FileType.File;
  else if (raw.isDirectory()) type = FileType.Directory;
  return {
    type,
    size: raw.size,
    mtime: Math.floor(raw.mtimeMs),
    ctime: Math.floor(raw.ctimeMs),
  };
}

function toFsError(err: unknown): never {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case 'ENOENT':
      throw createFileSystemProviderError(String(err), FileSystemProviderErrorCode.FileNotFound);
    case 'EEXIST':
      throw createFileSystemProviderError(String(err), FileSystemProviderErrorCode.FileExists);
    case 'ENOTDIR':
      throw createFileSystemProviderError(
        String(err),
        FileSystemProviderErrorCode.FileNotADirectory,
      );
    case 'EISDIR':
      throw createFileSystemProviderError(
        String(err),
        FileSystemProviderErrorCode.FileIsADirectory,
      );
    case 'EPERM':
    case 'EACCES':
      throw createFileSystemProviderError(String(err), FileSystemProviderErrorCode.NoPermissions);
    default:
      throw createFileSystemProviderError(String(err), FileSystemProviderErrorCode.Unknown);
  }
}

export class ZenFSProvider implements IFileSystemProviderWithFileReadWriteCapability {
  readonly capabilities =
    FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.PathCaseSensitive;

  private readonly _onDidChangeCapabilities = new Emitter<void>();
  readonly onDidChangeCapabilities = this._onDidChangeCapabilities.event;

  private readonly _onDidChangeFile = new Emitter<readonly IFileChange[]>();
  readonly onDidChangeFile = this._onDidChangeFile.event;

  private _pendingChanges: IFileChange[] = [];
  private _fireSoonTimer: ReturnType<typeof setTimeout> | undefined;

  private _fireSoon(...changes: IFileChange[]): void {
    this._pendingChanges.push(...changes);
    if (this._fireSoonTimer !== undefined) clearTimeout(this._fireSoonTimer);
    this._fireSoonTimer = setTimeout(() => {
      this._onDidChangeFile.fire(this._pendingChanges);
      this._pendingChanges = [];
    }, 5);
  }

  // external file change detection is handled by polling in code-editor.tsx
  watch(): typeof Disposable.None {
    return Disposable.None;
  }

  async stat(resource: URI): Promise<IStat> {
    try {
      return toStat(await fs.promises.stat(resource.fsPath));
    } catch (err) {
      toFsError(err);
    }
  }

  async readdir(resource: URI): Promise<[string, FileType][]> {
    try {
      const entries = await fs.promises.readdir(resource.fsPath, {
        withFileTypes: true,
      });
      return entries.map((e) => [e.name, e.isDirectory() ? FileType.Directory : FileType.File]);
    } catch (err) {
      toFsError(err);
    }
  }

  async mkdir(resource: URI): Promise<void> {
    try {
      await fs.promises.mkdir(resource.fsPath, { recursive: true });
      this._fireSoon({ type: FileChangeType.ADDED, resource });
    } catch (err) {
      toFsError(err);
    }
  }

  async delete(resource: URI, _opts: IFileDeleteOptions): Promise<void> {
    try {
      await fs.promises.rm(resource.fsPath, { recursive: true });
      this._fireSoon({ type: FileChangeType.DELETED, resource });
    } catch (err) {
      toFsError(err);
    }
  }

  async rename(from: URI, to: URI, _opts: IFileOverwriteOptions): Promise<void> {
    try {
      await fs.promises.rename(from.fsPath, to.fsPath);
      this._fireSoon(
        { type: FileChangeType.DELETED, resource: from },
        { type: FileChangeType.ADDED, resource: to },
      );
    } catch (err) {
      toFsError(err);
    }
  }

  async readFile(resource: URI): Promise<Uint8Array> {
    try {
      return new Uint8Array(await fs.promises.readFile(resource.fsPath));
    } catch (err) {
      toFsError(err);
    }
  }

  async writeFile(resource: URI, content: Uint8Array, _opts: IFileWriteOptions): Promise<void> {
    try {
      await fs.promises.writeFile(resource.fsPath, content);
      this._fireSoon({ type: FileChangeType.UPDATED, resource });
    } catch (err) {
      toFsError(err);
    }
  }
}
