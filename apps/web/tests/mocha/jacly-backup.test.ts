import * as chai from 'chai';
import 'mocha';
import { findNewestValidBackup } from '../../src/editor/jacly/jacly-backup-recovery';
import type { ProjectFsPromises } from '../../src/editor/jacly/jacly-files';

const expect = chai.expect;

describe('findNewestValidBackup', () => {
  it('skips a newer invalid backup and returns the newest valid JSON object', async () => {
    const contents = new Map([
      ['/project/backup/index-A-new.jacly', '{"blocks":'],
      ['/project/backup/index-S-middle.jacly', '{"blocks":{"languageVersion":0}}'],
      ['/project/backup/index-A-old.jacly', '{"old":true}'],
    ]);
    const mtimes = new Map([
      ['/project/backup/index-A-new.jacly', 300],
      ['/project/backup/index-S-middle.jacly', 200],
      ['/project/backup/index-A-old.jacly', 100],
    ]);
    const fsp = {
      readdir: async () => ['index-A-old.jacly', 'index-S-middle.jacly', 'index-A-new.jacly'],
      stat: async (path: string) => ({ mtimeMs: mtimes.get(path) ?? 0 }),
      readFile: async (path: string) => contents.get(path) ?? '',
    } as unknown as ProjectFsPromises;

    const backup = await findNewestValidBackup(fsp, '/project', '/project/src/index.jacly');

    expect(backup?.name).to.equal('index-S-middle.jacly');
    expect(backup?.json).to.deep.equal({ blocks: { languageVersion: 0 } });
  });

  it('returns null when no backup contains a JSON object', async () => {
    const fsp = {
      readdir: async () => ['index-A-invalid.jacly'],
      stat: async () => ({ mtimeMs: 100 }),
      readFile: async () => '[1,2,3]',
    } as unknown as ProjectFsPromises;

    const backup = await findNewestValidBackup(fsp, '/project', '/project/src/index.jacly');

    expect(backup).to.equal(null);
  });
});
