import type { useMonaco } from '@monaco-editor/react';
import { inferLanguageFromPath } from './language';
import { editorSyncService } from './editor-sync-service';

export type FileRole = 'source' | 'typedef' | 'skip';

/**
 * Classify a project file by its relative path (relative to projectPath).
 * Returns 'source' for editor models, 'typedef' for Monaco extraLibs, 'skip' to ignore.
 */
export function classifyProjectFile(relativePath: string): FileRole {
  if (relativePath.startsWith('build/')) return 'skip';

  if (relativePath.startsWith('node_modules/')) {
    return relativePath.endsWith('.d.ts') ? 'typedef' : 'skip';
  }

  if (relativePath.endsWith('.d.ts')) return 'typedef';

  return 'source';
}

type Monaco = NonNullable<ReturnType<typeof useMonaco>>;

/**
 * Manages Monaco models and type definitions for a ZenFS-backed project.
 * - Source files → Monaco editor models (enables cross-file IntelliSense)
 * - .d.ts files from /tsLibs and node_modules → Monaco extraLibs (enables type checking)
 * - Watches ZenFS for changes and keeps everything in sync
 */
export class MonacoProjectService {
  private readonly monaco: Monaco;
  private readonly projectPath: string;
  private readonly fs: typeof import('fs');
  private readonly fsp: typeof import('fs').promises;

  // Track URIs of models we created so we only dispose ours on cleanup
  private createdModelUris = new Set<string>();

  // Track extraLibs by URI → content so we can rebuild the list on deletion
  private extraLibs = new Map<string, string>();

  // Active ZenFS watchers
  private watchers: Array<{ close(): void }> = [];

  constructor(
    monaco: Monaco,
    projectPath: string,
    fs: typeof import('fs'),
    fsp: typeof import('fs').promises
  ) {
    this.monaco = monaco;
    this.projectPath = projectPath;
    this.fs = fs;
    this.fsp = fsp;
  }

  async initialize(): Promise<void> {
    this.setCompilerOptions();
    await Promise.all([
      this.traverseSourceFiles(this.projectPath),
      this.traverseTypeFiles(`${this.projectPath}/node_modules`),
      this.traverseTypeFiles('/tsLibs'),
    ]);
    this.syncExtraLibs();
  }

  watch(): void {
    const watcher = this.fs.watch(
      this.projectPath,
      { recursive: true },
      async (eventType, filename) => {
        if (!filename) return;
        const fullPath = `${this.projectPath}/${filename}`.replace(/\\/g, '/');

        if (eventType === 'change') {
          await this.handleChange(fullPath);
        } else if (eventType === 'rename') {
          if (this.fs.existsSync(fullPath)) {
            await this.handleChange(fullPath);
          } else {
            this.handleDelete(fullPath);
          }
        }
      }
    );
    this.watchers.push(watcher);
  }

  dispose(): void {
    for (const w of this.watchers) w.close();
    this.watchers = [];

    for (const uriStr of this.createdModelUris) {
      this.monaco.editor.getModel(this.monaco.Uri.parse(uriStr))?.dispose();
    }
    this.createdModelUris.clear();

    this.extraLibs.clear();
    this.syncExtraLibs();
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private setCompilerOptions(): void {
    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: this.monaco.languages.typescript.ScriptTarget.ESNext,
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution:
        this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowJs: true,
      checkJs: true,
      strict: false,
      noEmit: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    });
    this.monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: this.monaco.languages.typescript.ScriptTarget.ESNext,
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution:
        this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowJs: true,
      checkJs: true,
      noEmit: true,
    });
    this.monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    this.monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  /** Walk project dir, skip node_modules and build, create models for non-.d.ts files. */
  private async traverseSourceFiles(dirPath: string): Promise<void> {
    let entries: import('fs').Dirent[];
    try {
      entries = await this.fsp.readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry.name}`;
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'build') continue;
        await this.traverseSourceFiles(fullPath);
      } else if (entry.isFile() && !entry.name.endsWith('.d.ts')) {
        try {
          const content = (await this.fsp.readFile(
            fullPath,
            'utf-8'
          )) as string;
          this.createModel(fullPath, content);
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  /** Walk a directory and register all .d.ts files as extraLibs. */
  private async traverseTypeFiles(dirPath: string): Promise<void> {
    let entries: import('fs').Dirent[];
    try {
      entries = await this.fsp.readdir(dirPath, { withFileTypes: true });
    } catch {
      return; // directory doesn't exist — that's fine
    }
    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry.name}`;
      if (entry.isDirectory()) {
        await this.traverseTypeFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
        try {
          const content = (await this.fsp.readFile(
            fullPath,
            'utf-8'
          )) as string;
          this.registerExtraLib(fullPath, content);
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  private createModel(fullPath: string, content: string): void {
    const uri = this.monaco.Uri.file(fullPath);
    const existing = this.monaco.editor.getModel(uri);
    if (existing) {
      existing.setValue(content);
    } else {
      this.monaco.editor.createModel(
        content,
        inferLanguageFromPath(fullPath),
        uri
      );
      this.createdModelUris.add(uri.toString());
    }
  }

  /** Accumulate an extraLib entry. Call syncExtraLibs() after bulk loading. */
  private registerExtraLib(fullPath: string, content: string): void {
    this.extraLibs.set(`file://${fullPath}`, content);
  }

  /** Push the current extraLibs map to Monaco TS/JS defaults. */
  private syncExtraLibs(): void {
    const libs = Array.from(this.extraLibs.entries()).map(
      ([filePath, content]) => ({
        filePath,
        content,
      })
    );
    this.monaco.languages.typescript.typescriptDefaults.setExtraLibs(libs);
    this.monaco.languages.typescript.javascriptDefaults.setExtraLibs(libs);
  }

  private async handleChange(fullPath: string): Promise<void> {
    const relative = fullPath.slice(this.projectPath.length + 1);
    const role = classifyProjectFile(relative);
    if (role === 'skip') return;

    try {
      const content = (await this.fsp.readFile(fullPath, 'utf-8')) as string;

      if (role === 'source') {
        // Skip if this change was caused by the editor saving — prevents round-trips
        if (editorSyncService.shouldIgnoreWatcherEvent(fullPath)) return;

        // Notify the currently-open editor component so it sets applyingExternalChangeRef
        // before model.setValue fires, preventing the onChange from writing back to ZenFS.
        editorSyncService.notifyExternalChange(fullPath, content);

        // Also update the model for files not currently open in any editor instance
        const uri = this.monaco.Uri.file(fullPath);
        const model = this.monaco.editor.getModel(uri);
        if (model && model.getValue() !== content) {
          model.setValue(content);
        } else if (!model) {
          this.createModel(fullPath, content);
        }
      } else {
        // typedef: update the extraLib map and sync to Monaco
        this.registerExtraLib(fullPath, content);
        this.syncExtraLibs();
      }
    } catch {
      // file is a directory or unreadable — ignore
    }
  }

  private handleDelete(fullPath: string): void {
    const relative = fullPath.slice(this.projectPath.length + 1);
    const role = classifyProjectFile(relative);

    if (role === 'source') {
      const uri = this.monaco.Uri.file(fullPath);
      const uriStr = uri.toString();
      if (this.createdModelUris.has(uriStr)) {
        this.monaco.editor.getModel(uri)?.dispose();
        this.createdModelUris.delete(uriStr);
      }
    } else if (role === 'typedef') {
      const uri = `file://${fullPath}`;
      if (this.extraLibs.delete(uri)) {
        this.syncExtraLibs();
      }
    }
  }
}
