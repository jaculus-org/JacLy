import type { FSInterface } from '@jaculus/project/fs';
import type { Monaco } from './monaco-service';

export class TypeScriptIntelliSenseService {
  private fs: FSInterface;
  private monaco: Monaco;
  private projectPath: string;
  private initPromise: Promise<void> | null = null;
  private backgroundModels: Set<string> = new Set();
  private tsLibEntries: { content: string; filePath: string }[] = [];
  private nodeModulesWatcher: ReturnType<FSInterface['watch']> | null = null;
  private unsubscribePackages: (() => void) | null = null;

  constructor(fs: FSInterface, monaco: Monaco, projectPath: string) {
    this.fs = fs;
    this.monaco = monaco;
    this.projectPath = projectPath;
  }

  trigger(): void {
    if (this.initPromise !== null) return;
    this.initPromise = this.init().catch(console.error);
  }

  private async init(): Promise<void> {
    // Fields used in Tasks 3–5: this.fs, this.projectPath, this.tsLibEntries
    void this.fs;
    void this.projectPath;
    void this.tsLibEntries;
  }

  dispose(): void {
    this.nodeModulesWatcher?.close();
    this.nodeModulesWatcher = null;
    this.unsubscribePackages?.();
    this.unsubscribePackages = null;
    for (const fullPath of this.backgroundModels) {
      const uri = this.monaco.Uri.file(fullPath);
      const model = this.monaco.editor.getModel(uri);
      if (model && !model.isDisposed()) {
        model.dispose();
      }
    }
    this.backgroundModels.clear();
  }
}
