import { gunzipSync, gzipSync } from 'fflate';
import { Archive } from '@obsidize/tar-browserify';
import { UniversalFS } from './universal-fs';

// Ensure parent dirs exist (simple split)
async function ensureParents(fs: UniversalFS, fullPath: string) {
  const parts = fullPath.split('/').filter(Boolean);
  let cur = '';
  for (let i = 0; i < parts.length - 1; i++) {
    cur += '/' + parts[i];
    try {
      await fs.mkdir(cur, { recursive: true });
    } catch {}
  }
}

/** Download a .tar.gz, unpack it into the web FS under /data */
export async function downloadAndExtractTarGz(
  url: string,
  fs: UniversalFS,
  destRoot = '/data'
) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const gz = new Uint8Array(await res.arrayBuffer());

  // 1) gunzip -> tar bytes
  const tar = gunzipSync(gz);
  // 2) iterate tar entries and write to FS
  for await (const entry of Archive.read(tar)) {
    const name = entry.fileName.replace(/^\.?\/*/, '');
    const target = `${destRoot.replace(/\/$/, '')}/${name}`;

    if (entry.isDirectory()) {
      await fs.mkdir(target, { recursive: true });
    } else if (entry.isFile()) {
      await ensureParents(fs, target);
      // entry.content is Uint8Array
      await fs.writeFile(target, entry.content!);
    }
  }
}

/** Create a .tar.gz from a folder in the web FS and return a Blob for download */
export async function packFolderToTarGz(
  fs: UniversalFS,
  srcRoot = '/data'
): Promise<Blob> {
  const archive = new Archive();

  // Recurse the folder (simple DFS)
  async function walk(dir: string, rel = ''): Promise<void> {
    const items = await fs.readdir(dir);
    for (const name of items) {
      const full = dir + (dir.endsWith('/') ? '' : '/') + name;
      const relPath = (rel ? rel + '/' : '') + name;
      const st = await fs.stat(full);
      if (st.isDirectory()) {
        archive.addDirectory(relPath);
        await walk(full, relPath);
      } else if (st.isFile()) {
        const data = await fs.readFile(full);
        archive.addBinaryFile(relPath, data);
      }
    }
  }

  await walk(srcRoot.replace(/\/$/, ''));
  const tar = archive.toUint8Array(); // build tar
  const gz = gzipSync(tar); // gzip it (fflate)
  return new Blob([new Uint8Array(gz)], { type: 'application/gzip' });
}
