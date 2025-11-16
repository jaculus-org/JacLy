import { useJacProject } from '@/providers/jac-project-provider';
import { useTheme } from '@/providers/theme-provider';
import { JaclyEditor } from '@jaculus/jacly/editor';
import { JaclyBlocks } from '@jaculus/jacly/blocks';
import './index.css';
import { fs } from '@zenfs/core';
import { getProjectFsRoot } from '@/lib/projects/project-manager';
import type { FSInterface } from '@jaculus/project/fs';

export function BlocklyEditorPanel() {
  const { themeNormalized } = useTheme();
  // const { projectInstance, project } = useJacProject();
  const { project } = useJacProject();
  const jaclyBlocks = new JaclyBlocks(
    getProjectFsRoot(project.id),
    fs as unknown as FSInterface
  );

  // useEffect(() => {
  //   async function loadJaclyFiles() {
  //     enqueueSnackbar('Loading JacLy files into Blockly...', {
  //       variant: 'info',
  //     });
  //     try {
  //       await projectInstance.install();
  //       // const jaclyFiles = await projectInstance.getJacLyFiles();
  //       // console.log('Loading JacLy files into Blockly:', jaclyFiles);
  //     } catch (error) {
  //       console.error('Error loading JacLy files into Blockly:', error);
  //       enqueueSnackbar('Failed to load JacLy files into Blockly.', {
  //         variant: 'error',
  //       });
  //     }
  //   }
  //   setTimeout(() => {
  //     loadJaclyFiles();
  //   }, 1000);
  // }, [projectInstance]);

  return <JaclyEditor theme={themeNormalized} jaclyBlocks={jaclyBlocks} />;
}
