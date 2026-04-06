import * as chai from 'chai';
import 'mocha';
import * as Blockly from 'blockly/core';
import { registerPlaceholderBlock } from '../../src/core/registration/placeholder-block';

const expect = chai.expect;

describe('registerPlaceholderBlock', () => {
  it('registers unsupported_block in Blockly.Blocks', () => {
    registerPlaceholderBlock();
    expect(Blockly.Blocks['unsupported_block']).to.be.an('object');
    expect(Blockly.Blocks['unsupported_block'].init).to.be.a('function');
  });

  it('is idempotent — calling twice does not throw', () => {
    expect(() => {
      registerPlaceholderBlock();
      registerPlaceholderBlock();
    }).not.to.throw();
  });
});
