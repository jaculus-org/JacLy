import * as chai from 'chai';
import 'mocha';
import { jaclySaveCoordinator } from '../../src/editor/state/jacly-save-coordinator';

const expect = chai.expect;

describe('jaclySaveCoordinator', () => {
  it('flushes all registered callbacks', async () => {
    const calls: string[] = [];
    const unregisterOne = jaclySaveCoordinator.registerFlushCallback(async () => {
      calls.push('one');
    });
    const unregisterTwo = jaclySaveCoordinator.registerFlushCallback(async () => {
      calls.push('two');
    });

    await jaclySaveCoordinator.flushPendingWrites();

    expect(calls.sort()).to.deep.equal(['one', 'two']);

    unregisterOne();
    unregisterTwo();
  });

  it('does not call callbacks after unregister', async () => {
    let callCount = 0;
    const unregister = jaclySaveCoordinator.registerFlushCallback(async () => {
      callCount += 1;
    });

    unregister();
    await jaclySaveCoordinator.flushPendingWrites();

    expect(callCount).to.equal(0);
  });
});
