// Browser-only wrapper for loadPackageFromBytes — handles the File Web API.

export {
  loadPackageFromBytes,
  loadPackageFromUri,
  type PackageLoadResult,
} from '@jaculus/project/import';
import {
  loadPackageFromBytes,
  type PackageLoadResult,
} from '@jaculus/project/import';

// Load package from a browser File object (ZIP or TAR.GZ).
export async function loadPackageFromFile(
  file: File
): Promise<PackageLoadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  return loadPackageFromBytes(data);
}
