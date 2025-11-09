import { useEffect, useCallback } from 'react';
import { getProjectById } from '@/lib/projects/project-manager';
import { EditorProvider } from '@/providers/editor-provider';
import {
  JacProjectProvider,
  useJacProject,
} from '@/providers/jac-project-provider';
import { TerminalProvider } from '@/providers/terminal-provider';
import { useHeaderActions } from '@/providers/header-provider';
import { EditorHeaderActions } from '@/components/editor/header-actions';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import { useTerminal } from '@/hooks/terminal-store';
import { jacBuildFlash } from '@/lib/device/jaculus';

export const Route = createFileRoute('/editor/$projectId')({
  loader: ({ params }) => {
    const project = getProjectById(params.projectId);
    if (!project) {
      enqueueSnackbar('I could not find the requested project.', {
        variant: 'error',
      });
      throw redirect({ to: '/editor' });
    }
    return project;
  },
  component: EditorProject,
});

function EditorProjectContent() {
  const { setActions } = useHeaderActions();
  const terminal = useTerminal();
  const { project, device, setDevice } = useJacProject();

  const onBuildFlashMonitor = useCallback(() => {
    if (!device) {
      enqueueSnackbar('No device connected.', { variant: 'error' });
      return;
    }
    jacBuildFlash(project, device, terminal.addEntry);
  }, [project, device, terminal.addEntry]);

  useEffect(() => {
    setActions(
      <EditorHeaderActions
        onBuildFlashMonitor={onBuildFlashMonitor}
        addToTerminal={terminal.addEntry}
        device={device}
        setDevice={setDevice}
      />
    );
    return () => setActions(null);
  }, [setActions, onBuildFlashMonitor, device, setDevice, terminal.addEntry]);

  return <EditorProvider />;
}

function EditorProject() {
  const project = Route.useLoaderData();

  return (
    <TerminalProvider>
      <JacProjectProvider project={project}>
        <EditorProjectContent />
      </JacProjectProvider>
    </TerminalProvider>
  );
}
