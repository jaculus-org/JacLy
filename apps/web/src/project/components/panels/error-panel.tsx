import { ProjectLoadError } from '../project-load-error';
import { useActiveProject } from '../../state/active-project-context';

export function ErrorPanel() {
  const {
    state: { error },
  } = useActiveProject();
  if (!error) return;

  return <ProjectLoadError error={error} />;
}
