import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import archiver from 'archiver';

const require = createRequire(import.meta.url);

type FileEntry = { name: string; content: string };

function getTypescriptLibFiles(typescriptLibPath: string): FileEntry[] {
  const files = fs.readdirSync(typescriptLibPath);
  if (files.length === 0) {
    throw new Error(
      `TSVFS: Could not find the TypeScript lib files at ${typescriptLibPath}. Please ensure that TypeScript is installed.`
    );
  }

  return files
    .filter(
      (lib: string) =>
        !lib.startsWith('lib.webworker.') &&
        lib.startsWith('lib.') &&
        lib.endsWith('.d.ts')
    )
    .map((lib: string) => ({
      name: lib,
      content: fs.readFileSync(path.join(typescriptLibPath, lib), 'utf8'),
    }));
}

function createZipArchive(outPath: string, files: FileEntry[]): Promise<void> {
  const output = fs.createWriteStream(outPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise<void>((resolve, reject) => {
    output.on('close', () => {
      console.log(
        `Created TS Library ${outPath} (${archive.pointer()} total bytes)`
      );
      resolve();
    });
    archive.on('error', reject);
    archive.pipe(output);

    for (const file of files) {
      archive.append(file.content, { name: file.name });
    }

    archive.finalize();
  });
}

async function main(): Promise<void> {
  const workspaceRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
  );
  const outZip = path.join(workspaceRoot, 'public', 'tsLibs.zip');
  const typescriptLibPath = path.dirname(require.resolve('typescript'));

  const files = getTypescriptLibFiles(typescriptLibPath);
  await createZipArchive(outZip, files);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
