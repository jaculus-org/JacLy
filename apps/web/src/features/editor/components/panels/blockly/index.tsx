import { useTheme } from '@/features/theme/components/theme-provider';
import './index.css';
import { useActiveProject } from '@/hooks/use-active-project';

export function BlocklyEditorPanel() {
  const { themeNormalized } = useTheme();
  const { project } = useActiveProject();

  console.log('project in blockly panel', project);
  console.log('themeNormalized in blockly panel', themeNormalized);

  // return <JaclyEditor theme={themeNormalized} jaclyBlocks={jaclyBlocks} />;
  return <>Jacly editor</>;
}
