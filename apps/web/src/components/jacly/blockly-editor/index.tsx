import { useJac } from '@/jaculus/provider/jac-context';
import { useTheme } from '@/providers/theme-provider';
import FS from '@isomorphic-git/lightning-fs';
import { JaclyEditor } from '@jaculus/jacly/ui';

export function BlocklyEditor() {
  const { themeNormalized } = useTheme();
  const { setGeneratedCode } = useJac();
  const { activeProject } = useJac();

  if (!activeProject) {
    return <div>Please select or create a project to start coding!</div>;
  }

  const fs = new FS(activeProject.id).promises;

  async function onCodeChange(code: string) {
    await fs.writeFile('main.js', code);
    setGeneratedCode(code);
  }

  return (
    <JaclyEditor
      theme={themeNormalized}
      onCodeChange={async code => await onCodeChange(code)}
    />
  );
}
