import { CodeEditor } from '@/components/code/code-editor';
import { useJac } from '@/jaculus/provider/jac-context';
import { useEffect, useState } from 'react';

interface CodePanelFsProps {
  code: string;
  filePath: string;
  editable?: boolean;
  live?: boolean;
}

export function CodePanelFs({
  filePath,
  editable = false,
  live = false,
}: CodePanelFsProps) {
  const { fs } = useJac();
  const [fileContent, setFileContent] = useState<string>('');

  useEffect(() => {
    if (!fs || !filePath) return;

    const readFile = async () => {
      try {
        const content = await fs.promises.readFile(filePath, 'utf8');
        setFileContent(content);
      } catch (error) {
        console.error('Failed to read file:', error);
        setFileContent('');
      }
    };

    readFile();

    if (live) {
      fs.watchFile(filePath, () => {
        readFile();
      });
    }

    return () => {
      if (live) {
        fs.unwatchFile(filePath);
      }
    };
  }, [fs, filePath, live]);

  const handleCodeChange = async (value: string | undefined) => {
    if (!fs || !filePath || !editable) return;

    const newContent = value || '';
    setFileContent(newContent);

    try {
      await fs.promises.writeFile(filePath, newContent, 'utf8');
    } catch (error) {
      console.error('Failed to write file:', error);
    }
  };

  return (
    <CodeEditor
      value={fileContent}
      language="js"
      editable={editable}
      onChange={handleCodeChange}
    />
  );
}
