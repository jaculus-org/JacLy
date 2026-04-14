import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Project } from '@jaculus/project';
import type { JaclyBlocksData } from '@jaculus/project';
import { logger } from './logger';

export function findProjectRoot(fileUri: vscode.Uri): string | null {
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

export async function loadJaclyData(
  fileUri: vscode.Uri
): Promise<JaclyBlocksData> {
  const projectPath = findProjectRoot(fileUri);
  if (!projectPath) {
    vscode.window.showWarningMessage(
      'No package.json found. Please open a .jacly file in a project directory with a package.json.'
    );
    return { blockFiles: {}, translations: {} };
  }

  const project = new Project(fs, projectPath, logger);
  return project.getJaclyData('en');
}
