// Browser-only download wrappers — trigger file download via DOM.
// Archive packing logic is in @jaculus/project/export.

import type { FSInterface } from '@jaculus/project/fs';
import { encodeBase64Url } from '@jaculus/project/export';

export {
  packProjectAsTarGz,
  packProjectAsZip,
  collectFiles,
} from '@jaculus/project/export';
import { packProjectAsTarGz, packProjectAsZip } from '@jaculus/project/export';

// Build a shareable JacLy import URL with the archive data embedded inline.
export function buildPackageImportUrl(
  archiveBytes: Uint8Array,
  baseUrl: string = window.location.origin
): string {
  const encoded = encodeBase64Url(archiveBytes);
  return `${baseUrl}/project/import?data=${encoded}&auto=true`;
}

// Download a project as a ZIP file (browser-only).
export async function downloadProjectAsZip(
  fs: FSInterface,
  projectPath: string,
  projectName: string
): Promise<void> {
  try {
    const zipData = await packProjectAsZip(fs, projectPath);

    const blob = new Blob([new Uint8Array(zipData)], {
      type: 'application/zip',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Downloaded project as ${projectName}.zip`);
  } catch (error) {
    console.error('Failed to download project as ZIP:', error);
    throw error;
  }
}

// Download a project as a .tar.gz file (browser-only).
export async function downloadProjectAsTarGz(
  fs: FSInterface,
  projectPath: string,
  projectName: string
): Promise<void> {
  try {
    const gzData = await packProjectAsTarGz(fs, projectPath);

    const blob = new Blob([new Uint8Array(gzData)], {
      type: 'application/gzip',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}.tar.gz`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Downloaded project as ${projectName}.tar.gz`);
  } catch (error) {
    console.error('Failed to download project as TAR.GZ:', error);
    throw error;
  }
}
