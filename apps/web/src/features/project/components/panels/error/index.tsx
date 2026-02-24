import { ProjectLoadError } from '../../project-load-error';
import { useActiveProject } from '@/features/project/active-project';

export function ErrorPanel() {
  const {
    state: { error },
  } = useActiveProject();
  if (!error) return;

  return <ProjectLoadError error={error} />;
}
