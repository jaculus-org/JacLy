import { useJacProject } from '@/providers/jac-project-provider';
import { useTheme } from '@/providers/theme-provider';
import { JaclyEditor } from '@jaculus/jacly/editor';
import { JaclyBlocks } from '@jaculus/jacly/blocks';
import './index.css';
import { fs } from '@zenfs/core';
import { getProjectFsRoot } from '@/lib/projects/project-manager';
import type { FSInterface } from '@jaculus/project/fs';
import { useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';

export function BlocklyEditorPanel() {
  const { themeNormalized } = useTheme();
  const { projectInstance, project } = useJacProject();
  const jaclyBlocks = new JaclyBlocks(
    getProjectFsRoot(project.id),
    fs as unknown as FSInterface,
    projectInstance.getJacLyFiles()
  );

  // on load install dependencies using
  useEffect(() => {
    projectInstance.install().then(() => {
      enqueueSnackbar('Project dependencies installed.', { variant: 'info' });
    });
  }, [projectInstance]);

  return <JaclyEditor theme={themeNormalized} jaclyBlocks={jaclyBlocks} />;
}
