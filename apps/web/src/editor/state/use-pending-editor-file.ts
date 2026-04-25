import { useCallback, useEffect, useRef } from 'react';
import type { MonacoService } from '@/project/services/monaco-service';
import { ensureParentDir, type ProjectFsPromises } from './jacly-files';

interface UsePendingEditorFileOptions<TValue> {
  delayMs: number;
  filePath: string;
  fsp: ProjectFsPromises;
  monacoService: MonacoService | null;
  onError: (error: unknown) => void;
  serialize: (value: TValue) => string;
}

interface PendingEditorFileController<TValue> {
  flush: () => Promise<void>;
  hasPendingChanges: () => boolean;
  schedule: (value: TValue) => void;
}

export function usePendingEditorFile<TValue>({
  delayMs,
  filePath,
  fsp,
  monacoService,
  onError,
  serialize,
}: UsePendingEditorFileOptions<TValue>): PendingEditorFileController<TValue> {
  const pendingValueRef = useRef<TValue | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = useCallback(async () => {
    if (saveTimerRef.current !== undefined) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = undefined;
    }

    if (pendingValueRef.current === null) return;

    const pendingValue = pendingValueRef.current;
    pendingValueRef.current = null;
    const serialized = serialize(pendingValue);

    try {
      await ensureParentDir(fsp, filePath);
      await fsp.writeFile(filePath, serialized, 'utf-8');
    } catch (error) {
      onError(error);
    }
  }, [filePath, fsp, monacoService, onError, serialize]);

  const schedule = useCallback(
    (value: TValue) => {
      pendingValueRef.current = value;

      if (saveTimerRef.current !== undefined) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        void flush();
      }, delayMs);
    },
    [delayMs, flush],
  );

  const hasPendingChanges = useCallback(() => {
    return pendingValueRef.current !== null;
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== undefined) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    flush,
    hasPendingChanges,
    schedule,
  };
}
