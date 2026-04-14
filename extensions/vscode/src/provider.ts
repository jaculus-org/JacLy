import * as vscode from 'vscode';
import { JaclyDocument } from './document';
import { buildWebviewHtml } from './html-builder';
import { setupWebviewHandler } from './webview-handler';

export class JaclyEditorProvider
  implements vscode.CustomReadonlyEditorProvider<JaclyDocument>
{
  public static readonly viewType = 'jacly.editor';

  private readonly statusBarItem: vscode.StatusBarItem;

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new JaclyEditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      JaclyEditorProvider.viewType,
      provider,
      { supportsMultipleEditorsPerDocument: false }
    );
  }

  public constructor(private readonly context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.text = '$(gear) Jacly';
    this.statusBarItem.show();
    context.subscriptions.push(this.statusBarItem);
  }

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
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this.context.extensionUri,
        vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
        vscode.Uri.joinPath(this.context.extensionUri, 'media'),
      ],
    };

    setupWebviewHandler(document, webviewPanel, this.statusBarItem);
    webviewPanel.webview.html = await buildWebviewHtml(
      webviewPanel.webview,
      this.context.extensionUri
    );
  }
}
