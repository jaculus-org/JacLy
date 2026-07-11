import * as chai from 'chai';
import 'mocha';
import { durableWriteFile } from '../../src/project/services/durable-file-write';

const expect = chai.expect;

describe('durableWriteFile', () => {
  it('finishes the temporary file before replacing the destination', async () => {
    const operations: string[] = [];
    const files = new Map<string, string>();
    let temporaryPath = '';
    const fsp = {
      writeFile: async (path: string, content: string) => {
        temporaryPath = path;
        files.set(path, content);
        operations.push(`write:${path}:${content}`);
      },
      readFile: async (path: string) => {
        operations.push(`read:${path}`);
        return files.get(path) ?? '';
      },
      rename: async (source: string, destination: string) => {
        files.set(destination, files.get(source) ?? '');
        files.delete(source);
        operations.push(`rename:${source}:${destination}`);
      },
      unlink: async (path: string) => {
        files.delete(path);
        operations.push(`unlink:${path}`);
      },
    };

    await durableWriteFile(fsp, '/project/src/index.jacly', 'large content');

    expect(temporaryPath).to.match(/^\/project\/src\/index\.jacly\.tmp-/);
    expect(operations).to.deep.equal([
      `write:${temporaryPath}:large content`,
      `read:${temporaryPath}`,
      `rename:${temporaryPath}:/project/src/index.jacly`,
      'read:/project/src/index.jacly',
    ]);
  });

  it('removes an incomplete temporary file when replacement fails', async () => {
    const removed: string[] = [];
    const fsp = {
      writeFile: async () => undefined,
      readFile: async () => 'content',
      rename: async () => {
        throw new Error('rename failed');
      },
      unlink: async (path: string) => {
        removed.push(path);
      },
    };

    let error: unknown;
    try {
      await durableWriteFile(fsp, '/project/src/index.jacly', 'content');
    } catch (caught) {
      error = caught;
    }
    expect(error).to.be.an('error').with.property('message', 'rename failed');
    expect(removed).to.have.length(3);
    for (const path of removed) {
      expect(path).to.match(/^\/project\/src\/index\.jacly\.tmp-/);
    }
  });

  it('retries when ZenFS returns truncated large-file content', async () => {
    const content = JSON.stringify({ data: 'x'.repeat(2_000_000) });
    const files = new Map<string, string>();
    let writes = 0;
    const fsp = {
      writeFile: async (path: string, nextContent: string) => {
        writes += 1;
        files.set(path, writes === 1 ? nextContent.slice(0, -100) : nextContent);
      },
      readFile: async (path: string) => files.get(path) ?? '',
      rename: async (source: string, destination: string) => {
        files.set(destination, files.get(source) ?? '');
        files.delete(source);
      },
      unlink: async (path: string) => {
        files.delete(path);
      },
    };

    await durableWriteFile(fsp, '/project/src/index.jacly', content);

    expect(writes).to.equal(2);
    expect(files.get('/project/src/index.jacly')).to.equal(content);
  });

  it('serializes independent writers targeting the same file', async () => {
    const files = new Map<string, string>();
    const startedWrites: string[] = [];
    let releaseFirstWrite: (() => void) | undefined;
    const fsp = {
      writeFile: async (path: string, content: string) => {
        startedWrites.push(content);
        if (content === 'first') {
          await new Promise<void>((resolve) => {
            releaseFirstWrite = resolve;
          });
        }
        files.set(path, content);
      },
      readFile: async (path: string) => files.get(path) ?? '',
      rename: async (source: string, destination: string) => {
        files.set(destination, files.get(source) ?? '');
        files.delete(source);
      },
      unlink: async (path: string) => {
        files.delete(path);
      },
    };

    const firstWrite = durableWriteFile(fsp, '/project/src/index.jacly', 'first');
    const secondWrite = durableWriteFile(fsp, '/project/src/index.jacly', 'second');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(startedWrites).to.deep.equal(['first']);
    releaseFirstWrite?.();
    await Promise.all([firstWrite, secondWrite]);

    expect(startedWrites).to.deep.equal(['first', 'second']);
    expect(files.get('/project/src/index.jacly')).to.equal('second');
  });
});
