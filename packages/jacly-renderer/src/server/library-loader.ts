import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { HttpError } from './errors.js';

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  jaculus?: {
    blocks?: string;
  };
}

export interface LoadLibraryBlockDataOptions {
  libraryDirectory: string;
  packageNames: Iterable<string>;
  locale: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function collectWorkspacePackages(workspace: unknown): string[] {
  const packages = new Set<string>();

  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (!isRecord(value)) return;
    if (isRecord(value.extraState) && typeof value.extraState.package === 'string') {
      packages.add(value.extraState.package);
    }
    for (const child of Object.values(value)) visit(child);
  }

  visit(workspace);
  return [...packages].sort();
}

async function readJson(filePath: string): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as Record<string, unknown>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw error;
    throw new Error(
      `Failed to read ${filePath}: ${error instanceof Error ? error.message : error}`,
    );
  }
}

async function discoverPackageDirectories(root: string): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const entries = await readdir(root, { withFileTypes: true });

  async function registerDirectory(directory: string): Promise<void> {
    try {
      const packageJson = (await readJson(path.join(directory, 'package.json'))) as PackageJson;
      if (typeof packageJson.name === 'string') result.set(packageJson.name, directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const directory = path.join(root, entry.name);
    if (entry.name.startsWith('@')) {
      const scopedEntries = await readdir(directory, { withFileTypes: true });
      for (const scopedEntry of scopedEntries) {
        if (scopedEntry.isDirectory()) {
          await registerDirectory(path.join(directory, scopedEntry.name));
        }
      }
    } else {
      await registerDirectory(directory);
    }
  }
  return result;
}

export async function loadLibraryBlockData(
  options: LoadLibraryBlockDataOptions,
): Promise<Record<string, unknown>> {
  const root = path.resolve(options.libraryDirectory);
  const packageDirectories = await discoverPackageDirectories(root);
  const requestedPackages = [...new Set(options.packageNames)].sort();
  const missingPackages = requestedPackages.filter((name) => !packageDirectories.has(name));
  if (missingPackages.length > 0) {
    throw new HttpError(
      422,
      `Jaculus library packages not found in ${root}: ${missingPackages.join(', ')}`,
    );
  }

  const resolved = new Set<string>();
  const queue = [...requestedPackages];
  while (queue.length > 0) {
    const packageName = queue.shift()!;
    if (resolved.has(packageName)) continue;
    resolved.add(packageName);
    const directory = packageDirectories.get(packageName)!;
    const packageJson = (await readJson(path.join(directory, 'package.json'))) as PackageJson;
    for (const dependency of Object.keys(packageJson.dependencies ?? {}).sort()) {
      if (packageDirectories.has(dependency) && !resolved.has(dependency)) queue.push(dependency);
    }
  }

  const blockFiles: Record<string, unknown> = {};
  const translations: Record<string, string> = {};
  for (const packageName of [...resolved].sort()) {
    const directory = packageDirectories.get(packageName)!;
    const packageJson = (await readJson(path.join(directory, 'package.json'))) as PackageJson;
    if (!packageJson.jaculus?.blocks) continue;
    const blocksDirectory = path.resolve(directory, packageJson.jaculus.blocks);
    if (!blocksDirectory.startsWith(`${directory}${path.sep}`)) {
      throw new Error(`Invalid blocks directory for package ${packageName}`);
    }
    const entries = await readdir(blocksDirectory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.isFile() && /^[a-zA-Z0-9_-]+\.jacly\.json$/.test(entry.name)) {
        const filePath = path.join(blocksDirectory, entry.name);
        blockFiles[`${packageName}/${entry.name}`] = await readJson(filePath);
      }
    }

    const translationPath = path.join(
      blocksDirectory,
      'translations',
      `${options.locale}.lang.json`,
    );
    try {
      const packageTranslations = await readJson(translationPath);
      for (const [key, value] of Object.entries(packageTranslations)) {
        if (typeof value === 'string') translations[key] = value;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  return { blockFiles, translations };
}
