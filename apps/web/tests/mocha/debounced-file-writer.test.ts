import * as chai from 'chai';
import 'mocha';
import { createLatestFileWriter } from '../../src/editor/jacly/latest-file-writer';

const expect = chai.expect;

describe('createLatestFileWriter', () => {
  it('flushes the latest pending content on dispose', async () => {
    const writes: Array<{ path: string; content: string; encoding: string }> = [];
    const writer = createLatestFileWriter({
      filePath: '/tmp/test.json',
      writeFile: async (path, content, encoding) => {
        writes.push({ path, content, encoding });
      },
    });

    writer.schedule('first');
    writer.schedule('second');

    await writer.dispose();

    expect(writes).to.deep.equal([
      {
        path: '/tmp/test.json',
        content: 'first',
        encoding: 'utf-8',
      },
      {
        path: '/tmp/test.json',
        content: 'second',
        encoding: 'utf-8',
      },
    ]);
  });

  it('writes immediately when scheduled', async () => {
    const writes: string[] = [];
    const writer = createLatestFileWriter({
      filePath: '/tmp/test.json',
      writeFile: async (_path, content) => {
        writes.push(content);
      },
    });

    writer.schedule('one');
    writer.schedule('two');

    await writer.flushPending();

    expect(writes).to.deep.equal(['one', 'two']);
    await writer.dispose();
  });

  it('coalesces pending writes while an earlier write is still in flight', async () => {
    const writes: string[] = [];
    let releaseFirstWrite: (() => void) | null = null;

    const writer = createLatestFileWriter({
      filePath: '/tmp/test.json',
      writeFile: async (_path, content) => {
        writes.push(content);
        if (content === 'one') {
          await new Promise<void>((resolve) => {
            releaseFirstWrite = resolve;
          });
        }
      },
    });

    writer.schedule('one');
    writer.schedule('two');
    writer.schedule('three');

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(writes).to.deep.equal(['one']);

    releaseFirstWrite?.();
    await writer.flushPending();

    expect(writes).to.deep.equal(['one', 'three']);
    await writer.dispose();
  });
});
