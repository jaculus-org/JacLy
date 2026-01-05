import { useContext } from 'react';
import {
  ActiveProjectContext,
  type ActiveProjectContextValue,
} from '@/features/project/provider/active-project-provider';

export function useActiveProject(): ActiveProjectContextValue {
  const context = useContext(ActiveProjectContext);

  if (!context) {
    throw new Error(
      'useActiveProject must be used within a ProjectFsProvider. ' +
        'Make sure you are using this hook inside the project editor routes.'
    );
  }

  return context;
}
