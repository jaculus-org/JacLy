import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Writable } from 'stream';
import { Project } from '@jaculus/project';
import { Registry } from '@jaculus/project/registry';
import type { JaclyBlocksData } from '@jaculus/project';

class JaclyDocument implements vscode.CustomDocument {
  constructor(
    public readonly uri: vscode.Uri,
    public content: string
  ) {}

  dispose(): void {}
}

class JaclyEditorProvider
  implements vscode.CustomReadonlyEditorProvider<JaclyDocument>
{
  public static readonly viewType = 'jacly.editor';

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new JaclyEditorProvider(context);
    const registration = vscode.window.registerCustomEditorProvider(
      JaclyEditorProvider.viewType,
      provider,
      {
        supportsMultipleEditorsPerDocument: false,
      }
    );
    return registration;
  }

  public constructor(private readonly context: vscode.ExtensionContext) {}

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<JaclyDocument> {
    const fileBytes = await vscode.workspace.fs.readFile(uri);
    const content = Buffer.from(fileBytes).toString('utf8');
    return new JaclyDocument(uri, content);
  }

  async resolveCustomEditor(
    document: JaclyDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    const webview = webviewPanel.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this.context.extensionUri,
        vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
        vscode.Uri.joinPath(this.context.extensionUri, 'media'),
      ],
    };

    // Watch node_modules for changes and reload block definitions (debounced)
    const projectRoot = this.findProjectRoot(document.uri);
    let nodeModulesWatcher: fs.FSWatcher | null = null;
    let reloadDebounce: ReturnType<typeof setTimeout> | null = null;

    if (projectRoot) {
      const nodeModulesPath = path.join(projectRoot, 'node_modules');
      if (fs.existsSync(nodeModulesPath)) {
        nodeModulesWatcher = fs.watch(
          nodeModulesPath,
          { recursive: true },
          () => {
            if (reloadDebounce) {
              clearTimeout(reloadDebounce);
            }
            reloadDebounce = setTimeout(async () => {
              try {
                const jaclyBlocksData = await this.loadJaclyData(document.uri);
                webview.postMessage({ type: 'reloadBlocks', jaclyBlocksData });
              } catch (error) {
                console.error('Failed to reload Jacly blocks data:', error);
              }
            }, 1000);
          }
        );
      }
    }

    webviewPanel.onDidDispose(() => {
      if (reloadDebounce) {
        clearTimeout(reloadDebounce);
      }
      nodeModulesWatcher?.close();
    });

    webview.onDidReceiveMessage(async message => {
      if (message?.type === 'ready') {
        let initialJson = {};
        try {
          const parsed = JSON.parse(document.content);
          initialJson = parsed ?? {};
        } catch {
          initialJson = {};
        }

        // load JaclyBlocksData from the project
        let jaclyBlocksData: JaclyBlocksData = {
          blockFiles: {},
          translations: {},
        };
        try {
          jaclyBlocksData = await this.loadJaclyData(document.uri);
        } catch (error) {
          console.error('Failed to load Jacly blocks data:', error);
        }

        // Send initial data to the webview
        webview.postMessage({
          type: 'load',
          initialJson,
          jaclyBlocksData,
        });
      } else if (message?.type === 'saveJson') {
        // Save workspace JSON back to the .jacly file
        try {
          const json = JSON.stringify(message.json, null, 2);
          const bytes = Buffer.from(json, 'utf8');
          await vscode.workspace.fs.writeFile(document.uri, bytes);
          document.content = json;
        } catch (error) {
          console.error('Failed to save .jacly file:', error);
        }
      } else if (message?.type === 'generatedCode') {
        // Save generated code to build/index.js only if the file is project/src/index.jacly
        try {
          const fileName = path.basename(document.uri.fsPath);
          const dirName = path.basename(path.dirname(document.uri.fsPath));

          // Check if file is in src/ directory and named index.jacly
          if (dirName === 'src' && fileName === 'index.jacly') {
            const projectRoot = this.findProjectRoot(document.uri);
            if (projectRoot) {
              const buildDir = path.join(projectRoot, 'build');
              if (!fs.existsSync(buildDir)) {
                fs.mkdirSync(buildDir, { recursive: true });
              }
              const outFile = path.join(buildDir, 'index.js');
              fs.writeFileSync(outFile, message.code, 'utf8');
            }
          }
        } catch (error) {
          console.error('Failed to save generated code:', error);
        }
      }
    });

    webview.html = await this.getHtml(webview);
  }

  private async getHtml(webview: vscode.Webview): Promise<string> {
    const templateUri = vscode.Uri.joinPath(
      this.context.extensionUri,
      'media',
      'index.html'
    );
    const templateBytes = await vscode.workspace.fs.readFile(templateUri);
    const template = Buffer.from(templateBytes).toString('utf8');

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js')
    );
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.css')
    );
    const nonce = this.getNonce();

    return template
      .replace(/\{\{cspSource\}\}/g, webview.cspSource)
      .replace(/\{\{nonce\}\}/g, nonce)
      .replace(/\{\{scriptUri\}\}/g, scriptUri.toString())
      .replace(/\{\{cssUri\}\}/g, cssUri.toString());
  }

  /**
   * Find the project root (directory containing package.json) by walking up from the .jacly file.
   */
  private findProjectRoot(fileUri: vscode.Uri): string | null {
    let dir = path.dirname(fileUri.fsPath);
    const root = path.parse(dir).root;
    while (dir !== root) {
      if (fs.existsSync(path.join(dir, 'package.json'))) {
        return dir;
      }
      dir = path.dirname(dir);
    }
    return null;
  }

  /**
   * Instantiate a Project and call getJaclyData() to load block definitions.
   */
  private async loadJaclyData(fileUri: vscode.Uri): Promise<JaclyBlocksData> {
    const projectPath = this.findProjectRoot(fileUri);
    if (!projectPath) {
      vscode.window.showWarningMessage(
        'No package.json found. Please open a .jacly file in a project directory with a package.json.'
      );
      return { blockFiles: {}, translations: {} };
    }

    const out = new Writable({
      write(_chunk, _enc, cb) {
        cb();
      },
    });
    const err = new Writable({
      write(chunk, _enc, cb) {
        console.error(String(chunk));
        cb();
      },
    });

    const registry = Registry.createWithoutValidation(undefined, async () => {
      throw new Error('not implemented');
    });

    const project = new Project(fs, projectPath, out, err, registry);
    return project.getJaclyData('en');
  }

  private getNonce(): string {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Jacly extension activated');
  context.subscriptions.push(JaclyEditorProvider.register(context));
}

export function deactivate() {}
