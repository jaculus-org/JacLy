import * as chai from 'chai';
import 'mocha';
import {
  formatFileSize,
  isAcceptedFile,
} from '../../src/project/components/project-import/project-import-utils';

const expect = chai.expect;

function mockFile(name: string): File {
  return new File([''], name);
}

describe('isAcceptedFile', () => {
  it('accepts .zip files', () => {
    expect(isAcceptedFile(mockFile('project.zip'))).to.be.true;
  });

  it('accepts .tar files', () => {
    expect(isAcceptedFile(mockFile('project.tar'))).to.be.true;
  });

  it('accepts .tar.gz files', () => {
    expect(isAcceptedFile(mockFile('project.tar.gz'))).to.be.true;
  });

  it('accepts .tgz files', () => {
    expect(isAcceptedFile(mockFile('project.tgz'))).to.be.true;
  });

  it('rejects .pdf files', () => {
    expect(isAcceptedFile(mockFile('doc.pdf'))).to.be.false;
  });

  it('rejects files with no extension', () => {
    expect(isAcceptedFile(mockFile('README'))).to.be.false;
  });

  it('is case-insensitive', () => {
    expect(isAcceptedFile(mockFile('Project.ZIP'))).to.be.true;
    expect(isAcceptedFile(mockFile('Project.TAR.GZ'))).to.be.true;
  });
});

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(0)).to.equal('0 B');
    expect(formatFileSize(500)).to.equal('500 B');
    expect(formatFileSize(1023)).to.equal('1023 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).to.equal('1.0 KB');
    expect(formatFileSize(1536)).to.equal('1.5 KB');
    expect(formatFileSize(1024 * 1024 - 1)).to.equal('1024.0 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).to.equal('1.00 MB');
    expect(formatFileSize(5 * 1024 * 1024)).to.equal('5.00 MB');
    expect(formatFileSize(1536 * 1024)).to.equal('1.50 MB');
  });
});
