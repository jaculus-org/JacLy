export interface UniversalFS {
  mkdir(
    path: string,
    opts?: { recursive?: boolean }
  ): Promise<string | undefined>;
  writeFile(path: string, data: Uint8Array | string): Promise<void>;
  readFile(path: string): Promise<Uint8Array>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<{ isFile(): boolean; isDirectory(): boolean }>;
}
