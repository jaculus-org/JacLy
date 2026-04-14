import type { Logger } from '@jaculus/common';
import * as vscode from 'vscode';

let channel: vscode.OutputChannel;

export function initLogger(context: vscode.ExtensionContext): void {
  channel = vscode.window.createOutputChannel('Jacly');
  context.subscriptions.push(channel);
}

class ChannelLogger implements Logger {
  error(message?: string): void {
    channel.appendLine(`[ERROR]   ${message ?? ''}`);
    channel.show(true);
  }
  warn(message?: string): void {
    channel.appendLine(`[WARN]    ${message ?? ''}`);
  }
  info(message?: string): void {
    channel.appendLine(`[INFO]    ${message ?? ''}`);
  }
  verbose(message?: string): void {
    channel.appendLine(`[VERBOSE] ${message ?? ''}`);
  }
  debug(message?: string): void {
    channel.appendLine(`[DEBUG]   ${message ?? ''}`);
  }
  silly(message?: string): void {
    channel.appendLine(`[SILLY]   ${message ?? ''}`);
  }
}

export const logger: Logger = new ChannelLogger();
