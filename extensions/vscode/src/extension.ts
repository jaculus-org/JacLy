import * as vscode from 'vscode';
import { initLogger } from './logger';
import { JaclyEditorProvider } from './provider';

export function activate(context: vscode.ExtensionContext): void {
  initLogger(context);
  context.subscriptions.push(JaclyEditorProvider.register(context));
}

export function deactivate(): void {}
