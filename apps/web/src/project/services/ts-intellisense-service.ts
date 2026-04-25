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

  private configureCompilerOptions(): void {
    const ts = this.monaco.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2015,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      lib: ['es2023'],
      allowNonTsExtensions: true,
    });
    ts.typescriptDefaults.setEagerModelSync(true);
  }

  private async loadTsLibs(): Promise<void> {
    const files = await this.fs.promises.readdir('/tsLibs');
    const entries: { content: string; filePath: string }[] = [];
    for (const file of files) {
      if (!file.endsWith('.d.ts')) continue;
      const content = await this.fs.promises.readFile(`/tsLibs/${file}`, 'utf-8');
      entries.push({ content, filePath: `file:///tsLibs/${file}` });
    }
    this.tsLibEntries = entries;
    this.monaco.typescript.typescriptDefaults.setExtraLibs(entries);
  }

  private async init(): Promise<void> {
    this.configureCompilerOptions();
    await this.loadTsLibs();
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
