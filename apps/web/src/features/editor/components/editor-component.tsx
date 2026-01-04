import { useActiveProject } from '@/hooks/use-active-project';
import { EditorHeader } from './editor-header';
import { useEffect, useEffectEvent, useState } from 'react';

export function EditorComponent() {
  const { fsp, projectPath, project } = useActiveProject();
  const [testFileContent, setTestFileContent] = useState<string | null>(null);

  const effectEvent = useEffectEvent(async () => {
    try {
      const content = await fsp.readFile(`${projectPath}/temp.txt`, 'utf-8');
      setTestFileContent(content);
    } catch {
      console.log('test.txt not found or could not be read');
    }
  });

  useEffect(() => {
    effectEvent();
  }, []);

  return (
    <>
      <EditorHeader />
      <h1 className="text-2xl font-bold mb-4">Editor Component</h1>
      <p>
        Project Name: {project.name} (Type: {project.type})
      </p>
      <p className="text-muted-foreground text-sm">
        Project Path: {projectPath}
      </p>
      {testFileContent && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <h2 className="text-sm font-medium mb-2">test.txt contents:</h2>
          <pre className="text-xs whitespace-pre-wrap">{testFileContent}</pre>
        </div>
      )}
    </>
  );
}
