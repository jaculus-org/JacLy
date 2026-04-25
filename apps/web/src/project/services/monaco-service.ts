import type { Stats } from 'node:fs';
import type { FSInterface } from '@jaculus/project/fs';
import type { useMonaco } from '@monaco-editor/react';
import { inferLanguageFromPath } from '@/editor';

export type Monaco = NonNullable<ReturnType<typeof useMonaco>>;

type StatsListener = (curr: Stats, prev: Stats) => void;
type FlushHandler = () => Promise<void>;

export class MonacoService {
  private fs: FSInterface;
  private monaco: Monaco;
  private projectPath: string;
  private openedFiles: Set<string> = new Set();
  private watchers: Map<string, { path: string; listener: StatsListener }> = new Map();
  private externalUpdates: Set<string> = new Set();
  private pendingWrites: Map<string, Promise<void>> = new Map();
  private flushHandlers: Set<FlushHandler> = new Set();

  constructor(fs: FSInterface, monaco: Monaco, projectPath: string) {
    this.fs = fs;
    this.monaco = monaco;
    this.projectPath = projectPath;
  }

  private getFullPath(filePath: string): string {
    return `${this.projectPath}/${filePath}`;
  }

  async requestFile(filePath: string) {
    try {
      const fullPath = this.getFullPath(filePath);
      const uri = this.monaco.Uri.file(fullPath);
      const model = this.monaco.editor.getModel(uri);

      if (model) {
        return;
      }

      const content = await this.fs.promises.readFile(fullPath, 'utf-8');
      this.monaco.editor.createModel(content, inferLanguageFromPath(fullPath), uri);
      this.openedFiles.add(filePath);

      this.fs.watch(fullPath, async (eventType) => {
        if (eventType === 'rename') {
          // TODO implement
        } else if (eventType === 'change') {
          if (this.pendingWrites.has(filePath)) return;

          const model = this.monaco.editor.getModel(uri);
          if (!model) return;

          try {
            const newContent = await this.fs.promises.readFile(fullPath, 'utf-8');
            if (newContent === model.getValue()) return;

            const fullRange = model.getFullModelRange();
            this.externalUpdates.add(filePath);
            model.pushEditOperations([], [{ range: fullRange, text: newContent }], () => null);
            this.externalUpdates.delete(filePath);
          } catch (err) {
            console.error(`Failed to reload file ${filePath}:`, err);
          }
        }
      });
    } catch (error) {
      console.error(`Failed to load file ${filePath}:`, error);
    }
  }

  isExternalUpdate(filePath: string): boolean {
    return this.externalUpdates.has(filePath);
  }

  async updateFile(filePath: string, content: string) {
    const fullPath = this.getFullPath(filePath);
    const previous = this.pendingWrites.get(filePath) ?? Promise.resolve();
    const next = previous.then(() => this.fs.promises.writeFile(fullPath, content, 'utf-8'));
    this.pendingWrites.set(filePath, next);
    await next;
    if (this.pendingWrites.get(filePath) === next) {
      this.pendingWrites.delete(filePath);
    }
  }

  registerFlushHandler(handler: FlushHandler): () => void {
    this.flushHandlers.add(handler);
    return () => {
      this.flushHandlers.delete(handler);
    };
  }

  async flush(): Promise<void> {
    await Promise.all([
      Promise.allSettled([...this.pendingWrites.values()]),
      Promise.all([...this.flushHandlers].map((handler) => handler())),
    ]);
  }

  async closeFile(filePath: string) {
    const fullPath = this.getFullPath(filePath);
    const uri = this.monaco.Uri.file(fullPath);
    const model = this.monaco.editor.getModel(uri);
    if (model) {
      model.dispose();
      this.openedFiles.delete(filePath);
    }
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      this.fs.unwatchFile(watcher.path, watcher.listener);
      this.watchers.delete(filePath);
    }
  }

  async dispose() {
    this.openedFiles.forEach((filePath) => {
      this.closeFile(filePath);
    });
  }
}
