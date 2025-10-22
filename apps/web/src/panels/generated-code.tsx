import { CodeEditor } from '@/components/code/code-editor';
import { useJac } from '@/jaculus/provider/jac-context';
import { useEffect, useState } from 'react';

interface GeneratedCodePanelProps {
  code?: string;
  filePath?: string;
  editable?: boolean;
  live?: boolean;
}

export function GeneratedCodePanel({
  code,
  filePath,
  editable = true,
  live = false,
}: GeneratedCodePanelProps) {
  const { generatedCode, fsp } = useJac();
  const [fileContent, setFileContent] = useState<string>('');

  const readFile = async () => {
    if (!fsp || !filePath) return;
    try {
      const content = await fsp.readFile(filePath, 'utf8');
      setFileContent(content);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      setFileContent(`Error reading file: ${error}`);
    }
  };

  useEffect(
    () => {
      if (filePath) {
        readFile();
        if (live) {
          const interval = setInterval(readFile, 1000); // Update every second
          return () => clearInterval(interval);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filePath, live, fsp]
  );

  const displayCode = filePath ? fileContent : (code ?? generatedCode);

  return <CodeEditor value={displayCode} language="js" editable={editable} />;
}
