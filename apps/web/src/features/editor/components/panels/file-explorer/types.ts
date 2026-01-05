export interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileSystemItem[];
}
