import * as chai from 'chai';
import 'mocha';
import { cloneHistoryMap } from '../../src/console/key-value/key-value-history';

const expect = chai.expect;

describe('cloneHistoryMap', () => {
  it('creates a deep copy of the history map', () => {
    const original = {
      temp: [{ value: 23.5, timestamp: 1000 }],
      humidity: [{ value: 60, timestamp: 2000 }],
    };

    const cloned = cloneHistoryMap(original);

    expect(cloned).to.deep.equal(original);
    expect(cloned).to.not.equal(original);
  });

  it('does not share array references with the original', () => {
    const original = { temp: [{ value: 23.5, timestamp: 1000 }] };
    const cloned = cloneHistoryMap(original);

    cloned.temp.push({ value: 24, timestamp: 2000 });

    expect(original.temp).to.have.lengthOf(1);
    expect(cloned.temp).to.have.lengthOf(2);
  });

  it('handles empty history maps', () => {
    const result = cloneHistoryMap({});
    expect(result).to.deep.equal({});
  });
});
