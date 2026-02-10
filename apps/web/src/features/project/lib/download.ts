import { m } from '@/paraglide/messages';
import type { FSInterface } from '@jaculus/project/fs';
import { zipSync } from 'fflate';
import { enqueueSnackbar } from 'notistack';

/**
 * Recursively collect all files from a directory
 */
async function collectFiles(
  fs: FSInterface,
  dirPath: string,
  basePath: string = ''
): Promise<Record<string, Uint8Array>> {
  const files: Record<string, Uint8Array> = {};
  const items = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = `${dirPath}/${item.name}`;
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

    if (item.isDirectory()) {
      // Recursively collect files from subdirectory
      const subFiles = await collectFiles(fs, fullPath, relativePath);
      Object.assign(files, subFiles);
    } else if (item.isFile()) {
      // Read file content
      const content = await fs.promises.readFile(fullPath);
      files[relativePath] =
        content instanceof Uint8Array ? content : new Uint8Array(content);
    }
  }

  return files;
}

/**
 * Download a project as a ZIP file
 */
export async function downloadProjectAsZip(
  fs: FSInterface,
  projectPath: string,
  projectName: string
): Promise<void> {
  try {
    // Collect all files from the project directory
    const files = await collectFiles(fs, projectPath);

    if (Object.keys(files).length === 0) {
      console.warn('No files found in project');
      enqueueSnackbar(m.project_download_no_files(), {
        variant: 'warning',
      });
    }

    // Create ZIP using fflate
    const zipData = zipSync(files, { level: 6 });

    // Trigger download
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

    console.log(
      `Downloaded ${Object.keys(files).length} files as ${projectName}.zip`
    );
  } catch (error) {
    console.error('Failed to download project as ZIP:', error);
    throw error;
  }
}
