import { useActiveProject } from '@/project';
import { ProjectLoadError } from '@/project';

export function ErrorPanel() {
  const {
    state: { error },
  } = useActiveProject();
  if (!error) return;

  return <ProjectLoadError error={error} />;
}
