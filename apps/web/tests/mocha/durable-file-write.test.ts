import * as chai from 'chai';
import 'mocha';
import { durableWriteFile } from '../../src/project/services/durable-file-write';

const expect = chai.expect;

describe('durableWriteFile', () => {
  it('finishes the temporary file before replacing the destination', async () => {
    const operations: string[] = [];
    let temporaryPath = '';
    const fsp = {
      writeFile: async (path: string, content: string) => {
        temporaryPath = path;
        operations.push(`write:${path}:${content}`);
      },
      rename: async (source: string, destination: string) => {
        operations.push(`rename:${source}:${destination}`);
      },
      unlink: async (path: string) => {
        operations.push(`unlink:${path}`);
      },
    };

    await durableWriteFile(fsp, '/project/src/index.jacly', 'large content');

    expect(temporaryPath).to.match(/^\/project\/src\/index\.jacly\.tmp-/);
    expect(operations).to.deep.equal([
      `write:${temporaryPath}:large content`,
      `rename:${temporaryPath}:/project/src/index.jacly`,
    ]);
  });

  it('removes an incomplete temporary file when replacement fails', async () => {
    const removed: string[] = [];
    const fsp = {
      writeFile: async () => undefined,
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
    expect(removed).to.have.length(1);
    expect(removed[0]).to.match(/^\/project\/src\/index\.jacly\.tmp-/);
  });
});
