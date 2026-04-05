import * as chai from 'chai';
import 'mocha';
import { createEngineState } from '../../src/core/engine-state';

const expect = chai.expect;

describe('createEngineState', () => {
  it('returns a fresh state with empty collections', () => {
    const state = createEngineState();
    expect(state.registeredBlockTypes.size).to.equal(0);
    expect(state.blockInputs.size).to.equal(0);
    expect(state.blockImports.size).to.equal(0);
    expect(state.constructorTypes.size).to.equal(0);
    expect(state.virtualInstances.size).to.equal(0);
    expect(state.virtualInstancesByType.size).to.equal(0);
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
  it('can be imported', async () => {
    const { JaclyEngine } = await import('../../src/core/engine');
    expect(JaclyEngine).to.be.a('function');
  });
});
