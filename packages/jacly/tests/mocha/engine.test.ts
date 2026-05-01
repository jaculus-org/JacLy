import * as chai from 'chai';
import 'mocha';
import { JaclyEngine } from '../../src/engine/engine';
import { createEngineState } from '../../src/engine/engine-state';

const expect = chai.expect;

describe('createEngineState', () => {
  it('returns a fresh state with empty collections', () => {
    const state = createEngineState();
    expect(state.registeredBlockTypes.size).to.equal(0);
    expect(state.editedInternalBlockTypes.size).to.equal(0);
    expect(state.blockInputs.size).to.equal(0);
    expect(state.blockImports.size).to.equal(0);
    expect(state.constructorBlockTypesBySystem.size).to.equal(0);
    expect(state.virtualDefsByProviderBlockType.size).to.equal(0);
    expect(state.instanceTrackers).to.be.instanceOf(WeakMap);
    expect(state.docsCallbacks.size).to.equal(0);
  });

  it('produces isolated state per call', () => {
    const state1 = createEngineState();
    const state2 = createEngineState();

    state1.registeredBlockTypes.add('my_block');

    expect(state1.registeredBlockTypes.has('my_block')).to.equal(true);
    expect(state2.registeredBlockTypes.has('my_block')).to.equal(false);
  });
});

describe('JaclyEngine', () => {
  it('can be imported', () => {
    expect(JaclyEngine).to.be.a('function');
  });
});
