interface DurableFilePromises {
  writeFile(path: string, content: string, encoding: BufferEncoding): Promise<unknown>;
  rename(oldPath: string, newPath: string): Promise<unknown>;
  unlink(path: string): Promise<unknown>;
}

let temporaryFileCounter = 0;

function getTemporaryPath(filePath: string): string {
  temporaryFileCounter += 1;
  return `${filePath}.tmp-${Date.now()}-${temporaryFileCounter}`;
}

export async function durableWriteFile(
  fsp: DurableFilePromises,
  filePath: string,
  content: string,
  encoding: BufferEncoding = 'utf-8',
): Promise<void> {
  const temporaryPath = getTemporaryPath(filePath);

  try {
    await fsp.writeFile(temporaryPath, content, encoding);
    await fsp.rename(temporaryPath, filePath);
  } catch (error) {
    await fsp.unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}
