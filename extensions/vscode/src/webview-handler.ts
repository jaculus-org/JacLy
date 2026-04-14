import * as fs from 'node:fs';
import * as path from 'node:path';
import type { JaclyBlocksData } from '@jaculus/project';
import * as vscode from 'vscode';
import type { JaclyDocument } from './document';
import { logger } from './logger';
import type { ExtensionToWebviewMessage, WebviewToExtensionMessage } from './messages';
import { findProjectRoot, loadJaclyData } from './project';

export function setupWebviewHandler(
  document: JaclyDocument,
  webviewPanel: vscode.WebviewPanel,
  statusBarItem: vscode.StatusBarItem,
): void {
  const webview = webviewPanel.webview;

  const post = (msg: ExtensionToWebviewMessage): void => {
    webview.postMessage(msg);
  };

  // Watch node_modules for changes and reload block definitions (debounced).
  const projectRoot = findProjectRoot(document.uri);
  let nodeModulesWatcher: fs.FSWatcher | null = null;
  let reloadDebounce: ReturnType<typeof setTimeout> | null = null;

  if (projectRoot) {
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      nodeModulesWatcher = fs.watch(nodeModulesPath, { recursive: true }, () => {
        if (reloadDebounce) {
          clearTimeout(reloadDebounce);
        }
        reloadDebounce = setTimeout(async () => {
          try {
            const jaclyBlocksData = await loadJaclyData(document.uri);
            post({ type: 'reloadBlocks', jaclyBlocksData });
          } catch (error) {
            const message = `Failed to reload Jacly blocks: ${error}`;
            logger.error(message);
            post({ type: 'error', message });
          }
        }, 1000);
      });
    }
  }

  webview.onDidReceiveMessage(async (raw: unknown) => {
    const message = raw as WebviewToExtensionMessage;

    if (message?.type === 'ready') {
      let initialJson: object = {};
      try {
        initialJson = (JSON.parse(document.content) as object) ?? {};
      } catch {
        initialJson = {};
      }

      let jaclyBlocksData: JaclyBlocksData = {
        blockFiles: {},
        translations: {},
      };
      try {
        jaclyBlocksData = await loadJaclyData(document.uri);
      } catch (error) {
        const message = `Failed to load Jacly blocks: ${error}`;
        logger.error(message);
        post({ type: 'error', message });
      }

      post({ type: 'load', initialJson, jaclyBlocksData });
    } else if (message?.type === 'saveJson') {
      try {
        const json = JSON.stringify(message.json, null, 2);
        const bytes = Buffer.from(json, 'utf8');
        await vscode.workspace.fs.writeFile(document.uri, bytes);
        document.content = json;
      } catch (error) {
        logger.error(`Failed to save .jacly file: ${error}`);
      }
    } else if (message?.type === 'generatedCode') {
      try {
        const fileName = path.basename(document.uri.fsPath);
        const dirName = path.basename(path.dirname(document.uri.fsPath));

        if (dirName === 'src' && fileName === 'index.jacly') {
          const root = findProjectRoot(document.uri);
          if (root) {
            const buildDir = path.join(root, 'build');
            if (!fs.existsSync(buildDir)) {
              fs.mkdirSync(buildDir, { recursive: true });
            }
            const outFile = path.join(buildDir, 'index.js');
            fs.writeFileSync(outFile, message.code, 'utf8');
            statusBarItem.text = '$(check) Jacly: Built';
            statusBarItem.tooltip = `Last built: ${new Date().toLocaleTimeString()}`;
          }
        }
      } catch (error) {
        const msg = `Failed to save generated code: ${error}`;
        logger.error(msg);
        statusBarItem.text = '$(error) Jacly: Error';
        statusBarItem.tooltip = msg;
        vscode.window.showErrorMessage(
          'Failed to save generated code. Check the Jacly output panel for details.',
        );
      }
    }
  });

  webviewPanel.onDidDispose(() => {
    if (reloadDebounce) {
      clearTimeout(reloadDebounce);
    }
    nodeModulesWatcher?.close();
  });
}
