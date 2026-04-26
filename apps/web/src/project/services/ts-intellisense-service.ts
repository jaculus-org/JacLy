import type { FSInterface } from '@jaculus/project/fs';
import { packageEventsService } from '../../packages/services/package-events-service';
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

  private configureCompilerOptions(paths?: Record<string, string[]>): void {
    const ts = this.monaco.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      allowNonTsExtensions: true,
      baseUrl: `file://${this.projectPath}`,
      ...(paths ? { paths } : {}),
    });
    ts.typescriptDefaults.setEagerModelSync(true);
  }

  private async buildNodeModulesPaths(): Promise<Record<string, string[]>> {
    const nmPath = `${this.projectPath}/node_modules`;
    const paths: Record<string, string[]> = {};
    let packages: string[];
    try {
      packages = await this.fs.promises.readdir(nmPath);
    } catch {
      return paths;
    }
    for (const pkg of packages) {
      if (pkg.startsWith('.')) continue;
      const pkgJsonPath = `${nmPath}/${pkg}/package.json`;
      try {
        const raw = await this.fs.promises.readFile(pkgJsonPath, 'utf-8');
        const json = JSON.parse(raw) as { types?: string; typings?: string };
        const typesEntry = json.types ?? json.typings;
        if (typesEntry) {
          paths[pkg] = [`file://${nmPath}/${pkg}/${typesEntry}`];
          paths[`${pkg}/*`] = [`file://${nmPath}/${pkg}/*`];
        }
      } catch {
        // no package.json or no types field — skip
      }
    }
    return paths;
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

  private async scanForTsFiles(dir: string, excludeNodeModules: boolean): Promise<string[]> {
    const results: string[] = [];
    let entries: string[];
    try {
      entries = await this.fs.promises.readdir(dir);
    } catch {
      return results;
    }
    for (const entry of entries) {
      if (excludeNodeModules && entry === 'node_modules') continue;
      const fullPath = `${dir}/${entry}`;
      try {
        const stat = await this.fs.promises.stat(fullPath);
        if (stat.isDirectory()) {
          results.push(...(await this.scanForTsFiles(fullPath, excludeNodeModules)));
        } else if (entry.endsWith('.ts')) {
          results.push(fullPath);
        }
      } catch {
        // entry deleted between readdir and stat — skip
      }
    }
    return results;
  }

  private async loadProjectFiles(): Promise<void> {
    const tsPaths = await this.scanForTsFiles(this.projectPath, true);
    for (const fullPath of tsPaths) {
      const uri = this.monaco.Uri.file(fullPath);
      if (this.monaco.editor.getModel(uri)) continue;
      try {
        const content = await this.fs.promises.readFile(fullPath, 'utf-8');
        this.monaco.editor.createModel(content, 'typescript', uri);
        this.backgroundModels.add(fullPath);
      } catch {
        // file deleted since scan — skip
      }
    }
  }

  private async scanForDtsFiles(dir: string): Promise<string[]> {
    const results: string[] = [];
    let entries: string[];
    try {
      entries = await this.fs.promises.readdir(dir);
    } catch {
      return results;
    }
    for (const entry of entries) {
      const fullPath = `${dir}/${entry}`;
      try {
        const stat = await this.fs.promises.stat(fullPath);
        if (stat.isDirectory()) {
          results.push(...(await this.scanForDtsFiles(fullPath)));
        } else if (entry.endsWith('.d.ts') || entry === 'package.json') {
          results.push(fullPath);
        }
      } catch {
        // entry deleted between readdir and stat — skip
      }
    }
    return results;
  }

  private async loadNodeModulesTypes(): Promise<void> {
    const nmPath = `${this.projectPath}/node_modules`;
    const [files, paths] = await Promise.all([
      this.scanForDtsFiles(nmPath),
      this.buildNodeModulesPaths(),
    ]);
    const nodeModulesEntries: { content: string; filePath: string }[] = [];
    for (const fullPath of files) {
      try {
        const content = await this.fs.promises.readFile(fullPath, 'utf-8');
        nodeModulesEntries.push({ content, filePath: `file://${fullPath}` });
      } catch {
        // file deleted since scan — skip
      }
    }
    this.monaco.typescript.typescriptDefaults.setExtraLibs([
      ...this.tsLibEntries,
      ...nodeModulesEntries,
    ]);
    this.configureCompilerOptions(paths);
  }

  private watchNodeModules(): void {
    const nmPath = `${this.projectPath}/node_modules`;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const reload = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.loadNodeModulesTypes().catch(console.error);
      }, 1500);
    };

    try {
      this.nodeModulesWatcher = this.fs.watch(nmPath, reload);
    } catch {
      // node_modules doesn't exist yet — packageEventsService handles first install
    }

    this.unsubscribePackages = packageEventsService.onPackagesChanged(reload);
  }

  private async init(): Promise<void> {
    this.configureCompilerOptions();
    await this.loadTsLibs();
    await this.loadProjectFiles();
    await this.loadNodeModulesTypes();
    this.watchNodeModules();
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
