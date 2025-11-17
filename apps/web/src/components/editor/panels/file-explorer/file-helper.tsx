import {
  File,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  Blocks,
} from 'lucide-react';

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
