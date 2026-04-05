import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface BuildInfo {
  version: string;
  buildTime: string;
  commitHash: string;
  commitLink: string;
  repository: string;
}

export function buildInfoPlugin(): Plugin {
  return {
    name: 'build-info',
    resolveId(id) {
      if (id === 'virtual-build-info') {
        return id;
      }
    },
    load(id) {
      if (id === 'virtual-build-info') {
        const buildInfo = generateBuildInfo();
        return `export const buildInfo = ${JSON.stringify(buildInfo)};`;
      }
    },
    writeBundle() {
      // Also write the info to a JSON file for reference
      const buildInfo = generateBuildInfo();
      const infoPath = path.resolve(process.cwd(), 'dist/build-info.json');
      fs.writeFileSync(infoPath, JSON.stringify(buildInfo, null, 2));
    },
  };
}

function generateBuildInfo(): BuildInfo {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const version = packageJson.version;

  const buildTime = new Date().toISOString();

  let commitHash = 'unknown';
  let commitLink = '';
  let repository = 'unknown';

  try {
    // Get the current commit hash
    commitHash = execSync('git rev-parse HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    // Get the repository URL
    repository = execSync('git config --get remote.origin.url', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    // Extract owner/repo from git URL and create commit link
    const repoMatch = repository.match(
      /github\.com[:/]([^/]+)\/(.+?)(\.git)?$/
    );
    if (repoMatch) {
      const owner = repoMatch[1];
      const repo = repoMatch[2];
      commitLink = `https://github.com/${owner}/${repo}/commit/${commitHash}`;
    }
  } catch (error) {
    console.warn(
      'Could not get git information:',
      error instanceof Error ? error.message : 'unknown error'
    );
  }

  return {
    version,
    buildTime,
    commitHash,
    commitLink,
    repository,
  };
}
