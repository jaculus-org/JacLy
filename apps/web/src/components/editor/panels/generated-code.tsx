import { getBuildPath } from '@/lib/projects';
import path from 'path';
import { CodePanel } from './code';
import type { JacProject } from '@/components/projects/projects-list';

export function GeneratedCodePanel({ project }: { project: JacProject }) {
  const generatedCodePath = path.join(getBuildPath(project), 'index.js');
  return (
    <CodePanel
      filePath={generatedCodePath}
      readOnly={true}
      ifNotExists="loading"
      loadingMessage="Waiting for generated code..."
    />
  );
}
