import * as chai from 'chai';
import 'mocha';
import { loadBlocklyMessages } from '../../src/editor/hooks/use-blockly-messages';
import { JaclyEngine } from '../../src/engine/engine';

const expect = chai.expect;

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

class FakeWorkspace {
  listeners: Array<(event: unknown) => void> = [];
  removedListeners: Array<(event: unknown) => void> = [];
  updateToolboxCalls = 0;

  addChangeListener(listener: (event: unknown) => void) {
    this.listeners.push(listener);
  }

  removeChangeListener(listener: (event: unknown) => void) {
    this.removedListeners.push(listener);
    this.listeners = this.listeners.filter((item) => item !== listener);
  }

  registerButtonCallback() {}

  getBlocksByType() {
    return [];
  }

  getBlockById() {
    return null;
  }

  getAllBlocks() {
    return [];
  }

  getToolbox() {
    return null;
  }

  updateToolbox() {
    this.updateToolboxCalls += 1;
  }
}

describe('loadBlocklyMessages', () => {
  it('ignores stale in-flight locale loads', async () => {
    const first = createDeferred<{ default: Record<string, string> }>();
    const second = createDeferred<{ default: Record<string, string> }>();
    const applied: Array<{ locale: string; messages: Record<string, string> }> = [];

    let firstActive = true;

    const firstLoad = loadBlocklyMessages(
      'cs',
      (messages, loadedLocale) => {
        applied.push({ locale: loadedLocale, messages });
      },
      {
        getLoader: () => () => first.promise,
        isCurrent: () => firstActive,
      },
    );

    const secondLoad = loadBlocklyMessages(
      'en',
      (messages, loadedLocale) => {
        applied.push({ locale: loadedLocale, messages });
      },
      {
        getLoader: () => () => second.promise,
      },
    );

    firstActive = false;
    second.resolve({ default: { BLOCK: 'new' } });
    await secondLoad;

    first.resolve({ default: { BLOCK: 'old' } });
    await firstLoad;

    expect(applied).to.deep.equal([{ locale: 'en', messages: { BLOCK: 'new' } }]);
  });
});

describe('JaclyEngine workspace lifecycle', () => {
  it('removes engine listeners when detaching a workspace', () => {
    const engine = new JaclyEngine();
    const workspace = new FakeWorkspace();

    engine.attachToWorkspace(workspace as any);
    expect(workspace.listeners).to.have.length(3);

    engine.detachFromWorkspace(workspace as any);

    expect(workspace.listeners).to.have.length(0);
    expect(workspace.removedListeners).to.have.length(3);
  });

  it('reattaches engine listeners on reload without accumulating them', () => {
    const engine = new JaclyEngine();
    const workspace = new FakeWorkspace();

    engine.attachToWorkspace(workspace as any);
    expect(workspace.listeners).to.have.length(3);

    engine.reloadBlockData({ blockFiles: {} } as any);

    expect(workspace.listeners).to.have.length(3);
    expect(workspace.removedListeners).to.have.length(3);
    expect(workspace.updateToolboxCalls).to.equal(1);
  });
});
