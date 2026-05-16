import * as chai from 'chai';
import 'mocha';
import { inferLanguageFromPath } from '../../src/editor/services/language';

const expect = chai.expect;

describe('inferLanguageFromPath', () => {
  it('returns typescript for .ts files', () => {
    expect(inferLanguageFromPath('src/app.ts')).to.equal('typescript');
  });

  it('returns javascript for .js files', () => {
    expect(inferLanguageFromPath('dist/bundle.js')).to.equal('javascript');
  });

  it('returns javascript for .mjs files', () => {
    expect(inferLanguageFromPath('lib/utils.mjs')).to.equal('javascript');
  });

  it('returns javascript for .cjs files', () => {
    expect(inferLanguageFromPath('lib/common.cjs')).to.equal('javascript');
  });

  it('returns json for .json files', () => {
    expect(inferLanguageFromPath('package.json')).to.equal('json');
  });

  it('returns json for .jacly files', () => {
    expect(inferLanguageFromPath('workspace.jacly')).to.equal('json');
  });

  it('returns plaintext for files without extension', () => {
    expect(inferLanguageFromPath('README')).to.equal('plaintext');
  });

  it('returns plaintext for unknown extensions', () => {
    expect(inferLanguageFromPath('data.csv')).to.equal('plaintext');
    expect(inferLanguageFromPath('image.png')).to.equal('plaintext');
  });

  it('returns plaintext for empty path', () => {
    expect(inferLanguageFromPath('')).to.equal('plaintext');
  });
});
