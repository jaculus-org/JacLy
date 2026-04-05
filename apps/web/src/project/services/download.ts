// Browser-only download wrappers — trigger file download via DOM.
// Archive packing logic is in @jaculus/project/export.

import type { FSInterface } from '@jaculus/project/fs';
import { fromUint8Array } from 'js-base64';

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
  const encoded = fromUint8Array(archiveBytes, true);
  return `${baseUrl}/project/import?data=${encoded}&auto=true`;
}

function triggerDownload(data: Uint8Array, filename: string, mimeType: string) {
  const blob = new Blob([Uint8Array.from(data)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download a project as a ZIP file (browser-only).
export async function downloadProjectAsZip(
  fs: FSInterface,
  projectPath: string,
  projectName: string
): Promise<void> {
  const zipData = await packProjectAsZip(fs, projectPath);
  triggerDownload(
    new Uint8Array(zipData),
    `${projectName}.zip`,
    'application/zip'
  );
}

// Download a project as a .tar.gz file (browser-only).
export async function downloadProjectAsTarGz(
  fs: FSInterface,
  projectPath: string,
  projectName: string
): Promise<void> {
  const gzData = await packProjectAsTarGz(fs, projectPath);
  triggerDownload(
    new Uint8Array(gzData),
    `${projectName}.tar.gz`,
    'application/gzip'
  );
}
