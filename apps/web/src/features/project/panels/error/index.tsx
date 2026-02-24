import { useActiveProject } from '@/features/project/active-project';
import { ProjectLoadError } from '@/features/project/components';

export function ErrorPanel() {
  const {
    state: { error },
  } = useActiveProject();
  if (!error) return;

  return <ProjectLoadError error={error} />;
}
