type WriteFileFn = (path: string, content: string, encoding: BufferEncoding) => Promise<void>;

export interface LatestFileWriter {
  schedule: (content: string) => void;
  flushPending: () => Promise<void>;
  dispose: () => Promise<void>;
}

export function createLatestFileWriter({
  writeFile,
  filePath,
}: {
  writeFile: WriteFileFn;
  filePath: string;
}): LatestFileWriter {
  let pendingContent: string | null = null;
  let activeWrite: Promise<void> | null = null;

  const flushLoop = async () => {
    while (pendingContent != null) {
      const content = pendingContent;
      pendingContent = null;
      await writeFile(filePath, content, 'utf-8');
    }
  };

  const ensureFlush = () => {
    if (activeWrite) {
      return activeWrite;
    }

    activeWrite = (async () => {
      try {
        await flushLoop();
      } finally {
        activeWrite = null;
        if (pendingContent != null) {
          await ensureFlush();
        }
      }
    })();

    return activeWrite;
  };

  const schedule = (content: string) => {
    pendingContent = content;
    void ensureFlush();
  };

  const flushPending = async () => {
    if (pendingContent == null && !activeWrite) return;
    await ensureFlush();
  };

  const dispose = async () => {
    await flushPending();
  };

  return {
    schedule,
    flushPending,
    dispose,
  };
}
