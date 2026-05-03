'use client';

import type fs from 'node:fs';
import { File, FileAudio, FileCode, FileImage, FileText, FileVideo } from 'lucide-react';
import { createElement } from 'react';
import type { FileSystemItem } from '../types';

function createJaclyIcon() {
  return createElement('img', {
    src: '/favicon/favicon.svg',
    alt: '',
    width: 16,
    height: 16,
    className: 'size-4 shrink-0',
  });
}

export async function buildFileTree(
  fsp: typeof fs.promises,
  path: string,
): Promise<FileSystemItem[]> {
  try {
    const entries = await fsp.readdir(path, { withFileTypes: true });
    const items: FileSystemItem[] = [];

    for (const entry of entries) {
      const name = entry.name;
      const itemPath = path === '/' ? `/${name}` : `${path}/${name}`;
      const isDirectory = entry.isDirectory();

      items.push({
        isRoot: false,
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
  item: FileSystemItem,
): Promise<FileSystemItem[]> {
  if (!item.isDirectory) return [];
  return buildFileTree(fsp, item.path);
}

export function getFileIcon(fileName: string, isDirectory: boolean) {
  if (isDirectory) return null;

  const ext = fileName.split('.').pop()?.toLowerCase();
  const iconProps = { size: 16, className: 'text-blue-400' };

  switch (ext) {
    case undefined:
      return createElement(File, iconProps);
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
      return createElement(FileCode, {
        ...iconProps,
        className: 'text-project-code',
      });
    case 'txt':
    case 'md':
    case 'json':
    case 'xml':
    case 'html':
    case 'css':
      return createElement(FileText, {
        ...iconProps,
        className: 'text-green-400',
      });
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return createElement(FileImage, {
        ...iconProps,
        className: 'text-purple-400',
      });
    case 'mp4':
    case 'avi':
    case 'mov':
      return createElement(FileVideo, {
        ...iconProps,
        className: 'text-red-400',
      });
    case 'mp3':
    case 'wav':
    case 'ogg':
      return createElement(FileAudio, {
        ...iconProps,
        className: 'text-pink-400',
      });
    case 'jacly':
      return createJaclyIcon();
    default:
      return createElement(File, iconProps);
  }
}
