import * as chai from 'chai';
import 'mocha';
import { jaclySaveCoordinator } from '../../src/editor/jacly/jacly-save-coordinator';

const expect = chai.expect;

describe('jaclySaveCoordinator', () => {
  it('flushes all registered callbacks', async () => {
    const calls: string[] = [];
    const unregisterOne = jaclySaveCoordinator.registerFlushCallback(
      async () => {
        calls.push('one');
      },
      () => false,
    );
    const unregisterTwo = jaclySaveCoordinator.registerFlushCallback(
      async () => {
        calls.push('two');
      },
      () => false,
    );

    await jaclySaveCoordinator.flushPendingWrites();

    expect(calls.sort()).to.deep.equal(['one', 'two']);

    unregisterOne();
    unregisterTwo();
  });

  it('does not call callbacks after unregister', async () => {
    let callCount = 0;
    const unregister = jaclySaveCoordinator.registerFlushCallback(
      async () => {
        callCount += 1;
      },
      () => false,
    );

    unregister();
    await jaclySaveCoordinator.flushPendingWrites();

    expect(callCount).to.equal(0);
  });

  it('reports pending writes from registered participants', () => {
    let pending = false;
    const unregister = jaclySaveCoordinator.registerFlushCallback(
      async () => undefined,
      () => pending,
    );

    expect(jaclySaveCoordinator.hasPendingWrites()).to.equal(false);
    pending = true;
    expect(jaclySaveCoordinator.hasPendingWrites()).to.equal(true);

    unregister();
    expect(jaclySaveCoordinator.hasPendingWrites()).to.equal(false);
  });
});
