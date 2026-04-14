import * as vscode from 'vscode';

export class JaclyDocument implements vscode.CustomDocument {
  constructor(
    public readonly uri: vscode.Uri,
    public content: string
  ) {}

  dispose(): void {}
}
