export interface FileSystemItem {
  isRoot: boolean;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileSystemItem[];
}
