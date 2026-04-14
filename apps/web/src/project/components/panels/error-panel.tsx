import { useActiveProject } from '../../state/active-project-context';
import { ProjectLoadError } from '../project-load-error';

export function ErrorPanel() {
  const {
    state: { error },
  } = useActiveProject();
  if (!error) return;

  return <ProjectLoadError error={error} />;
}
