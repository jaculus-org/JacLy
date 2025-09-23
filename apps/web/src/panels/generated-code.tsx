import { CodeEditor } from '@/components/code/code-editor';
import { useJac } from '@/jaculus/provider/jac-context';
import FS from '@isomorphic-git/lightning-fs';
import { useEffect, useState, useMemo } from 'react';

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
  const { generatedCode, activeProject } = useJac();
  const [fileContent, setFileContent] = useState<string>('');

  const fs = useMemo(
    () => {
      return activeProject ? new FS(activeProject.id).promises : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProject?.id]
  );

  const readFile = async () => {
    if (!fs || !filePath) return;
    try {
      const content = await fs.readFile(filePath, { encoding: 'utf8' });
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
    [filePath, live, fs]
  );

  const displayCode = filePath ? fileContent : (code ?? generatedCode);

  return <CodeEditor value={displayCode} language="js" editable={editable} />;
}
