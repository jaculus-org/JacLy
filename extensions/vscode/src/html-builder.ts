import * as vscode from 'vscode';

function getNonce(): string {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export async function buildWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): Promise<string> {
  const templateUri = vscode.Uri.joinPath(extensionUri, 'media', 'index.html');
  const templateBytes = await vscode.workspace.fs.readFile(templateUri);
  const template = Buffer.from(templateBytes).toString('utf8');

  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'webview.js')
  );
  const cssUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'webview.css')
  );
  const nonce = getNonce();

  return template
    .replace(/\{\{cspSource\}\}/g, webview.cspSource)
    .replace(/\{\{nonce\}\}/g, nonce)
    .replace(/\{\{scriptUri\}\}/g, scriptUri.toString())
    .replace(/\{\{cssUri\}\}/g, cssUri.toString());
}
