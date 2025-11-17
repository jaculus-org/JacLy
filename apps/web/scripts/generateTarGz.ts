import { Archive } from '@obsidize/tar-browserify';
import pako from 'pako';
import * as fs from 'fs';
import * as path from 'path';

export async function generateTarGz(sourceDir: string, outPath: string) {
  const archive = new Archive();

  function addFilesToArchive(dir: string, baseDir: string = dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      const tarPath = path.join(relativePath);

      if (entry.isDirectory()) {
        archive.addDirectory(tarPath);
        addFilesToArchive(fullPath, baseDir);
      } else if (entry.isFile()) {
        const content = fs.readFileSync(fullPath);
        archive.addBinaryFile(tarPath, content);
      }
    }
  }

  addFilesToArchive(sourceDir);

  const tarData = archive.toUint8Array();
  const gzData = pako.gzip(tarData);

  // Ensure output directory exists
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, gzData);
  console.log(`Generated tar.gz at ${outPath}`);
}
