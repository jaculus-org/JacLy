import * as chai from 'chai';
import 'mocha';
import { classifyProjectFile } from '../../../src/editor/services/monaco-project-service.ts';

const expect = chai.expect;

describe('classifyProjectFile', () => {
  it('classifies TypeScript source files', () => {
    expect(classifyProjectFile('src/index.ts')).to.equal('source');
    expect(classifyProjectFile('src/utils/helper.ts')).to.equal('source');
    expect(classifyProjectFile('package.json')).to.equal('source');
  });

  it('classifies project-level .d.ts files as typedef', () => {
    expect(classifyProjectFile('src/types/global.d.ts')).to.equal('typedef');
  });

  it('classifies node_modules .d.ts files as typedef', () => {
    expect(
      classifyProjectFile('node_modules/@types/jaculus/index.d.ts')
    ).to.equal('typedef');
    expect(
      classifyProjectFile('node_modules/somelib/dist/index.d.ts')
    ).to.equal('typedef');
  });

  it('skips non-.d.ts files in node_modules', () => {
    expect(classifyProjectFile('node_modules/somelib/index.js')).to.equal(
      'skip'
    );
    expect(classifyProjectFile('node_modules/somelib/package.json')).to.equal(
      'skip'
    );
  });

  it('skips build directory entirely', () => {
    expect(classifyProjectFile('build/index.js')).to.equal('skip');
    expect(classifyProjectFile('build/output.d.ts')).to.equal('skip');
  });

  it('classifies .jacly files as source (rendered as json, not javascript)', () => {
    expect(classifyProjectFile('src/index.jacly')).to.equal('source');
  });

  it('skips non-code files like markdown', () => {
    expect(classifyProjectFile('README.md')).to.equal('skip');
  });
});
