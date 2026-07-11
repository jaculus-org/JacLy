type WriteFileFn = (path: string, content: string, encoding: BufferEncoding) => Promise<void>;

export interface LatestFileWriter {
  schedule: (content: string) => void;
  flushPending: () => Promise<void>;
  isPending: () => boolean;
  dispose: () => Promise<void>;
}

export function createLatestFileWriter({
  writeFile,
  filePath,
  onError,
}: {
  writeFile: WriteFileFn;
  filePath: string;
  onError?: (error: unknown) => void;
}): LatestFileWriter {
  let pendingContent: string | null = null;
  let activeWrite: Promise<void> | null = null;
  let writeError: unknown = null;

  const flushLoop = async () => {
    while (pendingContent != null) {
      const content = pendingContent;
      pendingContent = null;
      await writeFile(filePath, content, 'utf-8');
    }
  };

  const ensureFlush = (): Promise<void> => {
    if (activeWrite) {
      return activeWrite;
    }

    activeWrite = flushLoop()
      .then(() => {
        writeError = null;
      })
      .catch((error) => {
        writeError = error;
        throw error;
      })
      .finally(() => {
        activeWrite = null;
      });

    return activeWrite;
  };

  const schedule = (content: string) => {
    pendingContent = content;
    void ensureFlush().catch((error) => onError?.(error));
  };

  const flushPending = async () => {
    while (pendingContent != null || activeWrite) {
      await ensureFlush();
    }
    if (writeError) throw writeError;
  };

  const dispose = async () => {
    await flushPending();
  };

  return {
    schedule,
    flushPending,
    isPending: () => pendingContent != null || activeWrite != null,
    dispose,
  };
}
