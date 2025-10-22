import { useJac } from '@/jaculus/provider/jac-context';
import { useTheme } from '@/providers/theme-provider';
import { JaclyEditor } from '@jaculus/jacly/ui';

export function BlocklyEditor() {
  const { themeNormalized } = useTheme();
  const { setGeneratedCode, fsp } = useJac();
  const { activeProject } = useJac();

  if (!activeProject) {
    return <div>Please select or create a project to start coding!</div>;
  }

  if (!fsp) {
    return <div>Loading filesystem...</div>;
  }

  async function onCodeChange(code: string) {
    await fsp!.writeFile('/src/main.js', code);
    setGeneratedCode(code);
  }

  return (
    <JaclyEditor
      theme={themeNormalized}
      onCodeChange={async code => await onCodeChange(code)}
    />
  );
}
