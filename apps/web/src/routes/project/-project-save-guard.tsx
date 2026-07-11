import { useBlocker } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect } from 'react';
import { m } from '@/core/paraglide/messages';
import { jaclySaveCoordinator } from '@/editor';
import { useActiveProject } from '@/project';

export function ProjectSaveGuard() {
  const {
    state: { monacoService },
  } = useActiveProject();

  const hasPendingWrites = useCallback(
    () => jaclySaveCoordinator.hasPendingWrites() || Boolean(monacoService?.hasPendingWrites()),
    [monacoService],
  );

  const flushPendingWrites = useCallback(async () => {
    await Promise.all([jaclySaveCoordinator.flushPendingWrites(), monacoService?.flush()]);
  }, [monacoService]);

  useBlocker({
    shouldBlockFn: async () => {
      try {
        await flushPendingWrites();
        return false;
      } catch (error) {
        console.error('Failed to flush project files before navigation:', error);
        enqueueSnackbar(m.project_save_before_leave_error(), { variant: 'error' });
        return true;
      }
    },
    enableBeforeUnload: hasPendingWrites,
  });

  useEffect(() => {
    const flushBestEffort = () => {
      void flushPendingWrites().catch((error) => {
        console.error('Failed to flush project files during page lifecycle change:', error);
      });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasPendingWrites()) {
        flushBestEffort();
      }
    };

    window.addEventListener('pagehide', flushBestEffort);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flushBestEffort);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushPendingWrites, hasPendingWrites]);

  return null;
}
