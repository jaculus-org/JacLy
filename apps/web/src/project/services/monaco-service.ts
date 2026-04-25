import type { FSInterface } from '@jaculus/project/fs';
import type { useMonaco } from '@monaco-editor/react';
import { inferLanguageFromPath } from '@/editor';

export type Monaco = NonNullable<ReturnType<typeof useMonaco>>;
export class MonacoService {
  private fs: FSInterface;
  private monaco: Monaco;
  private projectPath: string;
  private openedFiles: Set<string> = new Set();
  private watchers: Map<string, ReturnType<FSInterface['watch']>> = new Map();

  constructor(fs: FSInterface, monaco: Monaco, projectPath: string) {
    this.fs = fs;
    this.monaco = monaco;
    this.projectPath = projectPath;
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

  async requestFile(filePath: string) {
    try {
      const fullPath = this.getFullPath(filePath);
      const uri = this.monaco.Uri.file(fullPath);
      const model = this.monaco.editor.getModel(uri);

      if (model) {
        return;
      }

      const content = await this.fs.promises.readFile(fullPath, 'utf-8');
      const m = this.monaco.editor.createModel(content, inferLanguageFromPath(fullPath), uri);
      this.openedFiles.add(filePath);

      m.onDidChangeContent(() => {
        if (m.isDisposed()) return;
        const value = m.getValue();
        this.updateFile(filePath, value);
      });

      const watcher = this.fs.watch(fullPath, async (eventType) => {
        if (eventType === 'rename') {
          await this.closeFile(filePath);
        } else if (eventType === 'change') {
          setTimeout(async () => {
            const model = this.monaco.editor.getModel(uri);
            if (!model) return;

            try {
              const newContent = await this.fs.promises.readFile(fullPath, 'utf-8');
              if (newContent === model.getValue()) return;

              const fullRange = model.getFullModelRange();
              model.pushEditOperations([], [{ range: fullRange, text: newContent }], () => null);
            } catch (err) {
              console.error(`Failed to reload file ${filePath}:`, err);
            }
          }, 50);
        }
      });
      this.watchers.set(filePath, watcher);
    } catch (error) {
      console.error(`Failed to load file ${filePath}:`, error);
    }
  }

  async updateFile(filePath: string, content: string) {
    const fullPath = this.getFullPath(filePath);
    await this.fs.promises.writeFile(fullPath, content, 'utf-8');
  }

  async closeFile(filePath: string) {
    this.closeWatcher(filePath);

    const fullPath = this.getFullPath(filePath);
    const uri = this.monaco.Uri.file(fullPath);
    const model = this.monaco.editor.getModel(uri);
    if (model) {
      model.dispose();
    }

    this.openedFiles.delete(filePath);
  }

  async flush() {}

  async dispose() {
    await Promise.all(Array.from(this.openedFiles, (filePath) => this.closeFile(filePath)));
  }
}
