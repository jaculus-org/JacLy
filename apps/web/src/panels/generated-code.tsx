import { CodeEditor } from '@/components/code/CodeEditor';
import { useJac } from '@/jaculus/provider/jac-context';

export function GeneratedCodePanel() {
  const { generatedCode } = useJac();

  return <CodeEditor value={generatedCode} language="js" />;
}
