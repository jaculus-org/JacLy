import type { FSInterface } from '@jaculus/project/fs';
import type { useMonaco } from '@monaco-editor/react';
import { inferLanguageFromPath } from '@/editor';
import { durableWriteFile } from './durable-file-write';
import { createLatestFileWriter, type LatestFileWriter } from './latest-file-writer';
import type { TypeScriptIntelliSenseService } from './ts-intellisense-service';

export type Monaco = NonNullable<ReturnType<typeof useMonaco>>;
export class MonacoService {
  private fs: FSInterface;
  private monaco: Monaco;
  private projectPath: string;
  private openedFiles: Set<string> = new Set();
  private watchers: Map<string, ReturnType<FSInterface['watch']>> = new Map();
  private writers: Map<string, LatestFileWriter> = new Map();
  private reloadTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private localRevisions: Map<string, number> = new Map();
  private applyingExternalChanges: Set<string> = new Set();
  private tsService: TypeScriptIntelliSenseService | null = null;

  constructor(fs: FSInterface, monaco: Monaco, projectPath: string) {
    this.fs = fs;
    this.monaco = monaco;
    this.projectPath = projectPath;
  }

  setTsService(service: TypeScriptIntelliSenseService): void {
    this.tsService = service;
  }

  private getFullPath(filePath: string): string {
    return `${this.projectPath}/${filePath}`;
  }

  private closeWatcher(filePath: string) {
    const watcher = this.watchers.get(filePath);
    if (!watcher) {
      return;
    }

    watcher.close();
    this.watchers.delete(filePath);
  }

  private clearReloadTimer(filePath: string) {
    const timer = this.reloadTimers.get(filePath);
    if (!timer) return;
    clearTimeout(timer);
    this.reloadTimers.delete(filePath);
  }

  private scheduleReload(
    filePath: string,
    fullPath: string,
    uri: ReturnType<Monaco['Uri']['file']>,
  ) {
    this.clearReloadTimer(filePath);
    const timer = setTimeout(async () => {
      this.reloadTimers.delete(filePath);
      const model = this.monaco.editor.getModel(uri);
      const writer = this.writers.get(filePath);
      if (!model || writer?.isPending()) return;

      const revisionBeforeRead = this.localRevisions.get(filePath) ?? 0;
      try {
        const newContent = await this.fs.promises.readFile(fullPath, 'utf-8');
        if (
          revisionBeforeRead !== (this.localRevisions.get(filePath) ?? 0) ||
          writer?.isPending() ||
          newContent === model.getValue()
        ) {
          return;
        }

        this.applyingExternalChanges.add(filePath);
        try {
          model.pushEditOperations(
            [],
            [{ range: model.getFullModelRange(), text: newContent }],
            () => null,
          );
        } finally {
          this.applyingExternalChanges.delete(filePath);
        }
      } catch (error) {
        if ((error as { code?: string }).code === 'ENOENT') {
          await this.closeFile(filePath);
          return;
        }
        console.error(`Failed to reload file ${filePath}:`, error);
      }
    }, 50);
    this.reloadTimers.set(filePath, timer);
  }

  async requestFile(filePath: string) {
    try {
      const fullPath = this.getFullPath(filePath);
      const uri = this.monaco.Uri.file(fullPath);
      let model = this.monaco.editor.getModel(uri);

      if (!model) {
        const content = await this.fs.promises.readFile(fullPath, 'utf-8');
        model = this.monaco.editor.createModel(content, inferLanguageFromPath(fullPath), uri);
      }

      // Guard: don't re-attach handlers if already tracking this file
      if (this.openedFiles.has(filePath)) {
        return;
      }

      this.openedFiles.add(filePath);
      this.localRevisions.set(filePath, 0);
      this.writers.set(
        filePath,
        createLatestFileWriter({
          filePath: fullPath,
          writeFile: async (path, content, encoding) => {
            await durableWriteFile(this.fs.promises, path, content, encoding);
          },
          onError: (error) => console.error(`Failed to save file ${filePath}:`, error),
        }),
      );

      model.onDidChangeContent(() => {
        if (model!.isDisposed() || this.applyingExternalChanges.has(filePath)) return;
        const value = model!.getValue();
        this.updateFile(filePath, value);
      });

      const watcher = this.fs.watch(fullPath, (eventType) => {
        if (eventType === 'rename' || eventType === 'change') {
          this.scheduleReload(filePath, fullPath, uri);
        }
      });
      this.watchers.set(filePath, watcher);
      this.tsService?.trigger();
    } catch (error) {
      console.error(`Failed to load file ${filePath}:`, error);
    }
  }

  updateFile(filePath: string, content: string) {
    const writer = this.writers.get(filePath);
    if (!writer) return;
    this.localRevisions.set(filePath, (this.localRevisions.get(filePath) ?? 0) + 1);
    writer.schedule(content);
  }

  async closeFile(filePath: string) {
    this.closeWatcher(filePath);
    this.clearReloadTimer(filePath);

    const writer = this.writers.get(filePath);
    this.writers.delete(filePath);
    await writer?.dispose();

    const fullPath = this.getFullPath(filePath);
    const uri = this.monaco.Uri.file(fullPath);
    const model = this.monaco.editor.getModel(uri);
    if (model) {
      model.dispose();
    }

    this.openedFiles.delete(filePath);
    this.localRevisions.delete(filePath);
    this.applyingExternalChanges.delete(filePath);
  }

  async flush() {
    await Promise.all(Array.from(this.writers.values(), (writer) => writer.flushPending()));
  }

  hasPendingWrites() {
    return Array.from(this.writers.values(), (writer) => writer.isPending()).some(Boolean);
  }

  async dispose() {
    await Promise.all(Array.from(this.openedFiles, (filePath) => this.closeFile(filePath)));
  }
}
