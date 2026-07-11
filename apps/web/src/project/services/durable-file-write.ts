interface DurableFilePromises {
  writeFile(path: string, content: string, encoding: BufferEncoding): Promise<unknown>;
  readFile(path: string, encoding: BufferEncoding): Promise<string>;
  rename(oldPath: string, newPath: string): Promise<unknown>;
  unlink(path: string): Promise<unknown>;
}

const MAX_WRITE_ATTEMPTS = 3;

let temporaryFileCounter = 0;
const destinationWriteQueues = new Map<string, Promise<void>>();

function getTemporaryPath(filePath: string): string {
  temporaryFileCounter += 1;
  return `${filePath}.tmp-${Date.now()}-${temporaryFileCounter}`;
}

async function writeAndVerify(
  fsp: DurableFilePromises,
  filePath: string,
  content: string,
  encoding: BufferEncoding,
): Promise<void> {
  const temporaryPath = getTemporaryPath(filePath);

  try {
    await fsp.writeFile(temporaryPath, content, encoding);
    const temporaryContent = await fsp.readFile(temporaryPath, encoding);
    if (temporaryContent !== content) {
      throw new Error(`Temporary file verification failed for ${filePath}`);
    }

    await fsp.rename(temporaryPath, filePath);
    const persistedContent = await fsp.readFile(filePath, encoding);
    if (persistedContent !== content) {
      throw new Error(`Persisted file verification failed for ${filePath}`);
    }
  } catch (error) {
    await fsp.unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

async function writeWithRetries(
  fsp: DurableFilePromises,
  filePath: string,
  content: string,
  encoding: BufferEncoding,
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt += 1) {
    try {
      await writeAndVerify(fsp, filePath, content, encoding);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function durableWriteFile(
  fsp: DurableFilePromises,
  filePath: string,
  content: string,
  encoding: BufferEncoding = 'utf-8',
): Promise<void> {
  const previousWrite = destinationWriteQueues.get(filePath) ?? Promise.resolve();
  const currentWrite = previousWrite
    .catch(() => undefined)
    .then(() => writeWithRetries(fsp, filePath, content, encoding));
  destinationWriteQueues.set(filePath, currentWrite);

  try {
    await currentWrite;
  } finally {
    if (destinationWriteQueues.get(filePath) === currentWrite) {
      destinationWriteQueues.delete(filePath);
    }
  }
}
