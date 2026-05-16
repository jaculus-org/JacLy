import * as chai from 'chai';
import 'mocha';
import { packageEventsService } from '../../src/packages/services/package-events-service';

const expect = chai.expect;

describe('packageEventsService', () => {
  const listeners: Array<() => void> = [];

  afterEach(() => {
    for (const unsub of listeners) unsub();
    listeners.length = 0;
  });

  it('notifyPackagesChanged calls all listeners', () => {
    const calls: string[] = [];
    listeners.push(packageEventsService.onPackagesChanged(() => calls.push('a')));
    listeners.push(packageEventsService.onPackagesChanged(() => calls.push('b')));

    packageEventsService.notifyPackagesChanged();

    expect(calls).to.have.members(['a', 'b']);
  });

  it('onPackagesChanged returns an unsubscribe function', () => {
    let callCount = 0;
    const unsubscribe = packageEventsService.onPackagesChanged(() => {
      callCount += 1;
    });

    packageEventsService.notifyPackagesChanged();
    expect(callCount).to.equal(1);

    unsubscribe();
    packageEventsService.notifyPackagesChanged();
    expect(callCount).to.equal(1);
  });

  it('a listener error does not block other listeners', () => {
    const calls: string[] = [];
    listeners.push(
      packageEventsService.onPackagesChanged(() => {
        throw new Error('boom');
      }),
    );
    listeners.push(packageEventsService.onPackagesChanged(() => calls.push('ok')));

    packageEventsService.notifyPackagesChanged();

    expect(calls).to.deep.equal(['ok']);
  });

  it('multiple unsubscribes are safe', () => {
    let callCount = 0;
    const unsubscribe = packageEventsService.onPackagesChanged(() => callCount++);

    unsubscribe();
    unsubscribe();

    packageEventsService.notifyPackagesChanged();
    expect(callCount).to.equal(0);
  });
});
