import * as chai from 'chai';
import 'mocha';
import { DeferredUnmountCoordinator } from '../../src/project/services/deferred-unmount';

const expect = chai.expect;

describe('DeferredUnmountCoordinator', () => {
  it('keeps the filesystem mounted until pending cleanup settles', async () => {
    const unmounted: string[] = [];
    let finishCleanup: (() => void) | undefined;
    const cleanup = new Promise<void>((resolve) => {
      finishCleanup = resolve;
    });
    const coordinator = new DeferredUnmountCoordinator();

    coordinator.schedule('project', cleanup, () => unmounted.push('project'));
    await Promise.resolve();
    expect(unmounted).to.deep.equal([]);

    finishCleanup?.();
    await cleanup;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(unmounted).to.deep.equal(['project']);
  });

  it('cancels an older deferred unmount when the project mounts again', async () => {
    const unmounted: string[] = [];
    let finishCleanup: (() => void) | undefined;
    const cleanup = new Promise<void>((resolve) => {
      finishCleanup = resolve;
    });
    const coordinator = new DeferredUnmountCoordinator();

    coordinator.schedule('project', cleanup, () => unmounted.push('project'));
    coordinator.cancel('project');
    finishCleanup?.();
    await cleanup;
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(unmounted).to.deep.equal([]);
  });
});
