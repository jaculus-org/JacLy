import {
  File,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  Blocks,
} from 'lucide-react';
import type { FileSystemItem } from './types';
import type fs from 'fs';

export async function buildFileTree(
  fsp: typeof fs.promises,
  path: string
): Promise<FileSystemItem[]> {
  try {
    const entries = await fsp.readdir(path, { withFileTypes: true });
    const items: FileSystemItem[] = [];

    for (const entry of entries) {
      const name = entry.name;
      const itemPath = path === '/' ? `/${name}` : `${path}/${name}`;
      const isDirectory = entry.isDirectory();

      items.push({
        name,
        path: itemPath,
        isDirectory,
        children: isDirectory ? [] : undefined,
      });
    }

    return items.sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      }
      return a.isDirectory ? -1 : 1;
    });
  } catch (error) {
    console.error('Error building file tree:', error);
    return [];
  }
}

export async function loadDirectoryChildren(
  fsp: typeof fs.promises,
  item: FileSystemItem
): Promise<FileSystemItem[]> {
  if (!item.isDirectory) return [];
  return buildFileTree(fsp, item.path);
}

export function getFileIcon(fileName: string, isDirectory: boolean) {
  if (isDirectory) return null; // Will be handled separately

  const ext = fileName.split('.').pop()?.toLowerCase();
  const doubleExts = fileName.toLowerCase().split('.').slice(-2).join('.');
  const iconProps = { size: 16, className: 'text-blue-400' };

  switch (ext) {
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
      return <FileCode {...iconProps} className="text-yellow-400" />;
    case 'txt':
    case 'md':
    case 'json':
    case 'xml':
    case 'html':
    case 'css':
      if (doubleExts === 'jacly.json') {
        return <Blocks {...iconProps} className="text-orange-400" />;
      }
      return <FileText {...iconProps} className="text-green-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImage {...iconProps} className="text-purple-400" />;
    case 'mp4':
    case 'avi':
    case 'mov':
      return <FileVideo {...iconProps} className="text-red-400" />;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <FileAudio {...iconProps} className="text-pink-400" />;
    case 'jacly':
      return <Blocks {...iconProps} className="text-orange-400" />;
    default:
      return <File {...iconProps} />;
  }
}
