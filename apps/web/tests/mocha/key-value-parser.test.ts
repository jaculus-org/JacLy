import * as chai from 'chai';
import 'mocha';
import { parseKeyValue } from '../../src/console/key-value/key-value-parser';

const expect = chai.expect;

describe('parseKeyValue', () => {
  it('parses a single key:value pair', () => {
    const result = parseKeyValue('temp: 23.5');
    expect(result.temp).to.exist;
    expect(result.temp.value).to.equal(23.5);
    expect(result.temp.timestamp).to.be.a('number');
  });

  it('parses multiple key:value pairs on one line', () => {
    const result = parseKeyValue('temp: 23.5; humidity: 60.2');
    expect(result.temp.value).to.equal(23.5);
    expect(result.humidity.value).to.equal(60.2);
  });

  it('returns empty map for empty string', () => {
    const result = parseKeyValue('');
    expect(result).to.deep.equal({});
  });

  it('ignores invalid formats', () => {
    const result = parseKeyValue('hello world');
    expect(result).to.deep.equal({});
  });

  it('parses integer values', () => {
    const result = parseKeyValue('count: 42');
    expect(result.count.value).to.equal(42);
  });

  it('parses negative values', () => {
    const result = parseKeyValue('offset: -10');
    expect(result.offset.value).to.equal(-10);
  });

  it('ignores keys starting with a digit', () => {
    const result = parseKeyValue('123key: 10');
    expect(result['123key']).to.not.exist;
  });

  it('parses values across multiple lines', () => {
    const result = parseKeyValue('temp: 23.5\nhumidity: 60.2');
    expect(result.temp.value).to.equal(23.5);
    expect(result.humidity.value).to.equal(60.2);
  });

  it('skips empty lines between entries', () => {
    const result = parseKeyValue('temp: 23.5\n\nhumidity: 60.2');
    expect(result.temp.value).to.equal(23.5);
    expect(result.humidity.value).to.equal(60.2);
  });

  it('assigns the same timestamp to all parsed entries in a call', () => {
    const before = Date.now();
    const result = parseKeyValue('a: 1; b: 2');
    const after = Date.now();
    expect(result.a.timestamp).to.be.at.least(before);
    expect(result.a.timestamp).to.be.at.most(after);
    expect(result.b.timestamp).to.equal(result.a.timestamp);
  });
});
