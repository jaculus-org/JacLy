export { ActiveProjectProvider } from './active-project-provider';
export {
  useActiveProject,
  type ActiveProjectActions,
  type ActiveProjectContextValue,
  type ActiveProjectMeta,
  type ActiveProjectState,
  type ProjectError,
  type ProjectErrorReason,
} from './active-project-context';

import { ActiveProjectProvider } from './active-project-provider';

export const ActiveProject = {
  Provider: ActiveProjectProvider,
};
