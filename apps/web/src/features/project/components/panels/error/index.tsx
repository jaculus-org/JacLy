import { ProjectLoadError } from '../../project-load-error';
import { useActiveProject } from '@/features/project/provider/active-project-provider';

export function ErrorPanel() {
  const { error } = useActiveProject();
  if (!error) return;

  return <ProjectLoadError error={error} />;
}
