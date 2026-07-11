import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { RenderArtifact, RenderFormat } from '../shared/types.js';

interface CacheMetadata {
  contentType: RenderArtifact['contentType'];
  width: number;
  height: number;
}

const HASH_PATTERN = /^[a-f0-9]{64}$/;

export class DiskRenderCache {
  constructor(readonly directory: string) {}

  private imagePath(hash: string, format: RenderFormat): string {
    if (!HASH_PATTERN.test(hash)) throw new TypeError('Invalid render hash');
    return path.join(this.directory, `${hash}.${format}`);
  }

  private metadataPath(hash: string): string {
    if (!HASH_PATTERN.test(hash)) throw new TypeError('Invalid render hash');
    return path.join(this.directory, `${hash}.json`);
  }

  async get(hash: string, format: RenderFormat): Promise<RenderArtifact | null> {
    try {
      const [content, metadataJson] = await Promise.all([
        readFile(this.imagePath(hash, format)),
        readFile(this.metadataPath(hash), 'utf8'),
      ]);
      const metadata = JSON.parse(metadataJson) as CacheMetadata;
      return { content, ...metadata };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async getImage(hash: string, format: RenderFormat): Promise<Uint8Array | null> {
    try {
      return await readFile(this.imagePath(hash, format));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async put(hash: string, format: RenderFormat, artifact: RenderArtifact): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    const nonce = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const imagePath = this.imagePath(hash, format);
    const metadataPath = this.metadataPath(hash);
    const temporaryImagePath = `${imagePath}.${nonce}.tmp`;
    const temporaryMetadataPath = `${metadataPath}.${nonce}.tmp`;
    const metadata: CacheMetadata = {
      contentType: artifact.contentType,
      width: artifact.width,
      height: artifact.height,
    };

    await Promise.all([
      writeFile(temporaryImagePath, artifact.content),
      writeFile(temporaryMetadataPath, JSON.stringify(metadata)),
    ]);
    await rename(temporaryImagePath, imagePath);
    await rename(temporaryMetadataPath, metadataPath);
  }
}
