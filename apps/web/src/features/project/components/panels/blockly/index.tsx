import { useTheme } from '@/features/theme/components/theme-provider';
import './index.css';
import { useActiveProject } from '@/features/project/provider/active-project-provider';

export function BlocklyEditorPanel() {
  const { themeNormalized } = useTheme();
  const { dbProject } = useActiveProject();

  console.log('project in blockly panel', dbProject);
  console.log('themeNormalized in blockly panel', themeNormalized);

  // return <JaclyEditor theme={themeNormalized} jaclyBlocks={jaclyBlocks} />;
  return <>Jacly editor</>;
}
